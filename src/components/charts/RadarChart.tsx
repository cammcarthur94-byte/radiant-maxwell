'use client';

import React from 'react';

export interface RadarChartProps {
  brandName?: string;
  data?: {
    axis: string;
    brand: number;
    industryAvg: number;
    topPerformer: number;
  }[];
}

export function RadarChart({
  brandName = 'Acme Corp',
  data = [
    { axis: 'AEO', brand: 85, industryAvg: 60, topPerformer: 92 },
    { axis: 'GEO', brand: 72, industryAvg: 55, topPerformer: 88 },
    { axis: 'AIO', brand: 78, industryAvg: 58, topPerformer: 90 },
    { axis: 'Citations', brand: 68, industryAvg: 50, topPerformer: 85 },
    { axis: 'Coverage', brand: 80, industryAvg: 62, topPerformer: 94 },
  ],
}: RadarChartProps) {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const count = data.length;

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / count) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = (Math.PI * 2 / count) * index - Math.PI / 2;
    const r = radius + 22;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate Polygon Path for specific metric key
  const generatePolygon = (key: 'brand' | 'industryAvg' | 'topPerformer') => {
    const points = data.map((d, i) => {
      const { x, y } = getCoordinates(i, d[key]);
      return `${x},${y}`;
    });
    return points.join(' ');
  };

  const concentricLevels = [25, 50, 75, 100];

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[280px] h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id="radarBrandGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Concentric Web Polygons */}
        {concentricLevels.map((lvl) => {
          const points = data.map((_, i) => {
            const { x, y } = getCoordinates(i, lvl);
            return `${x},${y}`;
          }).join(' ');
          return (
            <polygon
              key={lvl}
              points={points}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={lvl === 100 ? 'none' : '2 2'}
            />
          );
        })}

        {/* Axis Lines from Center to Tips */}
        {data.map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* 1. Industry Avg Polygon (Dashed Grey) */}
        <polygon
          points={generatePolygon('industryAvg')}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* 2. Top Performer Polygon (Emerald Line) */}
        <polygon
          points={generatePolygon('topPerformer')}
          fill="none"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />

        {/* 3. Acme Corp Brand Polygon (Blue/Purple Gradient Area Fill) */}
        <polygon
          points={generatePolygon('brand')}
          fill="url(#radarBrandGradient)"
          stroke="#2563eb"
          strokeWidth="2.5"
        />

        {/* Acme Corp Vertex Points */}
        {data.map((d, i) => {
          const { x, y } = getCoordinates(i, d.brand);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3.5"
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Axis Labels */}
        {data.map((d, i) => {
          const { x, y } = getLabelCoordinates(i);
          return (
            <text
              key={i}
              x={x}
              y={y + 4}
              textAnchor="middle"
              className="text-[10px] font-bold fill-slate-500 font-mono uppercase"
            >
              {d.axis}
            </text>
          );
        })}
      </svg>

      {/* Radar Legend (Matching Figma) */}
      <div className="flex items-center justify-center gap-4 text-[11px] pt-3 text-slate-600 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
          <span>{brandName}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span>Industry Avg</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          <span>Top Performer</span>
        </div>
      </div>
    </div>
  );
}
