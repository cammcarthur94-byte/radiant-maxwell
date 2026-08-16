'use client';

import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from '@/context/dashboard-context';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopFilterBar } from '@/components/dashboard/TopFilterBar';
import { UpgradeModal } from '@/components/dashboard/UpgradeModal';
import { NotificationDrawer } from '@/components/dashboard/NotificationDrawer';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { exportToCsv } from '@/lib/export-csv';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    activeTenant,
    setActiveTenant,
    availableTenants,
    selectedDateRange,
    setSelectedDateRange,
    selectedPlatform,
    setSelectedPlatform,
    selectedCampaign,
    setSelectedCampaign,
    availableCampaigns,
    activities,
    upgradeModalOpen,
    setUpgradeModalOpen,
    notificationDrawerOpen,
    setNotificationDrawerOpen,
    hasUnreadNotifications,
    setHasUnreadNotifications,
    triggerTracking,
    isTracking,
    error,
    refreshData,
  } = useDashboard();

  const handleExportDashboardCsv = () => {
    const exportItems = (activities && activities.length > 0)
      ? activities.map((act) => {
          const rankMatch = act.description?.match(/Rank #(\d+)/);
          return {
            query: act.query || act.title,
            rank: rankMatch ? `#${rankMatch[1]}` : '#1',
            engine: act.title.split(' ')[0] || 'Google Gemini',
            date: act.timestamp ? new Date(act.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            category: act.type === 'citation' ? 'Brand Citation' : 'Discovery Query',
            queryIntent: 'Brand',
            citationsCount: act.citations?.length || 1,
          };
        })
      : availableCampaigns.map((c) => ({
          query: c.targetQuery || c.name,
          rank: '#1',
          engine: selectedPlatform === 'all' ? 'Google Gemini & Perplexity' : selectedPlatform,
          date: new Date().toISOString().split('T')[0],
          category: 'Brand Intelligence',
          queryIntent: 'Brand',
          citationsCount: 4,
        }));

    exportToCsv(
      exportItems,
      `analytics-overview-${activeTenant.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-900">
      {/* 1. Persistent Left Sidebar */}
      <Sidebar
        activeTenant={activeTenant}
        onTenantChange={setActiveTenant}
        availableTenants={availableTenants}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
      />

      {/* 2. Main Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Filter Bar */}
        <TopFilterBar
          activeTenant={activeTenant}
          onTenantChange={setActiveTenant}
          availableTenants={availableTenants}
          selectedDateRange={selectedDateRange}
          onDateRangeChange={setSelectedDateRange}
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          selectedCampaign={selectedCampaign}
          onCampaignChange={setSelectedCampaign}
          availableCampaigns={availableCampaigns}
          onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
          onToggleNotifications={() => {
            setNotificationDrawerOpen(!notificationDrawerOpen);
            setHasUnreadNotifications(false);
          }}
          hasUnreadNotifications={hasUnreadNotifications}
          onTriggerTracking={() => triggerTracking()}
          isTracking={isTracking}
          onExportCsv={handleExportDashboardCsv}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-[1680px] w-full mx-auto">
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between text-rose-800 text-sm">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => refreshData()}
                className="px-3 py-1 bg-white border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-semibold text-rose-700 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {children}
        </main>
      </div>

      {/* 3. Global Overlays & Modals */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        activeTenant={activeTenant}
      />

      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}
