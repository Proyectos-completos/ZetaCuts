import React, { useState, useCallback, memo, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../styles/NotificationBell.css';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

const NotificationBell = memo(() => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const { isAuthenticated } = useAuth();
  const notificationRef = useRef(null);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) {
      return 'Hace un momento';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    } else {
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    }
  }, []);

  const handleToggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  const handleMarkAsRead = useCallback((notificationId, event) => {
    event.stopPropagation(); 
    markAsRead(notificationId);
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback((event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    markAllAsRead();
  }, [markAllAsRead]);

useEffect(() => {
    if (!showDropdown) return;

    const dropdownElement = document.querySelector('.notification-dropdown');
    
    const handleClickOutside = (event) => {
      // Verificar si el clic es en un botón dentro del dropdown
      const clickedElement = event.target;
      const isButton = clickedElement.closest('button') || clickedElement.tagName === 'BUTTON';
      const isInsideDropdown = dropdownElement && dropdownElement.contains(clickedElement);
      
      // Si es un botón dentro del dropdown, no cerrar
      if (isInsideDropdown && isButton) {
        return;
      }
      
      // Si el clic está fuera del dropdown, cerrarlo
      if (!isInsideDropdown) {
        setShowDropdown(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, false);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, false);
    };
  }, [showDropdown]);

  const notificationItems = useMemo(() => {
    return notifications.map((notification) => (
      <div 
        key={notification.id} 
        className="notification-item"
      >
        <div className="notification-content">
          <div className="notification-item-header">
            <h5 className="notification-title">{notification.title}</h5>
            <span className="notification-time">
              {formatDate(notification.created_at)}
            </span>
          </div>
          <p className="notification-message">{notification.message}</p>
          {notification.data && (
            <div className="notification-data">
              {notification.data.client_name && (
                <span className="data-item">Cliente: {notification.data.client_name}</span>
              )}
              {notification.data.barbero_name && (
                <span className="data-item">Barbero: {notification.data.barbero_name}</span>
              )}
              {notification.data.date && (
                <span className="data-item">Fecha: {new Date(notification.data.date).toLocaleString('es-ES')}</span>
              )}
            </div>
          )}
        </div>
        <button 
          className="mark-read-btn"
          onClick={(e) => handleMarkAsRead(notification.id, e)}
          title="Marcar como leída"
        >
          ✓
        </button>
      </div>
    ));
  }, [notifications, handleMarkAsRead, formatDate]);

  const dropdownContent = useMemo(() => {
    if (!showDropdown) return null;

    // Calcular posición del dropdown basada en la posición del icono
    let dropdownStyle = {};
    if (notificationRef.current) {
      const rect = notificationRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        // En móvil, centrar el dropdown
        dropdownStyle = {
          position: 'fixed',
          top: '70px',
          left: '10px',
          right: '10px',
          width: 'calc(100vw - 20px)',
          maxWidth: '400px',
          margin: '0 auto'
        };
      } else {
        // En desktop, posicionar relativo al icono
        dropdownStyle = {
          position: 'fixed',
          top: `${rect.bottom + 12}px`,
          right: `${window.innerWidth - rect.right}px`,
          width: '400px'
        };
      }
    }

    return (
      <div className="notification-dropdown" style={dropdownStyle}>
        <div className="notification-dropdown-header">
          <h4>🔔 Notificaciones</h4>
        </div>
        {unreadCount > 0 && (
          <div className="notification-mark-all-container">
            <button 
              className="mark-all-read-btn"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleMarkAllAsRead(e);
              }}
              type="button"
              title="Marcar todas como leídas"
            >
              Marcar todas como leídas
            </button>
          </div>
        )}

        <div className="notification-list">
          {loading ? (
            <div className="loading-notifications">
              <div className="loading-spinner"></div>
              <p>Cargando notificaciones...</p>
              <button 
                className="retry-btn"
                onClick={() => {
                  refreshNotifications();
                }}
              >
                Reintentar
              </button>
            </div>
          ) : error ? (
            <div className="error-notifications">
              <span className="error-icon material-icons" style={{ color: '#dc2626' }}>warning</span>
              <p className="error-message">{error}</p>
              {error === 'Usuario no autenticado' && (
                <p className="error-hint">Inicia sesión para ver las notificaciones</p>
              )}
              <button 
                className="retry-btn"
                onClick={() => {
                  refreshNotifications();
                }}
              >
                Reintentar
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="no-notifications">
              <span className="no-notifications-icon">🔔</span>
              <p>No hay notificaciones nuevas</p>
            </div>
          ) : (
            notificationItems
          )}
        </div>
      </div>
    );
  }, [showDropdown, unreadCount, loading, error, notifications.length, handleMarkAllAsRead, notificationItems, refreshNotifications]);

  if (!isAuthenticated) return null;

  return (
    <div className="notification-bell" ref={notificationRef}>
      <div 
        className="notification-icon" 
        onClick={handleToggleDropdown}
        title={unreadCount > 0 ? `${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} nueva${unreadCount > 1 ? 's' : ''}` : 'Notificaciones'}
      >
        <span style={{ color: '#dc3545', fontSize: '1.3rem' }}>🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {showDropdown && createPortal(dropdownContent, document.body)}
    </div>
  );
});

NotificationBell.displayName = 'NotificationBell';

export default NotificationBell; 