import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LiveMap from '../components/LiveMap';
import { connectSocket, disconnectSocket } from '../services/socketService';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import StatusBadge from '../admin/components/StatusBadge';
import { Phone, Navigation, ShieldCheck, Clock, MapPin, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CustomerTrackingPage() {
  const { trackingToken } = useParams();
  const [trackingData, setTrackingData] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const fetchTrackingDetails = useCallback(async () => {
    if (!trackingToken) return;
    try {
      const res = await fetch(`/api/bookings/track/${trackingToken}`);
      const data = await res.json();

      if (res.status === 410 || data.expired) {
        setIsExpired(true);
        setError(data.message || 'This tracking link has expired.');
        return;
      }

      if (data.success && data.data) {
        setTrackingData(data.data);
        if (data.data.driverLocation) {
          setDriverLocation(data.data.driverLocation);
        }
      } else {
        setError(data.message || 'Tracking details not found.');
      }
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      setError('Network error loading live tracking information.');
    } finally {
      setIsLoading(false);
    }
  }, [trackingToken]);

  useEffect(() => {
    fetchTrackingDetails();

    // Connect to Socket.IO room for real-time updates
    const socket = connectSocket({ trackingToken });

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    // Real-time location update event from driver
    socket.on('trip:location_update', (data) => {
      if (data.driverLocation) {
        setDriverLocation({
          lat: data.driverLocation.lat,
          lng: data.driverLocation.lng,
          heading: data.heading || 0,
          speed: data.speed || 0
        });
      }
      if (data.status) {
        setTrackingData((prev) => prev ? { ...prev, status: data.status } : null);
      }
    });

    // Fallback HTTP polling every 5s if socket is disconnected or for status changes
    const interval = setInterval(fetchTrackingDetails, 5000);

    return () => {
      clearInterval(interval);
      disconnectSocket();
    };
  }, [trackingToken, fetchTrackingDetails]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium text-sm">Initializing Live GPS Tracking...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto my-12 p-6 bg-slate-800 border border-slate-700 rounded-2xl text-center shadow-xl">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Tracking Link Expired</h2>
          <p className="text-slate-400 text-xs mb-6">{error}</p>
          <p className="text-slate-500 text-xs mb-6">
            For security and privacy, live tracking links automatically deactivate 1 hour after trip completion.
          </p>
          <Link
            to="/contact"
            className="inline-block px-6 py-3 bg-amber-500 text-slate-900 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
          >
            Contact Customer Care
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto my-12 p-6 bg-slate-800 border border-slate-700 rounded-2xl text-center shadow-xl">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-white mb-2">Tracking Link Not Found</h2>
          <p className="text-slate-400 text-xs mb-6">{error || 'Please check your tracking URL link.'}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-amber-500 text-slate-900 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
          >
            Back to Home Page
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      <Helmet>
        <title>{`Track Ride #${trackingData.referenceCode} - Pi-Pip-Pip Cabs`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-6 flex-grow space-y-6">
        {/* Top Tracking Header */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-lg backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Booking Tracking</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${socketConnected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                {socketConnected ? '⚡ LIVE WEBSOCKET' : '🔄 POLLING BACKUP'}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-amber-500">
              Reference #{trackingData.referenceCode}
            </h1>
          </div>

          <div>
            <StatusBadge status={trackingData.status} />
          </div>
        </div>

        {/* Dynamic ETA & OTP Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-amber-500/20 to-slate-800 border border-amber-500/40 rounded-2xl p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500 text-slate-900 rounded-xl">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">Estimated Arrival (ETA)</div>
              <div className="text-2xl font-black text-white">
                {trackingData.status === 'arrived'
                  ? '📍 Driver Has Arrived!'
                  : trackingData.status === 'completed'
                  ? '🏁 Trip Completed'
                  : `~${trackingData.etaMins || 10} Mins`}
              </div>
            </div>
          </div>

          {/* Ride Start OTP Card */}
          {trackingData.otpCode && (
            <div className="bg-gradient-to-r from-emerald-500/20 to-slate-800 border border-emerald-500/40 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Trip Start OTP</div>
                <div className="text-xs text-slate-400">Share with driver to start ride</div>
              </div>
              <div className="bg-slate-900 border border-emerald-500 text-emerald-400 text-2xl font-black px-4 py-2 rounded-xl tracking-widest">
                {trackingData.otpCode}
              </div>
            </div>
          )}
        </div>

        {/* Live Interactive Map */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>LIVE GPS CAB POSITION</span>
            <span>📍 Pickup ➔ 🏁 Drop</span>
          </div>

          <LiveMap
            driverLocation={driverLocation}
            pickupCoords={trackingData.pickupCoords}
            dropCoords={trackingData.dropCoords}
            routeTrail={trackingData.routeTrail}
            height="420px"
          />
        </div>

        {/* Assigned Driver Card */}
        {trackingData.driver ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-3xl">
                🚖
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">{trackingData.driver.name}</h3>
                <p className="text-xs text-slate-400">
                  {trackingData.driver.vehicleType} • <span className="font-mono text-amber-400 font-bold">{trackingData.driver.vehicleNumber}</span>
                </p>
              </div>
            </div>

            <a
              href={`tel:${trackingData.driver.phone}`}
              className="px-5 py-3 bg-emerald-500 text-slate-900 font-extrabold text-xs rounded-xl hover:bg-emerald-400 transition flex items-center gap-2 shadow-lg"
            >
              <Phone className="w-4 h-4" />
              CALL DRIVER
            </a>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 text-center text-slate-400 text-xs">
            ⏳ Searching for nearest available chauffeur... Live GPS coordinates will appear once assigned.
          </div>
        )}

        {/* Route Address Details */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-400">PICKUP ADDRESS</div>
              <div className="text-slate-200 font-medium text-sm">{trackingData.pickupLocation}</div>
            </div>
          </div>

          <div className="border-t border-slate-700/60 my-2" />

          <div className="flex items-start gap-3">
            <Navigation className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-400">DROP ADDRESS</div>
              <div className="text-slate-200 font-medium text-sm">{trackingData.dropLocation}</div>
            </div>
          </div>
        </div>

        {/* Security & Privacy Notice */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 text-[11px] text-slate-500 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
          <span>
            <strong>Privacy & Security Guaranteed:</strong> This tracking link is unguessable and encrypted. Driver phone number and GPS location are disclosed strictly during your assigned ride and automatically expire 1 hour post-completion.
          </span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
