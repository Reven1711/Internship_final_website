import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/use-mobile';
import './AboutPage.css';

interface AboutPageProps {
  user: any;
}

const AboutPage: React.FC<AboutPageProps> = ({ user }) => {
  const isMobile = useIsMobile();

  const AboutContent = isMobile ? 'div' : motion.div;
  const aboutProps = isMobile ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 }
  };

  return (
    <AboutContent {...aboutProps}>
      <div className="about-page-container">
        <div className="about-page-content">
          <h1>About Sourceasy</h1>
          <p>Welcome to the About page. This is where you can add your custom content about Sourceasy.</p>
          <p>User: {user?.displayName || user?.email}</p>
        </div>
      </div>
    </AboutContent>
  );
};

export default AboutPage; 