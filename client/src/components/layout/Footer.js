const Footer = () => {
    return (
        <footer style={{
            background: '#1e293b',
            color: '#94a3b8',
            padding: '2rem 1rem',
            fontSize: '0.875rem'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                textAlign: 'center'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                }}>
                    <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <span style={{ fontWeight: '500', color: 'white' }}>TailHodler</span>
                </div>
                <div>
                    © {new Date().getFullYear()} TailHodler. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer; 