import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Car, Compass, Plane, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { siteConfig } from '../config/site';
import { servicesData } from '../data/services';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';

export default function ServicesPage() {
  const iconMap = {
    Car: Car,
    Compass: Compass,
    Plane: Plane,
    Clock: Clock
  };

  return (
    <Layout>
      <Helmet>
        <title>{`Cab Services - Local, Outstation, Airport & Rental | ${siteConfig.name}`}</title>
        <meta name="description" content="Explore our complete range of cab services including local point-to-point rides, outstation intercity drops, punctual airport transfers, and hourly rentals." />
      </Helmet>

      {/* Page Header Banner */}
      <section className="bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-slate-100 text-slate-900 py-14 border-b border-amber-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
            Our Ride Options
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3 text-slate-900">
            Cab Services & Travel Solutions
          </h1>
          <p className="text-slate-700 text-sm sm:text-base mt-3 leading-relaxed font-medium">
            Choose from tailored ride packages designed to fit your exact transit needs—whether commuting locally, flying out, or planning intercity travel.
          </p>
        </div>
      </section>

      {/* Services List Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {servicesData.map((service) => {
            const IconComponent = iconMap[service.iconName] || Car;

            return (
              <div
                key={service.id}
                id={service.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:border-amber-400 transition-colors"
              >
                {/* Icon & Title */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      {service.tagline}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold mt-1 text-slate-900">
                      {service.name}
                    </h2>
                  </div>
                </div>

                {/* Description & Features */}
                <div className="lg:col-span-8 space-y-6">
                  <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-medium">
                    {service.fullDesc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link to={`/book?service=${service.id}`}>
                      <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
                        Book {service.name} Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
