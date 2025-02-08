import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Layout from '../src/components/layout/Layout';
import TokenToss from '../src/components/TokenToss';

export default function Home() {
    const { publicKey } = useWallet();

    return (
        <Layout>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem'
            }}>
                {!publicKey && (
                    <div style={{
                        textAlign: 'center',
                        color: '#64748b',
                        fontSize: '1.125rem',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        maxWidth: '500px',
                        margin: '2rem auto'
                    }}>
                        Connect your wallet to play the TAIL Token Toss game!
                    </div>
                )}

                {publicKey && <TokenToss />}
            </div>
        </Layout>
    );
}