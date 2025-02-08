import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { getWalletConfig, walletStyles } from '../src/lib/wallet';

// Import styles
import '../src/styles/globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';

// Create a client-side only wrapper component
const WalletConnectionProvider = ({ children }) => {
    const { network, endpoint, connectionConfig, wallets } = useMemo(() => getWalletConfig(), []);

    return (
        <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <style>{walletStyles}</style>
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
                <meta name="theme-color" content="#1e293b" />
                <meta name="description" content="TailHodler - Track your TAIL token balance in real-time" />
            </Head>
            <WalletConnectionProviderDynamic>
                <Component {...pageProps} />
            </WalletConnectionProviderDynamic>
        </>
    );
} 