require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Connection, PublicKey } = require('@solana/web3.js');
const { getAccount, getAssociatedTokenAddress } = require('@solana/spl-token');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const winston = require('winston');

const app = express();
const port = process.env.PORT || 3001;

// Constants
const TAIL_TOKEN_ADDRESS = 'CrbhNV4SUon8QVgCyQg7Khgy6GgcEy8ACDjkKvPrpump';
const LOBBY_WALLET_ADDRESS = 'EBTvDaV5eHmrumHTMABxcWFXyri9c9VPGSaqYYfsQ64F';
const ADMIN_WALLETS = [
    LOBBY_WALLET_ADDRESS // Use the same wallet as jackpot for easier transfers
].filter(Boolean); // Remove empty values

// Game constants
const JACKPOT_ODDS = 0.2; // 1/5 chance for testing
const PLAY_COOLDOWN = 5000; // 5 seconds between plays
const MAX_PLAYS_PER_MINUTE = 60; // Allow up to 60 plays per minute

// Add to the top with other constants
const GAME_STATE = {
    isJackpotPending: false,
    lastJackpotWinner: null,
    lastJackpotAmount: null,
    isPaused: false
};

// RPC Endpoints configuration
const RPC_ENDPOINTS = [
    {
        url: 'https://solana-mainnet.rpc.tatum.io',
        priority: 1,
        headers: {
            'x-api-key': process.env.TATUM_API_KEY
        }
    },
    {
        url: 'https://api.mainnet-beta.solana.com',
        priority: 2,
    },
    {
        url: 'https://solana-api.projectserum.com',
        priority: 3,
    },
    {
        url: 'https://rpc.ankr.com/solana',
        priority: 4,
    },
    {
        url: 'https://mainnet.helius-rpc.com/?api-key=15319bf4-5b40-4958-ac8d-6313aa55eb92',
        priority: 5,
    }
];

// Function to create connection with fallback
const createConnectionWithFallback = () => {
    let currentEndpointIndex = 0;
    let connection = null;

    const tryConnect = async () => {
        while (currentEndpointIndex < RPC_ENDPOINTS.length) {
            const endpoint = RPC_ENDPOINTS[currentEndpointIndex];
            try {
                connection = new Connection(endpoint.url, {
                    commitment: 'confirmed',
                    httpHeaders: endpoint.headers || {},
                    wsEndpoint: endpoint.wsEndpoint
                });

                // Test the connection
                await connection.getSlot();
                logger.info(`Connected to RPC endpoint: ${endpoint.url}`);
                return connection;
            } catch (error) {
                logger.error(`Failed to connect to ${endpoint.url}:`, error);
                currentEndpointIndex++;
            }
        }
        throw new Error('All RPC endpoints failed');
    };

    return {
        getConnection: async () => {
            if (!connection) {
                connection = await tryConnect();
            }
            return connection;
        },
        resetConnection: async () => {
            currentEndpointIndex = 0;
            connection = null;
            return tryConnect();
        }
    };
};

const connectionManager = createConnectionWithFallback();

// Modify the existing connection usage to use the connection manager
const getConnection = async () => {
    try {
        return await connectionManager.getConnection();
    } catch (error) {
        logger.error('Failed to get connection:', error);
        throw error;
    }
};

// Add logger configuration
const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'x-admin-wallet']
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: MAX_PLAYS_PER_MINUTE,
    message: 'Too many requests, please try again later.'
});

app.use(limiter);

// In-memory storage (replace with database in production)
const activePlayers = new Map(); // wallet -> { lastPlay, playCount, totalBets }
const pendingTransactions = new Set();
const gameResults = new Map(); // signature -> { outcome, amount, timestamp }
const suspiciousWallets = new Set();

// Validation middleware
const validateWallet = (req, res, next) => {
    try {
        new PublicKey(req.body.wallet);
        next();
    } catch {
        res.status(400).json({ error: 'Invalid wallet address' });
    }
};

// Endpoints

