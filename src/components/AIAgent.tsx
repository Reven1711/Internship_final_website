import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap, Bot, Globe, Target, Users, Package, TrendingUp, Clock } from 'lucide-react';
import './AIAgent.css';
import Popup from './ui/Popup';

const AIAgent = () => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  const words = ['Smarter', 'AI Driven'];

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (displayText.length < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, 150);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 100);
      } else {
        setWordIndex((prev) => (prev + 1) % words.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, wordIndex, words]);

  const handleGetStarted = () => {
    setIsPopupOpen(true);
  };
  const handleWhatsApp = () => {
    window.open('https://wa.me/+916352615629?text=Hello%20Sourceasy,%20I%20would%20like%20to%20buy%20', '_blank');
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <>
      <section className="ai-agent">
        {/* Background elements */}
        <div className="ai-agent-bg-pattern"></div>
        <div className="ai-agent-blob ai-agent-blob-1"></div>
        <div className="ai-agent-blob ai-agent-blob-2"></div>
        <div className="ai-agent-blob ai-agent-blob-3"></div>

        <div className="ai-agent-container">
          {/* First Section - Make trade Smarter */}
          <div className="ai-agent-section trade-smarter">
            <div className="ai-agent-content">
              <div className="ai-agent-badge">
                <Bot className="badge-icon" />
                <span>India's First AI Agent for Chemical Procurement</span>
              </div>
              
              <h2 className="ai-agent-title">
                Make trade <span className="title-highlight typewriter-text">
                  {displayText}
                  <span className="typewriter-cursor">|</span>
                </span>
              </h2>
              
              <p className="ai-agent-description">
                Buyer to supplier in seconds, with your personal AI trade agent.
              </p>

              <div className="ai-agent-features">
                <div className="feature-item">
                  <Zap className="feature-icon" />
                  <span>Lightning Fast Matching</span>
                </div>
                <div className="feature-item">
                  <Globe className="feature-icon" />
                  <span>Pan-India Network</span>
                </div>
                <div className="feature-item">
                  <Target className="feature-icon" />
                  <span>Precision Sourcing</span>
                </div>
              </div>

              <button 
                onClick={handleWhatsApp}
                className="ai-agent-cta-button"
              >
                Get Started
                <ArrowRight className="cta-icon" />
              </button>
            </div>

            <div className="ai-agent-visual">
              <div className="ai-brain">
                <div className="brain-core"></div>
                <div className="brain-ring brain-ring-1"></div>
                <div className="brain-ring brain-ring-2"></div>
                <div className="brain-ring brain-ring-3"></div>
                <div className="neural-network">
                  <div className="neural-node neural-node-1"></div>
                  <div className="neural-node neural-node-2"></div>
                  <div className="neural-node neural-node-3"></div>
                  <div className="neural-node neural-node-4"></div>
                  <div className="neural-connection neural-connection-1"></div>
                  <div className="neural-connection neural-connection-2"></div>
                  <div className="neural-connection neural-connection-3"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Second Section - B2B Connections */}
          <div className="ai-agent-section b2b-connections">
            <div className="ai-agent-content">
              <h2 className="ai-agent-title-large">
                With us, B2B connections are <span className="title-highlight">effortless</span>
              </h2>
              
              <p className="ai-agent-description-large">
                Automated sourcing, smart matching, and seamless quote compilation
                all in one AI-powered platform.
              </p>

              <button 
                onClick={handleWhatsApp}
                className="ai-agent-cta-button"
              >
                Get Started
                <ArrowRight className="cta-icon" />
              </button>
            </div>

            <div className="connection-visual">
              <div className="connection-hub">
                <div className="hub-center">
                  <Bot className="hub-icon" />
                </div>
                
                {/* Main nodes */}
                <div className="connection-node connection-node-1">
                  <Users className="node-icon" />
                  <span>Buyers</span>
                </div>
                <div className="connection-node connection-node-2">
                  <Package className="node-icon" />
                  <span>Suppliers</span>
                </div>
                
                {/* Additional nodes */}
                <div className="connection-node connection-node-3">
                  <TrendingUp className="node-icon" />
                  <span>Analytics</span>
                </div>
                <div className="connection-node connection-node-4">
                  <Clock className="node-icon" />
                  <span>Real-time</span>
                </div>
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

export default AIAgent; 