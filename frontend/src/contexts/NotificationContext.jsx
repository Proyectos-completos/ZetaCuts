import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user, logout } = useAuth();
  
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const resetLoadingTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Error de carga - reintentando...');
      }
    }, 10000); 

    return () => clearTimeout(resetLoadingTimeout);
  }, [loading]);

  const loadUnreadNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.is_admin) {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setLoading(false);
      return;
    }
    if (loading) {
      setLoading(false);
      setError(null);
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/notifications/unread');
      
      if (response.data.success) {
        const responseData = response.data.data || {};
        const unreadNotifications = responseData.unread_notifications || [];
        const count = responseData.count || 0;
        
        setNotifications(unreadNotifications);
        setUnreadCount(count);
        
      } else {
        setError(response.data.message || 'Error desconocido');
      }
      
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Usuario no autenticado');
        try { await logout(); } catch (_) {}
      } else if (error.response?.status === 403) {
        setError('Sin permisos');
      } else if (error.response?.status === 404) {
        setError('Servicio no disponible');
      } else {
        setError('Error de conexión');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await api.post('/notifications/mark-read', {
        notification_id: notificationId
      });
      
      if (response.data.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await api.post('/notifications/mark-all-read');
      
      if (response.data.success) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  }, []);

  const refreshNotifications = useCallback(() => {
    loadUnreadNotifications();
  }, [loadUnreadNotifications]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isAuthenticated && user?.is_admin) {
      loadUnreadNotifications();
      intervalRef.current = setInterval(() => {
        loadUnreadNotifications();
      }, 30000);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setLoading(false);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, user, loadUnreadNotifications]);

  const contextValue = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications: loadUnreadNotifications
  }), [notifications, unreadCount, loading, error, markAsRead, markAllAsRead, loadUnreadNotifications]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}; 