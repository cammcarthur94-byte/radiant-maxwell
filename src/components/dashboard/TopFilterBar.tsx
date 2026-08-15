'use client';

import React, { useState } from 'react';
import {
  RotateCw,
  Moon,
  Bell,
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
}: TopFilterBarProps) {
  const { triggerTracking, refreshData } = useDashboard();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  return (
    <header className="bg-white border-b border-slate-100/80 px-8 py-5 select-none space-y-4">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            AI Visibility Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">
            Tracking 6 models · Last synced 14 min ago
          </p>
        </div>

        {/* Right Action Icons: Sync, Moon, Bell */}
        <div className="flex items-center space-x-3">
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

      {/* Reporting Period Sub-Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
        <div className="flex items-center space-x-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-slate-700 font-semibold">
            Reporting period: <span className="text-slate-500 font-normal">March – August 2025</span>
          </span>
        </div>
        <div className="text-slate-400 font-medium font-sans">
          Aug 15, 2025
        </div>
      </div>
    </header>
  );
}
