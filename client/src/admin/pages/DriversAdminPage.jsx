import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import { adminApi } from '../api/adminApi';
import { Plus, Edit, Settings, Copy, Check } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

export default function DriversAdminPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [createdDriverResult, setCreatedDriverResult] = useState(null);
  const [editingDriver, setEditingDriver] = useState(null);
  const [copied, setCopied] = useState(false);

  const [dispatchSettings, setDispatchSettings] = useState({
    searchRadiusKm: 15,
    offerTimeoutSeconds: 30,
    maxDriverRetries: 3,
    autoAssignEnabled: true
  });

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    licenseNo: '',
    vehicleNumber: '',
    vehicleType: 'Sedan',
    password: 'Driver@123',
    status: 'available'
  });

  const fetchDriversAndSettings = () => {
    setLoading(true);
    adminApi
      .getDrivers()
      .then((res) => {
        if (res.success) setDrivers(res.data);
      })
      .finally(() => setLoading(false));

    fetch('/api/admin/dispatch-settings', {
      headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setDispatchSettings(data.data);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchDriversAndSettings();
  }, []);

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setCreatedDriverResult(null);
    setForm({
      name: '',
      phone: '',
      email: '',
      licenseNo: '',
      vehicleNumber: '',
      vehicleType: 'Sedan',
      password: 'Driver@123',
      status: 'available'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (d) => {
    setEditingDriver(d);
    setCreatedDriverResult(null);
    setForm({
      name: d.name,
      phone: d.phone,
      email: d.user?.email || '',
      licenseNo: d.licenseNo,
      vehicleNumber: d.vehicleNumber,
      vehicleType: d.vehicleType || 'Sedan',
      password: '',
      status: d.status
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await adminApi.updateDriver(editingDriver._id, form);
        setModalOpen(false);
      } else {
        const res = await adminApi.createDriver(form);
        if (res.success && res.data) {
          setCreatedDriverResult(res.data);
        } else {
          setModalOpen(false);
        }
      }
      fetchDriversAndSettings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/dispatch-settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(dispatchSettings)
      });
      const data = await res.json();
      if (data.success) {
        setDispatchSettings(data.data);
        setSettingsModalOpen(false);
        alert('Dispatch settings updated successfully.');
      }
    } catch (err) {
      alert('Failed to update dispatch settings.');
    }
  };

  const handleCopyCredentials = () => {
    if (!createdDriverResult) return;
    const text = `Driver App Login:\nUrl: ${window.location.origin}/driver\nEmail: ${createdDriverResult.email}\nPassword: ${createdDriverResult.temporaryPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusStyles = {
    available: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    on_trip: 'bg-blue-100 text-blue-900 border-blue-300',
    inactive: 'bg-slate-100 text-slate-700 border-slate-300'
  };

  return (
    <AdminLayout title="Driver Roster & Auto-Dispatch Management">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            Manage drivers, app accounts, 2dsphere location matching & automated dispatch settings
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="md" icon={Settings} onClick={() => setSettingsModalOpen(true)}>
              Dispatch Settings
            </Button>
            <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
              Register New Driver
            </Button>
          </div>
        </div>

        {/* Dispatch Overview Settings Summary */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between text-xs gap-4">
          <div>
            <span className="font-bold text-amber-900">Auto-Dispatch Status: </span>
            <span className={`font-extrabold ${dispatchSettings.autoAssignEnabled ? 'text-emerald-700' : 'text-rose-700'}`}>
              {dispatchSettings.autoAssignEnabled ? '🟢 ENABLED' : '🔴 DISABLED'}
            </span>
          </div>
          <div>
            <span className="font-bold text-amber-900">Search Radius: </span>
            <span className="font-semibold text-slate-800">{dispatchSettings.searchRadiusKm} km</span>
          </div>
          <div>
            <span className="font-bold text-amber-900">Offer Timeout: </span>
            <span className="font-semibold text-slate-800">{dispatchSettings.offerTimeoutSeconds} seconds</span>
          </div>
          <div>
            <span className="font-bold text-amber-900">Max Driver Retries: </span>
            <span className="font-semibold text-slate-800">{dispatchSettings.maxDriverRetries} drivers</span>
          </div>
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
                    <th className="py-3 px-4">Login Email / Phone</th>
                    <th className="py-3 px-4">Commercial License</th>
                    <th className="py-3 px-4">Vehicle & Type</th>
                    <th className="py-3 px-4">Online Status</th>
                    <th className="py-3 px-4">Trip Duty</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {drivers.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{d.name}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{d.user?.email || 'N/A'}</div>
                        <div className="text-[11px] text-slate-500">{d.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">{d.licenseNo}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-amber-800">{d.vehicleNumber}</div>
                        <div className="text-[10px] text-slate-500">{d.vehicleType || 'Sedan'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${d.isOnline ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                          {d.isOnline ? '🟢 ONLINE' : '🔴 OFFLINE'}
                        </span>
                      </td>
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
          title={editingDriver ? 'Edit Driver Information' : 'Register New Driver Account'}
        >
          {createdDriverResult ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <h4 className="font-bold text-sm mb-1">🎉 Driver Account Created!</h4>
                <p>Provide the following credentials to the driver to sign in to the Driver App at <strong>/driver</strong>:</p>
              </div>

              <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs space-y-2">
                <div><span className="text-amber-400">Driver Portal URL:</span> {window.location.origin}/driver</div>
                <div><span className="text-amber-400">Email Login:</span> {createdDriverResult.email}</div>
                <div><span className="text-amber-400">Temp Password:</span> {createdDriverResult.temporaryPassword}</div>
              </div>

              <Button variant="primary" fullWidth icon={copied ? Check : Copy} onClick={handleCopyCredentials}>
                {copied ? 'Copied Credentials!' : 'Copy Login Details'}
              </Button>

              <Button variant="outline" fullWidth onClick={() => setModalOpen(false)}>
                Done & Close
              </Button>
            </div>
          ) : (
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

              {!editingDriver && (
                <>
                  <Input
                    id="d-email"
                    type="email"
                    label="Driver Email (Optional)"
                    placeholder="driver@pipippip.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />

                  <Input
                    id="d-password"
                    label="Initial Temporary Password"
                    placeholder="e.g. Driver@123"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </>
              )}

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
                id="d-vtype"
                label="Vehicle Category"
                value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                options={[
                  { value: 'Sedan', label: 'Comfort Sedan' },
                  { value: 'SUV', label: 'Executive SUV' },
                  { value: 'Hatchback', label: 'Compact Hatchback' },
                  { value: 'Luxury', label: 'Luxury Class' }
                ]}
                placeholder=""
                required
              />

              <Select
                id="d-status"
                label="Duty Availability"
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
                  {editingDriver ? 'Update Chauffeur Record' : 'Create Driver Account & Generate Password'}
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Dispatch Settings Modal */}
        <Modal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          title="Automated Dispatch Settings"
        >
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <span className="font-bold text-slate-800">Enable Automatic Driver Assignment</span>
              <input
                type="checkbox"
                checked={dispatchSettings.autoAssignEnabled}
                onChange={(e) => setDispatchSettings({ ...dispatchSettings, autoAssignEnabled: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded"
              />
            </div>

            <Input
              id="ds-radius"
              type="number"
              label="Driver Search Radius (KM)"
              value={dispatchSettings.searchRadiusKm}
              onChange={(e) => setDispatchSettings({ ...dispatchSettings, searchRadiusKm: Number(e.target.value) })}
              required
            />

            <Input
              id="ds-timeout"
              type="number"
              label="Driver Offer Response Countdown (Seconds)"
              value={dispatchSettings.offerTimeoutSeconds}
              onChange={(e) => setDispatchSettings({ ...dispatchSettings, offerTimeoutSeconds: Number(e.target.value) })}
              required
            />

            <Input
              id="ds-retries"
              type="number"
              label="Max Driver Offer Attempts Before Manual Dispatch"
              value={dispatchSettings.maxDriverRetries}
              onChange={(e) => setDispatchSettings({ ...dispatchSettings, maxDriverRetries: Number(e.target.value) })}
              required
            />

            <Button type="submit" variant="primary" fullWidth size="md">
              Save Dispatch Settings
            </Button>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
