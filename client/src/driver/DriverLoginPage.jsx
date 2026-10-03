import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDriverAuth } from './DriverAuthContext';

export default function DriverLoginPage() {
  const { login, driverToken } = useDriverAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to home
  if (driverToken) {
    navigate('/driver', { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const res = await login(identifier, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/driver', { replace: true });
    } else {
      setError(res.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: 'sans-serif' }}>
      <Helmet>
        <title>Driver Login - Pi-Pip-Pip Cabs</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '1.25rem', padding: '2.25rem', maxWidth: '420px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚖</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b', margin: 0 }}>Driver Portal</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>Pi-Pip-Pip Cab Operations</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.4rem' }}>
              Email or Registered Phone
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. driver@pipippip.com or 9876543210"
              style={{ width: '100%', padding: '0.85rem 1rem', background: '#0f172a', border: '1px solid #475569', borderRadius: '0.65rem', color: '#fff', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '0.4rem' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '0.85rem 1rem', background: '#0f172a', border: '1px solid #475569', borderRadius: '0.65rem', color: '#fff', fontSize: '0.95rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '0.95rem', background: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '0.65rem', fontWeight: 800, fontSize: '1.05rem', cursor: 'pointer', transition: 'transform 0.1s' }}
          >
            {isSubmitting ? 'Authenticating...' : 'Driver Sign In ➔'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          Need driver credentials? Contact fleet dispatch office.
        </div>
      </div>
    </div>
  );
}
