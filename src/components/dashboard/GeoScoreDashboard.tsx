'use client';

import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Bot,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

export function GeoScoreDashboard() {
  const { activeTenant, hasData, isLoading } = useDashboard();
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // 6-Month Trend Data points for GEO Score
  const trendPoints = [
    { month: 'Mar', x: 45, y: 155, score: 50, accuracy: 68, freshness: 62 },
    { month: 'Apr', x: 145, y: 142, score: 53, accuracy: 70, freshness: 60 },
    { month: 'May', x: 245, y: 130, score: 56, accuracy: 71, freshness: 59 },
    { month: 'Jun', x: 345, y: 120, score: 58, accuracy: 72, freshness: 58 },
    { month: 'Jul', x: 445, y: 114, score: 60, accuracy: 72, freshness: 58 },
    { month: 'Aug', x: 540, y: 110, score: 61, accuracy: 73, freshness: 58 },
  ];

  // GEO by Model Data
  const modelBars = [
    { code: 'GEM', name: 'Google Gemini', color: 'bg-[#2563EB]', pct: 70 },
    { code: 'GPT', name: 'OpenAI GPT-4o', color: 'bg-[#10B981]', pct: 65 },
    { code: 'CLD', name: 'Anthropic Claude', color: 'bg-[#E06D53]', pct: 58 },
    { code: 'MTA', name: 'Meta Llama 3', color: 'bg-[#2563EB]', pct: 48 },
    { code: 'PPX', name: 'Perplexity Sonar', color: 'bg-[#8B5CF6]', pct: 55 },
    { code: 'GRK', name: 'xAI Grok', color: 'bg-[#0EA5E9]', pct: 52 },
  ];

  // Structured Data Signals
  const structuredDataItems = [
    {
      id: 'json-ld',
      title: 'JSON-LD Schema markup',
      description: 'Present on 94% of indexed pages',
      status: 'success',
    },
    {
      id: 'open-graph',
      title: 'Open Graph metadata',
      description: 'Fully implemented across site',
      status: 'success',
    },
    {
      id: 'wikidata',
      title: 'Entity disambiguation (Wikidata)',
      description: 'Partial mapping - 3 ambiguous entity matches',
      status: 'warning',
    },
    {
      id: 'robots',
      title: 'Robots.txt & AI Crawler directives',
      description: 'All major AI bots allowed (GPTBot, PerplexityBot, Google-Extended)',
      status: 'success',
    },
  ];

  // Top Pages by GEO
  const topPages = [
    {
      path: '/solutions/enterprise',
      score: 84,
      delta: '+6.1%',
      isPositive: true,
      progressPct: 84,
    },
    {
      path: '/features/ai-automati..',
      score: 79,
      delta: '+4.3%',
      isPositive: true,
      progressPct: 79,
    },
    {
      path: '/pricing',
      score: 72,
      delta: '-1.2%',
      isPositive: false,
      progressPct: 72,
    },
  ];

  return (
    <div className="space-y-6 pb-6 select-none font-sans text-slate-900">
      {/* Row 1: Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: GEO SCORE */}
        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              GEO SCORE
            </span>
            <div className="flex items-baseline mt-2.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                61
              </span>
              <span className="text-xs font-medium text-slate-400 ml-1">
                /100
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-normal">vs. last month</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/80 font-mono">
              <ArrowUpRight className="w-3 h-3" />
              <span>+12.4%</span>
            </span>
          </div>
        </div>

        {/* Card 2: CONTEXT ACCURACY */}
        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              CONTEXT ACCURACY
            </span>
            <div className="flex items-baseline mt-2.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                73
              </span>
              <span className="text-xs font-medium text-slate-400 ml-0.5">
                %
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-normal truncate max-w-[170px]">
              content fidelity in AI answers
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/80 font-mono">
              <ArrowUpRight className="w-3 h-3" />
              <span>+4.8%</span>
            </span>
          </div>
        </div>

        {/* Card 3: KNOWLEDGE FRESHNESS */}
        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              KNOWLEDGE FRESHNESS
            </span>
            <div className="flex items-baseline mt-2.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                58
              </span>
              <span className="text-xs font-medium text-slate-400 ml-0.5">
                %
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-normal">up-to-date entity data</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100/80 font-mono">
              <ArrowDownRight className="w-3 h-3" />
              <span>-2.1%</span>
            </span>
          </div>
        </div>

        {/* Card 4: STRUCTURED DATA */}
        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              STRUCTURED DATA
            </span>
            <div className="flex items-baseline mt-2.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                81
              </span>
              <span className="text-xs font-medium text-slate-400 ml-0.5">
                %
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-normal">schema health score</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/80 font-mono">
              <ArrowUpRight className="w-3 h-3" />
              <span>+3.3%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Middle Section (GEO Score Trend & GEO by Model) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: GEO Score Trend (col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-100/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  GEO Score Trend
                </h2>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Score, context accuracy & knowledge freshness
                </p>
              </div>
            </div>

            {/* Responsive SVG Line Chart */}
            <div className="relative h-56 w-full mt-4">
              <svg viewBox="0 0 580 200" className="w-full h-full overflow-visible">
                <defs>
                  {/* Subtle warm amber/orange gradient fill beneath line */}
                  <linearGradient id="geoWarmFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
                    <stop offset="70%" stopColor="#FDE68A" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#FFFBEB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Reference Labels & Dotted Lines */}
                {[
                  { label: '100', y: 30 },
                  { label: '70', y: 80 },
                  { label: '50', y: 130 },
                  { label: '30', y: 180 },
                ].map((tick, idx) => (
                  <g key={idx}>
                    <text
                      x="20"
                      y={tick.y + 4}
                      fontSize="10"
                      fill="#94A3B8"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {tick.label}
                    </text>
                    <line
                      x1="35"
                      y1={tick.y}
                      x2="565"
                      y2={tick.y}
                      stroke="#F1F5F9"
                      strokeDasharray="2 2"
                    />
                  </g>
                ))}

                {/* Gradient Area Fill under Curve */}
                <path
                  d="M 45 155 C 100 150, 180 135, 245 130 C 310 125, 400 116, 540 110 L 540 180 L 45 180 Z"
                  fill="url(#geoWarmFill)"
                />

                {/* Smooth Curve Stroke Line */}
                <path
                  d="M 45 155 C 100 150, 180 135, 245 130 C 310 125, 400 116, 540 110"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* X-Axis Month Markers */}
                {trendPoints.map((pt, i) => (
                  <g
                    key={i}
                    onMouseEnter={() => setHoveredMonth(i)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredMonth === i ? '5' : '3.5'}
                      fill="#FFFFFF"
                      stroke="#D97706"
                      strokeWidth="2"
                    />
                    <text
                      x={pt.x}
                      y="196"
                      textAnchor="middle"
                      fontSize="10"
                      fill={hoveredMonth === i ? '#0F172A' : '#94A3B8'}
                      fontWeight={hoveredMonth === i ? '700' : '500'}
                    >
                      {pt.month}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Hover Tooltip */}
              {hoveredMonth !== null && (
                <div
                  className="absolute z-20 bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-[11px] shadow-lg -translate-x-1/2 -translate-y-full pointer-events-none space-y-0.5"
                  style={{
                    left: `${(trendPoints[hoveredMonth].x / 580) * 100}%`,
                    top: `${(trendPoints[hoveredMonth].y / 200) * 100}%`,
                  }}
                >
                  <div className="font-bold text-amber-300">
                    {trendPoints[hoveredMonth].month}: GEO {trendPoints[hoveredMonth].score}
                  </div>
                  <div className="text-[10px] text-slate-300">
                    Accuracy: {trendPoints[hoveredMonth].accuracy}% · Freshness: {trendPoints[hoveredMonth].freshness}%
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Legend Row at Bottom */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
              <span className="text-slate-500 font-medium">GEO Score</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-slate-500 font-medium">Accuracy %</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-slate-500 font-medium">Freshness %</span>
            </div>
          </div>
        </div>

        {/* Right: GEO by Model (col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-slate-100/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  GEO by Model
                </h2>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Context extraction quality per platform
                </p>
              </div>
            </div>

            {/* Horizontal Bar Chart List */}
            <div className="mt-6 space-y-3.5">
              {modelBars.map((m) => (
                <div key={m.code} className="flex items-center space-x-3 text-xs">
                  <span className="w-7 font-mono font-bold text-slate-500 text-[11px]">
                    {m.code}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-md h-5 overflow-hidden relative">
                    <div
                      className={`h-full rounded-md ${m.color} transition-all duration-700`}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* X-Axis Grid Scale at Bottom */}
          <div className="mt-6 pt-3 border-t border-slate-100">
            <div className="flex justify-between text-[10px] font-mono text-slate-400 px-10">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Bottom Section (Structured Data Health & Top Pages by GEO) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Structured Data Health (col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-100/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Structured Data Health
                </h2>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Schema markup & knowledge signals audit
                </p>
              </div>
            </div>

            {/* Audit Checklist Items */}
            <div className="mt-5 divide-y divide-slate-100">
              {structuredDataItems.map((item) => (
                <div key={item.id} className="py-3 flex items-start space-x-3">
                  {item.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Top Pages by GEO (col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-slate-100/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Top Pages by GEO
                </h2>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Highest context extraction quality
                </p>
              </div>
            </div>

            {/* List of Top Pages with Horizontal Progress Bars */}
            <div className="mt-5 space-y-4">
              {topPages.map((page) => (
                <div key={page.path} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-800 font-semibold text-[11px] truncate max-w-[210px]">
                      {page.path}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        page.isPositive
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/80'
                          : 'bg-rose-50 text-rose-600 border border-rose-100/80'
                      }`}
                    >
                      {page.isPositive ? (
                        <ArrowUpRight className="w-2.5 h-2.5" />
                      ) : (
                        <ArrowDownRight className="w-2.5 h-2.5" />
                      )}
                      <span>{page.delta}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-700"
                        style={{ width: `${page.progressPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold font-mono text-slate-400 w-5 text-right">
                      {page.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
