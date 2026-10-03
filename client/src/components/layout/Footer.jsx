import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../../config/site';
import { servicesData } from '../../data/services';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-100 text-slate-800 border-t border-slate-200/80">
      {/* Top Callout Banner */}
      <div className="border-b border-amber-200/70 py-10 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-slate-950 mb-1">Need an Immediate Cab Ride?</h3>
            <p className="text-sm text-slate-700 font-medium">Our customer dispatch line is active round-the-clock for instant assistance.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`tel:${siteConfig.phoneRaw}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
            >
              <Phone className="w-4 h-4" />
              <span>Call: {siteConfig.phone}</span>
            </a>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/20"
            >
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Col 1: About */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">{siteConfig.name}</span>
          </Link>
          <p className="text-sm text-slate-600 leading-relaxed">
            {siteConfig.description}
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 bg-amber-500/15 border border-amber-500/30 p-2.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-700" />
            <span>Verified Cars & Experienced Chauffeurs</span>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-3 border-amber-500 pl-2.5">
            Quick Links
          </h4>
          <ul className="space-y-2.5 text-sm font-medium">
            {[
              { name: 'Home', path: '/' },
              { name: 'Our Services', path: '/services' },
              { name: 'Vehicle Fleet & Fares', path: '/vehicles' },
              { name: 'Book a Ride', path: '/book' },
              { name: 'About Us', path: '/about' },
              { name: 'Contact Us', path: '/contact' }
            ].map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="text-slate-700 hover:text-amber-700 flex items-center gap-1.5 transition-colors group"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Services */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-3 border-amber-500 pl-2.5">
            Cab Services
          </h4>
          <ul className="space-y-2.5 text-sm font-medium">
            {servicesData.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/services#${s.id}`}
                  className="text-slate-700 hover:text-amber-700 flex items-center gap-1.5 transition-colors group"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                  <span>{s.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Contact Info */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-3 border-amber-500 pl-2.5">
            Contact & Support
          </h4>
          <ul className="space-y-3 text-sm text-slate-700 font-medium">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{siteConfig.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-amber-600 shrink-0" />
              <a href={`tel:${siteConfig.phoneRaw}`} className="hover:text-amber-700 transition-colors font-semibold">
                {siteConfig.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-amber-600 shrink-0" />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-amber-700 transition-colors">
                {siteConfig.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{siteConfig.operatingHours}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-slate-200 py-6 text-center text-xs text-slate-600 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {year} {siteConfig.name}. All rights reserved.</p>
          <p className="flex items-center justify-center gap-1">
            <span>Fast, Reliable & Sanitized Cab Booking</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
