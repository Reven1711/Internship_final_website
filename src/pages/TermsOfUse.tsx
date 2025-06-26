import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TermsOfUse.css';

const TermsOfUse: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <button onClick={handleBackClick} className="back-button">
            ← Back to Home
          </button>
        </div>
        <h1>Terms of Use</h1>
        <div className="legal-content">
          <p><strong>Effective Date:</strong> 20/06/2025</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using Sourceasy ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>

          <h2>2. Description of Service</h2>
          <p>Sourceasy is a B2B platform that connects chemical suppliers and buyers. Our services include:</p>
          <ul>
            <li>Supplier and buyer matching</li>
            <li>Product catalog and search functionality</li>
            <li>Communication tools between parties</li>
            <li>Transaction facilitation</li>
            <li>Market intelligence and analytics</li>
          </ul>

          <h2>3. User Accounts</h2>
          <h3>3.1 Account Creation</h3>
          <p>To access certain features of the Platform, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.</p>

          <h3>3.2 Account Security</h3>
          <p>You are responsible for safeguarding the password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>

          <h2>4. User Conduct</h2>
          <p>You agree not to use the Platform to:</p>
          <ul>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Transmit harmful, offensive, or inappropriate content</li>
            <li>Attempt to gain unauthorized access to the Platform</li>
            <li>Interfere with the proper functioning of the Platform</li>
            <li>Engage in fraudulent or deceptive practices</li>
          </ul>

          <h2>5. Business Transactions</h2>
          <h3>5.1 Transaction Terms</h3>
          <p>All transactions conducted through the Platform are subject to separate agreements between buyers and suppliers. Sourceasy acts as a facilitator and is not a party to these transactions.</p>

          <h3>5.2 Payment and Fees</h3>
          <p>Users are responsible for all fees associated with their use of the Platform. Payment terms and conditions are subject to separate agreements.</p>

          <h2>6. Intellectual Property</h2>
          <p>The Platform and its original content, features, and functionality are owned by Sourceasy and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>

          <h2>7. Privacy Policy</h2>
          <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Platform, to understand our practices.</p>

          <h2>8. Disclaimers</h2>
          <p>The Platform is provided "as is" and "as available" without warranties of any kind. We do not guarantee the accuracy, completeness, or usefulness of any information on the Platform.</p>

          <h3>8.1 Quotation Disclaimer</h3>
          <p>This quotation has been compiled using Sourceasy's AI agent based on publicly or user-submitted data. Sourceasy is not responsible for any financial transactions between you and the supplier. Buyers are advised to independently verify the credibility of the supplier and agree on payment and credit terms before proceeding. Do not make any advance payment without conducting due diligence and appropriate background checks.</p>

          <h2>9. Limitation of Liability</h2>
          <p>In no event shall Sourceasy be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>

          <h2>10. Indemnification</h2>
          <p>You agree to defend, indemnify, and hold harmless Sourceasy from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the Platform.</p>

          <h2>11. Termination</h2>
          <p>We may terminate or suspend your account and bar access to the Platform immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.</p>

          <h2>12. Governing Law</h2>
          <p>These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>

          <h2>13. Changes to Terms</h2>
          <p>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.</p>

          <h2>14. Contact Information</h2>
          <p>If you have any questions about these Terms of Use, please contact us at:</p>
          <p>
            Email: aidhandho@gmail.com<br />
            Address: 601, Shikhar Complex, Navrangpura, Ahmedabad, Gujarat, India, 380009<br />
            Phone: +91 93275 57993
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse; 