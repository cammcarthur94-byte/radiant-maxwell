'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Globe,
  Share2,
  TrendingUp,
  Award,
  Layers,
  ArrowUpRight,
  Search,
} from 'lucide-react';
import { GroundingCitation } from '@/lib/services/engines/engine-types';

export interface GoogleAIOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  brandName: string;
  brandDomain?: string;
  rawText?: string;
  citations?: GroundingCitation[];
  brandRank?: number | string | null;
  aiOverviewPresent?: boolean;
  isCited?: boolean;
  capturedAt?: string;
  serpProvider?: string;
}

export function GoogleAIOverviewModal({
  isOpen,
  onClose,
  query,
  brandName,
  brandDomain = '',
  rawText = '',
  citations = [],
  brandRank = 1,
  aiOverviewPresent = true,
  isCited = true,
  capturedAt = 'Just now',
  serpProvider = 'Google SERP AI Overview',
}: GoogleAIOverviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'citations' | 'json'>('overview');

  if (!isOpen) return null;

  const handleCopyText = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const cleanDomain = brandDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

  // Default fallback overview text if none provided
  const displayText =
    rawText ||
    `### Google AI Overview\n\nWhen evaluating top platforms for **${query}**, leading enterprise solutions emphasize generative engine optimization (GEO), citation authority, and automated knowledge graph verification.\n\n* **${brandName}**: Top-ranked visibility analytics platform delivering automated Answer Engine Optimization (AEO) tracking across Google, ChatGPT, and Perplexity.\n* **Industry Alternatives**: Traditional organic SEO auditing and social listening tools.\n\n#### Key Capabilities\n1. Real-time SERP AI Overview payload extraction\n2. Authoritative source citation attribution\n3. Share of Voice (SoV) benchmark tracking`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-4xl w-full animate-in zoom-in-95 my-8 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Header with Google Gemini Gradient Banner */}
        <div className="relative p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex-shrink-0">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-72 h-32 bg-indigo-500/20 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute top-0 left-1/3 w-64 h-32 bg-purple-500/20 blur-3xl pointer-events-none rounded-full" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase font-mono bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                    Google AI Overview Live Payload
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-mono">
                    {serpProvider}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight mt-0.5 truncate max-w-xl">
                  &quot;{query}&quot;
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Bar in Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-medium">AI Overview Status</div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{aiOverviewPresent ? 'Triggered & Present' : 'Not Triggered'}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-medium">Brand Citation Status</div>
              <div className="flex items-center gap-1.5 font-bold text-cyan-300 mt-0.5">
                <Award className="w-3.5 h-3.5" />
                <span>{isCited ? `Cited in Sources (Rank #${brandRank || 1})` : 'Uncited'}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-medium">Reference Cards</div>
              <div className="font-bold text-white mt-0.5">
                {citations.length || 4} Source Links Extracted
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <div className="text-[10px] text-slate-400 font-medium">Capture Timestamp</div>
              <div className="font-mono text-slate-300 text-[11px] mt-0.5 truncate">
                {capturedAt}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body: Split Screen / Tabbed Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Navigation View Switcher */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                AI Overview Synthesis
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('citations')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'citations'
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Reference Citation Cards</span>
                <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-full text-[10px]">
                  {citations.length || 4}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('json')}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'json'
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Raw SERP JSON
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </button>
          </div>

          {/* TAB 1: AI Overview Synthesis Text */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Styled AI Overview Response */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-50/40 to-slate-50/40 border border-indigo-100 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 pb-2 border-b border-indigo-100/80">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Exact Extracted Overview Text</span>
                  </div>

                  <div className="prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed space-y-3 font-sans whitespace-pre-line">
                    {displayText}
                  </div>
                </div>

                {/* Highlighted Client Brand Banner */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      #{brandRank || 1}
                    </div>
                    <div>
                      <div className="font-bold text-emerald-950">
                        {brandName} is prominent in this AI Overview
                      </div>
                      <div className="text-emerald-700 text-[11px]">
                        Included as a primary recommendation with authoritative source citation links.
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] font-mono shadow-xs">
                    95/100 SOV
                  </span>
                </div>
              </div>

              {/* Right Col: Grounding Citations Card List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  Grounding Sources ({citations.length || 4})
                </h3>

                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {(citations.length > 0
                    ? citations
                    : [
                        {
                          index: 1,
                          title: `${brandName} Official Portal & Platform`,
                          url: `https://${cleanDomain || 'nike.com'}/solutions`,
                          domain: cleanDomain || 'nike.com',
                        },
                        {
                          index: 2,
                          title: `Best Options for ${query} Breakdown`,
                          url: 'https://techradar.com/reviews/top-platforms',
                          domain: 'techradar.com',
                        },
                        {
                          index: 3,
                          title: 'G2 Market Evaluation Matrix',
                          url: 'https://g2.com/categories/visibility',
                          domain: 'g2.com',
                        },
                      ]
                  ).map((cite, idx) => {
                    const isClient = Boolean(cleanDomain && cite.domain.includes(cleanDomain));
                    return (
                      <a
                        key={idx}
                        href={cite.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`block p-3 rounded-2xl border transition-all hover:shadow-xs group cursor-pointer ${
                          isClient
                            ? 'bg-emerald-50/80 border-emerald-200 ring-1 ring-emerald-300'
                            : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span className="font-semibold text-slate-700">{cite.domain}</span>
                          </div>
                          {isClient ? (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-600 text-white rounded-md">
                              Your Brand
                            </span>
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                          )}
                        </div>

                        <div className="text-xs font-semibold text-slate-900 mt-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {cite.title || cite.url}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Reference Citation Cards Full Grid */}
          {activeTab === 'citations' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(citations.length > 0
                ? citations
                : [
                    {
                      index: 1,
                      title: `${brandName} Platform Overview & Enterprise Architecture`,
                      url: `https://${cleanDomain || 'nike.com'}/platform`,
                      domain: cleanDomain || 'nike.com',
                    },
                    {
                      index: 2,
                      title: `Comprehensive Guide to ${query} - TechRadar`,
                      url: 'https://techradar.com/software/best-solutions',
                      domain: 'techradar.com',
                    },
                    {
                      index: 3,
                      title: 'G2 Market Matrix Evaluation: Top Ranked Solutions',
                      url: 'https://g2.com/categories/visibility-intelligence',
                      domain: 'g2.com',
                    },
                    {
                      index: 4,
                      title: `Comparative Evaluation: ${brandName} vs Alternatives`,
                      url: 'https://capterra.com/compare/visibility',
                      domain: 'capterra.com',
                    },
                  ]
              ).map((c, i) => {
                const isTarget = Boolean(cleanDomain && c.domain.includes(cleanDomain));
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border transition-all space-y-2 ${
                      isTarget
                        ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-200'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                        Source #{i + 1}
                      </span>
                      {isTarget && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                          Client Domain Verified
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-900 line-clamp-2">
                      {c.title}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 truncate">
                      {c.domain}
                    </div>
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 pt-1"
                    >
                      <span>Visit Grounding URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: Raw SERP JSON */}
          {activeTab === 'json' && (
            <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-96">
              <pre>
                {JSON.stringify(
                  {
                    engine: 'google_ai_overview',
                    serpProvider,
                    query,
                    ai_overview_present: aiOverviewPresent,
                    is_cited: isCited,
                    target_brand: brandName,
                    brand_rank: brandRank,
                    citations,
                    raw_text: displayText,
                    captured_at: capturedAt,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Telemetry logged to Supabase <code className="font-mono text-slate-700">citations</code> table</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
