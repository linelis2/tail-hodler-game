import Navigation from './Navigation';
import Footer from './Footer';
import Head from 'next/head';

const Layout = ({ children, title = 'TailHodler - TAIL Token Balance Monitor', description = 'Track your TAIL token balance in real-time' }) => {
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/png" href="/favicon.png" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <meta name="theme-color" content="#1e293b" />
            </Head>
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'Inter, system-ui, sans-serif',
                background: '#f8fafc'
            }}>
                <Navigation />
                <main style={{
                    flex: 1,
                    maxWidth: '1200px',
                    margin: '0 auto',
                    width: '100%',
                    padding: '2rem 1rem'
                }}>
                    {children}
                </main>
                <Footer />
            </div>
        </>
    );
};

export default Layout; 