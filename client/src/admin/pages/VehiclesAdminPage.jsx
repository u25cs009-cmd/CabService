import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import { adminApi } from '../api/adminApi';
import { Plus, Edit, Car, Check, X, Tag, Users, Briefcase } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';

export default function VehiclesAdminPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [form, setForm] = useState({
    name: '',
    type: 'hatchback',
    models: '',
    seats: 4,
    luggageCapacity: 2,
    ratePerKm: 14,
    baseFare: 400,
    badge: 'Popular',
    description: ''
  });

  const fetchVehicles = () => {
    setLoading(true);
    adminApi
      .getVehicles()
      .then((res) => {
        if (res.success) setVehicles(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setForm({
      name: '',
      type: 'hatchback',
      models: '',
      seats: 4,
      luggageCapacity: 2,
      ratePerKm: 14,
      baseFare: 400,
      badge: 'Popular',
      description: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVehicle(v);
    setForm({
      name: v.name,
      type: v.type,
      models: v.models || '',
      seats: v.seats,
      luggageCapacity: v.luggageCapacity || v.luggage || 2,
      ratePerKm: v.ratePerKm,
      baseFare: v.baseFare || v.minFare || 300,
      badge: v.badge || '',
      description: v.description || ''
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (v) => {
    try {
      const res = await adminApi.updateVehicle(v._id, { isActive: !v.isActive });
      if (res.success) fetchVehicles();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await adminApi.updateVehicle(editingVehicle._id, form);
      } else {
        await adminApi.createVehicle(form);
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout title="Vehicle Fleet Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">Manage cab vehicle types, per-km rates, and availability</p>
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
            Add Vehicle
          </Button>
        </div>

        {/* Vehicles Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-medium bg-white rounded-2xl border border-slate-200">
            Loading vehicle fleet...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map((v) => (
              <Card key={v._id || v.vehicleId} className="bg-white border-2 border-slate-200/90 hover:border-amber-400 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      {v.badge || v.type}
                    </span>
                    <button
                      onClick={() => handleToggleActive(v)}
                      className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${
                        v.isActive
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                      }`}
                    >
                      {v.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{v.name}</h3>
                    <p className="text-xs text-slate-500 italic font-medium">{v.models}</p>
                  </div>

                  <div className="space-y-1.5 py-2 border-y border-slate-100 text-xs font-medium text-slate-700">
                    <div className="flex justify-between">
                      <span>Capacity:</span>
                      <span className="font-bold text-slate-900">{v.seats} Seats</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate per KM:</span>
                      <span className="font-bold text-amber-700">₹{v.ratePerKm}/km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Min Fare:</span>
                      <span className="font-bold text-slate-900">₹{v.baseFare || v.minFare}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button variant="outline" size="sm" icon={Edit} onClick={() => handleOpenEdit(v)}>
                    Edit Vehicle
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Vehicle Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingVehicle ? 'Edit Vehicle Details' : 'Add New Vehicle'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="v-name"
              label="Vehicle Name"
              placeholder="e.g. Comfort Sedan"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                id="v-type"
                label="Vehicle Type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                options={[
                  { value: 'hatchback', label: 'Hatchback' },
                  { value: 'sedan', label: 'Sedan' },
                  { value: 'suv', label: 'SUV' },
                  { value: 'tempo', label: 'Tempo Traveller' }
                ]}
                placeholder=""
                required
              />

              <Input
                id="v-models"
                label="Car Models"
                placeholder="e.g. Dzire, Etios"
                value={form.models}
                onChange={(e) => setForm({ ...form, models: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                id="v-seats"
                type="number"
                label="Seats"
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value, 10) })}
                required
              />

              <Input
                id="v-luggage"
                type="number"
                label="Luggage Capacity"
                value={form.luggageCapacity}
                onChange={(e) => setForm({ ...form, luggageCapacity: parseInt(e.target.value, 10) })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                id="v-rate"
                type="number"
                label="Rate Per KM (₹)"
                value={form.ratePerKm}
                onChange={(e) => setForm({ ...form, ratePerKm: parseFloat(e.target.value) })}
                required
              />

              <Input
                id="v-base"
                type="number"
                label="Base Minimum Fare (₹)"
                value={form.baseFare}
                onChange={(e) => setForm({ ...form, baseFare: parseFloat(e.target.value) })}
                required
              />
            </div>

            <Input
              id="v-badge"
              label="Badge Tag (Optional)"
              placeholder="e.g. Popular"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
            />

            <div className="pt-3">
              <Button type="submit" variant="primary" fullWidth size="md">
                {editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
