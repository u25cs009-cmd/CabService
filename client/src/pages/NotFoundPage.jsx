import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Car, Home, Phone } from 'lucide-react';
import { siteConfig } from '../config/site';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <Layout>
      <Helmet>
        <title>{`404 - Page Not Found | ${siteConfig.name}`}</title>
      </Helmet>

      <section className="py-24 bg-slate-50 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mx-auto font-bold text-2xl shadow-inner">
            <Car className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-6xl font-black text-slate-900 tracking-tight">404</span>
            <h1 className="text-2xl font-bold text-slate-800">Page Not Found</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              The page or route you are looking for doesn't exist or has been moved. Let's get you back on track!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="primary" size="md" icon={Home} fullWidth>
                Back to Home
              </Button>
            </Link>
            <Link to="/book" className="w-full sm:w-auto">
              <Button variant="outline" size="md" icon={Car} fullWidth>
                Book a Cab
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
