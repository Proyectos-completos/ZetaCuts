import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Home.css';
import barberiaImage from '../assets/images/icons/barberia252520fina.png';
import LoginModal from '../components/LoginModal';
import UserAuthModal from '../components/UserAuthModal';
import UserMenu from '../components/UserMenu';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user, logout, loading, initialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserAuthModal, setShowUserAuthModal] = useState(false);
  const [fromRegister, setFromRegister] = useState(false);
  const [loginFromCitas, setLoginFromCitas] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

const haircuts = useMemo(() => [
    { id: 1, image: "/imagenes/corte1.jpg", title: "Corte Clásico Moderno" },
    { id: 2, image: "/imagenes/corte2.jpg", title: "Corte con Degradado" },
    { id: 3, image: "/imagenes/corte3.jpg", title: "Estilo Contemporáneo" },
    { id: 4, image: "/imagenes/corte4.jpg", title: "Corte Profesional" }
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % haircuts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [haircuts.length]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('login') === '1') {
      setFromRegister(false);
      setShowLoginModal(true);
      navigate('/', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const nav = document.querySelector('.navbar-nav');
      const hamburger = document.querySelector('.hamburger-menu');
      const brandWrapper = document.querySelector('.navbar-brand-wrapper');
      const overlay = document.querySelector('.mobile-menu-overlay');

if (isMobileMenuOpen && nav && hamburger && 
          !nav.contains(event.target) && 
          !hamburger.contains(event.target) &&
          !brandWrapper?.contains(event.target)) {
        
        if (overlay && overlay.contains(event.target)) {
          closeMobileMenu();
        } else if (!overlay?.contains(event.target)) {
          closeMobileMenu();
        }
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % haircuts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + haircuts.length) % haircuts.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
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
      navigate('/appointments');
    }
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
    // Cerrar el modal de registro después de un registro/login exitoso
    setShowUserAuthModal(false);
    setShowLoginModal(false); // Asegurar que el LoginModal no se muestre
    setFromRegister(false);
    if (loginFromCitas) {
      setLoginFromCitas(false);
      navigate('/appointments');
    }
    // El usuario ya está autenticado, no necesitamos mostrar ningún modal
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
    <div className="home">
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
            <a href="#inicio" className="nav-link" onClick={handleNavLinkClick}>Inicio</a>
            <span 
              className="nav-link" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavLinkClick();
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
                <Link to="/barberos" className="nav-link" onClick={handleNavLinkClick}>Barberos</Link>
                <Link to="/usuarios" className="nav-link" onClick={handleNavLinkClick}>Usuarios</Link>
                <Link to="/estudio-mercado" className="nav-link" onClick={handleNavLinkClick}>Mercado</Link>
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
                <button onClick={(e) => { handleCreateAccount(e); handleNavLinkClick(); }} className="btn btn-create-account">
                  Iniciar sesión
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
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="hero" style={{backgroundImage: `url(${barberiaImage})`}}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            LA MEJOR BARBERÍA Y PELUQUERÍA PARA<br />
            HOMBRES EN NOVELDA, ALICANTE
          </h1>
          <p className="hero-description">
            Si buscas una barbería o peluquería para hombres en Novelda que te ofrezca el mejor servicio
            de corte de pelo, arreglo y perfilado de barba. Visita ZetaCuts, y vive una
            auténtica experiencia de principio a fin.
          </p>
          <div className="hero-actions">
            <button 
              onClick={() => {
                if (user) {
                  navigate('/appointments');
                } else {
                  setLoginFromCitas(true);
                  setShowLoginModal(true);
                }
              }} 
              className="btn btn-primary btn-large"
            >
              Reservar Cita
            </button>
            <Link to="/information" className="btn btn-secondary btn-large">
              Más Información
            </Link>
          </div>
        </div>
      </section>

      <section className="gallery-carousel">
        <div className="barber-stickers">
          <img src="/imagenes/barberia stickers/sticker 1.webp" alt="Barber sticker" className="sticker sticker-1" loading="lazy" />
          <img src="/imagenes/barberia stickers/sticker 2.webp" alt="Barber sticker" className="sticker sticker-2" loading="lazy" />
          <img src="/imagenes/barberia stickers/sticker 3.webp" alt="Barber sticker" className="sticker sticker-3" loading="lazy" />
          <img src="/imagenes/barberia stickers/sticker 4.webp" alt="Barber sticker" className="sticker sticker-4" loading="lazy" />
          <img src="/imagenes/barberia stickers/sticker 5.webp" alt="Barber sticker" className="sticker sticker-5" loading="lazy" />
        </div>
        <div className="container">
          <h2 className="carousel-title">Nuestros mejores trabajos</h2>
          <div className="carousel-container">
            <button className="carousel-btn prev" onClick={prevSlide}>
              &#8249;
            </button>
            
            <div className="carousel-track">
              <div 
                className="carousel-slides" 
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {haircuts.map((haircut, index) => (
                  <div 
                    key={haircut.id} 
                    className={`carousel-slide ${currentSlide === index ? 'active' : ''}`}
                  >
                    <div className="slide-image">
                      <img 
                        src={haircut.image} 
                        alt={haircut.title} 
                        loading={index === 0 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        decoding="async"
                      />
                      <div className="slide-overlay">
                        <h3 className="slide-title">{haircut.title}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="carousel-btn next" onClick={nextSlide}>
              &#8250;
            </button>
          </div>

          <div className="carousel-indicators">
            {haircuts.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="services-preview" id="servicios">
        <div className="services-background"></div>
        <div className="barber-stickers">
          {}
          <img src="/imagenes/barberia stickers/sticker 1.webp" alt="Barber sticker" className="sticker sticker-6" loading="lazy" />
          <img src="/imagenes/barberia stickers/sticker 2.webp" alt="Barber sticker" className="sticker sticker-7" loading="lazy" />
          <img src="/imagenes/barberia stickers/sticker 3.webp" alt="Barber sticker" className="sticker sticker-8" loading="lazy" />
          <img src="/imagenes/barberia stickers/sticker 4.webp" alt="Barber sticker" className="sticker sticker-9" loading="lazy" />
          <img src="/imagenes/barberia stickers/sticker 5.webp" alt="Barber sticker" className="sticker sticker-10" loading="lazy" />
          <img src="/imagenes/barberia stickers/sticker 1.webp" alt="Barber sticker" className="sticker sticker-11" loading="lazy" />
        </div>
        <div className="container">
          <div className="services-header">
            <span className="services-tag services-tag-pulse">🔥 PROGRAMA DE PUNTOS 🔥</span>
            <div>
              <h2>Nuestros Servicios</h2>
              <p className="services-subtitle">
                Cortes, barbas y color profesional. Suma puntos con cada visita y canjéalos por un corte gratis.
              </p>
            </div>
          </div>

          <div className="services-list">
            <div className="service-item">
              <div className="service-content">
                <span className="service-tag">🔥 Más popular</span>
                <h3>Corte + Barba</h3>
                <p>Servicio <strong>completo</strong> con perfilado de barba <strong>profesional</strong> y acabado <strong>premium</strong>.</p>
                <div className="service-features">
                  <span className="feature-item"> Corte de pelo profesional</span>
                  <span className="feature-item"> Perfilado de barba</span>
                  <span className="feature-item"> Tratamiento capilar</span>
                  <span className="feature-item"> Acabado premium</span>
                </div>
                <span className="service-points service-points-strong">+15 puntos</span>
              </div>
            </div>

            <div className="service-item">
              <div className="service-content">
                <span className="service-tag"><span className="material-icons" style={{ color: '#dc2626', fontSize: '1rem', verticalAlign: 'middle', marginRight: '0.25rem' }}>star</span> Clásico</span>
                <h3>Corte Clásico</h3>
                <p>Cortes tradicionales y modernos con el acabado <strong>perfecto</strong> para tu estilo.</p>
                <div className="service-features">
                  <span className="feature-item"> Estilos modernos</span>
                  <span className="feature-item"> Diseño personalizado</span>
                  <span className="feature-item"> Productos de calidad</span>
                  <span className="feature-item"> Duración: 60 min</span>
                </div>
                <span className="service-points">+10 puntos</span>
              </div>
            </div>

            <div className="service-item">
              <div className="service-content">
                <span className="service-tag"><span className="material-icons" style={{ color: '#fff', fontSize: '1rem', verticalAlign: 'middle', marginRight: '0.25rem' }}>brush</span> Color</span>
                <h3>Tintes y Color</h3>
                <p>Coloración y matices <strong>personalizados</strong>. Ideal para <strong>refrescar</strong> tu look.</p>
                <div className="service-features">
                  <span className="feature-item"> Amplia gama de colores</span>
                  <span className="feature-item"> Mechas y degradados</span>
                  <span className="feature-item"> Productos sin amoniaco</span>
                  <span className="feature-item"> Resultado profesional</span>
                </div>
                <span className="service-points service-points-neutral">No suma puntos</span>
              </div>
            </div>

            <div className="service-item">
              <div className="service-content">
                <span className="service-tag">🎁 Recompensa</span>
                <h3>Corte Gratis</h3>
                <p>Acumula <strong>100 puntos</strong> y obtén un corte <strong>completamente gratis</strong>.</p>
                <div className="service-features">
                  <span className="feature-item"> Acumula puntos</span>
                  <span className="feature-item"> Canjea por corte gratis</span>
                  <span className="feature-item"> Sin fecha de caducidad</span>
                  <span className="feature-item"> Gratis y profesional</span>
                </div>
                <span className="service-points service-points-reward">100 puntos</span>
              </div>
            </div>
          </div>

          <p className="services-note">
            Los tintes y servicios de color no suman puntos para el corte gratis.
          </p>
        </div>
      </section>

      <LoginModal 
        isOpen={showLoginModal && !user} 
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

export default Home;