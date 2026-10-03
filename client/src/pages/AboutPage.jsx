import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CheckCircle2, CalendarCheck } from 'lucide-react';
import { siteConfig } from '../config/site';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function AboutPage() {
  return (
    <Layout>
      <Helmet>
        <title>{`About Us - Safe & Reliable Cab Service | ${siteConfig.name}`}</title>
        <meta name="description" content={`Learn about ${siteConfig.name}, our commitment to safe and punctual cab services, verified drivers, clean vehicles, and transparent pricing.`} />
      </Helmet>

      {/* Page Header */}
      <section className="bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-slate-100 text-slate-900 py-14 border-b border-amber-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
            Our Story & Commitment
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3 text-slate-900">
            About {siteConfig.name}
          </h1>
          <p className="text-slate-700 text-sm sm:text-base mt-3 leading-relaxed font-medium">
            Providing comfortable, dependable, and affordable cab transit solutions for city commuters and intercity travelers alike.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Mission & Story Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Punctual & Customer-Centric
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Dedicated to Making Every Ride Safe, Clean & Comfortable
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Founded with a mission to eliminate surge pricing and unexpected delays, {siteConfig.name} connects travelers with professional chauffeurs and well-maintained vehicles for hassle-free travel.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Whether you need a quick 10-minute city drop, an early morning flight transfer, or a multi-day outstation vacation cab, our dispatch team ensures your ride arrives on schedule, clean, and fully sanitized.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  "100% Background Checked Drivers",
                  "Air-Conditioned Vehicles",
                  "24/7 Dispatch Desk",
                  "No Hidden Surge Charges"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Card Grid */}
            <div className="grid grid-cols-2 gap-4">
              {siteConfig.stats.map((stat, idx) => (
                <Card key={idx} className="text-center p-6 border-amber-300 bg-white shadow-xs">
                  <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 block mb-1">
                    {stat.value}
                  </span>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </Card>
              ))}
            </div>
          </div>

          {/* Safety & Standards Cards */}
          <div className="bg-amber-500/10 rounded-3xl p-8 sm:p-12 space-y-8 border border-amber-200/80">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">Our 4 Pillars of Excellence</h3>
              <p className="text-xs text-slate-600 font-medium">Strict quality checks implemented for every vehicle operating under our fleet.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Driver Verification", desc: "Thorough background checks, verified commercial licenses, and defensive driving training." },
                { title: "Fleet Maintenance", desc: "Regular mechanical servicing, tire checks, and vehicle safety inspections before every outstation trip." },
                { title: "Transparent Pricing", desc: "Upfront pricing agreement based on distance or package, with zero surprise fees." },
                { title: "24/7 Helpline", desc: "Live dispatch support to assist with location navigation, timing updates, and trip assistance." }
              ].map((p, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-sm">
                    0{i + 1}
                  </div>
                  <h4 className="font-bold text-base text-slate-900">{p.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{p.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <Link to="/book">
                <Button variant="primary" size="lg" icon={CalendarCheck}>
                  Book Your Cab Ride Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
