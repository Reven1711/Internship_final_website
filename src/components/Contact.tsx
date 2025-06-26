import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, MapPin, Instagram, Linkedin, Facebook } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      console.log('Submitting form data:', formData);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          to: 'aidhandho@gmail.com'
        }),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setSubmitStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        message: ''
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/+916352615629?text=Hello%20Sourceasy,%20I%20have%20a%20question', '_blank');
  };

  const handleSocialClick = (platform: string) => {
    const socialLinks = {
      instagram: 'https://www.instagram.com/sourceasy.ai/',
      linkedin: 'https://www.linkedin.com/company/sourceasy-ai/about/',
      facebook: 'https://www.facebook.com/profile.php?id=61577930453465&sk=about'
    };
    window.open(socialLinks[platform as keyof typeof socialLinks], '_blank');
  };

  return (
    <section className="contact">
      <div className="contact-container">
        <div className="contact-content">
          <div className="contact-header">
            <h2 className="contact-title">Get in Touch</h2>
            <p className="contact-subtitle">
              Have questions about Sourceasy? We're here to help you streamline your chemical procurement process
            </p>
          </div>

          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-card">
              <h3 className="contact-form-title">Send us a Message</h3>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      First Name
                    </label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="form-input" 
                      placeholder="Jay" 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Last Name
                    </label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="form-input" 
                      placeholder="Sharma" 
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Email
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="jay@company.com" 
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Company
                  </label>
                  <input 
                    type="text" 
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Your Company Name" 
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Message
                  </label>
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Tell us about your procurement needs or any questions you have..."
                    rows={4}
                    required
                  />
                </div>
                
                {submitStatus === 'success' && (
                  <div className="form-success">
                    Thank you for your message! We'll get back to you soon.
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="form-error">
                    Sorry, there was an error sending your message. Please try again.
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>

              {/* Social Media Section */}
              <div className="social-media-card">
                <h4 className="social-title">Follow Us</h4>
                <p className="social-description">
                  Stay connected with us on social media for updates and industry insights
                </p>
                <div className="social-links">
                  <button 
                    onClick={() => handleSocialClick('instagram')}
                    className="social-button"
                    aria-label="Follow us on Instagram"
                  >
                    <Instagram className="social-icon" />
                    <span>Instagram</span>
                  </button>
                  <button 
                    onClick={() => handleSocialClick('linkedin')}
                    className="social-button"
                    aria-label="Follow us on LinkedIn"
                  >
                    <Linkedin className="social-icon" />
                    <span>LinkedIn</span>
                  </button>
                  <button 
                    onClick={() => handleSocialClick('facebook')}
                    className="social-button"
                    aria-label="Follow us on Facebook"
                  >
                    <Facebook className="social-icon" />
                    <span>Facebook</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="contact-info">
              <div className="info-card">
                <h3 className="info-card-title">Contact Information</h3>
                <div className="info-list">
                  <div className="info-item">
                    <div className="info-icon-container">
                      <MessageCircle className="info-icon" />
                    </div>
                    <div className="info-content">
                      <p className="info-label">Trade Enquiry</p>
                      <p className="info-value">+91 635 2615629</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon-container">
                      <Mail className="info-icon" />
                    </div>
                    <div className="info-content">
                      <p className="info-label">Email</p>
                      <p className="info-value">aidhandho@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon-container">
                      <Phone className="info-icon" />
                    </div>
                    <div className="info-content">
                      <p className="info-label">Customer Support</p>
                      <p className="info-value">+91 93275 57993</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-icon-container">
                      <MapPin className="info-icon" />
                    </div>
                    <div className="info-content">
                      <p className="info-label">Address</p>
                      <p className="info-value">601, Shikhar Complex, Navrangpura, Ahmedabad, Gujarat, India, 380009</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="whatsapp-card">
                <h3 className="whatsapp-title">Quick Start on WhatsApp</h3>
                <p className="whatsapp-description">
                  Ready to get started? Send us your first procurement requirement directly on WhatsApp and experience the Sourceasy difference.
                </p>
                <button 
                  onClick={handleWhatsApp}
                  className="whatsapp-button"
                >
                  <MessageCircle className="whatsapp-button-icon" />
                  Start on WhatsApp
                </button>
              </div>

              <div className="supplier-card">
                <h3 className="supplier-title">For Suppliers</h3>
                <p className="supplier-description">
                  Want to join our supplier network? Register your chemical business and start receiving qualified leads.
                </p>
                <button className="supplier-button" onClick={handleWhatsApp}>
                  Register as Supplier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
