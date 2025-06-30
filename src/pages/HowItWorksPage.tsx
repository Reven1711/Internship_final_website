import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/use-mobile';
import HowItWorks from '../components/HowItWorks';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface HowItWorksPageProps {
  user: any;
  onLoginClick: () => void;
  onLogout: () => void;
}

const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ user, onLoginClick, onLogout }) => {
  const isMobile = useIsMobile();
  const PageWrapper = isMobile ? 'div' : motion.div;

  return (
    <PageWrapper
      {...(!isMobile && {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -30 },
        transition: { duration: 0.5 },
      })}
    >
      <Header user={user} onLoginClick={onLoginClick} onLogout={onLogout} />
      <div style={{ minHeight: 'calc(100vh - 4.5rem)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <HowItWorks />
        </div>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default HowItWorksPage; 