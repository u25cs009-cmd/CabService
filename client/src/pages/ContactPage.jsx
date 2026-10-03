import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2, Map } from 'lucide-react';
import { siteConfig } from '../config/site';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Layout>
      <Helmet>
        <title>{`Contact Us - 24/7 Cab Customer Support | ${siteConfig.name}`}</title>
        <meta name="description" content={`Get in touch with ${siteConfig.name}. Call ${siteConfig.phone} or chat on WhatsApp for cab bookings, corporate rentals, and inquiries.`} />
      </Helmet>

      {/* Page Header */}
      <section className="bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-slate-100 text-slate-900 py-14 border-b border-amber-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
            We are Here to Help
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-3 text-slate-900">
            Contact & Customer Support
          </h1>
          <p className="text-slate-700 text-sm sm:text-base mt-3 leading-relaxed font-medium">
            Reach out to our 24/7 dispatch desk for quick bookings, custom outstation quotes, or corporate inquiries.
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details Column */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="bg-gradient-to-br from-amber-50 to-white text-slate-900 border-amber-300 shadow-sm space-y-6">
                <h3 className="text-xl font-bold border-b border-amber-200/80 pb-3 text-amber-900">
                  Direct Contact Information
                </h3>

                <ul className="space-y-5 text-sm font-medium">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 font-bold">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Phone Support (24/7)</span>
                      <a href={`tel:${siteConfig.phoneRaw}`} className="font-bold text-lg text-slate-900 hover:text-amber-700 transition-colors">
                        {siteConfig.phone}
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-800 flex items-center justify-center shrink-0 font-bold">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">WhatsApp Chat</span>
                      <a
                        href={`https://wa.me/${siteConfig.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-base text-emerald-700 hover:underline"
                      >
                        Start WhatsApp Chat
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 font-bold">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Email Address</span>
                      <a href={`mailto:${siteConfig.email}`} className="font-semibold text-slate-800 hover:text-amber-700 transition-colors">
                        {siteConfig.email}
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 font-bold">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Central Hub Address</span>
                      <span className="font-semibold text-slate-800">{siteConfig.address}</span>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0 font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Operating Hours</span>
                      <span className="font-semibold text-slate-800">{siteConfig.operatingHours}</span>
                    </div>
                  </li>
                </ul>
              </Card>

              {/* Interactive Map Placeholder Box */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Map className="w-4 h-4 text-amber-600" />
                  <span>Central Operations Hub Location</span>
                </div>
                <div className="w-full h-48 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-500 text-xs p-4 text-center border border-dashed border-slate-300">
                  <MapPin className="w-8 h-8 text-amber-600 mb-1" />
                  <span className="font-bold text-slate-800">{siteConfig.address}</span>
                  <span className="text-[11px] text-slate-500 mt-1">Embedded map placeholder</span>
                </div>
              </div>
            </div>

            {/* Quick Inquiry Form Column */}
            <div className="lg:col-span-7">
              <Card className="shadow-md border border-slate-200/90 space-y-5 bg-white">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-xl font-bold text-slate-900">Send an Inquiry</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Have questions regarding corporate tie-ups or long-term cab rentals? Drop a message below.
                  </p>
                </div>

                {submitted ? (
                  <div className="p-8 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="text-lg font-bold text-emerald-950">Inquiry Received!</h4>
                    <p className="text-xs text-emerald-800">Thank you for reaching out. Our team will contact you shortly.</p>
                    <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      id="contact-name"
                      label="Your Name"
                      placeholder="e.g. Priya Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        id="contact-phone"
                        type="tel"
                        label="Phone Number"
                        placeholder="10-digit number"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />

                      <Input
                        id="contact-email"
                        type="email"
                        label="Email Address"
                        placeholder="name@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-message" className="text-sm font-semibold text-slate-700">
                        Your Message <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        rows="4"
                        placeholder="Detail your inquiry or requirement..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                        className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 hover:border-slate-400"
                      />
                    </div>

                    <div className="pt-2">
                      <Button type="submit" variant="primary" size="lg" fullWidth icon={Send}>
                        Send Message
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
