import React from 'react';
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
import { useState, useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Index.css';

const Index = () => {
  useGSAP();
  const [showScrollUp, setShowScrollUp] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollUp(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const keys = [
        'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ' // space
      ];
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="index-page">
        <Header />
        <Hero />
        <div className="animate-section">
          <AIAgent />
        </div>
        <div className="animate-section" id="how-it-works">
          <HowItWorks />
        </div>
        <div id="community" className="animate-section">
          <Community />
        </div>
        <div id="about" className="animate-section">
          <About />
        </div>
        <div id="contact" className="animate-section">
          <Contact />
        </div>
      </div>
      <Chatbot />
      {showScrollUp && (
        <div className="scroll-up-btn-container">
          <button
            className="scroll-up-btn"
            onClick={handleScrollToTop}
            aria-label="Scroll to top"
          >
            <ArrowUp size={28} />
          </button>
        </div>
      )}
    </>
  );
};

export default Index;
