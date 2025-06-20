import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/use-mobile';
import './WhatWeBuy.css';

interface WhatWeBuyProps {
  user: any;
}

const WhatWeBuy: React.FC<WhatWeBuyProps> = ({ user }) => {
  const isMobile = useIsMobile();

  const WhatWeBuyContent = isMobile ? 'div' : motion.div;
  const whatWeBuyProps = isMobile ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 }
  };

  return (
    <WhatWeBuyContent {...whatWeBuyProps}>
      <div className="what-we-buy-container">
        <div className="what-we-buy-content">
          <h1>What We Buy</h1>
          <p>Welcome to the What We Buy page. This is where you can add your custom content about what Sourceasy buys.</p>
          <p>User: {user?.displayName || user?.email}</p>
        </div>
      </div>
    </WhatWeBuyContent>
  );
};

export default WhatWeBuy; 