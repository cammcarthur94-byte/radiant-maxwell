'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import {
  MessageSquareCode,
  Search,
  Plus,
  Play,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Filter,
  RefreshCw,
  Trash2,
  Upload,
  Download,
  CheckSquare,
  Square,
  MinusSquare,
  ArrowUpDown,
  FileSpreadsheet,
  Copy,
  ExternalLink,
  Bot,
  Layers,
  ChevronRight,
  X,
  Eye,
  FileText,
  Tag,
  Code2,
  RotateCcw,
  SlidersHorizontal,
  Wand2,
  Terminal,
  Save,
  Zap,
  Check,
} from 'lucide-react';
import { ImportPromptsModal, ImportedPromptItem } from '@/components/dashboard/ImportPromptsModal';
import { PromptOptimizerModal } from '@/components/dashboard/PromptOptimizerModal';
import { PromptRawResponseDrawer } from '@/components/dashboard/PromptRawResponseDrawer';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { exportToCsv } from '@/lib/export-csv';
import { QueryIntent } from '@/types/dashboard';
import { PromptTemplateRecord } from '@/lib/services/prompt-service';
import { PromptImprovementResult, PromptVariationSuggestion } from '@/lib/services/prompt-optimizer-service';

interface TrackedQueryItem {
  id: string;
  query: string;
  category: string;
  queryIntent: QueryIntent;
  engine: string;
  frequency: string;
  lastTracked: string;
  citationsCount: number;
  brandRank: string;
  status: string;
}

/** Helper to strictly deduplicate prompt items by trimmed, lowercase query string */
function deduplicatePrompts(items: TrackedQueryItem[]): TrackedQueryItem[] {
  const seen = new Set<string>();
  const unique: TrackedQueryItem[] = [];
  for (const item of items) {
    const cleanQuery = (item.query || '').trim();
    const normalized = cleanQuery.toLowerCase();
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      unique.push({
        ...item,
        query: cleanQuery,
      });
    }
  }
  return unique;
}

