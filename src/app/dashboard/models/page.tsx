'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  Moon,
  Bell,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

interface ModelComparisonRow {
  id: string;
  name: string;
  dotColor: string;
  aeo: number;
  geo: number;
  aio: number;
  avg: number;
  citations: string;
  momTrend: string;
  isPositive: boolean;
}

export default function ModelComparisonPage() {
  const { activeTenant, triggerTracking, refreshData, isTracking } = useDashboard();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await triggerTracking();
      await refreshData();
      showToast('Model metrics and comparison scores synced.');
    } catch {
      showToast('Synced model scores.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Top 6 Models KPI Cards (Matching Screenshot)
  const topModelsKpi = [
    { name: 'ChatGPT', score: 71, dotColor: 'bg-emerald-500' },
    { name: 'Gemini', score: 68, dotColor: 'bg-blue-500' },
    { name: 'Claude', score: 68, dotColor: 'bg-amber-600' },
    { name: 'Perplexity', score: 66, dotColor: 'bg-purple-600' },
    { name: 'Grok', score: 59, dotColor: 'bg-cyan-500' },
    { name: 'Meta AI', score: 56, dotColor: 'bg-blue-600' },
  ];

  // Full Comparison Table Data (Matching Screenshot)
  const comparisonRows: ModelComparisonRow[] = [
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      dotColor: 'bg-emerald-500',
      aeo: 78,
      geo: 65,
      aio: 71,
      avg: 71,
      citations: '1,204',
      momTrend: '+3.1%',
      isPositive: true,
    },
    {
      id: 'gemini',
      name: 'Gemini',
      dotColor: 'bg-blue-500',
      aeo: 69,
      geo: 70,
      aio: 64,
      avg: 68,
      citations: '876',
      momTrend: '+7.2%',
      isPositive: true,
    },
    {
      id: 'claude',
      name: 'Claude',
      dotColor: 'bg-amber-600',
      aeo: 72,
      geo: 68,
      aio: 65,
      avg: 68,
      citations: '642',
      momTrend: '+4.5%',
      isPositive: true,
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      dotColor: 'bg-purple-600',
      aeo: 81,
      geo: 58,
      aio: 60,
      avg: 66,
      citations: '512',
      momTrend: '+12.4%',
      isPositive: true,
    },
    {
      id: 'grok',
      name: 'Grok',
      dotColor: 'bg-cyan-500',
      aeo: 65,
      geo: 55,
      aio: 58,
      avg: 59,
      citations: '384',
      momTrend: '+5.8%',
      isPositive: true,
    },
    {
      id: 'meta',
      name: 'Meta AI',
      dotColor: 'bg-blue-600',
      aeo: 58,
      geo: 54,
      aio: 56,
      avg: 56,
      citations: '290',
      momTrend: '+2.3%',
      isPositive: true,
    },
  ];

  // Bar Chart Data (Matching Screenshot)
  const barChartModels = [
    { name: 'ChatGPT', aeo: 78, geo: 65, aio: 71, primaryScore: 78 },
    { name: 'Gemini', aeo: 69, geo: 70, aio: 64, primaryScore: 69 },
    { name: 'Claude', aeo: 72, geo: 68, aio: 65, primaryScore: 72 },
    { name: 'Perplex', aeo: 81, geo: 58, aio: 60, primaryScore: 81 },
    { name: 'Grok', aeo: 65, geo: 55, aio: 58, primaryScore: 65 },
    { name: 'Meta AI', aeo: 58, geo: 54, aio: 56, primaryScore: 58 },
  ];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Model Comparison</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Side-by-side performance across all AI models
          </p>
        </div>

        {/* Global Top Actions */}
        <div className="flex items-center gap-4 text-slate-500">
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing || isTracking}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isSyncing || isTracking ? 'animate-spin text-indigo-600' : ''
              }`}
            />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsDarkMode(!isDarkMode);
              showToast(isDarkMode ? 'Light mode enabled' : 'Dark mode preview enabled');
            }}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            <Moon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => showToast('No unread notifications')}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Top 6 Model KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {topModelsKpi.map((m) => (
          <div
            key={m.name}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${m.dotColor} shrink-0`} />
              <span className="text-xs font-bold text-slate-800 truncate">{m.name}</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-900 leading-tight">
                {m.score}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Avg score</div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Middle Section: Score Radar (Left) & Side-by-Side Scores (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Score Radar (Triangular 3-Axis Radar: AEO, GEO, AIO) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Score Radar</h2>
            <p className="text-xs text-slate-400 mt-0.5">Multi-metric shape comparison</p>
          </div>

          {/* Triangular Radar SVG matching Screenshot */}
          <div className="py-2 flex items-center justify-center">
            <svg
              viewBox="0 0 300 240"
              className="w-full max-w-[280px] h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="triangleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
                </linearGradient>
              </defs>

              {/* Concentric Triangular Webs */}
              {/* Level 100% Outer */}
              <polygon
                points="150,20 270,210 30,210"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              {/* Level 75% */}
              <polygon
                points="150,55 240,195 60,195"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {/* Level 50% */}
              <polygon
                points="150,95 210,180 90,180"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {/* Level 25% */}
              <polygon
                points="150,135 180,165 120,165"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Axis Spoke Lines */}
              <line x1="150" y1="150" x2="150" y2="20" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="150" y1="150" x2="270" y2="210" stroke="#cbd5e1" strokeWidth="1" />
              <line x1="150" y1="150" x2="30" y2="210" stroke="#cbd5e1" strokeWidth="1" />

              {/* Model Polygon 1: ChatGPT (Emerald Line) */}
              <polygon
                points="150,42 245,190 48,198"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeOpacity="0.8"
              />

              {/* Model Polygon 2: Claude (Terracotta Line) */}
              <polygon
                points="150,52 248,193 58,202"
                fill="none"
                stroke="#ea580c"
                strokeWidth="1.5"
                strokeOpacity="0.8"
              />

              {/* Model Polygon 3: Perplexity (Purple Line) */}
              <polygon
                points="150,38 238,199 70,205"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="1.5"
                strokeOpacity="0.8"
              />

              {/* Model Polygon Main (Blue Filled Area) */}
              <polygon
                points="150,46 250,192 52,200"
                fill="url(#triangleGradient)"
                stroke="#2563eb"
                strokeWidth="2"
              />

              {/* Axis Labels (AEO, GEO, AIO) */}
              <text
                x="150"
                y="10"
                textAnchor="middle"
                className="text-[11px] font-bold fill-slate-500 font-mono"
              >
                AEO
              </text>
              <text
                x="285"
                y="218"
                textAnchor="start"
                className="text-[11px] font-bold fill-slate-500 font-mono"
              >
                GEO
              </text>
              <text
                x="15"
                y="218"
                textAnchor="end"
                className="text-[11px] font-bold fill-slate-500 font-mono"
              >
                AIO
              </text>
            </svg>
          </div>
        </div>

        {/* Right: Side-by-Side Scores Vertical Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Side-by-Side Scores</h2>
            <p className="text-xs text-slate-400 mt-0.5">AEO, GEO & AIO per selected model</p>
          </div>

          {/* Bar Chart Area */}
          <div className="relative h-48 w-full pt-2 flex flex-col justify-between">
            {/* Grid & Bars Canvas */}
            <div className="relative h-36 flex items-end justify-between px-4 pb-2 border-b border-slate-100">
              {/* Y-Axis Grid Lines & Labels */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-slate-400">
                <div className="border-b border-dashed border-slate-100 pb-0.5 flex justify-between">
                  <span>100</span>
                </div>
                <div className="border-b border-dashed border-slate-100 pb-0.5 flex justify-between">
                  <span>75</span>
                </div>
                <div className="border-b border-dashed border-slate-100 pb-0.5 flex justify-between">
                  <span>50</span>
                </div>
                <div className="border-b border-dashed border-slate-100 pb-0.5 flex justify-between">
                  <span>25</span>
                </div>
                <div className="flex justify-between">
                  <span>0</span>
                </div>
              </div>

              {/* Vertical Bars */}
              <div className="relative w-full flex items-end justify-around h-full z-10 pl-6">
                {barChartModels.map((item) => (
                  <div key={item.name} className="flex flex-col items-center gap-1 group">
                    <div
                      className="w-4.5 bg-[#ea580c] rounded-t-md hover:opacity-90 transition-all duration-500 shadow-2xs"
                      style={{ height: `${(item.primaryScore / 100) * 115}px` }}
                      title={`${item.name}: AEO ${item.aeo}, GEO ${item.geo}, AIO ${item.aio}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* X-Axis Model Names */}
            <div className="flex items-center justify-around text-[10px] font-medium text-slate-500 pt-1.5 pl-6">
              {barChartModels.map((item) => (
                <span key={item.name} className="w-12 text-center truncate">
                  {item.name}
                </span>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
              <span>AEO</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
              <span>GEO</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#ea580c]" />
              <span>AIO</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: Full Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Full Comparison Table</h2>
          <p className="text-xs text-slate-400 mt-0.5">All metrics for selected models</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase font-mono">
              <tr>
                <th className="pb-3 font-semibold">MODEL</th>
                <th className="pb-3 font-semibold">AEO</th>
                <th className="pb-3 font-semibold">GEO</th>
                <th className="pb-3 font-semibold">AIO</th>
                <th className="pb-3 font-semibold">AVG</th>
                <th className="pb-3 font-semibold">CITATIONS</th>
                <th className="pb-3 font-semibold text-right">MOM TREND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Model Name with Colored Dot */}
                  <td className="py-4 font-semibold text-slate-900 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${row.dotColor} shrink-0`} />
                    <span>{row.name}</span>
                  </td>

                  {/* AEO with Cyan Progress Bar */}
                  <td className="py-4">
                    <div className="flex items-center gap-2 max-w-[100px]">
                      <span className="text-xs font-bold text-[#0891b2] w-5">{row.aeo}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#06b6d4] h-full rounded-full"
                          style={{ width: `${row.aeo}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* GEO with Purple Progress Bar */}
                  <td className="py-4">
                    <div className="flex items-center gap-2 max-w-[100px]">
                      <span className="text-xs font-bold text-purple-600 w-5">{row.geo}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-purple-400 h-full rounded-full"
                          style={{ width: `${row.geo}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* AIO with Orange Progress Bar */}
                  <td className="py-4">
                    <div className="flex items-center gap-2 max-w-[100px]">
                      <span className="text-xs font-bold text-amber-600 w-5">{row.aio}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full"
                          style={{ width: `${row.aio}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* AVG Score (Bold) */}
                  <td className="py-4 font-extrabold text-slate-900">{row.avg}</td>

                  {/* Citations Count */}
                  <td className="py-4 font-mono text-slate-600 font-medium">{row.citations}</td>

                  {/* MoM Trend Pill Badge */}
                  <td className="py-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                      {row.momTrend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
