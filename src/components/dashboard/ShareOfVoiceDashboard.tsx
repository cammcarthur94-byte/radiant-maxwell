'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ExternalLink,
  Bot,
  Info,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

export interface CompetitorData {
  id: string;
  name: string;
  isCurrentBrand?: boolean;
  share: number;
  delta: number;
  isPositive: boolean;
  color: string;
  dotColor: string;
  fillColor: string;
  strokeColor: string;
  mentions: number;
}

export interface ModelShareData {
  modelCode: string;
  modelName: string;
  shares: {
    acme: number;
    vertex: number;
    pinnacle: number;
    nexus: number;
    coresync: number;
    others: number;
  };
}

export interface MonthlyTrendData {
  month: string;
  acme: number;
  vertex: number;
  pinnacle: number;
  nexus: number;
  coresync: number;
  others: number;
}

export function ShareOfVoiceDashboard() {
  const {
    activeTenant,
    selectedModel,
    toggleSelectedModel,
    selectedCompetitor,
    toggleSelectedCompetitor,
    isFilterActive,
    clearFilters,
  } = useDashboard();
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);
  const [hoveredModelIdx, setHoveredModelIdx] = useState<number | null>(null);

  // Competitor matching helper
  const isCompetitorSelected = (id: string, name: string) => {
    if (!selectedCompetitor) return true;
    const target = selectedCompetitor.toLowerCase();
    return target === id.toLowerCase() || target === name.toLowerCase();
  };

  // Model matching helper
  const isModelSelected = (code: string, name?: string) => {
    if (!selectedModel) return true;
    const target = selectedModel.toLowerCase();
    return target === code.toLowerCase() || (name && target === name.toLowerCase());
  };

  // Competitor list matching screenshot data
  const competitors: CompetitorData[] = [
    {
      id: 'acme',
      name: activeTenant?.name || 'Acme Corp',
      isCurrentBrand: true,
      share: 26,
      delta: 3.1,
      isPositive: true,
      color: '#6366f1', // Indigo / Purple
      dotColor: 'bg-[#6366f1]',
      fillColor: 'rgba(99, 102, 241, 0.28)',
      strokeColor: '#6366f1',
      mentions: 1284,
    },
    {
      id: 'vertex',
      name: 'Vertex Solutions',
      share: 22,
      delta: -0.8,
      isPositive: false,
      color: '#06b6d4', // Cyan / Light Blue
      dotColor: 'bg-[#06b6d4]',
      fillColor: 'rgba(6, 182, 212, 0.28)',
      strokeColor: '#06b6d4',
      mentions: 1086,
    },
    {
      id: 'pinnacle',
      name: 'Pinnacle AI',
      share: 18,
      delta: -1.2,
      isPositive: false,
      color: '#a855f7', // Lavender / Violet
      dotColor: 'bg-[#a855f7]',
      fillColor: 'rgba(168, 85, 247, 0.25)',
      strokeColor: '#a855f7',
      mentions: 889,
    },
    {
      id: 'nexus',
      name: 'Nexus Digital',
      share: 16,
      delta: 0.5,
      isPositive: true,
      color: '#f97316', // Orange / Peach
      dotColor: 'bg-[#f97316]',
      fillColor: 'rgba(249, 115, 22, 0.28)',
      strokeColor: '#f97316',
      mentions: 790,
    },
    {
      id: 'coresync',
      name: 'CoreSync',
      share: 11,
      delta: 1.0,
      isPositive: true,
      color: '#10b981', // Mint / Emerald Green
      dotColor: 'bg-[#10b981]',
      fillColor: 'rgba(16, 185, 129, 0.28)',
      strokeColor: '#10b981',
      mentions: 543,
    },
    {
      id: 'others',
      name: 'Others',
      share: 7,
      delta: -0.4,
      isPositive: false,
      color: '#475569', // Slate Gray
      dotColor: 'bg-[#475569]',
      fillColor: 'rgba(71, 85, 105, 0.35)',
      strokeColor: '#475569',
      mentions: 345,
    },
  ];

  // 6-Month Evolution (Mar to Aug) for the 100% stacked area chart
  const monthlyTrends: MonthlyTrendData[] = [
    { month: 'Mar', acme: 20, vertex: 23, pinnacle: 20, nexus: 15, coresync: 14, others: 8 },
    { month: 'Apr', acme: 21, vertex: 23, pinnacle: 19.5, nexus: 15.5, coresync: 13, others: 8 },
    { month: 'May', acme: 22, vertex: 23, pinnacle: 19, nexus: 15.5, coresync: 12.5, others: 8 },
    { month: 'Jun', acme: 23, vertex: 22.5, pinnacle: 18.5, nexus: 16, coresync: 12, others: 8 },
    { month: 'Jul', acme: 24.5, vertex: 22, pinnacle: 18, nexus: 16, coresync: 11.5, others: 8 },
    { month: 'Aug', acme: 26, vertex: 22, pinnacle: 18, nexus: 16, coresync: 11, others: 7 },
  ];

  // Stacked Bar Data per AI Platform (GPT, GEM, CLD, PPX, GRK, MTA)
  const modelShares: ModelShareData[] = [
    {
      modelCode: 'GPT',
      modelName: 'OpenAI ChatGPT-4o',
      shares: { acme: 24, vertex: 23, pinnacle: 20, nexus: 16, coresync: 11, others: 6 },
    },
    {
      modelCode: 'GEM',
      modelName: 'Google Gemini 1.5 Pro',
      shares: { acme: 22, vertex: 24, pinnacle: 19, nexus: 17, coresync: 12, others: 6 },
    },
    {
      modelCode: 'CLD',
      modelName: 'Anthropic Claude 3.5 Sonnet',
      shares: { acme: 25, vertex: 21, pinnacle: 18, nexus: 18, coresync: 11, others: 7 },
    },
    {
      modelCode: 'PPX',
      modelName: 'Perplexity Sonar Pro',
      shares: { acme: 26, vertex: 20, pinnacle: 19, nexus: 17, coresync: 11, others: 7 },
    },
    {
      modelCode: 'GRK',
      modelName: 'xAI Grok 2',
      shares: { acme: 23, vertex: 23, pinnacle: 20, nexus: 17, coresync: 10, others: 7 },
    },
    {
      modelCode: 'MTA',
      modelName: 'Meta Llama 3.3',
      shares: { acme: 21, vertex: 24, pinnacle: 20, nexus: 17, coresync: 11, others: 7 },
    },
  ];

  // Donut SVG Calculations
  // Center (120, 120), R=100, r=64
  const cx = 120;
  const cy = 120;
  const outerR = 98;
  const innerR = 62;

  let currentAngle = -90; // Start at 12 o'clock
  const donutSlices = competitors.map((comp) => {
    const sliceAngle = (comp.share / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle += sliceAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + outerR * Math.cos(startRad);
    const y1 = cy + outerR * Math.sin(startRad);
    const x2 = cx + outerR * Math.cos(endRad);
    const y2 = cy + outerR * Math.sin(endRad);

    const x3 = cx + innerR * Math.cos(endRad);
    const y3 = cy + innerR * Math.sin(endRad);
    const x4 = cx + innerR * Math.cos(startRad);
    const y4 = cy + innerR * Math.sin(startRad);

    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    return {
      ...comp,
      pathData,
      startAngle,
      endAngle,
    };
  });

  // Stacked Area Chart Calculations
  // Coordinate Space: 0 0 600 200
  // X coordinates for 6 months
  const xPoints = [40, 145, 250, 355, 460, 565];
  const chartHeight = 160;
  const chartTopY = 20;
  const chartBottomY = 180;

  // Compute accumulated cumulative percentages for each layer
  // Layer 0: Baseline (0% -> y = 180)
  // Layer 1: Acme
  // Layer 2: Vertex
  // Layer 3: Pinnacle
  // Layer 4: Nexus
  // Layer 5: CoreSync
  // Layer 6: Others (100% -> y = 20)
  const getY = (pct: number) => chartBottomY - (pct / 100) * chartHeight;

  const cumLayers = monthlyTrends.map((t) => {
    const l1 = t.acme;
    const l2 = l1 + t.vertex;
    const l3 = l2 + t.pinnacle;
    const l4 = l3 + t.nexus;
    const l5 = l4 + t.coresync;
    const l6 = 100;
    return {
      month: t.month,
      y0: chartBottomY,
      y1: getY(l1),
      y2: getY(l2),
      y3: getY(l3),
      y4: getY(l4),
      y5: getY(l5),
      y6: getY(l6),
    };
  });

  // Helper to build smooth SVG path between points
  const buildAreaPath = (topKey: 'y1' | 'y2' | 'y3' | 'y4' | 'y5' | 'y6', botKey: 'y0' | 'y1' | 'y2' | 'y3' | 'y4' | 'y5') => {
    // Top line forward
    let d = `M ${xPoints[0]} ${cumLayers[0][topKey]}`;
    for (let i = 1; i < cumLayers.length; i++) {
      const prevX = xPoints[i - 1];
      const prevY = cumLayers[i - 1][topKey];
      const curX = xPoints[i];
      const curY = cumLayers[i][topKey];
      const cp1x = prevX + (curX - prevX) / 2;
      const cp2x = prevX + (curX - prevX) / 2;
      d += ` C ${cp1x} ${prevY}, ${cp2x} ${curY}, ${curX} ${curY}`;
    }
    // Bottom line backward
    d += ` L ${xPoints[cumLayers.length - 1]} ${cumLayers[cumLayers.length - 1][botKey]}`;
    for (let i = cumLayers.length - 2; i >= 0; i--) {
      const nextX = xPoints[i + 1];
      const nextY = cumLayers[i + 1][botKey];
      const curX = xPoints[i];
      const curY = cumLayers[i][botKey];
      const cp1x = nextX - (nextX - curX) / 2;
      const cp2x = nextX - (nextX - curX) / 2;
      d += ` C ${cp1x} ${nextY}, ${cp2x} ${curY}, ${curX} ${curY}`;
    }
    d += ' Z';
    return d;
  };

  const buildStrokePath = (key: 'y1' | 'y2' | 'y3' | 'y4' | 'y5' | 'y6') => {
    let d = `M ${xPoints[0]} ${cumLayers[0][key]}`;
    for (let i = 1; i < cumLayers.length; i++) {
      const prevX = xPoints[i - 1];
      const prevY = cumLayers[i - 1][key];
      const curX = xPoints[i];
      const curY = cumLayers[i][key];
      const cp1x = prevX + (curX - prevX) / 2;
      const cp2x = prevX + (curX - prevX) / 2;
      d += ` C ${cp1x} ${prevY}, ${cp2x} ${curY}, ${curX} ${curY}`;
    }
    return d;
  };

  return (
    <div className="space-y-6 pb-8 select-none font-sans text-slate-900">
      {/* 1. TOP KPI SUMMARY ROW */}
      <section
        aria-label="Key Performance Indicators"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Card 1: SHARE OF VOICE */}
        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              SHARE OF VOICE
            </span>
            <div className="flex items-baseline mt-2.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                26.0
              </span>
              <span className="text-xs font-medium text-slate-400 ml-0.5">%</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-normal">vs. last month</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/80 font-mono">
              <ArrowUpRight className="w-3 h-3" />
              <span>+3.1%</span>
            </span>
          </div>
        </div>

        {/* Card 2: MARKET RANK */}
        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              CATEGORY RANK
            </span>
            <div className="flex items-baseline mt-2.5">
              <span className="text-3xl font-extrabold text-indigo-600 tracking-tight font-sans">
                #1
              </span>
              <span className="text-xs font-medium text-slate-400 ml-1">/ 6 tracked</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-normal truncate max-w-[170px]">
              market leader in AI share
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/80 font-mono">
              <ShieldCheck className="w-3 h-3" />
              <span>Leading</span>
            </span>
          </div>
        </div>

        {/* Card 3: BRAND MENTIONS */}
        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              TOTAL BRAND MENTIONS
            </span>
            <div className="flex items-baseline mt-2.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                1,284
              </span>
              <span className="text-xs font-medium text-slate-400 ml-1">indexed</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-normal">cross-engine citations</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/80 font-mono">
              <ArrowUpRight className="w-3 h-3" />
              <span>+14.2%</span>
            </span>
          </div>
        </div>

        {/* Card 4: COMPETITORS TRACKED */}
        <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              COMPETITORS TRACKED
            </span>
            <div className="flex items-baseline mt-2.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                5
              </span>
              <span className="text-xs font-medium text-slate-400 ml-1">active rivals</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-normal">across 6 AI platforms</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/80 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              <span>Synced</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. MIDDLE SECTION: OVERALL SHARE & SHARE OF VOICE TREND */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Card: Overall Share (col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-slate-100/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Overall Share
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Brand mentions — August 2025
              </p>
            </div>
            {selectedCompetitor && (
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-md">
                Filtered: {selectedCompetitor}
              </span>
            )}
          </div>

          {/* Donut Chart Visual */}
          <div className="relative flex items-center justify-center my-4">
            <svg
              viewBox="0 0 240 240"
              className="w-56 h-56 transform -rotate-90 overflow-visible drop-shadow-2xs"
            >
              {donutSlices.map((slice) => {
                const isHovered = hoveredSlice === slice.id;
                const isSelected = isCompetitorSelected(slice.id, slice.name);
                const opacity = isSelected ? 1.0 : 0.2;

                return (
                  <path
                    key={slice.id}
                    d={slice.pathData}
                    fill={slice.color}
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    fillOpacity={opacity}
                    strokeOpacity={opacity}
                    className="cursor-pointer transition-all duration-300 ease-out"
                    style={{
                      transformOrigin: `${cx}px ${cy}px`,
                      transform: isHovered ? 'scale(1.04)' : isSelected && selectedCompetitor ? 'scale(1.02)' : 'scale(1)',
                      filter: isHovered ? 'brightness(1.1)' : 'none',
                    }}
                    onClick={() => toggleSelectedCompetitor(slice.name)}
                    onMouseEnter={() => setHoveredSlice(slice.id)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                );
              })}
            </svg>

            {/* Hover Tooltip in Center of Donut */}
            {hoveredSlice ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xs font-semibold text-slate-500">
                  {competitors.find((c) => c.id === hoveredSlice)?.name}
                </span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {competitors.find((c) => c.id === hoveredSlice)?.share}%
                </span>
              </div>
            ) : selectedCompetitor ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xs font-semibold text-indigo-600">
                  {selectedCompetitor}
                </span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {competitors.find((c) => isCompetitorSelected(c.id, c.name))?.share || '26'}%
                </span>
              </div>
            ) : null}
          </div>

          {/* 2-Column Legend */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 pt-4 border-t border-slate-50 text-xs">
            {/* Column 1 */}
            <div className="space-y-2.5">
              <div
                className={`flex items-center justify-between transition-opacity duration-300 cursor-pointer ${
                  !isCompetitorSelected('acme', competitors[0].name) ? 'opacity-30 hover:opacity-80' : 'opacity-100'
                }`}
                onClick={() => toggleSelectedCompetitor(competitors[0].name)}
                onMouseEnter={() => setHoveredSlice('acme')}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1] shrink-0" />
                  <span className="font-medium text-slate-700">Acme Corp</span>
                </div>
                <span className="font-mono font-bold text-slate-900">26%</span>
              </div>

              <div
                className={`flex items-center justify-between transition-opacity duration-300 cursor-pointer ${
                  !isCompetitorSelected('pinnacle', 'Pinnacle AI') ? 'opacity-30 hover:opacity-80' : 'opacity-100'
                }`}
                onClick={() => toggleSelectedCompetitor('Pinnacle AI')}
                onMouseEnter={() => setHoveredSlice('pinnacle')}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] shrink-0" />
                  <span className="font-medium text-slate-700">Pinnacle AI</span>
                </div>
                <span className="font-mono font-bold text-slate-900">18%</span>
              </div>

              <div
                className={`flex items-center justify-between transition-opacity duration-300 cursor-pointer ${
                  !isCompetitorSelected('coresync', 'CoreSync') ? 'opacity-30 hover:opacity-80' : 'opacity-100'
                }`}
                onClick={() => toggleSelectedCompetitor('CoreSync')}
                onMouseEnter={() => setHoveredSlice('coresync')}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0" />
                  <span className="font-medium text-slate-700">CoreSync</span>
                </div>
                <span className="font-mono font-bold text-slate-900">11%</span>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-2.5">
              <div
                className={`flex items-center justify-between transition-opacity duration-300 cursor-pointer ${
                  !isCompetitorSelected('vertex', 'Vertex Solutions') ? 'opacity-30 hover:opacity-80' : 'opacity-100'
                }`}
                onClick={() => toggleSelectedCompetitor('Vertex Solutions')}
                onMouseEnter={() => setHoveredSlice('vertex')}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] shrink-0" />
                  <span className="font-medium text-slate-700">Vertex Solutions</span>
                </div>
                <span className="font-mono font-bold text-slate-900">22%</span>
              </div>

              <div
                className={`flex items-center justify-between transition-opacity duration-300 cursor-pointer ${
                  !isCompetitorSelected('nexus', 'Nexus Digital') ? 'opacity-30 hover:opacity-80' : 'opacity-100'
                }`}
                onClick={() => toggleSelectedCompetitor('Nexus Digital')}
                onMouseEnter={() => setHoveredSlice('nexus')}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shrink-0" />
                  <span className="font-medium text-slate-700">Nexus Digital</span>
                </div>
                <span className="font-mono font-bold text-slate-900">16%</span>
              </div>

              <div
                className={`flex items-center justify-between transition-opacity duration-300 cursor-pointer ${
                  !isCompetitorSelected('others', 'Others') ? 'opacity-30 hover:opacity-80' : 'opacity-100'
                }`}
                onClick={() => toggleSelectedCompetitor('Others')}
                onMouseEnter={() => setHoveredSlice('others')}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#475569] shrink-0" />
                  <span className="font-medium text-slate-700">Others</span>
                </div>
                <span className="font-mono font-bold text-slate-900">7%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Share of Voice Trend (col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-100/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Share of Voice Trend
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Monthly share evolution — all competitors
              </p>
            </div>
            {selectedCompetitor && (
              <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 border border-purple-100/80 px-2 py-0.5 rounded-md">
                Tracking: {selectedCompetitor}
              </span>
            )}
          </div>

          {/* 100% Stacked Area Chart */}
          <div className="relative w-full mt-4 h-64 flex flex-col justify-between">
            {/* SVG Visual */}
            <div className="relative flex-1 w-full">
              {/* Y-Axis Reference Labels */}
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[11px] font-mono text-slate-400 select-none w-10 text-right pr-2">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Main SVG Area */}
              <div className="ml-11 h-full relative">
                <svg
                  className="w-full h-[calc(100%-24px)] overflow-visible"
                  viewBox="0 0 600 200"
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Gradients for each stacked band */}
                    <linearGradient id="sovAcmeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e0e7ff" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.75" />
                    </linearGradient>

                    <linearGradient id="sovVertexGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#cffafe" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#a5f3fc" stopOpacity="0.75" />
                    </linearGradient>

                    <linearGradient id="sovPinnacleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f3e8ff" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.75" />
                    </linearGradient>

                    <linearGradient id="sovNexusGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffedd5" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#fed7aa" stopOpacity="0.75" />
                    </linearGradient>

                    <linearGradient id="sovCoreSyncGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d1fae5" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0.75" />
                    </linearGradient>

                    <linearGradient id="sovOthersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.95" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="20" x2="600" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="600" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="600" y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="180" x2="600" y2="180" stroke="#f1f5f9" strokeDasharray="3 3" />

                  {/* Layer 6: Others (Top band) */}
                  <g
                    className="cursor-pointer transition-opacity duration-300"
                    style={{ opacity: isCompetitorSelected('others', 'Others') ? 1.0 : 0.2 }}
                    onClick={() => toggleSelectedCompetitor('Others')}
                  >
                    <path d={buildAreaPath('y6', 'y5')} fill="url(#sovOthersGrad)" />
                    <path d={buildStrokePath('y6')} fill="none" stroke="#475569" strokeWidth="2.5" />
                  </g>

                  {/* Layer 5: CoreSync (Mint Green) */}
                  <g
                    className="cursor-pointer transition-opacity duration-300"
                    style={{ opacity: isCompetitorSelected('coresync', 'CoreSync') ? 1.0 : 0.2 }}
                    onClick={() => toggleSelectedCompetitor('CoreSync')}
                  >
                    <path d={buildAreaPath('y5', 'y4')} fill="url(#sovCoreSyncGrad)" />
                    <path d={buildStrokePath('y5')} fill="none" stroke="#34d399" strokeWidth="1.2" />
                  </g>

                  {/* Layer 4: Nexus Digital (Orange/Peach) */}
                  <g
                    className="cursor-pointer transition-opacity duration-300"
                    style={{ opacity: isCompetitorSelected('nexus', 'Nexus Digital') ? 1.0 : 0.2 }}
                    onClick={() => toggleSelectedCompetitor('Nexus Digital')}
                  >
                    <path d={buildAreaPath('y4', 'y3')} fill="url(#sovNexusGrad)" />
                    <path d={buildStrokePath('y4')} fill="none" stroke="#fb923c" strokeWidth="1.2" />
                  </g>

                  {/* Layer 3: Pinnacle AI (Lavender) */}
                  <g
                    className="cursor-pointer transition-opacity duration-300"
                    style={{ opacity: isCompetitorSelected('pinnacle', 'Pinnacle AI') ? 1.0 : 0.2 }}
                    onClick={() => toggleSelectedCompetitor('Pinnacle AI')}
                  >
                    <path d={buildAreaPath('y3', 'y2')} fill="url(#sovPinnacleGrad)" />
                    <path d={buildStrokePath('y3')} fill="none" stroke="#c084fc" strokeWidth="1.2" />
                  </g>

                  {/* Layer 2: Vertex Solutions (Cyan) */}
                  <g
                    className="cursor-pointer transition-opacity duration-300"
                    style={{ opacity: isCompetitorSelected('vertex', 'Vertex Solutions') ? 1.0 : 0.2 }}
                    onClick={() => toggleSelectedCompetitor('Vertex Solutions')}
                  >
                    <path d={buildAreaPath('y2', 'y1')} fill="url(#sovVertexGrad)" />
                    <path d={buildStrokePath('y2')} fill="none" stroke="#38bdf8" strokeWidth="1.2" />
                  </g>

                  {/* Layer 1: Acme Corp (Indigo/Purple base) */}
                  <g
                    className="cursor-pointer transition-opacity duration-300"
                    style={{ opacity: isCompetitorSelected('acme', competitors[0].name) ? 1.0 : 0.2 }}
                    onClick={() => toggleSelectedCompetitor(competitors[0].name)}
                  >
                    <path d={buildAreaPath('y1', 'y0')} fill="url(#sovAcmeGrad)" />
                    <path d={buildStrokePath('y1')} fill="none" stroke="#818cf8" strokeWidth="1.5" />
                  </g>

                  {/* Vertical Hover Guide Line */}
                  {hoveredMonthIdx !== null && (
                    <line
                      x1={xPoints[hoveredMonthIdx]}
                      y1="20"
                      x2={xPoints[hoveredMonthIdx]}
                      y2="180"
                      stroke="#475569"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Interactive Month Points */}
                  {xPoints.map((x, i) => (
                    <g key={i} className="cursor-pointer">
                      <rect
                        x={x - 20}
                        y="0"
                        width="40"
                        height="200"
                        fill="transparent"
                        onMouseEnter={() => setHoveredMonthIdx(i)}
                        onMouseLeave={() => setHoveredMonthIdx(null)}
                      />
                    </g>
                  ))}
                </svg>

                {/* X-Axis Month Labels */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1.5 px-4 select-none">
                  {monthlyTrends.map((m, idx) => (
                    <button
                      key={m.month}
                      type="button"
                      onMouseEnter={() => setHoveredMonthIdx(idx)}
                      onMouseLeave={() => setHoveredMonthIdx(null)}
                      className={`hover:text-slate-900 transition-colors cursor-pointer ${
                        hoveredMonthIdx === idx ? 'text-indigo-600 font-bold' : ''
                      }`}
                    >
                      {m.month}
                    </button>
                  ))}
                </div>

                {/* Hover Tooltip for Selected Month */}
                {hoveredMonthIdx !== null && (
                  <div
                    className="absolute z-20 bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 pointer-events-none animate-in fade-in"
                    style={{
                      left: `${(hoveredMonthIdx / 5) * 82 + 8}%`,
                      top: '15px',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="font-bold text-slate-200 border-b border-slate-700 pb-1 flex items-center justify-between gap-4">
                      <span>{monthlyTrends[hoveredMonthIdx].month} 2025</span>
                      <span className="text-[10px] text-slate-400 font-mono">100% Total</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-3 text-[#a5b4fc] font-semibold">
                        <span>Acme Corp:</span>
                        <span>{monthlyTrends[hoveredMonthIdx].acme}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[#67e8f9]">
                        <span>Vertex Solutions:</span>
                        <span>{monthlyTrends[hoveredMonthIdx].vertex}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[#d8b4fe]">
                        <span>Pinnacle AI:</span>
                        <span>{monthlyTrends[hoveredMonthIdx].pinnacle}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[#fdba74]">
                        <span>Nexus Digital:</span>
                        <span>{monthlyTrends[hoveredMonthIdx].nexus}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[#6ee7b7]">
                        <span>CoreSync:</span>
                        <span>{monthlyTrends[hoveredMonthIdx].coresync}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-slate-400">
                        <span>Others:</span>
                        <span>{monthlyTrends[hoveredMonthIdx].others}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: SHARE BY MODEL & COMPETITOR BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Card: Share by Model (col-span-6) */}
        <div className="lg:col-span-6 bg-white border border-slate-100/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Share by Model
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Brand mention distribution per AI platform
              </p>
            </div>
            {selectedModel && (
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-md">
                Model: {selectedModel}
              </span>
            )}
          </div>

          {/* 100% Stacked Bar Chart */}
          <div className="relative w-full mt-4 h-64 flex flex-col justify-between">
            {/* SVG Visual */}
            <div className="relative flex-1 w-full">
              {/* Y-Axis Labels */}
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[11px] font-mono text-slate-400 select-none w-10 text-right pr-2">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Main SVG Area */}
              <div className="ml-11 h-full relative">
                <svg
                  className="w-full h-[calc(100%-24px)] overflow-visible"
                  viewBox="0 0 500 200"
                  preserveAspectRatio="none"
                >
                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="180" x2="500" y2="180" stroke="#f1f5f9" strokeDasharray="3 3" />

                  {/* 6 Stacked Bars */}
                  {modelShares.map((m, idx) => {
                    const barWidth = 32;
                    const barX = 35 + idx * 78;
                    const totalH = 160; // from y=20 (100%) to y=180 (0%)

                    // Heights in pixels
                    const hAcme = (m.shares.acme / 100) * totalH;
                    const hVertex = (m.shares.vertex / 100) * totalH;
                    const hPinnacle = (m.shares.pinnacle / 100) * totalH;
                    const hNexus = (m.shares.nexus / 100) * totalH;
                    const hCoreSync = (m.shares.coresync / 100) * totalH;
                    const hOthers = (m.shares.others / 100) * totalH;

                    // Y positions stacking upwards from y=180
                    const yAcme = 180 - hAcme;
                    const yVertex = yAcme - hVertex;
                    const yPinnacle = yVertex - hPinnacle;
                    const yNexus = yPinnacle - hNexus;
                    const yCoreSync = yNexus - hCoreSync;
                    const yOthers = 20;

                    const isModelMatch = isModelSelected(m.modelCode, m.modelName);
                    const barOpacity = isModelMatch ? 1.0 : 0.2;

                    return (
                      <g
                        key={m.modelCode}
                        className="cursor-pointer transition-all duration-300"
                        onMouseEnter={() => setHoveredModelIdx(idx)}
                        onMouseLeave={() => setHoveredModelIdx(null)}
                        onClick={() => toggleSelectedModel(m.modelCode)}
                        style={{
                          opacity: barOpacity,
                        }}
                      >
                        {/* Segment 1: Acme Corp (Bottom) */}
                        <rect
                          x={barX}
                          y={yAcme}
                          width={barWidth}
                          height={hAcme}
                          fill="#6366f1"
                          fillOpacity={isCompetitorSelected('acme', competitors[0].name) ? 1.0 : 0.2}
                          className="transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectedCompetitor(competitors[0].name);
                          }}
                        />

                        {/* Segment 2: Vertex Solutions */}
                        <rect
                          x={barX}
                          y={yVertex}
                          width={barWidth}
                          height={hVertex}
                          fill="#06b6d4"
                          fillOpacity={isCompetitorSelected('vertex', 'Vertex Solutions') ? 1.0 : 0.2}
                          className="transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectedCompetitor('Vertex Solutions');
                          }}
                        />

                        {/* Segment 3: Pinnacle AI */}
                        <rect
                          x={barX}
                          y={yPinnacle}
                          width={barWidth}
                          height={hPinnacle}
                          fill="#a855f7"
                          fillOpacity={isCompetitorSelected('pinnacle', 'Pinnacle AI') ? 1.0 : 0.2}
                          className="transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectedCompetitor('Pinnacle AI');
                          }}
                        />

                        {/* Segment 4: Nexus Digital */}
                        <rect
                          x={barX}
                          y={yNexus}
                          width={barWidth}
                          height={hNexus}
                          fill="#f97316"
                          fillOpacity={isCompetitorSelected('nexus', 'Nexus Digital') ? 1.0 : 0.2}
                          className="transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectedCompetitor('Nexus Digital');
                          }}
                        />

                        {/* Segment 5: CoreSync */}
                        <rect
                          x={barX}
                          y={yCoreSync}
                          width={barWidth}
                          height={hCoreSync}
                          fill="#10b981"
                          fillOpacity={isCompetitorSelected('coresync', 'CoreSync') ? 1.0 : 0.2}
                          className="transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectedCompetitor('CoreSync');
                          }}
                        />

                        {/* Segment 6: Others (Top) */}
                        <rect
                          x={barX}
                          y={yOthers}
                          width={barWidth}
                          height={hOthers}
                          fill="#475569"
                          fillOpacity={isCompetitorSelected('others', 'Others') ? 1.0 : 0.2}
                          className="transition-all duration-300"
                          rx="2"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectedCompetitor('Others');
                          }}
                        />

                        {/* Subtle divider strokes between segments */}
                        <line x1={barX} y1={yAcme} x2={barX + barWidth} y2={yAcme} stroke="#ffffff" strokeWidth="1" />
                        <line x1={barX} y1={yVertex} x2={barX + barWidth} y2={yVertex} stroke="#ffffff" strokeWidth="1" />
                        <line x1={barX} y1={yPinnacle} x2={barX + barWidth} y2={yPinnacle} stroke="#ffffff" strokeWidth="1" />
                        <line x1={barX} y1={yNexus} x2={barX + barWidth} y2={yNexus} stroke="#ffffff" strokeWidth="1" />
                        <line x1={barX} y1={yCoreSync} x2={barX + barWidth} y2={yCoreSync} stroke="#ffffff" strokeWidth="1" />
                      </g>
                    );
                  })}
                </svg>

                {/* X-Axis Model Labels */}
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-400 pt-1.5 px-4 select-none">
                  {modelShares.map((m, idx) => {
                    const isSelected = isModelSelected(m.modelCode, m.modelName);
                    return (
                      <button
                        key={m.modelCode}
                        type="button"
                        onClick={() => toggleSelectedModel(m.modelCode)}
                        onMouseEnter={() => setHoveredModelIdx(idx)}
                        onMouseLeave={() => setHoveredModelIdx(null)}
                        className={`transition-all duration-300 cursor-pointer ${
                          selectedModel && isSelected
                            ? 'text-indigo-600 font-extrabold scale-110'
                            : !isSelected
                            ? 'text-slate-300'
                            : 'hover:text-slate-900'
                        }`}
                      >
                        {m.modelCode}
                      </button>
                    );
                  })}
                </div>

                {/* Hover Tooltip for Selected Model */}
                {hoveredModelIdx !== null && (
                  <div
                    className="absolute z-20 bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 pointer-events-none animate-in fade-in"
                    style={{
                      left: `${(hoveredModelIdx / 5) * 80 + 10}%`,
                      top: '15px',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">
                      {modelShares[hoveredModelIdx].modelName}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-3 text-[#a5b4fc] font-semibold">
                        <span>Acme Corp:</span>
                        <span>{modelShares[hoveredModelIdx].shares.acme}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[#67e8f9]">
                        <span>Vertex Solutions:</span>
                        <span>{modelShares[hoveredModelIdx].shares.vertex}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[#d8b4fe]">
                        <span>Pinnacle AI:</span>
                        <span>{modelShares[hoveredModelIdx].shares.pinnacle}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[#fdba74]">
                        <span>Nexus Digital:</span>
                        <span>{modelShares[hoveredModelIdx].shares.nexus}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[#6ee7b7]">
                        <span>CoreSync:</span>
                        <span>{modelShares[hoveredModelIdx].shares.coresync}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-slate-400">
                        <span>Others:</span>
                        <span>{modelShares[hoveredModelIdx].shares.others}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Competitor Breakdown (col-span-6) */}
        <div className="lg:col-span-6 bg-white border border-slate-100/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Competitor Breakdown
              </h2>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Share rankings with monthly change
              </p>
            </div>
            {selectedCompetitor && (
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-md">
                Active: {selectedCompetitor}
              </span>
            )}
          </div>

          {/* Ranked Competitors List */}
          <div className="divide-y divide-slate-100 my-auto">
            {competitors.map((comp, idx) => {
              const isSelected = isCompetitorSelected(comp.id, comp.name);
              return (
                <div
                  key={comp.id}
                  onClick={() => toggleSelectedCompetitor(comp.name)}
                  className={`py-3 first:pt-2 last:pb-1 flex items-center justify-between gap-3 group cursor-pointer transition-all duration-300 rounded-lg px-2 hover:bg-slate-50/80 ${
                    isSelected
                      ? 'opacity-100'
                      : 'opacity-30 hover:opacity-80'
                  }`}
                >
                  {/* Left: Rank & Brand Info */}
                  <div className="flex items-center space-x-3 w-48 shrink-0">
                    <span className="text-xs font-mono font-medium text-slate-400 w-4">
                      {idx + 1}
                    </span>
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {comp.name}
                      </span>
                      {comp.isCurrentBrand && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-[10px] font-bold text-indigo-700 border border-indigo-100/80 uppercase">
                          YOU
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Progress Bar */}
                  <div className="flex-1 mx-2">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(comp.share / 26) * 100}%`,
                          backgroundColor: comp.color,
                        }}
                      />
                    </div>
                  </div>

                  {/* Right: Percentage & Delta Pill */}
                  <div className="flex items-center space-x-3 w-24 justify-end shrink-0">
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {comp.share}%
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                        comp.isPositive
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-500'
                      }`}
                    >
                      {comp.isPositive ? '↗' : '↘'} {comp.isPositive ? `+${comp.delta}%` : `${comp.delta}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

