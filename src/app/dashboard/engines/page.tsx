'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import {
  Cpu,
  Play,
  Sparkles,
  TrendingUp,
  Award,
  Link2,
  HeartHandshake,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function EnginesPage() {
  const {
    activeTenant,
    totalCitationsCount,
    hasData,
    triggerTracking,
    isTracking,
    isLoading,
  } = useDashboard();

  const [activeAuditingEngine, setActiveAuditingEngine] = useState<string | null>(null);

  const engines = [
    {
      id: 'gemini',
      name: 'Google Gemini & AIO',
      model: 'gemini-3.7-flash (Live Search Grounding)',
      visibilityPct: hasData ? 92.5 : 0.0,
      avgRank: hasData ? '#1.2' : '-',
      citationsCount: hasData ? totalCitationsCount : 0,
      sentiment: hasData ? '98% Positive' : 'Pending Scan',
      color: 'from-purple-500 to-indigo-600',
      badgeBg: hasData ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200',
      iconEmoji: '🟣',
      status: hasData ? 'Live Connected' : 'Ready to Audit',
    },
    {
      id: 'chatgpt',
      name: 'OpenAI ChatGPT Search',
      model: 'GPT-4o Search & Canvas',
      visibilityPct: 0.0,
      avgRank: '-',
      citationsCount: 0,
      sentiment: 'Pending Scan',
      color: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-slate-100 text-slate-600 border-slate-200',
      iconEmoji: '🟢',
      status: 'Standby Matrix',
    },
    {
      id: 'perplexity',
      name: 'Perplexity Pro & Sonar',
      model: 'Sonar Online Multi-Domain',
      visibilityPct: 0.0,
      avgRank: '-',
      citationsCount: 0,
      sentiment: 'Pending Scan',
      color: 'from-blue-500 to-cyan-600',
      badgeBg: 'bg-slate-100 text-slate-600 border-slate-200',
      iconEmoji: '🔵',
      status: 'Standby Matrix',
    },
    {
      id: 'copilot',
      name: 'Microsoft Copilot',
      model: 'Bing Grounded Index',
      visibilityPct: 0.0,
      avgRank: '-',
      citationsCount: 0,
      sentiment: 'Pending Scan',
      color: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-slate-100 text-slate-600 border-slate-200',
      iconEmoji: '🔷',
      status: 'Standby Matrix',
    },
  ];

  const handleRunEngineAudit = async (engineId: string) => {
    setActiveAuditingEngine(engineId);
    await triggerTracking(engineId);
    setActiveAuditingEngine(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                AI Engines Matrix
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-model visibility performance comparison across Google Gemini, ChatGPT, Perplexity, and Copilot for {activeTenant.name}.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => triggerTracking()}
          disabled={isTracking}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isTracking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isTracking ? 'Auditing Matrix...' : 'Audit All Engines'}</span>
        </button>
      </div>

      {/* Engine Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {engines.map((eng) => {
          const isAuditing = activeAuditingEngine === eng.id;

          return (
            <div
              key={eng.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{eng.iconEmoji}</span>
                    <div>
                      <h2 className="text-base font-bold text-slate-900">{eng.name}</h2>
                      <span className="text-[11px] text-slate-400 font-mono">{eng.model}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${eng.badgeBg}`}>
                    {eng.status}
                  </span>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Visibility</div>
                    <div className="text-lg font-extrabold text-slate-900 mt-0.5">{eng.visibilityPct}%</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Rank</div>
                    <div className="text-lg font-extrabold text-indigo-600 mt-0.5">{eng.avgRank}</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Citations</div>
                    <div className="text-lg font-extrabold text-slate-900 mt-0.5">{eng.citationsCount}</div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Sentiment</div>
                    <div className="text-lg font-extrabold text-emerald-600 mt-0.5">{eng.sentiment}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Search Share of Voice</span>
                    <span className="text-indigo-600 font-bold">{eng.visibilityPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${eng.color}`}
                      style={{ width: `${eng.visibilityPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Continuous daily tracking active</span>
                <button
                  onClick={() => handleRunEngineAudit(eng.id)}
                  disabled={isAuditing || isTracking}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isAuditing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{isAuditing ? 'Running Audit...' : `Audit ${eng.name.split(' ')[0]}`}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
