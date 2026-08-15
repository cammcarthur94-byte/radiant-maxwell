'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDashboard } from '@/context/dashboard-context';
import {
  Swords,
  TrendingUp,
  Globe2,
  Award,
  Sparkles,
  AlertTriangle,
  Play,
  RefreshCw,
  Plus,
  Lock,
  ExternalLink,
  CheckCircle2,
  X,
  ShieldAlert,
  ArrowUpRight,
  Crown,
  Download,
} from 'lucide-react';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { CompetitiveLeaderboard } from '@/components/dashboard/CompetitiveLeaderboard';
import { TIER_LIMITS, SubscriptionTier } from '@/lib/subscription-limits';

export default function CompetitorsPage() {
  const {
    activeTenant,
    competitors,
    triggerTracking,
    isTracking,
    refreshData,
    setUpgradeModalOpen,
  } = useDashboard();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [brandNameInput, setBrandNameInput] = useState('');
  const [domainUrlInput, setDomainUrlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const competitorList = competitors.filter((c) => !c.isTargetBrand);
  const planName = (activeTenant?.plan || 'starter').toLowerCase();
  const currentTier: SubscriptionTier = planName.includes('growth')
    ? 'growth'
    : planName.includes('enterprise') || planName.includes('agency')
    ? 'enterprise'
    : 'starter';

  const tierLimit = TIER_LIMITS[currentTier].maxCompetitors;
  const currentCount = competitorList.length;
  const isLimitReached = tierLimit !== Infinity && currentCount >= tierLimit;

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandNameInput.trim()) return;

    if (isLimitReached) {
      setIsAddModalOpen(false);
      setUpgradeModalOpen(true);
      return;
    }

    setIsSubmitting(true);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: activeTenant.id,
          brandName: brandNameInput.trim(),
          domainUrl: domainUrlInput.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 403 || data.upgradeRequired) {
        setIsAddModalOpen(false);
        setUpgradeModalOpen(true);
        setErrorNotice(data.error || 'Competitor limit reached. Please upgrade your plan.');
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add competitor.');
      }

      setSuccessNotice(`Successfully added ${brandNameInput.trim()} to competitor tracking.`);
      setBrandNameInput('');
      setDomainUrlInput('');
      await refreshData();

      setTimeout(() => {
        setIsAddModalOpen(false);
        setSuccessNotice(null);
      }, 1500);
    } catch (err: any) {
      setErrorNotice(err.message || 'An error occurred while adding competitor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (!competitors || competitors.length === 0) return;

    const tenantSlug = activeTenant.slug || activeTenant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const today = new Date().toISOString().split('T')[0];

    const headers = [
      'Rank',
      'Brand Name',
      'Domain',
      'Visibility Share (%)',
      'Previous Rank',
      'Previous Visibility Share (%)',
      'Position Shift',
      'Visibility Delta (%)',
      'Is Target Brand',
      'Export Date'
    ];

    const rows = competitors.map((comp) => {
      const prevRank = comp.previousRank ?? comp.rank;
      const prevVis = comp.previousVisibilityPct ?? comp.visibilityPct;
      const posShift = comp.positionDelta ?? (prevRank - comp.rank);
      const visDelta = comp.visibilityDelta ?? Math.round((comp.visibilityPct - prevVis) * 10) / 10;

      return [
        comp.rank,
        `"${comp.name.replace(/"/g, '""')}"`,
        `"${comp.domain}"`,
        `${comp.visibilityPct}%`,
        prevRank,
        `${prevVis}%`,
        posShift > 0 ? `+${posShift}` : `${posShift}`,
        visDelta >= 0 ? `+${visDelta}%` : `${visDelta}%`,
        comp.isTargetBrand ? 'Yes' : 'No',
        today
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `competitors_benchmark_${tenantSlug}_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Competitor Intelligence & Limits
                </h1>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    currentTier === 'enterprise'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : currentTier === 'growth'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {TIER_LIMITS[currentTier].displayName} Plan ({currentCount} /{' '}
                  {tierLimit === Infinity ? 'Unlimited' : tierLimit} Competitors)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Head-to-head visibility benchmarking and generative content gap analysis for {activeTenant.name}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Export Competitor Matrix as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => triggerTracking()}
            disabled={isTracking}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isTracking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isTracking ? 'Auditing...' : 'Audit Competitors'}</span>
          </button>

          {/* Add Competitor Button (With Locked State on Limit Reached) */}
          {isLimitReached ? (
            <button
              type="button"
              onClick={() => setUpgradeModalOpen(true)}
              className="px-4 py-2 bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer group"
              title="Competitor limit reached for your plan. Click to upgrade."
            >
              <Lock className="w-3.5 h-3.5 text-amber-700 group-hover:scale-110 transition-transform" />
              <span>Add Competitor (Locked - Upgrade)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setErrorNotice(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Competitor</span>
            </button>
          )}
        </div>
      </div>

      {/* Locked Tier Notification Banner if at Limit */}
      {isLimitReached && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-800 flex-shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900">
                {TIER_LIMITS[currentTier].displayName} Tier Limit Reached ({currentCount} / {tierLimit} Competitors)
              </div>
              <div className="text-[11px] text-amber-700">
                {currentTier === 'starter'
                  ? 'The Starter tier is limited to 1 competitor. Upgrade to Growth to monitor up to 10 competitors or Enterprise for unlimited tracking.'
                  : 'Upgrade to Enterprise to track unlimited competitors and unlock custom fine-tuned LLMs.'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setUpgradeModalOpen(true)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Upgrade to Growth</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {errorNotice && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorNotice}</span>
          </div>
          <button
            onClick={() => setErrorNotice(null)}
            className="text-rose-500 hover:text-rose-800 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Competitive Rank Leaderboard */}
      <CompetitiveLeaderboard competitors={competitors} activeTenant={activeTenant} />

      {/* Competitor Cards List */}
      {competitorList.length === 0 ? (
        <EmptyState
          message="No competitors added yet"
          description={`Add competitors in your niche to benchmark Share-of-Voice, track mention frequency, and identify content gaps across AI search models for ${activeTenant.name}.`}
          buttonText="Add Your First Competitor"
          disabledButton={false}
          onAction={() => {
            setErrorNotice(null);
            setIsAddModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {competitors.map((comp) => {
            const isTarget = comp.isTargetBrand;

            return (
              <div
                key={comp.name}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all relative overflow-hidden flex flex-col justify-between ${
                  isTarget
                    ? 'border-indigo-300 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {isTarget && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
                    Your Brand
                  </div>
                )}

                <div>
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0 ${comp.logoBg}`}
                    >
                      {comp.logoText}
                    </div>
                    <div className="truncate pr-8">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {comp.name}
                      </h3>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <Globe2 className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{comp.domain}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="mt-5 grid grid-cols-2 gap-3 py-3 border-y border-slate-100">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        AIO Share of Voice
                      </div>
                      <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                        {comp.visibilityPct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Category Rank
                      </div>
                      <div className="text-lg font-extrabold text-indigo-600 mt-0.5 flex items-center gap-1">
                        <Award className="w-4 h-4 text-indigo-500" />
                        <span>#{comp.rank}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{comp.changePct}% vs last period</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Live Crawl</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Competitor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 p-6">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
              <Swords className="w-4 h-4" />
              <span>Track New Competitor</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Add Industry Competitor
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Monitor this rival brand across AI query recommendations and citation sources.
            </p>

            {successNotice && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            <form onSubmit={handleAddCompetitor} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Brand / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={brandNameInput}
                  onChange={(e) => setBrandNameInput(e.target.value)}
                  placeholder="e.g., Puma, Nike, Under Armour"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Domain URL (Optional)
                </label>
                <input
                  type="text"
                  value={domainUrlInput}
                  onChange={(e) => setDomainUrlInput(e.target.value)}
                  placeholder="e.g., puma.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow-indigo-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Competitor</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
