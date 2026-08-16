'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

export interface ScoreTrendPoint {
  month: string;
  aeo: number;
  geo: number;
  aio: number;
  overall: number;
}

export const SCORE_TRENDS_DATA: ScoreTrendPoint[] = [
  { month: 'Mar', aeo: 62, geo: 52, aio: 58, overall: 58 },
  { month: 'Apr', aeo: 65, geo: 54, aio: 61, overall: 61 },
  { month: 'May', aeo: 68, geo: 56, aio: 63, overall: 63 },
  { month: 'Jun', aeo: 70, geo: 58, aio: 65, overall: 65 },
  { month: 'Jul', aeo: 72, geo: 60, aio: 67, overall: 67 },
  { month: 'Aug', aeo: 74, geo: 61, aio: 68, overall: 68 },
];

export interface InsightItem {
  id: string;
  title: string;
  dotColor: string;
  description: string;
  timeAgo: string;
  platform: string;
}

export const RECENT_INSIGHTS: InsightItem[] = [
  {
    id: 'ins-1',
    title: 'Perplexity AEO surge',
    dotColor: 'bg-emerald-500',
    description: 'Citation frequency up 22% — brand appears in 4 of top 5 product-search queries.',
    timeAgo: '2h ago',
    platform: 'Perplexity',
  },
  {
    id: 'ins-2',
    title: 'Gemini GEO leads all models',
    dotColor: 'bg-emerald-500',
    description: 'Structured data markup is driving superior context extraction. Score: 70/100.',
    timeAgo: '5h ago',
    platform: 'Gemini',
  },
  {
    id: 'ins-3',
    title: 'Meta AI underperforming',
    dotColor: 'bg-rose-500',
    description: 'AIO score dropped 3 pts this week. Knowledge panel data may be outdated.',
    timeAgo: '1d ago',
    platform: 'Meta AI',
  },
  {
    id: 'ins-4',
    title: 'Claude AIO score highest',
    dotColor: 'bg-emerald-500',
    description: 'Ranked #1 in AIO at 73/100. Long-form content strategy is yielding results.',
    timeAgo: '1d ago',
    platform: 'Claude',
  },
];

export interface ModelPerformanceItem {
  id: string;
  code: string;
  name: string;
  badgeBg: string;
  badgeText: string;
  barColor: string;
  citations: number;
  citationsBarWidth: number; // percentage
  aeo: number;
  geo: number;
  aio: number;
  avgScore: number;
  status: 'Strong' | 'Moderate' | 'Weak';
}

export const MODEL_DATA: ModelPerformanceItem[] = [
  {
    id: 'chatgpt',
    code: 'GPT',
    name: 'ChatGPT',
    badgeBg: 'bg-emerald-100/70',
    badgeText: 'text-emerald-800',
    barColor: 'bg-[#0d9488]',
    citations: 1284,
    citationsBarWidth: 98,
    aeo: 78,
    geo: 65,
    aio: 71,
    avgScore: 71,
    status: 'Strong',
  },
  {
    id: 'gemini',
    code: 'GEM',
    name: 'Gemini',
    badgeBg: 'bg-blue-100/70',
    badgeText: 'text-blue-800',
    barColor: 'bg-[#2563eb]',
    citations: 876,
    citationsBarWidth: 72,
    aeo: 69,
    geo: 70,
    aio: 64,
    avgScore: 68,
    status: 'Moderate',
  },
  {
    id: 'claude',
    code: 'CLD',
    name: 'Claude',
    badgeBg: 'bg-orange-100/70',
    badgeText: 'text-orange-800',
    barColor: 'bg-[#c2410c]',
    citations: 493,
    citationsBarWidth: 44,
    aeo: 72,
    geo: 58,
    aio: 73,
    avgScore: 68,
    status: 'Moderate',
  },
  {
    id: 'perplexity',
    code: 'PPX',
    name: 'Perplexity',
    badgeBg: 'bg-purple-100/70',
    badgeText: 'text-purple-800',
    barColor: 'bg-[#7c3aed]',
    citations: 642,
    citationsBarWidth: 56,
    aeo: 81,
    geo: 55,
    aio: 62,
    avgScore: 66,
    status: 'Moderate',
  },
  {
    id: 'grok',
    code: 'GRK',
    name: 'Grok',
    badgeBg: 'bg-sky-100/70',
    badgeText: 'text-sky-800',
    barColor: 'bg-[#0284c7]',
    citations: 318,
    citationsBarWidth: 28,
    aeo: 65,
    geo: 52,
    aio: 59,
    avgScore: 59,
    status: 'Weak',
  },
  {
    id: 'meta',
    code: 'MTA',
    name: 'Meta AI',
    badgeBg: 'bg-slate-200/70',
    badgeText: 'text-slate-800',
    barColor: 'bg-[#3b82f6]',
    citations: 214,
    citationsBarWidth: 20,
    aeo: 58,
    geo: 48,
    aio: 61,
    avgScore: 56,
    status: 'Weak',
  },
];

