'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  TenantInfo,
  DateRangeOption,
  ComparisonPeriodOption,
  PlatformOption,
  RegionOption,
  LanguageOption,
  SnapshotFrequencyOption,
  SourceAttributionItem,
  SentimentDistribution,
  CampaignOption,
  KpiMetric,
  VisibilityTrendPoint,
  CompetitorRankItem,
  ActivityEvent,
  UsageMetric,
} from '@/types/dashboard';

import {
  ScoreCalculationService,
  ScoreFrameworkSummary,
  MonthlyScoreTrendPoint,
  ScoreInsight,
} from '@/lib/services/score-calculation-service';

const INITIAL_TENANT: TenantInfo = {
  id: '',
  name: 'Workspace',
  domain: '',
  logoText: 'W',
  logoBg: 'bg-indigo-600 text-white',
  plan: 'Enterprise',
};

export interface DashboardContextType {
  activeTenant: TenantInfo;
  setActiveTenant: (t: TenantInfo) => void;
  availableTenants: TenantInfo[];
  selectedDateRange: DateRangeOption;
  setSelectedDateRange: (range: DateRangeOption) => void;
  comparisonPeriod: ComparisonPeriodOption;
  setComparisonPeriod: (period: ComparisonPeriodOption) => void;
  selectedPlatform: PlatformOption;
  setSelectedPlatform: (platform: PlatformOption) => void;
  selectedCampaign: string;
  setSelectedCampaign: (campId: string) => void;
  availableCampaigns: CampaignOption[];

  selectedRegion: RegionOption;
  setSelectedRegion: (region: RegionOption) => void;
  selectedLanguage: LanguageOption;
  setSelectedLanguage: (lang: LanguageOption) => void;
  selectedFrequency: SnapshotFrequencyOption;
  setSelectedFrequency: (freq: SnapshotFrequencyOption) => void;

  scoreSummary: ScoreFrameworkSummary;
  monthlyScoreTrends: MonthlyScoreTrendPoint[];
  recentScoreInsights: ScoreInsight[];

  kpiMetrics: KpiMetric[];
  trendData: VisibilityTrendPoint[];
  competitors: CompetitorRankItem[];
  activities: ActivityEvent[];
  usageMetrics: UsageMetric[];
  sourcesList: SourceAttributionItem[];
  sentimentData: SentimentDistribution;
  totalCitationsCount: number;
  brandMentionsCount: number;
  recommendationsCount: number;
  hasData: boolean;
  isLoading: boolean;
  isTracking: boolean;
  error: string | null;

  refreshData: () => Promise<void>;
  refreshRecommendationsCount: () => Promise<void>;
  triggerTracking: (engine?: string) => Promise<boolean>;
  addCampaignQuery: (query: string) => Promise<boolean>;

  upgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  notificationDrawerOpen: boolean;
  setNotificationDrawerOpen: (open: boolean) => void;
  hasUnreadNotifications: boolean;
  setHasUnreadNotifications: (unread: boolean) => void;
  onboardingModalOpen: boolean;
  setOnboardingModalOpen: (open: boolean) => void;

  comparePreviousPeriod: boolean;
  setComparePreviousPeriod: (enabled: boolean) => void;

  // Cross-Filtering State
  selectedModel: string | null;
  setSelectedModel: (model: string | null) => void;
  toggleSelectedModel: (model: string) => void;
  selectedCompetitor: string | null;
  setSelectedCompetitor: (competitor: string | null) => void;
  toggleSelectedCompetitor: (competitor: string) => void;
  clearFilters: () => void;
  isFilterActive: boolean;

  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [activeTenant, setActiveTenantState] = useState<TenantInfo>(INITIAL_TENANT);
  const [availableTenants, setAvailableTenants] = useState<TenantInfo[]>([]);
  const [availableCampaigns, setAvailableCampaigns] = useState<CampaignOption[]>([
    { id: 'all', name: 'All Campaigns', targetQuery: 'All tracked AIO queries' },
  ]);

  const [selectedDateRange, setSelectedDateRangeState] = useState<DateRangeOption>('30d');
  const [comparisonPeriod, setComparisonPeriodState] = useState<ComparisonPeriodOption>('previous_period');
  const [selectedPlatform, setSelectedPlatformState] = useState<PlatformOption>('all');
  const [selectedCampaign, setSelectedCampaignState] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>('us');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('en');
  const [selectedFrequency, setSelectedFrequency] = useState<SnapshotFrequencyOption>('weekly');
  const [comparePreviousPeriod, setComparePreviousPeriodState] = useState<boolean>(true);
  const [theme] = useState<'light'>('light');

