import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handlePrivacyClick = () => {
    navigate('/privacy-policy');
    window.scrollTo(0, 0);
  };

  const handleTermsClick = () => {
    navigate('/terms-of-use');
    window.scrollTo(0, 0);
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-copyright">
            <p>Copyright © 2022. Lets Talk Business Pvt. Ltd. All rights reserved.</p>
          </div>
          <div className="footer-links">
            <button onClick={handlePrivacyClick} className="footer-link">
              Privacy Policy
            </button>
            <span className="footer-divider">•</span>
            <button onClick={handleTermsClick} className="footer-link">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 