import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { statsService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from '../components/UserMenu';
import '../styles/Home.css';
import '../styles/MarketStudy.css';

const MarketStudy = () => {
  const { user, initialized } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    chartData: [],
    summary: {
      totalIncome: 0,
      totalAppointments: 0,
      cancelledAppointments: 0,
      barberStats: [],
      topBarber: null
    }
  });
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (initialized && (!user || !user.is_admin)) {
      navigate('/');
      return;
    }
    
    fetchStats();
  }, [user, initialized, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await statsService.getMarketStudy();
      if (response.success) {
        setData(response.data);
      } else {
        setError('No se pudieron cargar las estadísticas');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const pieData = data.chartData.length > 0 ? [
    { name: 'Corte', value: data.chartData.reduce((acc, curr) => acc + curr.services.corte, 0) },
    { name: 'Corte + Barba', value: data.chartData.reduce((acc, curr) => acc + curr.services.corte_barba, 0) },
    { name: 'Tinte', value: data.chartData.reduce((acc, curr) => acc + curr.services.tinte, 0) },
    { name: 'Otros', value: data.chartData.reduce((acc, curr) => acc + curr.services.otros, 0) },
  ].filter(item => item.value > 0) : [];

  return (
    <div className="market-study-page">
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
                <UserMenu showToast={() => {}} />
              </div>
            )}
            <Link to="/" className="nav-link" onClick={handleNavLinkClick}>Inicio</Link>
            <Link 
              to="/appointments" 
              className="nav-link" 
              onClick={handleNavLinkClick}
            >
              Citas
            </Link>
            <Link to="/information" className="nav-link" onClick={handleNavLinkClick}>Sobre Nosotros</Link>
            <Link to="/tienda" className="nav-link" onClick={handleNavLinkClick}>Tienda</Link>
            <Link to="/reviews" className="nav-link" onClick={handleNavLinkClick}>Reseñas</Link>
            <Link to="/recomendaciones" className="nav-link" onClick={handleNavLinkClick}>Recomendaciones</Link>
            {initialized && user?.is_admin && (
              <>
                <Link to="/barberos" className="nav-link" onClick={handleNavLinkClick}>Barberos</Link>
                <Link to="/usuarios" className="nav-link" onClick={handleNavLinkClick}>Usuarios</Link>
                <Link to="/estudio-mercado" className="nav-link active" onClick={handleNavLinkClick}>Mercado</Link>
              </>
            )}
          </nav>

          <div className="navbar-actions desktop-user-menu">
            {!initialized ? (
              <div className="loading-auth">
                <div className="loading-spinner"></div>
              </div>
            ) : user ? (
              <UserMenu showToast={() => {}} />
            ) : (
              <button onClick={() => navigate('/?login=1')} className="btn btn-create-account">
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="market-study-content">
        <div className="container">
          <div className="stats-header">
            <h1>ESTUDIO DE MERCADO Y BENEFICIOS</h1>
            <p>Visualización del rendimiento mensual de ZetaCuts</p>
            {loading && <div className="loading-spinner-small" style={{ margin: '1rem auto' }}></div>}
          </div>

          {error ? (
            <div className="error-message" style={{ textAlign: 'center', color: '#dc2626', padding: '2rem' }}>{error}</div>
          ) : (
            <>
              <div className="stats-summary-cards">
                <div className="stat-card income">
                  <span className="material-icons">payments</span>
                  <div className="stat-info">
                    <h3>Beneficios Totales</h3>
                    <p className="stat-value">{loading ? '...' : `${data.summary.totalIncome} €`}</p>
                    <small>Últimos 12 meses (estimado)</small>
                  </div>
                </div>
                <div className="stat-card appointments">
                  <span className="material-icons">event</span>
                  <div className="stat-info">
                    <h3>Citas Totales</h3>
                    <p className="stat-value">{loading ? '...' : data.summary.totalAppointments}</p>
                    <small>Citas registradas</small>
                  </div>
                </div>
                <div className="stat-card cancelled">
                  <span className="material-icons">event_busy</span>
                  <div className="stat-info">
                    <h3>Citas Canceladas</h3>
                    <p className="stat-value" style={{ color: '#dc3545' }}>{loading ? '...' : data.summary.cancelledAppointments}</p>
                    <small>No realizadas</small>
                  </div>
                </div>
                <div className="stat-card barbers-stats">
                  <span className="material-icons">content_cut</span>
                  <div className="stat-info" style={{ width: '100%' }}>
                    <h3>Barbero Estrella</h3>
                    {loading ? (
                      <p className="stat-value" style={{ fontSize: '1.2rem' }}>Cargando...</p>
                    ) : data.summary.topBarber ? (
                      <div style={{ margin: '0.5rem 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2d3748', textTransform: 'capitalize' }}>
                            {data.summary.topBarber.name}
                          </span>
                          <span className="material-icons" style={{ color: '#ffc107', fontSize: '1.8rem', background: 'none', padding: 0 }}>stars</span>
                        </div>
                        <p style={{ fontSize: '1rem', color: '#666', marginTop: '0.2rem' }}>
                          Líder con <strong>{data.summary.topBarber.total}</strong> cortes realizados
                        </p>
                      </div>
                    ) : (
                      <p style={{ fontSize: '1.1rem', color: '#718096', fontWeight: '600', marginTop: '0.5rem' }}>No hay datos de barberos</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="charts-grid">
                <div className="chart-container large">
                  <h3>Evolución de citas y beneficios mensuales</h3>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          interval={0} 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis yAxisId="left" orientation="left" stroke="#111" label={{ value: 'Citas', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#dc3545" label={{ value: 'Euros (€)', angle: 90, position: 'insideRight' }} />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="appointments" name="Nº de Citas" fill="#111" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="income" name="Beneficios (€)" fill="#dc3545" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default MarketStudy;

