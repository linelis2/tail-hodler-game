# TailHodler Game

A Solana-based token game where players can bet TAIL tokens for a chance to win the jackpot. Built with Next.js, Node.js, and Solana Web3.js.

## Features

- Real-time TAIL token balance monitoring
- Multiple bet amounts with different jackpot percentages
- Secure wallet integration with Solflare
- Admin panel for jackpot management
- Real-time game state updates
- Transaction history tracking
- Automatic 10% token burn on jackpot wins

## Tech Stack

- Frontend:
  - Next.js
  - React
  - @solana/web3.js
  - @solana/wallet-adapter
  - Tatum SDK

- Backend:
  - Node.js
  - Express
  - @solana/web3.js
  - Winston (logging)
  - Multiple RPC fallbacks

## Prerequisites

- Node.js 16+ and npm
- Solflare wallet with TAIL tokens
- Solana CLI (optional, for development)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/tail-hodler-game.git
cd tail-hodler-game
```

2. Install dependencies for both client and server:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up environment variables:

Create `.env.local` in the client directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_TATUM_API_KEY=your-tatum-api-key
```

Create `.env` in the server directory:
```env
NODE_ENV=development
PORT=3001
TATUM_API_KEY=your-tatum-api-key
TATUM_RPC_URL=https://solana-mainnet.gateway.tatum.io/
TAIL_TOKEN_ADDRESS=CrbhNV4SUon8QVgCyQg7Khgy6GgcEy8ACDjkKvPrpump
LOBBY_WALLET_ADDRESS=your-lobby-wallet-address
ADMIN_WALLET=your-admin-wallet-address
CORS_ORIGIN=http://localhost:3000
```

## Running the Application

1. Start the server:
```bash
cd server
npm run dev
```

2. In a new terminal, start the client:
```bash
cd client
npm run dev
```

3. Open http://localhost:3000 in your browser

## Deployment

### Frontend (Vercel)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy

### Backend (Railway)
1. Create a new project in Railway
2. Connect your repository
3. Set up environment variables
4. Deploy

## Security Features

- Rate limiting
- Multiple RPC fallbacks
- Secure wallet validation
- Admin controls
- Transaction verification
- Suspicious activity monitoring

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 