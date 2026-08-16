'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ExternalLink,
  ArrowUpRight,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  Sparkles,
  Info,
  Calendar,
  X,
  ChevronDown,
  Globe2,
  Share2,
  Layers,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

export interface CitationItem {
  id: string;
  query: string;
  model: 'ChatGPT' | 'Gemini' | 'Claude' | 'Perplexity' | 'Grok' | 'Meta AI';
  modelColor: string;
  type: 'Direct' | 'Contextual' | 'Competitor Mention';
  pageReferenced: string;
  fullUrl: string;
  date: string;
  rawDate: string;
  domain: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  authorityScore: number;
  snippet: string;
}

export interface ModelVolumeData {
  month: string;
  chatgpt: number;
  gemini: number;
  claude: number;
  perplexity: number;
  grok: number;
  meta: number;
}

// 6-Month Stacked Volume Data (Mar to Aug)
const MONTHLY_VOLUME: ModelVolumeData[] = [
  { month: 'Mar', meta: 22, grok: 18, perplexity: 25, claude: 20, gemini: 45, chatgpt: 50 },
  { month: 'Apr', meta: 25, grok: 22, perplexity: 32, claude: 26, gemini: 55, chatgpt: 68 },
  { month: 'May', meta: 30, grok: 26, perplexity: 42, claude: 35, gemini: 66, chatgpt: 88 },
  { month: 'Jun', meta: 36, grok: 32, perplexity: 52, claude: 44, gemini: 78, chatgpt: 104 },
  { month: 'Jul', meta: 42, grok: 38, perplexity: 62, claude: 52, gemini: 90, chatgpt: 118 },
  { month: 'Aug', meta: 48, grok: 44, perplexity: 72, claude: 60, gemini: 98, chatgpt: 130 },
];

const MODEL_CONFIGS = [
  { id: 'chatgpt', name: 'ChatGPT', color: '#10b981', dotBg: 'bg-[#10b981]', stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.08)' },
  { id: 'gemini', name: 'Gemini', color: '#3b82f6', dotBg: 'bg-[#3b82f6]', stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.08)' },
  { id: 'claude', name: 'Claude', color: '#f97316', dotBg: 'bg-[#f97316]', stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.08)' },
  { id: 'perplexity', name: 'Perplexity', color: '#8b5cf6', dotBg: 'bg-[#8b5cf6]', stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.08)' },
  { id: 'grok', name: 'Grok', color: '#0ea5e9', dotBg: 'bg-[#0ea5e9]', stroke: '#0ea5e9', fill: 'rgba(14, 165, 233, 0.08)' },
  { id: 'meta', name: 'Meta AI', color: '#475569', dotBg: 'bg-[#475569]', stroke: '#475569', fill: '#475569' },
];

