import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/Reviews.css';
import { publicBarberoService, reviewService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from '../components/UserMenu';
import ConfirmationModal from '../components/ConfirmationModal';
import LoginModal from '../components/LoginModal';
import UserAuthModal from '../components/UserAuthModal';

const Reviews = () => {
  const { user, logout, initialized } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserAuthModal, setShowUserAuthModal] = useState(false);
  const [fromRegister, setFromRegister] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [barberos, setBarberos] = useState([]);
  const [filterBarbero, setFilterBarbero] = useState('');
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [page, setPage] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [form, setForm] = useState({
    barbero_id: '',
    rating: 5,
    comment: '',
  });
  const [hoverRating, setHoverRating] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning'
  });

  const isAdmin = useMemo(() => user?.is_admin ?? false, [user]);

  useEffect(() => {
    fetchBarberos();
  }, []);

  useEffect(() => {
    if (confirmationModal.isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [confirmationModal.isOpen]);

  useEffect(() => {
    fetchReviews(page, filterBarbero);
  }, [page, filterBarbero]);

  const fetchBarberos = async () => {
    try {
      const response = await publicBarberoService.getAvailable();
      setBarberos(response?.data?.barberos ?? []);
    } catch (error) {
      console.error('Error loading barbers', error);
    }
  };

  const fetchReviews = async (pageParam = 1, barberoId) => {
    setLoadingReviews(true);
    try {
      const params = { 
        page: pageParam,
        per_page: 3
      };
      if (barberoId) {
        params.barbero_id = barberoId;
      }
      const response = await reviewService.list(params);
      const paginated = response?.data ?? {};
      setReviews(paginated.data ?? []);
      setMeta({
        current_page: paginated.current_page ?? 1,
        last_page: paginated.last_page ?? 1,
      });
    } catch (error) {
      console.error('Error loading reviews', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!form.barbero_id) {
      setFeedback({ type: 'error', message: 'Selecciona un barbero.' });
      return;
    }

    setSubmitting(true);
    try {
      await reviewService.create({
        barbero_id: form.barbero_id,
        rating: parseFloat(form.rating),
        comment: form.comment || undefined,
      });
      setFeedback({ type: 'success', message: 'Reseña publicada correctamente.' });
      setForm((prev) => ({ ...prev, comment: '', rating: 5 }));
      setPage(1);
      fetchReviews(1, filterBarbero);
    } catch (error) {
      console.error('Error submitting review', error);
      const message = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(' ')
        : 'No pudimos guardar tu reseña. Intenta nuevamente.';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
      if (rating >= i) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (rating + 0.5 >= i) {
        stars.push(<span key={i} className="star half">★</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return stars;
  };

  const interactiveRatingValue = hoverRating ?? form.rating;

  const computeRatingFromEvent = (event, starIndex) => {
    
    if (!event.currentTarget) {
      
      return starIndex;
    }

    try {
      const rect = event.currentTarget.getBoundingClientRect();
      const clientX = event.touches?.[0]?.clientX ?? event.clientX ?? 0;

if (!rect || typeof rect.left === 'undefined' || typeof rect.width === 'undefined') {
        return starIndex;
      }

      const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      const base = starIndex - 1;
      return ratio <= 0.5 ? base + 0.5 : base + 1;
    } catch (error) {
      
      console.warn('Error computing rating from event:', error);
      return starIndex;
    }
  };

  const handleStarMove = (event, starIndex) => {
    if (!event || !event.currentTarget) return;
    try {
      setHoverRating(computeRatingFromEvent(event, starIndex));
    } catch (error) {
      console.warn('Error in handleStarMove:', error);
    }
  };

  const handleStarLeave = () => {
    setHoverRating(null);
  };

  const handleStarClick = (event, starIndex) => {
    if (!event) return;
    try {
      event.preventDefault();
      const rating = computeRatingFromEvent(event, starIndex);
      setForm((prev) => ({
        ...prev,
        rating,
      }));
    } catch (error) {
      console.warn('Error in handleStarClick:', error);
      
      setForm((prev) => ({
        ...prev,
        rating: starIndex,
      }));
    }
  };

  const handleStarTouch = (event, starIndex) => {
    if (!event) return;
    try {
      event.preventDefault();
      const value = computeRatingFromEvent(event, starIndex);
      setHoverRating(value);
      setForm((prev) => ({
        ...prev,
        rating: value,
      }));
    } catch (error) {
      console.warn('Error in handleStarTouch:', error);
      
      const fallbackRating = starIndex;
      setHoverRating(fallbackRating);
      setForm((prev) => ({
        ...prev,
        rating: fallbackRating,
      }));
    }
  };

  const renderInteractiveStars = () => {
    const stars = [];
    for (let starIndex = 1; starIndex <= 5; starIndex += 1) {
      const base = starIndex - 1;
      let fillRatio = 0;
      if (interactiveRatingValue >= starIndex) {
        fillRatio = 1;
      } else if (interactiveRatingValue >= base + 0.5) {
        fillRatio = 0.5;
      }

      stars.push(
        <button
          type="button"
          key={starIndex}
          className="star-button"
          onMouseMove={(event) => handleStarMove(event, starIndex)}
          onMouseLeave={handleStarLeave}
          onClick={(event) => handleStarClick(event, starIndex)}
          onTouchStart={(event) => handleStarTouch(event, starIndex)}
          onTouchMove={(event) => handleStarTouch(event, starIndex)}
          aria-label={`${starIndex} estrellas`}
        >
          <span
            className="star-icon"
            style={{ '--fill-percentage': `${fillRatio * 100}%` }}
          >
            ★
          </span>
        </button>
      );
    }

    return stars;
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
    <div className="reviews-page">
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
                  setShowLoginModal(true);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              Citas
            </span>
            <Link to="/information" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Sobre Nosotros</Link>
            <Link to="/tienda" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Tienda</Link>
            <Link to="/reviews" className="nav-link active" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Reseñas</Link>
            <Link to="/recomendaciones" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Recomendaciones</Link>
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
        <img src="/imagenes/barberia stickers/sticker 5.webp" alt="Barber sticker" className="sticker sticker-page sticker-5" />
      </div>

      <main className="reviews-content container">
        <section className="reviews-hero">
          <p className="eyebrow">Historias reales</p>
          <h1>Reseñas de nuestros clientes</h1>
          <p>Comparte tu experiencia y ayuda a otros a elegir al barbero perfecto.</p>
        </section>

        <section className="reviews-grid">
          <div className="reviews-list-card">
            <div className="reviews-list-header">
              <h2>Últimas reseñas</h2>
              <select
                value={filterBarbero}
                onChange={(e) => {
                  setFilterBarbero(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Todos los barberos</option>
                {barberos.map((barbero) => (
                  <option key={barbero.id} value={barbero.id}>
                    {barbero.name}
                  </option>
                ))}
              </select>
            </div>

            {loadingReviews ? (
              <div className="reviews-loading">Cargando reseñas...</div>
            ) : reviews.length === 0 ? (
              <div className="reviews-empty">
                <p>Todavía no hay reseñas en esta categoría.</p>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <article key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="review-author-info">
                        <img 
                          src="/imagenes/persona.png" 
                          alt="Usuario"
                          className="review-author-image"
                          onError={(e) => {
                            
                            if (e.target.src.includes('.png')) {
                              e.target.src = '/imagenes/persona.jpg';
                            } else if (e.target.src.includes('.jpg')) {
                              e.target.src = '/imagenes/persona.webp';
                            } else {
                              e.target.style.display = 'none';
                            }
                          }}
                        />
                        <div className="review-stars">
                          {renderStars(Number(review.rating))}
                          <span className="review-rating">{Number(review.rating).toFixed(1)}</span>
                        </div>
                      </div>
                      <span className="review-barber">{review.barbero?.name}</span>
                    </div>
                    <p className="review-comment">
                      {review.comment || 'El usuario no agregó un comentario.'}
                    </p>
                    <div className="review-footer">
                      <span className="review-author">Por {review.user?.name}</span>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="review-actions">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setConfirmationModal({
                              isOpen: true,
                              title: 'Eliminar Reseña',
                              message: '¿Estás seguro de que quieres eliminar esta reseña?',
                              onConfirm: async () => {
                                try {
                                  await reviewService.delete(review.id);
                                  setPage(1);
                                  fetchReviews(1, filterBarbero);
                                  setConfirmationModal({ ...confirmationModal, isOpen: false });
                                } catch (error) {
                                  console.error('Error eliminando reseña:', error);
                                  setFeedback({ type: 'error', message: 'Error al eliminar la reseña.' });
                                  setConfirmationModal({ ...confirmationModal, isOpen: false });
                                }
                              },
                              type: 'error'
                            });
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}

            <div className="reviews-pagination">
              <button
                className="btn btn-secondary"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={meta.current_page <= 1}
              >
                ← Anterior
              </button>
              <span>
                Página {meta.current_page} de {meta.last_page}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setPage((prev) => Math.min(prev + 1, meta.last_page))}
                disabled={meta.current_page >= meta.last_page}
              >
                Siguiente →
              </button>
            </div>
          </div>

          <div className="reviews-form-card">
            <h2>Deja tu reseña</h2>
            {!user ? (
              <div className="reviews-login-hint">
                <p>Necesitas iniciar sesión para dejar una reseña.</p>
                <button onClick={() => setShowLoginModal(true)} className="btn btn-primary btn-login">
                  Iniciar Sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="reviews-form">
                <label>
                  Barbero
                  <select
                    value={form.barbero_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, barbero_id: e.target.value }))}
                  >
                    <option value="">Selecciona un barbero</option>
                    {barberos.map((barbero) => (
                      <option key={barbero.id} value={barbero.id}>
                        {barbero.name}
                      </option>
                    ))}
                  </select>
                </label>
            <div className="rating-input">
              <span>Calificación</span>
              <div
                className="rating-interactive"
                onMouseLeave={() => setHoverRating(null)}
                onBlur={() => setHoverRating(null)}
              >
                <div className="rating-stars-input">
                  {renderInteractiveStars()}
                </div>
                <span className="rating-value">
                  {interactiveRatingValue.toFixed(1)} / 5
                </span>
              </div>
            </div>
                <label>
                  Comentario
                  <textarea
                    rows="4"
                    placeholder="Cuéntanos tu experiencia..."
                    value={form.comment}
                    maxLength={200}
                    onChange={(e) => {
                      if (e.target.value.length <= 200) {
                        setForm((prev) => ({ ...prev, comment: e.target.value }));
                      }
                    }}
                  />
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: form.comment.length >= 180 ? '#dc3545' : '#6b7280',
                    textAlign: 'right',
                    marginTop: '0.25rem'
                  }}>
                    {form.comment.length} / 200 caracteres
                  </div>
                </label>
                {feedback && (
                  <div className={`reviews-feedback ${feedback.type}`}>
                    {feedback.message}
                  </div>
                )}
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Publicar reseña'}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
      
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

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => {
          setShowLoginModal(false);
          navigate('/');
        }}
        onRegisterClick={() => {
          setShowLoginModal(false);
          setFromRegister(true);
          setShowUserAuthModal(true);
        }}
        onLoginSuccess={() => {
          setShowLoginModal(false);
        }}
      />
      
      <UserAuthModal 
        isOpen={showUserAuthModal} 
        onClose={() => {
          setShowUserAuthModal(false);
          setFromRegister(false);
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
        }}
      />
    </div>
  );
};

export default Reviews;

