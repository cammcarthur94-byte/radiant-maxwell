'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Trophy,
  Award,
  ArrowRight,
  Layers,
  ChevronRight,
} from 'lucide-react';

type MetricTab = 'AEO' | 'GEO' | 'AIO';

export function CompetitiveRankPreview() {
  const [activeTab, setActiveTab] = useState<MetricTab>('AEO');

  const tabConfig = {
    AEO: {
      title: 'Answer Engine Optimization (AEO)',
      description: 'Direct answer citation frequency and ordinal rank across conversational queries',
      accentColor: '#06B6D4',
      activeText: 'text-cyan-600',
      activeBorder: 'border-cyan-500',
      barColor: 'bg-cyan-500',
      badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    },
    GEO: {
      title: 'Generative Engine Optimization (GEO)',
      description: 'Semantic context extraction, brand sentiment polarity, and multi-turn consistency',
      accentColor: '#8B5CF6',
      activeText: 'text-purple-600',
      activeBorder: 'border-purple-500',
      barColor: 'bg-purple-500',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    AIO: {
      title: 'AI Optimization (AIO)',
      description: 'Structured schema authority, entity disambiguation, and crawler ingestion health',
      accentColor: '#F97316',
      activeText: 'text-orange-600',
      activeBorder: 'border-orange-500',
      barColor: 'bg-orange-500',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
    },
  }[activeTab];

  const rankings = [
    {
      rank: 1,
      name: 'Vertex Solutions',
      isTargetBrand: false,
      scores: { AEO: 82, GEO: 78, AIO: 80 },
      deltas: { AEO: '+3.1%', GEO: '+2.8%', AIO: '+3.4%' },
      isPositive: true,
      category: 'Enterprise SaaS',
    },
    {
      rank: 2,
      name: 'Pinnacle AI',
      isTargetBrand: false,
      scores: { AEO: 77, GEO: 75, AIO: 76 },
      deltas: { AEO: '-1.2%', GEO: '-0.8%', AIO: '-1.5%' },
      isPositive: false,
      category: 'Market Challenger',
    },
    {
      rank: 3,
      name: 'Acme Corp (Your Brand)',
      isTargetBrand: true,
      scores: { AEO: 74, GEO: 61, AIO: 68 },
      deltas: { AEO: '+8.2%', GEO: '+12.4%', AIO: '+5.1%' },
      isPositive: true,
      category: 'Target Campaign',
    },
    {
      rank: 4,
      name: 'Apex Systems',
      isTargetBrand: false,
      scores: { AEO: 71, GEO: 69, AIO: 70 },
      deltas: { AEO: '+0.9%', GEO: '+1.4%', AIO: '+0.7%' },
      isPositive: true,
      category: 'Legacy Platform',
    },
    {
      rank: 5,
      name: 'Nexus Digital',
      isTargetBrand: false,
      scores: { AEO: 69, GEO: 66, AIO: 67 },
      deltas: { AEO: '+5.5%', GEO: '+4.2%', AIO: '+5.0%' },
      isPositive: true,
      category: 'Emerging Startup',
    },
    {
      rank: 6,
      name: 'CoreSync',
      isTargetBrand: false,
      scores: { AEO: 65, GEO: 63, AIO: 64 },
      deltas: { AEO: '-3.4%', GEO: '-2.9%', AIO: '-3.1%' },
      isPositive: false,
      category: 'Mid-Market Suite',
    },
  ];

  return (
    <section id="benchmarking" className="py-20 sm:py-24 bg-[#f8fafc] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-indigo-600" />
            <span>Competitive Intelligence</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            See Exactly How You Rank Against Your Competitors.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Track industry benchmark standings across multi-engine queries. Identify visibility gaps and overtake competitor citations in real-time.
          </p>
        </div>

        {/* Mini Preview Container */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/50">
            {/* Header Row: Title & Interactive Tab Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Competitive Leaderboard
                  </h3>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tabConfig.badgeBg}`}>
                    {activeTab} Mode
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {tabConfig.description}
                </p>
              </div>

              {/* Metric Tab Buttons */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 shrink-0">
                {(['AEO', 'GEO', 'AIO'] as MetricTab[]).map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 text-xs font-bold transition-all rounded-lg cursor-pointer ${
                        isActive
                          ? 'bg-white shadow-xs text-slate-900'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 py-3 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-100">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-4 sm:col-span-5">Brand / Entity</div>
              <div className="col-span-4 sm:col-span-4">Score Distribution</div>
              <div className="col-span-3 sm:col-span-2 text-right">Trend Delta</div>
            </div>

            {/* Leaderboard Rows */}
            <div className="divide-y divide-slate-100">
              {rankings.map((item) => {
                const currentScore = item.scores[activeTab];
                const currentDelta = item.deltas[activeTab];
                const isPositive = !currentDelta.startsWith('-');

                return (
                  <div
                    key={item.rank}
                    className={`grid grid-cols-12 gap-4 items-center py-3.5 px-3 rounded-xl transition-all ${
                      item.isTargetBrand
                        ? 'bg-indigo-50/60 border border-indigo-200/80 shadow-2xs font-semibold'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Rank Number */}
                    <div className="col-span-1 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold font-mono ${
                          item.rank === 1
                            ? 'bg-amber-100 text-amber-800'
                            : item.rank === 2
                            ? 'bg-slate-200 text-slate-700'
                            : item.rank === 3
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'text-slate-400'
                        }`}
                      >
                        #{item.rank}
                      </span>
                    </div>

                    {/* Brand Name & Category */}
                    <div className="col-span-4 sm:col-span-5 truncate">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs sm:text-sm font-bold truncate ${
                            item.isTargetBrand ? 'text-indigo-950' : 'text-slate-800'
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.isTargetBrand && (
                          <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shrink-0">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal truncate">
                        {item.category}
                      </div>
                    </div>

                    {/* Score Bar & Numeric Value */}
                    <div className="col-span-4 sm:col-span-4 flex items-center space-x-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${tabConfig.barColor} rounded-full transition-all duration-700`}
                          style={{ width: `${currentScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-900 font-mono w-7 text-right">
                        {currentScore}
                      </span>
                    </div>

                    {/* Delta Trend Pill */}
                    <div className="col-span-3 sm:col-span-2 text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        <span>{currentDelta}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Table Footer Link to Dashboard */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">
                Track up to 50 custom competitors simultaneously.
              </span>
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-1.5 font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <span>Launch full interactive leaderboard</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
