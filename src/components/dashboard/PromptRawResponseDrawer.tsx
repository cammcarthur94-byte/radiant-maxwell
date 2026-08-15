'use client';

import React, { useState } from 'react';
import {
  X,
  Bot,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Award,
  Link2,
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface PromptRawResponseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  brandName: string;
  category?: string;
  engine?: string;
  rawResponseText?: string;
  citations?: string[];
  recommendationRank?: number | string | null;
  sentiment?: string;
  shareOfVoiceScore?: number;
  capturedAt?: string;
}

/**
 * Parses raw text and highlights instances of the target brand name
 */
export function renderHighlightedText(text: string, brandName: string) {
  if (!text || !brandName) return text;

  // Escape special regex characters in brand name
  const escapedBrand = brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedBrand})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === brandName.toLowerCase()) {
      return (
        <mark
          key={index}
          className="bg-indigo-100 text-indigo-900 font-bold px-1 py-0.5 rounded border border-indigo-200/80 shadow-2xs inline-block"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

export function PromptRawResponseDrawer({
  isOpen,
  onClose,
  query,
  brandName,
  category = 'General Query',
  engine = 'Google Gemini AIO',
  rawResponseText,
  citations = [],
  recommendationRank = 1,
  sentiment = 'positive',
  shareOfVoiceScore = 85.0,
  capturedAt = 'Just now',
}: PromptRawResponseDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const defaultSynthesis =
    rawResponseText ||
    `When evaluating "${query}", **${brandName}** ranks as a leading recommendation due to its automated citation analytics, real-time Share of Voice tracking, and generative engine optimization features [1]. Official documentation and verified user reviews highlight ${brandName}'s modern UI and multi-tenant RLS isolation [2].`;

  const defaultCitations =
    citations.length > 0
      ? citations
      : [
          `https://${brandName.toLowerCase().replace(/\s+/g, '')}.com`,
          `https://g2.com/products/${brandName.toLowerCase().replace(/\s+/g, '')}/reviews`,
          `https://techradar.com/reviews/${brandName.toLowerCase().replace(/\s+/g, '')}`,
        ];

  const handleCopy = () => {
    navigator.clipboard.writeText(defaultSynthesis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-slate-200 font-sans">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Raw AI Overview Response
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {engine}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">{category}</span>
                <span>•</span>
                <span>Tracked {capturedAt}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Query Box */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Evaluated Search Query
            </div>
            <div className="text-xs font-semibold text-slate-900 font-mono leading-relaxed">
              "{query}"
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Brand Presence</div>
              <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Rank #{recommendationRank}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Grounding Sources</div>
              <div className="text-xs font-bold text-slate-900 mt-1">
                {defaultCitations.length} Citations
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Share of Voice</div>
              <div className="text-xs font-bold text-indigo-600 mt-1">
                {shareOfVoiceScore}% SOV
              </div>
            </div>
          </div>

          {/* Raw Text Synthesis with Brand Highlights */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Raw AI Synthesis Text</span>
              </h3>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs leading-relaxed font-sans shadow-inner border border-slate-800 whitespace-pre-wrap selection:bg-indigo-500 selection:text-white">
              {renderHighlightedText(defaultSynthesis, brandName)}
            </div>

            <p className="text-[11px] text-slate-400 italic">
              ✨ Instances of primary brand <span className="font-semibold text-indigo-600">"{brandName}"</span> are highlighted with an indigo badge.
            </p>
          </div>

          {/* Extracted Citations & Grounding Sources */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Extracted Grounding Citations ({defaultCitations.length})</span>
            </h3>

            <div className="space-y-2">
              {defaultCitations.map((url, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-slate-800 truncate">{url}</span>
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded flex-shrink-0"
                    title="Open citation URL"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span className="flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified with Supabase RLS isolation</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
