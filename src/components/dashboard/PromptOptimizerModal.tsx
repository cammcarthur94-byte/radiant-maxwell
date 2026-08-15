'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  RefreshCw,
  CheckCircle2,
  Copy,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Zap,
  Check,
  Search,
  Bot,
} from 'lucide-react';
import { PromptImprovementResult, PromptVariationSuggestion } from '@/lib/services/prompt-optimizer-service';

interface PromptOptimizerModalProps {
  isOpen: boolean;
  initialQuery?: string;
  brandName?: string;
  brandDomain?: string;
  competitors?: string[];
  onClose: () => void;
  onApplyPrompt: (newQuery: string, originalQuery?: string) => void;
  onAddNewPrompt: (newQuery: string, category: string) => void;
  onAuditPrompt?: (query: string) => void;
}

export function PromptOptimizerModal({
  isOpen,
  initialQuery = '',
  brandName = 'Your Brand',
  brandDomain = '',
  competitors = [],
  onClose,
  onApplyPrompt,
  onAddNewPrompt,
  onAuditPrompt,
}: PromptOptimizerModalProps) {
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PromptImprovementResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);
  const [addedIndices, setAddedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setQueryInput(initialQuery);
      setResult(null);
      setError(null);
      setAppliedIndex(null);
      setAddedIndices(new Set());
      if (initialQuery.trim()) {
        runOptimization(initialQuery.trim());
      }
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const runOptimization = async (targetQuery: string) => {
    if (!targetQuery.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/prompts/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: targetQuery.trim(),
          brandName,
          brandDomain,
          competitors,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        throw new Error(data.error || 'Failed to optimize prompt wording.');
      }
    } catch (err: any) {
      console.error('Prompt optimization error:', err);
      setError(err.message || 'Error communicating with AI prompt optimizer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApply = (suggestion: PromptVariationSuggestion, index: number) => {
    setAppliedIndex(index);
    onApplyPrompt(suggestion.improvedQuery, initialQuery);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleAddAsNew = (suggestion: PromptVariationSuggestion, index: number) => {
    onAddNewPrompt(suggestion.improvedQuery, suggestion.category);
    setAddedIndices((prev) => new Set(prev).add(index));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-white to-violet-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  AI Prompt Wording Optimizer
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                  GEO & AEO Tuned
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Optimize conversational phrasing to maximize citations across ChatGPT, Perplexity & Gemini.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Query Input Section */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Original Prompt / Target Search Query
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="e.g. best crm tools or brand visibility software"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') runOptimization(queryInput);
                  }}
                  className="w-full pl-3.5 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium text-slate-900"
                />
              </div>
              <button
                type="button"
                disabled={isLoading || !queryInput.trim()}
                onClick={() => runOptimization(queryInput)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isLoading ? 'Analyzing...' : 'Analyze & Improve'}</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Analysis & Results */}
          {result && (
            <div className="space-y-6">
              {/* Score Badges & Diagnostic Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Clarity Score
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      {result.clarityScore}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        result.clarityScore > 75
                          ? 'bg-emerald-500'
                          : result.clarityScore > 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${result.clarityScore}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    AI Overview Potential
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-indigo-600">
                      {result.aiReadinessScore}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ 100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${result.aiReadinessScore}%` }}
                    />
                  </div>
                </div>

                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 shadow-2xs">
                  <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Engine Mode</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-slate-900">
                    {result.isLiveGemini ? 'Gemini 2.5 Live GEO' : 'Smart GEO Rule Engine'}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Calibrated against ChatGPT, Perplexity & Gemini Overview algorithms.
                  </p>
                </div>
              </div>

              {/* Weaknesses Diagnostic */}
              <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Why Original Prompt Wording Can Be Improved:</span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed mb-2.5">
                  {result.critique}
                </p>
                {result.weaknesses.length > 0 && (
                  <ul className="space-y-1 pl-4 list-disc text-slate-600 text-[11px]">
                    {result.weaknesses.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Improved Variations List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recommended High-Visibility Variations ({result.suggestions.length})
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Click to apply directly or add to library
                  </span>
                </div>

                <div className="space-y-3">
                  {result.suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-4.5 transition-all shadow-2xs hover:shadow-md space-y-3 group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                            {suggestion.intent}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {suggestion.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                            {suggestion.estimatedCitationLift}
                          </span>
                        </div>
                      </div>

                      {/* Rewritten query quote */}
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 select-all leading-relaxed">
                        &quot;{suggestion.improvedQuery}&quot;
                      </div>

                      {/* Advantage & Engines */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <TrendingUp className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                          <span>{suggestion.expectedAdvantage}</span>
                        </div>
                        <div className="text-slate-400 font-mono text-[10px]">
                          Target: {suggestion.recommendedEngine}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleCopy(suggestion.improvedQuery, idx)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={addedIndices.has(idx)}
                          onClick={() => handleAddAsNew(suggestion, idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer border ${
                            addedIndices.has(idx)
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                              : 'bg-white border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 shadow-2xs'
                          }`}
                          title="Add this AI suggestion as a brand new unique prompt in your library"
                        >
                          {addedIndices.has(idx) ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-semibold">Added as New Prompt</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Use as Brand New Prompt</span>
                            </>
                          )}
                        </button>

                        {initialQuery && (
                          <button
                            type="button"
                            onClick={() => handleApply(suggestion, idx)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                            title="Replace the original prompt with this improved wording"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Apply as Improvement</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
          >
            Close Optimizer
          </button>
        </div>
      </div>
    </div>
  );
}
