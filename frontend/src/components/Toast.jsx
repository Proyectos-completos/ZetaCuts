import React, { useEffect } from 'react';
import '../styles/Toast.css';

const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); 

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
      <div className={`toast ${type} ${isVisible ? 'show' : ''}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {type === 'success' && <span className="material-icons" style={{ color: '#dc2626' }}>check_circle</span>}
          {type === 'error' && <span className="material-icons" style={{ color: '#dc2626' }}>error</span>}
          {type === 'warning' && <span className="material-icons" style={{ color: '#dc2626' }}>warning</span>}
          {type === 'info' && <span className="material-icons" style={{ color: '#dc2626' }}>info</span>}
        </div>
        <div className="toast-message">
          {message}
        </div>
        <button className="toast-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast; 