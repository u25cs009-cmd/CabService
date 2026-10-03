import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Car, Users, Briefcase, Tag, CalendarCheck, ShieldCheck } from 'lucide-react';
import { siteConfig } from '../config/site';
import { vehiclesData as localVehicles } from '../data/vehicles';
import { fetchVehicles } from '../services/api';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState(localVehicles);

  useEffect(() => {
    fetchVehicles().then((data) => {
      if (data && data.length > 0) {
        setVehicles(data);
      }
    });
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>{`Vehicle Fleet & Fare Rates - Hatchback, Sedan, SUV | ${siteConfig.name}`}</title>
        <meta name="description" content="View our sanitized cab fleet: Hatchbacks, Sedans, SUVs, and Tempo Travellers. Compare passenger capacity, luggage room, per-km rates, and minimum fares." />
      </Helmet>

      {/* Page Header Banner */}
      <section className="bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-slate-100 text-slate-900 py-14 border-b border-amber-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
            Transparent Pricing
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3 text-slate-900">
            Vehicle Fleet & Transparent Rates
          </h1>
          <p className="text-slate-700 text-sm sm:text-base mt-3 leading-relaxed font-medium">
            All vehicles are equipped with dual air conditioning, clean seats, GPS tracking, and experienced drivers.
          </p>
        </div>
      </section>

      {/* Fleet Cards Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => {
              const vId = vehicle.vehicleId || vehicle.id || vehicle.type;
              const minFareVal = vehicle.baseFare || vehicle.minFare;
              const luggageVal = vehicle.luggageCapacity || vehicle.luggage;

              return (
                <Card key={vId} className="flex flex-col justify-between hover:border-amber-400 border-2 bg-white">
                  <div className="space-y-4">
                    {/* Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/30">
                        {vehicle.badge || 'Available Cab'}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        AC Enabled
                      </span>
                    </div>

                    {/* Icon & Title */}
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center font-bold mb-3">
                        <Car className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{vehicle.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 italic font-medium">{vehicle.models}</p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {vehicle.description}
                    </p>

                    {/* Specifications */}
                    <div className="space-y-2 py-3 border-y border-slate-100 text-xs font-medium">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Users className="w-4 h-4 text-amber-600" />
                          <span>Passenger Capacity:</span>
                        </span>
                        <span className="font-bold text-slate-900">{vehicle.seats} Seats</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Briefcase className="w-4 h-4 text-amber-600" />
                          <span>Luggage Space:</span>
                        </span>
                        <span className="font-bold text-slate-900">{luggageVal} Bags</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Tag className="w-4 h-4 text-amber-600" />
                          <span>Rate Per KM:</span>
                        </span>
                        <span className="font-bold text-amber-700 text-sm">₹{vehicle.ratePerKm} / km</span>
                      </div>

                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span>Minimum Base Fare:</span>
                        </span>
                        <span className="font-bold text-slate-900">₹{minFareVal}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <Link to={`/book?vehicle=${vId}`}>
                      <Button variant="primary" fullWidth size="md" icon={CalendarCheck}>
                        Book This Vehicle
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
