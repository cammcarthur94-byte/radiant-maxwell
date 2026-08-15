'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  Award,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export function DashboardPreviewMockup() {
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(3);

  // SVG Chart points
  const points = [
    { label: 'W1', x: 50, y: 140, val: '52.0%' },
    { label: 'W2', x: 170, y: 110, val: '57.0%' },
    { label: 'W3', x: 290, y: 85, val: '61.0%' },
    { label: 'W4', x: 410, y: 60, val: '64.8%' },
  ];

  return (
    <div className="relative mx-auto max-w-5xl group">
      {/* Ambient Violet Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 rounded-3xl blur-xl opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 pointer-events-none" />

      {/* Main Elevated Card Mockup */}
      <div className="relative bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden">
        {/* Browser Top Chrome */}
        <div className="bg-slate-50/90 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-400" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>

          <div className="flex items-center space-x-2 px-4 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-500 shadow-2xs">
            <span className="text-slate-400">https://</span>
            <span className="text-slate-700 font-semibold">app.brandvisibility.io/dashboard</span>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            <span>Launch Live App</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Dashboard Content Mockup */}
        <div className="p-6 bg-slate-50/50 space-y-6">
          {/* Mini Stat Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Visibility', value: '64.8%', delta: '+2.7%', positive: true },
              { label: 'Citation Rate', value: '3.0%', delta: '+1.2%', positive: true },
              { label: 'Share of Voice', value: '75.0%', delta: '-5.1%', positive: false },
              { label: 'Brand Sentiment', value: '80.0%', delta: '+12.3%', positive: true },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-1"
              >
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold text-slate-900">{stat.value}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      stat.positive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                    }`}
                  >
                    {stat.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Split 65% / 35% Hero Row: Visibility Trend & Competitive Leaderboard */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left: Trend Chart */}
            <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">AI Visibility Trend</h4>
                  <p className="text-[10px] text-slate-400">Indexed presence across 4 conversational engines</p>
                </div>
                <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2 py-0.5 rounded-full">
                  All Engines
                </span>
              </div>

              {/* Responsive SVG */}
              <div className="relative h-44 w-full">
                <svg viewBox="0 0 460 180" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="mockupPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
                      <stop offset="70%" stopColor="#818CF8" stopOpacity="0.10" />
                      <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="mockupLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4F46E5" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[30, 75, 120, 160].map((y, idx) => (
                    <line
                      key={idx}
                      x1="35"
                      y1={y}
                      x2="430"
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray="3 3"
                    />
                  ))}

                  {/* Gradient Area */}
                  <path
                    d="M 50 140 C 110 140, 110 110, 170 110 C 230 110, 230 85, 290 85 C 350 85, 350 60, 410 60 L 410 160 L 50 160 Z"
                    fill="url(#mockupPurple)"
                  />

                  {/* Curve */}
                  <path
                    d="M 50 140 C 110 140, 110 110, 170 110 C 230 110, 230 85, 290 85 C 350 85, 350 60, 410 60"
                    fill="none"
                    stroke="url(#mockupLine)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Markers */}
                  {points.map((pt, i) => (
                    <g
                      key={i}
                      onMouseEnter={() => setHoveredWeek(i)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredWeek === i ? '6' : '4.5'}
                        fill="#ffffff"
                        stroke="#4F46E5"
                        strokeWidth="2.5"
                      />
                      <text
                        x={pt.x}
                        y="175"
                        textAnchor="middle"
                        fontSize="10"
                        fill={hoveredWeek === i ? '#4F46E5' : '#94a3b8'}
                        fontWeight={hoveredWeek === i ? '700' : '600'}
                      >
                        {pt.label}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Interactive Tooltip on hover */}
                {hoveredWeek !== null && (
                  <div
                    className="absolute z-10 bg-slate-900 text-white rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-md -translate-x-1/2 -translate-y-full pointer-events-none"
                    style={{
                      left: `${(points[hoveredWeek].x / 460) * 100}%`,
                      top: `${(points[hoveredWeek].y / 180) * 100}%`,
                    }}
                  >
                    {points[hoveredWeek].val}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  <span>Webflow Aggregate Visibility</span>
                </span>
                <span className="text-emerald-600 font-semibold">+12.8% MoM</span>
              </div>
            </div>

            {/* Right: Leaderboard */}
            <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">Competitive Position</h4>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Award className="w-3 h-3 text-indigo-600" />
                  Rank #2
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { rank: 1, name: 'WordPress VIP', pct: '71.4%', delta: '-1.2%', target: false, bg: 'bg-blue-600' },
                  { rank: 2, name: 'Webflow', pct: '64.8%', delta: '+0.56%', target: true, bg: 'bg-indigo-600' },
                  { rank: 3, name: 'Framer', pct: '53.2%', delta: '+3.4%', target: false, bg: 'bg-sky-500' },
                  { rank: 4, name: 'Squarespace', pct: '42.1%', delta: '-0.8%', target: false, bg: 'bg-neutral-800' },
                ].map((item) => (
                  <div
                    key={item.rank}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs ${
                      item.target
                        ? 'bg-indigo-50/80 border-indigo-200 shadow-2xs'
                        : 'bg-slate-50/50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="font-bold text-slate-400 text-[10px]">#{item.rank}</span>
                      <div
                        className={`w-5 h-5 rounded-md text-white font-bold text-[9px] flex items-center justify-center ${item.bg}`}
                      >
                        {item.name[0]}
                      </div>
                      <span
                        className={`truncate font-semibold ${
                          item.target ? 'text-indigo-950 font-bold' : 'text-slate-800'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{item.pct}</span>
                      <span
                        className={`text-[10px] font-semibold ${
                          item.delta.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {item.delta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 text-center">
                <Link
                  href="/dashboard"
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Explore all 18 competitors &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Hover Overlay CTA */}
        <Link
          href="/dashboard"
          className="absolute inset-0 bg-indigo-950/20 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        >
          <div className="px-5 py-3 rounded-2xl bg-white text-indigo-900 font-bold text-xs shadow-2xl flex items-center space-x-2 border border-slate-200 transform group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Click to explore live interactive dashboard</span>
            <ArrowUpRight className="w-4 h-4 text-indigo-600" />
          </div>
        </Link>
      </div>
    </div>
  );
}
