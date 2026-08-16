'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import {
  Cpu,
  Play,
  RefreshCw,
  MoreVertical,
  Bot,
  ExternalLink,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  LayoutGrid,
  List,
} from 'lucide-react';

interface EngineItem {
  id: string;
  name: string;
  provider: string;
  model: string;
  visibilityPct: number;
  avgRank: string;
  citationsCount: number;
  sentiment: string;
  sentimentScore: number;
  status: 'active' | 'standby';
  statusText: string;
  groundingSource: string;
  accentColor: string;
  iconBg: string;
  iconText: string;
}

export function AiEnginesMatrix() {
  const {
    activeTenant,
    totalCitationsCount,
    hasData,
    triggerTracking,
    isTracking,
  } = useDashboard();

  const [activeAuditingEngine, setActiveAuditingEngine] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const engines: EngineItem[] = [
    {
      id: 'gemini',
      name: 'Google Gemini & AIO',
      provider: 'Google DeepMind',
      model: 'gemini-3.7-flash (Live Search Grounding)',
      visibilityPct: hasData ? 92.5 : 0.0,
      avgRank: hasData ? '#1.2' : '—',
      citationsCount: hasData ? totalCitationsCount : 0,
      sentiment: hasData ? '98% positive' : 'Pending audit',
      sentimentScore: hasData ? 98 : 0,
      status: hasData ? 'active' : 'standby',
      statusText: hasData ? 'Active' : 'Standby',
      groundingSource: 'Google Knowledge Graph & SGE',
      accentColor: 'text-purple-600',
      iconBg: 'bg-purple-50 border-purple-100 text-purple-600',
      iconText: 'G',
    },
    {
      id: 'chatgpt',
      name: 'OpenAI ChatGPT Search',
      provider: 'OpenAI',
      model: 'GPT-4o Search & Canvas',
      visibilityPct: 0.0,
      avgRank: '—',
      citationsCount: 0,
      sentiment: 'Pending audit',
      sentimentScore: 0,
      status: 'standby',
      statusText: 'Standby',
      groundingSource: 'Bing Index & Direct Web Browse',
      accentColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
      iconText: 'O',
    },
    {
      id: 'perplexity',
      name: 'Perplexity Pro & Sonar',
      provider: 'Perplexity AI',
      model: 'Sonar Online Multi-Domain',
      visibilityPct: 0.0,
      avgRank: '—',
      citationsCount: 0,
      sentiment: 'Pending audit',
      sentimentScore: 0,
      status: 'standby',
      statusText: 'Standby',
      groundingSource: 'Real-time multi-source crawl',
      accentColor: 'text-cyan-600',
      iconBg: 'bg-cyan-50 border-cyan-100 text-cyan-600',
      iconText: 'P',
    },
    {
      id: 'copilot',
      name: 'Microsoft Copilot',
      provider: 'Microsoft',
      model: 'Bing Grounded Index',
      visibilityPct: 0.0,
      avgRank: '—',
      citationsCount: 0,
      sentiment: 'Pending audit',
      sentimentScore: 0,
      status: 'standby',
      statusText: 'Standby',
      groundingSource: 'Bing Conversational Grounding',
      accentColor: 'text-blue-600',
      iconBg: 'bg-blue-50 border-blue-100 text-blue-600',
      iconText: 'M',
    },
  ];

  const handleRunEngineAudit = async (engineId: string) => {
    setOpenDropdownId(null);
    setActiveAuditingEngine(engineId);
    await triggerTracking(engineId);
    setActiveAuditingEngine(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-700">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                AI Engines Matrix
              </h1>
              <span className="text-[11px] font-medium text-slate-500 font-mono">
                {engines.length} models configured
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative multi-model visibility, rank capture, and citation tracking for {activeTenant.name}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center border border-slate-200/60">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white shadow-2xs text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white shadow-2xs text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Audit All Button */}
          <button
            type="button"
            onClick={() => triggerTracking()}
            disabled={isTracking}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-medium rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isTracking ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isTracking ? 'Auditing matrix...' : 'Audit all engines'}</span>
          </button>
        </div>
      </div>

      {/* Grid Mode (2x2 Flat Crisp Cards) */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {engines.map((eng) => {
            const isAuditing = activeAuditingEngine === eng.id;
            const isMenuOpen = openDropdownId === eng.id;

            return (
              <div
                key={eng.id}
                className="bg-white border border-slate-200/60 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Engine Icon, Name, Subtle Status & Action Dropdown */}
                  <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs border ${eng.iconBg}`}
                      >
                        {eng.iconText}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                            {eng.name}
                          </h2>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {eng.model}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 relative">
                      {/* Refined Minimalist Status Pill */}
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200/60">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            eng.status === 'active'
                              ? 'bg-emerald-500 animate-pulse'
                              : 'bg-slate-300'
                          }`}
                        />
                        <span className="text-[11px] capitalize">{eng.statusText}</span>
                      </span>

                      {/* Right-aligned Action Menu Dropdown */}
                      <div className="relative" ref={isMenuOpen ? dropdownRef : null}>
                        <button
                          type="button"
                          onClick={() => setOpenDropdownId(isMenuOpen ? null : eng.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Engine Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200/80 rounded-lg shadow-lg py-1 z-30 animate-in fade-in zoom-in-95">
                            <button
                              type="button"
                              onClick={() => handleRunEngineAudit(eng.id)}
                              disabled={isAuditing || isTracking}
                              className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {isAuditing ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                              ) : (
                                <Play className="w-3.5 h-3.5 text-slate-500" />
                              )}
                              <span>Run audit</span>
                            </button>
                            <div className="my-1 border-t border-slate-100" />
                            <div className="px-3 py-1 text-[10px] text-slate-400 font-mono">
                              Source: {eng.groundingSource}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Clean Typography Metrics Row (No Nested Heavy Boxes) */}
                  <div className="grid grid-cols-4 gap-2 py-4 border-b border-slate-100">
                    <div>
                      <div className="text-[11px] text-slate-500 font-normal">Visibility</div>
                      <div className="text-sm font-semibold text-slate-900 mt-1">
                        {eng.visibilityPct > 0 ? `${eng.visibilityPct}%` : '—'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-500 font-normal">Average rank</div>
                      <div className="text-sm font-semibold text-slate-900 mt-1 font-mono">
                        {eng.avgRank}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-500 font-normal">Citations</div>
                      <div className="text-sm font-semibold text-slate-900 mt-1">
                        {eng.citationsCount > 0 ? eng.citationsCount.toLocaleString() : '0'}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] text-slate-500 font-normal">Sentiment</div>
                      <div className="text-sm font-semibold text-slate-900 mt-1 truncate">
                        {eng.sentiment}
                      </div>
                    </div>
                  </div>

                  {/* Share of Voice Progress Bar */}
                  <div className="pt-3.5 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-normal">Share of voice</span>
                      <span className="font-semibold text-slate-800">
                        {eng.visibilityPct > 0 ? `${eng.visibilityPct}%` : '0%'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-800 transition-all duration-500"
                        style={{ width: `${eng.visibilityPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Subdued Footer Note */}
                <div className="pt-3 mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{eng.groundingSource}</span>
                  {isAuditing && (
                    <span className="text-indigo-600 font-medium flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Scanning...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View (Unified Enterprise Table) */
        <div className="bg-white border border-slate-200/60 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-50/50 text-[11px] text-slate-500 font-medium">
                  <th className="py-3 px-4">Engine</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4">Average rank</th>
                  <th className="py-3 px-4">Citations</th>
                  <th className="py-3 px-4">Sentiment</th>
                  <th className="py-3 px-4">Grounding source</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {engines.map((eng) => {
                  const isAuditing = activeAuditingEngine === eng.id;

                  return (
                    <tr key={eng.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-[11px] border ${eng.iconBg}`}
                          >
                            {eng.iconText}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{eng.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{eng.model}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              eng.status === 'active'
                                ? 'bg-emerald-500 animate-pulse'
                                : 'bg-slate-300'
                            }`}
                          />
                          <span className="text-[11px] capitalize">{eng.statusText}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {eng.visibilityPct > 0 ? `${eng.visibilityPct}%` : '—'}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900 font-mono">
                        {eng.avgRank}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {eng.citationsCount > 0 ? eng.citationsCount.toLocaleString() : '0'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        {eng.sentiment}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {eng.groundingSource}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRunEngineAudit(eng.id)}
                          disabled={isAuditing || isTracking}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-md border border-slate-200/60 transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {isAuditing ? (
                            <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />
                          ) : (
                            <Play className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{isAuditing ? 'Auditing...' : 'Audit'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
