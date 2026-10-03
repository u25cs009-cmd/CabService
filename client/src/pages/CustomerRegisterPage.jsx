import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, Mail, Lock, Phone, UserPlus, AlertCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export default function CustomerRegisterPage() {
  const { register } = useCustomerAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await register(name, email, password, phone);
      navigate('/account', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Helmet>
        <title>Create Account | Pi-Pip-Pip Cab Service</title>
        <meta name="description" content="Sign up for a Pi-Pip-Pip Cab account to manage bookings, track cab status, and get exclusive coupon discounts." />
      </Helmet>
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 my-10">
        <div className="max-w-md w-full">
          <Card className="shadow-lg border border-slate-200/90 bg-white p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-900 flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-6 h-6 text-amber-700" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">Create Customer Account</h1>
              <p className="text-xs text-slate-500 mt-1">Book faster & manage your rides easily</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="reg-name"
                label="Full Name"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
              />

              <Input
                id="reg-email"
                type="email"
                label="Email Address"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
              />

              <Input
                id="reg-phone"
                type="tel"
                label="Phone Number"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={Phone}
                required
              />

              <Input
                id="reg-password"
                type="password"
                label="Password (min 6 chars)"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
              />

              <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting} icon={UserPlus}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-700 font-bold hover:underline">
                Sign In Instead
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
