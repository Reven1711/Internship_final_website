import React, { useState, useEffect } from 'react';
import { MessageCircle, Menu, X, LogIn } from 'lucide-react';
import './Header.css';
import ScrollTrigger from 'gsap/ScrollTrigger';
import gsap from 'gsap';

interface HeaderProps {
  user: any;
  onLoginClick: () => void;
  onLogout: () => void;
}

const getInitials = (name: string) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartInquiry = () => {
    window.open('https://wa.me/14155238886?text=Hello%20Sourceasy,%20I%20would%20like%20to%20make%20an%20inquiry', '_blank');
  };

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    const section = document.getElementById(sectionId);
    if (section) {
      // Get all sections
      const allSections = gsap.utils.toArray('.animate-section');
      const targetIndex = allSections.indexOf(section);
      
      // Scroll to the target section
      section.scrollIntoView({ behavior: 'smooth' });

      // Animate all sections up to and including the target
      requestAnimationFrame(() => {
        allSections.forEach((section: any, index: number) => {
          if (index <= targetIndex) {
            gsap.to(section, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              overwrite: true,
              onComplete: () => {
                // Refresh ScrollTrigger after animation completes
                ScrollTrigger.refresh(true);
              }
            });

            // Also animate any child elements that need it
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
          }
        });
      });
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogin = () => {
    setIsMobileMenuOpen(false);
    onLoginClick();
  };

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="header-content">
            {/* Logo */}
            <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <img src="/Sourceasy-logo-Superfinal001.png" alt="Sourceasy Logo" className="logo-img" />
              <h1 className="logo-text">ourceasy</h1>
            </div>

            {/* Main flex row: nav/action buttons left, user info right */}
            <div className="header-main-row">
              {/* Nav and action buttons cluster */}
              <nav className="nav nav-cluster">
                <button onClick={() => scrollToSection('about')} className="nav-button">About</button>
                <button onClick={() => scrollToSection('community')} className="nav-button">Community</button>
                <button onClick={() => scrollToSection('contact')} className="nav-button">Contact Us</button>
                <button onClick={handleStartInquiry} className="inquiry-button">
                  <MessageCircle className="inquiry-button-icon" />
                  <span>Start Inquiry</span>
                </button>
                {!user && (
                  <button onClick={onLoginClick} className="login-button">
                    <LogIn className="login-button-icon" />
                    <span>Login</span>
                  </button>
                )}
              </nav>
              {/* Divider and user info cluster only if logged in */}
              {user && <div className="header-divider" />}
              {user && (
                <div className="user-info-cluster">
                  <div className="user-info">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="user-avatar"
                        onError={e => { e.currentTarget.src = '/default-avatar.png'; }}
                      />
                    ) : (
                      <div className="user-avatar user-avatar-initials">
                        {getInitials(user.displayName)}
                      </div>
                    )}
                    <span className="user-name">{user.displayName}</span>
                    <button onClick={onLogout} className="logout-button">Logout</button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu */}
            <div className="mobile-menu">
              <button
                onClick={handleStartInquiry}
                className="mobile-inquiry-button"
              >
                <MessageCircle className="mobile-inquiry-button-icon" />
                <span className="mobile-inquiry-text">Inquiry</span>
              </button>
              <button
                onClick={toggleMobileMenu}
                className={`mobile-nav-toggle ${isMobileMenuOpen ? 'active' : ''}`}
                aria-label="Toggle menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-content">
          <button
            onClick={() => scrollToSection('about')}
            className="mobile-nav-button"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('community')}
            className="mobile-nav-button"
          >
            Community
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="mobile-nav-button"
          >
            Contact Us
          </button>
          {!user && (
            <button
              onClick={handleLogin}
              className="mobile-nav-button"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
