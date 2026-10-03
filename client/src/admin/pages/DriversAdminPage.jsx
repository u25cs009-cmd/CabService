import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import { adminApi } from '../api/adminApi';
import { Plus, Edit, UserCheck, Phone, ShieldCheck, Car } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';

export default function DriversAdminPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    licenseNo: '',
    vehicleNumber: '',
    status: 'available'
  });

  const fetchDrivers = () => {
    setLoading(true);
    adminApi
      .getDrivers()
      .then((res) => {
        if (res.success) setDrivers(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setForm({
      name: '',
      phone: '',
      licenseNo: '',
      vehicleNumber: '',
      status: 'available'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (d) => {
    setEditingDriver(d);
    setForm({
      name: d.name,
      phone: d.phone,
      licenseNo: d.licenseNo,
      vehicleNumber: d.vehicleNumber,
      status: d.status
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await adminApi.updateDriver(editingDriver._id, form);
      } else {
        await adminApi.createDriver(form);
      }
      setModalOpen(false);
      fetchDrivers();
    } catch (err) {
      alert(err.message);
    }
  };

  const statusStyles = {
    available: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    on_trip: 'bg-blue-100 text-blue-900 border-blue-300',
    inactive: 'bg-slate-100 text-slate-700 border-slate-300'
  };

  return (
    <AdminLayout title="Driver Roster Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">Manage registered chauffeurs, license numbers, and availability</p>
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
            Register New Driver
          </Button>
        </div>

        {/* Drivers Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Roster: {drivers.length} Chauffeurs
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium">Loading drivers roster...</div>
          ) : drivers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium">No drivers registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Driver Name</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Commercial License</th>
                    <th className="py-3 px-4">Vehicle Reg No</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {drivers.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{d.name}</td>
                      <td className="py-3.5 px-4 font-semibold">{d.phone}</td>
                      <td className="py-3.5 px-4 font-mono">{d.licenseNo}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-800">{d.vehicleNumber}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${statusStyles[d.status] || 'bg-slate-100 text-slate-700'}`}>
                          {d.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button variant="outline" size="sm" icon={Edit} onClick={() => handleOpenEdit(d)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Driver Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingDriver ? 'Edit Driver Information' : 'Register New Chauffeur'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="d-name"
              label="Driver Full Name"
              placeholder="e.g. Ramesh Kumar"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <Input
              id="d-phone"
              type="tel"
              label="Mobile Phone Number"
              placeholder="10-digit phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />

            <Input
              id="d-license"
              label="Commercial License Number"
              placeholder="e.g. DL-2023-987654"
              value={form.licenseNo}
              onChange={(e) => setForm({ ...form, licenseNo: e.target.value })}
              required
            />

            <Input
              id="d-vehicle"
              label="Vehicle Registration Number"
              placeholder="e.g. KA-01-AB-1234"
              value={form.vehicleNumber}
              onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
              required
            />

            <Select
              id="d-status"
              label="Availability Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'available', label: 'Available for Trips' },
                { value: 'on_trip', label: 'Currently On Trip' },
                { value: 'inactive', label: 'Inactive / On Leave' }
              ]}
              placeholder=""
              required
            />

            <div className="pt-3">
              <Button type="submit" variant="primary" fullWidth size="md">
                {editingDriver ? 'Update Chauffeur Record' : 'Register Chauffeur'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
