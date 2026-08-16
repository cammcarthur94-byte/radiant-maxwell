'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  PlayCircle,
  Globe,
  CheckCircle2,
  Bot,
  Zap,
  Search,
  ShieldCheck,
} from 'lucide-react';

interface CircularGaugeProps {
  score: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

function CircularGauge({
  score,
  color,
  size = 50,
  strokeWidth = 4,
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(score, 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute font-bold text-xs text-slate-800 font-sans">
        {score}
      </span>
    </div>
  );
}

export function HeroSection() {
  const router = useRouter();
  const [domainInput, setDomainInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeKpiHover, setActiveKpiHover] = useState<string | null>(null);

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

  const kpiMockups = [
    {
      id: 'aeo',
      label: 'AEO SCORE',
      labelColor: 'text-cyan-600',
      accentColor: '#06B6D4',
      barColor: 'from-cyan-400 to-cyan-500',
      score: 74,
      showOutOfHundred: true,
      delta: '+8.2%',
      isPositive: true,
      description: 'Answer Engine direct citations & query position capture across models',
    },
    {
      id: 'geo',
      label: 'GEO SCORE',
      labelColor: 'text-purple-600',
      accentColor: '#8B5CF6',
      barColor: 'from-purple-400 to-purple-500',
      score: 61,
      showOutOfHundred: true,
      delta: '+12.4%',
      isPositive: true,
      description: 'Generative Engine context extraction, sentiment & multi-turn consistency',
    },
    {
      id: 'aio',
      label: 'AIO SCORE',
      labelColor: 'text-orange-600',
      accentColor: '#F97316',
      barColor: 'from-orange-400 to-orange-500',
      score: 68,
      showOutOfHundred: true,
      delta: '+5.1%',
      isPositive: true,
      description: 'AI Optimization schema health, knowledge authority & crawl telemetry',
    },
    {
      id: 'overall',
      label: 'OVERALL VISIBILITY',
      labelColor: 'text-emerald-600',
      accentColor: '#10B981',
      barColor: 'from-emerald-400 to-emerald-500',
      score: 68,
      showOutOfHundred: false,
      delta: '+8.6%',
      isPositive: true,
      description: '3,747 citations tracked across ChatGPT, Gemini, Claude & Perplexity',
    },
  ];

  return (
    <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 bg-[#f8fafc] overflow-hidden">
      {/* Soft ambient gradient aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-gradient-to-b from-indigo-50/70 via-slate-50/50 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Header Content */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Accent Pill Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <span className="text-slate-900 font-bold">Next-Generation AI Search Telemetry</span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-600 font-semibold">Live Multi-Model Crawler</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Master Your Brand's Visibility Across{' '}
            <span className="text-indigo-600 inline-block relative">
              Conversational AI Engines.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Track, benchmark, and optimize your Answer Engine Optimization (AEO), Generative Engine Optimization (GEO), and AI Optimization (AIO) performance across ChatGPT, Perplexity, Gemini, Claude, and more.
          </p>

          {/* Primary & Secondary Dual Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm transition-all shadow-md hover:shadow-indigo-500/20 active:scale-98 flex items-center justify-center space-x-2"
            >
              <span>Start Tracking Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200 transition-all shadow-xs flex items-center justify-center space-x-2"
            >
              <PlayCircle className="w-4 h-4 text-indigo-600" />
              <span>View Live Demo</span>
            </Link>
          </div>

          {/* Frictionless One-Click Website Audit Input */}
          <div className="pt-2 max-w-xl mx-auto">
            <form
              onSubmit={handleAuditSubmit}
              className="p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full flex items-center pl-3">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="Enter your website URL (e.g. acme.com)"
                  className="w-full px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent border-0 focus:outline-hidden focus:ring-0"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <span>{isSubmitting ? 'Auditing...' : 'Run Instant Scan'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Trust Highlights */}
          <div className="pt-1 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>No credit card required</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>14-day free trial</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Multi-tenant RLS ready</span>
            </span>
          </div>
        </div>

        {/* Hero Visual Preview: Exact Light-Mode KPI Card Grid */}
        <div className="mt-14 max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Live Telemetry Preview • Acme Corp Intelligence
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time multi-model visibility index calculated across 4 top LLMs
                </p>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                <span>Open Full Interactive Dashboard</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            </div>

            {/* 4 Light-Mode Score Gauge Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {kpiMockups.map((card) => (
                <div
                  key={card.id}
                  onMouseEnter={() => setActiveKpiHover(card.id)}
                  onMouseLeave={() => setActiveKpiHover(null)}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition-all duration-300 flex flex-col justify-between ${
                    activeKpiHover === card.id
                      ? 'border-indigo-300 shadow-md translate-y-[-2px]'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header: Score Label + Delta Pill */}
                  <div className="flex items-center justify-between pb-1">
                    <span className={`text-[11px] font-bold tracking-wider font-mono uppercase ${card.labelColor}`}>
                      {card.label}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 font-mono">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>{card.delta}</span>
                    </span>
                  </div>

                  {/* Card Body: Circular Ring Gauge + Large Stat */}
                  <div className="my-3.5 flex items-center space-x-3.5">
                    <CircularGauge score={card.score} color={card.accentColor} size={50} strokeWidth={4} />
                    <div className="flex items-baseline leading-none">
                      <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                        {card.score}
                      </span>
                      {card.showOutOfHundred && (
                        <span className="text-xs font-medium text-slate-400 ml-1">
                          /100
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subtitle Description */}
                  <p className="text-[11px] text-slate-500 font-normal leading-relaxed line-clamp-2 min-h-[32px]">
                    {card.description}
                  </p>

                  {/* Bottom Accent Bar Line */}
                  <div className="mt-4 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${card.barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${card.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Engine Coverage Badges */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-600">Tracked AI Engines:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px]">
                  ChatGPT (Search & GPT-4o)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px]">
                  Perplexity (Sonar 3.0)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px]">
                  Google Gemini (1.5 Flash & Pro)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px]">
                  Claude (3.5 Sonnet & Haiku)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
