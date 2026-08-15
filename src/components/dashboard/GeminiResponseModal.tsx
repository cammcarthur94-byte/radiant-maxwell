'use client';

import React, { useState } from 'react';
import {
  X,
  Bot,
  Sparkles,
  ExternalLink,
  Code,
  FileText,
  CheckCircle2,
  Award,
  Zap,
  Globe2,
  Copy,
  Check,
} from 'lucide-react';
import { ActivityEvent } from '@/types/dashboard';

interface GeminiResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityEvent | null;
}

export function GeminiResponseModal({
  isOpen,
  onClose,
  activity,
}: GeminiResponseModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'json'>('overview');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !activity) return null;

  const rawText = activity.rawResponseText || 'No raw synthesis text available for this audit.';
  const citations = activity.citations || [];
  const model = activity.modelVersion || 'gemini-3.7-flash';
  const query = activity.query || 'Target AIO Query';

  const handleCopyJson = () => {
    const dataToCopy = activity.extractedMetrics || {
      query,
      model,
      raw_response: rawText,
      citations,
    };
    navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Google Gemini Live Response</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  {model}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono truncate max-w-md">
                Query: "{query}"
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

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>AI Synthesis Text</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'json'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Structured JSON Schema</span>
            </button>
          </div>

          {activeTab === 'json' && (
            <button
              onClick={handleCopyJson}
              className="mb-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' ? (
            <>
              {/* Key Metrics Badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Brand Mentioned</div>
                  <div className="text-sm font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Yes (Cited)</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Extracted Sources</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {citations.length} URLs Grounded
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Sentiment</div>
                  <div className="text-sm font-bold text-indigo-600 mt-0.5">
                    Positive (Recommended)
                  </div>
                </div>
              </div>

              {/* Raw AI Synthesis Markdown Box */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Gemini Generated Answer
                </h4>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs leading-relaxed font-sans shadow-inner whitespace-pre-wrap selection:bg-indigo-500 selection:text-white border border-slate-800">
                  {rawText}
                </div>
              </div>

              {/* Grounding Citations List */}
              {citations.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Extracted Grounding & Citation URLs ({citations.length})
                  </h4>
                  <div className="space-y-1.5">
                    {citations.map((url, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="font-mono text-slate-700 truncate">{url}</span>
                        </div>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-indigo-600 p-1 flex-shrink-0"
                          title="Open source URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Structured JSON Inspector */
            <div>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed shadow-inner border border-slate-800">
                {JSON.stringify(
                  activity.extractedMetrics || {
                    query,
                    brand_mentioned: true,
                    sentiment: 'positive',
                    model_version: model,
                    citations,
                    synthesis_text: rawText,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Captured via Vercel AI SDK generateObject</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
