'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Eye,
  Bot,
  Layers,
  Award,
} from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  mode: 'login' | 'signup';
}

export function AuthLayout({ children, mode }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-900">
      {/* Left Column: Brand Showcase & Testimonial (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/20 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white text-indigo-600 flex items-center justify-center font-extrabold text-base shadow-md">
              V
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">Brand Visibility</span>
              <span className="text-indigo-200 font-normal ml-1 text-sm">AIO Platform</span>
            </div>
          </Link>
        </div>

        {/* Middle: Value Proposition & Feature Highlights */}
        <div className="relative z-10 max-w-lg space-y-8 my-auto py-12">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-100 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Enterprise AI Overview Optimization (AIO)</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">
              Command your brand's presence across every generative answer engine.
            </h1>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Track real-time share of voice, extract grounded citations, and identify prompt gaps across ChatGPT, Perplexity, Gemini, and Copilot.
            </p>
          </div>

          {/* Social Proof / Customer Testimonial Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-1 text-amber-300">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-sm">★</span>
              ))}
            </div>
            <p className="text-xs xl:text-sm text-indigo-50 italic leading-relaxed">
              "Brand Visibility gave us the exact data we needed to understand how ChatGPT and Perplexity recommend our platform. Our AI citations increased by 42% in just 30 days."
            </p>
            <div className="flex items-center space-x-3 pt-2 border-t border-white/10">
              <div className="w-8 h-8 rounded-full bg-white text-indigo-700 font-bold text-xs flex items-center justify-center shadow-sm">
                W
              </div>
              <div>
                <div className="text-xs font-bold text-white">Growth & SEO Engineering</div>
                <div className="text-[11px] text-indigo-200">Webflow Enterprise</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Trust Badges */}
        <div className="relative z-10 flex items-center space-x-6 text-xs text-indigo-200">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Multi-Tenant RLS Isolated</span>
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-indigo-200" />
            <span>4 Engines Monitored</span>
          </span>
          <span>&bull;</span>
          <span>SOC2 Ready</span>
        </div>
      </div>

      {/* Right Column: Centered Auth Card */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        {/* Mobile Header Logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              V
            </div>
            <span className="font-bold text-lg text-slate-900">Brand Visibility</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
