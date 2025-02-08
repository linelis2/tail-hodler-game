import React from 'react';

const GameHeader = () => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '2rem'
        }}>
            <span role="img" aria-label="dice" style={{ 
                fontSize: '2rem',
                filter: 'drop-shadow(0 2px 4px rgba(0, 246, 255, 0.4))'
            }}>🎲</span>
            <h2 style={{
                fontSize: '1.75rem',
                color: '#00F6FF',
                margin: 0,
                fontWeight: '600',
                textShadow: '0 2px 4px rgba(0, 246, 255, 0.4)'
            }}>Tail Hodler Toss</h2>
        </div>
    );
};

export default GameHeader; 