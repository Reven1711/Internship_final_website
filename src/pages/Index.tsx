import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import AIAgent from '../components/AIAgent';
import HowItWorks from '../components/HowItWorks';
import Community from '../components/Community';
import About from '../components/About';
import Contact from '../components/Contact';
import Chatbot from '../components/Chatbot';
import { useGSAP } from '../hooks/useGSAP';
import { ArrowUp } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Index.css';
import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/use-mobile';

interface IndexProps {
  user: any;
  onLoginClick: () => void;
  onLogout: () => void;
}

const Index: React.FC<IndexProps> = ({ user, onLoginClick, onLogout }) => {
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const { refresh } = useGSAP();
  const isMobile = useIsMobile();

  useEffect(() => {
    console.log('Index: Components mounting...');
    const sections = document.querySelectorAll('.animate-section');
    sections.forEach(section => {
      (section as HTMLElement).style.opacity = '1';
      (section as HTMLElement).style.transform = 'translateY(0)';
    });

    const timer = setTimeout(() => {
      setComponentsLoaded(true);
      console.log('Index: Components loaded, initializing animations...');
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeydown = (e) => {
      const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
      if (keys.includes(e.key)) {
        setTimeout(() => {
          ScrollTrigger.refresh();
          ScrollTrigger.update();
        }, 50);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const handleScrollToTop = () => {
    console.log('Refreshing page'); // Debug log
    window.location.reload(); // Refresh the page
  };

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollY = window.scrollY;
      const shouldBeVisible = scrollY > 600;
      setIsVisible(shouldBeVisible);
    };

    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility();
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  useEffect(() => {
    // Cross-page section scroll support
    const sectionId = sessionStorage.getItem('scrollToSection');
    if (sectionId) {
      const scrollToSection = (retryCount = 0) => {
        const section = document.getElementById(sectionId);
        if (section) {
          // Add a small delay to ensure all components are rendered
          setTimeout(() => {
            section.scrollIntoView({ behavior: 'smooth' });
            sessionStorage.removeItem('scrollToSection');
          }, 300);
        } else if (retryCount < 10) {
          // Retry if section is not found yet
          setTimeout(() => {
            scrollToSection(retryCount + 1);
          }, 100);
        } else {
          console.warn(`Section '${sectionId}' not found after retries`);
          sessionStorage.removeItem('scrollToSection');
        }
      };
      
      scrollToSection();
    }
  }, []);

  const PageWrapper = isMobile ? 'div' : motion.div;

  return (
    <>
      <PageWrapper
        {...(!isMobile && {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -30 },
          transition: { duration: 0.5 },
        })}
        className="index-page"
      >
        <Header user={user} onLoginClick={onLoginClick} onLogout={onLogout} />
        <Hero />
        <div className="animate-section" style={{ opacity: 1, transform: 'translateY(0)' }}>
          <AIAgent />
        </div>
        <div className="animate-section" id="how-it-works" style={{ opacity: 1, transform: 'translateY(0)' }}>
          <HowItWorks />
        </div>
        <div id="community" className="animate-section" style={{ opacity: 1, transform: 'translateY(0)' }}>
          <Community />
        </div>
        <div id="about" className="animate-section" style={{ opacity: 1, transform: 'translateY(0)' }}>
          <About />
        </div>
        <div id="contact" className="animate-section" style={{ opacity: 1, transform: 'translateY(0)' }}>
          <Contact />
        </div>
      </PageWrapper>
      <Chatbot />
      
      {/* Remove the back to top button on mobile devices */}
      {!isMobile && (
        <motion.button
          className="scroll-up-btn"
          onClick={handleScrollToTop}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '2rem',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '3.5rem',
            height: '3.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 10000,
          }}
        >
          <ArrowUp size={24} />
        </motion.button>
      )}
    </>
  );
};

export default Index;