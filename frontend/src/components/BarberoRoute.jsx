import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BarberoRoute = ({ children }) => {
  const { user, loading, initialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !initialized) {
      return;
    }

const isBarbero = user?.is_barbero === true || 
                     (user?.email && typeof user.email === 'string' && user.email.toLowerCase().endsWith('@barbero.com'));

if (isBarbero) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/barbero/citas') {
        navigate('/barbero/citas', { replace: true });
      }
    }
  }, [user, loading, initialized, navigate]);

const isBarbero = user?.is_barbero === true || 
                   (user?.email && typeof user.email === 'string' && user.email.toLowerCase().endsWith('@barbero.com'));

if (isBarbero && window.location.pathname !== '/barbero/citas') {
    return null;
  }

  return children;
};

export default BarberoRoute;

