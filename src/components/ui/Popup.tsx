import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import './Popup.css';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  showCloseButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
}

const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  title = "Coming Soon",
  message = "This feature is currently under development. Stay tuned for updates!",
  showCloseButton = true,
  buttonText = "Got it",
  onButtonClick
}) => {
  useEffect(() => {
    // Prevent scroll and overflow clipping on all relevant parents
    const parents = [
      document.body,
      document.getElementById('root'),
      ...Array.from(document.querySelectorAll('.hero, .ai-agent'))
    ];
    if (isOpen) {
      parents.forEach(el => { if (el && 'style' in el) (el as HTMLElement).style.overflow = 'unset'; });
      document.body.style.overflow = 'hidden';
    } else {
      parents.forEach(el => { if (el && 'style' in el) (el as HTMLElement).style.overflow = ''; });
      document.body.style.overflow = 'unset';
    }
    return () => {
      parents.forEach(el => { if (el && 'style' in el) (el as HTMLElement).style.overflow = ''; });
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        {showCloseButton && (
          <button className="popup-close-button" onClick={onClose}>
            <X size={20} />
          </button>
        )}
        <div className="popup-header">
          <h2 className="popup-title">{title}</h2>
        </div>
        <div className="popup-body">
          <p className="popup-message">{message}</p>
        </div>
        <div className="popup-footer">
          <button className="popup-ok-button" onClick={onButtonClick || onClose}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Popup; 