import React from 'react';

const GameHistory = ({ gameHistory, onClearHistory }) => {
    if (gameHistory.length === 0) return null;

    return (
        <div style={{
            background: '#0A0A0A',
            padding: '1.5rem',
            borderRadius: '12px',
            marginTop: '1.5rem',
            border: '1px solid rgba(0, 246, 255, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
            <h3 style={{
                fontSize: '1.125rem',
                marginBottom: '1rem',
                color: '#00F6FF',
                fontWeight: '600',
                margin: '0 0 1rem 0',
                textShadow: '0 2px 4px rgba(0, 246, 255, 0.4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>Recent Games</span>
                <button
                    onClick={onClearHistory}
                    style={{
                        background: 'rgba(255, 53, 93, 0.1)',
                        border: '1px solid rgba(255, 53, 93, 0.2)',
                        borderRadius: '6px',
                        padding: '0.25rem 0.5rem',
                        color: '#FF355D',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    Clear History
                </button>
            </h3>
            {gameHistory.map((game, index) => (
                <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: index % 2 === 0 ? '#141414' : '#1A1A1A',
                    marginBottom: index < gameHistory.length - 1 ? '0.5rem' : 0,
                    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                    }}>
                        <span style={{
                            color: game.outcome === 'win' ? '#00F6FF' : '#FF355D',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            textShadow: game.outcome === 'win' ? 
                                '0 2px 4px rgba(0, 246, 255, 0.4)' : 
                                '0 2px 4px rgba(255, 53, 93, 0.4)'
                        }}>
                            {game.outcome === 'win' ? '🎉' : '💸'} 
                            <span>{game.amount.toLocaleString()} TAIL</span>
                        </span>
                        <span style={{
                            fontSize: '0.75rem',
                            color: '#A0A0A0'
                        }}>
                            {game.date} {game.timestamp}
                        </span>
                    </div>
                    <a
                        href={`https://solscan.io/tx/${game.signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: '#00F6FF',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                            textShadow: '0 2px 4px rgba(0, 246, 255, 0.2)'
                        }}
                    >
                        View Transaction
                        <span style={{ fontSize: '1rem' }}>↗</span>
                    </a>
                </div>
            ))}
        </div>
    );
};

export default GameHistory; 