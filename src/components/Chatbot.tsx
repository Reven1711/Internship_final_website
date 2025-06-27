import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import './Chatbot.css';
import { GoogleGenerativeAI } from "@google/generative-ai";

const SOURCEASY_CONTEXT = `
You are Sourceasy's AI assistant. Here is everything you should know about Sourceasy:
- Sourceasy is an AI-powered chemical sourcing platform based in India.
- It connects buyers with verified chemical suppliers for industrial chemicals, raw materials, specialty chemicals, and laboratory reagents.
- Key features: AI-driven supplier matching, quote comparison, procurement automation, and transparent pricing.
- Sourceasy is free for buyers and suppliers during its early stage.
- Buyers can inquire and get comparative quotes from multiple suppliers, and receive a detailed comparison report.
- Suppliers can register by providing their GST number and product details, and are verified before being added to the network.
- Sourceasy does not handle payments directly; all transactions are between buyers and suppliers.
- For support, contact support@sourceasy.ai or visit https://www.sourceasy.ai
- If a user asks a question not related to Sourceasy, its services, or chemical procurement, reply: "Sorry, I can only answer questions about Sourceasy and our services."
`;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Sourceasy AI Assistant. How can I help you with your chemical procurement needs today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [useGemini, setUseGemini] = useState(false);
  const isFirstBotResponse = useRef(true);

  const quickQuestions = [
    "How does Sourceasy work?",
    "What chemicals do you cover?",
    "How much does it cost?",
    "How to register as supplier?",
    "What is the delivery timeline?"
  ];

  const botResponses = {
    "how does sourceasy work": "Sourceasy works in 5 simple steps: 1) Send your requirement on WhatsApp 2) Our AI processes your needs 3) We send RFQs to verified suppliers 4) Suppliers submit quotations 5) You get a detailed comparison report. It's that simple!",
    "what chemicals do you cover": "Currently, we focus on the chemical industry and cover a wide range of industrial chemicals, raw materials, specialty chemicals, and laboratory reagents. Our network includes suppliers for acids, bases, solvents, polymers, and more.",
    "how much does it cost": "Sourceasy is completely FREE for all users during our early stage! There are no hidden charges for buyers or suppliers. We believe in building value first.",
    "how to register as supplier": "Suppliers can register by messaging us on WhatsApp with their GST number and details of products they supply. Our team will verify your credentials and add you to our network.",
    "what is the delivery timeline": "Delivery timelines vary by supplier and product type. Our comparison reports include detailed delivery schedules from each supplier so you can choose based on your urgency.",
    "default": "That's a great question! For detailed information, I'd recommend connecting with our team on WhatsApp. They can provide specific guidance based on your needs. Would you like me to connect you?"
  };

  const generateBotResponse = (userText: string) => {
    const lowerInput = userText.toLowerCase();
    let response = botResponses.default;
    
    for (const [key, value] of Object.entries(botResponses)) {
      if (key !== 'default' && lowerInput.includes(key)) {
        response = value;
        break;
      }
    }

    return response;
  };

  const addMessage = (text: string, isBot: boolean) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      text,
      isBot,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  // Gemini API call using REST API and gemini-2.0-flash model
  const askGemini = async (userText: string) => {
    const prompt = `
You are Sourceasy's AI assistant. Here is everything you should know about Sourceasy:
- Sourceasy is an AI-powered chemical sourcing platform based in India.
- It connects buyers with verified chemical suppliers for industrial chemicals, raw materials, specialty chemicals, and laboratory reagents.
- Key features: AI-driven supplier matching, quote comparison, procurement automation, and transparent pricing.
- Sourceasy is free for buyers and suppliers during its early stage.
- Buyers can inquire and get comparative quotes from multiple suppliers, and receive a detailed comparison report.
- Suppliers can register by providing their GST number and product details, and are verified before being added to the network.
- Sourceasy does not handle payments directly; all transactions are between buyers and suppliers.
- For support, contact support@sourceasy.ai or visit https://www.sourceasy.ai
- If a user asks a question not related to Sourceasy, its services, or chemical procurement, reply: "Sorry, I can only answer questions about Sourceasy and our services."

User: ${userText}
AI:
    `;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt }
                ]
              }
            ]
          })
        }
      );
      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
      if (data.candidates && data.candidates[0]?.content?.text) {
        return data.candidates[0].content.text;
      }
      if (data.error) {
        return `Gemini error: ${data.error.message}`;
      }
      return "Sorry, I couldn't process that.";
    } catch (e) {
      return "Sorry, there was a problem connecting to our AI. Please try again later.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    addMessage(inputValue, false);
    setInputValue('');
    if (!useGemini) {
      // Hardcoded response first
      setTimeout(() => {
        const response = generateBotResponse(inputValue);
        addMessage(response, true);
        setUseGemini(true);
      }, 1000);
    } else {
      // Use Gemini for subsequent answers
      addMessage('...', true); // loading placeholder
      const geminiResponse = await askGemini(inputValue);
      setMessages(prev => prev.map(m => m.text === '...' && m.isBot ? { ...m, text: geminiResponse } : m));
    }
  };

  const handleQuickQuestion = async (question: string) => {
    addMessage(question, false);
    if (!useGemini) {
      setTimeout(() => {
        const response = generateBotResponse(question);
        addMessage(response, true);
        setUseGemini(true);
      }, 1000);
    } else {
      addMessage('...', true);
      const geminiResponse = await askGemini(question);
      setMessages(prev => prev.map(m => m.text === '...' && m.isBot ? { ...m, text: geminiResponse } : m));
    }
  };

  console.log('Gemini API Key:', import.meta.env.VITE_GEMINI_API_KEY);

  if (!isOpen) {
    return (
      <div className="chatbot-button-container">
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-button"
        >
          <MessageCircle className="chatbot-icon" />
        </button>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-card">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <div className="chatbot-avatar">
              <MessageCircle className="chatbot-avatar-icon" />
            </div>
            <div>
              <h3 className="chatbot-title">Sourceasy Assistant</h3>
              <p className="chatbot-status">Online now</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="chatbot-close-button"
          >
            <X className="chatbot-close-icon" />
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chatbot-message ${message.isBot ? 'bot' : 'user'}`}
            >
              <div className="chatbot-message-content">
                <p className="chatbot-message-text">{message.text}</p>
              </div>
            </div>
          ))}

          {/* Quick Questions - show only after initial message */}
          {messages.length === 1 && (
            <div className="chatbot-quick-questions">
              <p className="chatbot-quick-questions-title">Quick questions:</p>
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="chatbot-quick-question-button"
                >
                  {question}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="chatbot-input-container">
          <div className="chatbot-input-wrapper">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about Sourceasy..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="chatbot-input"
            />
            <button
              onClick={handleSendMessage}
              className="chatbot-send-button"
            >
              <Send className="chatbot-send-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
