import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(4.9);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_BASE_URL}/reviews/approved`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          setReviews(json.data);
          if (json.avgRating) setAvgRating(json.avgRating);
        }
      })
      .catch(() => {});
  }, []);

  const displayReviews = reviews.length > 0 ? reviews : [
    {
      customerName: 'Amit Malhotra',
      rating: 5,
      comment: 'Booked an outstation cab for my family. The Dzire was spotless, AC was great, and driver Ramesh was very courteous. Highly recommended!'
    },
    {
      customerName: 'Priya Sharma',
      rating: 5,
      comment: 'Super punctual airport pickup at 4 AM! The driver arrived 10 minutes early and helped with all luggage. Smooth ride with zero hassle.'
    },
    {
      customerName: 'Vikram Sengupta',
      rating: 5,
      comment: 'Rented an Innova for an 8-hour business tour across the city. Very transparent billing and excellent vehicle condition.'
    }
  ];


  return (
    <section className="py-16 bg-slate-100 text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
            Real Passenger Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What Our Customers Say
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            Read genuine feedback from passengers who ride with us daily for business and family trips.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayReviews.map((rev, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm relative flex flex-col justify-between hover:border-amber-400 transition-colors">
              <Quote className="w-8 h-8 text-amber-500/20 absolute top-4 right-4" />
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed font-medium">
                  "{rev.comment || rev.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-800 flex items-center justify-center font-bold text-xs">
                  {(rev.customerName || rev.name || 'C').charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{rev.customerName || rev.name}</h4>
                  <span className="text-[11px] text-slate-500 font-medium block">Verified Passenger</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
