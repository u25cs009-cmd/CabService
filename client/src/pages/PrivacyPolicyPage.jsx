import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { ShieldCheck, MapPin, Lock, Trash2, Clock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      <Helmet>
        <title>Privacy & Location Data Policy - Pi-Pip-Pip Cabs</title>
        <meta name="description" content="Pi-Pip-Pip Cab Service Privacy Policy detailing live GPS location processing, retention, and 30-day automated deletion policies." />
      </Helmet>

      <Navbar />

      <main className="max-w-4xl mx-auto w-full px-4 py-12 flex-grow space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-3xl mx-auto">
            🛡️
          </div>
          <h1 className="text-3xl font-extrabold text-amber-500">Privacy & Location Data Policy</h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            We prioritize passenger safety and driver privacy with transparent GPS collection rules and automated data retention policies.
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
              <MapPin className="w-5 h-5" />
              <h2>1. Live GPS Location Processing</h2>
            </div>
            <p>
              Pi-Pip-Pip Cab Service collects real-time geographic location coordinates (latitude, longitude, heading, and speed) from registered driver devices. Location data collection occurs <strong>exclusively</strong> under the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li>When a driver explicitly toggles their status to <strong>ONLINE</strong> on the Driver App.</li>
              <li>During an active trip lifecycle (assigned, heading to pickup, or in progress).</li>
            </ul>
            <p className="text-xs text-emerald-400 font-medium">
              ✓ Location collection terminates automatically when the driver switches duty status to OFFLINE.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-700/60 pt-6">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
              <Lock className="w-5 h-5" />
              <h2>2. Customer & Driver Data Protection</h2>
            </div>
            <p>
              To protect both driver and passenger safety:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
              <li>Live driver GPS position and driver phone numbers are masked and hidden from public view.</li>
              <li>Location data is shared only with the specific customer assigned to a ride via an unguessable tracking link (<code>/track/:token</code>).</li>
              <li>Customer live tracking links automatically deactivate 1 hour after ride completion or cancellation.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-slate-700/60 pt-6">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
              <Trash2 className="w-5 h-5" />
              <h2>3. Data Retention & 30-Day Auto-Deletion</h2>
            </div>
            <p>
              Historical route trail data recorded during completed rides is maintained solely for audit, billing verification, and safety inquiries.
            </p>
            <p className="text-xs text-slate-400">
              In accordance with our strict data retention policy, all historical route trails (GPS breadcrumb logs) older than <strong>30 days</strong> are automatically purged and permanently deleted from our database servers.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-700/60 pt-6">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
              <Clock className="w-5 h-5" />
              <h2>4. Contact Us for Privacy Inquiries</h2>
            </div>
            <p className="text-xs text-slate-400">
              If you have any questions regarding your location privacy rights or request manual deletion of your personal account data, please contact our Data Protection Officer at:
              <br />
              <strong className="text-slate-200">Email:</strong> yashiadarsh2020@gmail.com | <strong className="text-slate-200">Phone:</strong> +91 6201901834
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
