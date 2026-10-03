import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useDriverAuth } from './DriverAuthContext';

export default function DriverProtectedRoute({ children }) {
  const { driverToken, driver, isLoading, changePassword } = useDriverAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f172a', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading Driver App...</p>
        </div>
      </div>
    );
  }

  if (!driverToken || !driver) {
    return <Navigate to="/driver/login" replace />;
  }

  // Force Change Password if mandatory flag is set
  if (driver.isMustChangePassword) {
    const handleChangePasswordSubmit = async (e) => {
      e.preventDefault();
      setError('');
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setIsUpdating(true);
      const res = await changePassword(newPassword);
      setIsUpdating(false);
      if (!res.success) {
        setError(res.message || 'Failed to update password.');
      }
    };

    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', padding: '2rem', maxWidth: '400px', width: '100%' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f59e0b' }}>🔒 Password Change Required</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Welcome, <strong>{driver.name}</strong>! As a security requirement for first-time login, please update your temporary password before proceeding to trip assignments.
          </p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleChangePasswordSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #475569', borderRadius: '0.5rem', color: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                style={{ width: '100%', padding: '0.75rem', background: '#0f172a', border: '1px solid #475569', borderRadius: '0.5rem', color: '#fff' }}
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              style={{ width: '100%', padding: '0.85rem', background: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
            >
              {isUpdating ? 'Updating Password...' : 'Save & Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return children;
}
