'use client';

import React from 'react';
import { useDashboard } from '@/context/dashboard-context';
import {
  PieChart,
  TrendingUp,
  Award,
  Trophy,
  Users2,
  Sparkles,
  Play,
  RefreshCw,
} from 'lucide-react';

import { EmptyState } from '@/components/dashboard/EmptyState';

export default function ShareOfVoicePage() {
  const {
    activeTenant,
    competitors,
    kpiMetrics,
    totalCitationsCount,
    hasData,
    triggerTracking,
    isTracking,
    isLoading,
  } = useDashboard();

  const targetBrand = competitors.find((c) => c.isTargetBrand) || competitors[0];
  const totalTrackedMentions = competitors.reduce((acc, c) => acc + (c.mentionCount || 0), 0);
  const citationRateMetric = kpiMetrics.find((k) => k.id === 'citation_rate')?.value || '0.0%';

  if (!hasData && !isLoading) {
    return (
      <div className="py-6">
        <EmptyState
          message="No Share of Voice data yet"
          description={`Track how frequently ${activeTenant.name} is cited compared to competitors in AI Overviews across Google Gemini, ChatGPT, and Perplexity.`}
          buttonText={isTracking ? 'Extracting...' : 'Run First Tracking Scan'}
          disabledButton={isTracking}
          onAction={() => triggerTracking()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Share of Voice Analysis
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated conversational presence, prominence, and citations against tracked industry peers for {activeTenant.name}.
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
          <span>{isTracking ? 'Recalculating...' : 'Recalculate SOV'}</span>
        </button>
      </div>

      {/* Primary SOV Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                Target Brand SOV
              </span>
              <Award className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="text-4xl font-extrabold tracking-tight mt-3">
              {targetBrand ? `${targetBrand.visibilityPct}%` : '0.0%'}
            </div>
            <p className="text-xs text-indigo-200 mt-1">
              Top cited brand across category recommendation answers
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-indigo-700/60 text-xs text-indigo-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Rank #{targetBrand?.rank || 1} in tracked category</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tracked Industry Mentions
            </span>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              {totalTrackedMentions}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Mentions aggregated across Gemini, ChatGPT, Perplexity
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{totalTrackedMentions > 0 ? 'Active volume tracking' : 'Pending first scan'}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Citation Share
            </span>
            <div className="text-4xl font-extrabold text-indigo-600 tracking-tight mt-3">
              {citationRateMetric}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Direct domain links vs competitor URLs in grounding sources
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
            Based on {competitors.length} active competitor profiles
          </div>
        </div>
      </div>

      {/* Share of Voice Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-4">
          Competitor Share of Voice Breakdown
        </h2>

        <div className="space-y-4">
          {competitors.map((comp) => {
            const isTarget = comp.isTargetBrand;

            return (
              <div
                key={comp.name}
                className={`p-4 rounded-2xl border transition-all ${
                  isTarget
                    ? 'bg-indigo-50/70 border-indigo-200 ring-1 ring-indigo-500/20'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isTarget ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      #{comp.rank}
                    </div>

                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xs ${comp.logoBg}`}
                    >
                      {comp.logoText}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{comp.name}</span>
                        {isTarget && (
                          <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                            Target Brand
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{comp.domain}</span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <div className="text-base font-extrabold text-slate-900">
                        {comp.visibilityPct}% SOV
                      </div>
                      <div
                        className={`text-xs font-semibold ${
                          comp.changePct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {comp.changePct >= 0 ? `+${comp.changePct}%` : `${comp.changePct}%`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full ${
                      isTarget ? 'bg-indigo-600' : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.max(comp.visibilityPct, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
