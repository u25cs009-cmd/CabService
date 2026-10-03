import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDriverAuth } from './DriverAuthContext';

export default function DriverLayout({ children }) {
  const { driver, logout } = useDriverAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/driver', label: 'Home', icon: '🏠' },
    { path: '/driver/active-trip', label: 'Active Trip', icon: '🚖' },
    { path: '/driver/history', label: 'History', icon: '📜' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/driver/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif', paddingBottom: '70px' }}>
      <Helmet>
        <title>Driver App - Pi-Pip-Pip Cabs</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Top Mobile Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #1e293b',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.4rem' }}>🚖</span>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', letterSpacing: '-0.5px' }}>
              Pi-Pip-Pip Driver
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {driver?.name || 'Driver'} • {driver?.vehicleNumber || 'Vehicle'}
            </div>
          </div>
        </div>

        {/* Online Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            background: driver?.isOnline ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: driver?.isOnline ? '#4ade80' : '#fca5a5',
            border: `1px solid ${driver?.isOnline ? '#22c55e' : '#ef4444'}`
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: driver?.isOnline ? '#22c55e' : '#ef4444'
            }}
          />
          {driver?.isOnline ? 'ONLINE' : 'OFFLINE'}
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: '#1e293b',
          borderTop: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '65px',
          maxWidth: '600px',
          margin: '0 auto'
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                color: isActive ? '#f59e0b' : '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                width: '25%',
                height: '100%'
              }}
            >
              <span style={{ fontSize: '1.25rem', marginBottom: '2px' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '0.75rem',
            fontWeight: 500,
            cursor: 'pointer',
            width: '25%',
            height: '100%'
          }}
        >
          <span style={{ fontSize: '1.25rem', marginBottom: '2px' }}>🚪</span>
          Logout
        </button>
      </nav>
    </div>
  );
}
