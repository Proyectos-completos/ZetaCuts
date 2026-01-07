import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/Appointments.css';
import LoginModal from '../components/LoginModal';
import UserAuthModal from '../components/UserAuthModal';
import UserMenu from '../components/UserMenu';
import NotificationBell from '../components/NotificationBell';
import Toast from '../components/Toast';
import ConfirmationModal from '../components/ConfirmationModal';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import api from '../services/api';
import { getAllHairColors } from '../data/hairColors';

const hairColorsCatalog = getAllHairColors();
const tinteEligibleServices = ['corte', 'corte_barba'];

const Appointments = () => {
  const { user, logout, loading: authLoading, initialized } = useAuth();
  const { refreshNotifications } = useNotifications();
  const navigate = useNavigate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedBarbero, setSelectedBarbero] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [includeTinte, setIncludeTinte] = useState(false);
  const [tinteType, setTinteType] = useState('completo');
  const [selectedHairColor, setSelectedHairColor] = useState(null); 
  const [currentMonth, setCurrentMonth] = useState(today);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [availableBarberos, setAvailableBarberos] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserAuthModal, setShowUserAuthModal] = useState(false);
  const [fromRegister, setFromRegister] = useState(false);
  const [loginFromCitas, setLoginFromCitas] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [myAppointments, setMyAppointments] = useState([]);
  const [loadingMyAppointments, setLoadingMyAppointments] = useState(false);
  const [showMyAppointments, setShowMyAppointments] = useState(false);
  const [myAppointmentsPage, setMyAppointmentsPage] = useState(1);
  const appointmentsPerPage = 3;
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning'
  });
  const [actionLoading, setActionLoading] = useState(null);
  const wasAuthenticatedRef = useRef(false);

  const workingHours = {
    start: 9,
    end: 19,
    days: [1, 2, 3, 4, 5] 
  };

  const getDayOfWeek = (date) => {
    const day = date.getDay();
    return day === 0 ? 7 : day;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  useEffect(() => {
    const loadBarberos = async () => {
      try {
        console.log('Cargando barberos...');
        const response = await api.get('/barberos/available');
        console.log('Respuesta de barberos:', response.data);
        if (response.data.success) {
          setAvailableBarberos(response.data.data.barberos);
          console.log('Barberos cargados:', response.data.data.barberos);
        }
      } catch (error) {
        console.error('Error cargando barberos:', error);
      }
    };

    loadBarberos();
  }, []);

  useEffect(() => {
    if (user && showMyAppointments) {
      loadMyAppointments();
    }
  }, [user, showMyAppointments]);

useEffect(() => {
    const reloadSlots = () => {
      if (selectedDate && selectedBarbero) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        api.get('/appointments/slots/available', {
          params: {
            date: dateString,
            barbero_id: selectedBarbero
          }
        }).then(response => {
          if (response.data.success) {
            setAvailableSlots(response.data.data.available_slots);
            setBookedSlots(response.data.data.booked_slots || []);
          }
        }).catch(error => {
          console.error('Error recargando slots:', error);
        });
      }
    };

    const handleAppointmentDeleted = (event) => {
      const { appointmentId } = event.detail;
      
      if (showMyAppointments && user) {
        loadMyAppointments();
      }
      
      reloadSlots();
    };

    const handleAppointmentUpdated = (event) => {
      const { appointmentId, status } = event.detail;
      
      if (showMyAppointments && user) {
        loadMyAppointments();
      }
      
      reloadSlots();
    };

    window.addEventListener('appointmentDeleted', handleAppointmentDeleted);
    window.addEventListener('appointmentUpdated', handleAppointmentUpdated);
    return () => {
      window.removeEventListener('appointmentDeleted', handleAppointmentDeleted);
      window.removeEventListener('appointmentUpdated', handleAppointmentUpdated);
    };
  }, [showMyAppointments, user, selectedDate, selectedBarbero]);

useEffect(() => {
    if (user) {
      wasAuthenticatedRef.current = true;
    }
  }, [user]);

