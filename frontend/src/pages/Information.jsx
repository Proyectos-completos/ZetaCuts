import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/Information.css';
import LoginModal from '../components/LoginModal';
import UserAuthModal from '../components/UserAuthModal';
import UserMenu from '../components/UserMenu';
import { useAuth } from '../contexts/AuthContext';

const Information = () => {
  const { user, logout, loading: authLoading, initialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserAuthModal, setShowUserAuthModal] = useState(false);
  const [fromRegister, setFromRegister] = useState(false);
  const [loginFromCitas, setLoginFromCitas] = useState(false);
  const [returnPath, setReturnPath] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCreateAccount = (e) => {
    e.preventDefault();
    setFromRegister(false);
    
    setReturnPath(location.pathname);
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    setLoginFromCitas(false);
    setReturnPath(null);
    
    navigate('/');
  };

  const handleLoginSuccess = () => {
    
    setShowLoginModal(false);
    if (loginFromCitas) {
      setLoginFromCitas(false);
      setReturnPath(null);
      navigate('/appointments');
    } else if (returnPath) {
      
      const pathToReturn = returnPath;
      setReturnPath(null);
      navigate(pathToReturn);
    }
  };

const openUserAuthModal = () => {
    setShowUserAuthModal(true);
  };

  const closeUserAuthModal = () => {
    setShowUserAuthModal(false);
    setFromRegister(false);
    setLoginFromCitas(false);
    setReturnPath(null);
    
    navigate('/');
  };

  const handleAuthSuccess = () => {
    
    setShowUserAuthModal(false);
    setFromRegister(false);

if (loginFromCitas) {
      setLoginFromCitas(false);
      setReturnPath(null);
      navigate('/appointments');
    } 
    
    else if (returnPath) {
      const pathToReturn = returnPath;
      setReturnPath(null);
      navigate(pathToReturn);
    }
    
  };

  const openUserRegistration = () => {
    
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

  return (
    <div className="information-page">
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
      </div>

      <main className="info-main">
          <div className="container">
          
          <section className="about-section">
            <h2>Sobre ZetaCuts</h2>
            <div className="about-content">
              <div className="about-text">
                <p>
                  ZetaCuts nació en 2022 con la misión de ofrecer los mejores servicios de barbería 
                  y peluquería para hombres en Novelda. Nuestro equipo de profesionales altamente 
                  capacitados combina técnicas tradicionales con las últimas tendencias para crear 
                  looks únicos que reflejen tu personalidad.
                </p>
                <p>
                  No solo te damos un corte de pelo, te ofrecemos una experiencia 
                  completa. Desde el momento en que entras por nuestra puerta, te sentirás como 
                  en casa, rodeado de un ambiente relajado y profesional donde cada detalle está 
                  pensado para tu comodidad.
                </p>
                <p>
                  Nos especializamos en una amplia variedad de servicios que incluyen cortes modernos, 
                  clásicos, barbas perfectamente arregladas, tratamientos capilares y mucho más. 
                  Cada servicio se realiza con herramientas de primera calidad y productos premium 
                  que garantizan resultados excepcionales.
                </p>
                <p>
                  Además, valoramos la fidelidad de nuestros clientes. Por eso hemos 
                  implementado un sistema de puntos que te permite acumular beneficios con cada visita, 
                  haciendo que tu experiencia con nosotros sea aún más gratificante.
                </p>
              </div>
              <div className="about-stats">
                <div className="stat">
                  <span className="stat-number">3+</span>
                  <span className="stat-label">Años de experiencia</span>
                </div>
                <div className="stat">
                  <span className="stat-number">1000+</span>
                  <span className="stat-label">Clientes satisfechos</span>
                </div>
                <div className="stat">
                  <span className="stat-number">4.9</span>
                  <span className="stat-label">Valoración media</span>
                </div>
              </div>
            </div>
          </section>

          <section className="hours-section">
            <h2>Horarios de Atención</h2>
            <div className="hours-grid">
              <div className="day">
                <span className="day-name">Lunes - Viernes</span>
                <span className="day-hours">9:00 - 19:00</span>
              </div>
              <div className="day">
                <span className="day-name">Sábado - Domingo</span>
                <span className="day-hours">Cerrado</span>
              </div>
            </div>
            <p className="hours-note">
              Los horarios pueden variar en días festivos. Te recomendamos llamar para confirmar.
            </p>
          </section>

          <section className="location-section">
            <h2>Ubicación y Contacto</h2>
            <div className="location-content">
              <div className="location-info">
                <div className="contact-item">
                  <span className="contact-icon material-icons" style={{ color: '#dc2626' }}>phone</span>
                  <div>
                    <h4>Teléfono</h4>
                    <p>+34 123 456 789</p>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon material-icons" style={{ color: '#dc2626' }}>email</span>
                  <div>
                    <h4>Email</h4>
                    <p>citas@zetacuts.com</p>
                  </div>
                </div>
              </div>
              
              <div className="map-container">
                <h3>Encuéntranos en Novelda</h3>
                <div className="map">
                  <div className="map-placeholder">
                    <div className="map-marker"><span className="material-icons" style={{ color: '#dc2626', fontSize: '3rem' }}>store</span></div>
                    <p>ZetaCuts - Calle Mayor, 45</p>
                    <p>Novelda, Alicante</p>
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Calle+Mayor,+45+Novelda,+Alicante" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-map"
                    >
                      Ver en Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

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
    </div>
  );
};

export default Information; 