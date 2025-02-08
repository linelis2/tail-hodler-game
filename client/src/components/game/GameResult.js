import React from 'react';

const GameResult = ({ result, jackpotBalance, getJackpotPercentage, betAmount, onPlayAgain }) => {
    if (!result) return null;

    return (
        <div style={{
            textAlign: 'center',
            padding: '1.5rem',
            background: result === 'jackpot' ? 
                'radial-gradient(circle at center, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.3) 100%)' :
                'radial-gradient(circle at center, rgba(255, 53, 93, 0.15) 0%, rgba(255, 53, 93, 0.05) 100%)',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: `1px solid ${result === 'jackpot' ? 'rgba(255, 215, 0, 0.5)' : 'rgba(255, 53, 93, 0.2)'}`,
            boxShadow: `0 4px 20px ${result === 'jackpot' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 53, 93, 0.1)'}`,
            animation: 'fadeInDown 0.5s ease-out'
        }}>
            <div style={{
                fontSize: '2rem',
                marginBottom: '1rem',
                color: result === 'jackpot' ? '#FFD700' : '#FF355D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                textShadow: result === 'jackpot' ? 
                    '0 2px 8px rgba(255, 215, 0, 0.6)' :
                    '0 2px 8px rgba(255, 53, 93, 0.6)'
            }}>
                {result === 'jackpot' ? '🎰 JACKPOT!' : '💸 You lost'}
            </div>
            {result === 'jackpot' && (
                <div style={{
                    fontSize: '1.25rem',
                    marginBottom: '1rem',
                    color: '#FFD700',
                    textShadow: '0 2px 4px rgba(255, 215, 0, 0.4)'
                }}>
                    You won {(jackpotBalance * getJackpotPercentage(betAmount)).toLocaleString()} TAIL!
                </div>
            )}
            <button
                onClick={onPlayAgain}
                style={{
                    background: '#0A0A0A',
                    border: '1px solid rgba(0, 246, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '0.75rem 1.5rem',
                    color: '#00F6FF',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                    textShadow: '0 2px 4px rgba(0, 246, 255, 0.2)'
                }}
            >
                Play Again
            </button>
        </div>
    );
};

export default GameResult; 