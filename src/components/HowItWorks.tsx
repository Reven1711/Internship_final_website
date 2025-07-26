import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FileText, MessageCircle, CheckCircle2, Truck, Package, Smile, Paperclip, IndianRupee, Camera, Mic } from 'lucide-react';
import './HowItWorks.css';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPdf, setShowPdf] = useState(false);
  const containerRef = useRef(null);
  const phoneRef = useRef(null);
  const messagesRef = useRef([]);
  const timelineRef = useRef(null);
  const intervalRef = useRef(null);
  const inputRef = useRef(null);
  const chatMessagesRef = useRef(null);

  const steps = [
    {
      title: "Send Your Requirement",
      description: "Simply send your requirement on +916352615629",
      message: "Hi, I need 1000L of Acetic Acid for delivery in Mumbai",
      interval: 2000,
    },
    {
      title: "AI Processing",
      description: "Our AI analyzes your needs and finds the best suppliers",
      message: "Analyzing requirement...\nFinding verified suppliers...\nGenerating RFQs...",
      interval: 2000,
    },
    {
      title: "Supplier Matching",
      description: "We match you with verified suppliers across India",
      message: "Found 5 verified suppliers in your region\nSending RFQs...",
      interval: 2000,
    },
    {
      title: "Quote Collection",
      description: "Our agent collects competitive quotes from multiple suppliers",
      message: "Received quotes from suppliers\nGenerating comparison report...",
      interval: 2000,
    },
    {
      title: "Comparison Report",
      description: "Get a detailed PDF report with detailed insights of all quotes",
      message: "Your comparison report is ready! 📄\nTap to view the detailed PDF with supplier quotes, delivery terms, and payment options.",
      interval: 2000,
    },
    {
      title: "Negotiate Prices & Close Deal",
      description: "Negotiate product prices with our AI powered negotiation",
      message: "Do you want to negotiate the price with the seller?",
      interval: 2000,
    }
  ];

  useEffect(() => {
    // Kill any existing animations
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Initialize all messages as hidden
    messagesRef.current.forEach((message) => {
      if (message) {
        gsap.set(message, { opacity: 0, y: 20, scale: 0.9 });
      }
    });

    // Create main timeline
    timelineRef.current = gsap.timeline({ repeat: -1, repeatDelay: 1 });

    // Container and phone initial animation
    gsap.set(containerRef.current, { opacity: 0, y: 30 });
    gsap.set(phoneRef.current, { opacity: 0, scale: 0.8 });

    gsap.to(containerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out"
    });

    gsap.to(phoneRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      delay: 0.2,
      ease: "back.out(1.7)",
      onComplete: startMessageAnimation
    });

    function startMessageAnimation() {
      // First show messages 0-3 in sequence
      for (let i = 0; i < 4; i++) {
        const message = messagesRef.current[i];
        if (message) {
          timelineRef.current
            .to(message, {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              ease: "back.out(1.7)",
              onStart: () => {
                setActiveStep(i);
                scrollToBottom();
              }
            })
            .to({}, { duration: steps[i].interval / 1000 });
        }
      }

      // Show comparison report message (step 4)
      const comparisonMessage = messagesRef.current[4];
      if (comparisonMessage) {
        timelineRef.current
          .to(comparisonMessage, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
            onStart: () => {
              setActiveStep(4);
              setShowPdf(true);
              scrollToBottom();
            }
          })
          .to({}, { duration: steps[4].interval / 1000 });
      }

      // Show PDF after comparison report message
      const pdfElement = messagesRef.current[4.5];
      if (pdfElement) {
        timelineRef.current
          .to(pdfElement, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
            delay: 0.5, // Small delay after comparison message
            onStart: () => {
              scrollToBottom();
            }
          })
          .to({}, { duration: 1 }); // Wait a bit for PDF to be visible
      }

      // Show negotiation message (step 5) after PDF
      const negotiationMessage = messagesRef.current[5];
      if (negotiationMessage) {
        timelineRef.current
          .to(negotiationMessage, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
            onStart: () => {
              setActiveStep(5);
              scrollToBottom();
            }
          })
          .to({}, { duration: steps[5].interval / 1000 });
      }

      // After all messages are shown, wait for a moment
      timelineRef.current.to({}, { duration: 1.5 });

      // Then fade out all messages together
      timelineRef.current.to(messagesRef.current, {
        opacity: 0,
        y: -10,
        scale: 0.9,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setShowPdf(false);
        }
      });
    }

    // Cleanup function
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      gsap.killTweensOf(messagesRef.current);
      gsap.killTweensOf(containerRef.current);
      gsap.killTweensOf(phoneRef.current);
    };
  }, []);

  const handleStepClick = (index) => {
    // Pause the timeline and show specific step
    if (timelineRef.current) {
      timelineRef.current.pause();
    }

    // Hide all messages first
    messagesRef.current.forEach((message, i) => {
      if (message) {
        gsap.to(message, {
          opacity: i === index || (index === 4 && i === 4.5) || (index === 5 && i === 4.5) ? 1 : 0,
          y: i === index || (index === 4 && i === 4.5) || (index === 5 && i === 4.5) ? 0 : 20,
          scale: i === index || (index === 4 && i === 4.5) || (index === 5 && i === 4.5) ? 1 : 0.9,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });

    setActiveStep(index);
    setShowPdf(index === 4 || index === 5);

    // Resume timeline after 3 seconds
    setTimeout(() => {
      if (timelineRef.current) {
        timelineRef.current.play();
      }
    }, 3000);
  };

  const handleInputFocus = () => {
    gsap.to(inputRef.current, {
      y: -10,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleInputBlur = () => {
    gsap.to(inputRef.current, {
      y: 0,
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  return (
    <section className="how-it-works" ref={containerRef}>
      <div className="how-it-works-container">
        <div className="how-it-works-header">
          <h2 className="how-it-works-title">How It Works</h2>
          <p className="how-it-works-subtitle">Get competitive quotes in minutes</p>
        </div>

        <div className="how-it-works-content">
          <div className="phone-demo" ref={phoneRef}>
            <div className="phone-frame">
              <div className="phone-screen">
                <div className="chat-header">
                  <div className="chat-info">
                    <div className="chat-avatar">
                      <MessageCircle />
                    </div>
                    <span className="chat-name">Sourceasy AI</span>
                    <span className="chat-status" />
                  </div>
                </div>
                <div className="chat-messages" ref={chatMessagesRef}>
                  {steps.slice(0, 4).map((step, index) => (
                    <div
                      key={index}
                      ref={(el) => (messagesRef.current[index] = el)}
                      className={`message-bubble ${index % 2 === 0 ? 'received' : 'sent'}`}
                    >
                      <div className="message-text">{step.message}</div>
                      <div className="message-time">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  
                  {/* Comparison Report Message */}
                  <div
                    ref={(el) => (messagesRef.current[4] = el)}
                    className="message-bubble received"
                  >
                    <div className="message-text">{steps[4].message}</div>
                    <div className="message-time">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  
                  {/* PDF appears after comparison report message */}
                  {showPdf && (
                    <div 
                      ref={(el) => (messagesRef.current[4.5] = el)}
                      className="pdf-preview"
                    >
                      <div className="pdf-icon">
                        <FileText />
                      </div>
                      <div className="pdf-info">
                        <div className="pdf-name">Comparison Report.pdf</div>
                        <div className="pdf-size">2.4 MB</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Negotiation Message appears after PDF */}
                  <div
                    ref={(el) => (messagesRef.current[5] = el)}
                    className="message-bubble sent"
                  >
                    <div className="message-text">{steps[5].message}</div>
                    <div className="message-time">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="chat-input-container" ref={inputRef}>
                  <div className="chat-input-wrapper">
                    <Smile className="chat-input-icon" />
                    <input
                      type="text"
                      className="chat-input"
                      placeholder="Message"
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                    <Paperclip className="chat-input-icon" />
                    <div className="chat-input-icon">
                      <IndianRupee />
                    </div>
                    <Camera className="chat-input-icon" />
                    <button className="chat-mic-button">
                      <Mic className="chat-mic-icon" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="how-it-works-steps">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`how-it-works-step ${index === activeStep ? 'active' : ''}`}
                onClick={() => handleStepClick(index)}
              >
                <div className="step-icon">
                  {index === 0 && <MessageCircle />}
                  {index === 1 && <FileText />}
                  {index === 2 && <CheckCircle2 />}
                  {index === 3 && <Truck />}
                  {index === 4 && <Package />}
                  {index === 5 && <IndianRupee />}
                </div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
                <div className="step-status" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
