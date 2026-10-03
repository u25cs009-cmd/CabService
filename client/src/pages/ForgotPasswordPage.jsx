import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail, KeyRound, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE_URL}/customer/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to process request');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Helmet>
        <title>Forgot Password | Pi-Pip-Pip Cab Service</title>
        <meta name="description" content="Reset your Pi-Pip-Pip Cab account password via email link." />
      </Helmet>
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 my-10">
        <div className="max-w-md w-full">
          <Card className="shadow-lg border border-slate-200/90 bg-white p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-900 flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6 text-amber-700" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">Forgot Password</h1>
              <p className="text-xs text-slate-500 mt-1">Enter your registered email to receive a password reset link (expires in 1 hour)</p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-950">Reset Link Sent!</h3>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  If an account is associated with <strong>{email}</strong>, we have dispatched a password reset link.
                </p>
                <div className="pt-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm" icon={ArrowLeft}>Back to Login</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Input
                  id="forgot-email"
                  type="email"
                  label="Email Address"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                  required
                />

                <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? 'Sending Reset Link...' : 'Send Password Reset Link'}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
              <Link to="/login" className="text-amber-700 font-bold hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
