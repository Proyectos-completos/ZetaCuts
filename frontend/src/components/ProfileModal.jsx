import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/Modal.css';

const ProfileModal = ({ isOpen, onClose, userId = null }) => {
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (userId) {
        // Cargar perfil de otro usuario
        setLoading(true);
        api.get(`/users/${userId}`)
          .then(response => {
            if (response.data.success) {
              setUser(response.data.data.user);
            }
          })
          .catch(error => {
            console.error('Error cargando perfil del usuario:', error);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        // Usar el usuario actual
        setUser(currentUser);
      }
      
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      setUser(null);
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
  }, [isOpen, userId, currentUser]);

  if (!isOpen || (!user && !loading)) return null;

  const handleClose = () => {
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const modalContent = (
    <div 
      className="modal-overlay" 
      style={{ zIndex: 10000 }}
      onClick={handleOverlayClick}
    >
      <div className="modal-content auth-modal" style={{ zIndex: 10001 }}>
        <div className="modal-header">
          <h2>{userId ? 'PERFIL DEL CLIENTE' : 'MI PERFIL'}</h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Cargando perfil...</p>
            </div>
          ) : (
            <div className="profile-info">
            <div className="profile-field">
              <label className="profile-label">Nombre:</label>
              <div className="profile-value">{user.name || 'No especificado'}</div>
            </div>

            <div className="profile-field">
              <label className="profile-label">Email:</label>
              <div className="profile-value">{user.email || 'No especificado'}</div>
            </div>

            <div className="profile-field">
              <label className="profile-label">Teléfono:</label>
              <div className="profile-value">{user.phone || 'No especificado'}</div>
            </div>

            {!(user.is_barbero || (user.email && user.email.toLowerCase().endsWith('@barbero.com'))) && (
              <div className="profile-field">
                <label className="profile-label">Puntos:</label>
                <div className="profile-value points-value">{user.points || 0} pts</div>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProfileModal;