const INITIAL_CITATIONS: CitationItem[] = [
  {
    id: 'cit-1',
    query: "What's the best project management tool?",
    model: 'ChatGPT',
    modelColor: '#10b981',
    type: 'Direct',
    pageReferenced: '/solutions/enterprise',
    fullUrl: 'https://acmecorp.com/solutions/enterprise',
    date: 'Aug 15',
    rawDate: '2025-08-15',
    domain: 'acmecorp.com',
    sentiment: 'positive',
    authorityScore: 94,
    snippet: 'For enterprise workflows, Acme Corp provides automated project tracking, generative task triage, and high-visibility roadmaps tailored for agile engineering groups.',
  },
  {
    id: 'cit-2',
    query: 'Recommend AI automation software',
    model: 'Perplexity',
    modelColor: '#8b5cf6',
    type: 'Direct',
    pageReferenced: '/features/ai-automation',
    fullUrl: 'https://acmecorp.com/features/ai-automation',
    date: 'Aug 15',
    rawDate: '2025-08-15',
    domain: 'acmecorp.com',
    sentiment: 'positive',
    authorityScore: 91,
    snippet: 'Acme Corp is widely recommended for AI workflow automation and generative telemetry monitoring across enterprise tech stacks.',
  },
  {
    id: 'cit-3',
    query: 'Enterprise SEO automation tools comparison',
    model: 'Gemini',
    modelColor: '#3b82f6',
    type: 'Direct',
    pageReferenced: '/features/ai-visibility',
    fullUrl: 'https://acmecorp.com/features/ai-visibility',
    date: 'Aug 14',
    rawDate: '2025-08-14',
    domain: 'acmecorp.com',
    sentiment: 'positive',
    authorityScore: 89,
    snippet: 'According to industry benchmarks, Acme Corp scores highest in real-time generative engine crawl extraction and continuous answer engine optimization.',
  },
  {
    id: 'cit-4',
    query: 'Top generative engine optimization software',
    model: 'Claude',
    modelColor: '#f97316',
    type: 'Direct',
    pageReferenced: '/solutions/geo-optimization',
    fullUrl: 'https://acmecorp.com/solutions/geo-optimization',
    date: 'Aug 14',
    rawDate: '2025-08-14',
    domain: 'acmecorp.com',
    sentiment: 'positive',
    authorityScore: 92,
    snippet: 'Acme Corp leads GEO tracking with comprehensive entity graph auditing and automated AI citation monitoring.',
  },
  {
    id: 'cit-5',
    query: 'Real-time brand perception analytics in LLMs',
    model: 'Grok',
    modelColor: '#0ea5e9',
    type: 'Direct',
    pageReferenced: '/case-studies/enterprise',
    fullUrl: 'https://acmecorp.com/case-studies/enterprise',
    date: 'Aug 13',
    rawDate: '2025-08-13',
    domain: 'acmecorp.com',
    sentiment: 'positive',
    authorityScore: 88,
    snippet: 'Acme Corp enables digital marketing and data teams to track brand sentiment and exact citation placements in real-time across Grok and other frontier models.',
  },
  {
    id: 'cit-6',
    query: 'How does Acme Corp rank for enterprise intelligence?',
    model: 'Meta AI',
    modelColor: '#475569',
    type: 'Direct',
    pageReferenced: '/pricing',
    fullUrl: 'https://acmecorp.com/pricing',
    date: 'Aug 13',
    rawDate: '2025-08-13',
    domain: 'acmecorp.com',
    sentiment: 'positive',
    authorityScore: 85,
    snippet: 'Acme Corp delivers full-funnel AI visibility telemetry, scoring high in prompt share-of-voice and reference grounding across modern AI engines.',
  },
  {
    id: 'cit-7',
    query: 'Best tools to monitor ChatGPT citations',
    model: 'ChatGPT',
    modelColor: '#10b981',
    type: 'Direct',
    pageReferenced: '/solutions/aeo-citations',
    fullUrl: 'https://acmecorp.com/solutions/aeo-citations',
    date: 'Aug 12',
    rawDate: '2025-08-12',
    domain: 'acmecorp.com',
    sentiment: 'positive',
    authorityScore: 95,
    snippet: 'Acme Corp provides automated daily tracking of ChatGPT search citations and ordinal reference positioning.',
  },
  {
    id: 'cit-8',
    query: 'How to optimize content for Perplexity search',
    model: 'Perplexity',
    modelColor: '#8b5cf6',
    type: 'Direct',
    pageReferenced: '/docs/citation-grounding',
    fullUrl: 'https://acmecorp.com/docs/citation-grounding',
    date: 'Aug 12',
    rawDate: '2025-08-12',
    domain: 'acmecorp.com',
    sentiment: 'positive',
    authorityScore: 90,
    snippet: 'Perplexity indexes structured markdown and schema-rich domain sources, where Acme Corp maintains verified authority nodes.',
  },
];

