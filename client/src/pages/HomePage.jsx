import React from 'react';
import { Helmet } from 'react-helmet-async';
import { siteConfig } from '../config/site';
import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import ServicesSummary from '../components/home/ServicesSummary';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Testimonials from '../components/home/Testimonials';
import ContactStrip from '../components/home/ContactStrip';

export default function HomePage() {
  return (
    <Layout>
      <Helmet>
        <title>{`${siteConfig.name} - ${siteConfig.tagline}`}</title>
        <meta name="description" content={siteConfig.description} />
      </Helmet>

      <Hero />
      <ServicesSummary />
      <WhyChooseUs />
      <Testimonials />
      <ContactStrip />
    </Layout>
  );
}
