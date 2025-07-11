import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/use-mobile';
import Contact from '../components/Contact';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface ContactPageProps {
  user: any;
  onLoginClick: () => void;
  onLogout: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ user, onLoginClick, onLogout }) => {
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
          <Contact />
        </div>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default ContactPage; 