export default function PromptsPage() {
  const {
    activeTenant,
    activities,
    availableCampaigns,
    triggerTracking,
    addCampaignQuery,
    isTracking,
    isLoading,
  } = useDashboard();

  // Active top tab: Tracked search queries vs. Supabase LLM extraction prompts
  const [activeTab, setActiveTab] = useState<'queries' | 'llm_prompts'>('queries');

  // Queries list state (persisted per tenant, deduplicated, 0 mock prompts)
  const [queries, setQueries] = useState<TrackedQueryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedIntentFilter, setSelectedIntentFilter] = useState<'All' | QueryIntent>('All');

  // LLM Prompt Templates state (connected to Supabase prompts table)
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplateRecord[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);
  const [selectedTemplateForEdit, setSelectedTemplateForEdit] = useState<PromptTemplateRecord | null>(null);
  const [editPromptKey, setEditPromptKey] = useState<string>('');
  const [editPromptText, setEditPromptText] = useState<string>('');
  const [editModelTarget, setEditModelTarget] = useState<string>('gemini-1.5-flash');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('extraction');
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);
  const [templateSearchFilter, setTemplateSearchFilter] = useState<string>('');
  const [previewInterpolatedText, setPreviewInterpolatedText] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isOptimizerModalOpen, setIsOptimizerModalOpen] = useState(false);
  const [optimizerInitialQuery, setOptimizerInitialQuery] = useState('');

  // Add Modal Inline AI Recommendations State
  const [isLoadingInlineRecommendations, setIsLoadingInlineRecommendations] = useState(false);
  const [inlineRecommendations, setInlineRecommendations] = useState<PromptImprovementResult | null>(null);
  const [inlineAddedSuggestions, setInlineAddedSuggestions] = useState<Set<number>>(new Set());

  // Delete confirmation modal state
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'single' | 'bulk';
    item?: TrackedQueryItem;
  } | null>(null);
  const [selectedPromptForDrawer, setSelectedPromptForDrawer] = useState<TrackedQueryItem | null>(null);

  // Form inputs for query
  const [newQueryInput, setNewQueryInput] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('Commercial Intent');
  const [newIntentInput, setNewIntentInput] = useState<QueryIntent>('Brand');
  const [newEngineInput, setNewEngineInput] = useState('Google Gemini & Perplexity');
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'info' | 'error' | 'warning';
    text: string;
  } | null>(null);

  // Fetch Live LLM Prompt Templates from Supabase via /api/prompts
  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoadingTemplates(true);
      const res = await fetch('/api/prompts');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.prompts)) {
          setPromptTemplates(json.prompts);
        }
      }
    } catch (e) {
      console.error('Failed to fetch prompt templates from Supabase:', e);
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Load queries from localStorage (purging legacy mock data) or live campaigns
  useEffect(() => {
    try {
      const storageKey = `radiant_prompts_${activeTenant.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out legacy mock data IDs and deduplicate
          const filtered = parsed
            .filter((item: any) => item && typeof item.query === 'string' && item.query.trim())
            .map((item: any) => ({
              ...item,
              query: item.query.trim(),
              queryIntent: item.queryIntent || (item.category?.includes('Competitor') ? 'Competitor' : item.category?.includes('Product') || item.category?.includes('SaaS') ? 'Product' : 'Brand'),
            }));
          
          const uniqueItems = deduplicatePrompts(filtered);
          setQueries(uniqueItems);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read prompts from localStorage:', e);
    }

    // Initialize exclusively from live campaigns (no mock queries)
    const campaignPrompts: TrackedQueryItem[] = (availableCampaigns || [])
      .filter((c) => c.id !== 'all' && c.targetQuery && c.targetQuery.trim())
      .map((c, idx) => ({
        id: `campaign-q-${idx + 1}-${Math.random().toString(36).substring(2, 6)}`,
        query: c.targetQuery.trim(),
        category: 'Commercial Intent',
        queryIntent: 'Brand' as QueryIntent,
        engine: 'Google Gemini',
        frequency: 'Daily',
        lastTracked: 'Pending Scan',
        citationsCount: 0,
        brandRank: '-',
        status: 'Ready to Audit',
      }));

    const uniqueCampaignPrompts = deduplicatePrompts(campaignPrompts);
    setQueries(uniqueCampaignPrompts);
  }, [activeTenant.id, availableCampaigns]);

  // Persist unique queries to localStorage helper
  const saveQueries = (updated: TrackedQueryItem[]) => {
    const unique = deduplicatePrompts(updated);
    setQueries(unique);
    try {
      const storageKey = `radiant_prompts_${activeTenant.id}`;
      localStorage.setItem(storageKey, JSON.stringify(unique));
    } catch (e) {
      console.warn('Could not save prompts to localStorage:', e);
    }
  };

  const showToast = (text: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Categories derivation
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    queries.forEach((q) => {
      if (q.category) set.add(q.category);
    });
    return ['All', ...Array.from(set)];
  }, [queries]);

  // Intent badge render helper
  const renderIntentBadge = (intent: QueryIntent = 'Brand') => {
    switch (intent) {
      case 'Brand':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs whitespace-nowrap">
            Brand
          </span>
        );
      case 'Product':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs whitespace-nowrap">
            Product
          </span>
        );
      case 'Competitor':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs whitespace-nowrap">
            Competitor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs whitespace-nowrap">
            Brand
          </span>
        );
    }
  };

  // Filtered queries
  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      const matchesSearch =
        q.query.toLowerCase().includes(searchFilter.toLowerCase()) ||
        q.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (q.queryIntent && q.queryIntent.toLowerCase().includes(searchFilter.toLowerCase())) ||
        q.engine.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesCategory =
        selectedCategoryFilter === 'All' || q.category === selectedCategoryFilter;

      const matchesIntent =
        selectedIntentFilter === 'All' || (q.queryIntent || 'Brand') === selectedIntentFilter;

      return matchesSearch && matchesCategory && matchesIntent;
    });
  }, [queries, searchFilter, selectedCategoryFilter, selectedIntentFilter]);

  // Selection handlers
  const allFilteredSelected =
    filteredQueries.length > 0 &&
    filteredQueries.every((q) => selectedIds.has(q.id));

  const someFilteredSelected =
    filteredQueries.some((q) => selectedIds.has(q.id)) && !allFilteredSelected;

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const next = new Set(selectedIds);
      filteredQueries.forEach((q) => next.delete(q.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filteredQueries.forEach((q) => next.add(q.id));
      setSelectedIds(next);
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Delete actions
  const handleDeleteSingle = (item: TrackedQueryItem) => {
    setDeleteConfirmTarget({ type: 'single', item });
  };

  const handleDeleteBulk = () => {
    if (selectedIds.size === 0) return;
    setDeleteConfirmTarget({ type: 'bulk' });
  };

  const executeDelete = () => {
    if (!deleteConfirmTarget) return;

    if (deleteConfirmTarget.type === 'single' && deleteConfirmTarget.item) {
      const itemToDelete = deleteConfirmTarget.item;
      const updated = queries.filter((q) => q.id !== itemToDelete.id);
      saveQueries(updated);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(itemToDelete.id);
        return next;
      });
      showToast(`Removed prompt: "${itemToDelete.query}"`, 'info');
    } else if (deleteConfirmTarget.type === 'bulk') {
      const count = selectedIds.size;
      const updated = queries.filter((q) => !selectedIds.has(q.id));
      saveQueries(updated);
      setSelectedIds(new Set());
      showToast(`Deleted ${count} selected prompt${count > 1 ? 's' : ''}`, 'info');
    }

    setDeleteConfirmTarget(null);
  };

  // Add query with DUPLICATE PREVENTION
  const handleAddQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = newQueryInput.trim();
    if (!cleanText) return;

    // Strict duplicate check
    const isDuplicate = queries.some(
      (q) => q.query.trim().toLowerCase() === cleanText.toLowerCase()
    );
    if (isDuplicate) {
      showToast(`Prompt "${cleanText}" already exists in your library. Duplicates are not allowed.`, 'warning');
      return;
    }

    setIsSubmittingQuery(true);
    await addCampaignQuery(cleanText);
    setIsSubmittingQuery(false);

    const newItem: TrackedQueryItem = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      query: cleanText,
      category: newCategoryInput,
      queryIntent: newIntentInput,
      engine: newEngineInput,
      frequency: 'Daily',
      lastTracked: 'Just now',
      citationsCount: 0,
      brandRank: '#1',
      status: 'Active',
    };

    saveQueries([newItem, ...queries]);
    showToast(`Added ${newIntentInput} target prompt: "${cleanText}"`, 'success');
    setNewQueryInput('');
    setInlineRecommendations(null);
    setIsAddModalOpen(false);
  };

  // Fetch inline AI recommendations for the prompt typed in Add Modal
  const fetchInlineRecommendations = async (targetQuery: string) => {
    const text = targetQuery.trim();
    if (!text) {
      showToast('Please type a prompt before requesting recommendations.', 'info');
      return;
    }

    setIsLoadingInlineRecommendations(true);
    setInlineAddedSuggestions(new Set());

    try {
      const res = await fetch('/api/prompts/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          brandName: activeTenant.name,
          brandDomain: activeTenant.domain,
          category: newCategoryInput,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setInlineRecommendations(json.data);
      } else {
        throw new Error(json.error || 'Failed to generate recommendations');
      }
    } catch (err: any) {
      showToast(err.message || 'Error generating prompt suggestions', 'error');
    } finally {
      setIsLoadingInlineRecommendations(false);
    }
  };

  // Import queries with strict deduplication
  const handleImportPrompts = (importedList: ImportedPromptItem[]) => {
    const existingSet = new Set(queries.map((q) => q.query.trim().toLowerCase()));
    let duplicateCount = 0;
    const uniqueImported: TrackedQueryItem[] = [];

    importedList.forEach((item) => {
      const clean = (item.query || '').trim();
      const norm = clean.toLowerCase();
      if (!clean) return;

      if (existingSet.has(norm)) {
        duplicateCount++;
        return;
      }

      existingSet.add(norm);

      const detectedIntent: QueryIntent =
        (item as any).queryIntent ||
        (item.category?.includes('Competitor')
          ? 'Competitor'
          : item.category?.includes('Product') || item.category?.includes('SaaS')
          ? 'Product'
          : 'Brand');

      uniqueImported.push({
        id: item.id || `q-imp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        query: clean,
        category: item.category || 'General Discovery',
        queryIntent: detectedIntent,
        engine: item.engine || 'Google Gemini & Perplexity',
        frequency: item.frequency || 'Daily',
        lastTracked: item.lastTracked || 'Pending Audit',
        citationsCount: item.citationsCount || 0,
        brandRank: item.brandRank || '#1',
        status: 'Active',
      });
    });

    if (uniqueImported.length === 0 && duplicateCount > 0) {
      showToast(`All ${duplicateCount} imported prompt(s) were skipped because they already exist in your library.`, 'info');
      return;
    }

    saveQueries([...uniqueImported, ...queries]);
    if (duplicateCount > 0) {
      showToast(`Imported ${uniqueImported.length} unique prompts (${duplicateCount} duplicate(s) skipped).`, 'success');
    } else {
      showToast(`Successfully imported ${uniqueImported.length} new unique prompts!`, 'success');
    }
  };

  // Prompt optimizer callbacks
  const handleOpenOptimizer = (initialText?: string) => {
    setOptimizerInitialQuery(initialText || '');
    setIsOptimizerModalOpen(true);
  };

  // Apply improvement: Replace original prompt with improved wording
  const handleApplyOptimizedPrompt = (newQuery: string, originalQuery?: string) => {
    const cleanNew = newQuery.trim();
    if (!cleanNew) return;

    if (originalQuery) {
      // Check if replacement would create duplicate with another existing prompt
      const isDuplicateOfOther = queries.some(
        (q) => q.query.toLowerCase() !== originalQuery.toLowerCase() && q.query.trim().toLowerCase() === cleanNew.toLowerCase()
      );
      if (isDuplicateOfOther) {
        showToast(`Cannot replace: "${cleanNew}" already exists elsewhere in your library.`, 'warning');
        return;
      }

      const updated = queries.map((q) =>
        q.query.toLowerCase() === originalQuery.toLowerCase()
          ? { ...q, query: cleanNew, lastTracked: 'Just now' }
          : q
      );
      saveQueries(updated);
      showToast(`Updated prompt with AI-improved wording!`, 'success');
    } else {
      setNewQueryInput(cleanNew);
      showToast(`Applied improved wording to query input!`, 'success');
    }
  };

  // Add suggestion as brand new prompt (with duplicate check)
  const handleAddNewOptimizedPrompt = (newQuery: string, category: string) => {
    const clean = newQuery.trim();
    if (!clean) return;

    // Strict duplicate check
    const isDuplicate = queries.some((q) => q.query.trim().toLowerCase() === clean.toLowerCase());
    if (isDuplicate) {
      showToast(`"${clean}" is already in your library.`, 'info');
      return;
    }

    const newItem: TrackedQueryItem = {
      id: `q-opt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      query: clean,
      category: category || 'Commercial Intent',
      queryIntent: category?.includes('Competitor') ? 'Competitor' : category?.includes('Product') ? 'Product' : 'Brand',
      engine: 'Google Gemini & Perplexity',
      frequency: 'Daily',
      lastTracked: 'Just now',
      citationsCount: 0,
      brandRank: '#1',
      status: 'Active',
    };
    saveQueries([newItem, ...queries]);
    showToast(`Added suggestion as brand new unique prompt!`, 'success');
  };

  // Export to CSV
  const handleExportCsv = (itemsToExport = queries) => {
    exportToCsv(
      itemsToExport,
      `tracked-prompts-${activeTenant.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    );
    showToast(`Exported ${itemsToExport.length} unique prompts to CSV`, 'info');
  };

  // Audit selected queries
  const handleAuditSelected = async () => {
    if (selectedIds.size === 0) return;
    showToast(`Auditing ${selectedIds.size} selected prompts across AI engines...`, 'info');
    await triggerTracking();
    showToast(`Completed audit for selected prompts!`, 'success');
  };

  // LLM Prompt Template Handlers (Supabase Backend)
  const handleOpenEditTemplate = (template: PromptTemplateRecord) => {
    setSelectedTemplateForEdit(template);
    setEditPromptKey(template.prompt_key);
    setEditPromptText(template.prompt_text);
    setEditModelTarget(template.model_target || 'gemini-1.5-flash');
    setEditDescription(template.description || '');
    setEditCategory(template.category || 'extraction');
    setPreviewInterpolatedText(null);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPromptKey.trim() || !editPromptText.trim()) return;

    try {
      setIsSavingTemplate(true);
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_key: editPromptKey.trim(),
          prompt_text: editPromptText.trim(),
          model_target: editModelTarget,
          description: editDescription.trim(),
          category: editCategory,
          is_active: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save prompt template to Supabase');
      }

      showToast(`Prompt '${editPromptKey}' saved to Supabase!`, 'success');
      setSelectedTemplateForEdit(null);
      await fetchTemplates();
    } catch (err: any) {
      showToast(err.message || 'Error updating prompt', 'error');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleResetTemplate = async (promptKey: string) => {
    try {
      const res = await fetch(`/api/prompts?prompt_key=${encodeURIComponent(promptKey)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast(`Prompt '${promptKey}' restored to factory default`, 'success');
        await fetchTemplates();
      } else {
        throw new Error(json.error || 'Failed to reset prompt');
      }
    } catch (err: any) {
      showToast(err.message || 'Error resetting prompt', 'error');
    }
  };

  const handlePreviewInterpolation = (text: string) => {
    let result = text;
    result = result.replace(/\{\{\s*brandName\s*\}\}/g, activeTenant.name || 'Acme Brand');
    result = result.replace(/\{\{\s*brandDomain\s*\}\}/g, activeTenant.domain || 'brand.com');
    result = result.replace(/\{\{\s*brandAliases\s*\}\}/g, 'Brand, Brand AI, Brand Cloud');
    result = result.replace(/\{\{\s*query\s*\}\}/g, 'best enterprise analytics platforms');
    result = result.replace(/\{\{\s*competitors\s*\}\}/g, 'Competitor A, Competitor B, Competitor C');
    setPreviewInterpolatedText(result);
  };

  const filteredTemplates = useMemo(() => {
    return promptTemplates.filter((t) => {
      const q = templateSearchFilter.toLowerCase();
      return (
        t.prompt_key.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q) ||
        t.model_target.toLowerCase().includes(q) ||
        t.prompt_text.toLowerCase().includes(q)
      );
    });
  }, [promptTemplates, templateSearchFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-700'
                : toastMessage.type === 'warning'
                ? 'bg-amber-900 text-amber-100 border-amber-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            ) : toastMessage.type === 'warning' ? (
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Header Banner with Sub-View Switcher (Tracked Queries vs LLM Prompts) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Prompts & Query Management
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeTab === 'queries' ? `${queries.length} Unique Monitored` : `${promptTemplates.length} LLM Templates`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage unique search queries and custom LLM extraction prompt instructions in Supabase for {activeTenant.name}.
              </p>
            </div>
          </div>
        </div>

        {/* View Toggle + Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Segmented View Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1">
            <button
              onClick={() => setActiveTab('queries')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'queries'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Tracked Queries</span>
            </button>
            <button
              onClick={() => setActiveTab('llm_prompts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'llm_prompts'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-600" />
              <span>LLM System Prompts</span>
            </button>
          </div>

          {activeTab === 'queries' ? (
            <>
              {/* Export CSV Ghost Button */}
              <button
                onClick={() => handleExportCsv(filteredQueries)}
                className="px-3.5 py-2 bg-transparent hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Export Prompts to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export CSV</span>
              </button>

              {/* AI Prompt Optimizer Button */}
              <button
                onClick={() => handleOpenOptimizer()}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Open AI Prompt Wording Optimizer & Recommendations"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Improve Wording</span>
              </button>

              {/* Import File Button */}
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Upload Prompts via CSV, TXT, or JSON"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Import Prompts</span>
              </button>

              {/* Add Query Button */}
              <button
                onClick={() => {
                  setNewQueryInput('');
                  setInlineRecommendations(null);
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Target Query</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => fetchTemplates()}
                className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Refresh Prompts from Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoadingTemplates ? 'animate-spin' : ''}`} />
                <span>Sync Supabase</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* TAB 1: TRACKED SEARCH QUERIES */}
      {activeTab === 'queries' && (
        <div className="space-y-4">
          {/* Filter / Search & Category Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                {/* Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search unique prompts, intents, categories..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>

                {/* Query Intent Dropdown Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                  <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">Intent:</span>
                  <select
                    value={selectedIntentFilter}
                    onChange={(e) => setSelectedIntentFilter(e.target.value as any)}
                    className="text-xs bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer py-1 pr-1"
                  >
                    <option value="All">All Intents</option>
                    <option value="Brand">Brand</option>
                    <option value="Product">Product</option>
                    <option value="Competitor">Competitor</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="text-xs text-slate-500 pl-2">
                  <span className="font-semibold text-slate-800">{filteredQueries.length}</span> of{' '}
                  <span className="font-semibold text-slate-800">{queries.length}</span> unique queries active
                </div>
              </div>
            </div>

            {/* Category Pills Filter */}
            {categoriesList.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Category:
                </span>
                {categoriesList.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategoryFilter(category)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      selectedCategoryFilter === category
                        ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Floating / Sticky Batch Actions Toolbar */}
          {selectedIds.size > 0 && (
            <div className="sticky top-4 z-20 bg-slate-900 text-white rounded-2xl p-3.5 shadow-xl flex items-center justify-between gap-4 border border-slate-800 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-6 h-6 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                  {selectedIds.size}
                </div>
                <span className="font-semibold">
                  {selectedIds.size} prompt{selectedIds.size > 1 ? 's' : ''} selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAuditSelected}
                  disabled={isTracking}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Audit Selected</span>
                </button>

                <button
                  onClick={() => {
                    const selectedItems = queries.filter((q) => selectedIds.has(q.id));
                    handleExportCsv(selectedItems);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>

                <button
                  onClick={handleDeleteBulk}
                  className="px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Selected</span>
                </button>

                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Queries Table or Clean Light-Mode Empty State */}
          {queries.length === 0 ? (
            <div className="py-4">
              <EmptyState
                icon={<MessageSquareCode className="w-8 h-8 text-indigo-600" />}
                message="No search queries configured yet"
                description={`Add the key conversational queries and product evaluation prompts you want to monitor for ${activeTenant.name}. AI Overviews will crawl and extract citations continuously.`}
                buttonText="Add First Target Query"
                disabledButton={false}
                onAction={() => {
                  setNewQueryInput('');
                  setInlineRecommendations(null);
                  setIsAddModalOpen(true);
                }}
                secondaryAction={{
                  label: 'Import CSV List',
                  onClick: () => setIsImportModalOpen(true),
                }}
              />
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5 w-10 text-center">
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer flex items-center justify-center"
                          title={allFilteredSelected ? 'Deselect all' : 'Select all'}
                        >
                          {allFilteredSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : someFilteredSelected ? (
                            <MinusSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3.5">Tracked Query</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">AI Engine Target</th>
                      <th className="px-4 py-3.5">Brand Rank</th>
                      <th className="px-4 py-3.5">Citations</th>
                      <th className="px-4 py-3.5">Frequency</th>
                      <th className="px-4 py-3.5">Last Tracked</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredQueries.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                          <div className="max-w-sm mx-auto space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                              <MessageSquareCode className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800">
                              No tracked prompts match filters
                            </h4>
                            <p className="text-xs text-slate-500">
                              Try resetting search or category filters to view all monitored queries.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredQueries.map((item) => {
                        const isSelected = selectedIds.has(item.id);
                        return (
                          <tr
                            key={item.id}
                            onClick={() => setSelectedPromptForDrawer(item)}
                            className={`transition-colors cursor-pointer group ${
                              isSelected
                                ? 'bg-indigo-50/60 hover:bg-indigo-50/80'
                                : 'hover:bg-slate-50/80'
                            }`}
                          >
                            {/* Checkbox */}
                            <td
                              className="px-4 py-4 text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => toggleSelectRow(item.id)}
                                className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer flex items-center justify-center"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </td>

                            {/* Query Text & Query Intent Pill Badge */}
                            <td className="px-4 py-4 font-semibold text-slate-900 max-w-sm">
                              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0 group-hover:scale-125 transition-transform"></span>
                                <span className="truncate group-hover:text-indigo-600 transition-colors" title={item.query}>
                                  {item.query}
                                </span>
                                {renderIntentBadge(item.queryIntent || 'Brand')}
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-4 py-4 text-slate-600">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-[11px] text-slate-600 whitespace-nowrap">
                                {item.category}
                              </span>
                            </td>

                            {/* Engine */}
                            <td className="px-4 py-4 text-slate-600 font-medium whitespace-nowrap">
                              {item.engine}
                            </td>

                            {/* Rank */}
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200/60">
                                {item.brandRank}
                              </span>
                            </td>

                            {/* Citations */}
                            <td className="px-4 py-4 font-semibold text-slate-700 whitespace-nowrap">
                              {item.citationsCount} sources
                            </td>

                            {/* Frequency */}
                            <td className="px-4 py-4 text-slate-500">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold">
                                {item.frequency}
                              </span>
                            </td>

                            {/* Last Tracked */}
                            <td className="px-4 py-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                              {item.lastTracked}
                            </td>

                            {/* Actions */}
                            <td
                              className="px-4 py-4 text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-end gap-1">
                                {/* Inspect Response Drawer Button */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedPromptForDrawer(item)}
                                  className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1"
                                  title="Inspect Raw AI Overview Response"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span className="text-[11px] font-semibold hidden xl:inline">
                                    Inspect
                                  </span>
                                </button>

                                {/* AI Improve / Recommendations Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenOptimizer(item.query)}
                                  className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer flex items-center gap-1"
                                  title="Get recommendations on how to improve prompt or add suggestions as new prompts"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span className="text-[11px] font-semibold hidden md:inline">
                                    Improve
                                  </span>
                                </button>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSingle(item)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Remove prompt from library"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUPABASE LLM SYSTEM PROMPT TEMPLATES */}
      {activeTab === 'llm_prompts' && (
        <div className="space-y-4">
          {/* Top Info Callout */}
          <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-950">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-indigo-900">
                  Supabase Live Prompt Architecture
                </div>
                <div className="text-indigo-700/90 mt-0.5">
                  These templates power the real-time AI citation extraction, prompt optimization, and GEO gap analysis pipelines.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" /> Live Synced
              </span>
            </div>
          </div>

          {/* Search Bar for Prompt Templates */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search prompt keys, models, descriptions..."
                value={templateSearchFilter}
                onChange={(e) => setTemplateSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {filteredTemplates.length} templates active
            </div>
          </div>

          {/* Grid of Prompt Templates */}
          <div className="grid grid-cols-1 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.prompt_key}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="font-mono text-sm font-bold text-slate-900">
                      {template.prompt_key}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
                      {template.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      Target: {template.model_target}
                    </span>
                    {template.is_active && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Active
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResetTemplate(template.prompt_key)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      title="Reset this prompt to built-in factory defaults"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore Default</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditTemplate(template)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Edit Template</span>
                    </button>
                  </div>
                </div>

                {/* Description */}
                {template.description && (
                  <p className="text-xs text-slate-600">
                    {template.description}
                  </p>
                )}

                {/* Code Preview Box */}
                <div className="relative bg-slate-950 text-slate-200 rounded-xl p-3.5 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-48 scrollbar-thin">
                  <pre className="whitespace-pre-wrap">{template.prompt_text}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit / View Supabase Prompt Template Modal */}
      {selectedTemplateForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-2xl w-full animate-in zoom-in-95 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Supabase LLM Prompt
                  </h3>
                  <p className="text-xs font-mono text-slate-500">
                    Key: {editPromptKey}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTemplateForEdit(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Model Architecture
                  </label>
                  <select
                    value={editModelTarget}
                    onChange={(e) => setEditModelTarget(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-1 focus:ring-indigo-500 font-mono"
                  >
                    <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Fast Extraction)</option>
                    <option value="gemini-3.7-flash">Google Gemini 3.7 Flash (High Reasoning)</option>
                    <option value="gpt-4o">OpenAI GPT-4o Search & Canvas</option>
                    <option value="sonar-pro">Perplexity Sonar Pro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category Tag
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="extraction">Extraction & Citation Audit</option>
                    <option value="optimization">Prompt Optimization & GEO</option>
                    <option value="recommendations">Gap Analysis & Strategy</option>
                    <option value="general">General LLM Prompt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Pipeline Purpose
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Describe when this LLM prompt instruction triggers..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Prompt System Instructions (Template Engine Supported)
                  </label>
                  <button
                    type="button"
                    onClick={() => handlePreviewInterpolation(editPromptText)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Test Variable Interpolation</span>
                  </button>
                </div>
                <textarea
                  rows={8}
                  required
                  value={editPromptText}
                  onChange={(e) => setEditPromptText(e.target.value)}
                  className="w-full p-3 font-mono text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-950 text-emerald-400 resize-y"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Available tags: <code className="text-indigo-600 font-mono">{'{{query}}'}</code>, <code className="text-indigo-600 font-mono">{'{{brandName}}'}</code>, <code className="text-indigo-600 font-mono">{'{{brandDomain}}'}</code>, <code className="text-indigo-600 font-mono">{'{{brandAliases}}'}</code>, <code className="text-indigo-600 font-mono">{'{{competitors}}'}</code>.
                </p>
              </div>

              {previewInterpolatedText && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                  <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Interpolated Output for {activeTenant.name}:</span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-800 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {previewInterpolatedText}
                  </pre>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTemplateForEdit(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTemplate}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                >
                  {isSavingTemplate ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSavingTemplate ? 'Saving to Supabase...' : 'Save to Supabase'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Target Query Modal (With Instant Recommendation & Suggestions) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-xl w-full animate-in zoom-in-95 my-8 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Target Search Prompt</h3>
                  <p className="text-xs text-slate-500">
                    Add a unique conversational query or generate AI-recommended phrasing.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddQuery} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Prompt / Query Text
                  </label>
                  <button
                    type="button"
                    disabled={isLoadingInlineRecommendations || !newQueryInput.trim()}
                    onClick={() => fetchInlineRecommendations(newQueryInput)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                  >
                    {isLoadingInlineRecommendations ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                    )}
                    <span>{isLoadingInlineRecommendations ? 'Analyzing...' : 'Get AI Recommendations'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. best enterprise analytics software for tech startups"
                  value={newQueryInput}
                  onChange={(e) => setNewQueryInput(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 resize-none font-medium text-slate-900"
                />
              </div>

              {/* Inline AI Recommendations Panel */}
              {inlineRecommendations && (
                <div className="p-4 bg-slate-50 border border-indigo-100 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900">
                        AI Recommendations on How to Improve This Prompt
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      Potential: {inlineRecommendations.aiReadinessScore}/100
                    </span>
                  </div>

                  {inlineRecommendations.critique && (
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {inlineRecommendations.critique}
                    </p>
                  )}

                  {/* Variation Cards */}
                  <div className="space-y-2 pt-1">
                    {inlineRecommendations.suggestions.map((sug, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                            {sug.intent}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700">
                            {sug.estimatedCitationLift}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-900">
                          &quot;{sug.improvedQuery}&quot;
                        </div>

                        <div className="text-[10px] text-slate-500">
                          {sug.expectedAdvantage}
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setNewQueryInput(sug.improvedQuery);
                              showToast(`Applied improved wording to query!`, 'success');
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Use as Improvement
                          </button>
                          <button
                            type="button"
                            disabled={inlineAddedSuggestions.has(sIdx)}
                            onClick={() => {
                              handleAddNewOptimizedPrompt(sug.improvedQuery, sug.category);
                              setInlineAddedSuggestions((prev) => new Set(prev).add(sIdx));
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                              inlineAddedSuggestions.has(sIdx)
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                            }`}
                          >
                            {inlineAddedSuggestions.has(sIdx) ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>Use Suggestion as Brand New Prompt</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Intent Badge
                  </label>
                  <select
                    value={newIntentInput}
                    onChange={(e) => setNewIntentInput(e.target.value as QueryIntent)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="Brand">Brand (Indigo)</option>
                    <option value="Product">Product (Emerald)</option>
                    <option value="Competitor">Competitor (Slate)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Commercial Intent">Commercial Intent</option>
                    <option value="Enterprise SaaS">Enterprise SaaS</option>
                    <option value="Competitor Benchmark">Competitor Benchmark</option>
                    <option value="How-To / Informational">How-To / Informational</option>
                    <option value="Product Evaluation">Product Evaluation</option>
                    <option value="Agency Solutions">Agency Solutions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    AI Target Engine
                  </label>
                  <select
                    value={newEngineInput}
                    onChange={(e) => setNewEngineInput(e.target.value)}
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Google Gemini & Perplexity">Gemini & Perplexity</option>
                    <option value="Google Gemini & ChatGPT">Gemini & ChatGPT</option>
                    <option value="Perplexity & Copilot">Perplexity & Copilot</option>
                    <option value="All Engines (Multi-model)">All AI Engines</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuery || !newQueryInput.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                >
                  {isSubmittingQuery && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingQuery ? 'Saving...' : 'Save & Trigger Audit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-md w-full animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                {deleteConfirmTarget.type === 'bulk'
                  ? `Delete ${selectedIds.size} selected prompts?`
                  : 'Remove prompt from library?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {deleteConfirmTarget.type === 'bulk'
                  ? `Are you sure you want to delete these ${selectedIds.size} search prompts? This will stop tracking visibility citations for these queries.`
                  : `Are you sure you want to remove "${deleteConfirmTarget.item?.query}" from continuous tracking?`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md shadow-rose-200 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Removal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Import Modal */}
      <ImportPromptsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportPrompts}
      />

      {/* AI Prompt Optimizer & Recommendations Modal */}
      <PromptOptimizerModal
        isOpen={isOptimizerModalOpen}
        initialQuery={optimizerInitialQuery}
        brandName={activeTenant.name}
        brandDomain={activeTenant.domain}
        onClose={() => setIsOptimizerModalOpen(false)}
        onApplyPrompt={handleApplyOptimizedPrompt}
        onAddNewPrompt={handleAddNewOptimizedPrompt}
        onAuditPrompt={(query) => {
          showToast(`Auditing "${query}"...`, 'info');
          triggerTracking();
        }}
      />

      {/* Raw AI Response Slide-out Drawer */}
      {selectedPromptForDrawer && (
        <PromptRawResponseDrawer
          isOpen={!!selectedPromptForDrawer}
          onClose={() => setSelectedPromptForDrawer(null)}
          query={selectedPromptForDrawer.query}
          brandName={activeTenant.name}
          category={selectedPromptForDrawer.category}
          engine={selectedPromptForDrawer.engine}
          recommendationRank={selectedPromptForDrawer.brandRank}
          capturedAt={selectedPromptForDrawer.lastTracked}
        />
      )}
    </div>
  );
}
