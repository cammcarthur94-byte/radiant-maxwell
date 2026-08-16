'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Database,
  Search,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Share2,
  Layers,
  LineChart,
} from 'lucide-react';

export function ThreePillarsSection() {
  const pillars = [
    {
      id: 'aio',
      code: 'AIO',
      title: 'AI Optimization',
      subtitle: 'Knowledge Graph & Schema Foundation',
      badge: 'Structural Authority',
      accentColor: 'text-orange-600',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
      iconBg: 'bg-orange-50 text-orange-600 border-orange-100',
      borderColor: 'hover:border-orange-300',
      icon: Database,
      description:
        'Schema health, knowledge graph authority, and crawlability foundation that ensures LLM bots can discover, index, and ingest your brand entities.',
      metrics: [
        { label: 'Entity Grounding Score', value: '94%' },
        { label: 'Structured Schema Health', value: '100%' },
        { label: 'Crawl Indexing Latency', value: '< 2.4s' },
      ],
      capabilities: [
        'Automated JSON-LD & OpenGraph validation',
        'Entity disambiguation across Wikidata & Google KG',
        'Headless crawler rendering audit & bot access telemetry',
        'Schema payload injection recommendations',
      ],
    },
    {
      id: 'aeo',
      code: 'AEO',
      title: 'Answer Engine Optimization',
      subtitle: 'Question-Based Direct Citations',
      badge: 'Citation Frequency',
      accentColor: 'text-cyan-600',
      badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
      borderColor: 'hover:border-cyan-300',
      icon: Search,
      description:
        'Direct citation frequency and position capture in conversational question-based search across Perplexity, ChatGPT Search, and Copilot.',
      metrics: [
        { label: 'Avg. Citation Rank', value: '#1.4' },
        { label: 'Source Attribution Rate', value: '68.2%' },
        { label: 'Domain Citation Share', value: '82%' },
      ],
      capabilities: [
        'Real-time citation footnote extraction & backlink discovery',
        'Ordinal position tracking for multi-brand recommendations',
        'Domain authority breakdown (G2, Capterra, Reddit, Docs)',
        'Prompt gap detection for unranked categorical queries',
      ],
    },
    {
      id: 'geo',
      code: 'GEO',
      title: 'Generative Engine Optimization',
      subtitle: 'Semantic Context & Sentiment Polarity',
      badge: 'Synthesized Presence',
      accentColor: 'text-purple-600',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
      borderColor: 'hover:border-purple-300',
      icon: Cpu,
      description:
        'Semantic context extraction, sentiment polarity, and cross-model consistency when generative models synthesize natural responses.',
      metrics: [
        { label: 'Net Brand Sentiment', value: '+84' },
        { label: 'Context Coherence', value: '92%' },
        { label: 'Multi-Turn Stability', value: '96.5%' },
      ],
      capabilities: [
        'Sentiment polarity & subjective modifier telemetry',
        'Cross-model consistency audit (Gemini vs Claude vs GPT)',
        'Hallucination & misleading context monitoring',
        'Generative narrative positioning optimization',
      ],
    },
  ];

  return (
    <section id="pillars" className="py-20 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Core Value Proposition</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            The Three Pillars of AI Search Dominance.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Traditional SEO is no longer enough. Our architecture covers the three essential layers required to capture share of voice in generative conversational search.
          </p>
        </div>

        {/* 3 Pillar Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <div
                key={pillar.id}
                className={`bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-7 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group ${pillar.borderColor}`}
              >
                <div className="space-y-6">
                  {/* Card Header: Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs transition-transform group-hover:scale-105 ${pillar.iconBg}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border font-mono ${pillar.badgeBg}`}
                    >
                      {pillar.code} • {pillar.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{pillar.title}</span>
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 font-mono">
                      {pillar.subtitle}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {pillar.description}
                    </p>
                  </div>

                  {/* Benchmark Stat Badges */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                    {pillar.metrics.map((m, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-[10px] text-slate-400 font-medium truncate">
                          {m.label}
                        </div>
                        <div className="text-xs font-bold text-slate-900 mt-0.5">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Capabilities List */}
                  <div className="space-y-2.5 pt-2">
                    <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                      Key Capabilities:
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {pillar.capabilities.map((cap, cIdx) => (
                        <li key={cIdx} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="mt-8 pt-4 border-t border-slate-200/80">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors group-hover:translate-x-0.5 duration-200"
                  >
                    <span>Inspect {pillar.code} Telemetry</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
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
