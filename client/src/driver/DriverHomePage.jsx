import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DriverLayout from './DriverLayout';
import { useDriverAuth } from './DriverAuthContext';

export default function DriverHomePage() {
  const { driver, driverToken, toggleOnline } = useDriverAuth();
  const navigate = useNavigate();

  const [activeOffer, setActiveOffer] = useState(null);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [isToggling, setIsToggling] = useState(false);
  const [isResponding, setIsResponding] = useState(false);

  // Poll for incoming offers and active trips
  const checkDriverStatusAndOffers = useCallback(async () => {
    if (!driverToken || !driver?.isOnline) {
      setActiveOffer(null);
      return;
    }

    try {
      // 1. Check current trip
      const tripRes = await fetch('/api/driver/current-trip', {
        headers: { Authorization: `Bearer ${driverToken}` }
      });
      const tripData = await tripRes.json();
      if (tripData.success && tripData.booking) {
        setCurrentTrip(tripData.booking);
        setActiveOffer(null);
        return;
      } else {
        setCurrentTrip(null);
      }

      // 2. Check pending offers if available
      if (driver.status === 'available') {
        const offerRes = await fetch('/api/driver/offers', {
          headers: { Authorization: `Bearer ${driverToken}` }
        });
        const offerData = await offerRes.json();
        if (offerData.success && offerData.offer) {
          setActiveOffer(offerData.offer);
          setSecondsLeft(offerData.offer.secondsRemaining || 30);
        } else {
          setActiveOffer(null);
        }
      }
    } catch (err) {
      console.error('Error checking offers:', err);
    }
  }, [driverToken, driver?.isOnline, driver?.status]);

  useEffect(() => {
    checkDriverStatusAndOffers();
    const interval = setInterval(checkDriverStatusAndOffers, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [checkDriverStatusAndOffers]);

  // Countdown timer effect for active offer card
  useEffect(() => {
    if (!activeOffer) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setActiveOffer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeOffer]);

  const handleToggleOnline = async () => {
    setIsToggling(true);
    await toggleOnline(!driver.isOnline);
    setIsToggling(false);
  };

  const handleRespondOffer = async (action) => {
    if (!activeOffer) return;
    setIsResponding(true);
    try {
      const res = await fetch(`/api/driver/offers/${activeOffer.bookingId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${driverToken}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success && action === 'accept') {
        setActiveOffer(null);
        navigate('/driver/active-trip');
      } else {
        setActiveOffer(null);
      }
    } catch (err) {
      console.error('Error responding to offer:', err);
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <DriverLayout>
      {/* Online / Offline Main Card */}
      <div
        style={{
          background: driver?.isOnline ? 'linear-gradient(135deg, #1e293b, #0f172a)' : '#1e293b',
          border: `2px solid ${driver?.isOnline ? '#22c55e' : '#334155'}`,
          borderRadius: '1.25rem',
          padding: '1.5rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '0.5rem' }}>
          Duty Status
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: driver?.isOnline ? '#4ade80' : '#fca5a5', marginBottom: '1.25rem' }}>
          {driver?.isOnline ? '🟢 YOU ARE ONLINE' : '🔴 YOU ARE OFFLINE'}
        </div>

        <button
          onClick={handleToggleOnline}
          disabled={isToggling || driver?.status === 'on_trip'}
          style={{
            width: '100%',
            padding: '1rem',
            background: driver?.isOnline ? '#ef4444' : '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: '0.75rem',
            fontWeight: 800,
            fontSize: '1.1rem',
            cursor: driver?.status === 'on_trip' ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: driver?.status === 'on_trip' ? 0.6 : 1
          }}
        >
          {isToggling ? 'Updating Status...' : driver?.isOnline ? 'GO OFFLINE ⏹' : 'GO ONLINE ▶'}
        </button>

        {driver?.status === 'on_trip' && (
          <p style={{ color: '#f59e0b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            Cannot go offline while on an active trip.
          </p>
        )}
      </div>

      {/* Active Trip Banner if assigned */}
      {currentTrip && (
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a, #1e293b)',
            border: '2px solid #3b82f6',
            borderRadius: '1.25rem',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ background: '#3b82f6', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '0.35rem', display: 'inline-block', marginBottom: '0.35rem' }}>
              TRIP IN PROGRESS ({currentTrip.status.toUpperCase().replace(/_/g, ' ')})
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
              Ref: #{currentTrip.referenceCode}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#93c5fd' }}>
              Customer: {currentTrip.customerName}
            </div>
          </div>
          <button
            onClick={() => navigate('/driver/active-trip')}
            style={{
              padding: '0.75rem 1.25rem',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '0.65rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            View Trip ➔
          </button>
        </div>
      )}

      {/* Incoming Trip Offer Card Modal */}
      {activeOffer && (
        <div
          style={{
            background: '#1e293b',
            border: '3px solid #f59e0b',
            borderRadius: '1.25rem',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            animation: 'pulse 1.5s infinite',
            boxShadow: '0 20px 25px -5px rgba(245,158,11,0.2)'
          }}
        >
          {/* Header & Countdown Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⚡</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b' }}>NEW RIDE OFFER!</span>
            </div>
            <div
              style={{
                background: '#f59e0b',
                color: '#0f172a',
                fontWeight: 900,
                fontSize: '1rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '9999px'
              }}
            >
              ⏱ {secondsLeft}s
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div
              style={{
                height: '100%',
                background: '#f59e0b',
                width: `${(secondsLeft / 30) * 100}%`,
                transition: 'width 1s linear'
              }}
            />
          </div>

          {/* Ride Details */}
          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px dashed #334155', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Customer</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{activeOffer.customerFirstName}</span>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 700 }}>📍 PICKUP LOCATION</div>
              <div style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600 }}>{activeOffer.pickupLocation}</div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>🏁 DROP LOCATION</div>
              <div style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600 }}>{activeOffer.dropLocation}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #334155', paddingTop: '0.75rem' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Est. Distance: </span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{activeOffer.distanceKm} km</span>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Fare: </span>
                <span style={{ color: '#4ade80', fontWeight: 800, fontSize: '1.1rem' }}>₹{activeOffer.estimatedFare}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => handleRespondOffer('decline')}
              disabled={isResponding}
              style={{
                flex: 1,
                padding: '0.9rem',
                background: '#334155',
                color: '#fca5a5',
                border: '1px solid #475569',
                borderRadius: '0.65rem',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              DECLINE
            </button>
            <button
              onClick={() => handleRespondOffer('accept')}
              disabled={isResponding}
              style={{
                flex: 2,
                padding: '0.9rem',
                background: '#22c55e',
                color: '#0f172a',
                border: 'none',
                borderRadius: '0.65rem',
                fontWeight: 900,
                fontSize: '1.05rem',
                cursor: 'pointer'
              }}
            >
              ACCEPT RIDE ➔
            </button>
          </div>
        </div>
      )}

      {/* Driver Instructions & Privacy Notice Banner */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b', margin: '0 0 0.5rem 0' }}>💡 Driver Instructions & Privacy</h3>
        <ul style={{ color: '#94a3b8', fontSize: '0.85rem', paddingLeft: '1.2rem', margin: '0 0 1rem 0', lineHeight: '1.6' }}>
          <li>Keep your status <strong>ONLINE</strong> to receive trip requests nearby.</li>
          <li>You will have <strong>30 seconds</strong> to respond to trip offers before they pass to the next driver.</li>
          <li>Always verify customer OTP before initiating the trip.</li>
        </ul>

        {/* Location Safety Notice */}
        <div style={{ background: '#0f172a', border: '1px solid #3b82f6', borderRadius: '0.75rem', padding: '0.85rem', color: '#93c5fd', fontSize: '0.8rem', lineHeight: '1.5' }}>
          🔒 <strong>Location Privacy Notice:</strong> Your live GPS coordinates are shared with fleet dispatch and your active passenger <strong>strictly while you are ONLINE or on an active trip</strong>. Location sharing stops automatically the moment you switch to OFFLINE.
        </div>
      </div>
    </DriverLayout>
  );
}
