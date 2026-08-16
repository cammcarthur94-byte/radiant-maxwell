'use client';

import React from 'react';

export interface VisibilityImpactChartProps {
  data?: {
    month: string;
    visibilityScore: number;
    sovValueK: number; // In thousands of dollars ($k)
  }[];
}

export function VisibilityImpactChart({
  data = [
    { month: 'Mar', visibilityScore: 52, sovValueK: 28 },
    { month: 'Apr', visibilityScore: 58, sovValueK: 36 },
    { month: 'May', visibilityScore: 63, sovValueK: 52 },
    { month: 'Jun', visibilityScore: 69, sovValueK: 74 },
    { month: 'Jul', visibilityScore: 74, sovValueK: 98 },
    { month: 'Aug', visibilityScore: 78, sovValueK: 124 },
  ],
}: VisibilityImpactChartProps) {
  const width = 540;
  const height = 200;
  const padding = { top: 20, right: 45, bottom: 30, left: 40 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // X coordinate mapping
  const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;

  // Left Y: Visibility Score (0 to 100)
  const getVisibilityY = (val: number) =>
    padding.top + chartHeight - (val / 100) * chartHeight;

  // Right Y: SOV Value ($0 to $150k)
  const getSovY = (val: number) =>
    padding.top + chartHeight - (val / 150) * chartHeight;

  // Line path for Visibility Score
  const visibilityPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getVisibilityY(d.visibilityScore)}`)
    .join(' ');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Impact Correlation: Visibility vs. Estimated SOV Value
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Correlating monthly AI visibility gains with organic search pipeline value
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-200 border border-indigo-400" />
            <span>Est. SOV Value ($k)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-600 rounded-full" />
            <span>Overall Visibility Score</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[0, 25, 50, 75, 100].map((score) => {
            const y = getVisibilityY(score);
            return (
              <line
                key={score}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#f1f5f9"
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Left Y-Axis Labels (Visibility Score 0 - 100) */}
          {[0, 25, 50, 75, 100].map((score) => (
            <text
              key={score}
              x={padding.left - 8}
              y={getVisibilityY(score) + 3}
              textAnchor="end"
              className="text-[9px] font-mono fill-slate-400 font-semibold"
            >
              {score}
            </text>
          ))}

          {/* Right Y-Axis Labels (SOV Value $0k - $150k) */}
          {[0, 35, 75, 115, 150].map((val) => (
            <text
              key={val}
              x={width - padding.right + 8}
              y={getSovY(val) + 3}
              textAnchor="start"
              className="text-[9px] font-mono fill-indigo-400 font-semibold"
            >
              ${val}k
            </text>
          ))}

          {/* Dual-Axis Bars: Estimated SOV Value ($k) */}
          {data.map((d, i) => {
            const x = getX(i) - 14;
            const y = getSovY(d.sovValueK);
            const barHeight = padding.top + chartHeight - y;
            return (
              <rect
                key={d.month}
                x={x}
                y={y}
                width={28}
                height={barHeight}
                rx={6}
                fill="url(#barGradient)"
                stroke="#818cf8"
                strokeWidth={1}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              />
            );
          })}

          {/* Line Path: Overall AI Visibility Score */}
          <path
            d={visibilityPath}
            fill="none"
            stroke="#4f46e5"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Line Vertex Points */}
          {data.map((d, i) => (
            <circle
              key={d.month}
              cx={getX(i)}
              cy={getVisibilityY(d.visibilityScore)}
              r={4}
              fill="#ffffff"
              stroke="#4f46e5"
              strokeWidth={2.5}
            />
          ))}

          {/* X-Axis Labels (Months) */}
          {data.map((d, i) => (
            <text
              key={d.month}
              x={getX(i)}
              y={height - 8}
              textAnchor="middle"
              className="text-[10px] font-mono font-medium fill-slate-500"
            >
              {d.month}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
