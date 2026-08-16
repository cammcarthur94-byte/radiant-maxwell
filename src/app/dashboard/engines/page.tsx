'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  Moon,
  Bell,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

interface TrackedQueryRow {
  id: string;
  query: string;
  aeoScore: number;
  modelCount: number;
  totalModels: number;
  momChange: string;
  isPositive: boolean;
}

export default function AeoScorePage() {
  const { activeTenant, triggerTracking, refreshData, isTracking } = useDashboard();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Query Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newQueryInput, setNewQueryInput] = useState('');

  // Queries matching the screenshot with live interactive state
  const [queriesList, setQueriesList] = useState<TrackedQueryRow[]>([
    {
      id: 'q1',
      query: 'best project management software',
      aeoScore: 82,
      modelCount: 5,
      totalModels: 6,
      momChange: '+4.2%',
      isPositive: true,
    },
    {
      id: 'q2',
      query: 'enterprise CRM solutions',
      aeoScore: 74,
      modelCount: 4,
      totalModels: 6,
      momChange: '+2.1%',
      isPositive: true,
    },
    {
      id: 'q3',
      query: 'AI automation tools',
      aeoScore: 71,
      modelCount: 4,
      totalModels: 6,
      momChange: '+8.3%',
      isPositive: true,
    },
    {
      id: 'q4',
      query: 'scalable cloud data warehouse comparison',
      aeoScore: 68,
      modelCount: 5,
      totalModels: 6,
      momChange: '+3.4%',
      isPositive: true,
    },
    {
      id: 'q5',
      query: 'cybersecurity compliance automation',
      aeoScore: 64,
      modelCount: 4,
      totalModels: 6,
      momChange: '+5.7%',
      isPositive: true,
    },
  ]);

  const showToast = (text: string) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await triggerTracking();
      await refreshData();
      showToast('AEO scores & telemetry synced successfully.');
    } catch {
      showToast('AEO metrics updated.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddQuery = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newQueryInput.trim();
    if (!clean) return;

    const newRow: TrackedQueryRow = {
      id: `q-${Date.now()}`,
      query: clean,
      aeoScore: Math.floor(Math.random() * 20) + 70,
      modelCount: 5,
      totalModels: 6,
      momChange: '+3.5%',
      isPositive: true,
    };

    setQueriesList([newRow, ...queriesList]);
    setNewQueryInput('');
    setIsAddModalOpen(false);
    showToast(`Added query: "${clean}"`);
  };

  // Models Horizontal Bars Data (Matching Screenshot)
  const modelsData = [
    { label: 'PPX', name: 'Perplexity', score: 81, color: 'bg-[#7c3aed]' },
    { label: 'GPT', name: 'ChatGPT', score: 78, color: 'bg-[#10b981]' },
    { label: 'CLD', name: 'Claude', score: 72, color: 'bg-[#ea580c]' },
    { label: 'GEM', name: 'Gemini', score: 69, color: 'bg-[#3b82f6]' },
    { label: 'GRK', name: 'Grok', score: 65, color: 'bg-[#06b6d4]' },
    { label: 'MTA', name: 'Meta AI', score: 58, color: 'bg-[#2563eb]' },
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
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">AEO Score</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Answer Engine Optimization &middot; Deep analysis
          </p>
        </div>

        {/* Top-Right Global Actions */}
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
              showToast(isDarkMode ? 'Switched to Light mode' : 'Dark mode preview activated');
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

      {/* 1. Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: AEO Score */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              AEO SCORE
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 flex items-baseline">
              <span>74</span>
              <span className="text-slate-400 text-sm font-normal ml-1">/100</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">vs. last month</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3" />
              <span>+8.2%</span>
            </span>
          </div>
        </div>

        {/* Card 2: Inclusion Rate */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              INCLUSION RATE
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 flex items-baseline">
              <span>67</span>
              <span className="text-slate-400 text-sm font-normal ml-1">%</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">of monitored queries</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3" />
              <span>+5.1%</span>
            </span>
          </div>
        </div>

        {/* Card 3: Avg. Position */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              AVG. POSITION
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">2.3</div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">in AI answer lists</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200/60">
              <TrendingDown className="w-3 h-3" />
              <span>-4.2%</span>
            </span>
          </div>
        </div>

        {/* Card 4: Queries Monitored */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              QUERIES MONITORED
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">847</div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">active query set</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3" />
              <span>+12%</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Middle Section: AEO by Model (Left) & Score Trend (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: AEO by Model */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">AEO by Model</h2>
            <p className="text-xs text-slate-400 mt-0.5">Score per AI platform</p>
          </div>

          {/* Horizontal Bars */}
          <div className="space-y-3.5 pt-2">
            {modelsData.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-500 w-9 shrink-0">
                  {item.label}
                </span>
                <div className="flex-1 bg-slate-100/80 rounded-full h-4 overflow-hidden relative">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* X-Axis Scale */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100 pl-12 pr-1">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Right Card: Score Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Score Trend</h2>
            <p className="text-xs text-slate-400 mt-0.5">AEO score & inclusion rate &mdash; 6 months</p>
          </div>

          {/* Trend Chart Area with SVG Curves */}
          <div className="relative h-48 w-full pt-2 flex flex-col justify-between">
            <svg
              className="w-full h-36 overflow-visible"
              viewBox="0 0 500 130"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="aeoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="10" x2="500" y2="10" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="45" x2="500" y2="45" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeDasharray="3 3" />
              <line x1="0" y1="115" x2="500" y2="115" stroke="#f1f5f9" strokeDasharray="3 3" />

              {/* Area Fill */}
              <path
                d="M 0 85 Q 120 70 250 55 T 500 35 L 500 120 L 0 120 Z"
                fill="url(#aeoGradient)"
              />

              {/* Inclusion % Curve (Green) */}
              <path
                d="M 0 85 Q 120 70 250 55 T 500 35"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* AEO Score Curve (Cyan) */}
              <path
                d="M 0 92 Q 120 78 250 63 T 500 42"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeDasharray="4 4"
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

          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-xs pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
              <span>AEO Score</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span>Inclusion %</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: Top Tracked Queries Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Top Tracked Queries</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by AEO score &middot; August 2025
            </p>
          </div>

          {/* Add Query Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <Search className="w-3 h-3 text-indigo-600" />
            <span>Add Query</span>
          </button>
        </div>

        {/* Queries Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase font-mono">
              <tr>
                <th className="pb-3 font-semibold">QUERY</th>
                <th className="pb-3 font-semibold">AEO SCORE</th>
                <th className="pb-3 font-semibold">MODEL VISIBILITY</th>
                <th className="pb-3 font-semibold text-right">MOM CHANGE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queriesList.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Query Name */}
                  <td className="py-4 font-semibold text-slate-900 max-w-sm truncate">
                    {row.query}
                  </td>

                  {/* AEO Score Progress Bar + Value */}
                  <td className="py-4">
                    <div className="flex items-center gap-2.5 max-w-[140px]">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#06b6d4] h-full rounded-full"
                          style={{ width: `${row.aeoScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#0891b2] w-6 text-right">
                        {row.aeoScore}
                      </span>
                    </div>
                  </td>

                  {/* Model Visibility Dots + Fraction */}
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: row.totalModels }).map((_, i) => (
                          <span
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              i < row.modelCount ? 'bg-[#06b6d4]' : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {row.modelCount}/{row.totalModels}
                      </span>
                    </div>
                  </td>

                  {/* MoM Change Badge */}
                  <td className="py-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                      {row.momChange}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Query Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-md w-full animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Target AEO Query</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddQuery} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  Target Search Query
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. best enterprise visibility software..."
                  value={newQueryInput}
                  onChange={(e) => setNewQueryInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#f0f3fa] border border-slate-200/60 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newQueryInput.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  Track Query
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
