'use strict';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validatePassword, validatePasswordMatch } from '../utils/validators';
import { cleanPhoneNumber, limitTextLength } from '../utils/textUtils';
import '../styles/Modal.css';

const UserAuthModal = ({ isOpen, onClose, fromRegister = false, onGoBack, onAuthSuccess }) => {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(!fromRegister);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setIsLogin(!fromRegister);
  }, [fromRegister]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    let value = e.target.value;

    if (e.target.name === 'phone') {
      value = cleanPhoneNumber(value);
      value = limitTextLength(value, 9);
    }

    if (e.target.name === 'password') {
      const passwordErrorMsg = validatePassword(value);
      setPasswordError(passwordErrorMsg);
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isLogin) {
      const passwordValidation = validatePassword(formData.password);
      if (passwordValidation) {
        setError(passwordValidation);
        setLoading(false);
        return;
      }
      
      if (!validatePasswordMatch(formData.password, formData.password_confirmation)) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }
    }

    let result;
    
    if (isLogin) {
      result = await login({
        email: formData.email,
        password: formData.password
      });
    } else {
      result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone: formData.phone || null
      });
    }
    
    if (result.success) {
      // Limpiar el formulario después de un registro/login exitoso
      resetForm();
      
      if (result.isBarbero) {
        navigate('/barbero/citas', { replace: true });
        onClose();
        return;
      }

      // Cerrar el modal después de un registro/login exitoso
      // El usuario ya está autenticado, no necesitamos mostrar el modal de inicio de sesión
      if (onAuthSuccess) {
        onAuthSuccess();
      } else {
        onClose();
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      phone: ''
    });
    setError('');
    setPasswordError('');
  };

  const handleToggle = (loginMode) => {
    setIsLogin(loginMode);
    resetForm();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content auth-modal">
        <div className="modal-header">
          {fromRegister && (
            <button className="modal-back" onClick={onGoBack}>
              &lt;
            </button>
          )}
          <h2>ZetaCuts - Usuario</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {!fromRegister && (
            <div className="auth-toggle">
              <button 
                className={isLogin ? 'active' : ''}
                onClick={() => handleToggle(true)}
                disabled={loading}
              >
                Iniciar Sesión
              </button>
              <button 
                className={!isLogin ? 'active' : ''}
                onClick={() => handleToggle(false)}
                disabled={loading}
              >
                Registrarse
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            )}
            
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />

            {!isLogin && (
              <input
                type="tel"
                name="phone"
                placeholder="Teléfono (opcional, máx. 9 dígitos)"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
                pattern="[0-9]{1,9}"
                title="Solo se permiten números (máximo 9 dígitos)"
                maxLength="9"
              />
            )}
            
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={!isLogin ? "Contraseña (máx. 12 caracteres, 1 mayúscula, 1 número)" : "Contraseña"}
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                maxLength={12}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                tabIndex={-1}
              >
                <span className="material-icons">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {!isLogin && passwordError && (
              <div className="password-error-message">
                {passwordError}
              </div>
            )}

            {!isLogin && (
              <div className="password-input-wrapper">
                <input
                  type={showPasswordConfirmation ? "text" : "password"}
                  name="password_confirmation"
                  placeholder="Confirmar contraseña"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  disabled={loading}
                  tabIndex={-1}
                >
                  <span className="material-icons">
                    {showPasswordConfirmation ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            )}
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading 
                ? (isLogin ? 'Iniciando sesión...' : 'Registrando...') 
                : (isLogin ? 'Entrar' : 'Registrarse')
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserAuthModal;