'use client';

import React from 'react';
import { Zap } from 'lucide-react';
import { ActivityEvent } from '@/types/dashboard';
import { useDashboard } from '@/context/dashboard-context';

interface RecentActivityFeedProps {
  activities?: ActivityEvent[];
  onInspectSnippet?: (activity: ActivityEvent) => void;
  isLoading?: boolean;
}

export function RecentActivityFeedSkeleton() {
  return (
    <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-xs animate-pulse h-full min-h-[380px] space-y-4">
      <div className="flex items-center justify-between pb-2">
        <div className="h-5 w-32 bg-slate-200 rounded" />
        <div className="w-5 h-5 bg-orange-100 rounded-full" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-3.5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2">
          <div className="h-4 w-3/4 bg-slate-200 rounded" />
          <div className="h-3 w-full bg-slate-100 rounded" />
          <div className="h-2.5 w-1/4 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  );
}

export function RecentActivityFeed({
  activities = [],
  onInspectSnippet,
  isLoading = false,
}: RecentActivityFeedProps) {
  const { recentScoreInsights } = useDashboard();

  if (isLoading) {
    return <RecentActivityFeedSkeleton />;
  }

  const displayInsights =
    recentScoreInsights && recentScoreInsights.length > 0
      ? recentScoreInsights
      : [
          {
            id: 'insight-1',
            title: 'Perplexity AEO surge',
            dotColor: 'bg-emerald-500',
            description: 'Citation frequency up +8.2% — brand appears in 4 of top 5 product-search queries.',
            timeAgo: '2h ago',
            model: 'Perplexity',
          },
          {
            id: 'insight-2',
            title: 'Gemini GEO leads all models',
            dotColor: 'bg-emerald-500',
            description: 'Structured data markup is driving superior context extraction. Score: 70/100.',
            timeAgo: '5h ago',
            model: 'Gemini',
          },
          {
            id: 'insight-3',
            title: 'Meta AI underperforming',
            dotColor: 'bg-rose-500',
            description: 'AIO score dropped 3 pts this week. Knowledge panel data may be outdated.',
            timeAgo: '1d ago',
            model: 'Meta AI',
          },
          {
            id: 'insight-4',
            title: 'Claude AIO score highest',
            dotColor: 'bg-emerald-500',
            description: 'Ranked #1 in AIO at 73/100. Long-form content strategy is yielding results.',
            timeAgo: '1d ago',
            model: 'Claude',
          },
        ];

  return (
    <div className="bg-white border border-slate-100/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-full min-h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Recent Insights
        </h2>
        <div className="p-1.5 rounded-lg text-orange-500">
          <Zap className="w-4 h-4 fill-current text-orange-500" />
        </div>
      </div>

      {/* Stacked Insight Cards */}
      <div className="space-y-2.5 flex-1 flex flex-col justify-between">
        {displayInsights.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
          >
            {/* Title with Status Dot */}
            <div className="flex items-center space-x-2">
              <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor} shrink-0`} />
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {item.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-[11px] text-slate-500 font-normal mt-1 leading-relaxed pl-3.5">
              {item.description}
            </p>

            {/* Footer metadata */}
            <div className="text-[10px] text-slate-400 font-medium mt-1.5 pl-3.5 font-sans">
              {item.timeAgo} · {item.model}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
