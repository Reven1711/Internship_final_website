import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/use-mobile';

const NotFound = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const PageWrapper = isMobile ? 'div' : motion.div;

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageWrapper
      {...(!isMobile && {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -30 },
        transition: { duration: 0.5 },
      })}
    >
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: isMobile ? '2rem 1rem' : '3rem 4rem', borderRadius: '1.5rem', boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
          <img src="/Sourceasy-logo-Superfinal001.png" alt="Sourceasy Logo" style={{ width: isMobile ? '60px' : '80px', margin: '0 auto 1.5rem auto', display: 'block' }} />
          <h1 style={{ fontSize: isMobile ? '3rem' : '5rem', fontWeight: 900, color: '#2563eb', marginBottom: '0.5rem', letterSpacing: '-0.05em' }}>404</h1>
          <h2 style={{ fontSize: isMobile ? '1.5rem' : '2.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>Page Not Found</h2>
          <p style={{ color: '#64748b', fontSize: isMobile ? '1rem' : '1.25rem', marginBottom: '2rem' }}>
            Sorry, the page you are looking for does not exist or has been moved.<br />
            If you believe this is an error, please contact our support team.
          </p>
          <a href="/" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #3A8DCA, #174A7C)',
            color: 'white',
            padding: isMobile ? '0.75rem 2rem' : '1rem 2.5rem',
            borderRadius: '0.75rem',
            fontWeight: 600,
            fontSize: isMobile ? '1rem' : '1.15rem',
            textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(58,141,202,0.12)',
            transition: 'background 0.2s',
          }}>Go to Homepage</a>
        </div>
      </div>
    </PageWrapper>
  );
};

export default NotFound;
