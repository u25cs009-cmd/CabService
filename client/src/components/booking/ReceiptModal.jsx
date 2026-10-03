import React, { useRef } from 'react';
import { Printer, Download, CheckCircle, ShieldCheck, Car, Phone, Mail, MapPin, Calendar, Clock, CreditCard } from 'lucide-react';
import Button from '../common/Button';

export default function ReceiptModal({ booking, onClose }) {
  const receiptRef = useRef(null);

  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const isFullPaid = booking.paymentStatus === 'paid';
  const isPartialPaid = booking.paymentStatus === 'partial';
  const amountPaid = booking.amountPaid || 0;
  const totalFare = booking.estimatedFare || 0;
  const balanceDue = Math.max(0, totalFare - amountPaid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        {/* Top Header / Actions Bar (Hidden on print) */}
        <div className="print:hidden bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">Official Ride Payment Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            {booking.trackingToken && (
              <a
                href={`/track/${booking.trackingToken}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs font-extrabold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1 transition"
              >
                📍 Live Track Cab
              </a>
            )}
            <Button variant="emerald" size="sm" onClick={handlePrint} icon={Printer}>
              Print / Save PDF
            </Button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 rounded-lg"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Printable Area */}
        <div ref={receiptRef} className="p-6 sm:p-8 bg-white text-slate-800 space-y-6 print:p-0 print:space-y-4">
          {/* Brand Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-950">
                <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg">Pi-Pip-Pip</span>
                <span>Cabs</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">Premium & Reliable Taxi Services Across Patna & Bihar</p>
              <p className="text-xs text-slate-500">Contact: +91 6201901834 • Email: yashiadarsh2020@gmail.com</p>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-block px-3 py-1 bg-amber-100 border border-amber-300 rounded-lg text-amber-950 font-extrabold text-sm mb-1">
                Ref: #{booking.referenceCode}
              </div>
              <p className="text-xs text-slate-500">
                Issue Date: {new Date(booking.createdAt || Date.now()).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Payment Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            isFullPaid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : isPartialPaid
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center gap-3">
              <CheckCircle className={`w-6 h-6 ${isFullPaid ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-75">Payment Status</p>
                <p className="text-base font-extrabold capitalize">{booking.paymentStatus || 'unpaid'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider opacity-75">Amount Paid</p>
              <p className="text-xl font-black">₹{amountPaid}</p>
            </div>
          </div>

          {/* Trip Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-sm">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Info</p>
              <p className="font-bold text-slate-900">{booking.customerName}</p>
              <p className="text-slate-600">{booking.phone}</p>
              {booking.email && <p className="text-slate-600">{booking.email}</p>}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle & Service</p>
              <p className="font-bold text-slate-900">{booking.vehicleName || 'Comfort Cab'}</p>
              <p className="text-slate-600 uppercase font-medium text-xs">{booking.tripType} Service • {booking.passengers} Passengers</p>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" /> Pickup Location
                </p>
                <p className="font-medium text-slate-800 text-xs sm:text-sm">{booking.pickupLocation}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Drop Location
                </p>
                <p className="font-medium text-slate-800 text-xs sm:text-sm">{booking.dropLocation}</p>
              </div>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {new Date(booking.pickupDateTime).toLocaleString()}
              </span>
              <span>Distance: {booking.distanceKm} KM</span>
            </div>
          </div>

          {/* Itemized Fare Breakdown Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Itemized Fare Breakdown</h4>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-bold text-slate-500 uppercase">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {booking.fareBreakdown ? (
                  <>
                    <tr>
                      <td className="py-2 text-slate-700">Base Charge</td>
                      <td className="py-2 text-right font-medium">₹{booking.fareBreakdown.baseCharge || 0}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-700">Distance Charge ({booking.distanceKm} km)</td>
                      <td className="py-2 text-right font-medium">₹{booking.fareBreakdown.distanceCharge || 0}</td>
                    </tr>
                    {booking.fareBreakdown.nightCharge > 0 && (
                      <tr>
                        <td className="py-2 text-slate-700">Night Allowance (15%)</td>
                        <td className="py-2 text-right font-medium">₹{booking.fareBreakdown.nightCharge}</td>
                      </tr>
                    )}
                    {booking.fareBreakdown.airportFee > 0 && (
                      <tr>
                        <td className="py-2 text-slate-700">Airport Convenience Fee</td>
                        <td className="py-2 text-right font-medium">₹{booking.fareBreakdown.airportFee}</td>
                      </tr>
                    )}
                    {booking.fareBreakdown.taxAmount > 0 && (
                      <tr>
                        <td className="py-2 text-slate-700">GST Tax (5%)</td>
                        <td className="py-2 text-right font-medium">₹{booking.fareBreakdown.taxAmount}</td>
                      </tr>
                    )}
                  </>
                ) : (
                  <tr>
                    <td className="py-2 text-slate-700">Estimated Total Fare</td>
                    <td className="py-2 text-right font-medium">₹{totalFare}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 font-extrabold text-slate-900">
                  <td className="py-2 text-base">Total Fare</td>
                  <td className="py-2 text-right text-base">₹{totalFare}</td>
                </tr>
                <tr className="text-emerald-700 font-extrabold">
                  <td className="py-1 text-sm">Online Amount Paid</td>
                  <td className="py-1 text-right text-sm">₹{amountPaid}</td>
                </tr>
                <tr className="text-slate-900 font-bold border-t border-dashed border-slate-300">
                  <td className="py-2 text-sm">Balance Due to Driver</td>
                  <td className="py-2 text-right text-sm text-red-600 font-extrabold">₹{balanceDue}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Transaction Details */}
          {booking.razorpayPaymentId && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <CreditCard className="w-4 h-4 text-slate-400" /> Razorpay Payment Ref ID:
              </span>
              <span className="font-mono font-bold text-slate-800">{booking.razorpayPaymentId}</span>
            </div>
          )}

          {/* Footer Note */}
          <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
            <p>Thank you for traveling with Pi-Pip-Pip Cabs. Have a safe journey!</p>
            <p className="text-[10px] text-slate-400">Computer Generated Tax Receipt • No Signature Required</p>
          </div>
        </div>
      </div>
    </div>
  );
}
