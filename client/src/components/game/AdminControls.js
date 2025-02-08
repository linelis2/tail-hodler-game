import React, { useState, useEffect } from 'react';

const ADMIN_WALLETS = [
    'EBTvDaV5eHmrumHTMABxcWFXyri9c9VPGSaqYYfsQ64F'  // Same as jackpot wallet for easier transfers
];

const AdminControls = ({ publicKey, setIsGamePaused }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [pendingWins, setPendingWins] = useState([]);
    const [isJackpotPending, setIsJackpotPending] = useState(false);
    const [copiedStates, setCopiedStates] = useState({});

    const handleCopy = async (text, id) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedStates(prev => ({ ...prev, [id]: true }));
            setTimeout(() => {
                setCopiedStates(prev => ({ ...prev, [id]: false }));
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    useEffect(() => {
        if (publicKey) {
            const isAdminWallet = ADMIN_WALLETS.includes(publicKey.toString());
            console.log('Admin check:', { 
                wallet: publicKey.toString(), 
                isAdmin: isAdminWallet,
                adminWallets: ADMIN_WALLETS 
            });
            setIsAdmin(isAdminWallet);
            
            if (isAdminWallet) {
                // Load pending wins
                const wins = JSON.parse(localStorage.getItem('pending_wins') || '[]');
                setPendingWins(wins);
            }
        } else {
            setIsAdmin(false);
        }
    }, [publicKey]);

    const handlePayout = async (winData) => {
        try {
            // Call the approve-jackpot endpoint
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/approve-jackpot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-wallet': publicKey.toString()
                }
            });

            if (!response.ok) {
                throw new Error('Failed to approve jackpot');
            }

            // Remove from pending wins
            const updatedWins = pendingWins.filter(w => w.signature !== winData.signature);
            setPendingWins(updatedWins);
            localStorage.setItem('pending_wins', JSON.stringify(updatedWins));
            
            // Mark as paid in history
            const history = JSON.parse(localStorage.getItem('tailhodler_gameHistory') || '[]');
            const updatedHistory = history.map(game => {
                if (game.signature === winData.signature) {
                    return { ...game, paid: true };
                }
                return game;
            });
            localStorage.setItem('tailhodler_gameHistory', JSON.stringify(updatedHistory));

            // Update game state
            setIsJackpotPending(false);
            setIsGamePaused(false);

            alert('Jackpot approved and game resumed!');
        } catch (error) {
            console.error('Error approving jackpot:', error);
            alert('Failed to approve jackpot. Please try again.');
        }
    };

    if (!isAdmin) return null;

    return (
        <div style={{
            background: '#141414',
            border: '1px solid #FF355D',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem'
        }}>
            <h2 style={{
                color: '#FF355D',
                fontSize: '1.25rem',
                marginBottom: '1rem',
                fontWeight: '600'
            }}>Admin Controls</h2>

            <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1.25rem'
            }}>
                <button
                    onClick={() => setIsGamePaused(true)}
                    style={{
                        background: '#FF355D',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                    }}
                >
                    Emergency Pause
                </button>
                <button
                    onClick={() => setIsGamePaused(false)}
                    style={{
                        background: '#1B4D1F',
                        color: '#4ADE80',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        opacity: isJackpotPending ? '0.5' : '1'
                    }}
                    disabled={isJackpotPending}
                >
                    Resume Game
                </button>
            </div>

            <h3 style={{
                color: '#FFD700',
                fontSize: '0.875rem',
                marginBottom: '0.75rem',
                fontWeight: '600'
            }}>
                Pending Payouts ({pendingWins.length})
            </h3>

            {pendingWins.map((win, index) => (
                <div
                    key={index}
                    style={{
                        background: '#0A0A0A',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '0.5rem',
                        border: '1px solid rgba(255, 215, 0, 0.2)'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem'
                    }}>
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem'
                            }}>
                                <span style={{
                                    color: '#FFD700',
                                    fontSize: '1.125rem',
                                    fontWeight: '600'
                                }}>
                                    Full Amount: {win.winAmount.toLocaleString()} TAIL
                                </span>
                                <button
                                    onClick={() => handleCopy(win.winAmount.toString(), `full-${index}`)}
                                    style={{
                                        background: '#2A2A2A',
                                        color: copiedStates[`full-${index}`] ? '#4ADE80' : '#888',
                                        border: 'none',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    {copiedStates[`full-${index}`] ? '✓' : '📋'}
                                </button>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <span style={{
                                    color: '#4ADE80',
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                }}>
                                    Transfer Amount (90%): {(win.winAmount * 0.9).toLocaleString()} TAIL
                                </span>
                                <button
                                    onClick={() => handleCopy((win.winAmount * 0.9).toString(), `transfer-${index}`)}
                                    style={{
                                        background: '#2A2A2A',
                                        color: copiedStates[`transfer-${index}`] ? '#4ADE80' : '#888',
                                        border: 'none',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    {copiedStates[`transfer-${index}`] ? '✓' : '📋'}
                                </button>
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem'
                        }}>
                            <a
                                href={`https://solscan.io/tx/${win.signature}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    background: 'rgba(0, 246, 255, 0.1)',
                                    color: '#00F6FF',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                Verify
                            </a>
                            <button
                                onClick={() => handlePayout(win)}
                                style={{
                                    background: '#1B4D1F',
                                    color: '#4ADE80',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: '500'
                                }}
                            >
                                Approve & Resume
                            </button>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        paddingTop: '0.75rem'
                    }}>
                        <span style={{
                            color: '#00F6FF',
                            fontSize: '0.75rem'
                        }}>
                            To:
                        </span>
                        <span style={{
                            color: '#888',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace'
                        }}>
                            {win.playerAddress}
                        </span>
                        <button
                            onClick={() => handleCopy(win.playerAddress, `address-${index}`)}
                            style={{
                                background: '#2A2A2A',
                                color: copiedStates[`address-${index}`] ? '#4ADE80' : '#888',
                                border: 'none',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                marginLeft: 'auto'
                            }}
                        >
                            {copiedStates[`address-${index}`] ? '✓' : '📋'}
                        </button>
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#666',
                        marginTop: '0.5rem'
                    }}>
                        {new Date(win.date).toLocaleString()}
                    </div>
                </div>
            ))}
            {pendingWins.length === 0 && (
                <div style={{
                    color: '#666',
                    textAlign: 'center',
                    padding: '1rem',
                    fontSize: '0.875rem'
                }}>
                    No pending payouts
                </div>
            )}
        </div>
    );
};

export default AdminControls; 