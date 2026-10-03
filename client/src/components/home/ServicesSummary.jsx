import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Compass, Plane, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { servicesData } from '../../data/services';
import Card from '../common/Card';
import Button from '../common/Button';

export default function ServicesSummary() {
  const iconMap = {
    Car: Car,
    Compass: Compass,
    Plane: Plane,
    Clock: Clock
  };

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            Tailored Cab Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Premium Ride Services
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From quick city commutes to long-distance intercity journeys and punctual airport pickups, we offer cab options tailored to your schedule.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesData.map((service) => {
            const IconComponent = iconMap[service.iconName] || Car;
            return (
              <Card key={service.id} className="flex flex-col justify-between hover:border-amber-400">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold flex items-center justify-center shadow-md shadow-amber-500/20">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                      {service.tagline}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5">{service.name}</h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {service.shortDesc}
                  </p>

                  <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                    {service.highlights.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link to={`/book?service=${service.id}`}>
                    <Button variant="outline" fullWidth size="sm" icon={ArrowRight} iconPosition="right">
                      Book {service.name}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