useEffect(() => {
    if (initialized && !user && wasAuthenticatedRef.current) {
      
      setShowLoginModal(true);
      
      setSelectedTime(null);
      setSelectedBarbero(null);
      setSelectedDate(today);
      setShowMyAppointments(false);
      setMyAppointments([]);
      
      wasAuthenticatedRef.current = false;
    }
  }, [initialized, user, today]);

  const loadMyAppointments = async () => {
    setLoadingMyAppointments(true);
    try {
      const response = await api.get('/appointments');
      if (response.data.success) {
        const appointments = response.data.data.appointments || [];
        setMyAppointments(appointments);
        
        // Ajustar la página actual si se queda vacía después de una actualización/eliminación
        const newTotalPages = Math.ceil(appointments.length / appointmentsPerPage);
        if (myAppointmentsPage > newTotalPages && newTotalPages > 0) {
          setMyAppointmentsPage(newTotalPages);
        }
      }
    } catch (error) {
      console.error('Error cargando mis citas:', error);
      setToast({
        show: true,
        message: 'Error al cargar tus citas',
        type: 'error'
      });
    } finally {
      setLoadingMyAppointments(false);
    }
  };

  const handleCancelMyAppointment = async (appointmentId) => {
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
        setToast({
          show: true,
          message: 'Cita cancelada exitosamente',
          type: 'success'
        });
        loadMyAppointments();
      }
    } catch (error) {
      console.error('Error cancelando cita:', error);
      setToast({
        show: true,
        message: 'Error al cancelar la cita',
        type: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMyAppointment = async (appointmentId) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Eliminar Cita',
      message: '¿Estás seguro de que quieres eliminar esta cita? Esta acción no se puede deshacer.',
      onConfirm: () => performDeleteAppointment(appointmentId),
      type: 'error'
    });
  };

  const performDeleteAppointment = async (appointmentId) => {
    try {
      setActionLoading(appointmentId);
      const response = await api.delete(`/appointments/${appointmentId}`);

      if (response.data.success) {
        setToast({
          show: true,
          message: 'Cita eliminada exitosamente',
          type: 'success'
        });
        loadMyAppointments();
      }
    } catch (error) {
      console.error('Error eliminando cita:', error);
      setToast({
        show: true,
        message: 'Error al eliminar la cita',
        type: 'error'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatAppointmentDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAppointmentTime = (timeString) => {
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

  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!selectedDate || !selectedBarbero) {
        setAvailableSlots([]);
        return;
      }

      setLoadingSlots(true);
      try {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        console.log('Cargando horarios para:', { date: dateString, barbero_id: selectedBarbero });
        
        const response = await api.get('/appointments/slots/available', {
          params: {
            date: dateString,
            barbero_id: selectedBarbero
          }
        });

        console.log('Respuesta de horarios:', response.data);
        
                 if (response.data.success) {
           setAvailableSlots(response.data.data.available_slots);
           setBookedSlots(response.data.data.booked_slots || []);
           console.log('Horarios disponibles:', response.data.data.available_slots);
           console.log('Horarios reservados:', response.data.data.booked_slots);
           console.log('Estado actual - Available:', response.data.data.available_slots);
           console.log('Estado actual - Booked:', response.data.data.booked_slots);
         }
      } catch (error) {
        console.error('Error cargando horarios disponibles:', error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadAvailableSlots();
  }, [selectedDate, selectedBarbero]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 31); 
    const days = [];

    const firstDayOfWeek = firstDay.getDay();
    const firstDayEuropean = firstDayOfWeek === 0 ? 7 : firstDayOfWeek;

    for (let i = 1; i < firstDayEuropean; i++) {
      days.push({
        date: null,
        isCurrentMonth: false,
        isToday: false,
        isWorkingDay: false,
        isPast: false,
        isFuture: false,
        isEmpty: true
      });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      days.push({
        date: date,
        isCurrentMonth: true,
        isToday: false,
        isWorkingDay: workingHours.days.includes(getDayOfWeek(date)),
        isPast: date < today,
        isFuture: date >= today && date <= maxDate,
        isEmpty: false
      });
    }

    return days;
  };

  const previousMonth = () => {
    const today = new Date();
    const previousMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    
    if (previousMonthDate.getMonth() >= today.getMonth() && previousMonthDate.getFullYear() >= today.getFullYear()) {
      setCurrentMonth(previousMonthDate);
    }
  };

  const nextMonth = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 31); 
    const nextMonthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    
    if (nextMonthDate <= maxDate) {
      setCurrentMonth(nextMonthDate);
    }
  };

  const handleDateSelect = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 31);
    
    if (workingHours.days.includes(getDayOfWeek(date)) && date >= today && date <= maxDate) {
      setSelectedDate(date);
      setSelectedTime(null);
    }
  };

  const handleBarberoSelect = (barberoId) => {
    setSelectedBarbero(barberoId);
    setSelectedTime(null);
    setSelectedService(null);
  };

  const handleTimeSelect = (timeSlot) => {
    if (bookedSlots.includes(timeSlot)) {
      setToast({
        show: true,
        message: 'Esta hora ya está reservada. Por favor, selecciona otra hora.',
        type: 'error'
      });
      return;
    }
    setSelectedTime(timeSlot);
    setSelectedService(null);
  };

  const handleServiceSelect = (service) => {
    if (service === 'corte_gratis' && (!user || user.points < 100)) {
      setToast({
        show: true,
        message: 'Necesitas al menos 100 puntos para un corte gratis.',
        type: 'error'
      });
      return;
    }
    setSelectedService(service);
    if (service === 'corte_gratis') {
      setIncludeTinte(false);
      setSelectedHairColor(null);
    } else if (!tinteEligibleServices.includes(service) && service !== 'tinte') {
      setIncludeTinte(false);
      setSelectedHairColor(null);
    } else if (service === 'tinte') {
      setIncludeTinte(false);
    }
  };

  const handleBookAppointment = async () => {
    
    if (!user) {
      setShowLoginModal(true);
      setToast({
        show: true,
        message: 'Debes iniciar sesión para reservar una cita',
        type: 'error'
      });
      return;
    }

    if (selectedTime && selectedBarbero) {
      if (selectedService === 'corte_gratis' && (!user || user.points < 100)) {
        setToast({
          show: true,
          message: 'No tienes suficientes puntos para un corte gratis. Necesitas 100 puntos.',
          type: 'error'
        });
        return;
      }

      if (requiresHairColorSelection && !selectedHairColor) {
        setToast({
          show: true,
          message: 'Selecciona el color de tinte antes de confirmar tu cita.',
          type: 'error'
        });
        return;
      }
      try {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        let notes = '';
        if (includesTinteOnService && selectedHairColor) {
          notes = `Tinte ${tinteType} - Color: ${selectedHairColor.name} (${selectedHairColor.hex}) - Precio tinte: €${selectedHairColor.price}`;
        }
        
        const response = await api.post('/appointments', {
          date: dateString,
          time: selectedTime,
          barbero_id: selectedBarbero,
          service_type: effectiveServiceKey,
          notes: notes
        });

          if (response.data.success) {
          const successMessage = selectedService === 'corte_gratis' 
            ? `¡Corte gratis reservado exitosamente para ${selectedDate.toLocaleDateString()} a las ${selectedTime}! Se han descontado 100 puntos.`
            : `¡Cita reservada exitosamente para ${selectedDate.toLocaleDateString()} a las ${selectedTime}!`;
          
          setToast({
            show: true,
            message: successMessage,
            type: 'success'
          });
          setSelectedTime(null);
          setSelectedService(null);
          
          setBookedSlots(prev => [...prev, selectedTime]);
          setAvailableSlots(prev => prev.filter(slot => slot !== selectedTime));
          
          refreshNotifications();
          
          const slotsResponse = await api.get('/appointments/slots/available', {
            params: {
              date: dateString,
              barbero_id: selectedBarbero
            }
          });
          if (slotsResponse.data.success) {
            setAvailableSlots(slotsResponse.data.data.available_slots);
            setBookedSlots(slotsResponse.data.data.booked_slots || []);
          }

window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (error) {
        console.error('Error reservando cita:', error);
        setToast({
          show: true,
          message: 'Error al reservar la cita. Por favor, intenta de nuevo.',
          type: 'error'
        });
      }
    }
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    setFromRegister(false);
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    setLoginFromCitas(false);
    
    navigate('/');
  };

  const handleLoginSuccess = () => {
    
    setShowLoginModal(false);
    if (loginFromCitas) {
      setLoginFromCitas(false);
      
    }
  };

  const closeLoginModalForRegister = () => {
    
    setShowLoginModal(false);
  };

  const openUserAuthModal = () => {
    setShowUserAuthModal(true);
  };

  const closeUserAuthModal = () => {
    setShowUserAuthModal(false);
    setFromRegister(false);
    setLoginFromCitas(false);
    
    navigate('/');
  };

  const handleAuthSuccess = () => {
    
    setShowUserAuthModal(false);
    setFromRegister(false);
    if (loginFromCitas) {
      setLoginFromCitas(false);
      
    }
  };

  const openUserRegistration = () => {
    
    closeLoginModalForRegister();
    setFromRegister(true);
    setShowUserAuthModal(true);
  };

  const goBackToLoginFromUserAuth = () => {
    setShowUserAuthModal(false);
    setShowLoginModal(true);
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

  const closeToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const includesTinteOnService = selectedService === 'tinte' || (includeTinte && tinteEligibleServices.includes(selectedService));
  const effectiveServiceKey = includesTinteOnService
    ? (selectedService === 'corte'
        ? 'corte_tinte'
        : selectedService === 'corte_barba'
          ? 'corte_barba_tinte'
          : 'tinte')
    : selectedService;

  const serviceLabels = {
    corte: 'Corte de cabello',
    corte_barba: 'Corte de cabello + barba',
    corte_tinte: 'Corte de cabello + tinte',
    corte_barba_tinte: 'Corte de cabello + barba + tinte',
    corte_gratis: 'Corte gratis (100 pts)',
    tinte: 'Solo tinte',
    barba: 'Barba'
  };

  const calculatePrice = () => {
    if (effectiveServiceKey === 'corte') return 11;
    if (effectiveServiceKey === 'corte_barba') return 14;
    if (effectiveServiceKey === 'corte_tinte') {
      // Corte (11€) + Tinte (65€ o 70€ según el color)
      return selectedHairColor ? 11 + selectedHairColor.price : null;
    }
    if (effectiveServiceKey === 'corte_barba_tinte') {
      // Corte + Barba (14€) + Tinte (65€ o 70€ según el color)
      return selectedHairColor ? 14 + selectedHairColor.price : null;
    }
    if (effectiveServiceKey === 'tinte') {
      // Solo Tinte (65€ o 70€ según el color)
      return selectedHairColor ? selectedHairColor.price : null;
    }
    return null;
  };

  const priceValue = effectiveServiceKey === 'corte_gratis' ? null : calculatePrice();

  const pointsByService = {
    corte: 10,
    corte_barba: 15,
    corte_tinte: 10,
    corte_barba_tinte: 15,
    corte_gratis: 0,
    tinte: 0,
    barba: 5
  };

  const pointsToEarn = pointsByService[effectiveServiceKey] ?? 0;
  const requiresHairColorSelection = includesTinteOnService;
  const disableConfirmation = requiresHairColorSelection && !selectedHairColor;

  const renderTinteTypeSelector = () => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Tipo de tinte:</label>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="radio"
            name="tinteType"
            checked={tinteType === 'completo'}
            onChange={() => setTinteType('completo')}
          />
          <span>Tinte completo</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="radio"
            name="tinteType"
            checked={tinteType === 'mecha'}
            onChange={() => setTinteType('mecha')}
          />
          <span>Mechas</span>
        </label>
      </div>
    </div>
  );

  const renderHairColorGrid = () => (
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Selecciona el color:</label>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: '0.75rem',
          maxHeight: '230px',
          overflowY: 'auto',
          padding: '0.5rem'
        }}
      >
        {hairColorsCatalog.map((color) => (
          <button
            key={color.name}
            type="button"
            onClick={() => setSelectedHairColor(color)}
            style={{
              width: '100%',
              minHeight: '95px',
              borderRadius: '12px',
              border: selectedHairColor?.name === color.name ? '3px solid #dc3545' : '2px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}
            title={`${color.name} - ${color.price} €`}
          >
            <span
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: color.color,
                border: '2px solid rgba(0,0,0,0.1)',
                marginBottom: '0.4rem'
              }}
            />
            <span style={{ fontWeight: '600', color: '#333', fontSize: '0.8rem' }}>{color.name}</span>
            <small style={{ color: '#6c757d' }}>{color.price} €</small>
          </button>
        ))}
      </div>
    </div>
  );

  const totalAppointmentsPages = Math.ceil(myAppointments.length / appointmentsPerPage);
  const currentAppointments = myAppointments.slice(
    (myAppointmentsPage - 1) * appointmentsPerPage,
    myAppointmentsPage * appointmentsPerPage
  );

  return (
    <div className="appointments-page">
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
                <UserMenu showToast={(message, type) => setToast({ show: true, message, type })} />
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
                  setLoginFromCitas(true);
                  setShowLoginModal(true);
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
                <Link to="/barberos" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Barberos</Link>
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
                <button onClick={(e) => { handleCreateAccount(e); handleNavLinkClick(e); }} className="btn btn-create-account">
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
              <button onClick={handleCreateAccount} className="btn btn-create-account">
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

      <div className="appointments-main">
        <div className="container">
          <div className="appointments-header">
            <h1>Reservar Cita</h1>
            <p>Selecciona una fecha, barbero y hora para tu cita en ZetaCuts</p>
            {user && (
              <div className="appointments-tabs">
                <button
                  className={`tab-btn ${!showMyAppointments ? 'active' : ''}`}
                  onClick={() => setShowMyAppointments(false)}
                >
                  Reservar nueva cita
                </button>
                <button
                  className={`tab-btn ${showMyAppointments ? 'active' : ''}`}
                  onClick={() => {
                    setShowMyAppointments(true);
                    if (myAppointments.length === 0) {
                      loadMyAppointments();
                    }
                  }}
                >
                  Historial de citas
                </button>
              </div>
            )}
          </div>

          {user && showMyAppointments && (
            <div className="my-appointments-section">
              <h2>{user?.is_admin ? 'Historial de todas las citas' : 'Mis citas'}</h2>
              {loadingMyAppointments ? (
                <div className="loading-appointments">
                  <p>Cargando tus citas...</p>
                </div>
              ) : myAppointments.length === 0 ? (
                <div className="no-appointments">
                  <p>No tienes citas programadas</p>
                </div>
              ) : (
                <>
                <div className="my-appointments-list">
                  {currentAppointments.map((appointment) => (
                    <div key={appointment.id} className="my-appointment-card">
                      <div className="appointment-header">
                        <h3>Cita #{appointment.id}</h3>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="appointment-details">
                        {user?.is_admin && appointment.user && (
                          <div className="detail-row">
                            <span className="detail-label">Cliente:</span>
                            <span className="detail-value">{appointment.user.name || 'N/A'}</span>
                          </div>
                        )}
                        <div className="detail-row">
                          <span className="detail-label">Barbero:</span>
                          <span className="detail-value">{appointment.barbero?.name || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Fecha:</span>
                          <span className="detail-value">{formatAppointmentDate(appointment.date)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Hora:</span>
                          <span className="detail-value">{formatAppointmentTime(appointment.time)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Servicio:</span>
                          <span className="detail-value">
                            {serviceLabels[appointment.service_type] || appointment.service_type}
                          </span>
                        </div>
                      </div>
                      <div className="appointment-actions">
                        {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleCancelMyAppointment(appointment.id)}
                            disabled={actionLoading === appointment.id}
                          >
                            {actionLoading === appointment.id ? 'Cancelando...' : 'Cancelar Cita'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="reviews-pagination appointments-pagination">
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setMyAppointmentsPage((prev) => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={myAppointmentsPage <= 1}
                    style={{ minWidth: '140px' }}
                  >
                    ← ANTERIOR
                  </button>
                  <span>
                    Página {myAppointmentsPage} de {Math.max(1, totalAppointmentsPages)}
                  </span>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setMyAppointmentsPage((prev) => Math.min(prev + 1, totalAppointmentsPages));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={myAppointmentsPage >= totalAppointmentsPages}
                    style={{ minWidth: '140px' }}
                  >
                    SIGUIENTE →
                  </button>
                </div>
                </>
              )}
            </div>
          )}

          {(!user || !showMyAppointments) && (

          <div className="appointments-content">
            <div className="calendar-section">
              <div className="calendar-header">
                <button className="calendar-nav-btn" onClick={previousMonth}>
                  <span className="material-icons">chevron_left</span>
                </button>
                <h2>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
                <button className="calendar-nav-btn" onClick={nextMonth}>
                  <span className="material-icons">chevron_right</span>
                </button>
              </div>

              <div className="calendar">
                <div className="calendar-weekdays">
                  <div className="weekday">Lun</div>
                  <div className="weekday">Mar</div>
                  <div className="weekday">Mié</div>
                  <div className="weekday">Jue</div>
                  <div className="weekday">Vie</div>
                  <div className="weekday">Sáb</div>
                  <div className="weekday">Dom</div>
                </div>

                <div className="calendar-days">
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className={`calendar-day ${
                        day.isEmpty ? 'empty' : ''
                      } ${
                        selectedDate.toDateString() === day.date?.toDateString() ? 'selected' : ''
                      } ${
                        day.isWorkingDay ? 'working-day' : 'weekend'
                      } ${
                        day.isPast ? 'past' : ''
                      } ${
                        !day.isFuture ? 'disabled' : ''
                      }`}
                      onClick={() => day.date && handleDateSelect(day.date)}
                    >
                      {day.date ? day.date.getDate() : ''}
                    </div>
                  ))}
                </div>
              </div>

              <div className="calendar-info">
                <div className="info-item">
                  <div className="info-color working-day"></div>
                  <span>Días laborables</span>
                </div>
                <div className="info-item">
                  <div className="info-color weekend"></div>
                  <span>Fin de semana</span>
                </div>
                <div className="info-item">
                  <div className="info-color selected"></div>
                  <span>Fecha seleccionada</span>
                </div>
                <div className="info-item">
                  <div className="info-color past"></div>
                  <span>Días bloqueados</span>
                </div>
              </div>
            </div>
            <div className="times-section">
              <div className="barbero-selection">
                <h3>Seleccionar Barbero</h3>
                <select 
                  className="barbero-select"
                  value={selectedBarbero || ''}
                  onChange={(e) => handleBarberoSelect(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Selecciona un barbero</option>
                  {availableBarberos.map((barbero) => (
                    <option key={barbero.id} value={barbero.id}>
                      {barbero.name}
                    </option>
                  ))}
                </select>
              </div>

                             <div className="times-header">
                 <h3>Horarios Disponibles</h3>
                 <p className="selected-date">
                   {selectedDate.toLocaleDateString('es-ES', { 
                     weekday: 'long', 
                     year: 'numeric', 
                     month: 'long', 
                     day: 'numeric' 
                   })}
                 </p>
                 {isToday(selectedDate) && (
                   <p className="today-notice">
                     ⚠ Hora actual: {getCurrentTime()} - Solo se muestran horarios futuros (mínimo 20 min antes)
                   </p>
                 )}
               </div>

                             {workingHours.days.includes(getDayOfWeek(selectedDate)) && selectedDate >= today ? (
                 <div className="time-slots">
                   {console.log('Renderizando time-slots con CSS grid de 2 columnas')}
                  {loadingSlots ? (
                    <div className="loading-slots">
                      <p>Cargando horarios disponibles...</p>
                    </div>
                                                        ) : selectedBarbero ? (
                     <>
                       {Array.from({ length: 5 }, (_, i) => {
                         const hour = 9 + i;
                         const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                         const isBooked = bookedSlots.includes(timeSlot);
                         const isAvailable = availableSlots.includes(timeSlot);
                         
                         return (
                           <button
                             key={`left-${i}`}
                             className={`time-slot ${
                               isBooked ? 'booked' : isAvailable ? 'available' : 'unavailable'
                             } ${
                               selectedTime === timeSlot ? 'selected' : ''
                             }`}
                             onClick={() => handleTimeSelect(timeSlot)}
                             disabled={isBooked || !isAvailable}
                           >
                             {timeSlot}
                             {isBooked && <span className="booked-label">Reservado</span>}
                           </button>
                         );
                       })}
                       
                       {Array.from({ length: 5 }, (_, i) => {
                         const hour = 14 + i; 
                         const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                         const isBooked = bookedSlots.includes(timeSlot);
                         const isAvailable = availableSlots.includes(timeSlot);
                         
                         if (timeSlot === '15:00') {
                           console.log('Slot 15:00 - isBooked:', isBooked, 'isAvailable:', isAvailable);
                           console.log('bookedSlots:', bookedSlots);
                           console.log('availableSlots:', availableSlots);
                         }
                         
                         return (
                           <button
                             key={`right-${i}`}
                             className={`time-slot ${
                               isBooked ? 'booked' : isAvailable ? 'available' : 'unavailable'
                             } ${
                               selectedTime === timeSlot ? 'selected' : ''
                             }`}
                             onClick={() => handleTimeSelect(timeSlot)}
                             disabled={isBooked || !isAvailable}
                           >
                             {timeSlot}
                             {isBooked && <span className="booked-label">Reservado</span>}
                           </button>
                         );
                       })}
                       
                       {availableSlots.length === 0 && bookedSlots.length === 0 && (
                         <div className="no-available-slots">
                           <p>No hay horarios disponibles para este barbero en la fecha seleccionada</p>
                         </div>
                       )}
                     </>
                  ) : (
                    <div className="select-barbero-first">
                      <p>Selecciona un barbero para ver los horarios disponibles</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="no-working-day">
                  {selectedDate < today ? (
                    <>
                      <p>No se pueden reservar citas en fechas pasadas</p>
                      <p>Selecciona una fecha futura para ver los horarios disponibles</p>
                    </>
                  ) : (
                    <>
                      <p>No hay citas disponibles en fin de semana</p>
                      <p>Horario: Lunes a Viernes de 9:00 a 19:00</p>
                    </>
                  )}
                </div>
              )}

              {selectedTime && selectedBarbero && (
                <div className="booking-summary">
                  <div className="service-selection">
                    <h5>Selecciona tu servicio:</h5>
                    <div className="service-buttons">
                      <button
                        className={`service-btn ${selectedService === 'corte' ? 'active' : ''}`}
                        onClick={() => handleServiceSelect('corte')}
                      >
                        Corte de Cabello
                      </button>
                      <button
                        className={`service-btn ${selectedService === 'corte_barba' ? 'active' : ''}`}
                        onClick={() => handleServiceSelect('corte_barba')}
                      >
                        Corte + Barba
                      </button>
                      <button
                        className={`service-btn ${selectedService === 'tinte' ? 'active' : ''}`}
                        onClick={() => handleServiceSelect('tinte')}
                      >
                        Solo Tinte
                        <small style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.25rem' }}>Desde 65 €</small>
                      </button>
                      {user && user.points >= 100 && (
                        <button
                          className={`service-btn service-btn-free ${selectedService === 'corte_gratis' ? 'active' : ''}`}
                          onClick={() => handleServiceSelect('corte_gratis')}
                        >
                          🎁 Corte Gratis ({user.points} pts)
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {selectedService && (
                    <>
                      {tinteEligibleServices.includes(selectedService) && (
                        <div className="tinte-selection" style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                          <h5 style={{ marginBottom: '1rem' }}>¿Quieres tintarte el cabello?</h5>
                          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                checked={!includeTinte}
                                onChange={() => {
                                  setIncludeTinte(false);
                                  setSelectedHairColor(null);
                                }}
                              />
                              <span>No</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                checked={includeTinte}
                                onChange={() => setIncludeTinte(true)}
                              />
                              <span>Sí</span>
                            </label>
                          </div>
                          
                          {includeTinte && (
                            <>
                              {renderTinteTypeSelector()}
                              {renderHairColorGrid()}
                            </>
                          )}
                        </div>
                      )}

                      {selectedService === 'tinte' && (
                        <div className="tinte-selection" style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                          <h5 style={{ marginBottom: '1rem' }}>Configura tu tinte</h5>
                          {renderTinteTypeSelector()}
                          {renderHairColorGrid()}
                          <p style={{ marginTop: '0.75rem', color: '#6c757d', fontSize: '0.9rem' }}>
                            Los tintes tienen un valor base de 65 € y algunos tonos premium alcanzan los 70 €.
                          </p>
                        </div>
                      )}
                      
                      <h4 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Resumen de tu cita</h4>
                      <div className="summary-details">
                        <p><strong>Fecha:</strong> {selectedDate.toLocaleDateString('es-ES')}</p>
                        <p><strong>Hora:</strong> {selectedTime}</p>
                        <p><strong>Barbero:</strong> {availableBarberos.find(b => b.id === selectedBarbero)?.name}</p>
                        <p><strong>Duración:</strong> 1 hora</p>
                        <p><strong>Servicio:</strong> {serviceLabels[effectiveServiceKey] || 'Servicio seleccionado'}</p>
                        {includesTinteOnService && (
                          <>
                            <p><strong>Tipo de tinte:</strong> {tinteType === 'completo' ? 'Completo' : 'Mechas'}</p>
                            <p><strong>Color:</strong> {selectedHairColor ? `${selectedHairColor.name} (${selectedHairColor.price} €)` : 'Selecciona un color'}</p>
                          </>
                        )}
                        <p><strong>Precio:</strong> {
                          effectiveServiceKey === 'corte_gratis'
                            ? '100 puntos de la cuenta'
                            : priceValue
                              ? `${priceValue} euros`
                              : requiresHairColorSelection
                                ? 'Selecciona tu tinte para calcular el precio'
                                : '€'
                        }</p>
                        <p><strong>Puntos a ganar:</strong> {
                          effectiveServiceKey === 'corte_gratis'
                            ? '0 pts (corte gratis)'
                            : `${pointsToEarn} pts${includesTinteOnService ? ' (el tinte no suma puntos extra)' : ''}`
                        }</p>
                        {selectedService === 'corte_gratis' && (
                          <p className="points-warning">
                            <strong><span className="material-icons" style={{ color: '#dc2626', fontSize: '1rem', verticalAlign: 'middle', marginRight: '0.25rem' }}>warning</span> Se descontarán 100 puntos de tu cuenta</strong>
                          </p>
                        )}
                        {disableConfirmation && (
                          <p className="tinte-warning">
                            Selecciona un color de tinte para continuar.
                          </p>
                        )}
                      </div>
                      <button 
                        className="btn-book-appointment"
                        onClick={handleBookAppointment}
                        disabled={disableConfirmation}
                        title={disableConfirmation ? 'Selecciona tu tinte para confirmar la cita' : undefined}
                      >
                        {selectedService === 'corte_gratis' ? 'Confirmar Corte Gratis' : 'Confirmar Cita'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          )}

          <div className="appointments-info">
            <div className="info-card info-card-hours">
              <div className="info-icon"><span className="material-icons" style={{ color: '#dc2626', fontSize: '2.5rem' }}>store</span></div>
              <h3>Horario de Atención</h3>
              <p><strong>Lunes a Viernes:</strong> 9:00 - 19:00</p>
              <p><strong>Sábados y Domingos:</strong> Cerrado</p>
            </div>
            <div className="info-card info-card-duration">
              <div className="info-icon"><span className="material-icons" style={{ color: '#dc2626', fontSize: '2.5rem' }}>schedule</span></div>
              <h3>Duración de Citas</h3>
              <p>Cada cita tiene una duración de <strong>1 hora</strong></p>
              <p>Incluye consulta, corte y acabado</p>
              <p>Puedes reservar hasta <strong>31 días</strong> por adelantado</p>
            </div>
            <div className="info-card info-card-barbers">
              <div className="info-icon"><span className="material-icons" style={{ color: '#dc2626', fontSize: '2.5rem' }}>person</span></div>
              <h3>Barberos</h3>
              <p>Cada barbero tiene su propia agenda</p>
              <p>Puedes elegir el barbero de tu preferencia</p>
              <p>Los horarios se actualizan en tiempo real</p>
            </div>
            <div className="info-card info-card-contact">
              <div className="info-icon"><span className="material-icons" style={{ color: '#dc2626', fontSize: '2.5rem' }}>phone</span></div>
              <h3>Contacto</h3>
              <p><strong>Teléfono:</strong> +34 123 456 789</p>
              <p><strong>Email:</strong> citas@zetacuts.com</p>
              <p><strong>Horario de atención telefónica:</strong> Lunes a Viernes 9:00 - 19:00</p>
              <p><strong>Redes Sociales:</strong></p>
              <p><strong>Instagram:</strong> @zetacuts</p>
              <p><strong>Facebook:</strong> ZetaCuts Barbería</p>
              <p><strong>Twitter:</strong> @zetacuts</p>
            </div>
            <div className="info-card info-card-points">
              <div className="info-icon"><span className="material-icons" style={{ color: '#dc2626', fontSize: '2.5rem' }}>stars</span></div>
              <h3>Sistema de Puntos</h3>
              <p><strong>Corte de cabello:</strong> +10 puntos</p>
              <p><strong>Corte + barba:</strong> +15 puntos</p>
              <p><strong>Tinte:</strong> 0 puntos (solo acumulas por corte/barba)</p>
              <p><strong>Con 100 puntos:</strong> ¡Corte gratis!</p>
              <p>Los puntos se otorgan cuando el barbero marca tu cita como completada. Los tintes no suman puntos adicionales.</p>
            </div>
            <div className="info-card info-card-location">
              <div className="info-icon"><span className="material-icons" style={{ color: '#dc2626', fontSize: '2.5rem' }}>location_on</span></div>
              <h3>Ubicación</h3>
              <p><strong>Dirección:</strong> Calle Principal, 123</p>
              <p><strong>Ciudad:</strong> Novelda, Alicante</p>
              <p><strong>Código Postal:</strong> 03660</p>
              <p>Fácil acceso y aparcamiento disponible</p>
              <p>Tocar el timbre para entrar a la barbería</p>
            </div>
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={closeLoginModal}
        onRegisterClick={openUserRegistration}
        onLoginSuccess={handleLoginSuccess}
      />
      
        <UserAuthModal 
          isOpen={showUserAuthModal} 
          onClose={closeUserAuthModal}
          fromRegister={fromRegister}
          onGoBack={goBackToLoginFromUserAuth}
          onAuthSuccess={handleAuthSuccess}
        />

        <Toast
         message={toast.message}
         type={toast.type}
         isVisible={toast.show}
         onClose={closeToast}
       />

       <ConfirmationModal
         isOpen={confirmationModal.isOpen}
         onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
         onConfirm={confirmationModal.onConfirm}
         title={confirmationModal.title}
         message={confirmationModal.message}
         type={confirmationModal.type}
         confirmText={confirmationModal.type === 'error' ? 'Eliminar' : 'Confirmar'}
         cancelText="Cancelar"
       />
     </div>
   );
 };

export default Appointments; 