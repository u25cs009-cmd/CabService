import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import ReceiptModal from '../components/booking/ReceiptModal';
import Button from '../components/common/Button';

export default function ReceiptPage() {
  const { referenceCode } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_BASE_URL}/bookings/${referenceCode}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setBooking(json.data);
        } else {
          setError(json.message || 'Booking receipt not found');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [referenceCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-600 font-medium">
        Loading receipt details...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Receipt Not Found</h2>
        <p className="text-slate-600 text-sm max-w-md">{error || 'Could not locate a booking with this reference code.'}</p>
        <Link to="/book">
          <Button variant="primary" icon={ArrowLeft}>Back to Booking</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <ReceiptModal booking={booking} />
    </div>
  );
}
