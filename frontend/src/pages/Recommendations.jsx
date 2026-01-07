import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/Recommendations.css';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from '../components/UserMenu';
import LoginModal from '../components/LoginModal';
import UserAuthModal from '../components/UserAuthModal';
import { skinTones, hairColorRecommendations } from '../data/hairColors';

const Recommendations = () => {
  const { user, logout, initialized } = useAuth();
  const navigate = useNavigate();
  const [selectedSkinTone, setSelectedSkinTone] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserAuthModal, setShowUserAuthModal] = useState(false);
  const [fromRegister, setFromRegister] = useState(false);
  const [loginFromReservarCita, setLoginFromReservarCita] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.is_admin ?? false;

  const handleSkinToneSelect = (skinTone) => {
    setSelectedSkinTone(skinTone);
  };

  const getRecommendations = () => {
    if (!selectedSkinTone) return [];
    return hairColorRecommendations[selectedSkinTone.id] || [];
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
    <div className="recommendations-page">
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
          <nav className={`navbar-nav ${isAdmin ? 'admin-nav' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
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
            <Link to="/recomendaciones" className="nav-link active" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Recomendaciones</Link>
            {isAdmin && (
              <>
                <Link to="/barberos" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Barberos</Link>
                <Link to="/usuarios" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Usuarios</Link>
                <Link to="/estudio-mercado" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Mercado</Link>
              </>
            )}
            {!initialized && (
              <div className="navbar-actions mobile-user-menu-first">
                <div className="loading-auth">
                  <div className="loading-spinner" />
                </div>
              </div>
            )}
            {initialized && !user && (
              <div className="navbar-actions mobile-user-menu-first">
                <button onClick={(e) => { setShowLoginModal(true); handleNavLinkClick(e); }} className="btn btn-create-account">
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
              <button onClick={() => setShowLoginModal(true)} className="btn btn-create-account">
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

      <main className="recommendations-content container">
        <section className="recommendations-hero">
          <p className="eyebrow">Encuentra tu color perfecto</p>
          <h1>Recomendaciones de tinte</h1>
          <p>Selecciona tu tono de piel para descubrir los mejores colores de cabello que realzan tu belleza natural.</p>
        </section>

        <section className="skin-tone-selection">
          <h2>Selecciona tu tono de piel</h2>
          <div className="skin-tone-palette">
            {skinTones.map((tone) => (
              <button
                key={tone.id}
                className={`skin-tone-card ${selectedSkinTone?.id === tone.id ? 'selected' : ''}`}
                onClick={() => handleSkinToneSelect(tone)}
                style={{ backgroundColor: tone.color }}
                title={tone.description}
              >
                <div className="skin-tone-color" style={{ backgroundColor: tone.color }} />
              </button>
            ))}
          </div>
        </section>

        {selectedSkinTone && (
          <section className="hair-color-recommendations">
            <h2>
              Tintes recomendados para piel <span style={{ color: selectedSkinTone.color }}>{selectedSkinTone.name}</span>
            </h2>
            <div className="hair-color-palette">
              {getRecommendations().map((hairColor, index) => (
                <div key={index} className="hair-color-card">
                  <div
                    className="hair-color-swatch"
                    style={{ backgroundColor: hairColor.color }}
                  />
                  <div className="hair-color-info">
                    <span className="hair-color-name">{hairColor.name}</span>
                  <span className="hair-color-price">{hairColor.price} €</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="recommendation-tips">
              <h3>
                <span className="material-icons" style={{ color: '#dc3545', fontSize: '1.5rem', verticalAlign: 'middle', marginRight: '0.5rem' }}>lightbulb</span>
                Consejos profesionales
              </h3>
              <ul>
                <li>Estos colores están seleccionados para complementar tu tono de piel y crear un look armonioso.</li>
                <li>Considera tu color de ojos y estilo personal al elegir el tinte final.</li>
                <li>Para mejores resultados, consulta con nuestro equipo de profesionales en ZetaCuts.</li>
                <li>Los colores más claros pueden requerir decoloración previa según tu color natural.</li>
              </ul>
            </div>
            <div className="recommendation-cta">
              <button 
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  if (user) {
                    navigate('/appointments');
                  } else {
                    setLoginFromReservarCita(true);
                    setShowLoginModal(true);
                  }
                }}
              >
                Reservar Cita
              </button>
            </div>
          </section>
        )}

        {!selectedSkinTone && (
          <section className="recommendations-info">
            <div className="info-card">
              <h3><span className="material-icons" style={{ color: '#dc2626', fontSize: '1.5rem', verticalAlign: 'middle', marginRight: '0.5rem' }}>palette</span> ¿Cómo funciona?</h3>
              <p>Selecciona el tono de piel que más se acerque al tuyo. Nuestro sistema te mostrará una paleta de colores de cabello especialmente recomendados para tu tipo de piel.</p>
            </div>
            <div className="info-card">
              <h3><span className="material-icons" style={{ color: '#dc2626', fontSize: '1.5rem', verticalAlign: 'middle', marginRight: '0.5rem' }}>auto_awesome</span> Beneficios</h3>
              <p>Encuentra el color perfecto que realza tu belleza natural y complementa tu tono de piel de manera profesional.</p>
            </div>
            <div className="info-card">
              <h3><span className="material-icons" style={{ color: '#dc2626', fontSize: '1.5rem', verticalAlign: 'middle', marginRight: '0.5rem' }}>work</span> Consulta profesional</h3>
              <p>Para una recomendación personalizada más detallada, agenda una cita con nuestros barberos expertos en coloración.</p>
              <button 
                className="btn btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  if (user) {
                    navigate('/appointments');
                  } else {
                    setLoginFromReservarCita(true);
                    setShowLoginModal(true);
                  }
                }}
              >
                Reservar Cita
              </button>
            </div>
          </section>
        )}
      </main>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => {
          setShowLoginModal(false);
          setLoginFromReservarCita(false);
          navigate('/');
        }}
        onRegisterClick={() => {
          setShowLoginModal(false);
          setFromRegister(true);
          setShowUserAuthModal(true);
        }}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          if (loginFromReservarCita) {
            setLoginFromReservarCita(false);
            navigate('/appointments');
          }
          
        }}
      />
      
      <UserAuthModal 
        isOpen={showUserAuthModal} 
        onClose={() => {
          setShowUserAuthModal(false);
          setFromRegister(false);
          setLoginFromReservarCita(false);
          navigate('/');
        }}
        fromRegister={fromRegister}
        onGoBack={() => {
          setShowUserAuthModal(false);
          setFromRegister(false);
          setShowLoginModal(true);
        }}
        onAuthSuccess={() => {
          setShowUserAuthModal(false);
          setFromRegister(false);
          if (loginFromReservarCita) {
            setLoginFromReservarCita(false);
            navigate('/appointments');
          }
          
        }}
      />
    </div>
  );
};

export default Recommendations;

