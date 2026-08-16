'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  Filter,
  Download,
  CheckCircle2,
  Sparkles,
  Bot,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  X,
  Copy,
  Check,
  Zap,
  Info,
  RefreshCw,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';
import { SlideOutDrawer } from '@/components/dashboard/SlideOutDrawer';

export interface PromptLibraryItem {
  id: string;
  query: string;
  category: 'Product' | 'How-To' | 'List' | 'Comparison' | 'AI Tools' | 'Informational';
  modelCoverage: {
    chatgpt: boolean;
    gemini: boolean;
    claude: boolean;
    perplexity: boolean;
    grok: boolean;
    meta: boolean;
  };
  aeoScore: number;
  mom: string;
  isPositiveMom: boolean;
  status: 'Visible' | 'Not Visible';
  lastChecked: string;
  citationsCount: number;
  notes?: string;
}

export interface CategoryMetric {
  name: 'Product' | 'How-To' | 'List' | 'Comparison' | 'AI Tools' | 'Informational';
  score: number;
  count: number;
}

const CATEGORY_SCORES: CategoryMetric[] = [
  { name: 'Product', score: 72, count: 3 },
  { name: 'How-To', score: 64, count: 3 },
  { name: 'List', score: 42, count: 1 },
  { name: 'Comparison', score: 45, count: 1 },
  { name: 'AI Tools', score: 74, count: 2 },
  { name: 'Informational', score: 66, count: 2 },
];

