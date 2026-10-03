import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Phone, Menu, X, CalendarCheck, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../../config/site';
import Button from '../common/Button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Vehicles', path: '/vehicles' },
    { name: 'Book A Cab', path: '/book' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-900 shadow-xs transition-all">
      {/* Top Notification / Contact Strip */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 py-1.5 px-4 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
            <span>24/7 Reliable & Sanitized Cab Service • Direct Doorstep Pickup</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <a
              href={`tel:${siteConfig.phoneRaw}`}
              className="flex items-center gap-1 hover:underline text-slate-950 font-bold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call: {siteConfig.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                {siteConfig.name}
              </span>
              <span className="text-[10px] text-slate-500 tracking-wider font-semibold uppercase -mt-1">
                Cab Service
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'bg-amber-500/15 text-amber-800 font-bold border border-amber-500/30'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/book">
              <Button variant="primary" size="md" icon={CalendarCheck}>
                Book Cab Now
              </Button>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <a
              href={`tel:${siteConfig.phoneRaw}`}
              className="p-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1"
              aria-label="Call Cab Service"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 focus:outline-none"
              aria-label={isOpen ? "Close main menu" : "Open main menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                isActive(link.path)
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2">
            <Link to="/book" onClick={() => setIsOpen(false)}>
              <Button variant="primary" fullWidth size="lg" icon={CalendarCheck}>
                Book Cab Now
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
