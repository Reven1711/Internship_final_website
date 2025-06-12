import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LoadingScreen.css';

const greetings = [
  { text: 'Hello', language: 'English' },
  { text: 'नमस्ते', language: 'Hindi' },
  { text: 'ನಮಸ್ಕಾರ', language: 'Kannada' },
  { text: 'নমস্কার', language: 'Bengali' },
  { text: 'નમસ્તે', language: 'Gujarati' },
  { text: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', language: 'Punjabi' }
];

const LoadingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % greetings.length);
    }, 1000);

    // Simulate loading time (you can replace this with actual loading logic)
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(loadingTimeout);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="loading-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="greeting-container"
          >
            <h1 className="greeting-text">{greetings[currentIndex].text}</h1>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LoadingScreen; 