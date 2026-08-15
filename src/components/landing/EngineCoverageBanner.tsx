'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export function EngineCoverageBanner() {
  const engines = [
    {
      name: 'ChatGPT Search',
      model: 'GPT-4o & Search',
      status: 'Continuous Sync',
      citations: 'Direct Footnotes',
      icon: '🟢',
    },
    {
      name: 'Perplexity Pro',
      model: 'Sonar 3.0 Deep Research',
      status: 'Live Grounding',
      citations: 'Domain Ranking',
      icon: '🔵',
    },
    {
      name: 'Google Gemini 1.5',
      model: 'AI Overviews & SGE',
      status: 'Index Active',
      citations: 'Knowledge Graph',
      icon: '🟣',
    },
    {
      name: 'Microsoft Copilot',
      model: 'Bing Conversational',
      status: 'Live Grounding',
      citations: 'Web Snippets',
      icon: '🔷',
    },
  ];

  return (
    <section id="engines" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10 pb-8 border-b border-slate-800">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Multi-Model Coverage</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Full-spectrum telemetry across the AI search ecosystem.
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                We query each model using headless execution pipelines, isolating brand entity placements, ordinal ranks, and backlink sources.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <span>Track Your Brand</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center"
              >
                Explore Engine Matrix
              </Link>
            </div>
          </div>

          {/* Engine Grid Cards */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {engines.map((eng, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3 backdrop-blur-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{eng.icon}</span>
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {eng.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{eng.name}</h4>
                  <div className="text-[11px] text-slate-400">{eng.model}</div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Citation Model:</span>
                  <span className="font-mono text-indigo-300 font-medium">{eng.citations}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Quick Anchor Section */}
        <div id="pricing" className="mt-20 pt-16 border-t border-slate-200 text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Transparent SaaS Pricing</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Flexible plans for high-growth brands and enterprise agencies.
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Every plan includes multi-tenant isolation, real-time AI citation crawlers, and automated prompt discovery.
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all"
            >
              Start 14-Day Free Trial
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              Test Live Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
