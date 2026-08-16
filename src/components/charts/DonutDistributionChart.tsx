'use client';

import React from 'react';

export interface DonutSegment {
  label: string;
  percentage: number;
  color: string;
  subtext: string;
}

export interface DonutDistributionChartProps {
  title?: string;
  subtitle?: string;
  segments?: DonutSegment[];
}

export function DonutDistributionChart({
  segments = [
    {
      label: 'Direct',
      percentage: 46,
      color: '#06b6d4', // Cyan
      subtext: 'Exact brand name mentioned in AI response',
    },
    {
      label: 'Paraphrase',
      percentage: 32,
      color: '#8b5cf6', // Purple
      subtext: 'Brand referenced without exact name',
    },
    {
      label: 'Implied',
      percentage: 21,
      color: '#f97316', // Orange
      subtext: 'Content used without explicit attribution',
    },
  ],
}: DonutDistributionChartProps) {
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
      {/* SVG Donut Ring */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          {segments.map((seg, i) => {
            const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((cumulativePercent / 100) * circumference);
            cumulativePercent += seg.percentage;

            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-500 hover:opacity-90 cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Center Cutout Text */}
        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl font-bold text-slate-800 tracking-tight">100%</span>
          <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Total</span>
        </div>
      </div>

      {/* Legend List */}
      <div className="space-y-3 flex-1">
        {segments.map((seg, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-xs font-bold text-slate-800">{seg.label}</span>
              <span className="text-xs font-mono font-bold text-slate-500">{seg.percentage}%</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight pl-4">
              {seg.subtext}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
