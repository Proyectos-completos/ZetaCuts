import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();
  const isAdmin = user?.is_admin ?? false;

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <img 
              src="/imagenes/logoZ.png" 
              alt="ZetaCuts" 
              className="footer-logo"
            />
            <p className="footer-description">
              ZetaCuts, calidad que siempre buscas
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Navegación</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">Inicio</Link>
              </li>
              <li>
                <Link to="/appointments">Citas</Link>
              </li>
              <li>
                <Link to="/information">Sobre nosotros</Link>
              </li>
              <li>
                <Link to="/tienda">Tienda</Link>
              </li>
              <li>
                <Link to="/reviews">Reseñas</Link>
              </li>
              <li>
                <Link to="/recomendaciones">Recomendaciones</Link>
              </li>
              {isAdmin && (
                <>
                  <li>
                    <Link to="/barberos">Barberos</Link>
                  </li>
                  <li>
                    <Link to="/usuarios">Usuarios</Link>
                  </li>
                  <li>
                    <Link to="/estudio-mercado">Mercado</Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Contacto</h4>
            <ul className="footer-contact">
              <li>
                <span className="contact-icon material-icons" style={{ color: '#dc2626' }}>location_on</span>
                <span>Calle Mayor, 45</span>
              </li>
              <li>
                <span className="contact-icon material-icons" style={{ color: '#dc2626' }}>phone</span>
                <span>+34 123 456 789</span>
              </li>
              <li>
                <span className="contact-icon material-icons" style={{ color: '#dc2626' }}>email</span>
                <span>citas@zetacuts.com</span>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">Síguenos</h4>
            <div className="footer-social">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link social-link-facebook"
                aria-label="Facebook"
                title="Facebook"
              >
                <span className="material-icons">facebook</span>
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link social-link-instagram"
                aria-label="Instagram"
                title="Instagram"
              >
                <img src="https://imgs.search.brave.com/fdixCwGcmBDzCSruyeq6h2DEd90v87ZfzsCJMrcU4Lg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hc3Nl/dHMuc3RpY2twbmcu/Y29tL2ltYWdlcy82/MjhjOGFjZmJiZWMx/MTQ3NDNiZWQ0ZGUu/cG5n" alt="Instagram" />
              </a>
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link social-link-x"
                aria-label="X (Twitter)"
                title="X (Twitter)"
              >
                <img src="https://img.freepik.com/vector-premium/nuevo-logo-twitter-x-2023-vector-logo-twitter-x_715895-569.jpg?w=360" alt="X (Twitter)" />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} ZetaCuts. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

