'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

export interface ModelMetricData {
  id: string;
  name: string;
  shortName: string;
  color: string;
  dotBg: string;
  fillColor: string;
  strokeColor: string;
  aeo: number;
  geo: number;
  aio: number;
  avgScore: number;
  citations: number;
  momTrend: number;
  description: string;
}

export const DEFAULT_MODELS: ModelMetricData[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    shortName: 'ChatGPT',
    color: '#10b981',
    dotBg: 'bg-[#10b981]',
    fillColor: 'rgba(16, 185, 129, 0.15)',
    strokeColor: '#10b981',
    aeo: 78,
    geo: 65,
    aio: 71,
    avgScore: 71,
    citations: 1204,
    momTrend: 3.1,
    description: 'OpenAI GPT-4o conversational engine and search citations.',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    shortName: 'Gemini',
    color: '#3b82f6',
    dotBg: 'bg-[#3b82f6]',
    fillColor: 'rgba(59, 130, 246, 0.18)',
    strokeColor: '#3b82f6',
    aeo: 69,
    geo: 70,
    aio: 64,
    avgScore: 68,
    citations: 876,
    momTrend: 7.2,
    description: 'Google Gemini 1.5 Pro & Search AI Overviews integration.',
  },
  {
    id: 'claude',
    name: 'Claude',
    shortName: 'Claude',
    color: '#f97316',
    dotBg: 'bg-[#f97316]',
    fillColor: 'rgba(249, 115, 22, 0.15)',
    strokeColor: '#f97316',
    aeo: 72,
    geo: 68,
    aio: 64,
    avgScore: 68,
    citations: 652,
    momTrend: 5.4,
    description: 'Anthropic Claude 3.5 Sonnet generative reasoning synthesis.',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    shortName: 'Perplex',
    color: '#8b5cf6',
    dotBg: 'bg-[#8b5cf6]',
    fillColor: 'rgba(139, 92, 246, 0.18)',
    strokeColor: '#8b5cf6',
    aeo: 70,
    geo: 62,
    aio: 66,
    avgScore: 66,
    citations: 940,
    momTrend: 12.8,
    description: 'Perplexity Pro Sonar online citation indexing and grounding.',
  },
  {
    id: 'grok',
    name: 'Grok',
    shortName: 'Grok',
    color: '#06b6d4',
    dotBg: 'bg-[#06b6d4]',
    fillColor: 'rgba(6, 182, 212, 0.15)',
    strokeColor: '#06b6d4',
    aeo: 61,
    geo: 58,
    aio: 58,
    avgScore: 59,
    citations: 324,
    momTrend: 1.8,
    description: 'xAI Grok 2 live social and real-time knowledge discovery.',
  },
  {
    id: 'meta',
    name: 'Meta AI',
    shortName: 'Meta AI',
    color: '#2563eb',
    dotBg: 'bg-[#2563eb]',
    fillColor: 'rgba(37, 99, 235, 0.15)',
    strokeColor: '#2563eb',
    aeo: 58,
    geo: 54,
    aio: 56,
    avgScore: 56,
    citations: 418,
    momTrend: 0.5,
    description: 'Meta Llama 3 assistant answers and web search synthesis.',
  },
];

