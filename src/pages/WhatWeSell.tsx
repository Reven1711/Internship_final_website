import React from 'react';
import { motion } from 'framer-motion';
import { useIsMobile } from '../hooks/use-mobile';
import './WhatWeSell.css';

interface WhatWeSellProps {
  user: any;
}

const WhatWeSell: React.FC<WhatWeSellProps> = ({ user }) => {
  const isMobile = useIsMobile();

  const WhatWeSellContent = isMobile ? 'div' : motion.div;
  const whatWeSellProps = isMobile ? {} : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5 }
  };

  return (
    <WhatWeSellContent {...whatWeSellProps}>
      <div className="what-we-sell-container">
        <div className="what-we-sell-content">
          <h1>What We Sell</h1>
          <p>Welcome to the What We Sell page. This is where you can add your custom content about what Sourceasy sells.</p>
          <p>User: {user?.displayName || user?.email}</p>
        </div>
      </div>
    </WhatWeSellContent>
  );
};

export default WhatWeSell; 