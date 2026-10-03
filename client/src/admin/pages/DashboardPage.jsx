import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import StatusBadge from '../components/StatusBadge';
import { adminApi } from '../api/adminApi';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Car,
  User,
  AlertCircle
} from 'lucide-react';
import Card from '../../components/common/Card';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    monthlyRevenue: 0,
    upcomingTrips: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi
      .getStats()
      .then((res) => {
        if (res.success) {
          setStats(res.data);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      title: "Today's Rides",
      value: stats.todayBookings,
      icon: CalendarCheck,
      color: 'bg-amber-500/15 text-amber-900 border-amber-300'
    },
    {
      title: 'Pending Action',
      value: stats.pendingBookings,
      icon: Clock,
      color: 'bg-amber-100 text-amber-900 border-amber-300'
    },
    {
      title: 'Confirmed / Active',
      value: stats.confirmedBookings,
      icon: CheckCircle2,
      color: 'bg-blue-100 text-blue-900 border-blue-300'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${(stats.monthlyRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300'
    },
    {
      title: 'Online Paid Revenue',
      value: `₹${(stats.totalPaidRevenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-amber-100 text-amber-900 border-amber-300'
    }
  ];


  return (
    <AdminLayout title="Dashboard Overview">
      <div className="space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2 font-medium">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <Card key={i} className="bg-white border border-slate-200/90 shadow-xs hover:border-amber-400">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{c.title}</span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${c.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {loading ? '...' : c.value}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Upcoming Trips Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Upcoming Trips</h3>
              <p className="text-xs text-slate-500 font-medium">Next scheduled pickups</p>
            </div>
            <Link
              to="/admin/bookings"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline"
            >
              <span>View All Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 font-medium">Loading upcoming trips...</div>
            ) : stats.upcomingTrips.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-medium">No upcoming scheduled trips found.</div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Ref Code</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Pickup Date/Time</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Fare</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {stats.upcomingTrips.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-amber-700">{b.referenceCode}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{b.customerName}</td>
                      <td className="py-3 px-4">{new Date(b.pickupDateTime).toLocaleString()}</td>
                      <td className="py-3 px-4 max-w-xs truncate">
                        {b.pickupLocation} → {b.dropLocation}
                      </td>
                      <td className="py-3 px-4">{b.vehicleName}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">₹{b.estimatedFare}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
