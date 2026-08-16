'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2, PlayCircle, Bot } from 'lucide-react';

export function ConversionCtaSection() {
  return (
    <section className="py-20 sm:py-24 bg-[#f8fafc] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-white border border-slate-200 rounded-3xl p-8 sm:p-14 text-center shadow-xl shadow-slate-200/40 overflow-hidden max-w-4xl mx-auto">
          {/* Soft background aura */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-50/80 rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-50/80 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Take Control of Your AI Footprint</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Ready to Win the AI Search Recommendation Engine?
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Join leading brands, SEO leaders, and marketing agencies monitoring their conversational AI visibility, citations, and competitor share of voice in real-time.
            </p>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm transition-all shadow-md hover:shadow-indigo-500/25 active:scale-98 flex items-center justify-center space-x-2"
              >
                <span>Start Your 7-Day Audit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 transition-all flex items-center justify-center space-x-2"
              >
                <PlayCircle className="w-4 h-4 text-indigo-600" />
                <span>Explore Live Sandbox</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Instant automated setup</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>No credit card required</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Enterprise multi-tenant isolation</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
