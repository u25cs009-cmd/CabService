import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, Phone, Mail, Calendar, Clock, Car, ShieldCheck, Ticket, LogOut, RefreshCw, XCircle, Star, Printer, ChevronRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import StatusBadge from '../admin/components/StatusBadge';
import ReceiptModal from '../components/booking/ReceiptModal';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export default function CustomerAccountPage() {
  const { customer, token, logout, isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiptBooking, setReceiptBooking] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_BASE_URL}/customer/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setBookings(json.data);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, token, navigate]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE_URL}/customer/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
        alert('Booking request cancelled.');
      } else {
        alert(json.message || 'Failed to cancel booking');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBookAgain = (b) => {
    const query = new URLSearchParams({
      pickup: b.pickupLocation,
      drop: b.dropLocation,
      service: b.tripType || 'local',
      vehicle: b.vehicleName || 'sedan'
    }).toString();
    navigate(`/book?${query}`);
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-600">
        Loading customer account...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Helmet>
        <title>My Account | Pi-Pip-Pip Cab Service</title>
        <meta name="description" content="View your Pi-Pip-Pip Cab profile, active rides, booking history, and receipts." />
      </Helmet>
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 my-4">
        {/* Header Profile Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-900 flex items-center justify-center font-bold text-2xl border border-amber-300">
              {customer.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">{customer.name}</h1>
              <p className="text-xs text-slate-500 flex items-center gap-3 mt-1 font-medium">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}</span>
                {customer.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/book">
              <Button variant="primary" size="md" icon={Car}>
                Book a Cab
              </Button>
            </Link>
            <Button variant="outline" size="md" onClick={logout} icon={LogOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Booking History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Ride History</h2>
              <p className="text-xs text-slate-500 font-medium">Track your recent bookings, status, and printable receipts</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-950 rounded-xl border border-amber-300">
              {bookings.length} Rides Found
            </span>
          </div>

          {loading ? (
            <Card className="p-8 text-center text-xs text-slate-500 font-medium">Loading your ride history...</Card>
          ) : bookings.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No bookings found on this account yet.</p>
              <Link to="/book">
                <Button variant="primary" size="sm">Book Your First Ride</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bookings.map((b) => (
                <div key={b._id} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-amber-400 transition-all space-y-4">
                  {/* Top Ref & Status Line */}
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-amber-500/15 border border-amber-300 rounded-lg text-amber-950 font-extrabold text-xs">
                        #{b.referenceCode}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(b.pickupDateTime).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 uppercase font-bold">Ride:</span>
                      <StatusBadge status={b.status} />
                      <span className="text-xs text-slate-400 uppercase font-bold ml-2">Payment:</span>
                      <StatusBadge status={b.paymentStatus || 'unpaid'} />
                    </div>
                  </div>

                  {/* Route & Vehicle Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
                    <div className="sm:col-span-2 space-y-1">
                      <p className="text-slate-900 font-bold text-sm">{b.pickupLocation} → {b.dropLocation}</p>
                      <p className="text-slate-500">{b.vehicleName} • {b.tripType?.toUpperCase()} Service • {b.passengers} Passengers</p>
                    </div>

                    <div className="sm:text-right space-y-0.5">
                      <p className="text-slate-400 font-bold uppercase text-[10px]">Estimated Fare</p>
                      <p className="text-xl font-black text-slate-950">₹{b.estimatedFare}</p>
                      {b.amountPaid > 0 && <p className="text-emerald-700 font-bold">Paid Online: ₹{b.amountPaid}</p>}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBookAgain(b)}
                        icon={RefreshCw}
                      >
                        Book Again
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setReceiptBooking(b)}
                        icon={Printer}
                      >
                        Receipt
                      </Button>

                      {b.status === 'completed' && (
                        <Link to={`/review/${b.referenceCode}`}>
                          <Button variant="emerald" size="sm" icon={Star}>
                            Rate Ride
                          </Button>
                        </Link>
                      )}
                    </div>

                    {b.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(b._id)}
                        className="text-rose-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Receipt Modal */}
        {receiptBooking && (
          <ReceiptModal booking={receiptBooking} onClose={() => setReceiptBooking(null)} />
        )}
      </main>

      <Footer />
    </div>
  );
}
