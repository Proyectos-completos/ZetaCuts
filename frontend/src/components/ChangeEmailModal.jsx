import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { userService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Modal.css';

const ChangeEmailModal = ({ isOpen, onClose, showToast }) => {
  const { user, refreshUserData } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        password: ''
      });
      setError('');

const scrollY = window.scrollY;

document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await userService.updateEmail(formData);

      if (result.success) {
        
        await refreshUserData();
        
        await new Promise(resolve => setTimeout(resolve, 100));
        setFormData({ email: '', password: '' });
        onClose();
        if (showToast) {
          showToast('Email actualizado exitosamente', 'success');
        }
      } else {
        setError(result.message || 'Error al actualizar el email');
      }
    } catch (err) {
      console.error('Error updating email:', err);
      setError(err.response?.data?.message || 'Error al actualizar el email');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', password: '' });
    setError('');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const modalContent = (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Cambiar Email</h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                Email actual: <span style={{ color: '#6c757d', fontWeight: '400' }}>{user?.email}</span>
              </label>
            </div>
            <input
              type="email"
              name="email"
              placeholder="Nuevo email (ejemplo@gmail.com)"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />

            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Confirma tu contraseña"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                tabIndex={-1}
              >
                <span className="material-icons">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar Email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ChangeEmailModal;

