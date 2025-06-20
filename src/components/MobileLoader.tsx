import React, { useEffect, useState } from 'react';
import './MobileLoader.css';

interface MobileLoaderProps {
  onLoadComplete: () => void;
}

const MobileLoader: React.FC<MobileLoaderProps> = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [animationPhase, setAnimationPhase] = useState('initial');
  const [fadeOut, setFadeOut] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    let allResourcesLoaded = false;
    
    // Preload all website content
    const preloadContent = async () => {
      try {
        // Preload images
        const imageUrls = [
          '/Sourceasy-logo-Superfinal001.png',
          '/sourceeasy-logo-final-removebg-preview.png',
          '/chemical industry trends in 2026.jpg',
          '/quotation_report.jpg',
          '/sustainable chemistry.jpg',
        ];

        const imagePromises = imageUrls.map(url => {
          return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.onload = resolve;
            img.onerror = resolve; // Continue even if image fails
            img.src = url;
          });
        });

        // Wait for all images to load
        await Promise.all(imagePromises);

        // Preload any additional resources (CSS, etc.)
        await new Promise(resolve => {
          const links = document.querySelectorAll('link[rel="stylesheet"]') as NodeListOf<HTMLLinkElement>;
          let loadedCount = 0;
          if (links.length === 0) {
            resolve(null);
            return;
          }
          links.forEach(link => {
            if (link.sheet) {
              loadedCount++;
              if (loadedCount === links.length) resolve(null);
            } else {
              link.addEventListener('load', () => {
                loadedCount++;
                if (loadedCount === links.length) resolve(null);
              });
            }
          });
        });

        setContentLoaded(true);
        allResourcesLoaded = true;
      } catch (e) {
        setContentLoaded(true);
        allResourcesLoaded = true;
      }
    };

    preloadContent();

    // Simulate progressive loading with realistic timing
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 30) return prev + 2;
        if (prev < 60) return prev + 1;
        if (prev < 90) return prev + 0.5;
        return Math.min(prev + 0.2, 100);
      });
    }, 100);

    // Phase transitions for animation
    const phaseTimeout1 = setTimeout(() => setAnimationPhase('expanding'), 800);
    const phaseTimeout2 = setTimeout(() => setAnimationPhase('pulsing'), 2000);
    const phaseTimeout3 = setTimeout(() => setAnimationPhase('completing'), 3500);

    // Complete loading only after both animation time AND content is loaded
    const checkCompletion = () => {
      if (allResourcesLoaded) {
        setProgress(100);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onLoadComplete, 600);
        }, 500);
      } else {
        // Check again in 100ms
        setTimeout(checkCompletion, 100);
      }
    };

    // Start checking for completion after minimum animation time
    const loadingTimeout = setTimeout(checkCompletion, 4000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(phaseTimeout1);
      clearTimeout(phaseTimeout2);
      clearTimeout(phaseTimeout3);
      clearTimeout(loadingTimeout);
    };
  }, [onLoadComplete]);

  return (
    <div className={`loading-screen ${animationPhase} ${fadeOut ? 'fadeOut' : ''}`}>
      <div className="bg-animation">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="chemistry-element beaker" style={{ position: 'absolute', top: '30%', left: '20%', animation: 'float 3s ease-in-out infinite' }}></div>
        <div className="chemistry-element flask" style={{ position: 'absolute', top: '50%', right: '20%', animation: 'float 3s ease-in-out infinite' }}></div>
      </div>
      
      <div className="loading-container">
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="progress-dots">
            <div className={`dot ${progress > 0 ? 'active' : ''}`}></div>
            <div className={`dot ${progress > 25 ? 'active' : ''}`}></div>
            <div className={`dot ${progress > 50 ? 'active' : ''}`}></div>
            <div className={`dot ${progress > 75 ? 'active' : ''}`}></div>
          </div>
          
          <div className="loading-text">
            {contentLoaded ? 'Loading Sourceasy...' : 'Loading Sourceasy...'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLoader;
