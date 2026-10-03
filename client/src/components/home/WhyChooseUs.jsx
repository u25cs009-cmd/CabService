import React from 'react';
import { ShieldCheck, DollarSign, UserCheck, Sparkles, Clock, MapPin } from 'lucide-react';
import Card from '../common/Card';

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: DollarSign,
      title: "Zero Surge Pricing",
      desc: "Upfront transparent fare calculations with no hidden fees or peak surge charges."
    },
    {
      icon: UserCheck,
      title: "Verified Drivers",
      desc: "Polite, experienced, and background-checked drivers trained for safe driving."
    },
    {
      icon: Sparkles,
      title: "Sanitized & AC Cabs",
      desc: "Thoroughly cleaned, well-maintained vehicles for maximum comfort on every trip."
    },
    {
      icon: Clock,
      title: "Punctual & 24/7 Available",
      desc: "Guaranteed on-time arrivals for flight drops, late-night emergencies, and morning rides."
    },
    {
      icon: MapPin,
      title: "Doorstep Pickup",
      desc: "We pick you up directly from your home, office, or airport terminal."
    },
    {
      icon: ShieldCheck,
      title: "Safe & Reliable Travel",
      desc: "Complete safety tracking, SOS support, and dependable customer service."
    }
  ];

  return (
    <section className="py-16 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Our Standard of Excellence
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Choose Our Cab Service?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            We prioritize your safety, comfort, and time. Discover why thousands of commuters trust us for their daily and outstation travel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((item, idx) => (
            <Card key={idx} className="flex gap-4 p-5 hover:border-amber-400">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
