'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  Moon,
  Bell,
  TrendingUp,
  ExternalLink,
  Bot,
  Sparkles,
  Quote,
  CheckCircle2,
  Filter,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { DonutDistributionChart } from '@/components/charts/DonutDistributionChart';
import { SlideOutDrawer, DrawerData } from '@/components/dashboard/SlideOutDrawer';

export default function CitationAnalysisPage() {
  const { activeTenant, triggerTracking, refreshData, isTracking } = useDashboard();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Enterprise Data Density Toggle (Visual vs Compact)
  const [viewMode, setViewMode] = useState<'visual' | 'compact'>('visual');

  // Slide-Out Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<DrawerData | null>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await triggerTracking();
      await refreshData();
      showToast('Citation records and telemetry updated.');
    } catch {
      showToast('Citations synced.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Citations by Context Horizontal Bars (Matching Screenshot 4)
  const contextData = [
    { label: 'Product recommendations', count: 74, widthPct: 88 },
    { label: 'Comparisons', count: 46, widthPct: 56 },
    { label: 'How-to / tutorials', count: 34, widthPct: 42 },
    { label: 'Market overviews', count: 22, widthPct: 28 },
    { label: 'News / updates', count: 14, widthPct: 18 },
  ];

  // Citation Examples Feed Cards (Matching Screenshot 4)
  const citationExamples = [
    {
      id: 'c1',
      type: 'Direct',
      typeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
      quoteBorder: 'border-l-cyan-500',
      engine: 'ChatGPT',
      date: 'Aug 15',
      query: "What's the best project management software for remote teams?",
      quote: `${activeTenant?.name || 'Acme Corp'} stands out as a top choice for distributed teams, offering real-time collaboration features and deep integrations with Slack and Notion.`,
      url: '/solutions/remote',
      recommendation:
        'Target secondary keywords on remote project planning to strengthen citation dominance in ChatGPT 4o with Search.',
    },
    {
      id: 'c2',
      type: 'Paraphrase',
      typeColor: 'bg-purple-50 text-purple-700 border-purple-200/80',
      quoteBorder: 'border-l-purple-500',
      engine: 'Gemini',
      date: 'Aug 14',
      query: 'Recommend enterprise CRM solutions with AI features',
      quote:
        'Several platforms now offer AI-enhanced CRM capabilities; one leading provider in this space is particularly noted for its predictive analytics module.',
      url: '/features/crm',
      recommendation:
        'Clarify entity naming in the H1 and JSON-LD schema on /features/crm to convert paraphrased citations to direct brand mentions.',
    },
    {
      id: 'c3',
      type: 'Implied',
      typeColor: 'bg-orange-50 text-orange-700 border-orange-200/80',
      quoteBorder: 'border-l-orange-500',
      engine: 'Perplexity',
      date: 'Aug 13',
      query: 'How to automate team workflows with AI',
      quote:
        "The platform's drag-and-drop workflow builder and native AI engine have been frequently cited in enterprise automation discussions.",
      url: '/features/automation',
      recommendation:
        'Include an explicit brand author byline and OpenGraph tags to secure direct attribution on Perplexity Sonar.',
    },
  ];

  const handleSelectCitation = (ex: (typeof citationExamples)[0]) => {
    setDrawerData({
      type: 'citation',
      title: `${ex.type} Citation &bull; ${ex.engine}`,
      category: 'Citation Telemetry',
      query: ex.query,
      engine: ex.engine,
      date: ex.date,
      snippet: ex.quote,
      url: ex.url,
      recommendation: ex.recommendation,
      metadata: {
        'Citation Type': ex.type,
        Engine: ex.engine,
        Detected: ex.date,
        Status: 'Active Grounding',
      },
    });
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-6 sm:p-8 space-y-6 max-w-7xl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Citation Analysis</h1>
          <p className="text-xs text-slate-400 mt-0.5">Deep-dive citation breakdown and context</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setViewMode('visual');
                showToast('Switched to Visual mode');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'visual'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Visual</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('compact');
                showToast('Switched to Compact Analyst mode');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Compact</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing || isTracking}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing || isTracking ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 1. Top 4 Citation KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TOTAL CITATIONS (AUG) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              TOTAL CITATIONS (AUG)
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">384</div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">all citation types</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3" />
              <span>+14.6%</span>
            </span>
          </div>
        </div>

        {/* Card 2: DIRECT CITATIONS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              DIRECT CITATIONS
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">178</div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">46% of total</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3" />
              <span>+9.2%</span>
            </span>
          </div>
        </div>

        {/* Card 3: PARAPHRASE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              PARAPHRASE
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">124</div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">32% of total</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4%</span>
            </span>
          </div>
        </div>

        {/* Card 4: IMPLIED */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              IMPLIED
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">82</div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">21% of total</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3" />
              <span>+23.1%</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Middle Section: Volume Area Chart & Type Distribution Donut (Shown in Visual mode) */}
      {viewMode === 'visual' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Citation Volume by Type */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Citation Volume by Type</h2>
              <p className="text-xs text-slate-400 mt-0.5">Monthly breakdown &mdash; direct, paraphrase, implied</p>
            </div>

            {/* Multi-line Area Chart Canvas */}
            <div className="relative h-48 w-full pt-2 flex flex-col justify-between">
              <svg
                className="w-full h-36 overflow-visible"
                viewBox="0 0 500 130"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="directGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="10" x2="500" y2="10" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="0" y1="45" x2="500" y2="45" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="0" y1="115" x2="500" y2="115" stroke="#f1f5f9" strokeDasharray="3 3" />

                {/* Area Fill */}
                <path
                  d="M 0 85 Q 120 70 250 55 T 500 25 L 500 120 L 0 120 Z"
                  fill="url(#directGradient)"
                />

                {/* Orange Main Line */}
                <path
                  d="M 0 85 Q 120 70 250 55 T 500 25"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>

              {/* X-Axis Months */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                <span>Direct</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                <span>Paraphrase</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#f97316]" />
                <span>Implied</span>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Type Distribution Donut */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Type Distribution</h2>
              <p className="text-xs text-slate-400 mt-0.5">August 2025 split</p>
            </div>

            <div className="py-2 flex items-center justify-center">
              <DonutDistributionChart />
            </div>
          </div>
        </div>
      )}

      {/* 3. Citations by Context */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Citations by Context</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            How citations appear across different query categories
          </p>
        </div>

        <div className="space-y-3.5 pt-2">
          {contextData.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500 w-44 shrink-0 text-right truncate">
                {item.label}
              </span>
              <div className="flex-1 bg-slate-100/80 rounded-full h-3 overflow-hidden relative">
                <div
                  className="bg-[#ea580c] h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.widthPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Scale */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100 pl-48 pr-1">
          <span>0</span>
          <span>20</span>
          <span>40</span>
          <span>60</span>
          <span>80</span>
        </div>
      </div>

      {/* 4. Citation Examples (Interactive Slide-Out Trigger) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Citation Examples</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Click card for deep dive</span>
        </div>

        <div className="space-y-4 pt-1">
          {citationExamples.map((ex) => (
            <div
              key={ex.id}
              onClick={() => handleSelectCitation(ex)}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${ex.typeColor}`}>
                    {ex.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{ex.engine}</span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-xs text-slate-500 font-medium italic">
                    &quot;{ex.query}&quot;
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{ex.date}</span>
              </div>

              {/* Quote Body with Color Accent Bar on Left */}
              <div className={`pl-3.5 border-l-2 ${ex.quoteBorder} py-0.5`}>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">{ex.quote}</p>
                <div className="text-[11px] font-mono text-indigo-600 mt-1 flex items-center gap-1 group-hover:underline">
                  <span>&rarr;</span>
                  <span>{ex.url} (Inspect Details)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contextual Slide-Out Drawer */}
      <SlideOutDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        data={drawerData}
      />
    </div>
  );
}