export function CitationsDashboard() {
  const {
    activeTenant,
    selectedModel,
    toggleSelectedModel,
    selectedCompetitor,
    toggleSelectedCompetitor,
    isFilterActive,
    clearFilters,
  } = useDashboard();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('7d');
  const [timeframeDropdownOpen, setTimeframeDropdownOpen] = useState(false);
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCitationModal, setSelectedCitationModal] = useState<CitationItem | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);

  // Model matching helper
  const isCitationModelSelected = (modelName: string) => {
    if (!selectedModel) return true;
    const target = selectedModel.toLowerCase();
    const cur = modelName.toLowerCase();
    if (target === cur) return true;
    if (target === 'gpt' && cur.includes('chatgpt')) return true;
    if (target === 'gem' && cur.includes('gemini')) return true;
    if (target === 'cld' && cur.includes('claude')) return true;
    if (target === 'ppx' && cur.includes('perplexity')) return true;
    if (target === 'grk' && cur.includes('grok')) return true;
    if (target === 'mta' && (cur.includes('meta') || cur.includes('llama'))) return true;
    return false;
  };

  // Competitor matching helper
  const isCitationCompetitorSelected = (item: CitationItem) => {
    if (!selectedCompetitor) return true;
    const target = selectedCompetitor.toLowerCase();
    return (
      item.query.toLowerCase().includes(target) ||
      item.snippet.toLowerCase().includes(target) ||
      item.pageReferenced.toLowerCase().includes(target) ||
      (target.includes('acme') && item.domain.includes('acme'))
    );
  };

  // Filter citations based on search, selected model filter and global filter
  const filteredCitations = useMemo(() => {
    return INITIAL_CITATIONS.filter((item) => {
      const matchesSearch =
        item.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pageReferenced.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.model.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLocalModel =
        selectedModelFilter === 'all' || item.model.toLowerCase() === selectedModelFilter.toLowerCase();

      return matchesSearch && matchesLocalModel;
    });
  }, [searchQuery, selectedModelFilter]);

  const handleCopyUrl = (url: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Query,Model,Type,Page Referenced,Date,Authority Score,Sentiment']
        .concat(
          filteredCitations.map(
            (c) =>
              `"${c.query.replace(/"/g, '""')}",${c.model},${c.type},"${c.pageReferenced}",${c.date},${c.authorityScore},${c.sentiment}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `citations_audit_${activeTenant.name.toLowerCase().replace(/\s+/g, '-')}_2025.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stacked chart calculations
  // Chart dimensions in SVG viewBox coordinate space: 0 0 1000 240
  // Y-axis range: 0 to 340 (height 200, padding top 20, bottom 20 -> y = 220 - (val / 340) * 190)
  // X-axis: 6 months distributed from x = 40 to x = 960
  const chartPoints = useMemo(() => {
    const totalPoints = MONTHLY_VOLUME.length;
    const xStep = (960 - 40) / (totalPoints - 1);

    return MONTHLY_VOLUME.map((data, i) => {
      const x = 40 + i * xStep;
      
      // Cumulative stacks from bottom to top:
      const metaTop = data.meta;
      const grokTop = metaTop + data.grok;
      const perpTop = grokTop + data.perplexity;
      const claudeTop = perpTop + data.claude;
      const geminiTop = claudeTop + data.gemini;
      const chatgptTop = geminiTop + data.chatgpt; // Total volume (e.g. 352 in Aug)

      const scaleY = (val: number) => 215 - (val / 350) * 185;

      return {
        month: data.month,
        x,
        raw: data,
        total: chatgptTop,
        yMeta: scaleY(metaTop),
        yGrok: scaleY(grokTop),
        yPerp: scaleY(perpTop),
        yClaude: scaleY(claudeTop),
        yGemini: scaleY(geminiTop),
        yChatgpt: scaleY(chatgptTop),
        yZero: scaleY(0),
      };
    });
  }, []);

  // Generate SVG path for a line through points
  const generateLinePath = (yKey: 'yChatgpt' | 'yGemini' | 'yClaude' | 'yPerp' | 'yGrok' | 'yMeta') => {
    return chartPoints.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x},${pt[yKey]}`;
      const prev = chartPoints[idx - 1];
      const cx1 = prev.x + (pt.x - prev.x) * 0.5;
      const cx2 = prev.x + (pt.x - prev.x) * 0.5;
      return `${acc} C ${cx1},${prev[yKey]} ${cx2},${pt[yKey]} ${pt.x},${pt[yKey]}`;
    }, '');
  };

  // Generate SVG path for an area fill between top line and bottom line
  const generateAreaPath = (
    topKey: 'yChatgpt' | 'yGemini' | 'yClaude' | 'yPerp' | 'yGrok' | 'yMeta',
    botKey: 'yGemini' | 'yClaude' | 'yPerp' | 'yGrok' | 'yMeta' | 'yZero'
  ) => {
    const topForward = chartPoints.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x},${pt[topKey]}`;
      const prev = chartPoints[idx - 1];
      const cx1 = prev.x + (pt.x - prev.x) * 0.5;
      const cx2 = prev.x + (pt.x - prev.x) * 0.5;
      return `${acc} C ${cx1},${prev[topKey]} ${cx2},${pt[topKey]} ${pt.x},${pt[topKey]}`;
    }, '');

    // Traverse bottom points in reverse
    const reversed = [...chartPoints].reverse();
    const botReverse = reversed.reduce((acc, pt, idx) => {
      if (idx === 0) return `L ${pt.x},${pt[botKey]}`;
      const prev = reversed[idx - 1];
      const cx1 = prev.x - (prev.x - pt.x) * 0.5;
      const cx2 = prev.x - (prev.x - pt.x) * 0.5;
      return `${acc} C ${cx1},${prev[botKey]} ${cx2},${pt[botKey]} ${pt.x},${pt[botKey]}`;
    }, '');

    return `${topForward} ${botReverse} Z`;
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* 1. Top KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: TOTAL CITATIONS */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOTAL CITATIONS
            </span>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
              2,847
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-xs text-slate-400 font-normal">all-time tracked</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
              <TrendingUp className="w-3 h-3 stroke-[2.5]" />
              <span>+23.4%</span>
            </span>
          </div>
        </div>

        {/* Card 2: THIS MONTH */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              THIS MONTH
            </span>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
              412
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-xs text-slate-400 font-normal">August 2025</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
              <TrendingUp className="w-3 h-3 stroke-[2.5]" />
              <span>+8.2%</span>
            </span>
          </div>
        </div>

        {/* Card 3: DAILY AVERAGE */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              DAILY AVERAGE
            </span>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
              45
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-xs text-slate-400 font-normal">citations per day</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
              <TrendingUp className="w-3 h-3 stroke-[2.5]" />
              <span>+5.1%</span>
            </span>
          </div>
        </div>

        {/* Card 4: TOP MODEL */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TOP MODEL
            </span>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
              ChatGPT
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-xs text-slate-400 font-normal">
              1,204 citations — 42% share
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Chart Card: Citation Volume by Model */}
      <div className="bg-white rounded-2xl border border-slate-100/90 p-6 shadow-xs relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Citation Volume by Model
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Monthly brand mentions across AI platforms
            </p>
          </div>
          {/* Model Legend */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-xs text-slate-600">
            {MODEL_CONFIGS.map((item) => {
              const isSelected = isCitationModelSelected(item.name);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleSelectedModel(item.name)}
                  className={`flex items-center space-x-1.5 transition-all duration-300 cursor-pointer ${
                    !isSelected
                      ? 'opacity-30'
                      : selectedModel && isSelected
                      ? 'opacity-100 font-bold scale-105'
                      : 'opacity-100 font-medium'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${item.dotBg}`} />
                  <span className="text-slate-700">{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stacked Area SVG Chart */}
        <div className="relative w-full h-64 sm:h-72">
          {/* Y-Axis Value Labels & Horizontal Guide Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
            {[340, 255, 170, 85, 0].map((val) => (
              <div key={val} className="w-full flex items-center">
                <span className="w-7 text-[11px] font-mono text-slate-400 text-right pr-2 select-none">
                  {val}
                </span>
                <div className="flex-1 border-b border-slate-100/80" />
              </div>
            ))}
          </div>

          {/* Responsive SVG Graphic */}
          <svg
            className="w-full h-[calc(100%-28px)] overflow-visible pl-7"
            viewBox="0 0 1000 240"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chatgpt-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
              </linearGradient>
              <linearGradient id="gemini-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.03" />
              </linearGradient>
              <linearGradient id="claude-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0.03" />
              </linearGradient>
              <linearGradient id="perp-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.03" />
              </linearGradient>
              <linearGradient id="grok-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.03" />
              </linearGradient>
            </defs>

            {/* Layer 1 (Bottom): Meta AI Base Solid Layer */}
            <g
              className="cursor-pointer transition-opacity duration-300"
              style={{ opacity: isCitationModelSelected('Meta AI') ? 1.0 : 0.2 }}
              onClick={() => toggleSelectedModel('Meta AI')}
            >
              <path
                d={generateAreaPath('yMeta', 'yZero')}
                fill="#475569"
                opacity="0.88"
              />
              <path
                d={generateLinePath('yMeta')}
                fill="none"
                stroke="#334155"
                strokeWidth="1.5"
              />
            </g>

            {/* Layer 2: Grok Area */}
            <g
              className="cursor-pointer transition-opacity duration-300"
              style={{ opacity: isCitationModelSelected('Grok') ? 1.0 : 0.2 }}
              onClick={() => toggleSelectedModel('Grok')}
            >
              <path
                d={generateAreaPath('yGrok', 'yMeta')}
                fill="url(#grok-grad)"
              />
              <path
                d={generateLinePath('yGrok')}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth="1.8"
              />
            </g>

            {/* Layer 3: Perplexity Area */}
            <g
              className="cursor-pointer transition-opacity duration-300"
              style={{ opacity: isCitationModelSelected('Perplexity') ? 1.0 : 0.2 }}
              onClick={() => toggleSelectedModel('Perplexity')}
            >
              <path
                d={generateAreaPath('yPerp', 'yGrok')}
                fill="url(#perp-grad)"
              />
              <path
                d={generateLinePath('yPerp')}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="1.8"
              />
            </g>

            {/* Layer 4: Claude Area */}
            <g
              className="cursor-pointer transition-opacity duration-300"
              style={{ opacity: isCitationModelSelected('Claude') ? 1.0 : 0.2 }}
              onClick={() => toggleSelectedModel('Claude')}
            >
              <path
                d={generateAreaPath('yClaude', 'yPerp')}
                fill="url(#claude-grad)"
              />
              <path
                d={generateLinePath('yClaude')}
                fill="none"
                stroke="#f97316"
                strokeWidth="1.8"
              />
            </g>

            {/* Layer 5: Gemini Area */}
            <g
              className="cursor-pointer transition-opacity duration-300"
              style={{ opacity: isCitationModelSelected('Gemini') ? 1.0 : 0.2 }}
              onClick={() => toggleSelectedModel('Gemini')}
            >
              <path
                d={generateAreaPath('yGemini', 'yClaude')}
                fill="url(#gemini-grad)"
              />
              <path
                d={generateLinePath('yGemini')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
            </g>

            {/* Layer 6 (Top): ChatGPT Area */}
            <g
              className="cursor-pointer transition-opacity duration-300"
              style={{ opacity: isCitationModelSelected('ChatGPT') ? 1.0 : 0.2 }}
              onClick={() => toggleSelectedModel('ChatGPT')}
            >
              <path
                d={generateAreaPath('yChatgpt', 'yGemini')}
                fill="url(#chatgpt-grad)"
              />
              <path
                d={generateLinePath('yChatgpt')}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.2"
              />
            </g>

            {/* Hover guideline and active dots */}
            {hoveredMonthIndex !== null && chartPoints[hoveredMonthIndex] && (
              <g>
                <line
                  x1={chartPoints[hoveredMonthIndex].x}
                  y1={20}
                  x2={chartPoints[hoveredMonthIndex].x}
                  y2={215}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth="1.5"
                />
                <circle
                  cx={chartPoints[hoveredMonthIndex].x}
                  cy={chartPoints[hoveredMonthIndex].yChatgpt}
                  r="4"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <circle
                  cx={chartPoints[hoveredMonthIndex].x}
                  cy={chartPoints[hoveredMonthIndex].yGemini}
                  r="4"
                  fill="#3b82f6"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <circle
                  cx={chartPoints[hoveredMonthIndex].x}
                  cy={chartPoints[hoveredMonthIndex].yPerp}
                  r="4"
                  fill="#8b5cf6"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>

          {/* Interactive Mouse Hover Overlay Columns for Tooltip */}
          <div className="absolute inset-0 pl-7 pb-7 flex">
            {chartPoints.map((pt, idx) => (
              <div
                key={pt.month}
                onMouseEnter={() => setHoveredMonthIndex(idx)}
                onMouseLeave={() => setHoveredMonthIndex(null)}
                className="flex-1 h-full cursor-pointer relative"
              >
                {/* Floating Tooltip */}
                {hoveredMonthIndex === idx && (
                  <div
                    className={`absolute z-30 -top-2 bg-slate-900 text-white rounded-xl shadow-xl p-3 text-xs w-48 pointer-events-none transform -translate-y-full ${
                      idx > 3 ? '-translate-x-36' : idx < 2 ? 'translate-x-2' : '-translate-x-1/2'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-2">
                      <span className="font-bold text-slate-100">{pt.month} 2025 Citations</span>
                      <span className="font-mono text-emerald-400 font-bold">{pt.total}</span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                          ChatGPT
                        </span>
                        <span className="font-mono text-slate-200">{pt.raw.chatgpt}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                          Gemini
                        </span>
                        <span className="font-mono text-slate-200">{pt.raw.gemini}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
                          Claude
                        </span>
                        <span className="font-mono text-slate-200">{pt.raw.claude}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
                          Perplexity
                        </span>
                        <span className="font-mono text-slate-200">{pt.raw.perplexity}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9]" />
                          Grok
                        </span>
                        <span className="font-mono text-slate-200">{pt.raw.grok}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#475569]" />
                          Meta AI
                        </span>
                        <span className="font-mono text-slate-200">{pt.raw.meta}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* X-Axis Month Labels */}
          <div className="absolute bottom-0 left-7 right-0 flex justify-between px-2">
            {MONTHLY_VOLUME.map((item, idx) => (
              <span
                key={item.month}
                className={`text-xs font-medium transition-colors ${
                  hoveredMonthIndex === idx ? 'text-indigo-600 font-bold' : 'text-slate-400'
                }`}
              >
                {item.month}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bottom Table Card: Recent Citations */}
      <div className="bg-white rounded-2xl border border-slate-100/90 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Recent Citations
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest brand mentions detected across AI models
            </p>
          </div>

          {/* Right Controls: Time Range Dropdown, Search, CSV Export */}
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative hidden md:block w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter citations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Timeframe Selector Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setTimeframeDropdownOpen(!timeframeDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              >
                <span>
                  {selectedTimeframe === '7d'
                    ? 'Last 7 days'
                    : selectedTimeframe === '30d'
                    ? 'Last 30 days'
                    : selectedTimeframe === '90d'
                    ? 'Last 90 days'
                    : 'All time'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {timeframeDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1 space-y-0.5 animate-in fade-in slide-in-from-top-1">
                  {[
                    { id: '7d', label: 'Last 7 days' },
                    { id: '30d', label: 'Last 30 days' },
                    { id: '90d', label: 'Last 90 days' },
                    { id: 'all', label: 'All time' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedTimeframe(opt.id as any);
                        setTimeframeDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        selectedTimeframe === opt.id
                          ? 'bg-slate-100 font-bold text-slate-900'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CSV Export Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="p-1.5 rounded-lg border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              title="Download Citations CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                <th className="py-3 px-3 font-semibold">QUERY</th>
                <th className="py-3 px-3 font-semibold w-36">MODEL</th>
                <th className="py-3 px-3 font-semibold w-24">TYPE</th>
                <th className="py-3 px-3 font-semibold w-72">PAGE REFERENCED</th>
                <th className="py-3 px-3 font-semibold w-24 text-right">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {filteredCitations.map((item) => {
                const isRowActive = isCitationModelSelected(item.model) && isCitationCompetitorSelected(item);

                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedCitationModal(item)}
                    className={`transition-all duration-300 cursor-pointer group ${
                      isRowActive ? 'opacity-100 hover:bg-slate-50/70' : 'opacity-30 hover:opacity-90'
                    }`}
                  >
                    {/* QUERY */}
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {item.query}
                      </span>
                    </td>

                    {/* MODEL */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div
                        className="flex items-center space-x-2 p-1 -m-1 rounded-md hover:bg-slate-100/70 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectedModel(item.model);
                        }}
                        title={`Filter by ${item.model}`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.modelColor }}
                        />
                        <span className="font-medium text-slate-800 hover:text-indigo-600">
                          {item.model}
                        </span>
                      </div>
                    </td>

                  {/* TYPE */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100/40">
                      {item.type}
                    </span>
                  </td>

                  {/* PAGE REFERENCED */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center space-x-1.5 text-slate-500 font-mono text-[11px] group-hover:text-slate-800 transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                      <span className="truncate max-w-[240px] sm:max-w-xs">{item.pageReferenced}</span>
                    </div>
                  </td>

                  {/* DATE */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap font-normal text-slate-400">
                    {item.date}
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </div>

      {/* 4. Citation Context & Deep Grounding Inspector Modal */}
      {selectedCitationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-xs"
                  style={{ backgroundColor: selectedCitationModal.modelColor }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {selectedCitationModal.model} Citation Inspection
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Verified {selectedCitationModal.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Indexed on {selectedCitationModal.date}, 2025
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCitationModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Query Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Trigger Search Query
              </span>
              <p className="text-xs font-semibold text-slate-800">
                &ldquo;{selectedCitationModal.query}&rdquo;
              </p>
            </div>

            {/* Grounding Snippet & AI Response Excerpt */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Model Grounding & Citation Excerpt
              </span>
              <div className="bg-indigo-50/40 border border-indigo-100/80 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed">
                {selectedCitationModal.snippet}
              </div>
            </div>

            {/* Metadata Badges */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="border border-slate-100 rounded-xl p-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Referenced Endpoint
                </span>
                <span className="text-xs font-mono font-medium text-slate-800 truncate block mt-0.5">
                  {selectedCitationModal.pageReferenced}
                </span>
              </div>
              <div className="border border-slate-100 rounded-xl p-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Grounding Authority Score
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 block mt-0.5">
                  {selectedCitationModal.authorityScore}/100 High
                </span>
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={(e) =>
                  handleCopyUrl(
                    selectedCitationModal.fullUrl,
                    selectedCitationModal.id,
                    e
                  )
                }
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {copiedUrlId === selectedCitationModal.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied URL!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Citation Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedCitationModal(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
