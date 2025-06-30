import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/use-mobile';
import AIAgent from '../components/AIAgent';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface AIAgentPageProps {
  user: any;
  onLoginClick: () => void;
  onLogout: () => void;
}

const AIAgentPage: React.FC<AIAgentPageProps> = ({ user, onLoginClick, onLogout }) => {
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
          <AIAgent />
        </div>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default AIAgentPage; 