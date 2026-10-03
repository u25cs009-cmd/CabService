import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { siteConfig } from '../../config/site';

export default function FloatingActionButtons() {
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent('Hello! I would like to inquire about booking a cab.')}`;
  const phoneUrl = `tel:${siteConfig.phoneRaw}`;

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col gap-3 items-end pointer-events-auto">
      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group relative flex items-center justify-center w-13 h-13 rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-600/40 hover:bg-emerald-500 hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <MessageCircle className="w-7 h-7" />
        {/* Tooltip text */}
        <span className="absolute right-15 bg-slate-900 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
          Chat on WhatsApp
        </span>
        {/* Pulse ring animation */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping pointer-events-none -z-10" />
      </a>

      {/* Call Button */}
      <a
        href={phoneUrl}
        aria-label="Call Cab Service"
        className="group relative flex items-center justify-center w-13 h-13 rounded-full bg-amber-500 text-slate-950 font-bold shadow-xl shadow-amber-500/40 hover:bg-amber-400 hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <Phone className="w-6 h-6" />
        {/* Tooltip text */}
        <span className="absolute right-15 bg-slate-900 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden sm:block">
          Call Now: {siteConfig.phone}
        </span>
      </a>
    </div>
  );
}
