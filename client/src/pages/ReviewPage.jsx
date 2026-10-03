import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Star, MessageCircle, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function ReviewPage() {
  const { referenceCode } = useParams();
  const [rating, setRating] = useState(5);
  const [customerName, setCustomerName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!comment.trim()) {
      setError('Please write a short review comment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceCode,
          rating,
          comment,
          customerName
        })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to submit review');
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Helmet>
        <title>Rate Your Ride #{referenceCode} | Pi-Pip-Pip Cabs</title>
        <meta name="description" content="Leave a review and rating for your Pi-Pip-Pip cab trip." />
      </Helmet>
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 my-10">
        <div className="max-w-md w-full">
          <Card className="shadow-lg border border-slate-200/90 bg-white p-6 sm:p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-900 flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-amber-600 fill-amber-500" />
              </div>
              <h1 className="text-2xl font-black text-slate-900">Rate Your Trip</h1>
              <p className="text-xs text-slate-500 mt-1">Booking Reference: #{referenceCode}</p>
            </div>

            {success ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-950">Thank You For Your Feedback!</h3>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  Your review has been submitted to our moderation team and will appear on our homepage once approved.
                </p>
                <div className="pt-2">
                  <Link to="/account">
                    <Button variant="emerald" size="sm">Back to Account</Button>
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

                {/* Star Rating Picker */}
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2 text-center">
                    Select Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1.5 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-300 fill-slate-100'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  id="rev-name"
                  label="Your Name (Optional)"
                  placeholder="e.g. Rahul S."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Your Feedback & Review
                  </label>
                  <textarea
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the driver, vehicle cleanliness, and overall ride experience..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    required
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting} icon={Star}>
                  {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
              <Link to="/" className="text-amber-700 font-bold hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
