// server/src/index.js
const express = require('express');
const cors = require('cors');
const config = require('./config');
const securityMiddleware = require('./middleware/security');
const TokenService = require('./services/TokenService');
const TokenController = require('./controllers/TokenController');

const app = express();

// Initialize middleware
securityMiddleware(app);
app.use(cors());
app.use(express.json());

// Initialize services and controllers
const tokenService = new TokenService(config);
const tokenController = new TokenController(tokenService);

// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Token routes
app.get('/api/balance/:walletAddress', (req, res) => tokenController.getBalance(req, res));
app.post('/api/transaction/deposit', (req, res) => tokenController.createDepositTransaction(req, res));
app.post('/api/transaction/withdraw', (req, res) => tokenController.createWithdrawTransaction(req, res));
app.post('/api/transaction/verify', (req, res) => tokenController.verifyTransaction(req, res));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit the process in production
    if (config.IS_DEVELOPMENT) {
        process.exit(1);
    }
});