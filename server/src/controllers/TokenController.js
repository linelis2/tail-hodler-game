// server/src/controllers/TokenController.js
const { Transaction } = require('@solana/web3.js');

class TokenController {
    constructor(tokenService) {
        this.tokenService = tokenService;
    }

    async getBalance(req, res) {
        try {
            const { walletAddress } = req.params;
            const balance = await this.tokenService.getTokenBalance(walletAddress);
            res.json({ balance });
        } catch (error) {
            console.error('Balance fetch error:', error);
            res.status(500).json({ error: 'Failed to fetch balance' });
        }
    }

    async createDepositTransaction(req, res) {
        try {
            const { walletAddress, amount } = req.body;
            
            if (!walletAddress || !amount || amount <= 0) {
                return res.status(400).json({ error: 'Invalid wallet address or amount' });
            }

            const transaction = await this.tokenService.createDepositTransaction(walletAddress, amount);
            const serializedTransaction = transaction.serialize({
                requireAllSignatures: false,
                verifySignatures: false
            });

            res.json({
                transaction: serializedTransaction.toString('base64'),
                message: 'Deposit transaction created successfully'
            });
        } catch (error) {
            console.error('Deposit transaction error:', error);
            res.status(500).json({ error: 'Failed to create deposit transaction' });
        }
    }

    async createWithdrawTransaction(req, res) {
        try {
            const { walletAddress, amount } = req.body;
            
            if (!walletAddress || !amount || amount <= 0) {
                return res.status(400).json({ error: 'Invalid wallet address or amount' });
            }

            // Optional: Check if user has enough balance before withdrawal
            const balance = await this.tokenService.getTokenBalance(walletAddress);
            if (balance < amount) {
                return res.status(400).json({ error: 'Insufficient balance' });
            }

            const transaction = await this.tokenService.createWithdrawTransaction(walletAddress, amount);
            const serializedTransaction = transaction.serialize({
                requireAllSignatures: false,
                verifySignatures: false
            });

            res.json({
                transaction: serializedTransaction.toString('base64'),
                message: 'Withdrawal transaction created successfully'
            });
        } catch (error) {
            console.error('Withdrawal transaction error:', error);
            res.status(500).json({ error: 'Failed to create withdrawal transaction' });
        }
    }

    async verifyTransaction(req, res) {
        try {
            const { signature } = req.body;
            
            if (!signature) {
                return res.status(400).json({ error: 'Transaction signature required' });
            }

            const transaction = await this.tokenService.verifyTransaction(signature);
            res.json({
                status: 'confirmed',
                transaction,
                message: 'Transaction verified successfully'
            });
        } catch (error) {
            console.error('Transaction verification error:', error);
            res.status(500).json({ error: 'Failed to verify transaction' });
        }
    }
}

module.exports = TokenController;