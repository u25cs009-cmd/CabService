import React, { useState, useEffect, useCallback } from 'react';
import DriverLayout from './DriverLayout';
import { useDriverAuth } from './DriverAuthContext';

export default function DriverHistoryPage() {
  const { driverToken } = useDriverAuth();
  const [period, setPeriod] = useState('all');
  const [summary, setSummary] = useState({ totalTrips: 0, totalEarnings: 0 });
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    if (!driverToken) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/driver/history?period=${period}`, {
        headers: { Authorization: `Bearer ${driverToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary || { totalTrips: 0, totalEarnings: 0 });
        setTrips(data.trips || []);
      }
    } catch (err) {
      console.error('Error fetching driver history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [driverToken, period]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' }
  ];

  return (
    <DriverLayout>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', margin: '0 0 0.25rem 0' }}>
          Trip History & Earnings
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
          Track your completed rides and revenue breakdown
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto' }}>
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: period === p.key ? '#f59e0b' : '#1e293b',
              color: period === p.key ? '#0f172a' : '#cbd5e1',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Earnings Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Completed Trips</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>{summary.totalTrips}</div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Revenue</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#4ade80' }}>₹{summary.totalEarnings}</div>
        </div>
      </div>

      {/* Trip List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Loading trip history...</div>
        ) : trips.length === 0 ? (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            No completed trips found for this period.
          </div>
        ) : (
          trips.map((t) => (
            <div key={t._id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>#{t.referenceCode}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600, marginBottom: '0.35rem' }}>
                📍 {t.pickupLocation} ➔ 🏁 {t.dropLocation}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', borderTop: '1px dashed #334155', paddingTop: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t.distanceKm} km • {t.passengers} Passengers</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4ade80' }}>₹{t.estimatedFare}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </DriverLayout>
  );
}
