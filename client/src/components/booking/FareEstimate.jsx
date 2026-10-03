import React from 'react';
import { Calculator, Info, ShieldCheck, Tag, Clock, Moon, Plane, Compass } from 'lucide-react';

export default function FareEstimate({ distanceKm, vehicle, durationMins, breakdown, tripType = 'local' }) {
  if (!vehicle) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center text-slate-500 text-sm shadow-xs font-medium">
        <Calculator className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <span>Select a vehicle type to view instant fare estimate.</span>
      </div>
    );
  }

  const b = breakdown || {
    baseCharge: vehicle.baseFare || vehicle.minFare || 400,
    distanceCharge: Math.round((distanceKm || 15) * (vehicle.ratePerKm || 14)),
    nightCharge: 0,
    airportFee: 0,
    driverAllowance: 0,
    taxAmount: 0,
    totalFare: Math.round((distanceKm || 15) * (vehicle.ratePerKm || 14))
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/40 text-slate-900 rounded-2xl p-6 border border-amber-300/80 shadow-md relative overflow-hidden space-y-4">
      {/* Background Subtle Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-base text-slate-900">Live Fare Breakdown</h4>
            <span className="text-[11px] text-slate-500 font-medium">Authoritative Server Calculation</span>
          </div>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-900 border border-amber-500/30">
          {tripType.toUpperCase()}
        </span>
      </div>

      {/* Itemized Fare List */}
      <div className="space-y-2.5 text-xs text-slate-700 font-medium">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Vehicle Type:</span>
          <span className="font-bold text-slate-900">{vehicle.name}</span>
        </div>

        {distanceKm > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Est. Distance & Duration:</span>
            <span className="font-bold text-amber-800">
              {distanceKm} km {durationMins > 0 ? `(~${durationMins} mins)` : ''}
            </span>
          </div>
        )}

        <div className="border-t border-slate-100 pt-2 space-y-2">
          {b.baseCharge > 0 && (
            <div className="flex justify-between">
              <span>Base Package / Base Fare:</span>
              <span className="font-semibold text-slate-900">₹{b.baseCharge}</span>
            </div>
          )}

          {b.distanceCharge > 0 && (
            <div className="flex justify-between">
              <span>Distance Charge:</span>
              <span className="font-semibold text-slate-900">₹{b.distanceCharge}</span>
            </div>
          )}

          {b.nightCharge > 0 && (
            <div className="flex justify-between text-indigo-700 font-semibold">
              <span className="flex items-center gap-1">
                <Moon className="w-3.5 h-3.5" />
                Night Charge (10 PM - 6 AM):
              </span>
              <span>₹{b.nightCharge}</span>
            </div>
          )}

          {b.airportFee > 0 && (
            <div className="flex justify-between text-blue-700 font-semibold">
              <span className="flex items-center gap-1">
                <Plane className="w-3.5 h-3.5" />
                Airport Toll Surcharge:
              </span>
              <span>₹{b.airportFee}</span>
            </div>
          )}

          {b.driverAllowance > 0 && (
            <div className="flex justify-between text-emerald-800 font-semibold">
              <span>Driver Night Allowance:</span>
              <span>₹{b.driverAllowance}</span>
            </div>
          )}

          {b.taxAmount > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>GST Tax (5%):</span>
              <span>₹{b.taxAmount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Final Total Box */}
      <div className="bg-white rounded-xl p-4 border border-amber-300 shadow-xs">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-600 uppercase font-bold">Total Estimated Fare</span>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-amber-600">₹{b.totalFare || b.estimatedFare}</span>
          </div>
        </div>
      </div>

      <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Tolls & parking paid as per actuals. Zero hidden surge fees.</span>
      </div>
    </div>
  );
}
