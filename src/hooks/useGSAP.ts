import { useEffect, useRef } from 'react';
import { gsapController } from '../animations/GSAPController';
import { useIsMobile } from './use-mobile';

export const useGSAP = () => {
  const initialized = useRef(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!initialized.current) {
      console.log('useGSAP: Initializing GSAP...');
      
      // Ensure only animated elements are visible
      const ensureVisibility = () => {
        const sections = document.querySelectorAll('.animate-section');
        sections.forEach(section => {
          (section as HTMLElement).style.opacity = '1';
          (section as HTMLElement).style.transform = 'translateY(0)';
          // Only force visibility for animation-related elements
          const animatedChildren = section.querySelectorAll('.section-title, .animate-element');
          animatedChildren.forEach(child => {
            (child as HTMLElement).style.opacity = '1';
            (child as HTMLElement).style.transform = 'none';
          });
        });
        console.log('useGSAP: Ensured visibility for', sections.length, 'sections');
      };

      // Immediate visibility check
      ensureVisibility();

      if (isMobile) {
        // On mobile, skip GSAP initialization and just ensure everything is visible
        initialized.current = true;
        return;
      }

      // Initialize GSAP with a very short delay
      const timer = setTimeout(() => {
        // Double-check visibility before initializing
        ensureVisibility();
        
        gsapController.init();
        initialized.current = true;
        console.log('useGSAP: GSAP initialized');
      }, 50);

      return () => clearTimeout(timer);
    }

    return () => {
      if (initialized.current && !isMobile) {
        console.log('useGSAP: Cleaning up GSAP...');
        gsapController.destroy();
        initialized.current = false;
      }
    };
  }, [isMobile]);

  const refresh = () => {
    if (initialized.current && !isMobile) {
      console.log('useGSAP: Refreshing GSAP...');
      gsapController.refresh();
    }
  };

  return { refresh };
};
