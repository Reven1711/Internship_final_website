import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const handlePrivacyClick = () => {
    // TODO: Implement privacy policy page navigation
    console.log('Privacy Policy clicked');
  };

  const handleTermsClick = () => {
    // TODO: Implement terms of service page navigation
    console.log('Terms of Service clicked');
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