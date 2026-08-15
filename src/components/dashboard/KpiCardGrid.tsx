'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { KpiMetric } from '@/types/dashboard';
import { useDashboard } from '@/context/dashboard-context';

interface KpiCardGridProps {
  metrics?: KpiMetric[];
  isLoading?: boolean;
}

interface ScoreGaugeProps {
  score: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

function CircularScoreGauge({
  score,
  color,
  size = 54,
  strokeWidth = 4,
}: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(score, 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Foreground progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Centered score text */}
      <span className="absolute font-bold text-xs text-slate-800 font-sans">
        {score}
      </span>
    </div>
  );
}

export function KpiCardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm animate-pulse flex flex-col justify-between h-44"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            <div className="h-5 w-14 bg-slate-100 rounded-full" />
          </div>
          <div className="flex items-center space-x-3.5 mt-3">
            <div className="w-12 h-12 rounded-full bg-slate-200" />
            <div className="h-8 w-24 bg-slate-200 rounded" />
          </div>
          <div className="h-3 w-4/5 bg-slate-100 rounded mt-3" />
          <div className="h-1 w-full bg-slate-100 rounded-full mt-4" />
        </div>
      ))}
    </div>
  );
}

export function KpiCardGrid({ metrics = [], isLoading = false }: KpiCardGridProps) {
  const { scoreSummary, totalCitationsCount } = useDashboard();

  if (isLoading) {
    return <KpiCardGridSkeleton />;
  }

  const cardsData = [
    {
      id: 'aeo',
      label: 'AEO SCORE',
      labelColor: 'text-cyan-500',
      accentColor: '#06B6D4',
      barColor: 'from-cyan-400 to-cyan-500',
      score: scoreSummary?.aeo?.score ?? 74,
      showOutOfHundred: true,
      delta: scoreSummary?.aeo?.delta ?? '+8.2%',
      isPositive: scoreSummary?.aeo?.isPositive ?? true,
      description: scoreSummary?.aeo?.description ?? 'Answer Engine Optimization across queried models',
    },
    {
      id: 'geo',
      label: 'GEO SCORE',
      labelColor: 'text-purple-500',
      accentColor: '#8B5CF6',
      barColor: 'from-purple-400 to-purple-500',
      score: scoreSummary?.geo?.score ?? 61,
      showOutOfHundred: true,
      delta: scoreSummary?.geo?.delta ?? '+12.4%',
      isPositive: scoreSummary?.geo?.isPositive ?? true,
      description: scoreSummary?.geo?.description ?? 'Generative Engine Optimization — context extraction',
    },
    {
      id: 'aio',
      label: 'AIO SCORE',
      labelColor: 'text-orange-500',
      accentColor: '#F97316',
      barColor: 'from-orange-400 to-orange-500',
      score: scoreSummary?.aio?.score ?? 68,
      showOutOfHundred: true,
      delta: scoreSummary?.aio?.delta ?? '+5.1%',
      isPositive: scoreSummary?.aio?.isPositive ?? true,
      description: scoreSummary?.aio?.description ?? 'AI Optimization — structured data & knowledge accuracy',
    },
    {
      id: 'overall',
      label: 'OVERALL VISIBILITY',
      labelColor: 'text-emerald-500',
      accentColor: '#10B981',
      barColor: 'from-emerald-400 to-emerald-500',
      score: scoreSummary?.overall?.score ?? 68,
      showOutOfHundred: false,
      delta: scoreSummary?.overall?.delta ?? '+8.6%',
      isPositive: scoreSummary?.overall?.isPositive ?? true,
      description: scoreSummary?.overall?.description ?? `${(totalCitationsCount || 3747).toLocaleString()} total citations tracked this period`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cardsData.map((card) => (
        <div
          key={card.id}
          className="bg-white border border-slate-100/90 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          {/* Card Header: Score Label + Green Delta Pill */}
          <div className="flex items-center justify-between pb-1">
            <span className={`text-[11px] font-bold tracking-wider font-mono uppercase ${card.labelColor}`}>
              {card.label}
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 font-mono">
              <ArrowUpRight className="w-3 h-3" />
              <span>{card.delta}</span>
            </span>
          </div>

          {/* Card Body: Circular Ring Gauge + Large Stat */}
          <div className="my-3 flex items-center space-x-3.5">
            <CircularScoreGauge score={card.score} color={card.accentColor} size={50} strokeWidth={4} />
            <div className="flex items-baseline leading-none">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
                {card.score}
              </span>
              {card.showOutOfHundred && (
                <span className="text-xs font-medium text-slate-400 ml-1">
                  /100
                </span>
              )}
            </div>
          </div>

          {/* Subtitle Description */}
          <p className="text-[11px] text-slate-500 font-normal leading-relaxed line-clamp-2 min-h-[32px]">
            {card.description}
          </p>

          {/* Bottom Accent Bar Line */}
          <div className="mt-4 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${card.barColor} rounded-full`} style={{ width: `${card.score}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
