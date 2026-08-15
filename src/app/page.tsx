import React from 'react';
import { Metadata } from 'next';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { EngineCoverageBanner } from '@/components/landing/EngineCoverageBanner';
import { PricingGrid } from '@/components/landing/PricingGrid';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata: Metadata = {
  title: 'Stop Losing Customers to AI Search | Brand Visibility & GEO Telemetry',
  description:
    'Be the recommended brand when buyers ask ChatGPT, Perplexity, Gemini, and Copilot. Track citations, measure share of voice, and optimize your presence in real-time.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Global Navigation */}
      <LandingNav />

      {/* Main Landing Sections */}
      <main className="flex-1">
        <HeroSection />
        <FeaturesGrid />
        <EngineCoverageBanner />
        <PricingGrid />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
