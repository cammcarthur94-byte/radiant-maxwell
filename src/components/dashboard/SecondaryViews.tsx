'use client';

import React, { useState } from 'react';
import {
  NavTabId,
  TenantInfo,
  PlatformOption,
} from '@/types/dashboard';
import {
  ArrowLeft,
  Search,
  ExternalLink,
  Bot,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileCode,
  Globe2,
  TrendingUp,
} from 'lucide-react';
import { GoogleAIOverviewModal } from './GoogleAIOverviewModal';

interface SecondaryViewsProps {
  activeTab: NavTabId;
  onBackToOverview: () => void;
  activeTenant: TenantInfo;
  selectedPlatform: PlatformOption;
  onOpenUpgradeModal: () => void;
}

export function SecondaryViews({
  activeTab,
  onBackToOverview,
  activeTenant,
  selectedPlatform,
  onOpenUpgradeModal,
}: SecondaryViewsProps) {
  const [selectedAIOQuery, setSelectedAIOQuery] = useState<{
    query: string;
    rank: string;
    engine: string;
  } | null>(null);
  // Title map
  const viewMeta: Record<
    NavTabId,
    { title: string; subtitle: string; badge: string }
  > = {
    'visibility-overview': { title: 'Overview', subtitle: '', badge: '' },
    'visibility-prompts': {
      title: 'Prompt Library & Search Queries',
      subtitle: 'Monitor conversational queries and their ranking distributions',
      badge: '2,350 Tracked',
    },
    'visibility-engines': {
      title: 'AI Engines Matrix',
      subtitle: 'Detailed breakdown across ChatGPT, Perplexity, Gemini, and Copilot',
      badge: '4 Engines Active',
    },
    'visibility-sov': {
      title: 'Share of Voice Analysis',
      subtitle: 'Calculated conversational presence against top competitors',
      badge: '75.0% Aggregate SOV',
    },
    'visibility-recommendations': {
      title: 'AI Recommendation Optimization',
      subtitle: 'Actionable LLM prompt suggestions to improve citation placement',
      badge: '8 High Priority',
    },
    'citations-overview': {
      title: 'Citation Overview',
      subtitle: 'Grounded web sources and citations linked by conversational models',
      badge: '4,820 Citations',
    },
    'citations-sources': {
      title: 'Citation Sources & Authority Domains',
      subtitle: 'Top review platforms, docs, and news sites driving brand citations',
      badge: '92 Domains',
    },
    'citations-opportunities': {
      title: 'Citation Gap Opportunities',
      subtitle: 'High-leverage domains where competitors are cited but your brand is missing',
      badge: 'Gated Feature',
    },
    'citations-competitors': {
      title: 'Competitor Citation Breakdown',
      subtitle: 'Comparative citation frequency against key rivals',
      badge: '5 Tracked Competitors',
    },
    'competitors-overview': {
      title: 'Competitor Overview Matrix',
      subtitle: 'Full visibility leaderboard and rank distribution',
      badge: 'Market Radar',
    },
    'competitors-visibility': {
      title: 'Competitor Visibility Over Time',
      subtitle: 'Longitudinal trend comparisons across category leaders',
      badge: 'Weekly Sync',
    },
    'competitors-content': {
      title: 'Competitor Content Positioning',
      subtitle: 'Content corpus analyzed by LLM search algorithms',
      badge: 'Deep Crawl',
    },
    'competitors-prompt-gaps': {
      title: 'Prompt Gap Analysis',
      subtitle: 'Conversational queries where competitors outrank your brand',
      badge: '18 Gaps Identified',
    },
    'optimization-geo': {
      title: 'Generative Engine Optimization (GEO)',
      subtitle: 'LLM context graph structure, schema markup, and factuality scores',
      badge: 'Score: 88/100',
    },
    'optimization-aeo': {
      title: 'Answer Engine Optimization (AEO)',
      subtitle: 'Direct answer snippet extraction and featured quote targeting',
      badge: 'Score: 92/100',
    },
  };

  const current = viewMeta[activeTab] || {
    title: 'Section Detail',
    subtitle: 'Detailed view',
    badge: 'Active',
  };

  return (
    <div className="space-y-6">
      {/* Back Button & View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div>
          <button
            onClick={onBackToOverview}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 mb-2 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard Overview</span>
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {current.title}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              {current.badge}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{current.subtitle}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenUpgradeModal}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate Deep Report</span>
          </button>
        </div>
      </div>

      {/* Dynamic Content based on section */}
      {activeTab.startsWith('optimization') ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Schema Integrity</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                98% Valid
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Structured JSON-LD Graph</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Product specifications, organization schema, and pricing matrices are configured for direct LLM ingestion.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] font-mono text-slate-700">
              {`"@context": "https://schema.org", "@type": "SoftwareApplication"`}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Entity Grounding</span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                High Confidence
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Wikidata & Knowledge Base</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Primary entity identifiers mapped across Google Knowledge Graph and OpenAI fine-tuning snapshots.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between"><span>Wikipedia:</span> <span className="font-semibold text-emerald-600">Verified</span></div>
              <div className="flex justify-between"><span>Wikidata ID:</span> <span className="font-mono text-indigo-600">Q28407421</span></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">AIO Action Items</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                3 Pending
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Optimization Checklist</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Inject FAQ micro-format on pricing page</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Update G2 review snippet anchors</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0" />
                <span>Publish benchmark comparison table</span>
              </li>
            </ul>
          </div>
        </div>
      ) : activeTab === 'citations-opportunities' ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs text-center space-y-4 max-w-xl mx-auto my-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Citation Opportunities is a Pro Feature</h2>
            <p className="text-xs text-slate-500 mt-1">
              Identify exact high-authority domains citing your direct competitors in Perplexity and ChatGPT search.
            </p>
          </div>
          <button
            onClick={onOpenUpgradeModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Upgrade to Pro to Unlock
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Live Telemetry Records</h2>
            <span className="text-xs text-slate-400 font-mono">Filtered by {activeTenant.name}</span>
          </div>

          <div className="divide-y divide-slate-100">
            {[
              {
                query: 'Best enterprise visual website builder with custom React export',
                rank: '#1 Recommendation',
                engine: 'Google AI Overview (SERP)',
                sentiment: 'Highly Positive',
                citationCount: 4,
              },
              {
                query: 'Top no-code CMS alternatives for scalable engineering teams',
                rank: '#2 Recommendation',
                engine: 'Perplexity Pro (Sonar)',
                sentiment: 'Positive',
                citationCount: 3,
              },
              {
                query: 'Enterprise CMS security and SOC2 compliance comparison 2026',
                rank: '#1 Recommendation',
                engine: 'Google Gemini 1.5 (AIO Grounded)',
                sentiment: 'Neutral / Fact-based',
                citationCount: 6,
              },
            ].map((row, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedAIOQuery(row)}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/80 p-2 rounded-xl transition-all cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                    <span>{row.query}</span>
                    <Sparkles className="w-3 h-3 text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <Bot className="w-3 h-3 text-indigo-600" />
                    <span>{row.engine}</span>
                    <span>&bull;</span>
                    <span>{row.citationCount} grounded citations</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                    {row.rank}
                  </span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md font-medium">
                    {row.sentiment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Google AI Overview Modal */}
      {selectedAIOQuery && (
        <GoogleAIOverviewModal
          isOpen={!!selectedAIOQuery}
          onClose={() => setSelectedAIOQuery(null)}
          query={selectedAIOQuery.query}
          brandName={activeTenant.name}
          brandDomain={activeTenant.domain}
          brandRank={selectedAIOQuery.rank}
          capturedAt="Just now"
          aiOverviewPresent={true}
          isCited={true}
          serpProvider={selectedAIOQuery.engine}
        />
      )}
    </div>
  );
}
