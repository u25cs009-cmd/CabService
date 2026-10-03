import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Car, Lock, Mail, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { siteConfig } from '../../config/site';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/admin');
    } else {
      setErrorMessage(result.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-900 flex items-center justify-center p-4">
      <Helmet>
        <title>{`Admin Login - ${siteConfig.name}`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center mx-auto shadow-md shadow-amber-500/30">
            <Car className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{siteConfig.name} Admin</h1>
          <p className="text-xs text-slate-500 font-medium">Sign in to manage bookings, fleet & drivers</p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="admin-email"
            type="email"
            label="Admin Email"
            placeholder="admin@pipippip.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={Mail}
          />

          <Input
            id="admin-password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={Lock}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              icon={LogIn}
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </Button>
          </div>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-[11px] text-slate-400 font-medium">
          🔒 Secure Session • Unauthorized access is strictly logged
        </div>
      </div>
    </div>
  );
}
