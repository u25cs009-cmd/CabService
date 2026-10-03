import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export default function CustomerLoginPage() {
  const { login } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Helmet>
        <title>Customer Login | Pi-Pip-Pip Cab Service</title>
        <meta name="description" content="Sign in to your Pi-Pip-Pip Cab account to manage rides, track history, and access exclusive coupon discounts." />
      </Helmet>
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 my-10">
        <div className="max-w-md w-full">
          <Card className="shadow-lg border border-slate-200/90 bg-white p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-900 flex items-center justify-center mx-auto mb-3">
                <LogIn className="w-6 h-6 text-amber-700" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">Welcome Back</h1>
              <p className="text-xs text-slate-500 mt-1">Sign in to your Pi-Pip-Pip customer account</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="login-email"
                type="email"
                label="Email Address"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
              />

              <Input
                id="login-password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
              />

              <div className="flex items-center justify-between text-xs">
                <Link to="/forgot-password" className="text-amber-700 font-bold hover:underline">
                  Forgot Password?
                </Link>
              </div>

              <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting} icon={LogIn}>
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-amber-700 font-bold hover:underline inline-flex items-center gap-0.5">
                <span>Create an Account</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
