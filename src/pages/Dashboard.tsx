import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import AIAgent from '../components/AIAgent';
import HowItWorks from '../components/HowItWorks';
import Community from '../components/Community';
import About from '../components/About';
import Contact from '../components/Contact';
import Chatbot from '../components/Chatbot';
import { useGSAP } from '../hooks/useGSAP';
import { ArrowUp } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Dashboard.css';
import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/use-mobile';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const isMobile = useIsMobile();
  const { refresh } = useGSAP();

  useEffect(() => {
    if (!isMobile) {
      gsap.registerPlugin(ScrollTrigger);

      // Back to top button animation
      const backToTopBtn = document.querySelector('.back-to-top');
      if (backToTopBtn) {
        ScrollTrigger.create({
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            if (self.progress > 0.1) {
              backToTopBtn.classList.add('visible');
            } else {
              backToTopBtn.classList.remove('visible');
            }
          },
        });
      }
    }
  }, [isMobile]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const DashboardContent = isMobile ? 'div' : motion.div;
  const dashboardProps = isMobile ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 }
  };

  return (
    <DashboardContent {...dashboardProps}>
      <div className="dashboard-container">
        <Hero />
        <AIAgent />
        <HowItWorks />
        <Community />
        <About />
        <Contact />
        <Chatbot />
        
        {/* Back to top button - hidden on mobile */}
        {!isMobile && (
          <button className="back-to-top" onClick={scrollToTop}>
            <ArrowUp size={24} />
          </button>
        )}
      </div>
    </DashboardContent>
  );
};

export default Dashboard; 