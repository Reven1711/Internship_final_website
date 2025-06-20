import React, { useState } from 'react';
import { Shield, Globe, Users, Zap, TrendingUp, Clock, Gift } from 'lucide-react';
import './About.css';

const About = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "All suppliers are GST-verified and undergo rigorous quality checks to ensure reliable partnerships."
    },
    {
      icon: TrendingUp,
      title: "Industry Expertise",
      description: "Deep understanding of chemical industry requirements, regulations, and market dynamics."
    },
    {
      icon: Users,
      title: "Community First",
      description: "Building a collaborative ecosystem where buyers and suppliers grow together."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Leveraging AI and automation to make procurement faster, smarter, and more efficient."
    }
  ];

  const stats = [
    {
      icon: Globe,
      value: "5x",
      label: "Wider Reach",
      description: "Connects with more suppliers than a typical purchase manager"
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Always Available",
      description: "Works round the clock to save your time"
    },
    {
      icon: Gift,
      value: "100%",
      label: "Free for All Users",
      description: "No hidden charges or subscription fees"
    }
  ];

  return (
    <section className="about">
      <div className="about-container">
        <div className="about-content">
          <div className="about-header">
            <h2 className="about-title">Transforming Chemical Industry Procurement</h2>
            <p className="about-subtitle">
              We're revolutionizing how businesses source chemicals through AI-powered matching and transparent pricing
            </p>
          </div>

          <div className="about-main">
            <div className="about-text">
              <h3 className="about-text-title">Your Trusted Chemical Sourcing Partner</h3>
              <div className="about-text-content">
                <p>
                  At Sourceasy by Lets Talk Business Pvt Ltd, we understand the complexities of chemical procurement. Our platform connects you with verified suppliers, 
                  ensuring quality, reliability, and competitive pricing for all your chemical needs.
                </p>
                <p>
                  With our AI-powered matching system and dedicated support team, we make chemical sourcing simple, 
                  efficient, and transparent. Whether you're looking for industrial chemicals, raw materials, or specialty compounds, 
                  we've got you covered.
                </p>
              </div>
            </div>

            <div className="about-image-container">
              <div className="about-image-wrapper" onClick={() => setModalOpen(true)} style={{cursor: 'zoom-in'}}>
                <img 
                  src="/quotation_report.jpg" 
                  alt="Sourceasy Quotation Report - AI-powered supplier comparison and analysis"
                  className="about-image"
                />
                <div className="about-image-overlay"></div>
              </div>
              {modalOpen && (
                <div className="about-image-modal" onClick={() => setModalOpen(false)}>
                  <div className="about-image-modal-content" onClick={e => e.stopPropagation()}>
                    <button className="about-image-modal-close" onClick={() => setModalOpen(false)}>&times;</button>
                    <img 
                      src="/quotation_report.jpg" 
                      alt="Sourceasy Quotation Report - AI-powered supplier comparison and analysis (enlarged)"
                      className="about-image-modal-img"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="about-values">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon-container">
                  <value.icon className="value-icon" />
                </div>
                <h4 className="value-title">{value.title}</h4>
                <p className="value-description">{value.description}</p>
              </div>
            ))}
          </div>

          <div className="about-cta">
            <h3 className="cta-title">Why Choose Sourceasy?</h3>
            <div className="cta-stats">
              {stats.map((stat, index) => (
                <div key={index} className="cta-stat-card">
                  <div className="cta-stat-icon-container">
                    <stat.icon className="cta-stat-icon" />
                  </div>
                  <div className="cta-stat-value">{stat.value}</div>
                  <p className="cta-stat-label">{stat.label}</p>
                  <p className="cta-stat-description">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
