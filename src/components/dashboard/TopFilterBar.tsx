'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  RotateCw,
  Moon,
  Bell,
  Filter,
  X,
} from 'lucide-react';
import {
  DateRangeOption,
  PlatformOption,
  TenantInfo,
  CampaignOption,
} from '@/types/dashboard';
import { useDashboard } from '@/context/dashboard-context';

interface TopFilterBarProps {
  activeTenant: TenantInfo;
  onTenantChange?: (tenant: TenantInfo) => void;
  availableTenants?: TenantInfo[];
  selectedDateRange: DateRangeOption;
  onDateRangeChange: (range: DateRangeOption) => void;
  selectedPlatform: PlatformOption;
  onPlatformChange: (platform: PlatformOption) => void;
  selectedCampaign: string;
  onCampaignChange: (campaignId: string) => void;
  availableCampaigns?: CampaignOption[];
  onOpenUpgradeModal: () => void;
  onToggleNotifications: () => void;
  hasUnreadNotifications: boolean;
  onTriggerTracking?: () => void;
  isTracking?: boolean;
  onExportCsv?: () => void;
  onOpenCommandPalette?: () => void;
}

export function TopFilterBar({
  activeTenant,
  onTenantChange,
  availableTenants = [],
  selectedDateRange,
  onDateRangeChange,
  selectedPlatform,
  onPlatformChange,
  selectedCampaign,
  onCampaignChange,
  availableCampaigns = [],
  onOpenUpgradeModal,
  onToggleNotifications,
  hasUnreadNotifications,
  onTriggerTracking,
  isTracking = false,
  onExportCsv,
  onOpenCommandPalette,
}: TopFilterBarProps) {
  const {
    triggerTracking,
    refreshData,
    selectedModel,
    setSelectedModel,
    selectedCompetitor,
    setSelectedCompetitor,
    clearFilters,
    isFilterActive,
  } = useDashboard();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const pathname = usePathname();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      if (onTriggerTracking) {
        await onTriggerTracking();
      } else {
        await triggerTracking();
      }
      await refreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Dynamic Route Title & Subtitle Mapping matching exact Figma prototype
  const getHeaderMeta = () => {
    if (pathname === '/dashboard' || pathname === '/dashboard/overview') {
      return {
        title: 'AI Visibility Dashboard',
        subtitle: 'Tracking 6 models · Last synced 14 min ago',
      };
    }
    if (pathname === '/dashboard/aeo' || pathname === '/dashboard/engines') {
      return {
        title: 'AEO Score',
        subtitle: 'Answer Engine Optimization · Deep analysis',
      };
    }
    if (pathname === '/dashboard/geo') {
      return {
        title: 'GEO Score',
        subtitle: 'Generative Engine Optimization · Content analysis',
      };
    }
    if (pathname === '/dashboard/aio') {
      return {
        title: 'AIO Score',
        subtitle: 'AI Optimization · Knowledge & entity health',
      };
    }
    if (
      pathname === '/dashboard/models' ||
      pathname === '/dashboard/benchmarks' ||
      pathname === '/dashboard/competitors'
    ) {
      return {
        title: 'Analysis and Benchmarks',
        subtitle: 'Industry comparison and gap analysis',
      };
    }
    if (pathname === '/dashboard/citations' || pathname === '/dashboard/citation-analysis') {
      return {
        title: 'Citation Analysis',
        subtitle: 'Deep-dive citation breakdown and context',
      };
    }
    if (pathname === '/dashboard/prompts') {
      return {
        title: 'Prompts',
        subtitle: 'Tracked search queries & optimization',
      };
    }
    if (pathname === '/dashboard/share-of-voice') {
      return {
        title: 'Share of Voice',
        subtitle: 'Competitive conversational presence distribution',
      };
    }
    if (pathname === '/dashboard/benchmarks') {
      return {
        title: 'Analysis and Benchmarks',
        subtitle: 'Industry comparison and gap analysis',
      };
    }
    if (pathname === '/dashboard/sources') {
      return {
        title: 'Top Domains',
        subtitle: 'Authority citation sources & web links',
      };
    }
    if (pathname === '/dashboard/settings') {
      return {
        title: 'Settings',
        subtitle: 'Configuration and preferences',
      };
    }
    return {
      title: 'AI Visibility Dashboard',
      subtitle: 'Tracking 6 models · Last synced 14 min ago',
    };
  };

  const { title, subtitle } = getHeaderMeta();

  return (
    <header className="bg-white border-b border-slate-100/80 px-8 py-5 select-none">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            {subtitle}
          </p>
        </div>

        {/* Right Action Icons: Search Cmd+K, Sync, Moon, Bell */}
        <div className="flex items-center space-x-3">
          {/* Quick Search Cmd+K Button */}
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-xs text-slate-500 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
            title="Search command palette (Cmd+K)"
          >
            <span>Search...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-white text-slate-500 rounded border border-slate-200 shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Sync Button */}
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing || isTracking}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Sync live model telemetry"
          >
            <RotateCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing || isTracking ? 'animate-spin' : ''}`} />
            <span>{isSyncing || isTracking ? 'Syncing...' : 'Sync'}</span>
          </button>

          {/* Dark Mode Moon Button */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Toggle theme appearance"
          >
            <Moon className="w-4 h-4" />
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={onToggleNotifications}
            className="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Telemetry and Audit Alerts"
          >
            <Bell className="w-4 h-4" />
            {hasUnreadNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>

      {/* Active Cross-Filter Banner */}
      {isFilterActive && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>Active Filters:</span>
            </div>

            {selectedModel && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-2xs">
                <span>Model: <strong className="font-semibold">{selectedModel}</strong></span>
                <button
                  type="button"
                  onClick={() => setSelectedModel(null)}
                  className="p-0.5 hover:bg-indigo-200/60 rounded-md text-indigo-600 hover:text-indigo-900 transition-colors cursor-pointer"
                  title="Remove model filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCompetitor && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200/70 shadow-2xs">
                <span>Competitor: <strong className="font-semibold">{selectedCompetitor}</strong></span>
                <button
                  type="button"
                  onClick={() => setSelectedCompetitor(null)}
                  className="p-0.5 hover:bg-purple-200/60 rounded-md text-purple-600 hover:text-purple-900 transition-colors cursor-pointer"
                  title="Remove competitor filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 transition-all shadow-2xs cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}
    </header>
  );
}

