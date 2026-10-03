import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import { Plus, Edit, Users, Building, Mail, Phone, Trash2, ShieldCheck, UserCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

export default function CompaniesAdminPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);

  const [companyForm, setCompanyForm] = useState({
    name: '',
    gstNumber: '',
    billingAddress: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    creditTermsDays: 30
  });

  const [employeeForm, setEmployeeForm] = useState({
    userEmail: '',
    employeeId: '',
    costCenter: ''
  });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/companies', {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleOpenAddCompany = () => {
    setEditingCompany(null);
    setCompanyForm({
      name: '',
      gstNumber: '',
      billingAddress: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      creditTermsDays: 30
    });
    setModalOpen(true);
  };

  const handleOpenEditCompany = (c) => {
    setEditingCompany(c);
    setCompanyForm({
      name: c.name,
      gstNumber: c.gstNumber || '',
      billingAddress: c.billingAddress,
      contactName: c.contactPerson?.name || '',
      contactEmail: c.contactPerson?.email || '',
      contactPhone: c.contactPerson?.phone || '',
      creditTermsDays: c.creditTermsDays || 30
    });
    setModalOpen(true);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: companyForm.name,
        gstNumber: companyForm.gstNumber,
        billingAddress: companyForm.billingAddress,
        contactPerson: {
          name: companyForm.contactName,
          email: companyForm.contactEmail,
          phone: companyForm.contactPhone
        },
        creditTermsDays: Number(companyForm.creditTermsDays)
      };

      const url = editingCompany ? `/api/admin/companies/${editingCompany._id}` : '/api/admin/companies';
      const method = editingCompany ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setModalOpen(false);
        fetchCompanies();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return;
    try {
      const res = await fetch(`/api/admin/companies/${selectedCompany._id}/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(employeeForm)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setSelectedCompany(data.data);
        setEmployeeForm({ userEmail: '', employeeId: '', costCenter: '' });
        fetchCompanies();
      } else {
        alert(data.message || 'Failed to add employee');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveEmployee = async (userId) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch(`/api/admin/companies/${selectedCompany._id}/employees/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedCompany(data.data);
        fetchCompanies();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout title="Corporate Accounts & Company Billing">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            Manage registered corporate accounts, GST details, credit terms, and approved corporate employees
          </p>
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAddCompany}>
            Register Corporate Account
          </Button>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Registered Companies: {companies.length} Accounts
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium">Loading corporate accounts...</div>
          ) : companies.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium">No corporate company accounts registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Company Name</th>
                    <th className="py-3 px-4">GST Number</th>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4">Credit Terms</th>
                    <th className="py-3 px-4">Approved Employees</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {companies.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-700">{c.gstNumber || 'N/A'}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{c.contactPerson?.name}</div>
                        <div className="text-[11px] text-slate-500">{c.contactPerson?.email} • {c.contactPerson?.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
                          {c.creditTermsDays} Days Net
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => {
                            setSelectedCompany(c);
                            setEmployeeModalOpen(true);
                          }}
                          className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-800 font-bold rounded-lg hover:bg-amber-500/20 transition flex items-center gap-1.5"
                        >
                          <Users className="w-3.5 h-3.5" />
                          {c.approvedEmployees?.length || 0} Employees
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Button variant="outline" size="sm" icon={Edit} onClick={() => handleOpenEditCompany(c)}>
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

        {/* Add/Edit Company Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCompany ? 'Edit Corporate Account' : 'Register New Corporate Company'}
        >
          <form onSubmit={handleSaveCompany} className="space-y-4">
            <Input
              id="c-name"
              label="Company Name"
              placeholder="e.g. Tata Consultancy Services"
              value={companyForm.name}
              onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
              required
            />

            <Input
              id="c-gst"
              label="GST Registration Number"
              placeholder="e.g. 10AAAAA0000A1Z5"
              value={companyForm.gstNumber}
              onChange={(e) => setCompanyForm({ ...companyForm, gstNumber: e.target.value })}
            />

            <Input
              id="c-address"
              label="Registered Billing Address"
              placeholder="Full address for tax invoices"
              value={companyForm.billingAddress}
              onChange={(e) => setCompanyForm({ ...companyForm, billingAddress: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="c-cname"
                label="Contact Person Name"
                placeholder="e.g. Vikram Singh"
                value={companyForm.contactName}
                onChange={(e) => setCompanyForm({ ...companyForm, contactName: e.target.value })}
                required
              />

              <Input
                id="c-cemail"
                type="email"
                label="Contact Email (for invoices)"
                placeholder="billing@company.com"
                value={companyForm.contactEmail}
                onChange={(e) => setCompanyForm({ ...companyForm, contactEmail: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="c-cphone"
                label="Contact Phone"
                placeholder="10-digit phone"
                value={companyForm.contactPhone}
                onChange={(e) => setCompanyForm({ ...companyForm, contactPhone: e.target.value })}
                required
              />

              <Input
                id="c-cterms"
                type="number"
                label="Credit Terms (Days)"
                placeholder="30"
                value={companyForm.creditTermsDays}
                onChange={(e) => setCompanyForm({ ...companyForm, creditTermsDays: e.target.value })}
                required
              />
            </div>

            <Button type="submit" variant="primary" fullWidth size="md">
              {editingCompany ? 'Update Corporate Account' : 'Register Corporate Account'}
            </Button>
          </form>
        </Modal>

        {/* Manage Approved Employees Modal */}
        {employeeModalOpen && selectedCompany && (
          <Modal
            isOpen={employeeModalOpen}
            onClose={() => setEmployeeModalOpen(false)}
            title={`Approved Employees - ${selectedCompany.name}`}
          >
            <div className="space-y-6 text-xs">
              {/* Add Employee Form */}
              <form onSubmit={handleAddEmployee} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Link Customer User Account to Company</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    id="emp-email"
                    type="email"
                    placeholder="User Email Address"
                    value={employeeForm.userEmail}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, userEmail: e.target.value })}
                    required
                  />
                  <Input
                    id="emp-id"
                    placeholder="Emp ID (Optional)"
                    value={employeeForm.employeeId}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, employeeId: e.target.value })}
                  />
                  <Input
                    id="emp-cc"
                    placeholder="Cost Center (Optional)"
                    value={employeeForm.costCenter}
                    onChange={(e) => setEmployeeForm({ ...employeeForm, costCenter: e.target.value })}
                  />
                </div>
                <Button type="submit" variant="primary" size="sm" icon={UserCheck}>
                  Link Employee
                </Button>
              </form>

              {/* Employee List */}
              <div>
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                  Currently Approved Employees ({selectedCompany.approvedEmployees?.length || 0})
                </h4>
                {selectedCompany.approvedEmployees?.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">No employees linked to this corporate account yet.</div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedCompany.approvedEmployees.map((e) => (
                      <div key={e.user?._id || e._id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{e.user?.name || 'User'}</div>
                          <div className="text-slate-500">{e.user?.email}</div>
                          <div className="text-[10px] text-amber-700">
                            Emp ID: {e.employeeId || 'N/A'} • Cost Center: {e.costCenter || 'Default'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveEmployee(e.user?._id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Unlink Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
}
