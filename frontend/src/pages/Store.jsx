'use strict';

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/Store.css';
import { productService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/formatters';
import UserMenu from '../components/UserMenu';

const ITEMS_PER_PAGE = 6;
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400.png?text=ZetaCuts';

const Store = () => {
  const { user, logout, initialized } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const [availableFilters, setAvailableFilters] = useState({
    categories: [],
    brands: [],
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * Obtiene las categorías y marcas disponibles de todos los productos
   * para poblar los filtros de búsqueda
   * @returns {Promise<void>}
   */
  const fetchAvailableFilters = async () => {
    try {
      const response = await productService.list({
        per_page: 1000, 
      });
      const paginated = response?.data ?? {};
      const items = Array.isArray(paginated) ? paginated : paginated.data ?? [];

      const categoriesSet = new Set();
      const brandsSet = new Set();

      items.forEach((product) => {
        if (product.category) categoriesSet.add(product.category);
        if (product.brand) brandsSet.add(product.brand);
      });

      setAvailableFilters({
        categories: Array.from(categoriesSet).sort(),
        brands: Array.from(brandsSet).sort(),
      });
    } catch (err) {
      console.error('Error fetching available filters', err);
    }
  };

  /**
   * Obtiene la lista de productos con filtros, búsqueda y paginación
   * @param {number} [pageParam=1] - Número de página a obtener
   * @returns {Promise<void>}
   */
  const fetchProducts = async (pageParam = 1) => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: pageParam,
        per_page: ITEMS_PER_PAGE,
        sort_by: sortBy,
        sort_direction: sortDirection,
      };

      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (brand) params.brand = brand;

      const response = await productService.list(params);
      const paginated = response?.data ?? {};
      const items = Array.isArray(paginated) ? paginated : paginated.data ?? [];

      setProducts(items);
      setMeta({
        current_page: paginated.current_page ?? pageParam,
        last_page: paginated.last_page ?? 1,
        total: paginated.total ?? items.length,
      });
    } catch (err) {
      console.error('Error fetching products', err);
      setError('No pudimos cargar los productos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableFilters();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, category, brand, sortBy, sortDirection]);

  useEffect(() => {
    fetchProducts(page);
  }, [page, search, category, brand, sortBy, sortDirection]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const isAdmin = useMemo(() => user?.is_admin ?? false, [user]);

  /**
   * Maneja el cambio de página en la paginación
   * @param {number} nextPage - Número de página a la que cambiar
   * @returns {void}
   */
  const handlePageChange = (nextPage) => {
    if (nextPage >= 1 && nextPage <= (meta.last_page ?? 1)) {
      setPage(nextPage);
    }
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
    <div className="store-page">
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
            <Link to="/tienda" className="nav-link active" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>
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
                <Link to="/estudio-mercado" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>
                  Mercado
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

      <section className="store-hero">
        <div className="store-hero-content">
          <h1>Tu cabello merece lo mejor</h1>
          <p>
            Descubre nuestra selección de productos premium para el cuidado del cabello.
           
          </p>
        </div>
      </section>

      <main className="store-content container">
        <div className="store-controls">
          <div className="filters">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Todas las categorías</option>
              {availableFilters.categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">Todas las marcas</option>
              {availableFilters.brands.map((brandOption) => (
                <option key={brandOption} value={brandOption}>
                  {brandOption}
                </option>
              ))}
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Ordenar por nombre</option>
              <option value="price">Ordenar por precio</option>
              <option value="created_at">Más recientes</option>
            </select>
            <select value={sortDirection} onChange={(e) => setSortDirection(e.target.value)}>
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </div>

        {error && <div className="store-error">{error}</div>}

        {loading ? (
          <div className="store-loading">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="store-empty">
            <h3>No encontramos productos.</h3>
            <p>Proba ajustando los filtros o agrega nuevos productos desde el panel de admin.</p>
          </div>
        ) : (
          <>
            <section className="product-grid">
              {products.map((product) => (
                <article
                  key={product.id}
                  className={`product-card ${!product.is_active ? 'product-card--inactive' : ''}`}
                >
                  <div className="product-image">
                    <img
                      src={product.image_url || PLACEHOLDER_IMAGE}
                      alt={product.name}
                      loading="lazy"
                    />
                    {!product.is_active && <span className="badge badge--inactive">Inactivo</span>}
                    {product.stock === 0 && <span className="badge badge--stock">Sin stock</span>}
                  </div>
                  <div className="product-body">
                    <div className="product-meta">
                      {product.category && <span className="chip">{product.category}</span>}
                      {product.brand && <span className="chip chip--muted">{product.brand}</span>}
                    </div>
                    <h3 title={product.name}>{product.name}</h3>
                    <div className="product-footer">
                      <div>
                        <span className="product-price">{formatPrice(product.price)}</span>
                      </div>
                      <Link
                        className="btn btn-primary"
                        to={`/tienda/${product.slug ?? product.id}`}
                      >
                        Ver producto
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <div className="store-pagination">
              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(meta.current_page - 1)}
                disabled={meta.current_page <= 1}
              >
                ← Anterior
              </button>
              <span>
                Página {meta.current_page} de {meta.last_page}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(meta.current_page + 1)}
                disabled={meta.current_page >= meta.last_page}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Store;

