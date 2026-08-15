'use client';

import React, { useState } from 'react';
import { VisibilityTrendPoint, PlatformOption } from '@/types/dashboard';

import { useDashboard } from '@/context/dashboard-context';

interface HeroVisibilityTrendProps {
  trendData?: VisibilityTrendPoint[];
  selectedPlatform?: PlatformOption;
  isLoading?: boolean;
}

export function HeroVisibilityTrendSkeleton() {
  return (
    <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-xs animate-pulse h-full min-h-[380px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-5 w-32 bg-slate-200 rounded-md" />
          <div className="h-3.5 w-48 bg-slate-100 rounded mt-2" />
        </div>
        <div className="h-4 w-36 bg-slate-100 rounded-full" />
      </div>
      <div className="my-6 h-56 bg-slate-50/80 rounded-2xl" />
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-3 w-8 bg-slate-100 rounded" />
        ))}
      </div>
    </div>
  );
}

export function HeroVisibilityTrend({
  trendData = [],
  isLoading = false,
}: HeroVisibilityTrendProps) {
  const { monthlyScoreTrends } = useDashboard();
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);

  if (isLoading) {
    return <HeroVisibilityTrendSkeleton />;
  }

  // 6-Month rolling performance monthly data from calculation service or fallback
  const monthsData =
    monthlyScoreTrends && monthlyScoreTrends.length > 0
      ? monthlyScoreTrends
      : [
          { month: 'Mar', aeo: 62, geo: 50, aio: 56 },
          { month: 'Apr', aeo: 65, geo: 53, aio: 59 },
          { month: 'May', aeo: 68, geo: 55, aio: 62 },
          { month: 'Jun', aeo: 70, geo: 58, aio: 64 },
          { month: 'Jul', aeo: 72, geo: 60, aio: 66 },
          { month: 'Aug', aeo: 74, geo: 61, aio: 68 },
        ];

  // SVG Chart Dimensions
  const svgWidth = 650;
  const svgHeight = 240;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 35;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Y-axis value bounds (30 to 100)
  const minY = 30;
  const maxY = 100;
  const rangeY = maxY - minY;

  const getYCoord = (val: number) => {
    return paddingTop + chartHeight - ((val - minY) / rangeY) * chartHeight;
  };

  const getXCoord = (index: number) => {
    return paddingLeft + (index / (monthsData.length - 1)) * chartWidth;
  };

  // Build SVG Path strings using smooth bezier curves
  const generatePath = (key: 'aeo' | 'geo' | 'aio') => {
    const points = monthsData.map((d, i) => ({
      x: getXCoord(i),
      y: getYCoord(d[key]),
    }));

    if (points.length === 0) return '';

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const aioLinePath = generatePath('aio');
  const aioAreaPath = `${aioLinePath} L ${getXCoord(monthsData.length - 1)} ${getYCoord(minY)} L ${getXCoord(0)} ${getYCoord(minY)} Z`;

  // Grid tick marks on Y-axis: 100, 70, 50, 30
  const yTicks = [100, 70, 50, 30];

  return (
    <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-full min-h-[380px]">
      {/* Header Row: Title & Subtitle + Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Score Trends
          </h2>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            6-month rolling performance
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>AEO</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>GEO</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>AIO</span>
          </div>
        </div>
      </div>

      {/* SVG Multi-Line Chart Canvas */}
      <div className="relative w-full my-auto overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            {/* Orange Gradient Area Fill for AIO */}
            <linearGradient id="scoreTrendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#F97316" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Dotted Grid Lines & Y-Axis Labels */}
          {yTicks.map((tick) => {
            const y = getYCoord(tick);
            return (
              <g key={tick}>
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] font-sans fill-slate-400 font-normal"
                >
                  {tick}
                </text>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + chartWidth}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={aioAreaPath} fill="url(#scoreTrendGradient)" />

          {/* Orange AIO Trend Curve */}
          <path
            d={aioLinePath}
            fill="none"
            stroke="#F97316"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data Points on Line */}
          {monthsData.map((d, idx) => {
            const cx = getXCoord(idx);
            const cy = getYCoord(d.aio);
            const isHovered = hoveredMonthIdx === idx;

            return (
              <g key={idx}>
                {/* Vertical guide on hover */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={paddingTop}
                    x2={cx}
                    y2={paddingTop + chartHeight}
                    stroke="#F97316"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                )}
                {/* Interactive Anchor Point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5 : 3.5}
                  className="fill-orange-500 stroke-white stroke-2 transition-all cursor-pointer"
                  onMouseEnter={() => setHoveredMonthIdx(idx)}
                  onMouseLeave={() => setHoveredMonthIdx(null)}
                />
              </g>
            );
          })}

          {/* X-Axis Month Labels */}
          {monthsData.map((d, idx) => {
            const x = getXCoord(idx);
            const y = paddingTop + chartHeight + 20;
            const isHovered = hoveredMonthIdx === idx;

            return (
              <text
                key={d.month}
                x={x}
                y={y}
                textAnchor="middle"
                className={`text-xs font-sans transition-colors cursor-pointer ${
                  isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-400 font-normal'
                }`}
                onMouseEnter={() => setHoveredMonthIdx(idx)}
                onMouseLeave={() => setHoveredMonthIdx(null)}
              >
                {d.month}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredMonthIdx !== null && (
          <div
            className="absolute top-2 bg-slate-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl pointer-events-none transition-all z-20"
            style={{
              left: `${(getXCoord(hoveredMonthIdx) / svgWidth) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-bold text-[11px] text-slate-300 pb-1 border-b border-slate-700">
              {monthsData[hoveredMonthIdx].month} 2025
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div>
                <span className="text-cyan-400 font-semibold">AEO:</span> {monthsData[hoveredMonthIdx].aeo}
              </div>
              <div>
                <span className="text-purple-400 font-semibold">GEO:</span> {monthsData[hoveredMonthIdx].geo}
              </div>
              <div>
                <span className="text-orange-400 font-semibold">AIO:</span> {monthsData[hoveredMonthIdx].aio}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
