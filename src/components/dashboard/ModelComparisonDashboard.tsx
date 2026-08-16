'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Download,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

export interface CompetitorBenchmark {
  rank: number;
  name: string;
  isTargetBrand?: boolean;
  aeo: number;
  geo: number;
  aio: number;
  overall: number;
  vsIndustry: number; // percentage vs industry avg
}

export const BENCHMARK_COMPETITORS: CompetitorBenchmark[] = [
  {
    rank: 1,
    name: 'Vertex Solutions',
    aeo: 82,
    geo: 71,
    aio: 75,
    overall: 76,
    vsIndustry: 17,
  },
  {
    rank: 2,
    name: 'Pinnacle AI',
    aeo: 77,
    geo: 65,
    aio: 80,
    overall: 74,
    vsIndustry: 15,
  },
  {
    rank: 3,
    name: 'Acme Corp',
    isTargetBrand: true,
    aeo: 78,
    geo: 62,
    aio: 70,
    overall: 70,
    vsIndustry: 12,
  },
  {
    rank: 4,
    name: 'Nexus AI',
    aeo: 72,
    geo: 60,
    aio: 68,
    overall: 67,
    vsIndustry: 8,
  },
  {
    rank: 5,
    name: 'Pulse Engine',
    aeo: 65,
    geo: 58,
    aio: 64,
    overall: 62,
    vsIndustry: 2,
  },
  {
    rank: 6,
    name: 'Horizon Tech',
    aeo: 59,
    geo: 52,
    aio: 58,
    overall: 56,
    vsIndustry: -4,
  },
  {
    rank: 7,
    name: 'OmniCore',
    aeo: 52,
    geo: 48,
    aio: 50,
    overall: 50,
    vsIndustry: -10,
  },
];

export interface GapItem {
  id: string;
  label: string;
  gap: number;
  color: string;
  barBg: string;
  topScore: number;
  yourScore: number;
}

export const GAP_ITEMS: GapItem[] = [
  {
    id: 'aeo',
    label: 'AEO',
    gap: 11,
    color: '#f97316',
    barBg: 'bg-[#fb923c]',
    topScore: 82,
    yourScore: 71,
  },
  {
    id: 'geo',
    label: 'GEO',
    gap: 21,
    color: '#f43f5e',
    barBg: 'bg-[#f43f5e]',
    topScore: 71,
    yourScore: 50,
  },
  {
    id: 'aio',
    label: 'AIO',
    gap: 17,
    color: '#f97316',
    barBg: 'bg-[#fb923c]',
    topScore: 80,
    yourScore: 63,
  },
  {
    id: 'prompts',
    label: 'Prompts',
    gap: 16,
    color: '#f97316',
    barBg: 'bg-[#fb923c]',
    topScore: 88,
    yourScore: 72,
  },
  {
    id: 'structured',
    label: 'Structured',
    gap: 11,
    color: '#22c55e',
    barBg: 'bg-[#34d399]',
    topScore: 79,
    yourScore: 68,
  },
  {
    id: 'freshness',
    label: 'Freshness',
    gap: 21,
    color: '#f43f5e',
    barBg: 'bg-[#f43f5e]',
    topScore: 85,
    yourScore: 64,
  },
];