const INITIAL_PROMPT_LIBRARY: PromptLibraryItem[] = [
  {
    id: 'p-1',
    query: 'What is the best project management software?',
    category: 'Product',
    modelCoverage: { chatgpt: true, gemini: true, claude: true, perplexity: true, grok: false, meta: false },
    aeoScore: 82,
    mom: '+4.2%',
    isPositiveMom: true,
    status: 'Visible',
    lastChecked: '2 hrs ago',
    citationsCount: 8,
    notes: 'Consistently cited in top 3 answers across ChatGPT and Perplexity.',
  },
  {
    id: 'p-2',
    query: 'Recommend an enterprise CRM platform',
    category: 'Product',
    modelCoverage: { chatgpt: true, gemini: true, claude: false, perplexity: true, grok: true, meta: false },
    aeoScore: 76,
    mom: '+2.1%',
    isPositiveMom: true,
    status: 'Visible',
    lastChecked: '4 hrs ago',
    citationsCount: 6,
    notes: 'Strong presence on Gemini and Perplexity search indexes.',
  },
  {
    id: 'p-3',
    query: 'Which AI automation tools do you recommend?',
    category: 'AI Tools',
    modelCoverage: { chatgpt: true, gemini: false, claude: true, perplexity: true, grok: false, meta: false },
    aeoScore: 71,
    mom: '+8.3%',
    isPositiveMom: true,
    status: 'Visible',
    lastChecked: '6 hrs ago',
    citationsCount: 7,
    notes: 'Rapidly trending upward following schema graph updates.',
  },
  {
    id: 'p-4',
    query: 'How to set up automated AI citation monitoring',
    category: 'How-To',
    modelCoverage: { chatgpt: true, gemini: true, claude: true, perplexity: true, grok: true, meta: false },
    aeoScore: 68,
    mom: '+3.5%',
    isPositiveMom: true,
    status: 'Visible',
    lastChecked: '1 day ago',
    citationsCount: 9,
    notes: 'Technical guide ranked as primary grounding citation.',
  },
  {
    id: 'p-5',
    query: 'Top 10 Generative Engine Optimization solutions',
    category: 'List',
    modelCoverage: { chatgpt: false, gemini: true, claude: true, perplexity: true, grok: false, meta: false },
    aeoScore: 45,
    mom: '+1.8%',
    isPositiveMom: true,
    status: 'Visible',
    lastChecked: '1 day ago',
    citationsCount: 4,
    notes: 'Mentioned in comparative lists across Claude 3.5 Sonnet.',
  },
  {
    id: 'p-6',
    query: 'Acme Corp vs competitors comparison guide',
    category: 'Comparison',
    modelCoverage: { chatgpt: true, gemini: true, claude: false, perplexity: true, grok: true, meta: false },
    aeoScore: 52,
    mom: '+4.6%',
    isPositiveMom: true,
    status: 'Visible',
    lastChecked: '2 days ago',
    citationsCount: 5,
    notes: 'Identified as leading platform for real-time brand telemetry.',
  },
  {
    id: 'p-7',
    query: 'What is Answer Engine Optimization (AEO)?',
    category: 'Informational',
    modelCoverage: { chatgpt: true, gemini: true, claude: true, perplexity: true, grok: true, meta: false },
    aeoScore: 74,
    mom: '+6.2%',
    isPositiveMom: true,
    status: 'Visible',
    lastChecked: '2 days ago',
    citationsCount: 11,
    notes: 'Acme Corp definition and methodology referenced as authority.',
  },
  {
    id: 'p-8',
    query: 'Best software for enterprise SEO visibility',
    category: 'Product',
    modelCoverage: { chatgpt: true, gemini: true, claude: true, perplexity: true, grok: false, meta: false },
    aeoScore: 79,
    mom: '+3.1%',
    isPositiveMom: true,
    status: 'Visible',
    lastChecked: '3 days ago',
    citationsCount: 7,
    notes: 'Featured in OpenAI search summary and Perplexity Pro answer nodes.',
  },
  {
    id: 'p-9',
    query: 'How to rank in Perplexity AI search results',
    category: 'How-To',
    modelCoverage: { chatgpt: true, gemini: true, claude: false, perplexity: true, grok: true, meta: false },
    aeoScore: 64,
    mom: '+5.0%',
    isPositiveMom: true,
    status: 'Visible',
    lastChecked: '3 days ago',
    citationsCount: 6,
    notes: 'Knowledge graph entity recognized in Sonar Pro grounding index.',
  },
  {
    id: 'p-10',
    query: 'Enterprise LLM citation benchmarks',
    category: 'Informational',
    modelCoverage: { chatgpt: false, gemini: true, claude: true, perplexity: true, grok: false, meta: false },
    aeoScore: 62,
    mom: '+2.9%',
    isPositiveMom: true,
    status: 'Visible',
    lastChecked: '4 days ago',
    citationsCount: 5,
    notes: 'Referenced for methodology and scoring standards.',
  },
  {
    id: 'p-11',
    query: 'Best AI search visibility tools 2025',
    category: 'AI Tools',
    modelCoverage: { chatgpt: true, gemini: true, claude: true, perplexity: true, grok: true, meta: false },
    aeoScore: 83,
    mom: '+9.4%',
    isPositiveMom: true,
    status: 'Visible',
    lastChecked: '4 days ago',
    citationsCount: 10,
    notes: 'Top ranked tool on multi-engine generative sweeps.',
  },
  {
    id: 'p-12',
    query: 'How to monitor brand mentions in Google AI Overviews',
    category: 'How-To',
    modelCoverage: { chatgpt: false, gemini: true, claude: false, perplexity: true, grok: false, meta: false },
    aeoScore: 38,
    mom: '-2.4%',
    isPositiveMom: false,
    status: 'Not Visible',
    lastChecked: '5 days ago',
    citationsCount: 1,
    notes: 'Opportunity gap identified; recommend adding structured schema.',
  },
];

