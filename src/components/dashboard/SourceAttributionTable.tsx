'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe2,
  ExternalLink,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Link2,
  Eye,
  Download,
} from 'lucide-react';
import { SourceAttributionItem, ActivityEvent } from '@/types/dashboard';
import { useDashboard } from '@/context/dashboard-context';
import { ContextExplorerModal } from '@/components/dashboard/ContextExplorerModal';

interface SourceAttributionTableProps {
  sources?: SourceAttributionItem[];
  isLoading?: boolean;
}

export function SourceAttributionTable({
  sources,
  isLoading = false,
}: SourceAttributionTableProps) {
  const { sourcesList, activities, activeTenant } = useDashboard();
  const [subView, setSubView] = useState<'domains' | 'urls'>('domains');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityEvent | null>(null);

  const displayedSources = (sources || sourcesList || []).filter((s) =>
    s.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.anchorText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCitations = displayedSources.reduce((acc, s) => acc + s.citationsCount, 0) || 1;

  const handleExportCSV = () => {
    if (!displayedSources || displayedSources.length === 0) return;

    const tenantSlug = activeTenant.slug || activeTenant.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const today = new Date().toISOString().split('T')[0];

    const headers = [
      'Domain Name',
      'Grounding URL',
      'Used (%)',
      'Total Citations',
      'Authority Score',
      'Is Target Brand',
      'Export Date'
    ];

    const rows = displayedSources.map((s) => {
      const calculatedShare = s.citationSharePct || Math.round((s.citationsCount / totalCitations) * 100);
      return [
        `"${s.domain}"`,
        `"${s.url}"`,
        `${calculatedShare}%`,
        s.citationsCount,
        s.authorityScore || 90,
        s.isTargetBrand ? 'Yes' : 'No',
        today
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sources_${tenantSlug}_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRowClick = (source: SourceAttributionItem) => {
    const matchedActivity = activities.find(
      (a) => a.citations?.some((c) => c.includes(source.domain)) || a.domain_name === source.domain
    );

    if (matchedActivity) {
      setSelectedActivity(matchedActivity);
    } else {
      setSelectedActivity({
        id: `source-modal-${source.id}`,
        type: 'citation',
        title: `${source.domain} Grounding Attribution`,
        description: `Verified external source citation for ${activeTenant.name}. Domain citation share: ${source.citationSharePct}%.`,
        timestamp: 'Active Telemetry',
        timeAgo: 'Just now',
        badgeVariant: source.isTargetBrand ? 'indigo' : 'emerald',
        domain_name: source.domain,
        domain_authority_type: source.isTargetBrand ? 'Official Brand Portal' : 'Verified Publisher',
        sentiment_label: source.sentiment === 'negative' ? 'Negative' : source.sentiment === 'neutral' ? 'Neutral' : 'Positive',
        is_misinformation: false,
        query: `Leading enterprise platforms: ${activeTenant.name}`,
        user_prompt: `What are the top solutions in this category and what citations substantiate ${activeTenant.name}?`,
        raw_ai_response: `AI Overview references [${source.domain}](${source.url}) as an authoritative source grounding the performance and enterprise ranking of **${activeTenant.name}**.`,
        citations: [source.url],
        modelVersion: 'gemini-1.5-flash',
      });
    }
  };

  const getDomainIcon = (domain: string) => {
    const d = domain.toLowerCase();
    if (d.includes('google')) return '🔵';
    if (d.includes('healthline')) return '🔴';
    if (d.includes('reddit')) return '🟠';
    if (d.includes('eatingwell')) return '🟢';
    if (d.includes('mayo')) return '🟣';
    if (d.includes('nih') || d.includes('ncbi')) return '🔷';
    if (d.includes('bbc')) return '🟩';
    return '🌐';
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs animate-pulse flex flex-col justify-between h-full">
        <div className="h-5 w-32 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!displayedSources || displayedSources.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl mb-3 text-indigo-600">
          <Globe2 className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">No Sources Cited Yet</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Citations and grounding domains referenced in AI engine responses will appear here once an audit is captured.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full transition-colors">
      {/* Header with Title, SE Visible Sub-View Toggle (Domains / URLs), and Square Export Icon */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Sources
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Citations referenced in AI engine responses
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* SE Visible Style Sub-View Toggle (Domains / URLs) */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 gap-0.5">
              <button
                onClick={() => setSubView('domains')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  subView === 'domains'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Domains
              </button>
              <button
                onClick={() => setSubView('urls')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  subView === 'urls'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                URLs
              </button>
            </div>

            {/* Standardized Square Export Action Icon (SE Visible Style) */}
            <button
              onClick={handleExportCSV}
              className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition-colors cursor-pointer"
              title="Export Source Citations (CSV)"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SE Visible Style Sources Table */}
        <div className="mt-3">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-100 pb-2">
                <th className="py-2 px-1">Domains</th>
                <th className="py-2 px-2 text-right">Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {displayedSources.slice(0, 7).map((source, idx) => {
                const calculatedShare =
                  source.citationSharePct ||
                  Math.round((source.citationsCount / totalCitations) * 100);
                const displayUrl = subView === 'urls' ? source.url : source.domain;

                return (
                  <tr
                    key={source.id || idx}
                    onClick={() => handleRowClick(source)}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  >
                    {/* Domain / URL with Favicon Icon */}
                    <td className="py-2 px-1">
                      <div className="flex items-center space-x-2.5 truncate max-w-[220px] sm:max-w-[280px]">
                        <span className="text-xs shrink-0">{getDomainIcon(source.domain)}</span>
                        <span className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {displayUrl}
                        </span>
                        {source.isTargetBrand && (
                          <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 rounded shrink-0">
                            Official
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Used Percentage */}
                    <td className="py-2 px-2 text-right font-mono font-semibold text-slate-900">
                      {calculatedShare}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer with SE Visible View All Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <Link
          href="/dashboard/sources"
          className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 shadow-2xs transition-colors"
        >
          View all
        </Link>
        <span className="font-mono text-[11px] text-slate-400">
          {displayedSources.length} domains analyzed
        </span>
      </div>

      {/* Context Explorer Modal */}
      <ContextExplorerModal
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        activity={selectedActivity}
      />
    </div>
  );
}
