import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

const Navigation = () => {
    const { publicKey } = useWallet();
    const { connection } = useConnection();
    const [error, setError] = useState(null);
    const [balance, setBalance] = useState(null);
    const [solBalance, setSolBalance] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const TAIL_DECIMALS = 6;
    const DECIMAL_MULTIPLIER = Math.pow(10, TAIL_DECIMALS);
    const TAIL_TOKEN_ADDRESS = 'CrbhNV4SUon8QVgCyQg7Khgy6GgcEy8ACDjkKvPrpump';

    const getBalances = async () => {
        try {
            if (!publicKey) return;

            // Get SOL balance
            const solBalanceAmount = await connection.getBalance(publicKey);
            setSolBalance(solBalanceAmount / 1000000000);

            // Get user's TAIL balance
            const tokenMint = new PublicKey(TAIL_TOKEN_ADDRESS);
            const userTokenAccount = await getAssociatedTokenAddress(
                tokenMint,
                publicKey
            );

            try {
                const tokenAccountInfo = await connection.getTokenAccountBalance(userTokenAccount);
                setBalance(tokenAccountInfo.value.uiAmount);
                setError(null);
            } catch (e) {
                setBalance(0);
            }
        } catch (error) {
            setError('Failed to fetch balance: ' + error.message);
        }
    };

    useEffect(() => {
        getBalances();
        const interval = setInterval(getBalances, 10000);
        return () => clearInterval(interval);
    }, [publicKey, connection]);

    return (
        <header style={{
            background: '#0A0A0A',
            padding: '0.75rem 1.5rem',
            color: '#FFFFFF',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            borderBottom: '1px solid rgba(0, 246, 255, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
        }}>
            <nav style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                width: '100%'
            }}>
                {/* Brand and Stats Container */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: '#141414',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '12px',
                    height: '36px',
                    border: '1px solid rgba(0, 246, 255, 0.1)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    {/* Dice Icon */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0, 246, 255, 0.1)',
                        padding: '0.25rem',
                        borderRadius: '8px',
                        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        <span role="img" aria-label="dice" style={{ fontSize: '1.25rem' }}>🎲</span>
                    </div>

                    {/* Brand Name */}
                    <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#00F6FF',
                        letterSpacing: '0.02em',
                        textShadow: '0 2px 4px rgba(0, 246, 255, 0.4)',
                        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        TailHodler
                    </span>

                    {/* TAIL Balance */}
                    <div style={{
                        borderLeft: '1px solid rgba(0, 246, 255, 0.1)',
                        paddingLeft: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span style={{
                            background: 'rgba(255, 215, 0, 0.08)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '8px',
                            color: '#FFD700',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            border: '1px solid rgba(255, 215, 0, 0.3)',
                            textShadow: '0 2px 4px rgba(255, 215, 0, 0.4)',
                            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>
                            {balance === null ? '...' : 
                                balance.toLocaleString(undefined, {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2
                                })
                            } TAIL
                        </span>
                    </div>

                    {/* SOL Balance */}
                    <div style={{
                        borderLeft: '1px solid rgba(0, 246, 255, 0.1)',
                        paddingLeft: '1rem',
                        color: '#FFD700',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        textShadow: '0 2px 4px rgba(255, 215, 0, 0.4)',
                        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        {solBalance === null ? '...' : 
                            solBalance.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })
                        } SOL
                    </div>
                </div>

                {/* Wallet Button */}
                <div style={{
                    background: '#141414',
                    padding: '0.25rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid rgba(0, 246, 255, 0.1)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    <WalletMultiButton />
                </div>
            </nav>
        </header>
    );
};

export default Navigation; 