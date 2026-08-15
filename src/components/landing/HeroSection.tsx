'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Sparkles,
  PlayCircle,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Search,
} from 'lucide-react';
import { DashboardPreviewMockup } from './DashboardPreviewMockup';
import { LiveQueryTicker } from './LiveQueryTicker';
import { EngineBrandRow } from './EngineBrandRow';

export function HeroSection() {
  const router = useRouter();
  const [domainInput, setDomainInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = domainInput.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!cleanDomain) return;

    setIsSubmitting(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pending_domain', cleanDomain);
    }
    router.push(`/signup?domain=${encodeURIComponent(cleanDomain)}`);
  };

  return (
    <section className="relative pt-16 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Background Decorative Mesh / Subtle radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] bg-gradient-to-tr from-indigo-100/70 via-violet-100/50 to-indigo-50/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Header Content */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-2xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <span>Next-Gen Generative Engine Optimization (GEO)</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Stop Losing Customers to{' '}
            <span className="text-indigo-600 underline decoration-indigo-200 decoration-wavy underline-offset-8">
              AI Search.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Be the recommended brand when buyers ask ChatGPT, Perplexity, Gemini, and Copilot. Track citations, measure share of voice, and optimize your presence in real-time.
          </p>

          {/* Interactive Instant Audit Input Hook */}
          <div className="pt-2 max-w-xl mx-auto">
            <form
              onSubmit={handleAuditSubmit}
              className="p-1.5 sm:p-2 bg-white rounded-2xl border border-slate-200 shadow-lg shadow-indigo-500/5 hover:border-indigo-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full flex items-center pl-3">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="Enter your website URL (e.g. yourbrand.com)"
                  className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent border-0 focus:outline-hidden focus:ring-0"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-indigo-500/25 active:scale-98 flex items-center justify-center space-x-1.5 shrink-0"
              >
                <span>{isSubmitting ? 'Analyzing...' : 'Check Visibility'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Secondary CTAs & Demo Link */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-1">
            <Link
              href="/signup"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <span>Or start full tracking free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Explore Interactive Demo</span>
            </Link>
          </div>

          {/* Live Scanning Query Ticker */}
          <LiveQueryTicker />

          {/* Trust Points */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>No credit card required</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>14-day full feature trial</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Multi-tenant RLS ready</span>
            </span>
          </div>

          {/* Multi-Engine Brand Row */}
          <EngineBrandRow />
        </div>

        {/* Visual: Elevated Mock-up */}
        <div className="mt-12 sm:mt-16">
          <DashboardPreviewMockup />
        </div>
      </div>
    </section>
  );
}
