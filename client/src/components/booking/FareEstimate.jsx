import React from 'react';
import { Calculator, Info, ShieldCheck } from 'lucide-react';
import { calculateFare } from '../../utils/fare';

export default function FareEstimate({ distanceKm, vehicle }) {
  if (!vehicle) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center text-slate-500 text-sm shadow-xs">
        <Calculator className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <span>Select a vehicle type to view instant fare estimate.</span>
      </div>
    );
  }

  const { estimatedFare, minFareUsed, ratePerKm, minFare, distanceKm: parsedDistance } = calculateFare(distanceKm, vehicle);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-white text-slate-900 rounded-2xl p-6 border border-amber-300/80 shadow-md relative overflow-hidden">
      {/* Background Subtle Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between border-b border-amber-200/80 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-base text-slate-900">Estimated Fare</h4>
        </div>
        <span className="text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-900 border border-amber-500/30">
          Estimate Only
        </span>
      </div>

      <div className="space-y-3 mb-6 text-sm">
        <div className="flex justify-between text-slate-700">
          <span>Vehicle Selected:</span>
          <span className="font-bold text-slate-900">{vehicle.name}</span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span>Rate per KM:</span>
          <span className="font-bold text-slate-900">₹{ratePerKm} / km</span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span>Minimum Fare:</span>
          <span className="font-bold text-slate-900">₹{minFare}</span>
        </div>
        {parsedDistance > 0 && (
          <div className="flex justify-between text-slate-700">
            <span>Trip Distance:</span>
            <span className="font-bold text-amber-800">{parsedDistance} km</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-4 border border-amber-200 shadow-xs mb-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-600 uppercase font-bold">Total Estimated Amount</span>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-amber-600">₹{estimatedFare}</span>
          </div>
        </div>
        {minFareUsed && parsedDistance > 0 && (
          <p className="text-[11px] text-amber-800 font-medium mt-1 flex items-center gap-1">
            <Info className="w-3 h-3 shrink-0 text-amber-600" />
            Minimum fare applied for short distances.
          </p>
        )}
      </div>

      <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5 pt-2 border-t border-amber-200/80">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Tolls, parking, and state tax (if applicable) are paid separately.</span>
      </div>
    </div>
  );
}
