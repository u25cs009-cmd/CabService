import React from 'react';
import { Helmet } from 'react-helmet-async';
import { siteConfig } from '../config/site';
import Layout from '../components/layout/Layout';
import BookingForm from '../components/booking/BookingForm';
import { ShieldCheck, HelpCircle } from 'lucide-react';

export default function BookingPage() {
  return (
    <Layout>
      <Helmet>
        <title>{`Book a Cab Online - Instant Ride Confirmation | ${siteConfig.name}`}</title>
        <meta name="description" content="Book a cab online for local rides, outstation trips, and airport transfers. Instant WhatsApp dispatch, zero advance payment needed." />
      </Helmet>

      {/* Page Header Banner */}
      <section className="bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-slate-100 text-slate-900 py-12 border-b border-amber-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
            Quick & Simple Booking
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3 text-slate-900">
            Book Your Ride Online
          </h1>
          <p className="text-slate-700 text-sm sm:text-base mt-2 font-medium">
            Fill out the ride details below for an instant fare estimate and WhatsApp confirmation.
          </p>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingForm />

          {/* Quick FAQ / Guarantee Strip */}
          <div className="mt-12 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Zero Cancellation Fee</h4>
                <p className="text-xs text-slate-600 font-medium">Cancel or modify your trip plans anytime before driver dispatch with zero penalties.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">No Advance Payment</h4>
                <p className="text-xs text-slate-600 font-medium">Pay directly to the driver via Cash or UPI (Google Pay, PhonePe, Paytm) after completing your trip.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <HelpCircle className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">Need Special Assistance?</h4>
                <p className="text-xs text-slate-600 font-medium">Call our 24/7 hotline directly at <a href={`tel:${siteConfig.phoneRaw}`} className="text-amber-700 font-bold">{siteConfig.phone}</a>.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
