'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import {
  Sparkles,
  Lightbulb,
  Swords,
  Link2,
  FileCode2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Play,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Download,
  FileText,
  Filter,
  CheckCircle,
  Clock,
  Archive,
  ChevronRight,
  Globe2,
} from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/dashboard/EmptyState';
import {
  GeoRecommendationItem,
  GeoRecommendationCategory,
  GeoRecommendationPriority,
  GeoRecommendationStatus,
} from '@/types/dashboard';
import { exportToCsv } from '@/lib/export-csv';

export default function RecommendationsPage() {
  const {
    activeTenant,
    hasData,
    triggerTracking,
    isTracking,
    isLoading: isDashboardLoading,
    refreshRecommendationsCount,
  } = useDashboard();

  const [recommendations, setRecommendations] = useState<GeoRecommendationItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    highPriority: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLiveGemini, setIsLiveGemini] = useState<boolean>(true);

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState<GeoRecommendationCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<GeoRecommendationPriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<GeoRecommendationStatus | 'all'>('all');

  // Interactive state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Fetch recommendations from API
  const fetchRecommendations = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        tenantId: activeTenant.id,
      });
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/recommendations?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch recommendations');
      const json = await res.json();

      if (json.success && json.data) {
        setRecommendations(json.data.items || []);
        if (json.data.stats) {
          setStats(json.data.stats);
        }
        if (typeof json.data.isLiveGemini === 'boolean') {
          setIsLiveGemini(json.data.isLiveGemini);
        }
      }
    } catch (e) {
      console.error('Error loading recommendations:', e);
    } finally {
      setIsLoading(false);
    }
  }, [activeTenant.id, categoryFilter, priorityFilter, statusFilter]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Generate / Refresh Recommendations with Gemini
  const handleGenerateRecommendations = async () => {
    try {
      setIsGenerating(true);
      setStatusMessage('Analyzing brand tracking metrics and competitor citation gaps...');
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: activeTenant.id,
          force: true,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage('AI recommendations refreshed successfully!');
        await fetchRecommendations();
        await refreshRecommendationsCount();
        setTimeout(() => setStatusMessage(null), 3500);
      } else {
        setStatusMessage('Failed to refresh recommendations.');
      }
    } catch (e) {
      console.error('Error generating recommendations:', e);
      setStatusMessage('Error connecting to AI recommendation engine.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Update Status of a single recommendation
  const handleStatusChange = async (id: string, newStatus: GeoRecommendationStatus) => {
    try {
      setUpdatingId(id);
      const res = await fetch('/api/recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          tenantId: activeTenant.id,
          status: newStatus,
        }),
      });

      if (res.ok) {
        setRecommendations((prev) =>
          prev.map((rec) => (rec.id === id ? { ...rec, status: newStatus } : rec))
        );
        // Refresh stats
        await fetchRecommendations();
        await refreshRecommendationsCount();
      }
    } catch (e) {
      console.error('Error updating recommendation status:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  // Copy Action Item Text
  const handleCopyAction = (rec: GeoRecommendationItem) => {
    const textToCopy = `[${rec.priority.toUpperCase()} PRIORITY GEO ACTION] ${rec.title}\nImpact: ${rec.estimated_impact}\n\nAction Plan:\n${rec.action_plan}${
      rec.code_snippet ? `\n\nCode / Template:\n${rec.code_snippet}` : ''
    }`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(rec.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy Code Snippet
  const handleCopyCodeSnippet = (snippet: string, id: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const exportData = recommendations.map((r) => ({
      Title: r.title,
      Category: r.category,
      Priority: r.priority,
      Status: r.status,
      Estimated_Impact: r.estimated_impact,
      Target_Query: r.target_query || 'N/A',
      Competitor_Gaps: r.competitor_name || 'N/A',
      Target_Domain: r.target_domain || 'N/A',
      Action_Plan: r.action_plan,
      Description: r.description,
    }));

    exportToCsv(
      exportData,
      `geo-recommendations-${activeTenant.name.toLowerCase().replace(/\s+/g, '-')}-${
        new Date().toISOString().split('T')[0]
      }.csv`
    );
  };

  // Export Markdown Action Plan
  const handleExportMarkdown = () => {
    const markdownContent = `# Generative Engine Optimization (GEO) Action Plan
**Target Brand:** ${activeTenant.name} (${activeTenant.domain})
**Generated Date:** ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
**Total Recommendations:** ${recommendations.length}

---

${recommendations
  .map(
    (r, idx) => `## ${idx + 1}. [${r.priority.toUpperCase()}] ${r.title}
- **Category:** ${r.category.replace('_', ' ').toUpperCase()}
- **Estimated Impact:** ${r.estimated_impact}
- **Status:** ${r.status.toUpperCase()}
${r.target_query ? `- **Target Query:** \`${r.target_query}\`` : ''}
${r.competitor_name ? `- **Competitor Lead:** ${r.competitor_name}` : ''}
${r.target_domain ? `- **Target Domain/Platform:** ${r.target_domain}` : ''}

### Issue & AI Grounding Analysis
${r.description}

### Prescriptive Action Plan
${r.action_plan}

${
  r.code_snippet
    ? `### Implementation Template / Code
\`\`\`
${r.code_snippet}
\`\`\`
`
    : ''
}
---`
  )
  .join('\n\n')}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `geo-action-plan-${activeTenant.name.toLowerCase().replace(/\s+/g, '-')}-${
        new Date().toISOString().split('T')[0]
      }.md`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Categorize counts
  const categoryCounts = useMemo(() => {
    return {
      all: recommendations.length,
      competitor_gap: recommendations.filter((r) => r.category === 'competitor_gap').length,
      source_citation: recommendations.filter((r) => r.category === 'source_citation').length,
      content_schema: recommendations.filter((r) => r.category === 'content_schema').length,
    };
  }, [recommendations]);

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      return true;
    });
  }, [recommendations, categoryFilter, priorityFilter, statusFilter]);

  if (!hasData && !isDashboardLoading && recommendations.length === 0) {
    return (
      <div className="py-6">
        <EmptyState
          message="No optimization recommendations yet"
          description={`Automated competitor gap analysis, authority citation targets, and schema optimization strategies for ${activeTenant.name} will be generated once your search model citations are audited.`}
          buttonText={isTracking ? 'Extracting...' : 'Run First Tracking Scan'}
          disabledButton={isTracking}
          onAction={() => triggerTracking()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  AI Recommendations & GEO Optimization
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-indigo-600" />
                  <span>{isLiveGemini ? 'Gemini 2.5 Flash Live' : 'AI Engine'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Prescriptive strategies to outrank competitors, earn high-authority citations, and dominate AI Overviews for <strong className="text-slate-700">{activeTenant.name}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download formatted Markdown action plan for marketing & engineering teams"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Action Plan (.md)</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Export recommendations to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleGenerateRecommendations}
            disabled={isGenerating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isGenerating ? 'Analyzing Metrics...' : 'Generate Recommendations'}</span>
          </button>
        </div>
      </div>

      {/* Status Notification Toast */}
      {statusMessage && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3.5 flex items-center justify-between text-indigo-900 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span className="font-semibold">{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-indigo-500 hover:text-indigo-800 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Top Metric Cards (Stats Overview) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actionable Tips</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Lightbulb className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{stats.total || recommendations.length}</span>
            <span className="text-[11px] text-slate-400">total tips</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">High Impact</span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-rose-600">
              {stats.highPriority || recommendations.filter((r) => r.priority === 'high').length}
            </span>
            <span className="text-[11px] text-slate-400">urgent actions</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Progress</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-indigo-600">
              {stats.inProgress || recommendations.filter((r) => r.status === 'in_progress').length}
            </span>
            <span className="text-[11px] text-slate-400">implementing</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-600">
              {stats.completed || recommendations.filter((r) => r.status === 'completed').length}
            </span>
            <span className="text-[11px] text-slate-400">executed</span>
          </div>
        </div>
      </div>

      {/* 3. Category & Priority Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Categories ({categoryCounts.all})
          </button>
          <button
            onClick={() => setCategoryFilter('competitor_gap')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              categoryFilter === 'competitor_gap'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Competitor Gaps ({categoryCounts.competitor_gap})</span>
          </button>
          <button
            onClick={() => setCategoryFilter('source_citation')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              categoryFilter === 'source_citation'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Citation & Source Targets ({categoryCounts.source_citation})</span>
          </button>
          <button
            onClick={() => setCategoryFilter('content_schema')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              categoryFilter === 'content_schema'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Content & Schema Fixes ({categoryCounts.content_schema})</span>
          </button>
        </div>

        {/* Priority & Status Controls */}
        <div className="flex items-center gap-2">
          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Impact Only</option>
            <option value="medium">Medium Impact</option>
            <option value="quick_win">Quick Wins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 shadow-2xs focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending / New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* 4. Recommendation Cards Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="text-xs font-semibold">Loading GEO optimization intelligence...</span>
        </div>
      ) : filteredRecommendations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900">No matching recommendations found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your category, priority, or status filters above, or generate fresh recommendations.
          </p>
          <button
            onClick={() => {
              setCategoryFilter('all');
              setPriorityFilter('all');
              setStatusFilter('all');
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredRecommendations.map((rec) => {
            const isHigh = rec.priority === 'high';
            const isQuickWin = rec.priority === 'quick_win';
            const isCompleted = rec.status === 'completed';
            const isInProgress = rec.status === 'in_progress';

            const categoryIcon =
              rec.category === 'competitor_gap' ? (
                <Swords className="w-3.5 h-3.5 text-indigo-600" />
              ) : rec.category === 'source_citation' ? (
                <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <FileCode2 className="w-3.5 h-3.5 text-amber-600" />
              );

            const categoryLabel =
              rec.category === 'competitor_gap'
                ? 'Competitor Gap'
                : rec.category === 'source_citation'
                ? 'Source & Citation'
                : 'Content & Schema';

            const priorityBadge = isHigh ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                High Impact
              </span>
            ) : isQuickWin ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Quick Win
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Medium Impact
              </span>
            );

            return (
              <div
                key={rec.id}
                className={`bg-white border rounded-3xl p-6 shadow-xs transition-all hover:shadow-md ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : isInProgress
                    ? 'border-indigo-200 bg-indigo-50/10'
                    : 'border-slate-200'
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
                  <div className="flex items-center space-x-2 flex-wrap">
                    {priorityBadge}

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                      {categoryIcon}
                      <span>{categoryLabel}</span>
                    </span>

                    {rec.target_domain && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                        {rec.target_domain}
                      </span>
                    )}

                    {rec.competitor_name && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        vs. {rec.competitor_name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{rec.estimated_impact}</span>
                    </span>

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isInProgress
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {rec.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5 mb-3.5">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{rec.title}</h3>
                  {rec.target_query && (
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl font-mono text-[11px] text-slate-800 inline-block">
                      Target Query: <span className="font-semibold text-slate-900">"{rec.target_query}"</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    <strong className="text-slate-800">Why this matters:</strong> {rec.description}
                  </p>
                </div>

                {/* Prescriptive Action Plan */}
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-950 mb-3.5">
                  <div className="font-bold text-[10px] text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-indigo-600" />
                    <span>Prescriptive Action Plan</span>
                  </div>
                  <p className="leading-relaxed">{rec.action_plan}</p>
                </div>

                {/* Code / Template Box (if present) */}
                {rec.code_snippet && (
                  <div className="relative group mb-3.5">
                    <div className="p-3 bg-slate-900 text-slate-200 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                      {rec.code_snippet}
                    </div>
                    <button
                      onClick={() => handleCopyCodeSnippet(rec.code_snippet!, rec.id)}
                      className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                      title="Copy code template"
                    >
                      {copiedSnippetId === rec.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-300" />
                          <span className="text-[10px]">Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Card Footer & Interactive Actions */}
                <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleCopyAction(rec)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                      title="Copy entire recommendation and action plan to clipboard"
                    >
                      {copiedId === rec.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Action Item</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center space-x-2">
                    {rec.status !== 'in_progress' && rec.status !== 'completed' && (
                      <button
                        type="button"
                        disabled={updatingId === rec.id}
                        onClick={() => handleStatusChange(rec.id, 'in_progress')}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Start Working</span>
                      </button>
                    )}

                    {rec.status !== 'completed' && (
                      <button
                        type="button"
                        disabled={updatingId === rec.id}
                        onClick={() => handleStatusChange(rec.id, 'completed')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Mark as Completed</span>
                      </button>
                    )}

                    {rec.status === 'completed' && (
                      <button
                        type="button"
                        disabled={updatingId === rec.id}
                        onClick={() => handleStatusChange(rec.id, 'pending')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reopen Tip</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
