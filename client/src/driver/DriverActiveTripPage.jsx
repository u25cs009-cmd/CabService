import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DriverLayout from './DriverLayout';
import { useDriverAuth } from './DriverAuthContext';

export default function DriverActiveTripPage() {
  const { driverToken } = useDriverAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchActiveTrip = useCallback(async () => {
    if (!driverToken) return;
    try {
      const res = await fetch('/api/driver/current-trip', {
        headers: { Authorization: `Bearer ${driverToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setTrip(data.booking || null);
      }
    } catch (err) {
      console.error('Error fetching current trip:', err);
    } finally {
      setIsLoading(false);
    }
  }, [driverToken]);

  useEffect(() => {
    fetchActiveTrip();
    const interval = setInterval(fetchActiveTrip, 5000);
    return () => clearInterval(interval);
  }, [fetchActiveTrip]);

  const handleUpdateStatus = async (nextStatus, providedOtp = '') => {
    if (!trip) return;
    setError('');
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/driver/trip-status/${trip._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${driverToken}`
        },
        body: JSON.stringify({
          status: nextStatus,
          otpCode: providedOtp
        })
      });

      const data = await res.json();
      setIsUpdating(false);

      if (data.success) {
        setShowOtpModal(false);
        setOtpInput('');
        if (nextStatus === 'completed') {
          navigate('/driver/history');
        } else {
          setTrip(data.booking);
        }
      } else {
        setError(data.message || 'Status transition failed.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setIsUpdating(false);
      setError('Network error updating trip status.');
    }
  };

  if (isLoading) {
    return (
      <DriverLayout>
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
          Loading active trip details...
        </div>
      </DriverLayout>
    );
  }

  if (!trip) {
    return (
      <DriverLayout>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '1.25rem', padding: '2.5rem 1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚖</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>No Active Trip</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            You do not have any active trip currently assigned.
          </p>
          <button
            onClick={() => navigate('/driver')}
            style={{ padding: '0.75rem 1.5rem', background: '#f59e0b', color: '#0f172a', border: 'none', borderRadius: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
          >
            Go to Home & Wait for Offers ➔
          </button>
        </div>
      </DriverLayout>
    );
  }

  // Lifecycle steps mapping
  const steps = [
    { key: 'assigned', label: 'Assigned' },
    { key: 'on_the_way', label: 'On The Way' },
    { key: 'arrived', label: 'Arrived' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' }
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === trip.status);

  return (
    <DriverLayout>
      {/* Header Info */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '1.25rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Booking Reference</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>#{trip.referenceCode}</div>
          </div>
          <div style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid #3b82f6', color: '#60a5fa', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 800 }}>
            {trip.tripType.toUpperCase()}
          </div>
        </div>

        {/* Step progress bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px', margin: '1rem 0 0.5rem 0' }}>
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={step.key} style={{ flex: 1, textAlign: 'center' }}>
                <div
                  style={{
                    height: '6px',
                    borderRadius: '3px',
                    background: isCompleted ? '#22c55e' : '#334155',
                    marginBottom: '4px'
                  }}
                />
                <span style={{ fontSize: '0.65rem', fontWeight: isCurrent ? 800 : 500, color: isCurrent ? '#4ade80' : isCompleted ? '#cbd5e1' : '#64748b' }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.85rem', borderRadius: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Customer & Address Details Card */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '1.25rem', padding: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Customer Contact */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Passenger</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{trip.customerName}</div>
          </div>
          <a
            href={`tel:${trip.phone}`}
            style={{
              padding: '0.6rem 1rem',
              background: '#22c55e',
              color: '#0f172a',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            📞 CALL
          </a>
        </div>

        {/* Pickup & Drop Locations */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>📍</span>
            <div>
              <div style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 800 }}>PICKUP ADDRESS</div>
              <div style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600 }}>{trip.pickupLocation}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>🏁</span>
            <div>
              <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 800 }}>DROP ADDRESS</div>
              <div style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 600 }}>{trip.dropLocation}</div>
            </div>
          </div>
        </div>

        {/* Fare & Payment Info */}
        <div style={{ borderTop: '1px dashed #334155', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Payment Mode</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: trip.paymentMode === 'online' ? '#60a5fa' : '#f59e0b' }}>
              {trip.paymentMode === 'online' ? '💳 ONLINE PAID' : '💵 COLLECT FROM CUSTOMER'}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Fare</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#4ade80' }}>₹{trip.estimatedFare}</div>
          </div>
        </div>
      </div>

      {/* Action Button Controls based on state */}
      <div style={{ marginBottom: '1rem' }}>
        {trip.status === 'assigned' && (
          <button
            onClick={() => handleUpdateStatus('on_the_way')}
            disabled={isUpdating}
            style={{ width: '100%', padding: '1.1rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0.85rem', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer' }}
          >
            {isUpdating ? 'Updating...' : 'START HEADING TO PICKUP ➔'}
          </button>
        )}

        {trip.status === 'on_the_way' && (
          <button
            onClick={() => handleUpdateStatus('arrived')}
            disabled={isUpdating}
            style={{ width: '100%', padding: '1.1rem', background: '#eab308', color: '#0f172a', border: 'none', borderRadius: '0.85rem', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer' }}
          >
            {isUpdating ? 'Updating...' : 'I HAVE ARRIVED AT PICKUP 📍'}
          </button>
        )}

        {trip.status === 'arrived' && (
          <button
            onClick={() => setShowOtpModal(true)}
            disabled={isUpdating}
            style={{ width: '100%', padding: '1.1rem', background: '#22c55e', color: '#0f172a', border: 'none', borderRadius: '0.85rem', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer' }}
          >
            ENTER PASSENGER OTP & START TRIP 🔑
          </button>
        )}

        {trip.status === 'in_progress' && (
          <button
            onClick={() => handleUpdateStatus('completed')}
            disabled={isUpdating}
            style={{ width: '100%', padding: '1.1rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '0.85rem', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer' }}
          >
            {isUpdating ? 'Completing...' : 'COMPLETE TRIP & COLLECT FARE 🏁'}
          </button>
        )}
      </div>

      {/* 4-Digit OTP Modal */}
      {showOtpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', zIndex: 200 }}>
          <div style={{ background: '#1e293b', border: '2px solid #22c55e', borderRadius: '1.25rem', padding: '2rem', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#22c55e', marginBottom: '0.35rem' }}>Enter Trip OTP</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Ask passenger <strong>{trip.customerName}</strong> for their 4-digit ride start OTP code.
            </p>

            <input
              type="text"
              maxLength={4}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 4829"
              style={{ width: '80%', padding: '0.85rem', fontSize: '1.75rem', letterSpacing: '8px', textAlign: 'center', background: '#0f172a', border: '2px solid #475569', borderRadius: '0.75rem', color: '#4ade80', fontWeight: 'bold', marginBottom: '1.25rem' }}
            />

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setShowOtpModal(false); setOtpInput(''); }}
                style={{ flex: 1, padding: '0.85rem', background: '#334155', color: '#cbd5e1', border: 'none', borderRadius: '0.65rem', fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateStatus('in_progress', otpInput)}
                disabled={otpInput.length !== 4 || isUpdating}
                style={{ flex: 1, padding: '0.85rem', background: '#22c55e', color: '#0f172a', border: 'none', borderRadius: '0.65rem', fontWeight: 900 }}
              >
                Verify & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </DriverLayout>
  );
}
