'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Bot,
  Sparkles,
  ShieldAlert,
  Quote,
  CheckCircle2,
  FileCode,
  ArrowUpRight,
} from 'lucide-react';

export interface DrawerData {
  type: 'prompt' | 'citation' | 'action';
  title: string;
  category?: string;
  query?: string;
  engine?: string;
  date?: string;
  score?: number | string;
  rank?: string;
  snippet?: string;
  url?: string;
  recommendation?: string;
  codeSnippet?: string;
  metadata?: Record<string, string | number | boolean>;
}

interface SlideOutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: DrawerData | null;
}

export function SlideOutDrawer({ isOpen, onClose, data }: SlideOutDrawerProps) {
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen || !data) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg sm:max-w-xl bg-white shadow-2xl border-l border-slate-200/80 flex flex-col justify-between transform transition duration-300 ease-in-out animate-in slide-in-from-right">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  {data.category || data.type.toUpperCase()}
                </span>
                {data.engine && (
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{data.engine}</span>
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">
                {data.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
            {/* Query Info Card */}
            {data.query && (
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-slate-200/70 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                  Target Search Query
                </div>
                <div className="text-xs font-bold text-slate-900">
                  &ldquo;{data.query}&rdquo;
                </div>
              </div>
            )}

            {/* AI Response Snippet / Citation Quote */}
            {data.snippet && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Quote className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Model Output & Citation Quote</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(data.snippet || '')}
                    className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600 cursor-pointer"
                  >
                    {hasCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy snippet</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs font-sans text-xs text-slate-800 leading-relaxed border-l-4 border-l-indigo-600">
                  {data.snippet}
                </div>
              </div>
            )}

            {/* Referenced URL */}
            {data.url && (
              <div className="p-4 rounded-2xl bg-[#f0f3fa] border border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                    Referenced Grounding URL
                  </div>
                  <div className="text-xs font-mono font-medium text-slate-700 truncate max-w-xs mt-0.5">
                    {data.url}
                  </div>
                </div>
                <a
                  href={data.url.startsWith('http') ? data.url : `https://${data.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-indigo-700 flex items-center gap-1 shadow-2xs"
                >
                  <span>Visit</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Strategic Recommendation */}
            {data.recommendation && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Strategic Optimization Step</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {data.recommendation}
                </p>
              </div>
            )}

            {/* Code Fix Snippet */}
            {data.codeSnippet && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Implementation Payload</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(data.codeSnippet || '')}
                    className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 cursor-pointer"
                  >
                    Copy Code
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                  {data.codeSnippet}
                </pre>
              </div>
            )}

            {/* Metadata Badges */}
            {data.metadata && (
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
                {Object.entries(data.metadata).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">
                      {key}
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">
                      {String(val)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                handleCopy(data.snippet || data.codeSnippet || data.title);
                onClose();
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Apply / Copy Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
