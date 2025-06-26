import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import './RegistrationMessage.css';

interface RegistrationMessageProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}
const handleWhatsApp = () => {
  window.open('https://wa.me/+916352615629?text=Hello%20Sourceasy,%20I%20would%20like%20to%20register%20as%20a%20supplier', '_blank');
};
const RegistrationMessage: React.FC<RegistrationMessageProps> = ({ isOpen, onClose, email }) => {
  const handleWhatsAppRegistration = () => {
    const message = `Hello Sourceasy, I would like to register my business. My email is ${email}.`;
    const whatsappUrl = `https://wa.me/14155238886?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="registration-modal-overlay">
      <div className="registration-modal-content" onClick={e => e.stopPropagation()}>
        <div className="registration-modal-header">
          <h2 className="registration-modal-title">Business Registration Required</h2>
          <button className="registration-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="registration-modal-body">
          <div className="registration-content">
            <div className="registration-icon">
              <MessageCircle size={48} />
            </div>
            <h3 className="registration-subtitle">Email Not Registered</h3>
            <p className="registration-description">
              The email <strong>{email}</strong> is not registered in our supplier database. 
              To access Sourceasy services, please register your business with us.
            </p>
            <button 
              onClick={handleWhatsApp}
              className="registration-whatsapp-button"
            >
              <MessageCircle className="whatsapp-button-icon" />
              Register Your Business on WhatsApp
            </button>
            <p className="registration-note">
              Our team will verify your business credentials and add you to our network within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationMessage; 