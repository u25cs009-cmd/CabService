import React from 'react';
import { Helmet } from 'react-helmet-async';
import Layout from '../components/layout/Layout';
import { FileText, ShieldAlert, CreditCard, Clock, RefreshCw } from 'lucide-react';

export default function TermsPage() {
  return (
    <Layout>
      <Helmet>
        <title>Terms of Service & Ride Conditions - Pi-Pip-Pip Cabs</title>
        <meta name="description" content="Terms and conditions for booking rides, cancellations, refunds, driver payments, and passenger rules with Pi-Pip-Pip Cab Service." />
      </Helmet>

      {/* Page Header Banner */}
      <section className="bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-slate-100 text-slate-900 py-12 border-b border-amber-200/80">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
            Legal Terms & Guidelines
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 text-slate-900">
            Terms of Service
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
            Please read these terms carefully before booking or using Pi-Pip-Pip Cab Service.
          </p>
        </div>
      </section>

      {/* Main Terms Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
              <FileText className="w-5 h-5 text-amber-600" />
              <h2>1. Ride Booking & Confirmation</h2>
            </div>
            <p>
              By placing a booking through our website or mobile application, you confirm that all pickup details, customer contact numbers, and destination locations provided are accurate. Bookings are subject to cab and driver availability.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
              <CreditCard className="w-5 h-5 text-amber-600" />
              <h2>2. Fares, Tolls & Payments</h2>
            </div>
            <p>
              Estimated fares are computed based on distance, trip category (Local, Outstation, Airport), vehicle tier, and active fare rules. Final fares may adjust for extra distance, waiting time, or toll/parking taxes incurred during the ride. Payments can be made online via Razorpay or cash/UPI directly to the assigned driver.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
              <RefreshCw className="w-5 h-5 text-amber-600" />
              <h2>3. Cancellation & Refund Policy</h2>
            </div>
            <p>
              Customers may cancel bookings prior to driver arrival without penalty. If an advance deposit was paid online via Razorpay, refunds are processed to the original payment method within 5-7 business days according to standard banking timelines.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <h2>4. Passenger Responsibilities & Safety</h2>
            </div>
            <p>
              Passengers must adhere to local safety laws, seatbelt regulations, and refrain from hazardous or illegal behavior inside the vehicle. The driver reserves the right to refuse service if safety guidelines are breached.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2>5. Contact & Customer Care</h2>
            </div>
            <p>
              For inquiries, booking support, or feedback, please contact our helpline:
              <br />
              <strong>Customer Support:</strong> +91 6201901834 | <strong>Email:</strong> support@pipippip.com
            </p>
          </section>
        </div>
      </main>
    </Layout>
  );
}