export interface CompetitorRankEntry {
  rank: number;
  name: string;
  isTargetBrand?: boolean;
  scores: {
    AEO: number;
    GEO: number;
    AIO: number;
  };
  deltas: {
    AEO: { value: string; isPositive: boolean };
    GEO: { value: string; isPositive: boolean };
    AIO: { value: string; isPositive: boolean };
  };
}

export const COMPETITOR_RANK_DATA: CompetitorRankEntry[] = [
  {
    rank: 1,
    name: 'Vertex Solutions',
    scores: { AEO: 82, GEO: 71, AIO: 75 },
    deltas: {
      AEO: { value: '+3.1%', isPositive: true },
      GEO: { value: '+2.4%', isPositive: true },
      AIO: { value: '+4.0%', isPositive: true },
    },
  },
  {
    rank: 2,
    name: 'Pinnacle AI',
    scores: { AEO: 77, GEO: 65, AIO: 80 },
    deltas: {
      AEO: { value: '-1.2%', isPositive: false },
      GEO: { value: '+1.5%', isPositive: true },
      AIO: { value: '+3.8%', isPositive: true },
    },
  },
  {
    rank: 3,
    name: 'Acme Corp',
    isTargetBrand: true,
    scores: { AEO: 74, GEO: 61, AIO: 68 },
    deltas: {
      AEO: { value: '+8.2%', isPositive: true },
      GEO: { value: '+12.4%', isPositive: true },
      AIO: { value: '+5.1%', isPositive: true },
    },
  },
  {
    rank: 4,
    name: 'Apex Systems',
    scores: { AEO: 71, GEO: 53, AIO: 66 },
    deltas: {
      AEO: { value: '+0.9%', isPositive: true },
      GEO: { value: '-0.4%', isPositive: false },
      AIO: { value: '+1.2%', isPositive: true },
    },
  },
  {
    rank: 5,
    name: 'Nexus Digital',
    scores: { AEO: 69, GEO: 78, AIO: 63 },
    deltas: {
      AEO: { value: '+5.5%', isPositive: true },
      GEO: { value: '+6.1%', isPositive: true },
      AIO: { value: '-1.0%', isPositive: false },
    },
  },
  {
    rank: 6,
    name: 'CoreSync',
    scores: { AEO: 65, GEO: 59, AIO: 71 },
    deltas: {
      AEO: { value: '-3.4%', isPositive: false },
      GEO: { value: '-1.8%', isPositive: false },
      AIO: { value: '+2.5%', isPositive: true },
    },
  },
  {
    rank: 7,
    name: 'Horizon Tech',
    scores: { AEO: 58, GEO: 62, AIO: 55 },
    deltas: {
      AEO: { value: '+2.2%', isPositive: true },
      GEO: { value: '+3.0%', isPositive: true },
      AIO: { value: '-2.1%', isPositive: false },
    },
  },
];