export function ModelComparisonDashboard() {
  const {
    activeTenant,
    selectedCompetitor,
    toggleSelectedCompetitor,
    isFilterActive,
  } = useDashboard();

  const [hoveredGap, setHoveredGap] = useState<GapItem | null>(null);
  const [hoveredRadarAxis, setHoveredRadarAxis] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof CompetitorBenchmark>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sort competitors
  const sortedCompetitors = [...BENCHMARK_COMPETITORS].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'asc' ? valA - valB : valB - valA;
    }
    return 0;
  });

  const handleSort = (field: keyof CompetitorBenchmark) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const isCompetitorMatch = (name: string) => {
    if (!selectedCompetitor) return true;
    return selectedCompetitor.toLowerCase() === name.toLowerCase();
  };

  // Radar chart geometry for 5 axes
  // Center: (150, 140), Radius: 85
  const radarCx = 150;
  const radarCy = 140;
  const radarR = 85;

  const radarAxes = [
    { key: 'aeo', label: 'AEO', angle: -Math.PI / 2 }, // Top
    { key: 'geo', label: 'GEO', angle: -Math.PI / 2 + (2 * Math.PI) / 5 }, // Top-Right
    { key: 'aio', label: 'AIO', angle: -Math.PI / 2 + (4 * Math.PI) / 5 }, // Bottom-Right
    { key: 'citations', label: 'Citations', angle: -Math.PI / 2 + (6 * Math.PI) / 5 }, // Bottom-Left
    { key: 'coverage', label: 'Coverage', angle: -Math.PI / 2 + (8 * Math.PI) / 5 }, // Top-Left
  ];

  const getRadarCoords = (valuePct: number, angleRad: number) => {
    const r = radarR * (Math.max(10, Math.min(100, valuePct)) / 100);
    const x = radarCx + r * Math.cos(angleRad);
    const y = radarCy + r * Math.sin(angleRad);
    return { x, y };
  };

  // Datasets for Radar:
  // Acme Corp
  const acmeScores = { aeo: 78, geo: 62, aio: 70, citations: 68, coverage: 65 };
  const acmePointsStr = radarAxes
    .map((axis) => {
      const coords = getRadarCoords(acmeScores[axis.key as keyof typeof acmeScores], axis.angle);
      return `${coords.x},${coords.y}`;
    })
    .join(' ');

  // Industry Avg
  const industryScores = { aeo: 66, geo: 56, aio: 61, citations: 55, coverage: 58 };
  const industryPointsStr = radarAxes
    .map((axis) => {
      const coords = getRadarCoords(industryScores[axis.key as keyof typeof industryScores], axis.angle);
      return `${coords.x},${coords.y}`;
    })
    .join(' ');

  // Top Performer
  const topScores = { aeo: 82, geo: 71, aio: 75, citations: 80, coverage: 78 };
  const topPointsStr = radarAxes
    .map((axis) => {
      const coords = getRadarCoords(topScores[axis.key as keyof typeof topScores], axis.angle);
      return `${coords.x},${coords.y}`;
    })
    .join(' ');

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const handleExportCSV = () => {
    const headers = ['Rank', 'Company', 'AEO Score', 'GEO Score', 'AIO Score', 'Overall Score', 'Vs. Industry (%)'];
    const rows = sortedCompetitors.map((c) => [
      c.rank,
      c.name,
      c.aeo,
      c.geo,
      c.aio,
      c.overall,
      `${c.vsIndustry > 0 ? '+' : ''}${c.vsIndustry}%`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `industry_benchmarks_${activeTenant?.name?.toLowerCase().replace(/\s+/g, '-') || 'acme'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 select-none font-sans text-slate-900">
      {/* 1. Top KPI Row: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: VS. INDUSTRY AVG (AEO) */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              VS. INDUSTRY AVG (AEO)
            </span>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mt-1.5 font-mono flex items-baseline">
              +12 <span className="text-sm font-normal text-slate-400 ml-1 font-sans">pts</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-xs text-slate-400 font-normal">above industry average</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
              <TrendingUp className="w-3 h-3 stroke-[2.5]" />
              <span>+8.2%</span>
            </span>
          </div>
        </div>

        {/* Card 2: VS. INDUSTRY AVG (GEO) */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              VS. INDUSTRY AVG (GEO)
            </span>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mt-1.5 font-mono flex items-baseline">
              +6 <span className="text-sm font-normal text-slate-400 ml-1 font-sans">pts</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-xs text-slate-400 font-normal">above industry average</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
              <TrendingUp className="w-3 h-3 stroke-[2.5]" />
              <span>+4.1%</span>
            </span>
          </div>
        </div>

        {/* Card 3: VS. INDUSTRY AVG (AIO) */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              VS. INDUSTRY AVG (AIO)
            </span>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mt-1.5 font-mono flex items-baseline">
              +9 <span className="text-sm font-normal text-slate-400 ml-1 font-sans">pts</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-xs text-slate-400 font-normal">above industry average</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
              <TrendingUp className="w-3 h-3 stroke-[2.5]" />
              <span>+6.3%</span>
            </span>
          </div>
        </div>

        {/* Card 4: INDUSTRY RANK */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              INDUSTRY RANK
            </span>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mt-1.5 font-mono">
              #3
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-xs text-slate-400 font-normal">of 7 tracked competitors</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
              <TrendingUp className="w-3 h-3 stroke-[2.5]" />
              <span>+1%</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Performance Radar (Left) & Gap to Top Performer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {/* Left Card: Performance Radar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Performance Radar
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Acme Corp vs. industry average vs. top performer
            </p>
          </div>

          {/* SVG Radar Graphic */}
          <div className="relative flex items-center justify-center my-auto py-2">
            <svg
              viewBox="0 0 300 280"
              className="w-full max-w-[290px] h-[255px] overflow-visible"
            >
              {/* Concentric Pentagon Grid */}
              {gridLevels.map((lvl, idx) => {
                const ptsStr = radarAxes
                  .map((axis) => {
                    const coords = getRadarCoords(100 * lvl, axis.angle);
                    return `${coords.x},${coords.y}`;
                  })
                  .join(' ');

                return (
                  <polygon
                    key={idx}
                    points={ptsStr}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={idx === gridLevels.length - 1 ? '1.2' : '0.8'}
                    strokeDasharray={idx === gridLevels.length - 1 ? 'none' : '3,3'}
                  />
                );
              })}

              {/* Radial Spokes from Center to each vertex */}
              {radarAxes.map((axis) => {
                const pt = getRadarCoords(100, axis.angle);
                return (
                  <line
                    key={axis.key}
                    x1={radarCx}
                    y1={radarCy}
                    x2={pt.x}
                    y2={pt.y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Series 1: Industry Avg (Gray Dashed) */}
              <polygon
                points={industryPointsStr}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="1.6"
                strokeDasharray="4 3"
              />
              {radarAxes.map((axis) => {
                const pt = getRadarCoords(industryScores[axis.key as keyof typeof industryScores], axis.angle);
                return (
                  <circle
                    key={`ind-${axis.key}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="2.5"
                    fill="#94a3b8"
                  />
                );
              })}

              {/* Series 2: Top Performer (Green Dotted) */}
              <polygon
                points={topPointsStr}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.6"
                strokeDasharray="2 2"
              />
              {radarAxes.map((axis) => {
                const pt = getRadarCoords(topScores[axis.key as keyof typeof topScores], axis.angle);
                return (
                  <circle
                    key={`top-${axis.key}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="2.5"
                    fill="#10b981"
                  />
                );
              })}

              {/* Series 3: Acme Corp (Purple/Blue Solid with Shaded Fill) */}
              <polygon
                points={acmePointsStr}
                fill="rgba(99, 102, 241, 0.16)"
                stroke="#6366f1"
                strokeWidth="2"
                className="transition-all duration-300"
              />
              {radarAxes.map((axis) => {
                const pt = getRadarCoords(acmeScores[axis.key as keyof typeof acmeScores], axis.angle);
                return (
                  <circle
                    key={`acme-${axis.key}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    fill="#6366f1"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="cursor-pointer hover:r-5 transition-all"
                    onMouseEnter={() => setHoveredRadarAxis(axis.label)}
                    onMouseLeave={() => setHoveredRadarAxis(null)}
                  />
                );
              })}

              {/* Axis Labels */}
              {/* Top: AEO */}
              <text
                x={radarCx}
                y={radarCy - radarR - 10}
                textAnchor="middle"
                className="text-[11px] font-semibold fill-slate-500 font-sans"
              >
                AEO
              </text>
              {/* Top-Right: GEO */}
              <text
                x={radarCx + radarR * Math.cos(radarAxes[1].angle) + 12}
                y={radarCy + radarR * Math.sin(radarAxes[1].angle) - 2}
                textAnchor="start"
                className="text-[11px] font-semibold fill-slate-500 font-sans"
              >
                GEO
              </text>
              {/* Bottom-Right: AIO */}
              <text
                x={radarCx + radarR * Math.cos(radarAxes[2].angle) + 10}
                y={radarCy + radarR * Math.sin(radarAxes[2].angle) + 10}
                textAnchor="start"
                className="text-[11px] font-semibold fill-slate-500 font-sans"
              >
                AIO
              </text>
              {/* Bottom-Left: Citations */}
              <text
                x={radarCx + radarR * Math.cos(radarAxes[3].angle) - 10}
                y={radarCy + radarR * Math.sin(radarAxes[3].angle) + 10}
                textAnchor="end"
                className="text-[11px] font-semibold fill-slate-500 font-sans"
              >
                Citations
              </text>
              {/* Top-Left: Coverage */}
              <text
                x={radarCx + radarR * Math.cos(radarAxes[4].angle) - 12}
                y={radarCy + radarR * Math.sin(radarAxes[4].angle) - 2}
                textAnchor="end"
                className="text-[11px] font-semibold fill-slate-500 font-sans"
              >
                Coverage
              </text>
            </svg>
          </div>

          {/* Radar Legend */}
          <div className="flex items-center justify-center space-x-6 pt-2 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
              <span className="text-slate-600 font-medium">Acme Corp</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#94a3b8]" />
              <span className="text-slate-600 font-medium">Industry Avg</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span className="text-slate-600 font-medium">Top Performer</span>
            </div>
          </div>
        </div>

        {/* Right Card: Gap to Top Performer */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100/90 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Gap to Top Performer
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Points needed to reach category leader
            </p>
          </div>

          {/* Horizontal Bars Container */}
          <div className="space-y-4 my-auto py-2">
            {GAP_ITEMS.map((item) => {
              const maxScale = 30;
              const barWidthPct = (item.gap / maxScale) * 100;
              const isHovered = hoveredGap?.id === item.id;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredGap(item)}
                  onMouseLeave={() => setHoveredGap(null)}
                  className="flex items-center group relative cursor-pointer"
                >
                  {/* Left Label */}
                  <div className="w-24 text-right pr-3 text-xs font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">
                    {item.label}
                  </div>

                  {/* Horizontal Bar Track */}
                  <div className="flex-1 bg-slate-50 h-3.5 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${item.barBg} ${
                        isHovered ? 'brightness-110 shadow-xs' : ''
                      }`}
                      style={{ width: `${barWidthPct}%` }}
                    />
                  </div>

                  {/* Hover Tooltip */}
                  {isHovered && (
                    <div className="absolute left-28 -top-8 bg-slate-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-lg z-30 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95">
                      {item.label}: <span className="font-bold text-amber-300">{item.gap} pts</span> gap to reach leader ({item.topScore} pts vs your {item.yourScore} pts)
                    </div>
                  )}
                </div>
              );
            })}

            {/* X-Axis Tick Scale Line & Labels */}
            <div className="pt-2 pl-24 flex justify-between text-[11px] font-mono text-slate-400 border-t border-slate-100/80 mt-2">
              <span>0</span>
              <span>8</span>
              <span>16</span>
              <span>30</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Table Card: Full Industry Benchmark */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="p-6 border-b border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Full Industry Benchmark
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              All competitors ranked by overall AI visibility score
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Legend marker */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
              <span className="w-5 border-b border-slate-300 border-dashed" />
              <span>Industry avg</span>
            </div>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('rank')}
                  className="py-3 px-6 cursor-pointer hover:text-slate-700 transition-colors w-16"
                >
                  <div className="flex items-center space-x-1">
                    <span>RANK</span>
                    {sortField === 'rank' && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortDirection === 'desc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-6 cursor-pointer hover:text-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>COMPANY</span>
                    {sortField === 'name' && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortDirection === 'desc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('aeo')}
                  className="py-3 px-6 text-center cursor-pointer hover:text-slate-700 transition-colors w-24"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>AEO</span>
                    {sortField === 'aeo' && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortDirection === 'desc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('geo')}
                  className="py-3 px-6 text-center cursor-pointer hover:text-slate-700 transition-colors w-24"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>GEO</span>
                    {sortField === 'geo' && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortDirection === 'desc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('aio')}
                  className="py-3 px-6 text-center cursor-pointer hover:text-slate-700 transition-colors w-24"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>AIO</span>
                    {sortField === 'aio' && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortDirection === 'desc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('overall')}
                  className="py-3 px-6 text-center cursor-pointer hover:text-slate-700 transition-colors w-28"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>OVERALL</span>
                    {sortField === 'overall' && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortDirection === 'desc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('vsIndustry')}
                  className="py-3 px-6 text-right cursor-pointer hover:text-slate-700 transition-colors w-36"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>VS. INDUSTRY</span>
                    {sortField === 'vsIndustry' && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortDirection === 'desc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sortedCompetitors.map((item) => {
                const isSelected = selectedCompetitor ? isCompetitorMatch(item.name) : false;
                const isDimmed = selectedCompetitor ? !isSelected : false;
                const isPositive = item.vsIndustry >= 0;

                return (
                  <tr
                    key={item.name}
                    onClick={() => toggleSelectedCompetitor(item.name)}
                    className={`transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/70 opacity-100 font-semibold'
                        : isDimmed
                        ? 'opacity-30 hover:opacity-80'
                        : 'hover:bg-slate-50/60 opacity-100'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="w-6 flex items-center justify-center">
                        {item.rank === 1 && <span className="text-base">🥇</span>}
                        {item.rank === 2 && <span className="text-base">🥈</span>}
                        {item.rank === 3 && <span className="text-base">🥉</span>}
                        {item.rank > 3 && (
                          <span className="font-semibold text-slate-400 font-mono">
                            {item.rank}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Company Name + YOU Badge */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-xs tracking-tight">
                          {item.name}
                        </span>
                        {item.isTargetBrand && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold tracking-wider uppercase font-mono rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>

                    {/* AEO (Teal/Cyan) */}
                    <td className="py-4 px-6 text-center font-bold text-[#06b6d4] font-mono text-xs">
                      {item.aeo}
                    </td>

                    {/* GEO (Purple) */}
                    <td className="py-4 px-6 text-center font-bold text-[#8b5cf6] font-mono text-xs">
                      {item.geo}
                    </td>

                    {/* AIO (Orange) */}
                    <td className="py-4 px-6 text-center font-bold text-[#f97316] font-mono text-xs">
                      {item.aio}
                    </td>

                    {/* Overall (Bold Dark) */}
                    <td className="py-4 px-6 text-center font-bold text-slate-900 font-mono text-xs">
                      {item.overall}
                    </td>

                    {/* Vs. Industry (Green / Red Delta Badge) */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100/60'
                            : 'bg-rose-50 text-rose-600 border-rose-100/60'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                        ) : (
                          <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                        )}
                        <span>
                          {isPositive ? `+${item.vsIndustry}%` : `${item.vsIndustry}%`}
                        </span>
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
