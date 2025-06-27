import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PrivacyPolicy.css';

const PrivacyPolicy: React.FC = () => {
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
        <h1>Privacy Policy</h1>
        <div className="legal-content">
          <p><strong>Effective Date: </strong> 20/06/2025</p>
          
          <h2>1. Introduction</h2>
          <p>Welcome to Sourceasy ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.</p>

          <h2>2. Information We Collect</h2>
          <h3>2.1 Personal Information</h3>
          <p>We may collect personal information that you provide directly to us, including:</p>
          <ul>
            <li>Name and contact information (email address, phone number)</li>
            <li>Company information and business details</li>
            <li>Account credentials and profile information</li>
            <li>Communication preferences</li>
          </ul>

          <h3>2.2 Usage Information</h3>
          <p>We automatically collect certain information about your use of our platform, including:</p>
          <ul>
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent on our platform</li>
            <li>Search queries and interactions</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Process transactions and facilitate business connections</li>
            <li>Send you important updates and notifications</li>
            <li>Improve our platform and user experience</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Information Sharing and Disclosure</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
          <ul>
            <li>With your consent</li>
            <li>To comply with legal requirements</li>
            <li>To protect our rights and safety</li>
            <li>With service providers who assist in our operations</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent at any time</li>
          </ul>

          <h2>7. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences.</p>

          <h2>8. Third-Party Links</h2>
          <p>Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.</p>

          <h2>9. Children's Privacy</h2>
          <p>Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>

          <h2>10. International Data Transfers</h2>
          <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.</p>

          <h2>11. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our platform.</p>

          <h2>12. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy or our privacy practices, please contact us at:</p>
          <p>
            Email: support@gmail.com<br />
            Address: 601, Shikhar Complex, Navrangpura, Ahmedabad, Gujarat, India, 380009<br />
            Phone: +91 93275 57993
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 