'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Radio, CheckCircle2 } from 'lucide-react';

interface TickerItem {
  engine: string;
  engineColor: string;
  engineBg: string;
  engineBorder: string;
  query: string;
  rankBadge: string;
  rankColor: string;
  timeAgo: string;
}

const TICKER_ITEMS: TickerItem[] = [
  {
    engine: 'Perplexity',
    engineColor: 'text-cyan-400',
    engineBg: 'bg-cyan-950/60',
    engineBorder: 'border-cyan-800/60',
    query: "Analyzing 'Best enterprise software 2026'...",
    rankBadge: 'Brand cited: #1',
    rankColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80',
    timeAgo: 'Just now',
  },
  {
    engine: 'ChatGPT Search',
    engineColor: 'text-emerald-400',
    engineBg: 'bg-emerald-950/60',
    engineBorder: 'border-emerald-800/60',
    query: "Scanning responses for 'Top local service providers'...",
    rankBadge: 'Brand cited: #2',
    rankColor: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80',
    timeAgo: '2s ago',
  },
  {
    engine: 'Google Gemini',
    engineColor: 'text-purple-400',
    engineBg: 'bg-purple-950/60',
    engineBorder: 'border-purple-800/60',
    query: "Checking Gemini AI Overviews for product recommendations...",
    rankBadge: 'Primary Footnote',
    rankColor: 'text-indigo-300 bg-indigo-950/80 border-indigo-800/80',
    timeAgo: '5s ago',
  },
  {
    engine: 'Copilot Pro',
    engineColor: 'text-blue-400',
    engineBg: 'bg-blue-950/60',
    engineBorder: 'border-blue-800/60',
    query: "Evaluating Bing AI conversational groundings for 'SaaS tools'...",
    rankBadge: 'Share of Voice: 68%',
    rankColor: 'text-cyan-300 bg-cyan-950/80 border-cyan-800/80',
    timeAgo: '8s ago',
  },
];

export function LiveQueryTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
        setIsTransitioning(false);
      }, 300);
    }, 3800);

    return () => clearInterval(interval);
  }, [isPaused]);

  const current = TICKER_ITEMS[currentIndex];

  return (
    <div
      className="w-full max-w-3xl mx-auto mt-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative group rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl backdrop-blur-md p-2.5 sm:p-3 transition-all hover:border-slate-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 px-2">
          {/* Live Scanner Radar Indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-emerald-400 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Live AI Scan
            </span>
            <span className="hidden sm:inline-block text-slate-700">|</span>
          </div>

          {/* Dynamic Content Transition Area */}
          <div
            className={`flex-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs transition-all duration-300 ${
              isTransitioning ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
            }`}
          >
            {/* Engine Tag */}
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${current.engineBg} ${current.engineColor} ${current.engineBorder}`}
            >
              {current.engine}
            </span>

            {/* Query String */}
            <span className="text-slate-300 font-medium truncate max-w-[260px] sm:max-w-xs md:max-w-sm">
              {current.query}
            </span>

            {/* Citation Result Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${current.rankColor}`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {current.rankBadge}
            </span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            {TICKER_ITEMS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(idx);
                    setIsTransitioning(false);
                  }, 200);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-4 bg-indigo-500'
                    : 'w-1.5 bg-slate-700 hover:bg-slate-600'
                }`}
                aria-label={`Jump to ticker item ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
