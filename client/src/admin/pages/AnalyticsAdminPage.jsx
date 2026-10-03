import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { BarChart3, TrendingUp, DollarSign, Calendar, Download, Users, Building, MapPin, Clock, Award, ShieldCheck } from 'lucide-react';
import Button from '../../components/common/Button';

export default function AnalyticsAdminPage() {
  const [period, setPeriod] = useState('30d');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const handleExportCSV = (filename, rows) => {
    if (!rows || rows.length === 0) return;
    const keys = Object.keys(rows[0]);
    const csvHeader = keys.join(',') + '\n';
    const csvRows = rows.map((r) => keys.map((k) => `"${r[k] !== undefined ? r[k] : ''}"`).join(',')).join('\n');
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <AdminLayout title="Fleet Performance & Analytics Dashboard">
      <div className="space-y-6">
        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Performance Metrics</span>
            <h2 className="text-lg font-extrabold text-slate-900">Executive Insights & Revenue Intelligence</h2>
          </div>

          <div className="flex gap-2">
            {[
              { key: '7d', label: 'Last 7 Days' },
              { key: '30d', label: 'Last 30 Days' },
              { key: 'month', label: 'This Month' }
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  period === p.key ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading || !analytics ? (
          <div className="p-20 text-center text-xs text-slate-500 font-medium">Aggregating real-time fleet analytics...</div>
        ) : (
          <>
            {/* Metric Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Completed Revenue</span>
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl"><DollarSign className="w-5 h-5" /></div>
                </div>
                <div className="text-2xl font-black text-slate-900">₹{analytics.summary.totalRevenue}</div>
                <p className="text-[11px] text-slate-500 mt-1">Avg Fare: ₹{analytics.summary.avgFare}</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Bookings</span>
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-xl"><BarChart3 className="w-5 h-5" /></div>
                </div>
                <div className="text-2xl font-black text-slate-900">{analytics.summary.totalBookings}</div>
                <p className="text-[11px] text-emerald-700 font-bold mt-1">Completed: {analytics.summary.completedBookings} trips</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Trip Completion Rate</span>
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {Math.round((analytics.summary.completedBookings / (analytics.summary.totalBookings || 1)) * 100)}%
                </div>
                <p className="text-[11px] text-rose-600 font-medium mt-1">Cancelled: {analytics.summary.cancelledBookings}</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Avg Distance / Trip</span>
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-xl"><MapPin className="w-5 h-5" /></div>
                </div>
                <div className="text-2xl font-black text-slate-900">{analytics.summary.avgDistance} KM</div>
                <p className="text-[11px] text-slate-500 mt-1">Total: {analytics.summary.totalDistance} KM</p>
              </div>
            </div>

            {/* Peak Hours & Trip Mix Distribution Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Busiest Hours Heatmap Bar Chart */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> Busiest Pickup Hours Heatmap
                </h3>

                <div className="h-44 flex items-end gap-1.5 pt-4">
                  {analytics.busiestHours.map((h) => {
                    const maxVal = Math.max(...analytics.busiestHours.map((b) => b.count), 1);
                    const heightPct = Math.max(10, Math.round((h.count / maxVal) * 100));

                    return (
                      <div key={h._id} className="flex-1 flex flex-col items-center gap-1 group">
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full bg-amber-500 rounded-t-md group-hover:bg-amber-600 transition"
                          title={`Hour ${h._id}:00 - ${h.count} trips`}
                        />
                        <span className="text-[9px] text-slate-400 font-mono">{h._id}h</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Trip Type & Payment Mix */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Trip Category & Payment Mix</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                    <span className="font-bold text-slate-600 text-[11px] block">Service Types</span>
                    {analytics.tripTypeMix.map((t) => (
                      <div key={t._id} className="flex justify-between font-medium">
                        <span className="capitalize text-slate-700">{t._id}</span>
                        <span className="font-bold text-slate-900">{t.count} ({Math.round((t.count / (analytics.summary.totalBookings || 1)) * 100)}%)</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                    <span className="font-bold text-slate-600 text-[11px] block">Payment Modes</span>
                    {analytics.paymentMix.map((p) => (
                      <div key={p._id} className="flex justify-between font-medium">
                        <span className="uppercase text-slate-700">{p._id}</span>
                        <span className="font-bold text-emerald-700">₹{p.revenue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Performance Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Driver Performance Roster</span>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={() => handleExportCSV('driver_performance.csv', analytics.driverPerformance)}
                >
                  Export Driver CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Driver Name</th>
                      <th className="py-3 px-4">Vehicle Reg & Type</th>
                      <th className="py-3 px-4">Completed Trips</th>
                      <th className="py-3 px-4">Avg Trip Distance</th>
                      <th className="py-3 px-4">Total Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {analytics.driverPerformance.map((d) => (
                      <tr key={d.driverId} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{d.name}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-amber-800">{d.vehicleNumber}</span> ({d.vehicleType})
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-blue-900">{d.tripsCompleted} Trips</td>
                        <td className="py-3.5 px-4">{Math.round(d.avgDistance || 0)} KM</td>
                        <td className="py-3.5 px-4 font-extrabold text-emerald-700">₹{d.totalEarnings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Corporate Accounts Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Top Corporate Accounts Spend</span>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Download}
                  onClick={() => handleExportCSV('corporate_insights.csv', analytics.topCorporateAccounts)}
                >
                  Export Corporate CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Company Name</th>
                      <th className="py-3 px-4">GST Number</th>
                      <th className="py-3 px-4">Total Corporate Trips</th>
                      <th className="py-3 px-4">Total Billing Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {analytics.topCorporateAccounts.length === 0 ? (
                      <tr><td colSpan="4" className="py-6 text-center text-slate-400">No corporate account spend recorded for this period.</td></tr>
                    ) : (
                      analytics.topCorporateAccounts.map((c) => (
                        <tr key={c._id} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{c.companyName}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-amber-700">{c.gstNumber || 'N/A'}</td>
                          <td className="py-3.5 px-4 font-bold">{c.totalTrips} Trips</td>
                          <td className="py-3.5 px-4 font-extrabold text-emerald-700">₹{c.totalSpend}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
