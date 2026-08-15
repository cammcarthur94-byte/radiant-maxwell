'use client';

import React, { useState } from 'react';
import {
  X,
  Bot,
  Copy,
  Check,
  Flag,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Link2,
  MessageSquareCode,
  Globe2,
  HelpCircle,
} from 'lucide-react';
import { ActivityEvent } from '@/types/dashboard';

interface ContextExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityEvent | null;
  onFlagSuccess?: (updatedActivity: ActivityEvent) => void;
}

export function ContextExplorerModal({
  isOpen,
  onClose,
  activity,
  onFlagSuccess,
}: ContextExplorerModalProps) {
  const [copied, setCopied] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [flagNote, setFlagNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  if (!isOpen || !activity) return null;

  const promptText = activity.user_prompt || activity.query || 'Target brand recommendation query';
  const responseText =
    activity.raw_ai_response ||
    activity.rawResponseText ||
    activity.description ||
    'No full AI response text captured for this citation.';
  const engineName = activity.modelVersion || activity.title?.split(' ')[0] || 'Google Gemini';
  const sentiment = activity.sentiment_label || (
    activity.badgeVariant === 'emerald'
      ? 'Positive'
      : activity.badgeVariant === 'rose'
      ? 'Negative'
      : 'Neutral'
  );
  const isMisinformation = activity.is_misinformation || flagged;

  const handleCopy = () => {
    const textToCopy = `User Prompt: ${promptText}\n\nAI Response:\n${responseText}\n\nSentiment: ${sentiment}\nEngine: ${engineName}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFlagInaccurate = async () => {
    setIsFlagging(true);
    try {
      const res = await fetch('/api/citations/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citationId: activity.id,
          isMisinformation: true,
          sentimentLabel: 'Inaccurate',
          note: flagNote || 'Flagged as inaccurate by workspace analyst',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFlagged(true);
        setShowNoteInput(false);
        if (onFlagSuccess) {
          onFlagSuccess({
            ...activity,
            is_misinformation: true,
            sentiment_label: 'Inaccurate',
          });
        }
      }
    } catch (e) {
      console.error('Failed to flag citation:', e);
      setFlagged(true);
    } finally {
      setIsFlagging(false);
    }
  };

  const sentimentBadgeColors: Record<string, string> = {
    Positive: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    Negative: 'bg-rose-50 text-rose-700 border-rose-200',
    Inaccurate: 'bg-amber-50 text-amber-800 border-amber-300',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="context-explorer-title"
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="context-explorer-title" className="text-sm font-bold text-slate-900">
                  Citation Context Explorer
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 border border-slate-300">
                  {engineName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Timestamp: {activity.timestamp || activity.timeAgo || 'Recent telemetry snapshot'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar flex-1">
          {/* Misinformation / Inaccurate Banner if flagged */}
          {isMisinformation && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Flagged for Inaccuracy / Misinformation</div>
                <div className="text-[11px] text-amber-800 mt-0.5">
                  This citation snippet was marked for review due to inconsistent brand attribution or model hallucinations.
                </div>
              </div>
            </div>
          )}

          {/* 1. Target User Query / Prompt */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MessageSquareCode className="w-3.5 h-3.5 text-indigo-600" />
                Original User Search Prompt
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono font-semibold text-slate-800 select-all">
              "{promptText}"
            </div>
          </div>

          {/* 2. Sentiment & Domain Attribution Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Sentiment Context
              </div>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border ${
                    sentimentBadgeColors[sentiment] || sentimentBadgeColors.Positive
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {sentiment}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cited Domain
              </div>
              <div className="mt-1 text-xs font-mono font-bold text-slate-900 truncate">
                {activity.domain_name || 'Direct Brand Portal'}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Authority Tier
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-700 truncate">
                {activity.domain_authority_type || 'General Publisher'}
              </div>
            </div>
          </div>

          {/* 3. Complete Verbatim AI Response Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                Verbatim AI Model Synthesis
              </span>
              <button
                onClick={handleCopy}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap selection:bg-indigo-700 selection:text-white">
              {responseText}
            </div>
          </div>

          {/* 4. Citation URLs if present */}
          {activity.citations && activity.citations.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                Grounded Reference Links ({activity.citations.length})
              </span>
              <div className="space-y-1">
                {activity.citations.map((citeUrl, idx) => (
                  <a
                    key={idx}
                    href={citeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-mono text-indigo-600 truncate transition-colors group"
                  >
                    <span className="truncate">{citeUrl}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Inaccuracy note input if expanded */}
          {showNoteInput && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 animate-in fade-in">
              <label className="text-[11px] font-semibold text-slate-700 block">
                Explain the inaccuracy or inconsistency:
              </label>
              <textarea
                value={flagNote}
                onChange={(e) => setFlagNote(e.target.value)}
                placeholder="e.g. Model claimed our platform lacks enterprise SSO, which is incorrect."
                rows={2}
                className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500 text-slate-900"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNoteInput(false)}
                  className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFlagInaccurate}
                  disabled={isFlagging}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-md shadow-xs transition-colors flex items-center gap-1"
                >
                  {isFlagging ? 'Submitting...' : 'Confirm Flag'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isMisinformation ? (
              <button
                onClick={() => setShowNoteInput(!showNoteInput)}
                className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Flag className="w-3.5 h-3.5 text-rose-500" />
                <span>Flag as Inaccurate</span>
              </button>
            ) : (
              <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Flagged for Review</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Context</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
