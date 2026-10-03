import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Star, CheckCircle, XCircle } from 'lucide-react';
import Button from '../../components/common/Button';

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = sessionStorage.getItem('pipippip_admin_token');
    fetch(`${API_BASE_URL}/admin/reviews`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setReviews(json.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApprove = async (id, currentStatus) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = sessionStorage.getItem('pipippip_admin_token');
    await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ isApproved: !currentStatus })
    });
    fetchReviews();
  };

  return (
    <AdminLayout title="Reviews & Testimonials Moderation">
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900">Customer Reviews Moderation</h2>
          <p className="text-xs text-slate-500 font-medium">Approve or hide customer ratings to show on the website home page</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">No reviews submitted yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Ref Code</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4 max-w-md">Comment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {reviews.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-black text-amber-700">#{r.referenceCode}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{r.customerName}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-600 flex items-center gap-1">
                        <span>{r.rating}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      </td>
                      <td className="py-3.5 px-4 max-w-md truncate">{r.comment}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${r.isApproved ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300'}`}>
                          {r.isApproved ? 'Approved' : 'Pending Moderation'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          variant={r.isApproved ? 'outline' : 'emerald'}
                          size="sm"
                          onClick={() => handleToggleApprove(r._id, r.isApproved)}
                        >
                          {r.isApproved ? 'Hide Review' : 'Approve Review'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
