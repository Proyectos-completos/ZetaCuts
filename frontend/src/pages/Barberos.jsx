import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { barberoService } from '../services/api';
import api from '../services/api';
import UserMenu from '../components/UserMenu';
import ConfirmationModal from '../components/ConfirmationModal';
import '../styles/Barberos.css';
import '../styles/Home.css';

const Barberos = () => {
  const { user, logout, loading: authLoading, initialized, updateUserPoints, refreshUserPoints } = useAuth();
  const navigate = useNavigate();
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const [deletingBarbero, setDeletingBarbero] = useState(null);
  const [selectedBarbero, setSelectedBarbero] = useState(null);
  const [barberoAppointments, setBarberoAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    password_confirmation: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning'
  });

  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    if (!user?.is_admin) {
      window.location.href = '/';
      return;
    }
    loadBarberos();
  }, [user, authLoading]);

  useEffect(() => {
    if (user?.is_admin) {
      loadBarberos();
    }
  }, [searchTerm, sortOrder]);

  const loadBarberos = async () => {
    try {
      setLoading(true);
      const response = await barberoService.getAll(searchTerm, sortOrder);
      if (response.success) {
        setBarberos(response.data);
      }
    } catch (error) {
      console.error('Error cargando barberos:', error);
      setError('Error al cargar los barberos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (formData.password !== formData.password_confirmation) {
      setFormErrors({ password_confirmation: 'Las contraseñas no coinciden' });
      return;
    }
    
    try {
      const response = await barberoService.create(formData);
      if (response.success) {
        setShowCreateModal(false);
        setFormData({ name: '', email: '', password: '', password_confirmation: '', phone: '' });
        setFormErrors({});
        setShowPassword(false);
        setShowPasswordConfirmation(false);
        loadBarberos();
        showToastNotification('Barbero creado exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error creando barbero:', error);
      if (error.response?.data?.message) {
        const errorMessage = error.response.data.message;
        showToastNotification(errorMessage, 'error');
        
        // Mapear mensajes de error a campos específicos
        if (errorMessage.includes('nombre') || errorMessage.includes('Nombre') || errorMessage.includes('barbero con ese nombre')) {
          setFormErrors({ name: errorMessage });
        } else if (errorMessage.includes('email') || errorMessage.includes('Email') || errorMessage.includes('@barbero.com') || errorMessage.includes('cliente')) {
          setFormErrors({ email: errorMessage });
        } else if (errorMessage.includes('contraseña') || errorMessage.includes('Contraseña')) {
          setFormErrors({ password: errorMessage });
        } else if (error.response?.data?.errors) {
          setFormErrors(error.response.data.errors);
        }
      } else {
        showToastNotification('Error al crear el barbero', 'error');
      }
    }
  };


  const handleDelete = async (id) => {
    try {
      const response = await barberoService.delete(id);
      if (response.success) {
        loadBarberos();
        showToastNotification('Barbero eliminado exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error eliminando barbero:', error);
      showToastNotification('Error al eliminar el barbero', 'error');
    }
  };

  const openDeleteModal = (barbero) => {
    setDeletingBarbero(barbero);
    setShowDeleteModal(true);
  };

  const openAppointmentsModal = async (barbero) => {
    setSelectedBarbero(barbero);
    setShowAppointmentsModal(true);
    await loadBarberoAppointments(barbero.id);
  };

  const loadBarberoAppointments = async (barberoId) => {
    try {
      setLoadingAppointments(true);
      const response = await api.get(`/barberos/${barberoId}/appointments`);
      if (response.data.success) {
        setBarberoAppointments(response.data.data.appointments);
      }
    } catch (error) {
      console.error('Error cargando citas del barbero:', error);
      showToastNotification('Error al cargar las citas del barbero', 'error');
    } finally {
      setLoadingAppointments(false);
    }
  };

useEffect(() => {
    const handleAppointmentDeleted = (event) => {
      const { appointmentId } = event.detail;
      
      if (showAppointmentsModal && selectedBarbero) {
        loadBarberoAppointments(selectedBarbero.id);
      }
    };

    const handleAppointmentUpdated = (event) => {
      const { appointmentId, status } = event.detail;
      
      if (showAppointmentsModal && selectedBarbero) {
        loadBarberoAppointments(selectedBarbero.id);
      }
    };

    window.addEventListener('appointmentDeleted', handleAppointmentDeleted);
    window.addEventListener('appointmentUpdated', handleAppointmentUpdated);
    return () => {
      window.removeEventListener('appointmentDeleted', handleAppointmentDeleted);
      window.removeEventListener('appointmentUpdated', handleAppointmentUpdated);
    };
  }, [showAppointmentsModal, selectedBarbero]);

  // Deshabilitar scroll del body cuando los modales están abiertos
  useEffect(() => {
    if (showAppointmentsModal || showCreateModal || showDeleteModal) {
      // Guardar el valor actual del overflow
      const originalOverflow = document.body.style.overflow;
      // Deshabilitar scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restaurar el scroll cuando se cierren los modales
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showAppointmentsModal, showCreateModal, showDeleteModal]);

  const confirmDelete = async () => {
    if (deletingBarbero) {
      await handleDelete(deletingBarbero.id);
      setShowDeleteModal(false);
      setDeletingBarbero(null);
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowDeleteModal(false);
    setShowAppointmentsModal(false);
    setFormData({ name: '', email: '', password: '', password_confirmation: '', phone: '' });
    setFormErrors({});
    setShowPassword(false);
    setShowPasswordConfirmation(false);
    setDeletingBarbero(null);
    setSelectedBarbero(null);
    setBarberoAppointments([]);
    setError('');
  };

  const handleFormChange = (e) => {
    let { name, value } = e.target;

if (name === 'phone') {
      
      value = value.replace(/[^\d]/g, '');
      
      if (value.length > 9) {
        value = value.slice(0, 9);
      }
    }
    
    setFormData({ ...formData, [name]: value });
    if (error) {
      setError('');
    }
    
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { text: 'Pendiente', class: 'status-pending' },
      'confirmed': { text: 'Confirmada', class: 'status-confirmed' },
      'cancelled': { text: 'Cancelada', class: 'status-cancelled' },
      'completed': { text: 'Completada', class: 'status-completed' }
    };
    
    const config = statusConfig[status] || { text: status, class: 'status-pending' };
    
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
        <div>
          <div>{serviceText}</div>
          <div style={{ 
            marginTop: '0.25rem', 
            fontSize: '0.85rem', 
            color: '#6c757d',
            fontWeight: '500'
          }}>
            Tinte {tinteTypeText} - Color: {tinteInfo.colorName}
            <span style={{ 
              display: 'inline-block',
              width: '12px',
              height: '12px',
              backgroundColor: tinteInfo.hex,
              borderRadius: '2px',
              marginLeft: '0.5rem',
              verticalAlign: 'middle',
              border: '1px solid #ddd'
            }} title={tinteInfo.hex}></span>
          </div>
        </div>
      );
    }
    
    return serviceText;
  };

  const showToastNotification = (message, type = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
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
        
        setBarberoAppointments(prev => 
          prev.map(appointment => 
            appointment.id === appointmentId 
              ? { ...appointment, status: 'cancelled' }
              : appointment
          )
        );
        showToastNotification('Cita cancelada exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error cancelando cita:', error);
      showToastNotification('Error al cancelar la cita', 'error');
    } finally {
      setActionLoading(null);
    }
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
        
        setBarberoAppointments(prev => 
          prev.map(appointment => 
            appointment.id === appointmentId 
              ? { ...appointment, status: 'completed' }
              : appointment
          )
        );
        
        if (response.data.data?.appointment?.user_id === user.id) {
          await refreshUserPoints();
        }
        
        showToastNotification('Cita marcada como completada', 'success');
      }
    } catch (error) {
      console.error('Error completando cita:', error);
      showToastNotification('Error al marcar la cita como completada', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Eliminar Cita',
      message: '¿Estás seguro de que quieres eliminar completamente esta cita? Esta acción no se puede deshacer.',
      onConfirm: () => performDeleteAppointment(appointmentId),
      type: 'error'
    });
  };

  const performDeleteAppointment = async (appointmentId) => {
    try {
      setActionLoading(appointmentId);
      const response = await api.delete(`/appointments/${appointmentId}`);

      if (response.data.success) {
        setBarberoAppointments(prev => 
          prev.filter(appointment => appointment.id !== appointmentId)
        );
        showToastNotification('Cita eliminada exitosamente', 'success');
      }
    } catch (error) {
      console.error('Error eliminando cita:', error);
      showToastNotification('Error al eliminar la cita', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const canShowActions = (status) => {
    return status === 'pending' || status === 'confirmed';
  };

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

  if (authLoading || !initialized || !user?.is_admin) {
    return <div className="loading" style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;
  }

  return (
    <div className="home barberos-page">
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
          <nav className={`navbar-nav ${user?.is_admin ? 'admin-nav' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            {initialized && user && (
              <div className="navbar-actions mobile-user-menu-first">
                <UserMenu />
              </div>
            )}
            <Link to="/" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Inicio</Link>
            <span 
              className="nav-link" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavLinkClick(e);
                if (user) {
                  navigate('/appointments');
                } else {
                  navigate('/?login=1');
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              Citas
            </span>
            <Link to="/information" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Sobre Nosotros</Link>
            <Link to="/tienda" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Tienda</Link>
            <Link to="/reviews" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Reseñas</Link>
            <Link to="/recomendaciones" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Recomendaciones</Link>
            {initialized && user?.is_admin && (
              <>
                <Link to="/barberos" className="nav-link active" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Barberos</Link>
                <Link to="/usuarios" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Usuarios</Link>
                <Link to="/estudio-mercado" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Mercado</Link>
              </>
            )}
            {!initialized && (
              <div className="navbar-actions mobile-user-menu-first">
                <div className="loading-auth">
                  <div className="loading-spinner"></div>
                </div>
              </div>
            )}
            {initialized && !user && (
              <div className="navbar-actions mobile-user-menu-first">
                <Link to="/" className="btn btn-create-account" onClick={handleNavLinkClick}>
                  Iniciar Sesión
                </Link>
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

      <div className="barber-stickers">
        <img src="/imagenes/barberia stickers/sticker 1.webp" alt="Barber sticker" className="sticker sticker-page sticker-1" />
        <img src="/imagenes/barberia stickers/sticker 2.webp" alt="Barber sticker" className="sticker sticker-page sticker-2" />
        <img src="/imagenes/barberia stickers/sticker 3.webp" alt="Barber sticker" className="sticker sticker-page sticker-3" />
        <img src="/imagenes/barberia stickers/sticker 4.webp" alt="Barber sticker" className="sticker sticker-page sticker-4" />
        <img src="/imagenes/barberia stickers/sticker 5.webp" alt="Barber sticker" className="sticker sticker-page sticker-5" />
        <img src="/imagenes/barberia stickers/sticker 1.webp" alt="Barber sticker" className="sticker sticker-page sticker-6" />
        <img src="/imagenes/barberia stickers/sticker 2.webp" alt="Barber sticker" className="sticker sticker-page sticker-7" />
      </div>

      <div className="barberos-container">
        <div className="barberos-header">
          <h1>Gestión de Barberos</h1>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowCreateModal(true)}
          >
            CREAR BARBERO
          </button>
        </div>

        <div className="barberos-controls">
          <input
            type="text"
            placeholder="Buscar barberos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="sort-select"
          >
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>

        <div className="barberos-list">
          {loading ? (
            <div className="loading">Cargando barberos...</div>
          ) : barberos.length === 0 ? (
            <div className="no-barberos">No se encontraron barberos</div>
          ) : (
            <div className="barberos-grid">
              {barberos.map((barbero) => (
                <div key={barbero.id} className="barbero-card">
                  <div className="barbero-image-container">
                    <img 
                      src={barbero.image_url || '/imagenes/peluquero.png'} 
                      alt={barbero.name}
                      className="barbero-image"
                      onError={(e) => {
                        e.target.src = '/imagenes/peluquero.png';
                      }}
                    />
                  </div>
                  <div className="barbero-info">
                    <h3>{barbero.name}</h3>
                  </div>
                  <div className="barbero-actions">
                    <button
                      className="btn btn-view"
                      onClick={() => openAppointmentsModal(barbero)}
                    >
                      Ver Citas
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => openDeleteModal(barbero)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showCreateModal && createPortal((
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Crear Nuevo Barbero</h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <div className="modal-body">
                <form className="auth-form" onSubmit={handleCreate}>
                  <div className="form-group">
                    <label htmlFor="name">Nombre:</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="form-input"
                      placeholder="Nombre del barbero"
                      required
                    />
                    {formErrors.name && (
                      <div className="error-message" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {formErrors.name}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="form-input"
                      placeholder="Email del barbero"
                      required
                    />
                    {formErrors.email && (
                      <div className="error-message" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {formErrors.email}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Teléfono:</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="form-input"
                      placeholder="Teléfono (opcional, máx. 9 dígitos)"
                      pattern="[0-9]{1,9}"
                      title="Solo se permiten números (máximo 9 dígitos)"
                      maxLength="9"
                    />
                    {formErrors.phone && (
                      <div className="error-message" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {formErrors.phone}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Contraseña:</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleFormChange}
                        className="form-input"
                        placeholder="Contraseña (mínimo 8 caracteres)"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        <span className="material-icons">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {formErrors.password && (
                      <div className="error-message" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {formErrors.password}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="password_confirmation">Confirmar Contraseña:</label>
                    <div className="password-input-wrapper">
                      <input
                        type={showPasswordConfirmation ? "text" : "password"}
                        id="password_confirmation"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleFormChange}
                        className="form-input"
                        placeholder="Confirma la contraseña"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                        tabIndex={-1}
                      >
                        <span className="material-icons">
                          {showPasswordConfirmation ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                    {formErrors.password_confirmation && (
                      <div className="error-message" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {formErrors.password_confirmation}
                      </div>
                    )}
                  </div>
                  {error && (
                    <div className="error-message">
                      {error}
                    </div>
                  )}
                  <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={closeModals}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Crear
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ), document.body)}

        {showDeleteModal && createPortal((
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Eliminar Barbero</h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que quieres eliminar al barbero "{deletingBarbero?.name}"?</p>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeModals}
                  style={{ backgroundColor: '#000', color: 'white' }}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={confirmDelete}
                  style={{ backgroundColor: '#dc3545', color: 'white' }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ), document.body)}

        {showAppointmentsModal && createPortal((
          <div className="modal-overlay">
            <div className="modal-content appointments-modal">
              <div className="modal-header">
                <h2>Citas de {selectedBarbero?.name}</h2>
                <button className="modal-close" onClick={closeModals}>×</button>
              </div>
              
              <div className="modal-body">
                {loadingAppointments ? (
                  <div className="loading-appointments">
                    <p>Cargando citas...</p>
                  </div>
                ) : barberoAppointments.length === 0 ? (
                  <div className="no-appointments">
                    <p>Este barbero no tiene citas registradas</p>
                  </div>
                ) : (
                  <div className="appointments-list-modal">
                    {barberoAppointments.map((appointment, index) => (
                      <div key={appointment.id} className="appointment-card-modal">
                        <div className="appointment-header-modal">
                          <h3>Cita #{index + 1}</h3>
                          {getStatusBadge(appointment.status)}
                        </div>
                        
                        <div className="appointment-details-modal">
                          <div className="detail-row-modal">
                            <span className="detail-label-modal">Cliente:</span>
                            <span className="detail-value-modal">{appointment.user?.name || 'N/A'}</span>
                          </div>
                          
                          <div className="detail-row-modal">
                            <span className="detail-label-modal">Fecha:</span>
                            <span className="detail-value-modal">{formatDate(appointment.date)}</span>
                          </div>
                          
                          <div className="detail-row-modal">
                            <span className="detail-label-modal">Hora:</span>
                            <span className="detail-value-modal">{formatTime(appointment.time)}</span>
                          </div>
                          
                          <div className="detail-row-modal">
                            <span className="detail-label-modal">Servicio:</span>
                            <span className="detail-value-modal">
                              {formatServiceWithTinte(appointment.service_type, appointment.notes)}
                            </span>
                          </div>
                          
                          <div className="detail-row-modal">
                            <span className="detail-label-modal">Precio:</span>
                            <span className="detail-value-modal" style={{ fontWeight: '600', color: '#28a745' }}>
                              {calculateAppointmentPrice(appointment.service_type, appointment.notes)}
                            </span>
                          </div>
                          
                          {appointment.notes && (
                            <div className="detail-row-modal">
                              <span className="detail-label-modal">Notas:</span>
                              <span className="detail-value-modal">{appointment.notes}</span>
                            </div>
                          )}
                          
                          <div className="detail-row-modal">
                            <span className="detail-label-modal">Creada:</span>
                            <span className="detail-value-modal">
                              {new Date(appointment.created_at).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>

                        {canShowActions(appointment.status) && (
                          <div className="appointment-actions-modal">
                            <button
                              className="btn-cancel-modal"
                              onClick={() => handleCancelAppointment(appointment.id)}
                              disabled={actionLoading === appointment.id}
                            >
                              {actionLoading === appointment.id ? 'Cancelando...' : 'Cancelar Cita'}
                            </button>
                            
                            <button
                              className="btn-complete-modal"
                              onClick={() => handleCompleteAppointment(appointment.id)}
                              disabled={actionLoading === appointment.id}
                            >
                              {actionLoading === appointment.id ? 'Completando...' : 'Marcar como Completada'}
                            </button>
                          </div>
                        )}

                        <div className="appointment-actions-modal">
                          <button
                            className="btn-delete-modal"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            disabled={actionLoading === appointment.id}
                          >
                            {actionLoading === appointment.id ? 'Eliminando...' : 'Eliminar Cita'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ), document.body)}
      </div>

      {}
      {showToast && (
        <div className={`toast-notification ${toastType}`}>
          <div className="toast-content">
            <span className="toast-message">{toastMessage}</span>
            <button 
              className="toast-close" 
              onClick={() => setShowToast(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default Barberos; 