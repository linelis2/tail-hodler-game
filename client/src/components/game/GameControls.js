import React from 'react';

const GameControls = ({ 
    betAmount, 
    setBetAmount, 
    jackpotBalance, 
    playGame, 
    isProcessing, 
    publicKey, 
    tatum,
    cooldownTime 
}) => {
    const BetButton = ({ amount, icon, percentage }) => (
        <button
            onClick={() => setBetAmount(amount)}
            style={{
                background: betAmount === amount ? 
                    'radial-gradient(circle at center, rgba(0, 246, 255, 0.3) 0%, rgba(0, 102, 255, 0.3) 100%)' : 
                    '#0A0A0A',
                border: `1px solid ${betAmount === amount ? 'rgba(0, 246, 255, 0.5)' : 'rgba(0, 246, 255, 0.2)'}`,
                borderRadius: '8px',
                padding: '0.75rem 0.5rem',
                color: betAmount === amount ? '#00F6FF' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                textShadow: betAmount === amount ? '0 2px 4px rgba(0, 246, 255, 0.4)' : 'none',
                boxShadow: betAmount === amount ? '0 0 12px rgba(0, 246, 255, 0.2)' : 'none'
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: betAmount === amount ? '600' : '500',
                height: '24px'
            }}>
                <span style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    fontSize: '1.25rem',
                    lineHeight: 1
                }}>{icon}</span>
                <span style={{ lineHeight: 1 }}>{amount.toLocaleString()} TAIL</span>
            </div>
            <div style={{
                fontSize: '0.75rem',
                color: betAmount === amount ? '#00F6FF' : '#A0A0A0',
                opacity: 0.9,
                textAlign: 'center',
                lineHeight: '1.2'
            }}>
                <div>Win {percentage}% Jackpot</div>
                <div style={{ color: '#FFD700', fontWeight: '600' }}>
                    {jackpotBalance ? (jackpotBalance * (percentage / 100)).toLocaleString(undefined, {maximumFractionDigits: 0}) : '...'} TAIL
                </div>
            </div>
        </button>
    );

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '1.5rem'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.5rem'
            }}>
                <BetButton amount={100} icon="🐱" percentage={10} />
                <BetButton amount={1000} icon="🐕" percentage={30} />
                <BetButton amount={10000} icon="😺" percentage={60} />
                <BetButton amount={100000} icon="🐶" percentage={100} />
            </div>

            <button
                onClick={playGame}
                disabled={isProcessing || !publicKey || !tatum || cooldownTime > 0}
                style={{
                    background: cooldownTime > 0 ? 
                        'radial-gradient(circle at center, #666 0%, #444 100%)' :
                        'radial-gradient(circle at center, #FFD700 0%, #FFA500 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '1rem',
                    color: cooldownTime > 0 ? '#CCC' : '#0A0A0A',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    cursor: cooldownTime > 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: isProcessing || !publicKey || !tatum || cooldownTime > 0 ? '0.5' : '1',
                    width: '100%',
                    textShadow: '0 1px 0 rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 0 12px rgba(255, 215, 0, 0.4)',
                    animation: cooldownTime > 0 ? 'none' : 'jackpotGlow 2s infinite',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem'
                }}
            >
                <span style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {isProcessing ? 'Processing...' : 
                     cooldownTime > 0 ? `WAIT ${cooldownTime}s` : (
                        <>
                            🐕 TAIL VS TAIL 🐱
                        </>
                    )}
                </span>
                <span style={{
                    fontSize: '0.7rem',
                    opacity: 0.8,
                    fontWeight: '500',
                    letterSpacing: '0.02em'
                }}>
                    {cooldownTime > 0 ? 
                        'Cooldown time remaining...' : 
                        'Dog vs Cat - Who will win? 🎯'}
                </span>
            </button>
        </div>
    );
};

export default GameControls; 