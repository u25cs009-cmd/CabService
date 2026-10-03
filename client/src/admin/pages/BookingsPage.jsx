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
  }, [page, statusFilter, startDate, endDate]);

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
                { value: '', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'assigned', label: 'Driver Assigned' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
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

            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="md" fullWidth>
                Apply
              </Button>
              <Button
                type="button"
                variant="emerald"
                size="md"
                onClick={handleExportCSV}
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
                    <th className="py-3 px-4">Fare</th>
                    <th className="py-3 px-4">Status</th>
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
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">₹{b.estimatedFare}</td>
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
                <span className="text-xs font-bold text-slate-500 uppercase">Current Status</span>
                <StatusBadge status={selectedBooking.status} />
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
                <div className="flex justify-between"><span className="text-slate-400">Estimated Fare:</span><span className="font-bold text-amber-700 text-sm">₹{selectedBooking.estimatedFare}</span></div>
              </div>

              {/* Actions & Status Change Controls */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBooking.status === 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(selectedBooking._id, 'confirmed')}
                      icon={CheckCircle}
                    >
                      Confirm Booking
                    </Button>
                  )}
                  {['confirmed', 'assigned'].includes(selectedBooking.status) && (
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
                  {['pending', 'confirmed', 'assigned'].includes(selectedBooking.status) && (
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
              {['confirmed', 'pending'].includes(selectedBooking.status) && (
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Assign Chauffeur / Driver</h4>
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
