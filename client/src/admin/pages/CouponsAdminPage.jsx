import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import { adminApi } from '../api/adminApi';
import { Tag, Plus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percent',
    discountValue: '10',
    maxDiscount: '100',
    minFare: '300',
    usageLimit: '100',
    perUserLimit: '1'
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCoupons = () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = sessionStorage.getItem('pipippip_admin_token');
    fetch(`${API_BASE_URL}/admin/coupons`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setCoupons(json.data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = sessionStorage.getItem('pipippip_admin_token');
    await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ isActive: !currentStatus })
    });
    fetchCoupons();
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = sessionStorage.getItem('pipippip_admin_token');
      const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setModalOpen(false);
        fetchCoupons();
        setFormData({
          code: '',
          discountType: 'percent',
          discountValue: '10',
          maxDiscount: '100',
          minFare: '300',
          usageLimit: '100',
          perUserLimit: '1'
        });
      } else {
        alert(json.message || 'Failed to create coupon');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout title="Coupons Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Promotional Coupons</h2>
            <p className="text-xs text-slate-500 font-medium">Create and manage promo codes & discount limits</p>
          </div>
          <Button variant="primary" size="md" onClick={() => setModalOpen(true)} icon={Plus}>
            Create New Coupon
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">No promo coupons created yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Max Cap</th>
                    <th className="py-3 px-4">Min Fare</th>
                    <th className="py-3 px-4">Usage (Used/Total)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {coupons.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-black text-amber-700">{c.code}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {c.discountType === 'percent' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                      </td>
                      <td className="py-3.5 px-4">{c.maxDiscount > 0 ? `₹${c.maxDiscount}` : 'Unlimited'}</td>
                      <td className="py-3.5 px-4">₹{c.minFare || 0}</td>
                      <td className="py-3.5 px-4">{c.usedCount} / {c.usageLimit}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${c.isActive ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300'}`}>
                          {c.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(c._id, c.isActive)}
                        >
                          {c.isActive ? 'Disable' : 'Enable'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Coupon Modal */}
        {modalOpen && (
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Coupon Code">
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <Input
                id="coup-code"
                label="Coupon Code (e.g. FESTIVE20)"
                placeholder="FESTIVE20"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  id="coup-type"
                  label="Discount Type"
                  value={formData.discountType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, discountType: e.target.value }))}
                  options={[
                    { value: 'percent', label: 'Percentage (%)' },
                    { value: 'flat', label: 'Flat Amount (₹)' }
                  ]}
                />

                <Input
                  id="coup-value"
                  type="number"
                  label="Discount Value"
                  value={formData.discountValue}
                  onChange={(e) => setFormData((prev) => ({ ...prev, discountValue: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="coup-max"
                  type="number"
                  label="Max Discount Cap (₹)"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maxDiscount: e.target.value }))}
                />

                <Input
                  id="coup-minfare"
                  type="number"
                  label="Min Fare Required (₹)"
                  value={formData.minFare}
                  onChange={(e) => setFormData((prev) => ({ ...prev, minFare: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="coup-limit"
                  type="number"
                  label="Total Usage Limit"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, usageLimit: e.target.value }))}
                />

                <Input
                  id="coup-user-limit"
                  type="number"
                  label="Limit Per Customer"
                  value={formData.perUserLimit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, perUserLimit: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : 'Create Coupon'}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
