'use client';

import React from 'react';
import { Bot, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface EngineItem {
  name: string;
  sublabel: string;
  badge: string;
  badgeColor: string;
  logo: (className?: string) => React.ReactNode;
}

const ENGINES: EngineItem[] = [
  {
    name: 'ChatGPT',
    sublabel: 'GPT-4o & Search',
    badge: 'Live Grounding',
    badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80',
    logo: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.259 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7466-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.66-4.1354a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1402-1.6564zm-1.637-8.252a4.4755 4.4755 0 0 1 2.3418-1.9729v5.6725a.7901.7901 0 0 0 .388.6766l5.8144 3.3543-2.02 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866a4.4992 4.4992 0 0 1-1.623-6.1122zm16.5164 2.8764l-5.8144-3.3543 2.02-1.1683a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4304-.6957zm2.015-3.3449l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L8.609 10.1297V7.7973a.0804.0804 0 0 1 .0332-.0615l4.883-2.8246a4.4993 4.4993 0 0 1 6.6802 4.667zm-12.641 4.1354l-2.02-1.1635a.0804.0804 0 0 1-.038-.052V7.0984a4.5 4.5 0 0 1 7.37-3.4537l-.142.0805-4.783 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369zm1.4808-2.375l2.5977-1.4988 2.5977 1.4988v3.0024l-2.5977 1.4988-2.5977-1.4988z"/>
      </svg>
    ),
  },
  {
    name: 'Perplexity',
    sublabel: 'Sonar 3.0 Deep Research',
    badge: 'Domain Rank',
    badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/80',
    logo: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L4 6.5V17.5L12 22L20 17.5V6.5L12 2ZM12 4.3L18 7.7V11.2L12 7.8V4.3ZM12 12.8L18 16.2V16.3L12 19.7V12.8ZM6 7.7L12 4.3V7.8L6 11.2V7.7ZM6 16.3V16.2L12 12.8V19.7L6 16.3Z" />
      </svg>
    ),
  },
  {
    name: 'Google Gemini',
    sublabel: 'AI Overviews & SGE',
    badge: 'Knowledge Graph',
    badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-800/80',
    logo: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 24C12 17.3726 6.62742 12 0 12C6.62742 12 12 6.62742 12 0C12 6.62742 17.3726 12 24 12C17.3726 12 12 17.3726 12 24Z" />
      </svg>
    ),
  },
  {
    name: 'Microsoft Copilot',
    sublabel: 'Bing Conversational',
    badge: 'Web Grounding',
    badgeColor: 'text-blue-400 bg-blue-950/60 border-blue-800/80',
    logo: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.5 2C6.25 2 2 6.25 2 11.5c0 1.95.59 3.76 1.6 5.27L2 22l5.41-1.54C8.87 21.36 10.63 22 12.5 22 17.75 22 22 17.75 22 12.5S17.75 2 12.5 2h-1zM7 9h10v2H7V9zm0 4h7v2H7v-2z" />
      </svg>
    ),
  },
];

export function EngineBrandRow() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-10">
      <div className="text-center mb-3.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-indigo-500" />
          Continuous Real-Time Telemetry Across Primary AI Engines
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {ENGINES.map((eng, idx) => (
          <div
            key={idx}
            className="group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:bg-indigo-600 transition-colors">
                  {eng.logo('w-4 h-4')}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">
                    {eng.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">{eng.sublabel}</p>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Active Engine
              </span>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${eng.badgeColor}`}
              >
                {eng.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
