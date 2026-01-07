import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from '../components/UserMenu';
import ProfileModal from '../components/ProfileModal';
import api from '../services/api';
import '../styles/Appointments.css';
import '../styles/Home.css';
import '../styles/BarberoAppointments.css';
import ConfirmationModal from '../components/ConfirmationModal';

const BarberoAppointments = () => {
  const { user, logout, loading: authLoading, initialized } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning'
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showClientProfileModal, setShowClientProfileModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

const isBarbero = user?.is_barbero === true || 
                     (user?.email && typeof user.email === 'string' && user.email.toLowerCase().endsWith('@barbero.com'));
    
    if (!isBarbero) {
      navigate('/');
      return;
    }

    loadAppointments();
  }, [user, authLoading, initialized, navigate]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/appointments');
      if (response.data.success) {
        setAppointments(response.data.data.appointments || []);
      }
    } catch (error) {
      console.error('Error cargando citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('es-ES', { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleDateString('es-ES', { month: 'short' });
    const year = date.getFullYear();
    return `${weekday}, ${day} ${month} ${year}`;
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { text: 'PENDIENTE', class: 'status-pending' },
      'confirmed': { text: 'CONFIRMADA', class: 'status-confirmed' },
      'cancelled': { text: 'CANCELADA', class: 'status-cancelled' },
      'completed': { text: 'COMPLETADA', class: 'status-completed' }
    };
    
    const config = statusConfig[status] || { text: status.toUpperCase(), class: 'status-pending' };
    
    return (
      <span className={`status-badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getServiceTypeText = (serviceType) => {
    const serviceTypes = {
      'corte': 'Corte de cabello',
      'corte_barba': 'Corte y barba',
      'corte_tinte': 'Corte + tinte',
      'corte_barba_tinte': 'Corte + barba + tinte',
      'barba': 'Barba',
      'tinte': 'Solo tinte',
      'corte_gratis': 'Corte gratis'
    };
    
    return serviceTypes[serviceType] || serviceType;
  };

  const extractTinteInfo = (notes) => {
    if (!notes) return null;
    
    const tinteMatch = notes.match(/Tinte\s+(\w+)\s*-\s*Color:\s*([^(]+)\s*\(([^)]+)\)\s*-\s*Precio tinte:\s*€?(\d+)/i);
    if (tinteMatch) {
      return {
        type: tinteMatch[1], 
        colorName: tinteMatch[2].trim(),
        hex: tinteMatch[3].trim(),
        price: parseInt(tinteMatch[4]) || 0
      };
    }
    
    return null;
  };

  const calculateAppointmentPrice = (serviceType, notes) => {
    if (serviceType === 'corte_gratis') {
      return 'Gratis (100 pts)';
    }

    const tinteInfo = extractTinteInfo(notes);
    let price = 0;

    switch (serviceType) {
      case 'corte':
        price = 11;
        break;
      case 'corte_barba':
        price = 14;
        break;
      case 'barba':
        price = 3; 
        break;
      case 'corte_tinte':
        if (tinteInfo && tinteInfo.price) {
          price = tinteInfo.price + 10;
        } else {
          return '—';
        }
        break;
      case 'corte_barba_tinte':
        if (tinteInfo && tinteInfo.price) {
          price = tinteInfo.price + 15;
        } else {
          return '—';
        }
        break;
      case 'tinte':
        if (tinteInfo && tinteInfo.price) {
          price = tinteInfo.price;
        } else {
          return '—';
        }
        break;
      default:
        return '—';
    }

    return `${price} €`;
  };

  const formatServiceWithTinte = (serviceType, notes) => {
    const serviceText = getServiceTypeText(serviceType);
    const tinteInfo = extractTinteInfo(notes);
    
    if (tinteInfo) {
      const tinteTypeText = tinteInfo.type === 'completo' ? 'Completo' : 
                           tinteInfo.type === 'mechas' ? 'Mechas' : 
                           tinteInfo.type === 'raices' ? 'Raíces' :
                           tinteInfo.type.charAt(0).toUpperCase() + tinteInfo.type.slice(1);
      
      return (
        <div className="service-with-tinte">
          <span className="service-main-text">{serviceText}</span>
          <div className="tinte-info-wrapper">
            <span className="tinte-info">
              • Tinte {tinteTypeText} - Color: {tinteInfo.colorName}
            </span>
            <span 
              className="color-indicator"
              style={{ 
                backgroundColor: tinteInfo.hex
              }} 
              title={tinteInfo.hex}
            ></span>
          </div>
        </div>
      );
    }
    
    return <span className="service-main-text">{serviceText}</span>;
  };

  const handleCompleteAppointment = async (appointmentId) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Completar Cita',
      message: '¿Estás seguro de que quieres marcar esta cita como completada?',
      onConfirm: () => performCompleteAppointment(appointmentId),
      type: 'warning'
    });
  };

  const performCompleteAppointment = async (appointmentId) => {
    try {
      setActionLoading(appointmentId);
      const response = await api.put(`/appointments/${appointmentId}`, {
        status: 'completed'
      });

      if (response.data.success) {
        setAppointments(prev => 
          prev.map(appointment => 
            appointment.id === appointmentId 
              ? { ...appointment, status: 'completed' }
              : appointment
          )
        );
        
        window.dispatchEvent(new CustomEvent('appointmentUpdated', {
          detail: { appointmentId, status: 'completed' }
        }));
      }
    } catch (error) {
      console.error('Error completando cita:', error);
    } finally {
      setActionLoading(null);
      setConfirmationModal({ ...confirmationModal, isOpen: false });
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Cancelar Cita',
      message: '¿Estás seguro de que quieres cancelar esta cita?',
      onConfirm: () => performCancelAppointment(appointmentId),
      type: 'warning'
    });
  };

  const performCancelAppointment = async (appointmentId) => {
    try {
      setActionLoading(appointmentId);
      const response = await api.put(`/appointments/${appointmentId}`, {
        status: 'cancelled'
      });

      if (response.data.success) {
        setAppointments(prev => 
          prev.map(appointment => 
            appointment.id === appointmentId 
              ? { ...appointment, status: 'cancelled' }
              : appointment
          )
        );
        
        window.dispatchEvent(new CustomEvent('appointmentUpdated', {
          detail: { appointmentId, status: 'cancelled' }
        }));
      }
    } catch (error) {
      console.error('Error cancelando cita:', error);
    } finally {
      setActionLoading(null);
      setConfirmationModal({ ...confirmationModal, isOpen: false });
    }
  };

  const handleDeleteAppointment = (appointmentId) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Eliminar Cita',
      message: '¿Estás seguro de que quieres eliminar esta cita de la vista?',
      onConfirm: () => performDeleteAppointment(appointmentId),
      type: 'error'
    });
  };

  const performDeleteAppointment = async (appointmentId) => {
    try {
      setActionLoading(appointmentId);
      const response = await api.delete(`/appointments/${appointmentId}`);

      if (response.data.success) {
        setAppointments(prev => 
          prev.filter(appointment => appointment.id !== appointmentId)
        );
        
        window.dispatchEvent(new CustomEvent('appointmentDeleted', {
          detail: { appointmentId }
        }));
      }
    } catch (error) {
      console.error('Error eliminando cita:', error);
    } finally {
      setActionLoading(null);
      setConfirmationModal({ ...confirmationModal, isOpen: false });
    }
  };

  if (authLoading || !initialized) {
    return (
      <div className="home">
        <div className="loading-container">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

const isBarbero = user?.is_barbero === true || 
                   (user?.email && typeof user.email === 'string' && user.email.toLowerCase().endsWith('@barbero.com'));
  
  if (!isBarbero) {
    return null;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavLinkClick = (e) => {
    if (e) {
      e.stopPropagation();
    }
    closeMobileMenu();
  };

  return (
    <div className="barbero-appointments-page">
      <header className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand-wrapper">
            <img src="/imagenes/logoZ.png" alt="ZetaCuts Logo" className="nav-logo" />
            <span className="nav-brand">ZetaCuts</span>
          </div>
          
          <button 
            className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleMobileMenu();
            }}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            type="button"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {isMobileMenuOpen && (
            <div 
              className="mobile-menu-overlay" 
              onClick={closeMobileMenu}
              aria-hidden="true"
            ></div>
          )}
          <nav className={`navbar-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {initialized && user && (
              <div className="navbar-actions mobile-user-menu-first">
                <UserMenu />
              </div>
            )}
            <Link to="/" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Inicio</Link>
            {!initialized && (
              <div className="navbar-actions mobile-user-menu-first">
                <div className="loading-auth">
                  <div className="loading-spinner" />
                </div>
              </div>
            )}
            {initialized && !user && (
              <div className="navbar-actions mobile-user-menu-first">
                <button onClick={(e) => { navigate('/?login=1'); handleNavLinkClick(e); }} className="btn btn-create-account">
                  Iniciar Sesión
                </button>
              </div>
            )}
          </nav>

          {}
          <div className="navbar-actions desktop-user-menu">
            {!initialized ? (
              <div className="loading-auth">
                <div className="loading-spinner"></div>
              </div>
            ) : user ? (
              <UserMenu />
            ) : (
              <button onClick={() => navigate('/?login=1')} className="btn btn-create-account">
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '6rem 1rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="barberos-header" style={{ marginBottom: '2rem' }}>
          <h1>Mis Citas</h1>
          <p>Lista de todas tus citas asignadas</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <p>Cargando citas...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-container">
            <p>No tienes citas asignadas</p>
          </div>
        ) : (
          <div className="appointments-table-container">
            <div className="appointments-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="date-cell">{formatDate(appointment.date)}</td>
                      <td className="time-cell">{formatTime(appointment.time)}</td>
                      <td className="client-cell">
                        <span
                          onClick={() => {
                            if (appointment.user?.id) {
                              setSelectedClientId(appointment.user.id);
                              setShowClientProfileModal(true);
                            }
                          }}
                          style={{
                            cursor: appointment.user?.id ? 'pointer' : 'default',
                            color: appointment.user?.id ? '#dc3545' : 'inherit',
                            textDecoration: appointment.user?.id ? 'underline' : 'none'
                          }}
                        >
                          {appointment.user?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="service-cell">
                        {formatServiceWithTinte(appointment.service_type, appointment.notes)}
                      </td>
                      <td className="price-cell">
                        {calculateAppointmentPrice(appointment.service_type, appointment.notes)}
                      </td>
                      <td className="status-cell">
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => handleCompleteAppointment(appointment.id)}
                                disabled={actionLoading === appointment.id}
                                className="btn-action btn-complete"
                              >
                                {actionLoading === appointment.id ? '...' : 'Completar'}
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(appointment.id)}
                                disabled={actionLoading === appointment.id}
                                className="btn-action btn-cancel"
                              >
                                {actionLoading === appointment.id ? '...' : 'Cancelar'}
                              </button>
                            </>
                          )}
                          {(appointment.status === 'completed' || appointment.status === 'cancelled') && (
                            <button
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              className="btn-action btn-delete"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        type={confirmationModal.type}
      />

      <ProfileModal
        isOpen={showClientProfileModal}
        onClose={() => {
          setShowClientProfileModal(false);
          setSelectedClientId(null);
        }}
        userId={selectedClientId}
      />

      <div className="barber-stickers">
        <img src="/imagenes/barberia stickers/sticker 2.webp" alt="Barber sticker" className="sticker sticker-page sticker-2" />
        <img src="/imagenes/barberia stickers/sticker 3.webp" alt="Barber sticker" className="sticker sticker-page sticker-3" />
        <img src="/imagenes/barberia stickers/sticker 4.webp" alt="Barber sticker" className="sticker sticker-page sticker-4" />
        <img src="/imagenes/barberia stickers/sticker 5.webp" alt="Barber sticker" className="sticker sticker-page sticker-5" />
        <img src="/imagenes/barberia stickers/sticker 1.webp" alt="Barber sticker" className="sticker sticker-page sticker-6" />
        <img src="/imagenes/barberia stickers/sticker 2.webp" alt="Barber sticker" className="sticker sticker-page sticker-7" />
      </div>
    </div>
  );
};

export default BarberoAppointments;
