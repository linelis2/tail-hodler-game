// server/src/services/TokenService.js
const { PublicKey, Transaction } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } = require('@solana/spl-token');

class TokenService {
    constructor(config) {
        this.config = config;
        this.connection = config.connection;
    }

    async getTokenBalance(walletAddress) {
        try {
            const tokenAccount = await getAssociatedTokenAddress(
                this.config.TOKEN_MINT,
                new PublicKey(walletAddress)
            );

            const accountInfo = await this.connection.getAccountInfo(tokenAccount);
            if (!accountInfo) {
                return 0; // Account doesn't exist yet
            }

            const balance = await this.connection.getTokenAccountBalance(tokenAccount);
            return balance.value.uiAmount;
        } catch (error) {
            console.error('Balance fetch error:', error);
            throw new Error('Failed to fetch balance');
        }
    }

    async createDepositTransaction(walletAddress, amount) {
        try {
            const userWallet = new PublicKey(walletAddress);
            const fromTokenAccount = await getAssociatedTokenAddress(
                this.config.TOKEN_MINT,
                userWallet
            );

            const toTokenAccount = await getAssociatedTokenAddress(
                this.config.TOKEN_MINT,
                this.config.LOBBY_WALLET
            );

            // Check if lobby token account exists
            const accountInfo = await this.connection.getAccountInfo(toTokenAccount);
            let transaction = new Transaction();

            // Add create account instruction if needed
            if (!accountInfo) {
                const createAccIx = createAssociatedTokenAccountInstruction(
                    userWallet, // payer
                    toTokenAccount, // ata
                    this.config.LOBBY_WALLET, // owner
                    this.config.TOKEN_MINT // mint
                );
                transaction.add(createAccIx);
            }

            // Add transfer instruction
            const transferIx = createTransferInstruction(
                fromTokenAccount,
                toTokenAccount,
                userWallet,
                amount * (10 ** 9) // Converting to proper decimals
            );
            transaction.add(transferIx);

            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = userWallet;

            return transaction;
        } catch (error) {
            console.error('Deposit transaction creation error:', error);
            throw new Error('Failed to create deposit transaction');
        }
    }

    async createWithdrawTransaction(walletAddress, amount) {
        try {
            const userWallet = new PublicKey(walletAddress);
            const toTokenAccount = await getAssociatedTokenAddress(
                this.config.TOKEN_MINT,
                userWallet
            );

            const fromTokenAccount = await getAssociatedTokenAddress(
                this.config.TOKEN_MINT,
                this.config.LOBBY_WALLET
            );

            // Check if user token account exists
            const accountInfo = await this.connection.getAccountInfo(toTokenAccount);
            let transaction = new Transaction();

            // Add create account instruction if needed
            if (!accountInfo) {
                const createAccIx = createAssociatedTokenAccountInstruction(
                    this.config.LOBBY_WALLET, // payer
                    toTokenAccount, // ata
                    userWallet, // owner
                    this.config.TOKEN_MINT // mint
                );
                transaction.add(createAccIx);
            }

            // Add transfer instruction
            const transferIx = createTransferInstruction(
                fromTokenAccount,
                toTokenAccount,
                this.config.LOBBY_WALLET,
                amount * (10 ** 9) // Converting to proper decimals
            );
            transaction.add(transferIx);

            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = this.config.LOBBY_WALLET;

            return transaction;
        } catch (error) {
            console.error('Withdrawal transaction creation error:', error);
            throw new Error('Failed to create withdrawal transaction');
        }
    }

    async verifyTransaction(signature) {
        try {
            const status = await this.connection.confirmTransaction(signature);
            if (status.value.err) {
                throw new Error('Transaction failed');
            }
            return await this.connection.getTransaction(signature, {
                maxSupportedTransactionVersion: 0
            });
        } catch (error) {
            console.error('Transaction verification error:', error);
            throw new Error('Failed to verify transaction');
        }
    }
}

module.exports = TokenService;