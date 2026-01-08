import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/ProductDetail.css';
import { productService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from '../components/UserMenu';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x600.png?text=ZetaCuts';

const ProductDetail = () => {
  const { productIdOrSlug } = useParams();
  const navigate = useNavigate();
  const { user, logout, initialized } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoomState, setZoomState] = useState({
    active: false,
    x: 50,
    y: 50,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = useMemo(() => user?.is_admin ?? false, [user]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await productService.getByIdOrSlug(productIdOrSlug);
        if (response?.success && response?.data) {
          setProduct(response.data);
        } else {
          setError('No encontramos el producto.');
        }
      } catch (err) {
        console.error('Error loading product', err);
        if (err.response?.status === 404) {
          setError('No encontramos el producto.');
        } else if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          setError('El servidor está tardando en responder. Por favor, espera unos segundos e intenta nuevamente.');
        } else if (err.response?.status >= 500) {
          setError('Error del servidor. Por favor, intenta nuevamente en unos momentos.');
        } else {
          setError('No pudimos cargar el producto. Verifica tu conexión e intenta nuevamente.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (productIdOrSlug) {
      fetchProduct();
    }
  }, [productIdOrSlug]);

  const formatPrice = (value) => {
    if (value === null || value === undefined) return '—';
    const numericValue = Number(value);
    if (Number.isNaN(numericValue) || numericValue <= 0) {
      return 'Consultar';
    }
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(numericValue);
  };

  const highlightImportantWords = (text) => {
    if (!text) return text;
    
    // Palabras importantes a destacar (verbos, adjetivos y sustantivos clave)
    const importantWords = [
      // Verbos de acción
      'añade', 'proporciona', 'mantiene', 'define', 'crea', 'estimula', 'frena', 'ayuda',
      'permite', 'ofrece', 'garantiza', 'protege', 'nutre', 'hidrata', 'repara',
      // Adjetivos importantes
      'nutritiva', 'hidratados', 'duradera', 'instantáneamente', 'natural', 'flexible',
      'fuerte', 'intensivo', 'premium', 'profesional', 'efectivo', 'completo',
      // Sustantivos clave
      'volumen', 'textura', 'fijación', 'nutrición', 'rizos', 'cabello', 'peinados',
      'cuerpo', 'crecimiento', 'densidad', 'tratamiento', 'acabado', 'residuos',
      'encrespamiento', 'activos', 'ingredientes'
    ];

    // Dividir el texto preservando espacios y puntuación
    const parts = [];
    let currentIndex = 0;
    
    // Crear expresión regular para buscar palabras completas
    const regex = new RegExp(
      `\\b(${importantWords.join('|')})\\b`,
      'gi'
    );
    
    let match;
    let lastIndex = 0;
    
    while ((match = regex.exec(text)) !== null) {
      // Agregar texto antes de la coincidencia
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Agregar la palabra importante en negrita
      parts.push(<strong key={`highlight-${match.index}`}>{match[0]}</strong>);
      
      lastIndex = regex.lastIndex;
    }
    
    // Agregar el texto restante
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  const handleImageMouseMove = (event) => {
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - left) / width) * 100;
    const y = ((event.clientY - top) / height) * 100;
    setZoomState({
      active: true,
      x,
      y,
    });
  };

  const handleImageMouseLeave = () => {
    setZoomState((prev) => ({
      ...prev,
      active: false,
    }));
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
    <div className="product-detail-page">
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
            <Link to="/" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>
              Inicio
            </Link>
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
            <Link to="/information" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>
              Sobre Nosotros
            </Link>
            <Link to="/tienda" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>
              Tienda
            </Link>
            <Link to="/reviews" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>
              Reseñas
            </Link>
            <Link to="/recomendaciones" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>
              Recomendaciones
            </Link>
            {isAdmin && (
              <>
                <Link to="/barberos" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>
                  Barberos
                </Link>
                <Link to="/usuarios" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>
                  Usuarios
                </Link>
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

      <div className="barber-stickers">
        <img src="/imagenes/barberia stickers/sticker 1.webp" alt="Barber sticker" className="sticker sticker-page sticker-1" />
        <img src="/imagenes/barberia stickers/sticker 2.webp" alt="Barber sticker" className="sticker sticker-page sticker-2" />
        <img src="/imagenes/barberia stickers/sticker 3.webp" alt="Barber sticker" className="sticker sticker-page sticker-3" />
        <img src="/imagenes/barberia stickers/sticker 4.webp" alt="Barber sticker" className="sticker sticker-page sticker-4" />
        <img src="/imagenes/barberia stickers/sticker 5.webp" alt="Barber sticker" className="sticker sticker-page sticker-5" />
        <img src="/imagenes/barberia stickers/sticker 1.webp" alt="Barber sticker" className="sticker sticker-page sticker-6" />
      </div>

      <main className="product-detail-main container">
        {loading ? (
          <div className="product-detail-loading">Cargando producto...</div>
        ) : error ? (
          <div className="product-detail-error">{error}</div>
        ) : product ? (
          <section className="product-detail-card">
            <div className="product-detail-images">
              <div
                className={`product-detail-main-image ${zoomState.active ? 'zoomed' : ''}`}
                style={{
                  '--zoom-x': `${zoomState.x}%`,
                  '--zoom-y': `${zoomState.y}%`,
                }}
                onMouseMove={handleImageMouseMove}
                onMouseLeave={handleImageMouseLeave}
              >
                <img
                  src={product.image_url || PLACEHOLDER_IMAGE}
                  alt={product.name}
                />
              </div>
              {product.gallery && product.gallery.length > 0 && (
                <div className="product-detail-gallery">
                  {product.gallery.map((image, index) => (
                    <img key={image || index} src={image} alt={`${product.name} ${index + 1}`} />
                  ))}
                </div>
              )}
            </div>
            <div className="product-detail-info">
              <p className="eyebrow">Producto profesional</p>
              <h1>{product.name}</h1>
              <p className="product-detail-price">{formatPrice(product.price)}</p>
              <p className="product-detail-description">
                {product.description 
                  ? highlightImportantWords(product.description)
                  : 'Próximamente agregaremos la descripción completa.'}
              </p>

              <div className="product-detail-meta">
                {product.category && (
                  <div className="meta-item">
                    <span>Categoría</span>
                    <strong>{product.category}</strong>
                  </div>
                )}
                {product.brand && (
                  <div className="meta-item">
                    <span>Marca</span>
                    <strong>{product.brand}</strong>
                  </div>
                )}
                <div className="meta-item">
                  <span>Stock</span>
                  <strong>{product.stock > 0 ? `${product.stock} unidades` : 'Sin stock'}</strong>
                </div>
              </div>

              <div className="product-detail-actions">
                <Link to="/tienda" className="btn btn-back-to-store">
                  Volver a la tienda
                </Link>
                {product.purchase_url && (
                  <a
                    className="btn btn-primary"
                    href={product.purchase_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Comprar
                  </a>
                )}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
};

export default ProductDetail;

