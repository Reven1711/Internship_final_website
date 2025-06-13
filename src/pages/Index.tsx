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
import gsap from 'gsap';

const Index = () => {
  useGSAP();
  const [showScrollUp, setShowScrollUp] = useState(false);

  useEffect(() => {
    // Initialize animations
    const initializeAnimations = () => {
      // Force initial state
      gsap.utils.toArray('.animate-section').forEach((section: any) => {
        gsap.set(section, {
          opacity: 0,
          y: 30
        });
      });

      // Force initial animations for visible sections
      const visibleSections = gsap.utils.toArray('.animate-section').filter((section: any) => {
        const rect = section.getBoundingClientRect();
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth
        );
      });

      visibleSections.forEach((section: any) => {
        gsap.to(section, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          overwrite: true
        });

        // Animate child elements
        const childElements = section.querySelectorAll('.section-title, .animate-element');
        childElements.forEach((element: any) => {
          gsap.to(element, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            overwrite: true,
            delay: 0.2
          });
        });
      });

      ScrollTrigger.refresh(true);
    };

    // Initial setup
    initializeAnimations();

    // Handle scroll events
    const handleScroll = () => {
      setShowScrollUp(window.scrollY > 200);
      requestAnimationFrame(() => {
        ScrollTrigger.refresh(true);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => ScrollTrigger.refresh(true));
    window.addEventListener('load', initializeAnimations);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', () => ScrollTrigger.refresh(true));
      window.removeEventListener('load', initializeAnimations);
      // Cleanup ScrollTrigger instances
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  useEffect(() => {
    // Handle keyboard navigation
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
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
    });
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
