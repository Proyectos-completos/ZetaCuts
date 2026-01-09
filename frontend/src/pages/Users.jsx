import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import UserMenu from '../components/UserMenu';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';
import '../styles/Barberos.css';
import '../styles/Home.css';
import '../styles/Users.css';

const Users = () => {
  const { user, logout, loading: authLoading, initialized } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchId, setSearchId] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); 
  const [filterType, setFilterType] = useState('all'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    if (!user?.is_admin) {
      navigate('/');
      return;
    }

    loadUsers();
  }, [user, authLoading, initialized, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        const usersList = response.data.data.users || [];
        setAllUsers(usersList);
        setUsers(usersList);
      } else {
        setError(response.data.message || 'Error al cargar usuarios');
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    let filtered = [...allUsers];

    if (searchName.trim()) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchId.trim()) {
      filtered = filtered.filter(user => 
        user.id.toString().includes(searchId.trim())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(user => {
        
        const isBarbero = Boolean(user.is_barbero);
        const isAdmin = Boolean(user.is_admin);
        
        if (filterType === 'administrador') {
          return isAdmin === true;
        } else if (filterType === 'barbero') {
          return isBarbero === true && !isAdmin;
        } else if (filterType === 'cliente') {
          return isBarbero === false && !isAdmin;
        }
        return true;
      });
    }

    filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.id - b.id; 
      } else {
        return b.id - a.id; 
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset a la primera página cuando cambian los filtros
  }, [searchName, searchId, sortOrder, filterType, allUsers]);

  // Paginación
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;

  // Actualizar users con los usuarios paginados cuando cambian los filtros o la página
  useEffect(() => {
    const paginated = filteredUsers.slice(startIndex, endIndex);
    setUsers(paginated);
  }, [filteredUsers, currentPage, startIndex, endIndex]);

  // Scroll hacia arriba cuando cambia la página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteClick = (userId, userName) => {
    setUserToDelete({ id: userId, name: userName });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setDeletingUserId(userToDelete.id);
    setShowDeleteModal(false);
    
    try {
      const response = await api.delete(`/users/${userToDelete.id}`);
      if (response.data.success) {
        // Recargar la lista de usuarios
        await loadUsers();
        setToast({
          isVisible: true,
          message: 'Usuario eliminado exitosamente',
          type: 'success'
        });
      } else {
        setToast({
          isVisible: true,
          message: response.data.message || 'Error al eliminar usuario',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar usuario';
      setToast({
        isVisible: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setDeletingUserId(null);
      setUserToDelete(null);
    }
  };

  if (authLoading || !initialized) {
    return (
      <div className="home barberos-page">
        <div className="loading-container">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user?.is_admin) {
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
                <Link to="/barberos" className="nav-link" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Barberos</Link>
                <Link to="/usuarios" className="nav-link active" onClick={(e) => { e.stopPropagation(); handleNavLinkClick(e); }}>Usuarios</Link>
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

      <div className="barber-stickers" style={{ marginBottom: '4rem' }}>
        <img src="/imagenes/barberia stickers/sticker 1.webp" alt="Barber sticker" className="sticker sticker-page sticker-1" style={{ margin: '2rem' }} />
        <img src="/imagenes/barberia stickers/sticker 2.webp" alt="Barber sticker" className="sticker sticker-page sticker-2" style={{ margin: '2rem' }} />
        <img src="/imagenes/barberia stickers/sticker 3.webp" alt="Barber sticker" className="sticker sticker-page sticker-3" style={{ margin: '2rem' }} />
        <img src="/imagenes/barberia stickers/sticker 4.webp" alt="Barber sticker" className="sticker sticker-page sticker-4" style={{ margin: '2rem' }} />
        <img src="/imagenes/barberia stickers/sticker 5.webp" alt="Barber sticker" className="sticker sticker-page sticker-5" style={{ margin: '2rem' }} />
      </div>

      <main className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto', paddingTop: '6rem' }}>
        <div className="users-page-header barberos-header">
          <h1>GESTIÓN DE USUARIOS</h1>
        </div>

        {}
        <div className="users-filters-container">
          <h3 style={{ marginBottom: '1rem', color: '#495057', fontSize: '1.1rem' }}>Filtros de Búsqueda</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                Buscar por Nombre
              </label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Escribe el nombre del usuario..."
                className="users-filter-input"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                Buscar por ID
              </label>
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Escribe el ID del usuario..."
                className="users-filter-input"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                Ordenar por ID
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="users-filter-select"
              >
                <option value="desc">Mayor a Menor (ID)</option>
                <option value="asc">Menor a Mayor (ID)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#495057', fontWeight: '500' }}>
                Filtrar por Tipo
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="users-filter-select"
              >
                <option value="all">Todos</option>
                <option value="administrador">Administrador</option>
                <option value="cliente">Cliente</option>
                <option value="barbero">Barbero</option>
              </select>
            </div>
          </div>
          {(searchName || searchId || filterType !== 'all') && (
            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  setSearchName('');
                  setSearchId('');
                  setFilterType('all');
                }}
                className="users-clear-filters-btn"
              >
                Limpiar filtros
              </button>
              <span style={{ color: '#6c757d', fontSize: '0.9rem', marginLeft: '0.5rem' }}>
                {users.length} {users.length === 1 ? 'usuario encontrado' : 'usuarios encontrados'}
                <span className="users-results-badge">{users.length}</span>
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="users-loading">
            <p style={{ marginLeft: '1rem' }}>Cargando usuarios...</p>
          </div>
        ) : error ? (
          <div className="users-error-message">
            {error}
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Tipo</th>
                  <th>Puntos</th>
                  <th>Fecha de Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="users-no-results">
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  users.map((userItem, index) => (
                    <tr key={userItem.id} style={{ animationDelay: `${index * 0.05}s` }}>
                      <td>{userItem.id}</td>
                      <td style={{ fontWeight: '500' }}>{userItem.name}</td>
                      <td>{userItem.email}</td>
                      <td style={{ color: userItem.phone ? '#495057' : '#adb5bd', fontStyle: userItem.phone ? 'normal' : 'italic' }}>
                        {userItem.phone || 'No especificado'}
                      </td>
                      <td>
                        <span className={`users-type-badge ${userItem.is_admin ? 'administrador' : userItem.is_barbero ? 'barbero' : 'cliente'}`}>
                          {userItem.is_admin ? 'Administrador' : userItem.is_barbero ? 'Barbero' : 'Cliente'}
                        </span>
                      </td>
                      <td>{userItem.points || 0}</td>
                      <td style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                        {formatDate(userItem.created_at)}
                      </td>
                      <td>
                        {!userItem.is_admin && !userItem.is_barbero && (
                          <button
                            onClick={() => handleDeleteClick(userItem.id, userItem.name)}
                            disabled={deletingUserId === userItem.id}
                            style={{
                              padding: '0.4rem 0.8rem',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: deletingUserId === userItem.id ? 'not-allowed' : 'pointer',
                              fontSize: '0.875rem',
                              opacity: deletingUserId === userItem.id ? 0.6 : 1
                            }}
                            title="Eliminar usuario"
                          >
                            {deletingUserId === userItem.id ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        )}
                        {(userItem.is_admin || userItem.is_barbero) && (
                          <span style={{ color: '#6c757d', fontSize: '0.875rem' }}>No se puede eliminar</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="users-results-count">
          {searchName || searchId || filterType !== 'all' ? (
            <>
              Mostrando <strong>{startIndex + 1}-{Math.min(endIndex, filteredUsers.length)}</strong> de <strong>{filteredUsers.length}</strong> usuarios encontrados
            </>
          ) : (
            <>
              Mostrando <strong>{startIndex + 1}-{Math.min(endIndex, filteredUsers.length)}</strong> de <strong>{filteredUsers.length}</strong> usuarios
            </>
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '1rem', 
            marginTop: '2rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: currentPage === 1 ? '#e9ecef' : '#6c757d',
                color: currentPage === 1 ? '#adb5bd' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: currentPage === 1 ? 0.6 : 1
              }}
            >
              <span>←</span> ANTERIOR
            </button>

            <span style={{ color: '#495057', fontSize: '0.875rem', fontWeight: '500' }}>
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </span>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: currentPage === totalPages ? '#e9ecef' : '#dc3545',
                color: currentPage === totalPages ? '#adb5bd' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: currentPage === totalPages ? 0.6 : 1
              }}
            >
              SIGUIENTE <span>→</span>
            </button>
          </div>
        )}
      </main>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Eliminación"
        message={userToDelete ? `¿Estás seguro de que quieres eliminar al usuario "${userToDelete.name}" (ID: ${userToDelete.id})? Esta acción no se puede deshacer.` : ''}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="warning"
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
};

export default Users;

