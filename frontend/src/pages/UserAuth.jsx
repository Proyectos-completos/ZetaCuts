import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/Auth.css';

const UserAuth = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const fromRegister = searchParams.get('register') === 'true';
  
  const [isLogin, setIsLogin] = useState(!fromRegister);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('User auth:', formData);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>ZetaCuts - Usuario</h1>
        
        {!fromRegister && (
          <div className="auth-toggle">
            <button 
              className={isLogin ? 'active' : ''}
              onClick={() => setIsLogin(true)}
            >
              Iniciar Sesión
            </button>
            <button 
              className={!isLogin ? 'active' : ''}
              onClick={() => setIsLogin(false)}
            >
              Registrarse
            </button>
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
            />
          )}
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          
          <button type="submit" className="btn btn-primary">
            {isLogin ? 'Entrar' : 'Registrarse'}
          </button>
        </form>
        
        <a href="/" className="back-link">← Volver al inicio</a>
      </div>
    </div>
  );
};

export default UserAuth;