// Request to play
app.post('/api/play/validate', validateWallet, async (req, res) => {
    const { wallet, betAmount } = req.body;

    logger.info('Received play validation request', {
        wallet,
        betAmount,
        timestamp: new Date().toISOString()
    });

    try {
        const connection = await getConnection();
        // Check if game is paused due to pending jackpot
        if (GAME_STATE.isJackpotPending) {
            logger.warn('Game paused due to pending jackpot payout');
            return res.status(403).json({ 
                error: 'Game is paused: Jackpot verification in progress',
                isPendingJackpot: true,
                winner: GAME_STATE.lastJackpotWinner,
                amount: GAME_STATE.lastJackpotAmount,
                timestamp: Date.now()
            });
        }

        // Check if wallet is suspicious
        if (suspiciousWallets.has(wallet)) {
            logger.warn('Suspicious wallet attempted to play', { wallet });
            return res.status(403).json({ error: 'Account restricted' });
        }

        // Check active games
        if (pendingTransactions.has(wallet)) {
            logger.warn('Wallet has pending transaction', { wallet });
            return res.status(429).json({ error: 'Active game in progress' });
        }

        // Rate limiting per wallet
        const player = activePlayers.get(wallet) || { 
            lastPlay: 0, 
            playCount: 0,
            totalBets: 0 
        };

        const now = Date.now();
        if (now - player.lastPlay < PLAY_COOLDOWN) {
            const waitTime = Math.ceil((PLAY_COOLDOWN - (now - player.lastPlay)) / 1000);
            logger.warn('Rate limit hit', { wallet, timeSinceLastPlay: now - player.lastPlay });
            return res.status(429).json({ 
                error: `Please wait ${waitTime} seconds before playing again`,
                waitTime 
            });
        }

        // Validate bet amount
        if (betAmount < 100 || betAmount > 100000) {
            logger.warn('Invalid bet amount', { wallet, betAmount });
            return res.status(400).json({ error: 'Invalid bet amount' });
        }

        try {
            // Check player's TAIL balance
            const tokenMint = new PublicKey(TAIL_TOKEN_ADDRESS);
            const userPubkey = new PublicKey(wallet);
            logger.debug('Checking balance', { wallet, tokenMint: tokenMint.toString() });
            
            // Get the associated token account address
            const tokenAccountAddress = await getAssociatedTokenAddress(
                tokenMint,
                userPubkey
            );
            
            logger.debug('Getting token account', { tokenAccountAddress: tokenAccountAddress.toString() });
            
            const tokenAccount = await getAccount(connection, tokenAccountAddress);
            const balance = Number(tokenAccount.amount) / Math.pow(10, 6);
            
            logger.info('Balance check', { wallet, balance, betAmount });

            if (balance < betAmount) {
                return res.status(400).json({ error: 'Insufficient balance' });
            }
        } catch (balanceError) {
            // If the error is RPC-related, try resetting the connection
            if (balanceError.message.includes('failed to get account info') || 
                balanceError.message.includes('failed to send request')) {
                logger.warn('RPC error, attempting to reset connection');
                await connectionManager.resetConnection();
                return res.status(503).json({ error: 'Service temporarily unavailable, please try again' });
            }
            
            logger.error('Balance check failed', { 
                wallet, 
                error: balanceError.message,
                stack: balanceError.stack
            });
            return res.status(500).json({ error: 'Failed to verify balance' });
        }

        // Update jackpot handling in the game result generation
        const jackpotWin = Math.random() < JACKPOT_ODDS;
        if (jackpotWin) {
            GAME_STATE.isJackpotPending = true;
            GAME_STATE.lastJackpotWinner = wallet;
            GAME_STATE.lastJackpotAmount = betAmount;
            GAME_STATE.isPaused = true;
            logger.info('Jackpot won - game paused', { 
                wallet, 
                betAmount,
                jackpotAmount: betAmount,
                timestamp: Date.now()
            });
        }

        // Store pending transaction
        pendingTransactions.add(wallet);

        // Update player stats
        player.lastPlay = now;
        player.playCount++;
        player.totalBets += betAmount;
        activePlayers.set(wallet, player);

        logger.info('Play validated successfully', {
            wallet,
            betAmount,
            outcome: jackpotWin ? 'jackpot' : 'lose',
            playerStats: player
        });

        res.json({ 
            validated: true,
            outcome: jackpotWin ? 'jackpot' : 'lose',
            timestamp: now
        });

    } catch (error) {
        logger.error('Validation error', {
            wallet,
            betAmount,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Server error',
            errorId: Date.now(),
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Confirm game result
app.post('/api/play/confirm', validateWallet, async (req, res) => {
    const { wallet, signature, outcome, betAmount } = req.body;

    try {
        // Verify transaction
        const tx = await connectionManager.getConnection().getTransaction(signature, {
            commitment: 'confirmed'
        });

        if (!tx) {
            return res.status(400).json({ error: 'Invalid transaction' });
        }

        // Store game result
        gameResults.set(signature, {
            wallet,
            outcome,
            betAmount,
            timestamp: Date.now(),
            verified: true
        });

        // Remove pending status
        pendingTransactions.delete(wallet);

        res.json({ confirmed: true });

    } catch (error) {
        console.error('Confirmation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin endpoints
app.get('/api/admin/stats', async (req, res) => {
    const adminWallet = req.headers['x-admin-wallet'];
    
    if (!ADMIN_WALLETS.includes(adminWallet)) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const stats = {
        activePlayers: activePlayers.size,
        pendingGames: pendingTransactions.size,
        totalGames: gameResults.size,
        suspiciousWallets: suspiciousWallets.size
    };

    res.json(stats);
});

// Add new endpoint to handle jackpot approval
app.post('/api/admin/approve-jackpot', async (req, res) => {
    const adminWallet = req.headers['x-admin-wallet'];
    
    if (!ADMIN_WALLETS.includes(adminWallet)) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    GAME_STATE.isJackpotPending = false;
    GAME_STATE.lastJackpotWinner = null;
    GAME_STATE.lastJackpotAmount = null;
    GAME_STATE.isPaused = false;

    res.json({ success: true, message: 'Jackpot approved and game resumed' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 