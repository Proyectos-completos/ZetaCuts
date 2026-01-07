import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import UserAuth from './pages/UserAuth';
import Dashboard from './pages/Dashboard';
import Information from './pages/Information';
import Appointments from './pages/Appointments';
import Barberos from './pages/Barberos';
import BarberoAppointments from './pages/BarberoAppointments';
import Store from './pages/Store';
import ProductDetail from './pages/ProductDetail';
import Reviews from './pages/Reviews';
import Recommendations from './pages/Recommendations';
import Users from './pages/Users';
import MarketStudy from './pages/MarketStudy';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import BarberoRoute from './components/BarberoRoute';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  console.log('App component rendered'); 
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <ScrollToTop />
          <div className="App">
            <div className="main-content">
              <Routes>
                <Route path="/barbero/citas" element={<BarberoAppointments />} />
                <Route path="/*" element={
                  <BarberoRoute>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/user-auth" element={<UserAuth />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/information" element={<Information />} />
                      <Route path="/appointments" element={<Appointments />} />
                      <Route path="/barberos" element={<Barberos />} />
                      <Route path="/tienda" element={<Store />} />
                      <Route path="/tienda/:productIdOrSlug" element={<ProductDetail />} />
                      <Route path="/reviews" element={<Reviews />} />
                      <Route path="/recomendaciones" element={<Recommendations />} />
                      <Route path="/usuarios" element={<Users />} />
                      <Route path="/estudio-mercado" element={<MarketStudy />} />
                    </Routes>
                  </BarberoRoute>
                } />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;