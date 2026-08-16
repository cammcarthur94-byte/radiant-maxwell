'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
  Database,
  Layers,
  FileCode,
  Share2,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

interface EntityTypeDetail {
  type: string;
  accuracy: number;
  monitoredEntities: number;
  primaryEngine: string;
  status: 'optimal' | 'good' | 'needs_work';
  description: string;
}

interface SchemaTypeRow {
  id: string;
  schemaType: string;
  coverageScore: number;
  status: 'Excellent' | 'Good' | 'Needs Review';
  pageCount: number;
  errorsCount: number;
  lastValidated: string;
}

export function AioScoreDashboard() {
  const { activeTenant, triggerTracking, isTracking } = useDashboard();

  // Active trend series toggles for legend
  const [activeSeries, setActiveSeries] = useState<{
    aio: boolean;
    entityRec: boolean;
    schemaCov: boolean;
  }>({
    aio: true,
    entityRec: true,
    schemaCov: true,
  });

  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);
  const [hoveredEntityIdx, setHoveredEntityIdx] = useState<number | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<SchemaTypeRow | null>(null);
  const [selectedEntityModal, setSelectedEntityModal] = useState<EntityTypeDetail | null>(null);

  // 6-Month Trend Data
  const trendMonths = [
    { month: 'Mar', aio: 51, entity: 60, schema: 48 },
    { month: 'Apr', aio: 55, entity: 63, schema: 52 },
    { month: 'May', aio: 59, entity: 66, schema: 56 },
    { month: 'Jun', aio: 63, entity: 69, schema: 60 },
    { month: 'Jul', aio: 66, entity: 71, schema: 62 },
    { month: 'Aug', aio: 68, entity: 72, schema: 64 },
  ];

  // Radar chart entities
  const radarEntities: EntityTypeDetail[] = [
    {
      type: 'Brand',
      accuracy: 84,
      monitoredEntities: 42,
      primaryEngine: 'Claude & GPT-4o',
      status: 'optimal',
      description: 'Brand identity, official trademarks, core offerings and headquarters.',
    },
    {
      type: 'Products',
      accuracy: 74,
      monitoredEntities: 68,
      primaryEngine: 'Google Gemini',
      status: 'good',
      description: 'Product specifications, feature tiers, SKU mapping and compatibility.',
    },
    {
      type: 'People',
      accuracy: 66,
      monitoredEntities: 24,
      primaryEngine: 'Perplexity Sonar',
      status: 'good',
      description: 'Key executives, founders, author bios and board members.',
    },
    {
      type: 'Locations',
      accuracy: 92,
      monitoredEntities: 18,
      primaryEngine: 'Google Gemini & Apple Maps',
      status: 'optimal',
      description: 'Regional offices, service areas, and geo-targeted addresses.',
    },
    {
      type: 'Events',
      accuracy: 56,
      monitoredEntities: 12,
      primaryEngine: 'Claude 3.5 Sonnet',
      status: 'needs_work',
      description: 'Webinars, annual summits, press announcements and release dates.',
    },
    {
      type: 'Concepts',
      accuracy: 70,
      monitoredEntities: 55,
      primaryEngine: 'OpenAI GPT-4o',
      status: 'good',
      description: 'Proprietary methodologies, domain definitions, and industry glossaries.',
    },
  ];

  // AIO by Model Data
  const modelBars = [
    {
      code: 'CLO',
      name: 'Claude 3.5 Sonnet',
      score: 92,
      color: '#d97757', // Coral-brown / terra-cotta
      bgClass: 'bg-[#d97757]',
      knowledgeHealth: '95% accuracy',
    },
    {
      code: 'GPT',
      name: 'OpenAI GPT-4o',
      score: 88,
      color: '#10b981', // Emerald green
      bgClass: 'bg-[#10b981]',
      knowledgeHealth: '91% accuracy',
    },
    {
      code: 'MTA',
      name: 'Meta Llama 3.3',
      score: 76,
      color: '#2563eb', // Royal Blue
      bgClass: 'bg-[#2563eb]',
      knowledgeHealth: '78% accuracy',
    },
    {
      code: 'GEM',
      name: 'Google Gemini 1.5 Pro',
      score: 82,
      color: '#60a5fa', // Light Blue
      bgClass: 'bg-[#60a5fa]',
      knowledgeHealth: '84% accuracy',
    },
    {
      code: 'PPX',
      name: 'Perplexity Sonar Pro',
      score: 79,
      color: '#7c3aed', // Indigo Purple
      bgClass: 'bg-[#7c3aed]',
      knowledgeHealth: '82% accuracy',
    },
  ];

  // Schema Coverage Table Data
  const [schemaRows] = useState<SchemaTypeRow[]>([
    {
      id: 's-org',
      schemaType: 'Organization',
      coverageScore: 100,
      status: 'Excellent',
      pageCount: 142,
      errorsCount: 0,
      lastValidated: 'Today, 09:15 AM',
    },
    {
      id: 's-prod',
      schemaType: 'Product',
      coverageScore: 74,
      status: 'Good',
      pageCount: 88,
      errorsCount: 2,
      lastValidated: 'Yesterday',
    },
    {
      id: 's-art',
      schemaType: 'Article / Blog',
      coverageScore: 91,
      status: 'Excellent',
      pageCount: 310,
      errorsCount: 0,
      lastValidated: 'Today, 08:30 AM',
    },
    {
      id: 's-loc',
      schemaType: 'LocalBusiness',
      coverageScore: 85,
      status: 'Good',
      pageCount: 18,
      errorsCount: 1,
      lastValidated: '2 days ago',
    },
    {
      id: 's-faq',
      schemaType: 'FAQPage',
      coverageScore: 96,
      status: 'Excellent',
      pageCount: 45,
      errorsCount: 0,
      lastValidated: 'Today, 11:20 AM',
    },
  ]);

  // Radar Chart Calculations
  // Center (150, 135), Radius 88
  const cx = 150;
  const cy = 135;
  const maxR = 88;
  const angleStep = (2 * Math.PI) / 6;
  const startAngle = -Math.PI / 2; // 12 o'clock

  // Calculate polygon points for radar
  const radarPolygonPoints = radarEntities
    .map((item, i) => {
      const angle = startAngle + i * angleStep;
      const r = (item.accuracy / 100) * maxR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Labels coordinates around the radar
  const labelPositions = [
    { name: 'Brand', x: 150, y: 26, anchor: 'middle' },
    { name: 'Products', x: 236, y: 88, anchor: 'start' },
    { name: 'People', x: 236, y: 184, anchor: 'start' },
    { name: 'Locations', x: 150, y: 246, anchor: 'middle' },
    { name: 'Events', x: 64, y: 184, anchor: 'end' },
    { name: 'Concepts', x: 64, y: 88, anchor: 'end' },
  ];

  return (
    <div className="space-y-5 select-none font-sans pb-10">
      {/* 1. TOP ROW: 4 KPI CARDS */}
      <section
        aria-label="AIO Overview Metrics"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Card 1: AIO SCORE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              AIO SCORE
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 flex items-baseline">
              <span>68</span>
              <span className="text-slate-400 text-sm font-normal ml-1">/100</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">vs. last month</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>+5.1%</span>
            </span>
          </div>
        </div>

        {/* Card 2: ENTITY RECOGNITION */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              ENTITY RECOGNITION
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 flex items-baseline">
              <span>72</span>
              <span className="text-slate-400 text-sm font-normal ml-1">%</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">named entity accuracy</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>+3.8%</span>
            </span>
          </div>
        </div>

        {/* Card 3: SCHEMA COVERAGE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              SCHEMA COVERAGE
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 flex items-baseline">
              <span>64</span>
              <span className="text-slate-400 text-sm font-normal ml-1">%</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">structured markup health</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>+6.2%</span>
            </span>
          </div>
        </div>

        {/* Card 4: KNOWLEDGE GRAPH */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              KNOWLEDGE GRAPH
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 flex items-baseline">
              <span>71</span>
              <span className="text-slate-400 text-sm font-normal ml-1">%</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">entity completeness</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>+4%</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. MIDDLE ROW: AIO SCORE TREND & ENTITY RECOGNITION */}
      <section
        aria-label="Score Trend and Entity Accuracy"
        className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
      >
        {/* Left Card: AIO Score Trend (60% - 65% width / col-span-7 or 8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              AIO Score Trend
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Score, entity recognition &amp; schema coverage
            </p>
          </div>

          {/* Trend Chart Area */}
          <div className="relative w-full my-4 h-56 flex flex-col justify-between">
            {/* SVG Visual Graph */}
            <div className="relative flex-1 w-full">
              {/* Y-Axis Labels */}
              <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[11px] font-mono text-slate-400 select-none w-8 text-right pr-2">
                <span>100</span>
                <span>70</span>
                <span>50</span>
                <span>30</span>
              </div>

              {/* Main SVG Area */}
              <div className="ml-9 h-full relative">
                <svg
                  className="w-full h-[calc(100%-24px)] overflow-visible"
                  viewBox="0 0 600 160"
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Emerald Green Area Gradient */}
                    <linearGradient id="aioTrendGreenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines matching 100, 70, 50, 30 */}
                  <line x1="0" y1="0" x2="600" y2="0" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="52" x2="600" y2="52" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="104" x2="600" y2="104" stroke="#f1f5f9" strokeDasharray="3 3" />
                  <line x1="0" y1="156" x2="600" y2="156" stroke="#f1f5f9" strokeDasharray="3 3" />

                  {/* Area Fill for Green Trend Line */}
                  <path
                    d="M 15 110 C 130 102, 230 88, 350 78 C 440 70, 520 65, 585 62 L 585 160 L 15 160 Z"
                    fill="url(#aioTrendGreenGrad)"
                  />

                  {/* Green Smooth Curve (Schema Coverage / AIO Health) */}
                  <path
                    d="M 15 110 C 130 102, 230 88, 350 78 C 440 70, 520 65, 585 62"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Interactive points along the curve */}
                  {[
                    { x: 15, y: 110, idx: 0 },
                    { x: 130, y: 99, idx: 1 },
                    { x: 245, y: 88, idx: 2 },
                    { x: 360, y: 78, idx: 3 },
                    { x: 475, y: 69, idx: 4 },
                    { x: 585, y: 62, idx: 5 },
                  ].map((pt) => (
                    <g key={pt.idx} className="cursor-pointer">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredMonthIdx === pt.idx ? 5.5 : 3.5}
                        fill="#ffffff"
                        stroke="#10b981"
                        strokeWidth={hoveredMonthIdx === pt.idx ? 3 : 2}
                        className="transition-all duration-150"
                        onMouseEnter={() => setHoveredMonthIdx(pt.idx)}
                        onMouseLeave={() => setHoveredMonthIdx(null)}
                      />
                    </g>
                  ))}
                </svg>

                {/* X-Axis Month Labels */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1.5 px-2 select-none">
                  {trendMonths.map((m, idx) => (
                    <button
                      key={m.month}
                      type="button"
                      onMouseEnter={() => setHoveredMonthIdx(idx)}
                      onMouseLeave={() => setHoveredMonthIdx(null)}
                      className={`hover:text-slate-900 transition-colors cursor-pointer ${
                        hoveredMonthIdx === idx ? 'text-emerald-600 font-bold' : ''
                      }`}
                    >
                      {m.month}
                    </button>
                  ))}
                </div>

                {/* Hover Tooltip Overlay */}
                {hoveredMonthIdx !== null && (
                  <div
                    className="absolute z-20 bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1 animate-in fade-in"
                    style={{
                      left: `${(hoveredMonthIdx / 5) * 85 + 5}%`,
                      top: '10px',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="font-bold text-slate-300 border-b border-slate-700 pb-1">
                      {trendMonths[hoveredMonthIdx].month} 2025
                    </div>
                    <div className="flex items-center justify-between gap-3 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        AIO Score:
                      </span>
                      <span className="font-bold text-white">
                        {trendMonths[hoveredMonthIdx].aio}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Entity Rec:
                      </span>
                      <span className="font-bold text-white">
                        {trendMonths[hoveredMonthIdx].entity}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Schema Cov:
                      </span>
                      <span className="font-bold text-white">
                        {trendMonths[hoveredMonthIdx].schema}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="flex items-center gap-5 text-xs pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveSeries((s) => ({ ...s, aio: !s.aio }))}
              className={`flex items-center gap-1.5 transition-opacity cursor-pointer ${
                activeSeries.aio ? 'text-slate-700 font-medium' : 'text-slate-300 opacity-60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#f97316]" />
              <span>AIO Score</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSeries((s) => ({ ...s, entityRec: !s.entityRec }))}
              className={`flex items-center gap-1.5 transition-opacity cursor-pointer ${
                activeSeries.entityRec
                  ? 'text-slate-700 font-medium'
                  : 'text-slate-300 opacity-60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
              <span>Entity Rec.</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSeries((s) => ({ ...s, schemaCov: !s.schemaCov }))}
              className={`flex items-center gap-1.5 transition-opacity cursor-pointer ${
                activeSeries.schemaCov
                  ? 'text-slate-700 font-medium'
                  : 'text-slate-300 opacity-60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span>Schema Cov.</span>
            </button>
          </div>
        </div>

        {/* Right Card: Entity Recognition (Radar Spider Chart) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Entity Recognition
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Accuracy by entity type</p>
          </div>

          {/* Radar Chart SVG Container */}
          <div className="relative w-full flex items-center justify-center my-2">
            <svg
              className="w-full max-w-[280px] h-[260px] overflow-visible select-none"
              viewBox="0 0 300 270"
            >
              {/* Concentric Hexagonal Grid Lines at 20%, 40%, 60%, 80%, 100% */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((step, ringIdx) => {
                const r = maxR * step;
                const ringPoints = Array.from({ length: 6 })
                  .map((_, i) => {
                    const angle = startAngle + i * angleStep;
                    const x = cx + r * Math.cos(angle);
                    const y = cy + r * Math.sin(angle);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(' ');

                return (
                  <polygon
                    key={ringIdx}
                    points={ringPoints}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="1.2"
                  />
                );
              })}

              {/* Spoke lines from center to outer vertices */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = startAngle + i * angleStep;
                const x = cx + maxR * Math.cos(angle);
                const y = cy + maxR * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1={cx}
                    y1={cy}
                    x2={x}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                );
              })}

              {/* Filled Radar Polygon (Warm Orange with Soft Fill) */}
              <polygon
                points={radarPolygonPoints}
                fill="rgba(251, 146, 60, 0.18)"
                stroke="#f97316"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />

              {/* Vertex Nodes for Interaction */}
              {radarEntities.map((item, i) => {
                const angle = startAngle + i * angleStep;
                const r = (item.accuracy / 100) * maxR;
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                const isHovered = hoveredEntityIdx === i;

                return (
                  <g
                    key={item.type}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredEntityIdx(i)}
                    onMouseLeave={() => setHoveredEntityIdx(null)}
                    onClick={() => setSelectedEntityModal(item)}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 4.5 : 2.5}
                      fill="#f97316"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all duration-150"
                    />
                  </g>
                );
              })}

              {/* Axis Label Texts */}
              {labelPositions.map((lbl, idx) => {
                const isHovered = hoveredEntityIdx === idx;
                return (
                  <text
                    key={lbl.name}
                    x={lbl.x}
                    y={lbl.y}
                    textAnchor={lbl.anchor as any}
                    className={`text-[11px] font-sans transition-all cursor-pointer select-none ${
                      isHovered ? 'fill-orange-600 font-bold' : 'fill-slate-500 font-medium'
                    }`}
                    onMouseEnter={() => setHoveredEntityIdx(idx)}
                    onMouseLeave={() => setHoveredEntityIdx(null)}
                    onClick={() => setSelectedEntityModal(radarEntities[idx])}
                  >
                    {lbl.name}
                  </text>
                );
              })}
            </svg>

            {/* Hover Tooltip for Radar */}
            {hoveredEntityIdx !== null && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 pointer-events-none animate-in fade-in">
                <span className="font-bold text-orange-300">
                  {radarEntities[hoveredEntityIdx].type}:
                </span>
                <span>{radarEntities[hoveredEntityIdx].accuracy}% Accuracy</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. BOTTOM ROW: AIO BY MODEL & SCHEMA COVERAGE BY TYPE */}
      <section
        aria-label="Model Breakdown and Schema Coverage"
        className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
      >
        {/* Left Card: AIO by Model (~45% width / col-span-5 or 6) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              AIO by Model
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              AI Optimization score per platform
            </p>
          </div>

          {/* Horizontal Bar Chart */}
          <div className="space-y-4 pt-1">
            {modelBars.map((m) => (
              <div key={m.code} className="group flex items-center gap-3.5">
                {/* 3-Letter Model Code Label */}
                <span className="text-xs font-mono font-bold text-slate-500 w-8 shrink-0">
                  {m.code}
                </span>

                {/* Progress Bar Track */}
                <div className="flex-1 bg-slate-100/90 rounded-full h-3.5 overflow-hidden relative">
                  <div
                    className="h-full rounded-r-md transition-all duration-500 group-hover:brightness-110"
                    style={{
                      width: `${m.score}%`,
                      backgroundColor: m.color,
                    }}
                    title={`${m.name}: ${m.score}/100`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Subtext info */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>High: Claude (92)</span>
            <span>Avg: 83.4 / 100</span>
          </div>
        </div>

        {/* Right Card: Schema Coverage by Type (~55% width / col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Schema Coverage by Type
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Markup health across page templates
            </p>
          </div>

          {/* Schema Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase font-mono">
                <tr>
                  <th className="pb-3 font-semibold">SCHEMA TYPE</th>
                  <th className="pb-3 font-semibold">COVERAGE</th>
                  <th className="pb-3 font-semibold text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {schemaRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedSchema(row)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Schema Type */}
                    <td className="py-3.5 font-semibold text-slate-900">
                      {row.schemaType}
                    </td>

                    {/* Coverage Mini Orange Bar + Value */}
                    <td className="py-3.5">
                      <div className="flex items-center gap-3 max-w-[160px]">
                        <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden shrink-0">
                          <div
                            className="bg-[#f97316] h-full rounded-full"
                            style={{ width: `${row.coverageScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-orange-600">
                          {row.coverageScore}
                        </span>
                      </div>
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-3.5 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.status === 'Excellent'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-sky-50 text-sky-700'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtext info */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>5 Schema Types Active</span>
            <span>Total Pages Indexed: 595</span>
          </div>
        </div>
      </section>

      {/* Floating Bottom-Right Help Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          aria-label="Help and Documentation"
          className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer"
          title="AIO Score Documentation & Knowledge Graph Guides"
          onClick={() => {
            alert(
              'AIO (AI Optimization) tracks how accurately generative AI models understand your entities, knowledge graph, and structured schema markup.'
            );
          }}
        >
          ?
        </button>
      </div>

      {/* Entity Modal Detail */}
      {selectedEntityModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-md w-full animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
                  {selectedEntityModal.type.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedEntityModal.type} Entity Health
                  </h3>
                  <p className="text-xs text-slate-400">Knowledge Graph Accuracy</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntityModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p>{selectedEntityModal.description}</p>
              <div className="bg-slate-50 p-3 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Recognition Accuracy:</span>
                  <span className="font-bold text-orange-600">
                    {selectedEntityModal.accuracy}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monitored Entities:</span>
                  <span className="font-bold text-slate-900">
                    {selectedEntityModal.monitoredEntities} nodes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Top Performing Engine:</span>
                  <span className="font-bold text-slate-900">
                    {selectedEntityModal.primaryEngine}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedEntityModal(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schema Detail Modal */}
      {selectedSchema && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-md w-full animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Schema: {selectedSchema.schemaType}
                  </h3>
                  <p className="text-xs text-slate-400">Structured Data Validation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSchema(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="bg-slate-50 p-3 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Coverage Score:</span>
                  <span className="font-bold text-orange-600">
                    {selectedSchema.coverageScore}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Indexed Pages:</span>
                  <span className="font-bold text-slate-900">
                    {selectedSchema.pageCount} templates
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Validation Errors:</span>
                  <span
                    className={`font-bold ${
                      selectedSchema.errorsCount === 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {selectedSchema.errorsCount} issues
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Audit:</span>
                  <span className="font-bold text-slate-900">
                    {selectedSchema.lastValidated}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSchema(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
