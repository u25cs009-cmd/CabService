import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { adminApi } from '../api/adminApi';
import { siteConfig } from '../../config/site';
import {
  Search,
  Filter,
  Download,
  MessageCircle,
  Eye,
  CheckCircle,
  XCircle,
  UserCheck,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  Clock,
  Car,
  Tag,
  FileText
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals & Action States
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('Customer cancellation refund');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [editingNotes, setEditingNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = () => {
    setLoading(true);
    const params = {
      page,
      limit: 15,
      ...(search && { search }),
      ...(statusFilter && { status: statusFilter }),
      ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    };

    adminApi
      .getBookings(params)
      .then((res) => {
        if (res.success) {
          setBookings(res.data);
          setTotalPages(res.totalPages || 1);
          setTotalCount(res.totalCount || 0);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const fetchDrivers = () => {
    adminApi.getDrivers().then((res) => {
      if (res.success) {
        setDrivers(res.data);
      }
    });
  };

  useEffect(() => {
    fetchBookings();
    fetchDrivers();
  }, [page, statusFilter, paymentStatusFilter, startDate, endDate]);


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await adminApi.updateBooking(bookingId, { status: newStatus });
      if (res.success) {
        fetchBookings();
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking(res.data);
        }
      } else {
        alert(res.message || 'Failed to update status');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignDriver = async (bookingId) => {
    if (!selectedDriverId) return;
    setActionLoading(true);
    try {
      const res = await adminApi.updateBooking(bookingId, { driverId: selectedDriverId });
      if (res.success) {
        fetchBookings();
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking(res.data);
        }
        alert('Driver assigned successfully!');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveNotes = async (bookingId) => {
    setActionLoading(true);
    try {
      const res = await adminApi.updateBooking(bookingId, { notes: editingNotes });
      if (res.success) {
        fetchBookings();
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking(res.data);
        }
        alert('Notes updated!');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenWhatsApp = (b) => {
    const cleanPhone = b.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const text = `Hello ${b.customerName}, regarding your Pi-Pip-Pip cab booking #${b.referenceCode}: Pickup from ${b.pickupLocation} on ${new Date(b.pickupDateTime).toLocaleString()}. Current Status: ${b.status.toUpperCase()}.`;
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleExportCSV = () => {
    const params = {
      ...(search && { search }),
      ...(statusFilter && { status: statusFilter }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    };
    const exportUrl = adminApi.exportBookingsUrl(params);
    window.open(exportUrl, '_blank');
  };

  return (
    <AdminLayout title="Bookings Management">
      <div className="space-y-6">
        {/* Filters Header Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <Input
              id="search-input"
              placeholder="Ref Code, Name, or Phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />

            <Select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Trip Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'offered', label: 'Offered to Driver' },
                { value: 'needs_manual_assignment', label: 'Needs Manual Assignment' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'assigned', label: 'Driver Assigned' },
                { value: 'on_the_way', label: 'On The Way' },
                { value: 'arrived', label: 'Arrived' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
              placeholder=""
              icon={Filter}
            />

            <Select
              id="payment-status-filter"
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Payment Statuses' },
                { value: 'unpaid', label: 'Unpaid' },
                { value: 'partial', label: 'Partial (Advance)' },
                { value: 'paid', label: 'Paid Full' },
                { value: 'failed', label: 'Failed' },
                { value: 'refunded', label: 'Refunded' }
              ]}
              placeholder=""
              icon={Filter}
            />

            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              icon={Calendar}
            />

            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              icon={Calendar}
            />

            <div className="flex gap-2 col-span-1 sm:col-span-2 lg:col-span-1">
              <Button type="submit" variant="primary" size="md" fullWidth>
                Apply
              </Button>
              <Button
                type="button"
                variant="emerald"
                size="md"
                onClick={() => {
                  const params = {
                    ...(search && { search }),
                    ...(statusFilter && { status: statusFilter }),
                    ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter }),
                    ...(startDate && { startDate }),
                    ...(endDate && { endDate })
                  };
                  window.open(adminApi.exportBookingsUrl(params), '_blank');
                }}
                icon={Download}
                title="Export CSV"
              >
                CSV
              </Button>
            </div>

          </form>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Records: {totalCount} Bookings
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium">Loading bookings data...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-medium">No booking records found matching current filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Ref Code</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Date/Time</th>
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Fare (Paid)</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Trip Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-extrabold text-amber-700">{b.referenceCode}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{b.customerName}</td>
                      <td className="py-3.5 px-4 font-semibold">{b.phone}</td>
                      <td className="py-3.5 px-4 max-w-xs truncate">
                        {b.pickupLocation} → {b.dropLocation}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">{new Date(b.pickupDateTime).toLocaleString()}</td>
                      <td className="py-3.5 px-4">{b.vehicleName}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900">₹{b.estimatedFare}</span>
                        {b.amountPaid > 0 && (
                          <span className="block text-[11px] font-bold text-emerald-700">Paid: ₹{b.amountPaid}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={b.paymentStatus || 'unpaid'} />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={b.status} />
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setEditingNotes(b.notes || '');
                              setDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenWhatsApp(b)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-500 font-medium">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  icon={ChevronLeft}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  icon={ChevronRight}
                  iconPosition="right"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Booking Detail Modal Drawer */}
        {detailModalOpen && selectedBooking && (
          <Modal
            isOpen={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            title={`Booking #${selectedBooking.referenceCode}`}
          >
            <div className="space-y-6">
              {/* Status Header */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block">Ride Status</span>
                  <StatusBadge status={selectedBooking.status} />
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 uppercase block">Payment Status</span>
                  <StatusBadge status={selectedBooking.paymentStatus || 'unpaid'} />
                </div>
              </div>

              {/* Trip Information */}
              <div className="space-y-2 text-xs text-slate-700 font-medium">
                <div className="flex justify-between"><span className="text-slate-400">Customer Name:</span><span className="font-bold text-slate-900">{selectedBooking.customerName}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Phone:</span><span className="font-bold text-slate-900">{selectedBooking.phone}</span></div>
                {selectedBooking.email && <div className="flex justify-between"><span className="text-slate-400">Email:</span><span className="font-bold text-slate-900">{selectedBooking.email}</span></div>}
                <div className="flex justify-between"><span className="text-slate-400">Pickup:</span><span className="font-bold text-slate-900">{selectedBooking.pickupLocation}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Drop:</span><span className="font-bold text-slate-900">{selectedBooking.dropLocation}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Date/Time:</span><span className="font-bold text-slate-900">{new Date(selectedBooking.pickupDateTime).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Service:</span><span className="font-bold text-slate-900">{selectedBooking.tripType}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Vehicle:</span><span className="font-bold text-slate-900">{selectedBooking.vehicleName}</span></div>
              </div>

              {/* Payment Summary Box */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5 text-xs">
                <h4 className="font-extrabold text-amber-950 uppercase tracking-wider text-[11px] border-b border-amber-200/80 pb-1 mb-1">
                  Payment Details
                </h4>
                <div className="flex justify-between"><span className="text-slate-600">Total Estimated Fare:</span><span className="font-extrabold text-slate-900">₹{selectedBooking.estimatedFare}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Online Amount Paid:</span><span className="font-extrabold text-emerald-700">₹{selectedBooking.amountPaid || 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Balance Due to Driver:</span><span className="font-extrabold text-rose-700">₹{Math.max(0, selectedBooking.estimatedFare - (selectedBooking.amountPaid || 0))}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Payment Mode:</span><span className="font-bold text-slate-800 uppercase">{selectedBooking.paymentMode || 'pay_to_driver'}</span></div>
                {selectedBooking.razorpayPaymentId && (
                  <div className="flex justify-between"><span className="text-slate-600">Razorpay Payment ID:</span><span className="font-mono text-slate-900 font-bold">{selectedBooking.razorpayPaymentId}</span></div>
                )}
              </div>

              {/* Actions & Status Change Controls */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Status & Payment Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'confirmed', 'needs_manual_assignment'].includes(selectedBooking.status) && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={actionLoading}
                      onClick={async () => {
                        setActionLoading(true);
                        try {
                          const res = await fetch(`/api/admin/bookings/${selectedBooking._id}/dispatch`, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
                          });
                          const data = await res.json();
                          alert(data.message);
                          fetchBookings();
                          setDetailModalOpen(false);
                        } catch (err) {
                          alert('Auto dispatch failed.');
                        } finally {
                          setActionLoading(false);
                        }
                      }}
                      icon={CheckCircle}
                    >
                      Trigger Auto Dispatch
                    </Button>
                  )}
                  {selectedBooking.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(selectedBooking._id, 'confirmed')}
                    >
                      Confirm Booking
                    </Button>
                  )}
                  {['confirmed', 'assigned', 'in_progress'].includes(selectedBooking.status) && (
                    <Button
                      variant="emerald"
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(selectedBooking._id, 'completed')}
                      icon={CheckCircle}
                    >
                      Mark Completed
                    </Button>
                  )}
                  {(selectedBooking.amountPaid || 0) > 0 && selectedBooking.paymentStatus !== 'refunded' && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => {
                        setRefundAmount(selectedBooking.amountPaid.toString());
                        setRefundModalOpen(true);
                      }}
                      className="border-purple-300 text-purple-800 hover:bg-purple-50 font-bold"
                    >
                      Issue Razorpay Refund
                    </Button>
                  )}
                  {['pending', 'confirmed', 'offered', 'assigned', 'needs_manual_assignment'].includes(selectedBooking.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => {
                        setBookingToCancel(selectedBooking);
                        setConfirmCancelOpen(true);
                      }}
                      className="border-rose-300 text-rose-700 hover:bg-rose-50"
                      icon={XCircle}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </div>

              {/* Assign Driver */}
              {['confirmed', 'pending', 'needs_manual_assignment'].includes(selectedBooking.status) && (
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Manual Chauffeur / Driver Override</h4>
                  <div className="flex items-center gap-2">
                    <Select
                      id="driver-select"
                      value={selectedDriverId}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      options={drivers.map((d) => ({
                        value: d._id,
                        label: `${d.name} (${d.vehicleNumber} - ${d.status})`
                      }))}
                      placeholder="Select Available Driver"
                    />
                    <Button
                      variant="secondary"
                      size="md"
                      disabled={actionLoading || !selectedDriverId}
                      onClick={() => handleAssignDriver(selectedBooking._id)}
                      icon={UserCheck}
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              )}

              {/* Status Audit History Log */}
              {selectedBooking.statusHistory && selectedBooking.statusHistory.length > 0 && (
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Audit History Log</h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2 text-[11px]">
                    {selectedBooking.statusHistory.map((h, index) => (
                      <div key={index} className="flex justify-between items-start border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                        <div>
                          <span className="font-bold text-slate-800 uppercase">{h.status}</span>
                          <span className="text-slate-500 font-medium ml-2">by {h.changedBy}</span>
                          {h.note && <div className="text-slate-600 italic text-[10px]">{h.note}</div>}
                        </div>
                        <span className="text-slate-400 text-[10px] whitespace-nowrap">{new Date(h.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Admin Notes</h4>
                <textarea
                  rows="2"
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <Button variant="outline" size="sm" onClick={() => handleSaveNotes(selectedBooking._id)}>
                  Save Notes
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Refund Action Modal */}
        {refundModalOpen && selectedBooking && (
          <Modal
            isOpen={refundModalOpen}
            onClose={() => setRefundModalOpen(false)}
            title={`Issue Refund - #${selectedBooking.referenceCode}`}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setActionLoading(true);
                try {
                  const res = await adminApi.refundBooking(selectedBooking._id, {
                    amount: refundAmount ? parseFloat(refundAmount) : undefined,
                    reason: refundReason
                  });
                  if (res.success) {
                    alert(res.message);
                    setRefundModalOpen(false);
                    fetchBookings();
                    if (selectedBooking) {
                      setSelectedBooking((prev) => ({ ...prev, paymentStatus: res.data.paymentStatus }));
                    }
                  } else {
                    alert(res.message || 'Refund failed');
                  }
                } catch (err) {
                  alert(err.message);
                } finally {
                  setActionLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900">
                <p><strong>Total Online Amount Paid:</strong> ₹{selectedBooking.amountPaid}</p>
                <p><strong>Razorpay Payment ID:</strong> {selectedBooking.razorpayPaymentId || 'N/A'}</p>
              </div>

              <Input
                id="refund-amount"
                type="number"
                step="1"
                min="1"
                max={selectedBooking.amountPaid}
                label="Refund Amount (₹)"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                helperText={`Leave as ₹${selectedBooking.amountPaid} for full refund, or specify a partial refund amount.`}
                required
              />

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Reason for Refund
                </label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Customer requested ride cancellation"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRefundModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={actionLoading}
                  className="bg-purple-700 hover:bg-purple-800 text-white"
                >
                  {actionLoading ? 'Processing Refund...' : 'Process Razorpay Refund'}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Cancel Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmCancelOpen}
          onClose={() => setConfirmCancelOpen(false)}
          onConfirm={() => {
            if (bookingToCancel) {
              handleUpdateStatus(bookingToCancel._id, 'cancelled');
            }
          }}
          title="Cancel Cab Booking"
          message={`Are you sure you want to cancel booking #${bookingToCancel?.referenceCode}? This action cannot be reversed.`}
          confirmText="Yes, Cancel Booking"
          isDanger
        />
      </div>
    </AdminLayout>
  );
}

