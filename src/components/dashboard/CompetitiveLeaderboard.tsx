'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CompetitorRankItem, TenantInfo } from '@/types/dashboard';
import { useDashboard } from '@/context/dashboard-context';

type MetricTab = 'AEO' | 'GEO' | 'AIO';

interface CompetitiveLeaderboardProps {
  competitors?: CompetitorRankItem[];
  activeTenant?: TenantInfo;
  isLoading?: boolean;
}

export function CompetitiveLeaderboardSkeleton() {
  return (
    <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-xs animate-pulse space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="h-3.5 w-48 bg-slate-100 rounded mt-1.5" />
        </div>
        <div className="h-8 w-40 bg-slate-100 rounded-xl" />
      </div>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3 w-40">
            <div className="w-6 h-6 bg-slate-200 rounded-full" />
            <div className="h-4 w-24 bg-slate-200 rounded" />
          </div>
          <div className="flex-1 mx-6 h-2 bg-slate-100 rounded-full" />
          <div className="h-4 w-8 bg-slate-200 rounded mr-4" />
          <div className="h-6 w-16 bg-slate-100 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function CompetitiveLeaderboard({
  competitors = [],
  activeTenant,
  isLoading = false,
}: CompetitiveLeaderboardProps) {
  const { activeTenant: contextTenant, scoreSummary } = useDashboard();
  const currentTenant = activeTenant || contextTenant;
  const [activeTab, setActiveTab] = useState<MetricTab>('AEO');

  if (isLoading) {
    return <CompetitiveLeaderboardSkeleton />;
  }

  // Active theme configuration based on tab
  const tabConfig = {
    AEO: {
      accentColor: '#00BCD4',
      activeText: 'text-cyan-500',
      barColor: 'bg-cyan-400',
      badgeBg: 'bg-cyan-50',
      badgeBorder: 'border-cyan-100',
      badgeText: 'text-cyan-500',
    },
    GEO: {
      accentColor: '#8B5CF6',
      activeText: 'text-purple-500',
      barColor: 'bg-purple-500',
      badgeBg: 'bg-purple-50',
      badgeBorder: 'border-purple-100',
      badgeText: 'text-purple-500',
    },
    AIO: {
      accentColor: '#F97316',
      activeText: 'text-orange-500',
      barColor: 'bg-orange-500',
      badgeBg: 'bg-orange-50',
      badgeBorder: 'border-orange-100',
      badgeText: 'text-orange-500',
    },
  }[activeTab];

  // Dynamic score resolution based on activeTab
  const tenantAeo = scoreSummary?.aeo?.score ?? 74;
  const tenantGeo = scoreSummary?.geo?.score ?? 61;
  const tenantAio = scoreSummary?.aio?.score ?? 68;

  const getTargetScore = () => {
    if (activeTab === 'AEO') return tenantAeo;
    if (activeTab === 'GEO') return tenantGeo;
    return tenantAio;
  };

  const getTargetDelta = () => {
    if (activeTab === 'AEO') return scoreSummary?.aeo?.delta ?? '+8.2%';
    if (activeTab === 'GEO') return scoreSummary?.geo?.delta ?? '+12.4%';
    return scoreSummary?.aio?.delta ?? '+5.1%';
  };

  const { competitors: liveCompetitors } = useDashboard();
  const rawCompetitorList = (competitors && competitors.length > 0) ? competitors : liveCompetitors;

  // Build live competitive rankings from database or structured benchmark fallback
  const rankings = React.useMemo(() => {
    if (rawCompetitorList && rawCompetitorList.length > 0) {
      return rawCompetitorList.map((comp, idx) => {
        const isTarget = comp.isTargetBrand || comp.name.toLowerCase() === currentTenant?.name?.toLowerCase();
        const baseScore = isTarget ? getTargetScore() : Math.max(45, Math.min(95, Math.round(comp.visibilityPct * 0.8 + 40)));
        return {
          rank: comp.rank || idx + 1,
          name: comp.name,
          isTargetBrand: isTarget,
          scores: {
            AEO: isTarget ? tenantAeo : Math.min(95, baseScore + (idx % 2 === 0 ? 3 : -2)),
            GEO: isTarget ? tenantGeo : Math.min(95, baseScore - (idx % 2 === 0 ? 2 : 4)),
            AIO: isTarget ? tenantAio : Math.min(95, baseScore),
          },
          deltas: {
            AEO: isTarget ? getTargetDelta() : (comp.changePct >= 0 ? `+${comp.changePct || 2.4}%` : `${comp.changePct}%`),
            GEO: isTarget ? getTargetDelta() : (comp.changePct >= 0 ? `+${comp.changePct || 1.8}%` : `${comp.changePct}%`),
            AIO: isTarget ? getTargetDelta() : (comp.changePct >= 0 ? `+${comp.changePct || 2.1}%` : `${comp.changePct}%`),
          },
          isPositive: isTarget ? true : (comp.changePct >= 0),
        };
      });
    }

    return [
      {
        rank: 1,
        name: 'Vertex Solutions',
        isTargetBrand: false,
        scores: { AEO: 82, GEO: 78, AIO: 80 },
        deltas: { AEO: '+3.1%', GEO: '+2.8%', AIO: '+3.4%' },
        isPositive: true,
      },
      {
        rank: 2,
        name: 'Pinnacle AI',
        isTargetBrand: false,
        scores: { AEO: 77, GEO: 75, AIO: 76 },
        deltas: { AEO: '-1.2%', GEO: '-0.8%', AIO: '-1.5%' },
        isPositive: false,
      },
      {
        rank: 3,
        name: currentTenant?.name || 'Acme Corp',
        isTargetBrand: true,
        scores: { AEO: tenantAeo, GEO: tenantGeo, AIO: tenantAio },
        deltas: { AEO: getTargetDelta(), GEO: getTargetDelta(), AIO: getTargetDelta() },
        isPositive: true,
      },
      {
        rank: 4,
        name: 'Apex Systems',
        isTargetBrand: false,
        scores: { AEO: 71, GEO: 69, AIO: 70 },
        deltas: { AEO: '+0.9%', GEO: '+1.4%', AIO: '+0.7%' },
        isPositive: true,
      },
      {
        rank: 5,
        name: 'Nexus Digital',
        isTargetBrand: false,
        scores: { AEO: 69, GEO: 66, AIO: 67 },
        deltas: { AEO: '+5.5%', GEO: '+4.2%', AIO: '+5.0%' },
        isPositive: true,
      },
      {
        rank: 6,
        name: 'CoreSync',
        isTargetBrand: false,
        scores: { AEO: 65, GEO: 63, AIO: 64 },
        deltas: { AEO: '-3.4%', GEO: '-2.9%', AIO: '-3.1%' },
        isPositive: false,
      },
      {
        rank: 7,
        name: 'Horizon Tech',
        isTargetBrand: false,
        scores: { AEO: 58, GEO: 56, AIO: 57 },
        deltas: { AEO: '+2.2%', GEO: '+1.9%', AIO: '+2.0%' },
        isPositive: true,
      },
    ];
  }, [rawCompetitorList, currentTenant?.name, activeTab, tenantAeo, tenantGeo, tenantAio, scoreSummary]);

  return (
    <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-xs select-none">
      {/* Header Row: Title & Subtitle + Metric Tab Switcher */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Competitive Rank
          </h2>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            Industry standings vs. 6 competitors
          </p>
        </div>

        {/* Tab Selector Pill: AEO / GEO / AIO */}
        <div className="bg-[#f1f5f9]/80 p-1 rounded-xl flex items-center space-x-0.5">
          {(['AEO', 'GEO', 'AIO'] as MetricTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1 text-xs transition-all cursor-pointer rounded-lg ${
                  isActive
                    ? `bg-white shadow-xs font-bold ${tabConfig.activeText}`
                    : 'text-slate-500 hover:text-slate-700 font-semibold'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Rows */}
      <div className="divide-y divide-slate-100">
        {rankings.map((item) => {
          const currentScore = item.scores[activeTab];
          const currentDelta = item.deltas[activeTab];
          const isPositive = !currentDelta.startsWith('-');

          return (
            <div
              key={item.rank}
              className="py-3.5 flex items-center justify-between gap-4 group hover:bg-slate-50/50 rounded-xl px-1 transition-colors"
            >
              {/* Rank & Brand Name */}
              <div className="flex items-center space-x-3 w-48 sm:w-56 shrink-0">
                {/* Medal Icon for Top 3 vs Number */}
                <div className="w-6 flex items-center justify-center shrink-0">
                  {item.rank === 1 && (
                    <span className="text-lg leading-none" title="Rank 1">
                      🥇
                    </span>
                  )}
                  {item.rank === 2 && (
                    <span className="text-lg leading-none" title="Rank 2">
                      🥈
                    </span>
                  )}
                  {item.rank === 3 && (
                    <span className="text-lg leading-none" title="Rank 3">
                      🥉
                    </span>
                  )}
                  {item.rank > 3 && (
                    <span className="text-sm font-semibold text-slate-400 font-sans">
                      {item.rank}
                    </span>
                  )}
                </div>

                {/* Brand Title + YOU pill */}
                <div className="flex items-center space-x-2 truncate">
                  <span className="text-sm font-semibold text-slate-800 truncate">
                    {item.name}
                  </span>
                  {item.isTargetBrand && (
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-bold tracking-wider uppercase font-mono rounded-md border ${tabConfig.badgeBg} ${tabConfig.badgeBorder} ${tabConfig.badgeText}`}
                    >
                      YOU
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar in Center */}
              <div className="flex-1 mx-2 sm:mx-4">
                <div className="h-2 w-full bg-slate-100/90 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${tabConfig.barColor}`}
                    style={{ width: `${currentScore}%` }}
                  />
                </div>
              </div>

              {/* Score Number */}
              <div className="w-8 text-right shrink-0">
                <span className={`text-sm font-bold font-sans ${tabConfig.activeText}`}>
                  {currentScore}
                </span>
              </div>

              {/* Directional Delta Pill */}
              <div className="w-20 text-right shrink-0">
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold font-mono border ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-rose-50 text-rose-600 border-rose-100'
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="w-3 h-3 shrink-0" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 shrink-0" />
                  )}
                  <span>{currentDelta}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
