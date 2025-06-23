import React, { useState } from 'react';
import { MessageCircle, Play } from 'lucide-react';
import './Hero.css';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Popup from './ui/Popup';

const Hero = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleStartInquiry = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleWatchDemo = () => {
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    }
  };

  return (
    <>
      <section className="hero">
        {/* Subtle background elements */}
        <div className="hero-blob hero-blob-1"></div>
        <div className="hero-blob hero-blob-2"></div>

        <div className="hero-container">
          <div className="hero-content">
            {/* Main Content */}
            <div className="hero-content-main">
              <h1 className="hero-title">
                Transform Your
                <span className="hero-title-gradient">
                  Chemical Sourcing
                </span>
              </h1>
              
              <p className="hero-description">
                Connect with 5000+ verified suppliers instantly. Get competitive quotations and close deals faster than ever.
              </p>
              
              {/* CTA Buttons */}
              <div className="hero-buttons">
                <button 
                  onClick={handleStartInquiry}
                  className="hero-button-primary"
                >
                  <MessageCircle className="button-icon button-icon-primary" />
                  Start Your Inquiry
                </button>
                
                <button 
                  className="hero-button-secondary"
                  onClick={handleWatchDemo}
                >
                  <Play className="button-icon button-icon-secondary" />
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Simple Stats */}
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value">5000+</div>
                <div className="stat-label">Verified Suppliers</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">4hrs</div>
                <div className="stat-label">Response Time</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">100%</div>
                <div className="stat-label">Free Platform</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">98%</div>
                <div className="stat-label">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Popup */}
      <Popup
        isOpen={isPopupOpen}
        onClose={closePopup}
        title="Coming Soon"
        message="Our inquiry system is in the works! We're building something great to enhance your experience. Stay tuned for exciting updates."
      />
    </>
  );
};

export default Hero;
