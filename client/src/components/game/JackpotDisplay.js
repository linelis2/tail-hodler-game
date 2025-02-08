import React from 'react';

const JackpotDisplay = ({ jackpotBalance }) => {
    return (
        <div style={{
            background: '#0A0A0A',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ 
                fontSize: '1rem', 
                marginBottom: '0.75rem',
                color: '#A0A0A0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                position: 'relative',
                zIndex: 1
            }}>
                <span role="img" aria-label="trophy" style={{ 
                    fontSize: '1.5rem',
                    filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.6))'
                }}>🏆</span>
                Current Jackpot
            </div>
            <div style={{ 
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#FFD700',
                position: 'relative',
                zIndex: 1,
                textShadow: '0 2px 8px rgba(255, 215, 0, 0.6)',
                background: 'linear-gradient(to bottom, #FFD700 0%, #C5A800 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'pulse 2s infinite'
            }}>{jackpotBalance === null ? '...' : 
                jackpotBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                })
            } TAIL</div>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
            }}></div>
            <div style={{
                fontSize: '0.7rem',
                color: '#A0A0A0',
                marginTop: '0.5rem',
                opacity: 0.8,
                fontStyle: 'italic',
                position: 'relative',
                zIndex: 1
            }}>
                10% of all jackpot wins are burned to strengthen TAIL's value
            </div>
        </div>
    );
};

export default JackpotDisplay; 