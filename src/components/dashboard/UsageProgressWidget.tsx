'use client';

import React from 'react';
import {
  Zap,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useDashboard } from '@/context/dashboard-context';

interface UsageProgressWidgetProps {
  onOpenUpgradeModal: () => void;
}

export function UsageProgressWidget({
  onOpenUpgradeModal,
}: UsageProgressWidgetProps) {
  const { usageMetrics } = useDashboard();

  const items = usageMetrics && usageMetrics.length > 0 ? usageMetrics : [
    {
      id: 'llm_audits',
      name: 'LLM Citations & Audits',
      current: 0,
      max: 5000,
      percentage: 0,
      statusBadge: {
        text: '0% Used',
        variant: 'normal' as const,
      },
      progressColor: 'bg-indigo-600',
    },
    {
      id: 'competitor_tracking',
      name: 'Tracked Competitors',
      current: 0,
      max: 20,
      percentage: 0,
      statusBadge: {
        text: 'None',
        variant: 'normal' as const,
      },
      progressColor: 'bg-emerald-500',
    },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between h-full transition-colors">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Usage This Month
              </h2>
              <span className="text-xs text-slate-400 font-mono">Billing Cycle</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Plan allocation resets in <strong className="text-slate-700">14 days</strong> (Sept 01, 2026)
            </p>
          </div>

          <button
            onClick={onOpenUpgradeModal}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Manage Plan</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Progress Bars List */}
        <div className="mt-5 space-y-5">
          {items.map((item) => {
            const isWarning = item.statusBadge.variant === 'warning';
            const isDanger = item.statusBadge.variant === 'danger';

            return (
              <div key={item.id} className="space-y-2">
                {/* Label Row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        isDanger
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isWarning
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200/60'
                      }`}
                    >
                      {isDanger ? (
                        <AlertCircle className="w-2.5 h-2.5" />
                      ) : isWarning ? (
                        <AlertTriangle className="w-2.5 h-2.5" />
                      ) : (
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      )}
                      <span>{item.statusBadge.text}</span>
                    </span>
                  </div>

                  {/* Numbers */}
                  <div className="font-mono text-slate-600">
                    <strong className="text-slate-900">{item.current.toLocaleString()}</strong> /{' '}
                    <span>{item.max.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.progressColor}`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade Banner in Widget Footer */}
      <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">Need higher prompt tracking limits?</div>
            <div className="text-[11px] text-slate-500">Upgrade to Enterprise Unlimited for continuous LLM sync.</div>
          </div>
        </div>

        <button
          onClick={onOpenUpgradeModal}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
        >
          Add Quota
        </button>
      </div>
    </div>
  );
}
