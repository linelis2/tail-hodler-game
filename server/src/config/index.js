// server/src/config/index.js
require('dotenv').config();
const { Connection, PublicKey } = require('@solana/web3.js');
const { TatumSDK, Network, Solana } = require('@tatumio/tatum');

const environment = process.env.NODE_ENV || 'development';

const config = {
    development: {
        rpcUrl: process.env.TATUM_RPC_URL,
        apiKey: process.env.TATUM_API_KEY,
        tokenMint: process.env.TAIL_TOKEN_ADDRESS,
        lobbyWallet: process.env.LOBBY_WALLET_ADDRESS,
        clientUrl: 'http://localhost:3000'
    },
    production: {
        rpcUrl: process.env.TATUM_RPC_URL,
        apiKey: process.env.TATUM_API_KEY,
        tokenMint: process.env.TAIL_TOKEN_ADDRESS,
        lobbyWallet: process.env.LOBBY_WALLET_ADDRESS,
        clientUrl: process.env.CLIENT_URL
    }
};

const currentConfig = config[environment];

// Validate required environment variables
if (!currentConfig.rpcUrl || !currentConfig.apiKey || !currentConfig.tokenMint || !currentConfig.lobbyWallet) {
    throw new Error('Missing required environment variables');
}

// Initialize Tatum SDK
const initTatum = async () => {
    return await TatumSDK.init({
        network: Network.SOLANA,
        apiKey: currentConfig.apiKey,
    });
};

// Create connection with custom headers for Tatum
const connection = new Connection(currentConfig.rpcUrl, {
    commitment: 'confirmed',
    httpHeaders: {
        'x-api-key': currentConfig.apiKey
    }
});

module.exports = {
    PORT: process.env.PORT || 3001,
    TOKEN_MINT: new PublicKey(currentConfig.tokenMint),
    LOBBY_WALLET: new PublicKey(currentConfig.lobbyWallet),
    connection,
    initTatum,
    CLIENT_URL: currentConfig.clientUrl,
    IS_DEVELOPMENT: environment === 'development'
};