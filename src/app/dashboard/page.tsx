'use client';

import React, { useState } from 'react';
import { useDashboard } from '@/context/dashboard-context';
import { KpiCardGrid } from '@/components/dashboard/KpiCardGrid';
import { HeroVisibilityTrend } from '@/components/dashboard/HeroVisibilityTrend';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { GeminiResponseModal } from '@/components/dashboard/GeminiResponseModal';
import { ActivityEvent } from '@/types/dashboard';
import { HelpCircle } from 'lucide-react';

export default function DashboardOverviewPage() {
  const {
    activeTenant,
    selectedPlatform,
    kpiMetrics,
    trendData,
    activities,
    hasData,
    isLoading,
    isTracking,
    triggerTracking,
  } = useDashboard();

  const [selectedInspectorActivity, setSelectedInspectorActivity] = useState<ActivityEvent | null>(null);

  const handleRunLiveTest = async () => {
    await triggerTracking('gemini');
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Row 1: 4 Top Circular Gauge Score Cards */}
      <section aria-label="Score Overview Cards">
        <KpiCardGrid metrics={kpiMetrics} isLoading={isLoading} />
      </section>

      {/* Row 2: 2-Column Main Grid (Score Trends 65% on Left & Recent Insights 35% on Right) */}
      <section
        aria-label="Score Trends and Recent Insights"
        className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
      >
        {/* Left Column: Score Trends Chart (65% width) */}
        <div className="lg:col-span-8 flex flex-col">
          <HeroVisibilityTrend
            trendData={trendData}
            selectedPlatform={selectedPlatform}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column: Recent Insights (35% width) */}
        <div className="lg:col-span-4 flex flex-col">
          <RecentActivityFeed
            activities={activities}
            onInspectSnippet={(act) => setSelectedInspectorActivity(act)}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Floating Bottom-Right Help Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          aria-label="Help and Documentation"
          className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer"
          title="Help & Knowledge Base"
        >
          ?
        </button>
      </div>

      {/* Live Response Inspector Modal */}
      {selectedInspectorActivity && (
        <GeminiResponseModal
          isOpen={!!selectedInspectorActivity}
          onClose={() => setSelectedInspectorActivity(null)}
          activity={selectedInspectorActivity}
        />
      )}
    </div>
  );
}
