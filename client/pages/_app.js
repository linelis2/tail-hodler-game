import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

// Import styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Custom styles for wallet button
const customStyles = `
    .wallet-adapter-button {
        background: transparent !important;
        padding: 0.5rem 0.75rem !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        height: 36px !important;
        line-height: 1 !important;
        color: #FFFFFF !important;
        transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
        display: flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
        border-radius: 8px !important;
        border: 1px solid rgba(0, 246, 255, 0.1) !important;
    }
    .wallet-adapter-button-trigger {
        background: radial-gradient(circle at center, #00F6FF 0%, #0066FF 100%) !important;
        color: #0A0A0A !important;
        text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) !important;
        font-weight: 600 !important;
    }
    .wallet-adapter-button:hover {
        background: rgba(0, 246, 255, 0.15) !important;
        border-color: rgba(0, 246, 255, 0.3) !important;
        box-shadow: 0 0 8px rgba(0, 246, 255, 0.4) !important;
    }
    .wallet-adapter-button-trigger:hover {
        background: radial-gradient(circle at center, #00D4E6 0%, #0052CC 100%) !important;
    }
    .wallet-adapter-button:not([disabled]):hover {
        background: rgba(0, 246, 255, 0.15) !important;
    }
    .wallet-adapter-button-trigger:not([disabled]):hover {
        background: radial-gradient(circle at center, #00D4E6 0%, #0052CC 100%) !important;
    }
    .wallet-adapter-button-start-icon {
        margin: 0 !important;
        width: 16px !important;
        height: 16px !important;
    }
    .wallet-adapter-button-end-icon {
        margin-left: 4px !important;
        width: 16px !important;
        height: 16px !important;
    }
    .wallet-adapter-modal-wrapper {
        background: #0A0A0A !important;
        border: 1px solid rgba(0, 246, 255, 0.1) !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
    }
    .wallet-adapter-modal-button-close {
        background: rgba(0, 246, 255, 0.1) !important;
        color: #00F6FF !important;
        transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    .wallet-adapter-modal-button-close:hover {
        background: rgba(0, 246, 255, 0.2) !important;
        box-shadow: 0 0 8px rgba(0, 246, 255, 0.4) !important;
    }
    .wallet-adapter-modal-title {
        color: #FFFFFF !important;
    }
    .wallet-adapter-modal-list {
        margin: 0 !important;
    }
    .wallet-adapter-modal-list li {
        padding: 0.5rem !important;
    }
    .wallet-adapter-modal-list-more {
        color: #A0A0A0 !important;
        background: rgba(0, 246, 255, 0.1) !important;
        transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    .wallet-adapter-modal-list-more:hover {
        background: rgba(0, 246, 255, 0.15) !important;
        color: #FFFFFF !important;
    }
    .wallet-adapter-dropdown {
        display: flex !important;
    }
    .wallet-adapter-dropdown-list {
        border-radius: 12px !important;
        background: #0A0A0A !important;
        border: 1px solid rgba(0, 246, 255, 0.1) !important;
        margin-top: 4px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
    }
    .wallet-adapter-dropdown-list-item {
        padding: 0.5rem 0.75rem !important;
        height: 36px !important;
        font-size: 0.875rem !important;
        font-weight: 500 !important;
        color: #A0A0A0 !important;
        background: transparent !important;
        transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) !important;
        display: flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
    }
    .wallet-adapter-dropdown-list-item:hover {
        background: rgba(0, 246, 255, 0.05) !important;
        color: #FFFFFF !important;
    }

    @keyframes glow {
        0% { box-shadow: 0 0 8px rgba(0, 246, 255, 0.4); }
        50% { box-shadow: 0 0 16px rgba(0, 246, 255, 0.6); }
        100% { box-shadow: 0 0 8px rgba(0, 246, 255, 0.4); }
    }

    .wallet-adapter-button-trigger {
        animation: glow 2s infinite;
    }
`;

// Create a client-side only wrapper component
const WalletConnectionProvider = ({ children }) => {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = 'https://solana-mainnet.rpc.tatum.io';
    
    // Initialize wallets that should be supported
    const wallets = useMemo(
        () => [
            new SolflareWalletAdapter({ network }),
        ],
        [network]
    );

    const connectionConfig = {
        commitment: 'confirmed',
        httpHeaders: {
            'x-api-key': 't-661060efe32260001c2ac47c-afb1cd5c90d74a28817facba'
        },
        wsEndpoint: 'wss://solana-mainnet.rpc.tatum.io/ws'
    };

    return (
        <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <style>{customStyles}</style>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

// Create a dynamic import of the wallet connection provider
const WalletConnectionProviderDynamic = dynamic(
    () => Promise.resolve(WalletConnectionProvider),
    {
        ssr: false
    }
);

// Default App component
export default function App({ Component, pageProps }) {
    return (
        <>
            <Head>
                <title>TailHodler - TAIL Token Balance Monitor</title>
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/png" href="/favicon.png" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <meta name="theme-color" content="#1a1b23" />
                <meta name="description" content="TailHodler - Track your TAIL token balance in real-time" />
            </Head>
            <WalletConnectionProviderDynamic>
                <Component {...pageProps} />
            </WalletConnectionProviderDynamic>
        </>
    );
} 