export default function OverviewDashboardPage() {
  const {
    activeTenant,
    selectedModel,
    toggleSelectedModel,
    selectedCompetitor,
    toggleSelectedCompetitor,
  } = useDashboard();

  const [activeRankMetric, setActiveRankMetric] = useState<'AEO' | 'GEO' | 'AIO'>('AEO');
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState<number | null>(null);
  const [hoveredBarModel, setHoveredBarModel] = useState<string | null>(null);

  const isModelActive = (codeOrName: string) => {
    if (!selectedModel) return true;
    const target = selectedModel.toLowerCase();
    const cur = codeOrName.toLowerCase();
    return target === cur || (target === 'gpt' && cur.includes('chatgpt')) || (target === 'gem' && cur.includes('gemini')) || (target === 'cld' && cur.includes('claude')) || (target === 'ppx' && cur.includes('perplexity')) || (target === 'grk' && cur.includes('grok')) || (target === 'mta' && cur.includes('meta'));
  };

  const isCompetitorActive = (name: string) => {
    if (!selectedCompetitor) return true;
    return selectedCompetitor.toLowerCase() === name.toLowerCase();
  };

  // SVG Circular Gauge helper
  const renderCircularGauge = (score: number, strokeColor: string) => {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 54 54">
          <circle
            cx="27"
            cy="27"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="5"
          />
          <circle
            cx="27"
            cy="27"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-xs font-bold text-slate-800 font-mono">
          {score}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12 select-none font-sans text-slate-900">
      {/* Reporting Period Subtitle Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-0.5">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-slate-600 font-semibold">
            Reporting period: March – August 2025
          </span>
        </div>
        <div className="text-slate-400 font-mono">Aug 15, 2025</div>
      </div>

      {/* 1. Top 4 Circular Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: AEO SCORE */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00bcd4] font-mono">
                AEO SCORE
              </span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
                <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                <span>+8.2%</span>
              </span>
            </div>

            <div className="flex items-center space-x-3.5 mt-3.5">
              {renderCircularGauge(74, '#00bcd4')}
              <div className="flex items-baseline font-mono">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">74</span>
                <span className="text-sm font-normal text-slate-400 ml-1 font-sans">/100</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-normal mt-3 leading-relaxed">
              Answer Engine Optimization across queried models
            </p>
          </div>

          <div className="w-full h-1 bg-[#00bcd4] rounded-full mt-4" />
        </div>

        {/* Card 2: GEO SCORE */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b5cf6] font-mono">
                GEO SCORE
              </span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
                <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                <span>+12.4%</span>
              </span>
            </div>

            <div className="flex items-center space-x-3.5 mt-3.5">
              {renderCircularGauge(61, '#8b5cf6')}
              <div className="flex items-baseline font-mono">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">61</span>
                <span className="text-sm font-normal text-slate-400 ml-1 font-sans">/100</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-normal mt-3 leading-relaxed">
              Generative Engine Optimization — context extraction
            </p>
          </div>

          <div className="w-full h-1 bg-[#8b5cf6] rounded-full mt-4" />
        </div>

        {/* Card 3: AIO SCORE */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#f97316] font-mono">
                AIO SCORE
              </span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
                <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                <span>+5.1%</span>
              </span>
            </div>

            <div className="flex items-center space-x-3.5 mt-3.5">
              {renderCircularGauge(68, '#f97316')}
              <div className="flex items-baseline font-mono">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">68</span>
                <span className="text-sm font-normal text-slate-400 ml-1 font-sans">/100</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-normal mt-3 leading-relaxed">
              AI Optimization — structured data &amp; knowledge accuracy
            </p>
          </div>

          <div className="w-full h-1 bg-[#f97316] rounded-full mt-4" />
        </div>

        {/* Card 4: OVERALL VISIBILITY */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#10b981] font-mono">
                OVERALL VISIBILITY
              </span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
                <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                <span>+8.6%</span>
              </span>
            </div>

            <div className="flex items-center space-x-3.5 mt-3.5">
              {renderCircularGauge(68, '#10b981')}
              <div className="flex items-baseline font-mono">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">68</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-normal mt-3 leading-relaxed">
              3,747 total citations tracked this period
            </p>
          </div>

          <div className="w-full h-1 bg-[#10b981] rounded-full mt-4" />
        </div>
      </div>

      {/* 2. Middle Row: Score Trends (Left) & Recent Insights (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Score Trends (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Score Trends
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                6-month rolling performance
              </p>
            </div>

            {/* Metric Legend */}
            <div className="flex items-center space-x-4 text-xs font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00bcd4]" />
                <span className="text-slate-600">AEO</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                <span className="text-slate-600">GEO</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f97316]" />
                <span className="text-slate-600">AIO</span>
              </div>
            </div>
          </div>

          {/* SVG Score Trend Chart */}
          <div className="relative w-full h-56 sm:h-64 mt-2">
            {/* Y-Axis Value Labels & Horizontal Guide Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              {[100, 70, 50, 30].map((val) => (
                <div key={val} className="w-full flex items-center">
                  <span className="w-7 text-[11px] font-mono text-slate-400 text-right pr-2 select-none">
                    {val}
                  </span>
                  <div className="flex-1 border-b border-slate-100/80 border-dashed" />
                </div>
              ))}
            </div>

            {/* SVG Chart Line & Area */}
            <svg
              className="w-full h-[calc(100%-24px)] pl-7 overflow-visible"
              viewBox="0 0 600 200"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="score-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.01" />
                </linearGradient>
              </defs>

              {/* Area Under Curve */}
              {/* Y coordinates: val 30 = 200, val 100 = 10 -> y = 200 - ((val - 30) / 70) * 190 */}
              {/* Points: Mar (58->124), Apr (61->116), May (63->110), Jun (65->105), Jul (67->99), Aug (68->97) */}
              <path
                d="M 20 124 Q 80 120, 136 116 T 252 110 T 368 105 T 484 99 T 580 97 L 580 200 L 20 200 Z"
                fill="url(#score-grad)"
              />

              {/* Main Line */}
              <path
                d="M 20 124 Q 80 120, 136 116 T 252 110 T 368 105 T 484 99 T 580 97"
                fill="none"
                stroke="#f97316"
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Active hover points */}
              {hoveredTrendIdx !== null && (
                <circle
                  cx={20 + hoveredTrendIdx * 112}
                  cy={200 - ((SCORE_TRENDS_DATA[hoveredTrendIdx].overall - 30) / 70) * 190}
                  r="5"
                  fill="#f97316"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
            </svg>

            {/* Interactive Mouse Hover Columns */}
            <div className="absolute inset-0 pl-7 pb-6 flex">
              {SCORE_TRENDS_DATA.map((pt, idx) => (
                <div
                  key={pt.month}
                  onMouseEnter={() => setHoveredTrendIdx(idx)}
                  onMouseLeave={() => setHoveredTrendIdx(null)}
                  className="flex-1 h-full cursor-pointer relative"
                >
                  {hoveredTrendIdx === idx && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-medium py-1 px-2 rounded-lg shadow-lg z-30 pointer-events-none whitespace-nowrap">
                      {pt.month} 2025: AEO {pt.aeo} · GEO {pt.geo} · AIO {pt.aio}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* X-Axis Month Labels */}
            <div className="absolute bottom-0 left-7 right-0 flex justify-between px-2 text-xs font-medium text-slate-400">
              {SCORE_TRENDS_DATA.map((pt, idx) => (
                <span
                  key={pt.month}
                  className={`transition-colors ${
                    hoveredTrendIdx === idx ? 'text-orange-600 font-bold' : ''
                  }`}
                >
                  {pt.month}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recent Insights (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Insights
            </h2>
            <Zap className="w-4 h-4 text-orange-500 fill-orange-500/20" />
          </div>

          <div className="space-y-2.5 my-auto">
            {RECENT_INSIGHTS.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-50/60 border border-slate-100 hover:border-slate-200 transition-all hover:bg-slate-50 group cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor} shrink-0`} />
                  <span className="text-xs font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  {item.description}
                </p>
                <div className="text-[10px] text-slate-400 font-medium mt-1.5">
                  {item.timeAgo} · {item.platform}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Model Performance & Citations by Model */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Model Performance (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Model Performance
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                AEO, GEO &amp; AIO by AI model
              </p>
            </div>

            {/* Metric Legend */}
            <div className="flex items-center space-x-4 text-xs font-medium">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00bcd4]" />
                <span className="text-slate-600">AEO</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                <span className="text-slate-600">GEO</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f97316]" />
                <span className="text-slate-600">AIO</span>
              </div>
            </div>
          </div>

          {/* Vertical Bar Chart */}
          <div className="relative w-full h-56 sm:h-64 mt-2">
            {/* Y-Axis Value Labels & Horizontal Guide Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
              {[100, 75, 50, 25, 0].map((val) => (
                <div key={val} className="w-full flex items-center">
                  <span className="w-7 text-[11px] font-mono text-slate-400 text-right pr-2 select-none">
                    {val}
                  </span>
                  <div className="flex-1 border-b border-slate-100/80 border-dashed" />
                </div>
              ))}
            </div>

            {/* Bars Container */}
            <div className="relative w-full h-[calc(100%-24px)] pl-7 flex items-end justify-around">
              {MODEL_DATA.map((item) => {
                const isActive = isModelActive(item.code);
                const isHovered = hoveredBarModel === item.code;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredBarModel(item.code)}
                    onMouseLeave={() => setHoveredBarModel(null)}
                    onClick={() => toggleSelectedModel(item.name)}
                    className="flex-1 h-full flex flex-col items-center justify-end group cursor-pointer relative px-2"
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-10 bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-lg z-30 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95">
                        {item.name}: AEO {item.aeo} | GEO {item.geo} | AIO {item.aio} (Avg {item.avgScore})
                      </div>
                    )}

                    {/* Single Orange / Category Bar matching Image 1 */}
                    <div
                      className={`w-3.5 sm:w-4 rounded-t-xs transition-all duration-300 ${
                        !isActive
                          ? 'opacity-30'
                          : isHovered
                          ? 'bg-[#ea580c] shadow-xs'
                          : 'bg-[#fb923c]'
                      }`}
                      style={{
                        height: `${item.aeo}%`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Model Code Labels */}
            <div className="absolute bottom-0 left-7 right-0 flex justify-around text-xs font-medium text-slate-400">
              {MODEL_DATA.map((item) => (
                <span
                  key={item.id}
                  onClick={() => toggleSelectedModel(item.name)}
                  className={`cursor-pointer transition-colors ${
                    hoveredBarModel === item.code || (selectedModel && isModelActive(item.code))
                      ? 'text-slate-900 font-bold'
                      : ''
                  }`}
                >
                  {item.code}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Citations by Model (4 cols on lg) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Citations by Model
            </h2>
            <Link
              href="/dashboard/citations"
              className="text-slate-400 hover:text-slate-700 transition-colors"
              title="View all citations"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3.5 my-auto">
            {MODEL_DATA.map((item, idx) => {
              const isActive = isModelActive(item.code);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelectedModel(item.name)}
                  className={`flex items-center justify-between gap-3 text-xs transition-all duration-300 cursor-pointer group ${
                    isActive ? 'opacity-100' : 'opacity-30 hover:opacity-80'
                  }`}
                >
                  {/* Left: Rank & Badge */}
                  <div className="flex items-center space-x-2 w-28 shrink-0">
                    <span className="text-slate-400 font-mono w-3 text-right">
                      {idx + 1}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md font-bold text-[10px] font-mono ${item.badgeBg} ${item.badgeText}`}
                    >
                      {item.code}
                    </span>
                    <span className="font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </span>
                  </div>

                  {/* Center: Horizontal Bar */}
                  <div className="flex-1 bg-slate-50 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.barColor}`}
                      style={{ width: `${item.citationsBarWidth}%` }}
                    />
                  </div>

                  {/* Right: Citations Count */}
                  <span className="font-mono text-slate-700 font-medium w-12 text-right shrink-0">
                    {item.citations.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Competitive Rank Card */}
      <div className="bg-white rounded-2xl border border-slate-100/90 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Competitive Rank
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Industry standings vs. 6 competitors
            </p>
          </div>

          {/* Metric Segmented Switch: AEO / GEO / AIO */}
          <div className="bg-[#f1f5f9]/80 p-1 rounded-xl flex items-center space-x-0.5 self-start sm:self-auto">
            {(['AEO', 'GEO', 'AIO'] as const).map((tab) => {
              const isActive = activeRankMetric === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveRankMetric(tab)}
                  className={`px-3.5 py-1 text-xs font-semibold transition-all rounded-lg cursor-pointer ${
                    isActive
                      ? 'bg-white shadow-xs font-bold text-[#00bcd4]'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Competitor Ranked Rows */}
        <div className="space-y-4">
          {COMPETITOR_RANK_DATA.map((item) => {
            const currentScore = item.scores[activeRankMetric];
            const currentDelta = item.deltas[activeRankMetric];
            const isSelected = isCompetitorActive(item.name);

            return (
              <div
                key={item.rank}
                onClick={() => toggleSelectedCompetitor(item.name)}
                className={`flex items-center justify-between gap-3 sm:gap-4 group p-1.5 -m-1.5 rounded-xl transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'opacity-100 bg-slate-50/40 hover:bg-slate-50/70'
                    : 'opacity-30 hover:opacity-80'
                }`}
              >
                {/* Rank & Brand Name */}
                <div className="flex items-center space-x-3 w-44 sm:w-52 shrink-0">
                  <div className="w-5 flex items-center justify-center">
                    {item.rank === 1 && <span className="text-base">🥇</span>}
                    {item.rank === 2 && <span className="text-base">🥈</span>}
                    {item.rank === 3 && <span className="text-base">🥉</span>}
                    {item.rank > 3 && (
                      <span className="text-xs font-semibold text-slate-400 font-mono">
                        {item.rank}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 truncate">
                    <span className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </span>
                    {item.isTargetBrand && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold tracking-wider uppercase font-mono rounded-md bg-cyan-50 text-cyan-600 border border-cyan-100">
                        YOU
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar in Center */}
                <div className="flex-1 bg-slate-100/90 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#00bcd4] transition-all duration-500 ease-out"
                    style={{ width: `${currentScore}%` }}
                  />
                </div>

                {/* Score Number */}
                <span className="w-8 text-right font-mono font-bold text-xs text-[#00bcd4] shrink-0">
                  {currentScore}
                </span>

                {/* Delta Badge */}
                <div className="w-16 sm:w-20 text-right shrink-0">
                  <span
                    className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      currentDelta.isPositive
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100/60'
                        : 'bg-rose-50 text-rose-600 border-rose-100/60'
                    }`}
                  >
                    {currentDelta.isPositive ? (
                      <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                    ) : (
                      <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                    )}
                    <span>{currentDelta.value}</span>
                  </span>
                </div>

                {/* Other Metrics (GEO, AIO) */}
                <div className="hidden md:flex items-center space-x-2 text-[11px] font-mono text-slate-400 shrink-0 w-24 justify-end">
                  {activeRankMetric === 'AEO' && (
                    <>
                      <span>GEO {item.scores.GEO}</span>
                      <span>AIO {item.scores.AIO}</span>
                    </>
                  )}
                  {activeRankMetric === 'GEO' && (
                    <>
                      <span>AEO {item.scores.AEO}</span>
                      <span>AIO {item.scores.AIO}</span>
                    </>
                  )}
                  {activeRankMetric === 'AIO' && (
                    <>
                      <span>AEO {item.scores.AEO}</span>
                      <span>GEO {item.scores.GEO}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Full Model Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Full Model Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Dimensional AI telemetry and citation performance
            </p>
          </div>

          <span className="text-xs text-slate-400 font-medium">August 2025</span>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                <th className="py-3 px-6">MODEL</th>
                <th className="py-3 px-6">AEO SCORE</th>
                <th className="py-3 px-6">GEO SCORE</th>
                <th className="py-3 px-6">AIO SCORE</th>
                <th className="py-3 px-6">AVG SCORE</th>
                <th className="py-3 px-6">CITATIONS</th>
                <th className="py-3 px-6 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MODEL_DATA.map((item) => {
                const isActive = isModelActive(item.code);

                return (
                  <tr
                    key={item.id}
                    onClick={() => toggleSelectedModel(item.name)}
                    className={`transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'opacity-100 hover:bg-slate-50/60'
                        : 'opacity-30 hover:opacity-80'
                    }`}
                  >
                    {/* MODEL Badge + Name */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded-md font-bold text-[10px] font-mono ${item.badgeBg} ${item.badgeText}`}
                        >
                          {item.code}
                        </span>
                        <span className="font-bold text-slate-900 text-xs tracking-tight">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    {/* AEO SCORE */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xs font-semibold text-[#00bcd4] font-mono w-5">
                          {item.aeo}
                        </span>
                        <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#00bcd4]"
                            style={{ width: `${item.aeo}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* GEO SCORE */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xs font-semibold text-[#8b5cf6] font-mono w-5">
                          {item.geo}
                        </span>
                        <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#8b5cf6]"
                            style={{ width: `${item.geo}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* AIO SCORE */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xs font-semibold text-[#f97316] font-mono w-5">
                          {item.aio}
                        </span>
                        <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#f97316]"
                            style={{ width: `${item.aio}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* AVG SCORE */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {item.avgScore}
                      </span>
                    </td>

                    {/* CITATIONS */}
                    <td className="py-4 px-6 whitespace-nowrap font-mono text-slate-700">
                      {item.citations.toLocaleString()}
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          item.status === 'Strong'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : item.status === 'Moderate'
                            ? 'bg-amber-50 text-amber-700 border-amber-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
