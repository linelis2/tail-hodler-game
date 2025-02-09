import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, PublicKey } from '@solana/web3.js';
import { useState, useEffect, useCallback } from 'react';
import { createTransferInstruction, getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { TatumSDK } from '@tatumio/tatum';
import JackpotDisplay from './game/JackpotDisplay';
import GameControls from './game/GameControls';
import GameHistory from './game/GameHistory';
import GameAnimations from './game/GameAnimations';
import GameResult from './game/GameResult';
import GameHeader from './game/GameHeader';
import AdminControls from './game/AdminControls';

// Constants
const TAIL_DECIMALS = 6;
const DECIMAL_MULTIPLIER = Math.pow(10, TAIL_DECIMALS);
const TAIL_TOKEN_ADDRESS = 'CrbhNV4SUon8QVgCyQg7Khgy6GgcEy8ACDjkKvPrpump';
const LOBBY_WALLET_ADDRESS = 'EBTvDaV5eHmrumHTMABxcWFXyri9c9VPGSaqYYfsQ64F';
const JACKPOT_PROBABILITY = 0.2; // 1/5 chance to win jackpot (for testing)

// Security Constants
const RATE_LIMIT = {
    maxPlays: 5,
    timeWindow: 60000, // 1 minute
    minBet: 100,
    maxBet: 100000
};

// Global state for pending transactions and rate limiting
const pendingTransactions = new Set();
const recentPlays = new Map(); // wallet -> [{timestamp}]
const suspiciousWallets = new Set(); // Track suspicious behavior

// Add API URL constant
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const TokenToss = () => {
    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const [balance, setBalance] = useState(0);
    const [betAmount, setBetAmount] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedBetAmount = localStorage.getItem('tailhodler_betAmount');
            return savedBetAmount ? parseInt(savedBetAmount) : 100;
        }
        return 100;
    });
    const [result, setResult] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [tatum, setTatum] = useState(null);
    const [gameHistory, setGameHistory] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedHistory = localStorage.getItem('tailhodler_gameHistory');
            return savedHistory ? JSON.parse(savedHistory) : [];
        }
        return [];
    });
    const [jackpotBalance, setJackpotBalance] = useState(null);
    const [isGamePaused, setIsGamePaused] = useState(false);
    const [cooldownTime, setCooldownTime] = useState(0);
    const [jackpotPendingInfo, setJackpotPendingInfo] = useState(null);

    // Security check functions
    const checkRateLimit = useCallback((walletAddress) => {
        const now = Date.now();
        const plays = recentPlays.get(walletAddress) || [];
        
        // Clean old entries
        const recentPlaysList = plays.filter(play => 
            now - play.timestamp < RATE_LIMIT.timeWindow
        );
        
        if (recentPlaysList.length >= RATE_LIMIT.maxPlays) {
            throw new Error('Rate limit exceeded. Please wait before playing again.');
        }
        
        recentPlaysList.push({ timestamp: now });
        recentPlays.set(walletAddress, recentPlaysList);
    }, []);

    const validatePlay = useCallback((betAmount, playerBalance) => {
        if (isGamePaused) {
            throw new Error('Game is currently paused for maintenance');
        }

        if (suspiciousWallets.has(publicKey.toString())) {
            throw new Error('Account restricted. Please contact support.');
        }

        if (betAmount < RATE_LIMIT.minBet) {
            throw new Error(`Minimum bet is ${RATE_LIMIT.minBet} TAIL`);
        }

        if (betAmount > RATE_LIMIT.maxBet) {
            throw new Error(`Maximum bet is ${RATE_LIMIT.maxBet} TAIL`);
        }

        if (betAmount > playerBalance) {
            throw new Error('Insufficient TAIL balance');
        }

        // Check for pending transactions
        if (pendingTransactions.has(publicKey.toString())) {
            throw new Error('Please wait for your previous game to complete');
        }

        // Rate limit check
        checkRateLimit(publicKey.toString());

        return true;
    }, [checkRateLimit, publicKey, isGamePaused]);

    const trackWin = useCallback(async (signature, amount, jackpotAmount) => {
        const winData = {
            date: new Date().toISOString(),
            playerAddress: publicKey.toString(),
            betAmount: amount,
            winAmount: jackpotAmount,
            signature: signature,
            status: 'pending_payout'
        };
        
        // Save pending win
        const wins = JSON.parse(localStorage.getItem('pending_wins') || '[]');
        wins.push(winData);
        localStorage.setItem('pending_wins', JSON.stringify(wins));

        // Could add webhook or other notification here
    }, [publicKey]);

    const handleGameError = useCallback(async (error, betAmount) => {
        console.error('Game Error:', error);
        
        // Track repeated errors from same wallet
        const errorCount = (parseInt(localStorage.getItem(`error_count_${publicKey}`) || '0')) + 1;
        localStorage.setItem(`error_count_${publicKey}`, errorCount);

        // If too many errors, mark wallet as suspicious
        if (errorCount > 10) {
            suspiciousWallets.add(publicKey.toString());
        }
        
        // If transaction was sent but confirmation failed
        if (error.message.includes('confirmation timeout')) {
            alert(
                'Transaction status unclear. Please check your wallet history ' +
                'before playing again. If the transaction failed, try again in a few minutes.'
            );
            return;
        }
        
        // For other errors
        alert(
            'Error playing game. Please try again. If the problem persists, ' +
            'contact support with this error ID: ' + Date.now()
        );
    }, [publicKey]);

    // Initialize Tatum SDK
    useEffect(() => {
        const initTatum = async () => {
            const tatumInstance = await TatumSDK.init({
                network: 'solana-mainnet',
                apiKey: 't-661060efe32260001c2ac47c-afb1cd5c90d74a28817facba',
                config: { retryCount: 3, retryDelay: 1000 }
            });
            setTatum(tatumInstance);
        };
        initTatum();
        return () => {
            if (tatum) tatum.destroy();
        };
    }, []);

    // Save state to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('tailhodler_betAmount', betAmount.toString());
            localStorage.setItem('tailhodler_gameHistory', JSON.stringify(gameHistory));
        }
    }, [betAmount, gameHistory]);

    const getTokenBalance = async () => {
        if (!publicKey || !tatum) return;

        try {
            const tokenMint = new PublicKey(TAIL_TOKEN_ADDRESS);
            const tokenAccount = await getAssociatedTokenAddress(tokenMint, publicKey);
            const lobbyTokenAccount = await getAssociatedTokenAddress(
                tokenMint,
                new PublicKey(LOBBY_WALLET_ADDRESS)
            );

            try {
                const jackpotAccountInfo = await getAccount(connection, lobbyTokenAccount);
                setJackpotBalance(Number(jackpotAccountInfo.amount) / DECIMAL_MULTIPLIER);
            } catch (e) {
                console.error('Error getting jackpot balance:', e);
                setJackpotBalance(0);
            }

            try {
                const accountInfo = await getAccount(connection, tokenAccount);
                setBalance(Number(accountInfo.amount) / DECIMAL_MULTIPLIER);
            } catch (e) {
                console.error('Error getting token balance:', e);
                setBalance(0);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        if (publicKey && tatum) {
            getTokenBalance();
            const interval = setInterval(getTokenBalance, 10000);
            return () => clearInterval(interval);
        }
    }, [publicKey, tatum]);

    const addToHistory = (signature, outcome, amount) => {
        const newEntry = {
            signature,
            outcome,
            amount,
            timestamp: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            isJackpot: outcome === 'jackpot',
            winAmount: outcome === 'jackpot' ? jackpotBalance * getJackpotPercentage(amount) : 0
        };
        setGameHistory(prev => [newEntry, ...prev].slice(0, 10));
        localStorage.setItem('tailhodler_gameHistory', JSON.stringify([newEntry, ...gameHistory].slice(0, 10)));
    };

    const getJackpotPercentage = (amount) => {
        switch (amount) {
            case 100: return 0.1;
            case 1000: return 0.3;
            case 10000: return 0.6;
            case 100000: return 1.0;
            default: return 0;
        }
    };

    const playGame = async () => {
        try {
            // Validate play before processing
            validatePlay(betAmount, balance);

            setIsProcessing(true);
            
            // First, validate with server
            const validateResponse = await fetch(`${API_URL}/play/validate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wallet: publicKey.toString(),
                    betAmount
                })
            });

            if (!validateResponse.ok) {
                const error = await validateResponse.json();
                if (error.isPendingJackpot) {
                    setJackpotPendingInfo({
                        winner: error.winner,
                        amount: error.amount,
                        timestamp: error.timestamp
                    });
                    throw new Error('🎉 Jackpot verification in progress! Game paused while processing the last big win! 🎉');
                }
                throw new Error(error.error || 'Failed to validate play');
            }

            const { outcome, timestamp } = await validateResponse.json();

            // Process transaction
            try {
                const tokenMint = new PublicKey(TAIL_TOKEN_ADDRESS);
                const userTokenAccount = await getAssociatedTokenAddress(tokenMint, publicKey);
                const lobbyTokenAccount = await getAssociatedTokenAddress(
                    tokenMint,
                    new PublicKey(LOBBY_WALLET_ADDRESS)
                );

                const transferInstruction = createTransferInstruction(
                    userTokenAccount,
                    lobbyTokenAccount,
                    publicKey,
                    BigInt(Math.floor(betAmount * DECIMAL_MULTIPLIER))
                );

                const transaction = new Transaction().add(transferInstruction);
                const { blockhash } = await connection.getLatestBlockhash('confirmed');
                transaction.recentBlockhash = blockhash;
                transaction.feePayer = publicKey;

                const signature = await sendTransaction(transaction, connection);
                console.log('Transaction sent:', signature);

                let confirmed = false;
                let retries = 30;

                while (!confirmed && retries > 0) {
                    try {
                        const response = await connection.getSignatureStatus(signature);
                        if (response?.value?.confirmationStatus === 'confirmed') {
                            confirmed = true;
                            break;
                        }
                    } catch (e) {
                        console.warn('Error checking signature status:', e);
                    }
                    retries--;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }

                if (!confirmed) {
                    throw new Error('Transaction confirmation timeout');
                }

                // Confirm result with server
                const confirmResponse = await fetch(`${API_URL}/play/confirm`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        wallet: publicKey.toString(),
                        signature,
                        outcome,
                        betAmount,
                        timestamp
                    })
                });

                if (!confirmResponse.ok) {
                    throw new Error('Failed to confirm play result');
                }
                
                if (outcome === 'jackpot') {
                    const winAmount = jackpotBalance * getJackpotPercentage(betAmount);
                    await trackWin(signature, betAmount, winAmount);
                }

                setResult(outcome);
                addToHistory(signature, outcome, betAmount);
                await getTokenBalance();
                
            } catch (txError) {
                console.error('Transaction error:', txError);
                throw new Error(`Transaction failed: ${txError.message}`);
            }

        } catch (error) {
            console.error('Game error:', error);
            
            // Format user-friendly error message
            let userMessage = 'An error occurred while playing. Please try again.';
            
            if (error.message.includes('insufficient balance')) {
                userMessage = 'Insufficient TAIL balance for this bet.';
            } else if (error.message.includes('wait') && error.message.includes('seconds')) {
                // Extract wait time from error message if available
                const waitMatch = error.message.match(/wait (\d+) seconds/);
                if (waitMatch) {
                    const waitTime = parseInt(waitMatch[1]);
                    setCooldownTime(waitTime);
                    userMessage = `Please wait ${waitTime} seconds before playing again.`;
                } else {
                    setCooldownTime(5); // Default to 5 seconds if no specific time found
                    userMessage = 'Please wait 5 seconds before playing again.';
                }
            } else if (error.message.includes('confirmation timeout')) {
                userMessage = 'Transaction is taking longer than expected. Please check your wallet history before playing again.';
            } else if (error.message.includes('Active game in progress')) {
                userMessage = 'You have an active game in progress. Please wait for it to complete.';
            }
            
            alert(userMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClearHistory = () => {
        setGameHistory([]);
        localStorage.removeItem('tailhodler_gameHistory');
    };

    // Add useEffect for cooldown timer
    useEffect(() => {
        let timer;
        if (cooldownTime > 0) {
            timer = setInterval(() => {
                setCooldownTime(prev => Math.max(0, prev - 1));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldownTime]);

    return (
        <div style={{
            background: '#141414',
            borderRadius: '16px',
            padding: '1rem',
            maxWidth: '100%',
            width: '100%',
            margin: '0 auto',
            color: '#FFFFFF',
            border: '1px solid rgba(0, 246, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            boxSizing: 'border-box',
            '@media (min-width: 480px)': {
                padding: '2rem',
                maxWidth: '480px',
            }
        }}>
            <AdminControls 
                publicKey={publicKey} 
                setIsGamePaused={setIsGamePaused}
            />
            
            {isGamePaused && jackpotPendingInfo && (
                <div style={{
                    background: 'linear-gradient(45deg, #FFD700 0%, #FFA500 100%)',
                    color: '#000000',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    animation: 'pulse 2s infinite',
                    border: '1px solid rgba(255, 215, 0, 0.5)',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        🎉 Jackpot Won! 🎉
                    </div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                        Game paused while verifying the last big win!
                    </div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '0.5rem' }}>
                        Please wait while we process this exciting moment!
                    </div>
                </div>
            )}

            {isGamePaused && !jackpotPendingInfo && (
                <div style={{
                    background: '#FF355D',
                    color: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    textAlign: 'center'
                }}>
                    Game is currently paused for maintenance
                </div>
            )}
            <GameAnimations />
            <GameHeader />

            <GameResult 
                result={result}
                jackpotBalance={jackpotBalance}
                getJackpotPercentage={getJackpotPercentage}
                betAmount={betAmount}
                onPlayAgain={() => setResult('')}
            />

            <JackpotDisplay jackpotBalance={jackpotBalance} />
            
            <GameControls 
                betAmount={betAmount}
                setBetAmount={setBetAmount}
                jackpotBalance={jackpotBalance}
                playGame={playGame}
                isProcessing={isProcessing}
                publicKey={publicKey}
                tatum={tatum}
                isGamePaused={isGamePaused}
                cooldownTime={cooldownTime}
            />

            <GameHistory 
                gameHistory={gameHistory}
                onClearHistory={handleClearHistory}
            />
        </div>
    );
};

export default TokenToss;