import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import Modal from '../components/Modal';
import { Plus, FileText, Send, CheckCircle, Download, Calendar, Building, DollarSign } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

export default function InvoicesAdminPage() {
  const [invoices, setInvoices] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [form, setForm] = useState({
    companyId: '',
    startDate: '',
    endDate: '',
    gstPercentage: 5
  });

  const fetchInvoicesAndCompanies = async () => {
    setLoading(true);
    try {
      const [invRes, compRes] = await Promise.all([
        fetch('/api/admin/invoices', { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }),
        fetch('/api/admin/companies', { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } })
      ]);

      const invData = await invRes.json();
      const compData = await compRes.json();

      if (invData.success) setInvoices(invData.data || []);
      if (compData.success) setCompanies(compData.data || []);
    } catch (err) {
      console.error('Error fetching invoices/companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoicesAndCompanies();
  }, []);

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/invoices/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setGenerateModalOpen(false);
        fetchInvoicesAndCompanies();
      } else {
        alert(data.message || 'Invoice generation failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendInvoiceEmail = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/invoices/${id}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      });
      const data = await res.json();
      alert(data.message);
      fetchInvoicesAndCompanies();
    } catch (err) {
      alert('Failed to send invoice email.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/invoices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ status: 'paid' })
      });
      const data = await res.json();
      if (data.success) {
        alert('Invoice marked as PAID!');
        fetchInvoicesAndCompanies();
      }
    } catch (err) {
      alert('Failed to mark invoice as paid.');
    } finally {
      setActionLoading(false);
    }
  };

  const statusStyles = {
    draft: 'bg-slate-100 text-slate-800 border-slate-300',
    sent: 'bg-blue-100 text-blue-900 border-blue-300',
    paid: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    overdue: 'bg-rose-100 text-rose-900 border-rose-300'
  };

  return (
    <AdminLayout title="Corporate Monthly Invoicing">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-500 font-medium">
            Generate itemized monthly PDF tax invoices for corporate accounts with GST breakdowns
          </p>
          <Button variant="primary" size="md" icon={Plus} onClick={() => setGenerateModalOpen(true)}>
            Generate Monthly Invoice
          </Button>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Generated Invoices: {invoices.length} Documents
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium">No corporate invoices generated yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Company Account</th>
                    <th className="py-3 px-4">Billing Period</th>
                    <th className="py-3 px-4">Trips Count</th>
                    <th className="py-3 px-4">Total Amount (GST)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-extrabold text-amber-700">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{inv.company?.name || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-500">
                        {new Date(inv.billingPeriod?.startDate).toLocaleDateString()} ➔ {new Date(inv.billingPeriod?.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 font-bold">{inv.trips?.length || 0} Trips</td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900">₹{inv.grandTotal}</span>
                        <span className="block text-[10px] text-slate-500">Subtotal: ₹{inv.subtotal} + GST: ₹{inv.gstAmount}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${statusStyles[inv.status]}`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <a
                            href={`/api/admin/invoices/${inv._id}/pdf?token=${localStorage.getItem('admin_token')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                            title="View / Download PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleSendInvoiceEmail(inv._id)}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            title="Email PDF Invoice to Company"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkPaid(inv._id)}
                              disabled={actionLoading}
                              className="px-2 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px] hover:bg-emerald-700"
                              title="Mark as Paid"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Generate Invoice Modal */}
        <Modal
          isOpen={generateModalOpen}
          onClose={() => setGenerateModalOpen(false)}
          title="Generate Monthly Corporate Invoice"
        >
          <form onSubmit={handleGenerateInvoice} className="space-y-4">
            <Select
              id="inv-company"
              label="Select Corporate Company"
              value={form.companyId}
              onChange={(e) => setForm({ ...form, companyId: e.target.value })}
              options={companies.map((c) => ({
                value: c._id,
                label: `${c.name} (GST: ${c.gstNumber || 'N/A'})`
              }))}
              placeholder="Select Company Profile"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="inv-sdate"
                type="date"
                label="Billing Start Date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />

              <Input
                id="inv-edate"
                type="date"
                label="Billing End Date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
              />
            </div>

            <Select
              id="inv-gst"
              label="GST Tax Rate"
              value={form.gstPercentage}
              onChange={(e) => setForm({ ...form, gstPercentage: Number(e.target.value) })}
              options={[
                { value: 5, label: '5% GST (Standard Passenger Transport)' },
                { value: 18, label: '18% GST (Executive Corporate Billing)' }
              ]}
              placeholder=""
              required
            />

            <Button type="submit" variant="primary" fullWidth size="md" disabled={actionLoading}>
              {actionLoading ? 'Generating PDF Invoice...' : 'Generate & Save Invoice'}
            </Button>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}
