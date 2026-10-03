import React from 'react';
import { Map, MapPin, Navigation } from 'lucide-react';

export default function MapPreview({ pickup, drop, distanceKm, durationMins }) {
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  const hasValidKey = mapsKey && mapsKey !== 'your_google_maps_browser_key';

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
          <Navigation className="w-4 h-4 text-amber-600" />
          <span>Trip Route Preview</span>
        </div>
        {distanceKm > 0 && (
          <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
            {distanceKm} km {durationMins > 0 ? `(~${durationMins} mins)` : ''}
          </span>
        )}
      </div>

      {hasValidKey ? (
        <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200">
          <iframe
            title="Route Preview Map"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps/embed/v1/directions?key=${mapsKey}&origin=${encodeURIComponent(
              pickup || 'City Center'
            )}&destination=${encodeURIComponent(drop || 'Airport')}&mode=driving`}
            allowFullScreen
          />
        </div>
      ) : (
        <div className="w-full h-36 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-4 flex flex-col items-center justify-center text-center space-y-2">
          <div className="flex items-center justify-center gap-3 text-slate-700 font-semibold text-xs">
            <span className="flex items-center gap-1 text-emerald-700">
              <MapPin className="w-4 h-4 text-emerald-600" />
              {pickup || 'Pickup Location'}
            </span>
            <span>→</span>
            <span className="flex items-center gap-1 text-amber-800">
              <MapPin className="w-4 h-4 text-amber-600" />
              {drop || 'Drop Destination'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Route geometry calculated via server</span>
        </div>
      )}
    </div>
  );
}
