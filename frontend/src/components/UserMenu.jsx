import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChangeEmailModal from './ChangeEmailModal';
import ProfileModal from './ProfileModal';
import NotificationBell from './NotificationBell';
import '../styles/Home.css';

const UserMenu = ({ showToast }) => {
  const { user, logout } = useAuth();

const handleToast = showToast || (() => {});
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const userMenuRef = useRef(null);

useEffect(() => {
    const checkMobile = () => {
      const isMobileWidth = window.innerWidth <= 1100;
      setIsMobile(isMobileWidth);
      
      if (!isMobileWidth) {
        setShowUserMenu(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

useEffect(() => {
    if (!showUserMenu) return;

    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [showUserMenu]);

  if (!user) return null;

  return (
    <>
      <div className="user-menu">
        {user.is_admin && <NotificationBell />}
        <div className="user-menu-dropdown" ref={userMenuRef} style={{ position: 'relative' }}>
          <span 
            className="user-name user-name-clickable"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowUserMenu(!showUserMenu);
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="user-greeting">Hola, {user.name}</span>
            {!(user.is_barbero || (user.email && user.email.toLowerCase().endsWith('@barbero.com'))) && (
              <span className="points-display">{user.points || 0} pts</span>
            )}
            <span className="dropdown-arrow" style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>
              {showUserMenu ? '▲' : '▼'}
            </span>
          </span>
          {showUserMenu && (
            <div className="user-menu-dropdown-content">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowProfileModal(true);
                  setShowUserMenu(false);
                }}
                className="user-menu-item"
                style={{ pointerEvents: 'auto' }}
              >
                Perfil
              </button>
              {!(user.is_barbero || (user.email && user.email.toLowerCase().endsWith('@barbero.com'))) && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowChangeEmailModal(true);
                    setShowUserMenu(false);
                  }}
                  className="user-menu-item"
                  style={{ pointerEvents: 'auto' }}
                >
                  Cambiar email
                </button>
              )}
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  logout();
                  setShowUserMenu(false);
                }}
                className="user-menu-item user-menu-item-danger"
                style={{ pointerEvents: 'auto' }}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <ChangeEmailModal
        isOpen={showChangeEmailModal}
        onClose={() => setShowChangeEmailModal(false)}
        showToast={handleToast}
      />
    </>
  );
};

export default UserMenu;

