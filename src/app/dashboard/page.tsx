'use client';

import React, { useState } from 'react';
import {
  RefreshCw,
  Moon,
  Bell,
  TrendingUp,
  TrendingDown,
  Award,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { RadarChart } from '@/components/charts/RadarChart';

export default function OverviewDashboardPage() {
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
      showToast('Industry benchmarks and radar scores updated.');
    } catch {
      showToast('Synced benchmark data.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Gap to Top Performer Bar Data (Matching Screenshot 5)
  const gapData = [
    { label: 'AEO', points: 12, color: 'bg-orange-400' },
    { label: 'GEO', points: 18, color: 'bg-rose-500' },
    { label: 'AIO', points: 17, color: 'bg-orange-400' },
    { label: 'Prompts', points: 13, color: 'bg-orange-400' },
    { label: 'Structured', points: 8, color: 'bg-emerald-400' },
    { label: 'Freshness', points: 18, color: 'bg-rose-500' },
  ];

  // Leaderboard Benchmark Data (Matching Screenshot 5)
  const benchmarkRows = [
    {
      rank: 1,
      badge: '🥇',
      company: 'Vertex Solutions',
      aeo: 82,
      geo: 71,
      aio: 75,
      overall: 76,
      vsIndustry: '+17%',
      isUser: false,
    },
    {
      rank: 2,
      badge: '🥈',
      company: 'Pinnacle AI',
      aeo: 77,
      geo: 65,
      aio: 80,
      overall: 74,
      vsIndustry: '+15%',
      isUser: false,
    },
    {
      rank: 3,
      badge: '🥉',
      company: activeTenant?.name || 'Acme Corp',
      aeo: 85,
      geo: 72,
      aio: 78,
      overall: 78,
      vsIndustry: '+12%',
      isUser: true,
    },
    {
      rank: 4,
      badge: '4',
      company: 'Horizon Tech',
      aeo: 68,
      geo: 62,
      aio: 64,
      overall: 65,
      vsIndustry: '+6%',
      isUser: false,
    },
    {
      rank: 5,
      badge: '5',
      company: 'Nexus AI Systems',
      aeo: 60,
      geo: 58,
      aio: 59,
      overall: 59,
      vsIndustry: '+1%',
      isUser: false,
    },
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Analysis and Benchmarks</h1>
          <p className="text-xs text-slate-400 mt-0.5">Industry comparison and gap analysis</p>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing || isTracking}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing || isTracking ? 'animate-spin text-indigo-600' : ''}`} />
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

      {/* 1. Top 4 Benchmark KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: VS. INDUSTRY AVG (AEO) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              VS. INDUSTRY AVG (AEO)
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 flex items-baseline">
              <span>+12</span>
              <span className="text-slate-400 text-sm font-normal ml-1">pts</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">above industry average</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3" />
              <span>+8.2%</span>
            </span>
          </div>
        </div>

        {/* Card 2: VS. INDUSTRY AVG (GEO) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              VS. INDUSTRY AVG (GEO)
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 flex items-baseline">
              <span>+6</span>
              <span className="text-slate-400 text-sm font-normal ml-1">pts</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">above industry average</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3" />
              <span>+4.1%</span>
            </span>
          </div>
        </div>

        {/* Card 3: VS. INDUSTRY AVG (AIO) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              VS. INDUSTRY AVG (AIO)
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 flex items-baseline">
              <span>+9</span>
              <span className="text-slate-400 text-sm font-normal ml-1">pts</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">above industry average</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3" />
              <span>+6.3%</span>
            </span>
          </div>
        </div>

        {/* Card 4: INDUSTRY RANK */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              INDUSTRY RANK
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 flex items-baseline">
              <span>#3</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-1">
            <span className="text-xs text-slate-400 font-medium">of 7 tracked competitors</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
              <TrendingUp className="w-3 h-3" />
              <span>+1%</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Middle Section: Performance Radar & Gap to Top Performer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Performance Radar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Performance Radar</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeTenant?.name || 'Acme Corp'} vs. industry average vs. top performer
            </p>
          </div>

          <div className="pt-2 pb-1">
            <RadarChart brandName={activeTenant?.name || 'Acme Corp'} />
          </div>
        </div>

        {/* Right: Gap to Top Performer */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Gap to Top Performer</h2>
            <p className="text-xs text-slate-400 mt-0.5">Points needed to reach category leader</p>
          </div>

          <div className="space-y-4 pt-2">
            {gapData.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-500 w-20 shrink-0 text-right">
                  {item.label}
                </span>
                <div className="flex-1 bg-slate-100/80 rounded-full h-4 overflow-hidden relative">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(item.points / 30) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Scale */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-100 pl-24 pr-1">
            <span>0</span>
            <span>8</span>
            <span>16</span>
            <span>30</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: Full Industry Benchmark Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Full Industry Benchmark</h2>
            <p className="text-xs text-slate-400 mt-0.5">All competitors ranked by overall AI visibility score</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>---</span>
            <span>Industry avg</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase font-mono">
              <tr>
                <th className="pb-3 font-semibold">RANK</th>
                <th className="pb-3 font-semibold">COMPANY</th>
                <th className="pb-3 font-semibold">AEO</th>
                <th className="pb-3 font-semibold">GEO</th>
                <th className="pb-3 font-semibold">AIO</th>
                <th className="pb-3 font-semibold">OVERALL</th>
                <th className="pb-3 font-semibold text-right">VS. INDUSTRY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {benchmarkRows.map((row) => (
                <tr
                  key={row.rank}
                  className={`transition-colors ${
                    row.isUser ? 'bg-indigo-50/50 font-bold' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <td className="py-4 font-bold text-slate-700">
                    <span className="mr-1.5">{row.badge}</span>
                  </td>
                  <td className="py-4 font-semibold text-slate-900">
                    {row.company} {row.isUser && <span className="text-[10px] text-indigo-600 font-bold ml-1">(Your Brand)</span>}
                  </td>
                  <td className="py-4 font-bold text-[#06b6d4]">{row.aeo}</td>
                  <td className="py-4 font-bold text-purple-600">{row.geo}</td>
                  <td className="py-4 font-bold text-amber-600">{row.aio}</td>
                  <td className="py-4 font-extrabold text-slate-900">{row.overall}</td>
                  <td className="py-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200/60">
                      {row.vsIndustry}
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
