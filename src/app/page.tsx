import React from 'react';
import { Metadata } from 'next';
import { LandingNav } from '@/components/landing/LandingNav';
import { HeroSection } from '@/components/landing/HeroSection';
import { ThreePillarsSection } from '@/components/landing/ThreePillarsSection';
import { CompetitiveRankPreview } from '@/components/landing/CompetitiveRankPreview';
import { PricingGrid } from '@/components/landing/PricingGrid';
import { ConversionCtaSection } from '@/components/landing/ConversionCtaSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata: Metadata = {
  title: "Master Your Brand's Visibility Across Conversational AI Engines | Radiant Maxwell",
  description:
    'Track, benchmark, and optimize your Answer Engine Optimization (AEO), Generative Engine Optimization (GEO), and AI Optimization (AIO) performance across ChatGPT, Perplexity, Gemini, Claude, and more.',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Global Sticky Navigation */}
      <LandingNav />

      {/* Main Landing Page Sections */}
      <main className="flex-1">
        {/* 1. Hero Section with KPI Cards Preview */}
        <HeroSection />

        {/* 2. Core Value Proposition: The Three Pillars (AIO, AEO, GEO) */}
        <ThreePillarsSection />

        {/* 3. Competitive Benchmarking Feature Preview */}
        <CompetitiveRankPreview />

        {/* 4. Transparent Pricing Preview */}
        <PricingGrid />

        {/* 5. Final Conversion Footer CTA */}
        <ConversionCtaSection />
      </main>

      {/* Clean Global Footer */}
      <LandingFooter />
    </div>
  );
}
