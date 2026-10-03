import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import { adminApi } from '../api/adminApi';
import { Tag, Edit, Save, Plus, Moon, Plane, Compass, DollarSign } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

export default function FareRulesAdminPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchRules = () => {
    setLoading(true);
    adminApi
      .getStats()
      .then(() => {
        // Fetch fare rules from admin API
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const token = sessionStorage.getItem('pipippip_admin_token');
        return fetch(`${API_BASE_URL}/admin/fare-rules`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setRules(json.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleEdit = (rule) => {
    setEditingRule({ ...rule });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingRule) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = sessionStorage.getItem('pipippip_admin_token');

      const res = await fetch(`${API_BASE_URL}/admin/fare-rules/${editingRule._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingRule)
      });

      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        fetchRules();
        alert('Fare rule updated successfully!');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout title="Configurable Fare Rules">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">Configure base rates, minimum fares, night surcharges, GST, and packages per vehicle type</p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-medium bg-white rounded-2xl border border-slate-200">
            Loading fare calculation rules...
          </div>
        ) : rules.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 font-medium bg-white rounded-2xl border border-slate-200">
            No dynamic fare rules found. Seeding default rules...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.map((r) => (
              <Card key={r._id} className="bg-white border-2 border-slate-200 hover:border-amber-400 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{r.vehicleName || r.vehicleType}</h3>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      {r.vehicleType}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" icon={Edit} onClick={() => handleEdit(r)}>
                    Edit Rules
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 font-medium">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase">Base / Min Fare</span>
                    <span className="font-bold text-slate-900 text-sm">₹{r.baseFare}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase">Rate Per KM</span>
                    <span className="font-bold text-amber-700 text-sm">₹{r.ratePerKm} / km</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase">Night Charge (10PM-6AM)</span>
                    <span className="font-bold text-slate-900">{r.nightCharge?.amount}% Surcharge</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase">GST Tax Rate</span>
                    <span className="font-bold text-slate-900">{r.gstPercent}% GST</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Fare Rule Modal */}
        {editingRule && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={`Edit Fare Rules - ${editingRule.vehicleName || editingRule.vehicleType}`}
          >
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="fr-base"
                  type="number"
                  label="Base Minimum Fare (₹)"
                  value={editingRule.baseFare}
                  onChange={(e) => setEditingRule({ ...editingRule, baseFare: parseFloat(e.target.value) })}
                  required
                />
                <Input
                  id="fr-rate"
                  type="number"
                  label="Rate Per KM (₹)"
                  value={editingRule.ratePerKm}
                  onChange={(e) => setEditingRule({ ...editingRule, ratePerKm: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="fr-gst"
                  type="number"
                  label="GST Tax Percentage (%)"
                  value={editingRule.gstPercent}
                  onChange={(e) => setEditingRule({ ...editingRule, gstPercent: parseFloat(e.target.value) })}
                  required
                />
                <Input
                  id="fr-night"
                  type="number"
                  label="Night Charge Surcharge (%)"
                  value={editingRule.nightCharge?.amount || 15}
                  onChange={(e) =>
                    setEditingRule({
                      ...editingRule,
                      nightCharge: { ...editingRule.nightCharge, amount: parseFloat(e.target.value) }
                    })
                  }
                  required
                />
              </div>

              <div className="pt-3">
                <Button type="submit" variant="primary" fullWidth size="md" icon={Save}>
                  Save Updated Fare Rules
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
