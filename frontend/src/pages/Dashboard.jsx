import React, { useState } from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [user] = useState({
    name: 'Usuario Demo',
    points: 45,
    email: 'usuario@demo.com'
  });

  const [appointments] = useState([
    {
      id: 1,
      date: '2025-02-01',
      time: '10:00',
      barbershop: 'Barbería Central',
      barber: 'Carlos Mendez',
      service: 'Corte + Barba',
      status: 'confirmada'
    }
  ]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Mi Dashboard</h1>
        <div className="user-info">
                          <span>Hola, {user.name}</span>
          <div className="points">
            <span className="points-count">{user.points}</span>
            <span className="points-label">puntos</span>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <section className="appointments-section">
            <h2>Mis Citas</h2>
            {appointments.length > 0 ? (
              <div className="appointments-list">
                {appointments.map(appointment => (
                  <div key={appointment.id} className="appointment-card">
                    <div className="appointment-date">
                      {appointment.date} - {appointment.time}
                    </div>
                    <div className="appointment-details">
                      <strong>{appointment.barbershop}</strong>
                      <span>Barbero: {appointment.barber}</span>
                      <span>Servicio: {appointment.service}</span>
                    </div>
                    <div className={`appointment-status ${appointment.status}`}>
                      {appointment.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No tienes citas programadas</p>
            )}
            <button className="btn btn-primary">Reservar Nueva Cita</button>
          </section>

          <section className="points-section">
            <h2>Sistema de Puntos</h2>
            <div className="points-card">
              <div className="points-display">
                <span className="current-points">{user.points}</span>
                <span className="points-goal">/ 100</span>
              </div>
              <div className="points-progress">
                <div 
                  className="progress-bar" 
                  style={{width: `${(user.points / 100) * 100}%`}}
                ></div>
              </div>
              <p>¡Te faltan {100 - user.points} puntos para un corte gratis!</p>
              <div className="points-info">
                <small>• Corte normal: 10 puntos</small>
                <small>• Corte + barba: 15 puntos</small>
                <small>• 100 puntos = 1 corte gratis</small>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;