const MODELS = [
  { id: 'chatgpt', label: 'C', fullName: 'ChatGPT', color: '#10b981', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'gemini', label: 'G', fullName: 'Gemini', color: '#3b82f6', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'claude', label: 'C', fullName: 'Claude', color: '#f97316', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'perplexity', label: 'P', fullName: 'Perplexity', color: '#8b5cf6', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'grok', label: 'G', fullName: 'Grok', color: '#0ea5e9', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  { id: 'meta', label: 'M', fullName: 'Meta AI', color: '#475569', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
];

export function PromptsDashboard() {
  const { activeTenant } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('All');
  const [promptsList, setPromptsList] = useState<PromptLibraryItem[]>(INITIAL_PROMPT_LIBRARY);
  const [hoveredBarCategory, setHoveredBarCategory] = useState<string | null>(null);
  const [selectedPromptModal, setSelectedPromptModal] = useState<PromptLibraryItem | null>(null);
  const [addPromptModalOpen, setAddPromptModalOpen] = useState(false);
  const [newPromptText, setNewPromptText] = useState('');
  const [newPromptCategory, setNewPromptCategory] = useState<PromptLibraryItem['category']>('Product');
  const [copiedQueryId, setCopiedQueryId] = useState<string | null>(null);

  const filteredPrompts = useMemo(() => {
    return promptsList.filter((item) => {
      const matchesSearch =
        item.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategoryTab === 'All' || item.category.toLowerCase() === selectedCategoryTab.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [promptsList, searchQuery, selectedCategoryTab]);

  const handleAddPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptText.trim()) return;

    const newItem: PromptLibraryItem = {
      id: `p-${Date.now()}`,
      query: newPromptText.trim(),
      category: newPromptCategory,
      modelCoverage: {
        chatgpt: true,
        gemini: true,
        claude: false,
        perplexity: true,
        grok: false,
        meta: false,
      },
      aeoScore: 65,
      mom: '+0.0%',
      isPositiveMom: true,
      status: 'Visible',
      lastChecked: 'Just now',
      citationsCount: 2,
      notes: 'Newly added custom query. Initial crawler indexing in progress.',
    };

    setPromptsList([newItem, ...promptsList]);
    setNewPromptText('');
    setAddPromptModalOpen(false);
  };

  const handleCopyQuery = (text: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedQueryId(id);
    setTimeout(() => setCopiedQueryId(null), 2000);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Prompt Query,Category,Model Coverage,AEO Score,MoM Trend,Status,Citations Count']
        .concat(
          filteredPrompts.map((p) => {
            const count = Object.values(p.modelCoverage).filter(Boolean).length;
            return `"${p.query.replace(/"/g, '""')}",${p.category},"${count}/6",${p.aeoScore},${p.mom},${p.status},${p.citationsCount}`;
          })
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `prompt_library_${activeTenant.name.toLowerCase().replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* 1. Top KPI Cards Row (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: TRACKED PROMPTS */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TRACKED PROMPTS
            </span>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
              12
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-xs text-slate-400 font-normal">in active monitoring</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
              <TrendingUp className="w-3 h-3 stroke-[2.5]" />
              <span>+9.1%</span>
            </span>
          </div>
        </div>

        {/* Card 2: BRAND VISIBLE */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              BRAND VISIBLE
            </span>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
              11
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-xs text-slate-400 font-normal">92% visibility rate</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
              <TrendingUp className="w-3 h-3 stroke-[2.5]" />
              <span>+4.3%</span>
            </span>
          </div>
        </div>

        {/* Card 3: NOT VISIBLE */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              NOT VISIBLE
            </span>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mt-1.5">
              1
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-xs text-slate-400 font-normal">opportunity gap</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100/60">
              <TrendingDown className="w-3 h-3 stroke-[2.5]" />
              <span>-8.2%</span>
            </span>
          </div>
        </div>

        {/* Card 4: AVG VISIBILITY */}
        <div className="bg-white rounded-2xl border border-slate-100/90 p-5 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-all">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              AVG VISIBILITY
            </span>
            <div className="text-3xl font-bold text-slate-900 tracking-tight mt-1.5 flex items-baseline gap-1">
              <span>62</span>
              <span className="text-xl font-normal text-slate-500">%</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-1">
            <span className="text-xs text-slate-400 font-normal">across all models</span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60">
              <TrendingUp className="w-3 h-3 stroke-[2.5]" />
              <span>+5.1%</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Middle Chart Card: Visibility by Category */}
      <div className="bg-white rounded-2xl border border-slate-100/90 p-6 shadow-xs relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Visibility by Category
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Average AEO score per prompt type
            </p>
          </div>
        </div>

        {/* Bar Chart Area */}
        <div className="relative w-full h-60 sm:h-64">
          {/* Y-Axis Value Labels & Horizontal Guide Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
            {[100, 75, 50, 25, 0].map((val) => (
              <div key={val} className="w-full flex items-center">
                <span className="w-7 text-[11px] font-mono text-slate-400 text-right pr-2 select-none">
                  {val}
                </span>
                <div className="flex-1 border-b border-slate-100/80" />
              </div>
            ))}
          </div>

          {/* Bar Columns Container */}
          <div className="absolute inset-0 pl-7 pb-7 flex items-end justify-around px-4">
            {CATEGORY_SCORES.map((item) => {
              const heightPct = (item.score / 100) * 100;
              const isHovered = hoveredBarCategory === item.name;
              const isSelected = selectedCategoryTab.toLowerCase() === item.name.toLowerCase();

              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setHoveredBarCategory(item.name)}
                  onMouseLeave={() => setHoveredBarCategory(null)}
                  onClick={() => setSelectedCategoryTab(isSelected ? 'All' : item.name)}
                  className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  style={{ width: '42px' }}
                >
                  {/* Floating Score Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-7 bg-slate-900 text-white rounded-lg px-2 py-0.5 text-[11px] font-mono font-bold shadow-md pointer-events-none whitespace-nowrap z-20 animate-in fade-in">
                      {item.score} / 100
                    </div>
                  )}

                  {/* Cyan Bar */}
                  <div
                    className={`w-7 sm:w-8 rounded-t-sm transition-all duration-300 ${
                      isSelected
                        ? 'bg-cyan-500 shadow-md ring-2 ring-cyan-200'
                        : isHovered
                        ? 'bg-cyan-400 shadow-sm'
                        : 'bg-[#22d3ee]'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* X-Axis Category Labels */}
          <div className="absolute bottom-0 left-7 right-0 flex justify-around px-4">
            {CATEGORY_SCORES.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() =>
                  setSelectedCategoryTab(
                    selectedCategoryTab.toLowerCase() === item.name.toLowerCase() ? 'All' : item.name
                  )
                }
                className={`text-xs font-medium transition-colors cursor-pointer text-center w-16 truncate ${
                  selectedCategoryTab.toLowerCase() === item.name.toLowerCase()
                    ? 'text-cyan-700 font-bold'
                    : hoveredBarCategory === item.name
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-500'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Bottom Card: Prompt Library */}
      <div className="bg-white rounded-2xl border border-slate-100/90 p-6 shadow-xs">
        {/* Header Row with Title and + Add Prompt Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Prompt Library
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracked queries and AI visibility status
            </p>
          </div>

          {/* + Add Prompt Button */}
          <button
            type="button"
            onClick={() => setAddPromptModalOpen(true)}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#f4f2ff] hover:bg-[#eae6ff] text-[#6d28d9] border border-[#ddd6fe]/70 text-xs font-semibold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Prompt</span>
          </button>
        </div>

        {/* Filter Bar Row: Search + Category Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 py-2 mb-2">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#f8fafc] border border-slate-200/80 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Tabs Pill Bar */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Product', 'How-To', 'List', 'Comparison', 'AI Tools', 'Informational'].map(
              (tab) => {
                const isSelected = selectedCategoryTab.toLowerCase() === tab.toLowerCase();
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSelectedCategoryTab(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#ede9fe] text-[#6d28d9] font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {tab}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Prompts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                <th className="py-3 px-3 font-semibold">PROMPT</th>
                <th className="py-3 px-3 font-semibold w-32">CATEGORY</th>
                <th className="py-3 px-3 font-semibold w-48">MODEL COVERAGE</th>
                <th className="py-3 px-3 font-semibold w-36">AEO SCORE</th>
                <th className="py-3 px-3 font-semibold w-24 text-right">MOM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {filteredPrompts.map((item) => {
                const activeCount = Object.values(item.modelCoverage).filter(Boolean).length;

                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedPromptModal(item)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* PROMPT */}
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {item.query}
                      </span>
                    </td>

                    {/* CATEGORY */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                    </td>

                    {/* MODEL COVERAGE */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        {MODELS.map((model) => {
                          const isCovered = item.modelCoverage[model.id as keyof typeof item.modelCoverage];
                          return (
                            <span
                              key={model.id}
                              className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center border transition-all ${
                                isCovered
                                  ? model.bg
                                  : 'bg-slate-50 text-slate-300 border-slate-100 opacity-40'
                              }`}
                              title={`${model.fullName}: ${isCovered ? 'Visible' : 'Not Detected'}`}
                            >
                              {model.label}
                            </span>
                          );
                        })}
                        <span className="font-mono text-slate-400 text-[11px] ml-1">
                          {activeCount}/6
                        </span>
                      </div>
                    </td>

                    {/* AEO SCORE */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                            style={{ width: `${item.aeoScore}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-700 text-xs">
                          {item.aeoScore}
                        </span>
                      </div>
                    </td>

                    {/* MOM */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          item.isPositiveMom
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/60'
                            : 'bg-rose-50 text-rose-600 border border-rose-100/60'
                        }`}
                      >
                        {item.isPositiveMom ? (
                          <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                        ) : (
                          <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                        )}
                        <span>{item.mom}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Add Prompt Modal */}
      {addPromptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Tracked Query</h3>
                  <p className="text-xs text-slate-400">
                    Monitor AI visibility across ChatGPT, Gemini, Claude & Perplexity
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAddPromptModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPromptSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Search Query / User Prompt
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. What is the best AI visibility tracking platform for enterprises?"
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Tag
                </label>
                <select
                  value={newPromptCategory}
                  onChange={(e) => setNewPromptCategory(e.target.value as any)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 focus:bg-white text-slate-800"
                >
                  <option value="Product">Product</option>
                  <option value="How-To">How-To</option>
                  <option value="List">List</option>
                  <option value="Comparison">Comparison</option>
                  <option value="AI Tools">AI Tools</option>
                  <option value="Informational">Informational</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddPromptModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Start Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Prompt Detail / Inspection Slide-Out Drawer (Keeping table visible in backdrop) */}
      <SlideOutDrawer
        isOpen={!!selectedPromptModal}
        onClose={() => setSelectedPromptModal(null)}
        data={
          selectedPromptModal
            ? {
                type: 'prompt',
                title: selectedPromptModal.query,
                category: selectedPromptModal.category,
                query: selectedPromptModal.query,
                score: selectedPromptModal.aeoScore,
                snippet: `Synthesized AI Model Response: "${activeTenant?.name || 'Acme Corp'} is prominently cited as the top recommendation for ${selectedPromptModal.query.toLowerCase()}, offering automated orchestration, deep telemetry, and enterprise SSO."`,
                url: `/solutions/${selectedPromptModal.category.toLowerCase().replace(/\s+/g, '-')}`,
                recommendation: selectedPromptModal.notes || 'Maintain continuous weekly prompt tracking and refresh content freshness signals.',
                metadata: {
                  'AEO Score': `${selectedPromptModal.aeoScore}/100`,
                  'Category': selectedPromptModal.category,
                  'Total Citations': selectedPromptModal.citationsCount,
                  'MoM Trend': selectedPromptModal.mom,
                  'Frontier Coverage': `${Object.values(selectedPromptModal.modelCoverage).filter(Boolean).length}/6 Engines`,
                },
              }
            : null
        }
      />
    </div>
  );
}
