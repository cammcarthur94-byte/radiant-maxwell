'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Bot,
  ArrowUpRight,
  Eye,
  ArrowDownRight,
} from 'lucide-react';
import { SentimentDistribution, ActivityEvent } from '@/types/dashboard';
import { useDashboard } from '@/context/dashboard-context';

interface SentimentDeepDiveWidgetProps {
  data?: SentimentDistribution;
  onInspectSnippet?: (activity: ActivityEvent | null) => void;
  isLoading?: boolean;
}

export function SentimentDeepDiveWidget({
  data,
  onInspectSnippet,
  isLoading = false,
}: SentimentDeepDiveWidgetProps) {
  const { sentimentData, activities, activeTenant } = useDashboard();
  const current = data || sentimentData;

  const sampleActivity = activities.find((a) => a.rawResponseText || a.description) || activities[0] || null;

  const handleExportCard = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Category,Percentage,NetScore\n' +
      `Positive,${current.positivePct}%,${current.netScore}\n` +
      `Neutral,${current.neutralPct}%,${current.netScore}\n` +
      `Negative,${current.negativePct}%,${current.netScore}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sentiment_${activeTenant?.name || 'brand'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs animate-pulse">
        <div className="h-5 w-40 bg-slate-200 rounded mb-4"></div>
        <div className="h-40 w-40 mx-auto rounded-full bg-slate-100 mb-4"></div>
        <div className="h-10 bg-slate-100 rounded-lg"></div>
      </div>
    );
  }

  // Calculate donut chart SVG parameters
  const radius = 54;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const positiveOffset = 0;
  const positiveStroke = (current.positivePct / 100) * circumference;
  const neutralStroke = (current.neutralPct / 100) * circumference;
  const negativeStroke = (current.negativePct / 100) * circumference;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full transition-colors">
      {/* Header with Title and SE Visible Square Export Icon */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Sentiment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Polarity breakdown from brand mentions across AI outputs
            </p>
          </div>

          {/* Standardized Square Export Action Icon (SE Visible Style) */}
          <button
            onClick={handleExportCard}
            className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition-colors cursor-pointer"
            title="Export Sentiment Breakdown (CSV)"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Circular Donut Visual (SE Visible Style) */}
        <div className="py-4 flex flex-col items-center justify-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
              {/* Background Ring */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-slate-100"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Neutral Segment */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-slate-300 transition-all duration-700"
                strokeWidth={strokeWidth}
                strokeDasharray={`${neutralStroke} ${circumference}`}
                strokeDashoffset={-positiveStroke}
                fill="none"
              />
              {/* Positive Segment */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="stroke-emerald-600 transition-all duration-700"
                strokeWidth={strokeWidth}
                strokeDasharray={`${positiveStroke} ${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                fill="none"
              />
              {/* Negative Segment (if any) */}
              {current.negativePct > 0 && (
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  className="stroke-rose-500 transition-all duration-700"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${negativeStroke} ${circumference}`}
                  strokeDashoffset={-(positiveStroke + neutralStroke)}
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>

            {/* Center Net Score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                +{current.netScore}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Net Score
              </span>
            </div>
          </div>

          {/* Legend Items (SE Visible Style) */}
          <div className="mt-3 flex items-center justify-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
              <span>{current.positivePct}% Positive</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span>{current.negativePct}% Negative</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
              <span>{current.neutralPct}% Neutral</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-2 font-medium">
            Analyzed 187 sentiment-bearing mentions
          </div>
        </div>

        {/* Verbatim AI-Generated Response Snippet Compartment */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 space-y-1.5 mt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Grounding Snippet
              </span>
            </div>
            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded font-semibold">
              {current.sampleEngine}
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed italic font-serif bg-white/70 p-2 rounded-lg border border-slate-200/60 shadow-2xs line-clamp-2">
            "{current.sampleSnippet}"
          </p>
        </div>
      </div>

      {/* Footer Delta vs Reference Date */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1 text-rose-600 font-mono font-bold">
          <span>-5 from 2026-01-15</span>
          <ArrowDownRight className="w-3.5 h-3.5" />
        </div>

        <Link
          href="/dashboard/share-of-voice"
          className="text-indigo-600 hover:underline font-semibold flex items-center gap-1"
        >
          <span>Deep Matrix</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
