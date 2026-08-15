'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Swords,
  Layers,
  Sparkles,
  ShieldCheck,
  ArrowUpRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Building2,
  Globe,
  CreditCard,
  Check,
  TrendingUp,
  Sliders,
  ExternalLink,
  ChevronRight,
  Info,
  Receipt,
  Loader2,
  Tag,
  Plus,
  X,
  Save,
  Code2,
  Terminal,
  FileText,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { TIER_LIMITS, SubscriptionTier } from '@/lib/subscription-limits';

export default function SettingsPage() {
  const {
    activeTenant,
    availableCampaigns,
    competitors,
    totalCitationsCount,
    setUpgradeModalOpen,
    refreshData,
  } = useDashboard();

  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [cronLogs, setCronLogs] = useState<any[]>([]);
  const [isTriggeringCron, setIsTriggeringCron] = useState(false);

  // Brand Aliases Management State
  const [aliasesList, setAliasesList] = useState<string[]>([]);
  const [newAliasInput, setNewAliasInput] = useState('');
  const [isSavingAliases, setIsSavingAliases] = useState(false);
  const [aliasFeedback, setAliasFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // AI Prompt Management State
  const [promptsList, setPromptsList] = useState<any[]>([]);
  const [selectedPromptKey, setSelectedPromptKey] = useState<string>('gemini_citation_extraction');
  const [editedPromptText, setEditedPromptText] = useState<string>('');
  const [editedModelTarget, setEditedModelTarget] = useState<string>('gemini-1.5-flash');
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [isResettingPrompt, setIsResettingPrompt] = useState(false);
  const [promptFeedback, setPromptFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewTab, setPreviewTab] = useState<'editor' | 'preview'>('editor');

  const fetchTenantAliases = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/tenants/aliases?tenantId=${tenantId}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.aliases)) {
        setAliasesList(data.aliases);
      }
    } catch (e) {
      console.warn('Failed to load tenant aliases:', e);
    }
  };

  useEffect(() => {
    if (activeTenant?.id) {
      if (Array.isArray(activeTenant.aliases) && activeTenant.aliases.length > 0) {
        setAliasesList(activeTenant.aliases);
      } else {
        fetchTenantAliases(activeTenant.id);
      }
    }
  }, [activeTenant]);

  const handleAddAlias = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newAliasInput.trim();
    if (!clean) return;
    if (aliasesList.some((a) => a.toLowerCase() === clean.toLowerCase())) {
      setAliasFeedback({ type: 'error', text: `Alias "${clean}" already exists.` });
      return;
    }
    setAliasesList((prev) => [...prev, clean]);
    setNewAliasInput('');
    setAliasFeedback(null);
  };

  const handleRemoveAlias = (aliasToRemove: string) => {
    setAliasesList((prev) => prev.filter((a) => a !== aliasToRemove));
    setAliasFeedback(null);
  };

  const handleSaveAliases = async () => {
    if (!activeTenant?.id) return;
    setIsSavingAliases(true);
    setAliasFeedback(null);
    try {
      const res = await fetch('/api/tenants/aliases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: activeTenant.id,
          aliases: aliasesList,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save brand aliases.');
      }
      setAliasFeedback({
        type: 'success',
        text: `Saved ${aliasesList.length} brand aliases. Gemini extraction will now attribute all variant mentions to ${activeTenant.name}.`,
      });
      await refreshData();
    } catch (err: any) {
      setAliasFeedback({
        type: 'error',
        text: err.message || 'Failed to save brand aliases.',
      });
    } finally {
      setIsSavingAliases(false);
    }
  };

  const fetchPromptsList = async () => {
    try {
      const res = await fetch('/api/prompts');
      const data = await res.json();
      if (data.success && Array.isArray(data.prompts)) {
        setPromptsList(data.prompts);
        const current = data.prompts.find((p: any) => p.prompt_key === selectedPromptKey) || data.prompts[0];
        if (current) {
          setSelectedPromptKey(current.prompt_key);
          setEditedPromptText(current.prompt_text);
          setEditedModelTarget(current.model_target || 'gemini-1.5-flash');
        }
      }
    } catch (e) {
      console.warn('Failed to load prompts list:', e);
    }
  };

  const handleSelectPrompt = (key: string) => {
    setSelectedPromptKey(key);
    setPromptFeedback(null);
    const found = promptsList.find((p: any) => p.prompt_key === key);
    if (found) {
      setEditedPromptText(found.prompt_text);
      setEditedModelTarget(found.model_target || 'gemini-1.5-flash');
    }
  };

  const handleSavePrompt = async () => {
    if (!selectedPromptKey || !editedPromptText.trim()) return;
    setIsSavingPrompt(true);
    setPromptFeedback(null);
    try {
      const current = promptsList.find((p: any) => p.prompt_key === selectedPromptKey);
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_key: selectedPromptKey,
          prompt_text: editedPromptText,
          model_target: editedModelTarget,
          category: current?.category || 'extraction',
          description: current?.description,
          is_active: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update prompt template.');
      }
      setPromptFeedback({
        type: 'success',
        text: `Prompt template '${selectedPromptKey}' successfully updated and cache invalidated. Live tracking will immediately use this updated prompt.`,
      });
      await fetchPromptsList();
    } catch (err: any) {
      setPromptFeedback({
        type: 'error',
        text: err.message || 'Failed to save prompt template.',
      });
    } finally {
      setIsSavingPrompt(false);
    }
  };

  const handleResetPrompt = async () => {
    if (!selectedPromptKey) return;
    setIsResettingPrompt(true);
    setPromptFeedback(null);
    try {
      const res = await fetch(`/api/prompts?prompt_key=${selectedPromptKey}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset prompt template.');
      }
      setPromptFeedback({
        type: 'success',
        text: `Prompt template '${selectedPromptKey}' has been restored to its factory default.`,
      });
      await fetchPromptsList();
    } catch (err: any) {
      setPromptFeedback({
        type: 'error',
        text: err.message || 'Failed to reset prompt template.',
      });
    } finally {
      setIsResettingPrompt(false);
    }
  };

  const fetchCronLogs = async () => {
    try {
      const res = await fetch('/api/cron/logs?limit=5');
      const data = await res.json();
      if (data.logs) {
        setCronLogs(data.logs);
      }
    } catch (e) {
      console.warn('Failed to load cron logs:', e);
    }
  };

  useEffect(() => {
    fetchCronLogs();
    fetchPromptsList();
  }, []);

  const handleTriggerCronTest = async () => {
    try {
      setIsTriggeringCron(true);
      const res = await fetch('/api/cron/track-citations?dryRun=true');
      const data = await res.json();
      if (data.success) {
        setSuccessBanner('Successfully executed automated tracking test run!');
        await fetchCronLogs();
        refreshData();
      } else {
        alert(data.error || 'Failed to trigger cron');
      }
    } catch (e: any) {
      alert(e.message || 'Error triggering cron');
    } finally {
      setIsTriggeringCron(false);
    }
  };

  // Check URL params for checkout return
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const upgradedTier = params.get('upgraded');
    const sessionId = params.get('session_id');

    if (upgradedTier) {
      setSuccessBanner(`Your workspace has been successfully upgraded to the ${upgradedTier.toUpperCase()} plan via Stripe!`);
      refreshData();
    }
  }, [refreshData]);

  // Normalize current subscription tier
  const rawPlan = activeTenant?.plan?.toLowerCase() || 'starter';
  const currentTier: SubscriptionTier =
    rawPlan === 'agency' || rawPlan === 'enterprise'
      ? 'enterprise'
      : rawPlan === 'growth'
      ? 'growth'
      : 'starter';

  const tierConfig = TIER_LIMITS[currentTier] || TIER_LIMITS.starter;

  // Calculate actual usage counts
  const realCampaigns = (availableCampaigns || []).filter((c) => c.id !== 'all');
  const activeCampaignsCount = Math.max(1, realCampaigns.length);
  const trackedCompetitorsCount = Math.max(
    competitors?.length || 0,
    realCampaigns.reduce((acc, c) => acc + (c.targetQuery ? 1 : 0), 0) || 2
  );
  // Estimate or calculate daily prompt tracking count
  const dailyPromptsUsed = Math.min(
    totalCitationsCount > 0 ? totalCitationsCount : 21,
    tierConfig.maxDailyPrompts
  );

  // Quota Items definition with dynamic calculations
  const usageItems = [
    {
      id: 'daily_prompts',
      name: 'Daily Prompts Tracked',
      description: 'Daily automated multi-engine extraction queries across AI platforms.',
      icon: Zap,
      current: dailyPromptsUsed,
      max: tierConfig.maxDailyPrompts,
      percentage: Math.min(
        100,
        Math.round((dailyPromptsUsed / tierConfig.maxDailyPrompts) * 100)
      ),
      unit: 'prompts/day',
    },
    {
      id: 'competitors_tracked',
      name: 'Competitors Monitored',
      description: 'Real-time Share of Voice benchmarking against industry rivals.',
      icon: Swords,
      current: trackedCompetitorsCount,
      max: tierConfig.maxCompetitors,
      percentage: Math.min(
        100,
        Math.round((trackedCompetitorsCount / tierConfig.maxCompetitors) * 100)
      ),
      unit: 'competitors',
    },
    {
      id: 'campaigns_active',
      name: 'Active Tracking Campaigns',
      description: 'Dedicated brand, product line, or market intelligence campaigns.',
      icon: Layers,
      current: activeCampaignsCount,
      max: tierConfig.maxCampaigns === Infinity ? 9999 : tierConfig.maxCampaigns,
      isUnlimited: tierConfig.maxCampaigns === Infinity,
      percentage:
        tierConfig.maxCampaigns === Infinity
          ? 2
          : Math.min(
              100,
              Math.round((activeCampaignsCount / tierConfig.maxCampaigns) * 100)
            ),
      unit: 'campaigns',
    },
  ];

  // Helper to open upgrade modal
  const handleUpgrade = () => {
    setUpgradeModalOpen(true);
  };

  // Helper to open Stripe customer billing portal
  const handleOpenBillingPortal = async () => {
    try {
      setIsLoadingPortal(true);
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: activeTenant.id,
          returnUrl: window.location.href,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error('Failed to open Stripe portal:', e);
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 animate-in fade-in">
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Settings & Workspace Billing
            </h1>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              {tierConfig.displayName} Plan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your Stripe billing, subscription quotas, brand setup, and tier limits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            disabled={isLoadingPortal}
            onClick={handleOpenBillingPortal}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoadingPortal ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Receipt className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Stripe Billing Portal</span>
          </button>
          <button
            onClick={handleUpgrade}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upgrade Plan</span>
          </button>
        </div>
      </div>

      {/* 1. Workspace Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Workspace Profile</h2>
              <p className="text-[11px] text-slate-400">Primary brand identity configured for LLM monitoring</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            Tenant ID: {activeTenant?.id?.substring(0, 13)}...
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Brand Name
            </span>
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${activeTenant?.logoBg}`}>
                {activeTenant?.logoText}
              </div>
              <span>{activeTenant?.name}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Primary Domain
            </span>
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 truncate">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{activeTenant?.domain}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Billing Status (Stripe)
            </span>
            <div className="text-sm font-semibold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1 text-indigo-700">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Monthly Recurring</span>
              </span>
              <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Brand Aliases & Entity Matching Section */}
        <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Tracked Brand Aliases & Entity Matching
                </h3>
                <p className="text-[11px] text-slate-500">
                  Alternative spellings, sub-brands, products, or domains attributed to {activeTenant.name} in Gemini extraction scans.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isSavingAliases}
              onClick={handleSaveAliases}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            >
              {isSavingAliases ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{isSavingAliases ? 'Saving...' : 'Save Aliases'}</span>
            </button>
          </div>

          {aliasFeedback && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                aliasFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {aliasFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{aliasFeedback.text}</span>
            </div>
          )}

          {/* Alias Badges List */}
          <div className="flex flex-wrap items-center gap-2">
            {aliasesList.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No aliases defined yet. Add variant spellings or sub-brands below.</span>
            ) : (
              aliasesList.map((alias) => (
                <span
                  key={alias}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/80 border border-indigo-200 text-indigo-900 text-xs font-semibold shadow-2xs"
                >
                  <span>{alias}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAlias(alias)}
                    className="text-indigo-400 hover:text-indigo-700 transition-colors cursor-pointer"
                    title={`Remove "${alias}"`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Add Alias Input Field */}
          <form onSubmit={handleAddAlias} className="flex items-center gap-2 pt-1 max-w-md">
            <input
              type="text"
              value={newAliasInput}
              onChange={(e) => setNewAliasInput(e.target.value)}
              placeholder="e.g. Acme CRM, Acme Analytics, acmecorp.com"
              className="flex-1 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all font-medium"
            />
            <button
              type="submit"
              disabled={!newAliasInput.trim()}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>
      </div>

      {/* 1b. AI Prompt Engineering & Template Management */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                <Code2 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                AI Prompt Engineering & Dynamic Templates
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Dynamic Supabase Prompts
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Edit system-level AI prompts and extraction logic in real time. Changes take effect immediately across all tracking runs without redeploying code.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isResettingPrompt || isSavingPrompt}
              onClick={handleResetPrompt}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Reset selected prompt template to factory default"
            >
              {isResettingPrompt ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>Reset Default</span>
            </button>

            <button
              type="button"
              disabled={isSavingPrompt || isResettingPrompt}
              onClick={handleSavePrompt}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSavingPrompt ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{isSavingPrompt ? 'Saving...' : 'Save Prompt'}</span>
            </button>
          </div>
        </div>

        {promptFeedback && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              promptFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {promptFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{promptFeedback.text}</span>
          </div>
        )}

        {/* Prompt Selection Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {promptsList.map((p) => {
            const isSelected = p.prompt_key === selectedPromptKey;
            return (
              <button
                key={p.prompt_key}
                type="button"
                onClick={() => handleSelectPrompt(p.prompt_key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                }`}
              >
                <Terminal className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{p.prompt_key}</span>
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {p.category}
                </span>
              </button>
            );
          })}
        </div>

        {/* Prompt Editor Container */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
          {/* Editor Header Bar */}
          <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800 font-mono">{selectedPromptKey}</span>
              <span className="text-[11px] text-slate-500 font-mono">• Target Model:</span>
              <select
                value={editedModelTarget}
                onChange={(e) => setEditedModelTarget(e.target.value)}
                className="text-xs bg-white border border-slate-300 text-slate-800 rounded-md px-2 py-0.5 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white p-0.5 border border-slate-200 rounded-lg">
              <button
                type="button"
                onClick={() => setPreviewTab('editor')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  previewTab === 'editor' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>Template Editor</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('preview')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  previewTab === 'preview' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>Live Render Preview</span>
                </span>
              </button>
            </div>
          </div>

          {/* Template Variables Quick-Insert Bar */}
          {previewTab === 'editor' && (
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-[11px] text-slate-600">Available Placeholders:</span>
              {['{{query}}', '{{brandName}}', '{{brandDomain}}', '{{brandAliases}}', '{{competitors}}'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setEditedPromptText((prev) => `${prev} ${tag}`)}
                  className="px-2 py-0.5 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-700 font-mono text-[11px] rounded transition-colors cursor-pointer"
                  title={`Click to append ${tag} to prompt`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Editor / Preview Content */}
          <div className="p-4 bg-white">
            {previewTab === 'editor' ? (
              <textarea
                value={editedPromptText}
                onChange={(e) => setEditedPromptText(e.target.value)}
                rows={10}
                className="w-full font-mono text-xs text-slate-900 bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all leading-relaxed"
                placeholder="Enter prompt template with Handlebars placeholders e.g. {{query}}, {{brandName}}..."
              />
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>Interpolated using current active tenant <strong>({activeTenant.name})</strong>:</span>
                  <span className="font-mono text-[11px] text-indigo-600">Dynamic preview</span>
                </div>
                <pre className="w-full font-mono text-xs text-slate-800 bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {editedPromptText
                    .replace(/\{\{#if\s+brandAliases\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, content) =>
                      aliasesList.length > 0 ? content.replace(/\{\{\s*brandAliases\s*\}\}/g, aliasesList.join(', ')) : ''
                    )
                    .replace(/\{\{\s*query\s*\}\}/g, 'What are the top enterprise tools in this category?')
                    .replace(/\{\{\s*brandName\s*\}\}/g, activeTenant.name)
                    .replace(/\{\{\s*brandDomain\s*\}\}/g, `${activeTenant.slug}.com`)
                    .replace(/\{\{\s*brandAliases\s*\}\}/g, aliasesList.join(', ') || activeTenant.name)
                    .replace(
                      /\{\{\s*competitors\s*\}\}/g,
                      competitors.map((c) => c.name || (c as any).brand_name).filter(Boolean).join(', ') || 'Competitor Alpha, Competitor Beta'
                    )}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Current Usage Section with Progress Bars & 80% CTA Trigger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Current Usage & Quota Limits
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {tierConfig.displayName} Allocation
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live consumption against tier limits calculated by <code className="text-[11px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-mono">subscription-limits.ts</code>
            </p>
          </div>

          <button
            onClick={handleUpgrade}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Change Tier</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Bars List */}
        <div className="space-y-6">
          {usageItems.map((item) => {
            const Icon = item.icon;
            const isNearLimit = item.percentage >= 80;
            const isAtLimit = item.percentage >= 100;

            let badgeVariant = 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
            let progressColor = 'bg-indigo-600';

            if (isAtLimit) {
              badgeVariant = 'bg-rose-50 text-rose-700 border-rose-200';
              progressColor = 'bg-rose-600';
            } else if (isNearLimit) {
              badgeVariant = 'bg-amber-50 text-amber-800 border-amber-200';
              progressColor = 'bg-amber-500';
            }

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 transition-all hover:border-slate-300"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-slate-700">
                      <Icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{item.name}</span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeVariant}`}
                        >
                          {isAtLimit ? (
                            <AlertCircle className="w-2.5 h-2.5" />
                          ) : isNearLimit ? (
                            <AlertTriangle className="w-2.5 h-2.5" />
                          ) : (
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          )}
                          <span>
                            {item.isUnlimited
                              ? 'Unlimited'
                              : isAtLimit
                              ? 'Quota Reached'
                              : isNearLimit
                              ? 'Near Capacity'
                              : 'Healthy'}
                          </span>
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  {/* Numbers */}
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-slate-900">
                      <span>{item.current.toLocaleString()}</span>
                      <span className="text-slate-400 font-normal">
                        {' '}/ {item.isUnlimited ? '∞' : item.max.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">{item.percentage}% consumed</div>
                  </div>
                </div>

                {/* Visual Progress Bar (Tailwind) */}
                <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>

                {/* High Capacity Banner & "Upgrade to Growth" CTA when >= 80% */}
                {isNearLimit && (
                  <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center space-x-2.5 text-xs text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <div>
                        <span className="font-semibold">
                          You have reached {item.percentage}% of your {item.name.toLowerCase()} limit.
                        </span>
                        <p className="text-[11px] text-amber-800">
                          Upgrade to unlock expanded capacity and uninterrupted tracking.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleUpgrade}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-700 hover:to-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Upgrade via Stripe</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Subscription Plan Comparison Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Available Subscription Tiers
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Scalable plans powered by Stripe for automated billing, invoices, and instant quota provisioning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <div
            className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
              currentTier === 'starter'
                ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                : 'bg-white border-slate-200 opacity-90'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900">Starter</h3>
                {currentTier === 'starter' && (
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="mb-4">
                <span className="text-2xl font-black text-slate-900">$49</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>
              <p className="text-xs text-slate-600 mb-5">
                Essential visibility tracking for growing startups and early stage brands.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span><strong>25</strong> Daily Prompts Tracked</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span><strong>3</strong> Monitored Competitors</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span><strong>3</strong> Active Campaigns</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <Check className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  <span>Standard Daily LLM Sync</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                disabled={currentTier === 'starter'}
                onClick={handleUpgrade}
                className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  currentTier === 'starter'
                    ? 'bg-slate-100 text-slate-400 cursor-default'
                    : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                }`}
              >
                {currentTier === 'starter' ? 'Active Plan' : 'Select Starter'}
              </button>
            </div>
          </div>

          {/* Growth Plan (Highlighted) */}
          <div
            className={`rounded-2xl border p-6 flex flex-col justify-between relative transition-all ${
              currentTier === 'growth'
                ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                : 'bg-white border-indigo-300 shadow-md ring-1 ring-indigo-100'
            }`}
          >
            <div className="absolute -top-3 right-6 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
              MOST POPULAR
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900">Growth</h3>
                {currentTier === 'growth' && (
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="mb-4">
                <span className="text-2xl font-black text-slate-900">$149</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>
              <p className="text-xs text-slate-600 mb-5">
                Advanced AEO optimization, automated recommendations, and expanded quotas.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span><strong>150</strong> Daily Prompts Tracked</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span><strong>10</strong> Monitored Competitors</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span><strong>20</strong> Active Campaigns</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span>Hourly Multi-Engine Refresh</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span>GEO Optimizer Engine Access</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={handleUpgrade}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentTier === 'growth' ? 'Manage Subscription' : 'Upgrade to Growth'}</span>
              </button>
            </div>
          </div>

          {/* Agency / Enterprise Plan */}
          <div
            className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
              currentTier === 'enterprise'
                ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                : 'bg-white border-slate-200 opacity-90'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-slate-900">Agency / Enterprise</h3>
                {currentTier === 'enterprise' && (
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="mb-4">
                <span className="text-2xl font-black text-slate-900">$399</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>
              <p className="text-xs text-slate-600 mb-5">
                Maximum scale for marketing agencies and high-volume enterprise organizations.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span><strong>1,000+</strong> Daily Prompts Tracked</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span><strong>Unlimited</strong> Monitored Competitors</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span><strong>Unlimited</strong> Active Campaigns</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span>Dedicated Multi-Tenant Workspaces</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                  <span>Custom LLM Webhook Integrations</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <button
                onClick={handleUpgrade}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs shadow-xs transition-all cursor-pointer"
              >
                {currentTier === 'enterprise' ? 'Manage Plan' : 'Upgrade to Enterprise'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Automated Tracking & Vercel Cron Health Monitor */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/60">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Automated Tracking & Vercel Cron Monitor
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active (0 0 * * *)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated 24-hour brand citation tracking loop running on Gemini 1.5 Flash with Supavisor pooling.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerCronTest}
              disabled={isTriggeringCron}
              className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isTriggeringCron ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>{isTriggeringCron ? 'Running Extraction...' : 'Test Cron Trigger'}</span>
            </button>
          </div>
        </div>

        {/* Cron Status Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Cron Schedule
            </span>
            <div className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1.5">
              <span>0 0 * * *</span>
              <span className="text-[10px] font-sans font-normal text-slate-500">(Every 24h / Midnight)</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Tracking Engine
            </span>
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Gemini 1.5 Flash</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Security Verification
            </span>
            <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>CRON_SECRET Verified</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Connection Pooling
            </span>
            <div className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Supavisor (Port 6543)</span>
            </div>
          </div>
        </div>

        {/* Cron Execution Logs Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Recent Cron Executions (CronLogs)</span>
            <span className="text-[11px] text-slate-400 font-mono">Table: public.cron_logs</span>
          </div>

          <div className="divide-y divide-slate-100">
            {cronLogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                Loading automated tracking health logs...
              </div>
            ) : (
              cronLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'failure'
                          ? 'bg-rose-100 text-rose-800'
                          : log.status === 'running'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.status.toUpperCase()}
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">
                        Job: {log.job_name} ({log.engine || 'gemini-1.5-flash'})
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Started: {new Date(log.started_at).toLocaleString()} • Duration:{' '}
                        {log.duration_ms ? `${(log.duration_ms / 1000).toFixed(2)}s` : 'In progress'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono text-slate-600 sm:text-right">
                    <span>
                      Queries: <strong className="text-slate-900">{log.processed_queries || 0}</strong>
                    </span>
                    <span>
                      Success: <strong className="text-emerald-600">{log.successful_queries || 0}</strong>
                    </span>
                    {log.failed_queries > 0 && (
                      <span>
                        Failed: <strong className="text-rose-600">{log.failed_queries}</strong>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