export function ModelComparisonDashboard() {
  const { activeTenant, triggerTracking, isTracking } = useDashboard();
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [hoveredModelId, setHoveredModelId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof ModelMetricData>('avgScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const models = [...DEFAULT_MODELS].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortDirection === 'desc' ? valB - valA : valA - valB;
    }
    return 0;
  });

  const handleSort = (field: keyof ModelMetricData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Model', 'AEO Score', 'GEO Score', 'AIO Score', 'Avg Score', 'Citations', 'MoM Trend (%)'];
    const rows = DEFAULT_MODELS.map((m) => [
      m.name,
      m.aeo,
      m.geo,
      m.aio,
      m.avgScore,
      m.citations,
      `+${m.momTrend}%`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `model_comparison_${activeTenant?.slug || 'acme'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Radar geometry calculations (Equilateral triangle)
  const radarCx = 160;
  const radarCy = 145;
  const radarR = 90;

  // Vertex angles:
  // Top (AEO): -90 deg (-pi/2)
  // Bottom-Right (GEO): 30 deg (pi/6)
  // Bottom-Left (AIO): 150 deg (5pi/6)
  const getRadarPoint = (score: number, angleRad: number) => {
    const factor = Math.max(0, Math.min(100, score)) / 100;
    const r = radarR * factor;
    const x = radarCx + r * Math.cos(angleRad);
    const y = radarCy + r * Math.sin(angleRad);
    return { x, y };
  };

  const aeoAngle = -Math.PI / 2;
  const geoAngle = Math.PI / 6;
  const aioAngle = (5 * Math.PI) / 6;

  // Grid level polygons
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="space-y-6 pb-8 select-none font-sans text-slate-900">
      {/* 1. Top Row: 6 Model Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {DEFAULT_MODELS.map((model) => {
          const isHighlighted = hoveredModelId === model.id || selectedModelId === model.id;
          return (
            <div
              key={model.id}
              onClick={() => setSelectedModelId(selectedModelId === model.id ? null : model.id)}
              onMouseEnter={() => setHoveredModelId(model.id)}
              onMouseLeave={() => setHoveredModelId(null)}
              className={`bg-white rounded-2xl p-4 border transition-all duration-150 cursor-pointer shadow-2xs ${
                isHighlighted
                  ? 'border-indigo-400 ring-2 ring-indigo-50 shadow-xs'
                  : 'border-slate-100/90 hover:border-slate-200 hover:shadow-2xs'
              }`}
            >
              {/* Header: Dot + Model Name */}
              <div className="flex items-center space-x-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${model.dotBg} shrink-0`} />
                <span className="text-xs font-semibold text-slate-800 tracking-tight truncate">
                  {model.name}
                </span>
              </div>

              {/* Large Score Number */}
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {model.avgScore}
              </div>

              {/* Label */}
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                Avg score
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Middle Row: Score Radar & Side-by-Side Scores Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Card: Score Radar (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Score Radar
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-metric shape comparison
            </p>
          </div>

          {/* SVG Radar Chart */}
          <div className="relative flex items-center justify-center my-auto py-2">
            <svg
              viewBox="0 0 320 280"
              className="w-full max-w-[300px] h-[250px] overflow-visible"
            >
              {/* Triangular Grid Lines */}
              {gridLevels.map((lvl, idx) => {
                const ptA = getRadarPoint(100 * lvl, aeoAngle);
                const ptG = getRadarPoint(100 * lvl, geoAngle);
                const ptAi = getRadarPoint(100 * lvl, aioAngle);
                const pointsStr = `${ptA.x},${ptA.y} ${ptG.x},${ptG.y} ${ptAi.x},${ptAi.y}`;
                return (
                  <polygon
                    key={idx}
                    points={pointsStr}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth={idx === gridLevels.length - 1 ? '1.2' : '0.8'}
                    strokeDasharray={idx === gridLevels.length - 1 ? 'none' : '3,3'}
                  />
                );
              })}

              {/* Radial Axis Lines from Center to Vertices */}
              {(() => {
                const ptA = getRadarPoint(100, aeoAngle);
                const ptG = getRadarPoint(100, geoAngle);
                const ptAi = getRadarPoint(100, aioAngle);
                return (
                  <>
                    <line
                      x1={radarCx}
                      y1={radarCy}
                      x2={ptA.x}
                      y2={ptA.y}
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                    <line
                      x1={radarCx}
                      y1={radarCy}
                      x2={ptG.x}
                      y2={ptG.y}
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                    <line
                      x1={radarCx}
                      y1={radarCy}
                      x2={ptAi.x}
                      y2={ptAi.y}
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                  </>
                );
              })()}

              {/* Model Shape Polygons */}
              {DEFAULT_MODELS.map((model) => {
                const ptA = getRadarPoint(model.aeo, aeoAngle);
                const ptG = getRadarPoint(model.geo, geoAngle);
                const ptAi = getRadarPoint(model.aio, aioAngle);
                const pointsStr = `${ptA.x},${ptA.y} ${ptG.x},${ptG.y} ${ptAi.x},${ptAi.y}`;

                const isSelected = selectedModelId === model.id;
                const isHovered = hoveredModelId === model.id;
                const hasFocus = isSelected || isHovered;
                const isDimmed =
                  (selectedModelId && !isSelected) || (hoveredModelId && !isHovered);

                return (
                  <g
                    key={model.id}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredModelId(model.id)}
                    onMouseLeave={() => setHoveredModelId(null)}
                    onClick={() =>
                      setSelectedModelId(selectedModelId === model.id ? null : model.id)
                    }
                  >
                    <polygon
                      points={pointsStr}
                      fill={model.fillColor}
                      stroke={model.strokeColor}
                      strokeWidth={hasFocus ? '2.5' : '1.4'}
                      opacity={isDimmed ? 0.2 : hasFocus ? 1 : 0.75}
                    />
                    {/* Vertex Dots */}
                    <circle
                      cx={ptA.x}
                      cy={ptA.y}
                      r={hasFocus ? 3.5 : 2}
                      fill={model.strokeColor}
                      opacity={isDimmed ? 0.2 : 0.9}
                    />
                    <circle
                      cx={ptG.x}
                      cy={ptG.y}
                      r={hasFocus ? 3.5 : 2}
                      fill={model.strokeColor}
                      opacity={isDimmed ? 0.2 : 0.9}
                    />
                    <circle
                      cx={ptAi.x}
                      cy={ptAi.y}
                      r={hasFocus ? 3.5 : 2}
                      fill={model.strokeColor}
                      opacity={isDimmed ? 0.2 : 0.9}
                    />
                  </g>
                );
              })}

              {/* Axis Vertex Labels */}
              <text
                x={radarCx}
                y={radarCy - radarR - 12}
                textAnchor="middle"
                className="text-[11px] font-bold fill-slate-500 font-mono tracking-wider"
              >
                AEO
              </text>
              <text
                x={radarCx + radarR * Math.cos(geoAngle) + 14}
                y={radarCy + radarR * Math.sin(geoAngle) + 4}
                textAnchor="start"
                className="text-[11px] font-bold fill-slate-500 font-mono tracking-wider"
              >
                GEO
              </text>
              <text
                x={radarCx - radarR * Math.cos(geoAngle) - 14}
                y={radarCy + radarR * Math.sin(geoAngle) + 4}
                textAnchor="end"
                className="text-[11px] font-bold fill-slate-500 font-mono tracking-wider"
              >
                AIO
              </text>
            </svg>
          </div>

          {/* Bottom helper tip */}
          <div className="text-center text-[10px] text-slate-400 mt-1">
            {hoveredModelId
              ? `${DEFAULT_MODELS.find((m) => m.id === hoveredModelId)?.name}: AEO ${
                  DEFAULT_MODELS.find((m) => m.id === hoveredModelId)?.aeo
                } · GEO ${
                  DEFAULT_MODELS.find((m) => m.id === hoveredModelId)?.geo
                } · AIO ${
                  DEFAULT_MODELS.find((m) => m.id === hoveredModelId)?.aio
                }`
              : 'Hover or click models to inspect polygon metric distribution'}
          </div>
        </div>

        {/* Right Card: Side-by-Side Scores (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Side-by-Side Scores
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              AEO, GEO &amp; AIO per selected model
            </p>
          </div>

          {/* Bar Chart Visualization */}
          <div className="relative pt-6 pb-2 px-2">
            {/* Chart Area */}
            <div className="relative h-[200px] w-full flex items-end">
              {/* Y-Axis Grid Lines and Labels */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[100, 75, 50, 25, 0].map((val) => (
                  <div key={val} className="flex items-center w-full">
                    <span className="text-[10px] font-medium text-slate-400 w-7 text-right pr-2 shrink-0 font-mono">
                      {val}
                    </span>
                    <div className="w-full border-b border-slate-100 border-dashed" />
                  </div>
                ))}
              </div>

              {/* Bars Container */}
              <div className="relative w-full h-full pl-8 pr-2 flex items-end justify-between">
                {DEFAULT_MODELS.map((model) => {
                  const isHovered = hoveredModelId === model.id;
                  const isSelected = selectedModelId === model.id;
                  const isDimmed =
                    (selectedModelId && !isSelected) || (hoveredModelId && !isHovered);

                  // Normalized height based on score (e.g. 78% of 100%)
                  const barHeightPct = Math.max(10, model.aeo);

                  return (
                    <div
                      key={model.id}
                      onMouseEnter={() => setHoveredModelId(model.id)}
                      onMouseLeave={() => setHoveredModelId(null)}
                      onClick={() =>
                        setSelectedModelId(selectedModelId === model.id ? null : model.id)
                      }
                      className="group relative flex-1 flex flex-col items-center justify-end h-full cursor-pointer px-2"
                    >
                      {/* Hover Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-medium py-1 px-2 rounded-md shadow-md z-30 pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95">
                          {model.name}: AEO {model.aeo} | GEO {model.geo} | AIO {model.aio}
                        </div>
                      )}

                      {/* Single / Clustered Orange Bar matching screenshot */}
                      <div
                        className={`w-3.5 sm:w-4 rounded-t-sm transition-all duration-200 ${
                          isDimmed ? 'opacity-30' : 'opacity-100'
                        } ${
                          isHovered || isSelected
                            ? 'bg-[#ea580c] shadow-xs'
                            : 'bg-[#ea580c]/90 hover:bg-[#ea580c]'
                        }`}
                        style={{
                          height: `${(model.aeo / 100) * 100}%`,
                          backgroundColor: '#f97316',
                        }}
                      />

                      {/* Model Label below bar */}
                      <span
                        className={`text-[11px] mt-3 font-medium truncate transition-colors text-center ${
                          isHovered || isSelected
                            ? 'text-slate-900 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        {model.shortName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="flex items-center space-x-5 pt-3 pl-8 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
              <span className="text-[11px] font-medium text-slate-500">AEO</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
              <span className="text-[11px] font-medium text-slate-500">GEO</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f97316]" />
              <span className="text-[11px] font-medium text-slate-500">AIO</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Full Comparison Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100/90 shadow-2xs overflow-hidden">
        {/* Table Header Section */}
        <div className="p-6 border-b border-slate-100/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Full Comparison Table
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              All metrics for selected models
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            title="Export model comparison data as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100/90 bg-slate-50/40">
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>MODEL</span>
                    {sortField === 'name' && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortDirection === 'asc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('aeo')}
                  className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>AEO</span>
                    {sortField === 'aeo' && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortDirection === 'asc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('geo')}
                  className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>GEO</span>
                    {sortField === 'geo' && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortDirection === 'asc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('aio')}
                  className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>AIO</span>
                    {sortField === 'aio' && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortDirection === 'asc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avgScore')}
                  className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>AVG</span>
                    {sortField === 'avgScore' && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortDirection === 'asc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('citations')}
                  className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>CITATIONS</span>
                    {sortField === 'citations' && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortDirection === 'asc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('momTrend')}
                  className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>MOM TREND</span>
                    {sortField === 'momTrend' && (
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${
                          sortDirection === 'asc' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {models.map((model) => {
                const isSelected = selectedModelId === model.id;
                const isHovered = hoveredModelId === model.id;

                return (
                  <tr
                    key={model.id}
                    onMouseEnter={() => setHoveredModelId(model.id)}
                    onMouseLeave={() => setHoveredModelId(null)}
                    onClick={() =>
                      setSelectedModelId(selectedModelId === model.id ? null : model.id)
                    }
                    className={`transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/40'
                        : isHovered
                        ? 'bg-slate-50/70'
                        : 'hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Model Name with Dot */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-2 h-2 rounded-full ${model.dotBg} shrink-0`} />
                        <span className="text-xs font-bold text-slate-900 tracking-tight">
                          {model.name}
                        </span>
                      </div>
                    </td>

                    {/* AEO Score + Teal Mini Bar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xs font-semibold text-[#06b6d4] font-mono w-5">
                          {model.aeo}
                        </span>
                        <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#06b6d4]"
                            style={{ width: `${model.aeo}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* GEO Score + Purple Mini Bar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xs font-semibold text-[#8b5cf6] font-mono w-5">
                          {model.geo}
                        </span>
                        <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#8b5cf6]"
                            style={{ width: `${model.geo}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* AIO Score + Orange Mini Bar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-xs font-semibold text-[#f97316] font-mono w-5">
                          {model.aio}
                        </span>
                        <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#f97316]"
                            style={{ width: `${model.aio}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* AVG Score */}
                    <td className="py-4 px-6">
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        {model.avgScore}
                      </span>
                    </td>

                    {/* Citations Count */}
                    <td className="py-4 px-6">
                      <span className="text-xs font-medium text-slate-600 font-mono">
                        {model.citations.toLocaleString()}
                      </span>
                    </td>

                    {/* MoM Trend Badge */}
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        +{model.momTrend}%
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