  // Permanently lock application to light mode
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('theme');
      document.documentElement.classList.remove('dark');
    } catch {}
  }, []);

  const setTheme = useCallback((_newTheme: 'light' | 'dark') => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);

  // Global Cross-Filtering State
  const [selectedModel, setSelectedModelState] = useState<string | null>(null);
  const [selectedCompetitor, setSelectedCompetitorState] = useState<string | null>(null);

  const setSelectedModel = useCallback((model: string | null) => {
    setSelectedModelState(model);
  }, []);

  const toggleSelectedModel = useCallback((model: string) => {
    setSelectedModelState((prev) => (prev?.toLowerCase() === model.toLowerCase() ? null : model));
  }, []);

  const setSelectedCompetitor = useCallback((competitor: string | null) => {
    setSelectedCompetitorState(competitor);
  }, []);

  const toggleSelectedCompetitor = useCallback((competitor: string) => {
    setSelectedCompetitorState((prev) => (prev?.toLowerCase() === competitor.toLowerCase() ? null : competitor));
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedModelState(null);
    setSelectedCompetitorState(null);
  }, []);

  const isFilterActive = useMemo(() => {
    return Boolean(selectedModel || selectedCompetitor);
  }, [selectedModel, selectedCompetitor]);


  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState<boolean>(true);
  const [totalCitationsCount, setTotalCitationsCount] = useState<number>(0);
  const [brandMentionsCount, setBrandMentionsCount] = useState<number>(0);
  const [recommendationsCount, setRecommendationsCount] = useState<number>(0);

  const [kpiMetrics, setKpiMetrics] = useState<KpiMetric[]>([]);
  const [trendData, setTrendData] = useState<VisibilityTrendPoint[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorRankItem[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetric[]>([]);

  // Compute rich source attribution list from live activities
  const sourcesList = useMemo<SourceAttributionItem[]>(() => {
    if (!activities || activities.length === 0) {
      return [];
    }

    const domainMap: Record<string, SourceAttributionItem> = {};
    let totalCites = 0;

    activities.forEach((act, actIdx) => {
      const urls = act.citations && act.citations.length > 0 ? act.citations : act.url ? [act.url] : [];
      urls.forEach((url) => {
        totalCites += 1;
        let domain = 'web-source.com';
        try {
          domain = new URL(url).hostname.replace('www.', '');
        } catch {
          domain = url.split('/')[0] || 'grounding-domain.com';
        }

        const isTarget = Boolean(
          (activeTenant.domain && domain.includes(activeTenant.domain)) ||
          (activeTenant.name && domain.includes(activeTenant.name.toLowerCase().replace(/[^a-z0-9]/g, '')))
        );

        if (!domainMap[domain]) {
          domainMap[domain] = {
            id: `src-${actIdx}-${domain}`,
            domain,
            url,
            anchorText: `${domain} - Grounded Reference`,
            citationsCount: 1,
            citationSharePct: 0,
            authorityScore: isTarget ? 94 : 85,
            isTargetBrand: isTarget,
            engineBadges: ['gemini', 'perplexity'],
            sentiment: 'positive',
          };
        } else {
          domainMap[domain].citationsCount += 1;
        }
      });
    });

    const items = Object.values(domainMap);
    return items
      .map((item) => ({
        ...item,
        citationSharePct: totalCites > 0 ? Math.round((item.citationsCount / totalCites) * 100) : 0,
      }))
      .sort((a, b) => b.citationsCount - a.citationsCount);
  }, [activities, activeTenant]);

  // Compute sentiment distribution dynamically from live activities
  const sentimentData = useMemo<SentimentDistribution>(() => {
    if (!activities || activities.length === 0) {
      return {
        positivePct: 0,
        neutralPct: 0,
        negativePct: 0,
        netScore: 0,
        sampleSnippet: '',
        sampleQuery: '',
        sampleEngine: '',
        sampleTimestamp: '',
      };
    }

    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;

    activities.forEach((a) => {
      const sent = (
        a.sentiment_label ||
        (a as any).mention_sentiment ||
        (a.extractedMetrics as any)?.sentiment ||
        (a.badgeVariant === 'emerald' ? 'positive' : 'neutral')
      ).toLowerCase();

      if (sent.includes('pos')) positiveCount++;
      else if (sent.includes('neg') || sent.includes('inacc')) negativeCount++;
      else neutralCount++;
    });

    const total = activities.length || 1;
    const positivePct = Math.round((positiveCount / total) * 100);
    const neutralPct = Math.round((neutralCount / total) * 100);
    const negativePct = Math.max(0, 100 - positivePct - neutralPct);
    const netScore = Math.max(0, positivePct - negativePct);

    const firstActivityWithText = activities.find((a) => a.rawResponseText || a.description);
    const sampleSnippet = firstActivityWithText?.rawResponseText
      ? firstActivityWithText.rawResponseText.slice(0, 240) + '...'
      : firstActivityWithText?.description || '';

    return {
      positivePct,
      neutralPct,
      negativePct,
      netScore,
      sampleSnippet,
      sampleQuery: firstActivityWithText?.query || '',
      sampleEngine: firstActivityWithText?.title?.split(' ')[0] || 'Google Gemini',
      sampleTimestamp: firstActivityWithText?.timeAgo || 'Recent extraction',
    };
  }, [activities]);

  // Compute AEO, GEO, and AIO score framework summary dynamically
  const scoreSummary = useMemo<ScoreFrameworkSummary>(() => {
    return ScoreCalculationService.calculateFrameworkSummary(
      [],
      [],
      totalCitationsCount || (activities.length > 0 ? activities.reduce((acc, a) => acc + (a.citations?.length || 1), 0) : 3747)
    );
  }, [activities, totalCitationsCount]);

  // Compute 6-Month multi-curve score trends
  const monthlyScoreTrends = useMemo<MonthlyScoreTrendPoint[]>(() => {
    return ScoreCalculationService.calculateScoreTrends([]);
  }, []);

  // Compute Dynamic Score Insights
  const recentScoreInsights = useMemo<ScoreInsight[]>(() => {
    return ScoreCalculationService.generateDynamicInsights(scoreSummary, activities);
  }, [scoreSummary, activities]);

  // 1. Synchronize initial filter state from URL search params on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const rangeParam = urlParams.get('range') || urlParams.get('dateRange');
    const campaignParam = urlParams.get('campaign') || urlParams.get('campaignId');
    const platformParam = urlParams.get('platform');
    const tenantParam = urlParams.get('tenantId') || urlParams.get('tenant') || localStorage.getItem('active_tenant_id');
    const compareParam = urlParams.get('compare');

    if (tenantParam) {
      setActiveTenantState((prev) => ({ ...prev, id: tenantParam }));
    }
    if (rangeParam && ['7d', '30d', '90d', 'all'].includes(rangeParam)) {
      setSelectedDateRangeState(rangeParam as DateRangeOption);
    }
    if (campaignParam) {
      setSelectedCampaignState(campaignParam);
    }
    if (platformParam && ['all', 'chatgpt', 'gemini', 'perplexity', 'copilot'].includes(platformParam)) {
      setSelectedPlatformState(platformParam as PlatformOption);
    }
    if (compareParam !== null) {
      if (['previous_period', 'previous_month', 'previous_year', 'off'].includes(compareParam)) {
        setComparisonPeriodState(compareParam as ComparisonPeriodOption);
        setComparePreviousPeriodState(compareParam !== 'off');
      } else {
        const isEnabled = compareParam !== 'false';
        setComparePreviousPeriodState(isEnabled);
        setComparisonPeriodState(isEnabled ? 'previous_period' : 'off');
      }
    }
  }, []);

  // 2. Helper to sync filter changes to URL search parameters seamlessly
  const updateUrlParams = useCallback(
    (
      newRange: DateRangeOption,
      newCampaign: string,
      newPlatform: PlatformOption,
      newTenantId?: string,
      newComparePeriod?: ComparisonPeriodOption | boolean
    ) => {
      if (typeof window === 'undefined') return;

      const url = new URL(window.location.href);
      const params = url.searchParams;

      // Keep URL clean: only set non-default or explicit params
      if (newRange && newRange !== '30d') {
        params.set('range', newRange);
      } else {
        params.delete('range');
        params.delete('dateRange');
      }

      if (newCampaign && newCampaign !== 'all') {
        params.set('campaign', newCampaign);
      } else {
        params.delete('campaign');
        params.delete('campaignId');
      }

      if (newPlatform && newPlatform !== 'all') {
        params.set('platform', newPlatform);
      } else {
        params.delete('platform');
      }

      if (newTenantId && newTenantId !== INITIAL_TENANT.id) {
        params.set('tenantId', newTenantId);
      }

      if (typeof newComparePeriod === 'string') {
        if (newComparePeriod !== 'previous_period') {
          params.set('compare', newComparePeriod);
        } else {
          params.delete('compare');
        }
      } else if (typeof newComparePeriod === 'boolean') {
        if (!newComparePeriod) {
          params.set('compare', 'off');
        } else {
          params.delete('compare');
        }
      }

      const newUrl = `${url.pathname}${params.toString() ? `?${params.toString()}` : ''}${url.hash}`;
      window.history.replaceState({ path: newUrl }, '', newUrl);
    },
    []
  );

  // Filter setters updating state + URL search params
  const setSelectedDateRange = useCallback(
    (range: DateRangeOption) => {
      setSelectedDateRangeState(range);
      updateUrlParams(range, selectedCampaign, selectedPlatform, activeTenant.id, comparisonPeriod);
    },
    [selectedCampaign, selectedPlatform, activeTenant.id, comparisonPeriod, updateUrlParams]
  );

  const setSelectedCampaign = useCallback(
    (campaignId: string) => {
      setSelectedCampaignState(campaignId);
      updateUrlParams(selectedDateRange, campaignId, selectedPlatform, activeTenant.id, comparisonPeriod);
    },
    [selectedDateRange, selectedPlatform, activeTenant.id, comparisonPeriod, updateUrlParams]
  );

  const setSelectedPlatform = useCallback(
    (platform: PlatformOption) => {
      setSelectedPlatformState(platform);
      updateUrlParams(selectedDateRange, selectedCampaign, platform, activeTenant.id, comparisonPeriod);
    },
    [selectedDateRange, selectedCampaign, activeTenant.id, comparisonPeriod, updateUrlParams]
  );

  const setActiveTenant = useCallback(
    (t: TenantInfo) => {
      setActiveTenantState(t);
      updateUrlParams(selectedDateRange, selectedCampaign, selectedPlatform, t.id, comparisonPeriod);
    },
    [selectedDateRange, selectedCampaign, selectedPlatform, comparisonPeriod, updateUrlParams]
  );

  const setComparisonPeriod = useCallback(
    (period: ComparisonPeriodOption) => {
      setComparisonPeriodState(period);
      setComparePreviousPeriodState(period !== 'off');
      updateUrlParams(selectedDateRange, selectedCampaign, selectedPlatform, activeTenant.id, period);
    },
    [selectedDateRange, selectedCampaign, selectedPlatform, activeTenant.id, updateUrlParams]
  );

  const setComparePreviousPeriod = useCallback(
    (enabled: boolean) => {
      setComparePreviousPeriodState(enabled);
      const newPeriod: ComparisonPeriodOption = enabled ? 'previous_period' : 'off';
      setComparisonPeriodState(newPeriod);
      updateUrlParams(selectedDateRange, selectedCampaign, selectedPlatform, activeTenant.id, newPeriod);
    },
    [selectedDateRange, selectedCampaign, selectedPlatform, activeTenant.id, updateUrlParams]
  );

  // Listen to browser Back / Forward events
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const rangeParam = urlParams.get('range') || urlParams.get('dateRange') || '30d';
      const campaignParam = urlParams.get('campaign') || urlParams.get('campaignId') || 'all';
      const platformParam = urlParams.get('platform') || 'all';
      const compareParam = urlParams.get('compare');

      if (['7d', '30d', '90d', 'all'].includes(rangeParam)) {
        setSelectedDateRangeState(rangeParam as DateRangeOption);
      }
      setSelectedCampaignState(campaignParam);
      if (['all', 'chatgpt', 'gemini', 'perplexity', 'copilot'].includes(platformParam)) {
        setSelectedPlatformState(platformParam as PlatformOption);
      }
      if (compareParam) {
        if (['previous_period', 'previous_month', 'previous_year', 'off'].includes(compareParam)) {
          setComparisonPeriodState(compareParam as ComparisonPeriodOption);
          setComparePreviousPeriodState(compareParam !== 'off');
        } else {
          setComparePreviousPeriodState(compareParam !== 'false');
          setComparisonPeriodState(compareParam !== 'false' ? 'previous_period' : 'off');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 3. Fetch live metrics from Supabase via API
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const urlTenantId = typeof window !== 'undefined'
        ? (new URLSearchParams(window.location.search).get('tenantId') || new URLSearchParams(window.location.search).get('tenant') || localStorage.getItem('active_tenant_id'))
        : null;

      const tenantIdToUse = urlTenantId || activeTenant.id;

      const queryParams = new URLSearchParams({
        tenantId: tenantIdToUse,
        range: selectedDateRange,
        dateRange: selectedDateRange,
        platform: selectedPlatform,
        campaign: selectedCampaign,
        campaignId: selectedCampaign,
      });

      const res = await fetch(`/api/dashboard?${queryParams.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch dashboard data');
      }

      const data = json.data;

      if (data.tenant) {
        setActiveTenantState(data.tenant);
        if (typeof window !== 'undefined' && data.tenant.id) {
          localStorage.setItem('active_tenant_id', data.tenant.id);
        }
      }
      if (data.availableTenants && data.availableTenants.length > 0) {
        setAvailableTenants(data.availableTenants);
      }
      if (data.availableCampaigns && data.availableCampaigns.length > 0) {
        setAvailableCampaigns(data.availableCampaigns);
      }

      setKpiMetrics(data.kpiMetrics || []);
      setTrendData(data.trendData || []);
      setCompetitors(data.competitors || []);
      setActivities(data.activities || []);
      setUsageMetrics(data.usageMetrics || []);
      setTotalCitationsCount(data.totalCitationsCount || 0);
      const mentionsCount = data.brandMentionsCount !== undefined ? data.brandMentionsCount : (data.totalCitationsCount || 0);
      setBrandMentionsCount(mentionsCount);
      // Empty state condition: Zero records in brand_mentions (or zero citations)
      setHasData(data.hasData && mentionsCount > 0);

      // Fetch active recommendations count
      try {
        const recRes = await fetch(`/api/recommendations?tenantId=${tenantIdToUse}&status=pending`);
        if (recRes.ok) {
          const recJson = await recRes.json();
          if (recJson.success && recJson.data?.stats) {
            setRecommendationsCount(recJson.data.stats.pending || recJson.data.items?.length || 0);
          }
        }
      } catch {
        // Non-critical background count
      }
    } catch (err: any) {
      console.error('Dashboard data fetching error:', err);
      setError(err.message || 'Unable to connect to Supabase database.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTenant.id, selectedDateRange, selectedPlatform, selectedCampaign]);

  const fetchRecommendationsCount = useCallback(async () => {
    try {
      const res = await fetch(`/api/recommendations?tenantId=${activeTenant.id}&status=pending`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.stats) {
          setRecommendationsCount(json.data.stats.pending || json.data.items?.length || 0);
        }
      }
    } catch (e) {
      console.error('Failed to refresh recommendations count:', e);
    }
  }, [activeTenant.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 4. Trigger AIO Tracking Run
  const triggerTracking = async (engineParam?: string): Promise<boolean> => {
    try {
      setIsTracking(true);
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: activeTenant.id,
          engine: engineParam || (selectedPlatform === 'all' ? 'gemini' : selectedPlatform),
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchDashboardData();
        await fetchRecommendationsCount();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to trigger tracking:', e);
      return false;
    } finally {
      setIsTracking(false);
    }
  };

  // 5. Add Query to Target Campaign
  const addCampaignQuery = async (queryText: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: activeTenant.id,
          query: queryText,
          engine: 'gemini',
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchDashboardData();
        await fetchRecommendationsCount();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to add campaign query:', e);
      return false;
    }
  };

  return (
    <DashboardContext.Provider
      value={{
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
        selectedRegion,
        setSelectedRegion,
        selectedLanguage,
        setSelectedLanguage,
        selectedFrequency,
        setSelectedFrequency,
        scoreSummary,
        monthlyScoreTrends,
        recentScoreInsights,
        kpiMetrics,
        trendData,
        competitors,
        activities,
        usageMetrics,
        sourcesList,
        sentimentData,
        totalCitationsCount,
        brandMentionsCount,
        recommendationsCount,
        hasData,
        isLoading,
        isTracking,
        error,
        refreshData: fetchDashboardData,
        refreshRecommendationsCount: fetchRecommendationsCount,
        triggerTracking,
        addCampaignQuery,
        upgradeModalOpen,
        setUpgradeModalOpen,
        notificationDrawerOpen,
        setNotificationDrawerOpen,
        hasUnreadNotifications,
        setHasUnreadNotifications,
        onboardingModalOpen,
        setOnboardingModalOpen,
        comparePreviousPeriod,
        setComparePreviousPeriod,
        comparisonPeriod,
        setComparisonPeriod,
        selectedModel,
        setSelectedModel,
        toggleSelectedModel,
        selectedCompetitor,
        setSelectedCompetitor,
        toggleSelectedCompetitor,
        clearFilters,
        isFilterActive,
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
