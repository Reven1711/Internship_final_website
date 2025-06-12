import React from 'react';
import { MessageCircle } from 'lucide-react';
import './Header.css';

const Header = () => {
  const handleStartInquiry = () => {
    window.open('https://wa.me/14155238886?text=Hello%20Sourceasy,%20I%20would%20like%20to%20make%20an%20inquiry', '_blank');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo">
            <img src="/sourceeasy-logo-final-removebg-preview.png" alt="Sourceasy Logo" className="logo-img" />
            <h1 className="logo-text">
              <span className="logo-o">o</span>
              <span className="logo-u">u</span>
              <span className="logo-r">r</span>
              <span className="logo-c">c</span>
              <span className="logo-e">e</span>
              <span className="logo-a">a</span>
              <span className="logo-s">s</span>
              <span className="logo-y">y</span>
            </h1>
          </div>

          {/* Navigation */}
          <nav className="nav">
            <button
              onClick={() => scrollToSection('about')}
              className="nav-button"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('community')}
              className="nav-button"
            >
              Community
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="nav-button"
            >
              Contact Us
            </button>
            <button
              onClick={handleStartInquiry}
              className="inquiry-button"
            >
              <MessageCircle className="inquiry-button-icon" />
              Start Inquiry
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="mobile-menu">
            <button
              onClick={handleStartInquiry}
              className="mobile-inquiry-button"
            >
              <MessageCircle className="mobile-inquiry-button-icon" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
