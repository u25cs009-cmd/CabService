import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Calendar, MapPin, Clock } from 'lucide-react';
import { siteConfig } from '../../config/site';
import Button from '../common/Button';

export default function ContactStrip() {
  return (
    <section className="py-12 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center lg:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
              Ready to Book Your Next Cab Ride?
            </h3>
            <p className="text-sm font-semibold text-slate-800">
              Get an instant cab at your doorstep or schedule your outstation travel with flat rates.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/book">
              <Button variant="secondary" size="lg" icon={Calendar}>
                Book Online
              </Button>
            </Link>

            <a href={`tel:${siteConfig.phoneRaw}`}>
              <Button variant="outline" size="lg" icon={Phone} className="bg-white/80 text-slate-950 border-slate-900 font-bold hover:bg-white">
                Call: {siteConfig.phone}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
