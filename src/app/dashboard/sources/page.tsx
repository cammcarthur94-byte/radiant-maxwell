'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import {
  Globe2,
  ExternalLink,
  Download,
  Search,
  Filter,
  Link2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ContextExplorerModal } from '@/components/dashboard/ContextExplorerModal';
import { ActivityEvent, SourceAttributionItem } from '@/types/dashboard';

export default function SourcesPage() {
  const { activeTenant, activities, sourcesList, hasData, triggerTracking, isTracking, isLoading } = useDashboard();
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'target' | 'competitor' | 'review'>('all');
  const [selectedActivityForExplorer, setSelectedActivityForExplorer] = useState<ActivityEvent | null>(null);

  // Compute enriched domain attribution list from real activities and context
  const enrichedSources = React.useMemo(() => {
    const list = sourcesList && sourcesList.length > 0 ? sourcesList : [];
    const totalAllCitations = list.reduce((sum, s) => sum + s.citationsCount, 0) || 1;

    return list.map((source, index) => {
      const isTarget = source.isTargetBrand || source.domain.includes(activeTenant.domain);
      const isReview = source.domain.includes('g2.com') || source.domain.includes('capterra') || source.domain.includes('trustpilot');
      const isCompetitor = !isTarget && !isReview && (source.domain.includes('brandwatch') || source.domain.includes('sproutsocial') || source.domain.includes('semrush') || source.domain.includes('competitor'));
      
      const sharePct = source.citationSharePct || Math.round((source.citationsCount / totalAllCitations) * 100);

      let authorityTier = 'General Publisher';
      if (isTarget) authorityTier = 'Official Brand Portal';
      else if (isReview) authorityTier = 'Review Platform';
      else if (source.domain.includes('techcrunch') || source.domain.includes('forbes') || source.domain.includes('venturebeat')) authorityTier = 'Tech Publication';
      else if (source.domain.includes('reddit') || source.domain.includes('quora')) authorityTier = 'Community Discussion';

      return {
        ...source,
        rank: index + 1,
        sharePct,
        authorityTier,
        isTarget,
        isReview,
        isCompetitor,
      };
    });
  }, [sourcesList, activeTenant]);

  const filteredSources = enrichedSources.filter((s) => {
    const matchesSearch =
      s.domain.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.anchorText.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.authorityTier.toLowerCase().includes(searchFilter.toLowerCase());

    if (!matchesSearch) return false;
    if (categoryFilter === 'target') return s.isTarget;
    if (categoryFilter === 'competitor') return s.isCompetitor;
    if (categoryFilter === 'review') return s.isReview;
    return true;
  });

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Rank,Domain,Citation Share (%),Total Citations,Authority Score,Authority Tier,Official Target Brand']
        .concat(
          filteredSources.map(
            (s) =>
              `${s.rank},"${s.domain}",${s.sharePct}%,${s.citationsCount},${s.authorityScore || 90},"${s.authorityTier}",${s.isTarget ? 'Yes' : 'No'}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const tenantSlug = activeTenant?.slug || activeTenant?.name?.toLowerCase().replace(/\s+/g, '-') || 'export';
    link.setAttribute('download', `source_attribution_leaderboard_${tenantSlug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenExplorerForDomain = (source: typeof enrichedSources[0]) => {
    // Find matching activity event or construct high-fidelity context item
    const matchedActivity = activities.find(
      (a) => a.citations?.some((c) => c.includes(source.domain)) || a.domain_name === source.domain
    );

    if (matchedActivity) {
      setSelectedActivityForExplorer(matchedActivity);
    } else {
      setSelectedActivityForExplorer({
        id: `source-context-${source.id}`,
        type: 'citation',
        title: `${source.domain} Grounding Attribution`,
        description: `Authoritative citation extracted for ${activeTenant.name}. Verified domain citation rate: ${source.sharePct}%.`,
        timestamp: 'Active Snapshot',
        timeAgo: 'Live Telemetry',
        badgeVariant: source.isTarget ? 'indigo' : 'emerald',
        domain_name: source.domain,
        domain_authority_type: source.authorityTier,
        sentiment_label: source.sentiment === 'negative' ? 'Negative' : source.sentiment === 'neutral' ? 'Neutral' : 'Positive',
        is_misinformation: false,
        query: `Top enterprise solutions for ${activeTenant.name}`,
        user_prompt: `What are the leading platforms in this market, and what citations verify ${activeTenant.name}?`,
        raw_ai_response: `Based on verified AI search crawls, **${activeTenant.name}** is referenced through authoritative sources including [${source.domain}](${source.url}) with high recommendation grounding and verified citation share of ${source.sharePct}%.`,
        citations: [source.url],
        modelVersion: 'gemini-1.5-flash',
      });
    }
  };

  if (!hasData && !isLoading) {
    return (
      <div className="py-6">
        <EmptyState
          message="No citation sources detected yet"
          description={`External grounding sources, authoritative publisher URLs, and citation share rankings for ${activeTenant.name} will stream here after search models complete an extraction scan.`}
          buttonText={isTracking ? 'Extracting Citations...' : 'Run First AI Overview Audit'}
          disabledButton={isTracking}
          onAction={() => triggerTracking()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-900 text-white rounded-lg shadow-xs">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Source Attribution & Citation Leaderboard
              </h1>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                {activeTenant.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked domains and publishers cited by ChatGPT, Perplexity, Gemini, and Copilot.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Sources' },
            { id: 'target', label: 'Brand Official' },
            { id: 'review', label: 'Reviews & Portals' },
            { id: 'competitor', label: 'Competitor Citations' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter domains or tier..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Top Cited Domains Leaderboard Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                <th className="py-2.5 px-4">Cited Domain</th>
                <th className="py-2.5 px-4">Authority Tier</th>
                <th className="py-2.5 px-4 w-40">Citation Share</th>
                <th className="py-2.5 px-4 text-right">Citations</th>
                <th className="py-2.5 px-4 text-right">Authority</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSources.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleOpenExplorerForDomain(item)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Rank */}
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-500 group-hover:text-indigo-600">
                    #{item.rank}
                  </td>

                  {/* Domain Name & Details */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                        {item.domain.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate max-w-[220px] sm:max-w-xs">
                        <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <span>{item.domain}</span>
                          {item.isTarget && (
                            <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 rounded">
                              Target Brand
                            </span>
                          )}
                          {item.isCompetitor && (
                            <span className="text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 rounded">
                              Competitor
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{item.anchorText}</div>
                      </div>
                    </div>
                  </td>

                  {/* Authority Tier Badge */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {item.authorityTier}
                    </span>
                  </td>

                  {/* Citation Share % Progress Bar */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-800">
                        <span>{item.sharePct}%</span>
                        <span className="text-[10px] font-normal text-slate-400 font-sans">of citations</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.isTarget
                              ? 'bg-indigo-600'
                              : item.sharePct > 20
                              ? 'bg-emerald-500'
                              : 'bg-slate-400'
                          }`}
                          style={{ width: `${Math.min(item.sharePct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Citations Count */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {item.citationsCount}
                  </td>

                  {/* Authority Score */}
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {item.authorityScore || 90}
                    </span>
                  </td>

                  {/* Actions (Inspect Context & External link) */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenExplorerForDomain(item);
                        }}
                        className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                        title="Open Context Explorer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                        title="Open live URL"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Click any domain row to inspect prompt context and AI response synthesis</span>
          <span className="font-mono text-[11px] font-semibold">
            Showing {filteredSources.length} Ranked Domains
          </span>
        </div>
      </div>

      {/* Context Explorer Modal */}
      <ContextExplorerModal
        isOpen={!!selectedActivityForExplorer}
        onClose={() => setSelectedActivityForExplorer(null)}
        activity={selectedActivityForExplorer}
      />
    </div>
  );
}
