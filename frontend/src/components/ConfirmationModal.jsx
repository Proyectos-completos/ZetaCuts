import React from 'react';
import { createPortal } from 'react-dom';
import '../styles/Modal.css';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#10b981', color: 'white' };
      case 'error':
        return { backgroundColor: '#ef4444', color: 'white' };
      case 'warning':
      default:
        return { backgroundColor: '#f59e0b', color: 'white' };
    }
  };

  return createPortal(
    <div className="modal-overlay confirmation-modal-overlay" onClick={onClose}>
      <div className="modal-content confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={getTypeStyles()}>
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <p>{message}</p>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ backgroundColor: '#000', color: 'white' }}
          >
            {cancelText}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleConfirm}
            style={{ 
              backgroundColor: '#dc3545', 
              color: 'white' 
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
