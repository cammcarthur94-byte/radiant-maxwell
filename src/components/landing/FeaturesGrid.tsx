'use client';

import React from 'react';
import {
  Eye,
  TrendingUp,
  Link2,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export function FeaturesGrid() {
  const features = [
    {
      id: 'feature-1',
      title: 'AI Overview Tracking',
      icon: Eye,
      tag: 'Continuous Telemetry',
      description:
        'Continuously monitor where and how your brand appears across conversational search engines, including Google AI Overviews, ChatGPT Search, and Perplexity Pro.',
      bullets: [
        'Sentiment polarity & recommendation rank',
        'Direct URL link extraction from answers',
        'Automated 6-hour cron sync via Vercel',
      ],
    },
    {
      id: 'feature-2',
      title: 'Share of Voice Benchmarking',
      icon: TrendingUp,
      tag: 'Competitive Radar',
      description:
        'Quantify your brand visibility percentage against top market competitors across thousands of categorical search prompts and industry keywords.',
      bullets: [
        'Multi-competitor rank distribution',
        'Historical weekly & monthly trend lines',
        'Prompt gap detection for targeted wins',
      ],
    },
    {
      id: 'feature-3',
      title: 'Citation Discovery',
      icon: Link2,
      tag: 'Grounded Sources',
      description:
        'Identify which third-party websites, review platforms, documentation hubs, and forums are being cited by LLMs to recommend solutions.',
      bullets: [
        'Domain authority breakdown (G2, Capterra, Docs)',
        'Uncover untapped citation opportunities',
        'Entity grounding & knowledge graph validation',
      ],
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-50/50 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Built for Modern Growth & SEO Teams</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Everything you need to dominate conversational AI search.
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Search has shifted from static links to generative answers. Our platform provides the end-to-end data pipeline to track, analyze, and optimize your brand's AI visibility.
          </p>
        </div>

        {/* 3-Column Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs hover:shadow-xl hover:border-indigo-200/80 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Subtle top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-5">
                  {/* Icon & Tag */}
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-2xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {item.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    {item.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Link */}
                <div className="mt-8 pt-4 border-t border-slate-100">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 hover:underline"
                  >
                    <span>View live telemetry</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
