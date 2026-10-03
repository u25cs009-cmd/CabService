import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ShieldCheck, Clock, Award, Phone, CalendarCheck, ArrowRight, Star } from 'lucide-react';
import { siteConfig } from '../../config/site';
import Button from '../common/Button';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-amber-500/10 via-amber-100/20 to-slate-50 text-slate-900 overflow-hidden py-16 lg:py-24 border-b border-slate-200">
      {/* Background Subtle Accent Circles */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{siteConfig.tagline}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Premium & Affordable <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600">
                Cab Rides Anytime
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              {siteConfig.description} Instant doorstep pickup, clean air-conditioned vehicles, and verified polite drivers with zero hidden costs.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/book" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" fullWidth icon={CalendarCheck} iconPosition="left">
                  Book a Cab Now
                </Button>
              </Link>

              <a href={`tel:${siteConfig.phoneRaw}`} className="w-full sm:w-auto">
                <Button variant="outline" size="lg" fullWidth icon={Phone} className="bg-white border-slate-300 text-slate-900 hover:bg-slate-100">
                  Call: {siteConfig.phone}
                </Button>
              </a>
            </div>

            {/* Feature Highlights Grid */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200">
              {[
                { icon: ShieldCheck, title: "Sanitized Cabs", desc: "Clean & Safe" },
                { icon: Clock, title: "24/7 Service", desc: "Round the clock" },
                { icon: Award, title: "Top Rated", desc: "4.9 ★ Rating" },
                { icon: Car, title: "Flat Rates", desc: "No surge pricing" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center lg:items-start space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-900">{item.title}</span>
                  <span className="text-xs text-slate-600 font-medium">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/95 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Instant Ride Booking</h3>
                  <p className="text-xs text-slate-500 font-medium">Select service type & request cab</p>
                </div>
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-3">
                {[
                  { name: "Local City Ride", rate: "From ₹300", tag: "Point to Point" },
                  { name: "Airport Transfer", rate: "Flat Rates", tag: "Flight Tracking" },
                  { name: "Outstation Drop", rate: "From ₹12/km", tag: "Intercity" },
                  { name: "Hourly Rental", rate: "Flexible", tag: "Multi-stop" }
                ].map((s, i) => (
                  <Link
                    key={i}
                    to="/book"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-400 hover:bg-amber-50/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">{s.name}</span>
                        <span className="text-[11px] text-slate-500 font-medium">{s.tag}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-amber-700">{s.rate}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="pt-2">
                <Link to="/vehicles">
                  <Button variant="outline" fullWidth size="md" className="bg-white border-slate-300 text-slate-800 hover:bg-slate-100 font-semibold">
                    Explore Vehicle Options & Rates
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
