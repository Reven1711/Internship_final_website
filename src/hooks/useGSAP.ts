
import { useEffect, useRef } from 'react';
import { gsapController } from '../animations/GSAPController';

export const useGSAP = () => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        gsapController.init();
        initialized.current = true;
      }, 100);

      return () => clearTimeout(timer);
    }

    return () => {
      if (initialized.current) {
        gsapController.destroy();
        initialized.current = false;
      }
    };
  }, []);

  const refresh = () => {
    gsapController.refresh();
  };

  return { refresh };
};
