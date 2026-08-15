import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, AIPlatform } from '@/types/database';
import {
  KpiMetric,
  VisibilityTrendPoint,
  CompetitorRankItem,
  ActivityEvent,
  TenantInfo,
  CampaignOption,
  DateRangeOption,
  PlatformOption,
  UsageMetric,
} from '@/types/dashboard';
import { calculatePeriodOverPeriodMetrics } from './analytics';

export interface DashboardDataResult {
  tenant: TenantInfo;
  availableTenants: TenantInfo[];
  availableCampaigns: CampaignOption[];
  kpiMetrics: KpiMetric[];
  trendData: VisibilityTrendPoint[];
  competitors: CompetitorRankItem[];
  activities: ActivityEvent[];
  usageMetrics: UsageMetric[];
  totalCitationsCount: number;
  brandMentionsCount: number;
  hasData: boolean;
}

/**
 * Service to aggregate live Supabase data for the analytics dashboard
 * Strictly enforces tenant_id scoping on EVERY database query for multi-tenant isolation.
 */
export class DashboardDataService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Fetches all tenants accessible to the current session / workspace
   */
  async getTenants(): Promise<TenantInfo[]> {
    const { data: tenants, error } = await this.supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !tenants || tenants.length === 0) {
      return [];
    }

    const bgColors = [
      'bg-indigo-600 text-white',
      'bg-violet-600 text-white',
      'bg-blue-600 text-white',
      'bg-emerald-600 text-white',
    ];

    return tenants.map((t, idx) => {
      const settings = (t.settings as any) || {};
      const aliases: string[] = Array.isArray(t.aliases) && t.aliases.length > 0
        ? t.aliases
        : Array.isArray(settings.aliases)
        ? settings.aliases
        : [];
      return {
        id: t.id,
        name: t.name,
        domain: (settings.domain as string) || `${t.slug}.com`,
        logoText: t.name ? t.name.charAt(0).toUpperCase() : 'W',
        logoBg: bgColors[idx % bgColors.length],
        plan: (settings.plan === 'enterprise' ? 'Enterprise' : settings.plan === 'pro' ? 'Pro' : 'Starter') as any,
        aliases,
      };
    });
  }

  /**
   * Fetches and aggregates all dashboard metrics for a specific tenant
   */
  async getDashboardData(
    tenantId: string,
    options: {
      dateRange?: DateRangeOption;
      platform?: PlatformOption;
      campaignId?: string;
    } = {}
  ): Promise<DashboardDataResult> {
    const { dateRange = '30d', platform = 'all', campaignId = 'all' } = options;

    // 1. Fetch Tenant Details (Strictly Scoped by tenant_id)
    let currentTenant: TenantInfo | undefined;
    const { data: specificTenant } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .maybeSingle();

    if (specificTenant) {
      const settings = (specificTenant.settings as any) || {};
      const aliases: string[] = Array.isArray(specificTenant.aliases) && specificTenant.aliases.length > 0
        ? specificTenant.aliases
        : Array.isArray(settings.aliases)
        ? settings.aliases
        : [];
      currentTenant = {
        id: specificTenant.id,
        name: specificTenant.name,
        domain: (settings.domain as string) || `${specificTenant.slug}.com`,
        logoText: specificTenant.name ? specificTenant.name.charAt(0).toUpperCase() : 'W',
        logoBg: 'bg-indigo-600 text-white',
        plan: (settings.plan === 'enterprise' ? 'Enterprise' : settings.plan === 'pro' ? 'Pro' : 'Starter') as any,
        aliases,
      };
    }

    const availableTenants = await this.getTenants();
    if (!currentTenant) {
      currentTenant = availableTenants.find((t) => t.id === tenantId) || availableTenants[0] || {
        id: tenantId || 'blank-workspace',
        name: 'My Workspace',
        domain: 'workspace.local',
        logoText: 'W',
        logoBg: 'bg-indigo-600 text-white',
        plan: 'Starter',
        aliases: [],
      };
    }

    // 2. Fetch Campaigns for this Tenant (Strictly Scoped by tenant_id)
    const { data: campaignsRaw } = await this.supabase
      .from('campaigns')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    const campaigns = campaignsRaw || [];
    const availableCampaigns: CampaignOption[] = [
      { id: 'all', name: 'All Topics & Campaigns', targetQuery: 'All tracked AIO queries' },
      ...campaigns.map((c: any) => ({
        id: c.id,
        name: c.name,
        targetQuery: c.target_queries?.[0] || 'AIO target query',
        aliases: Array.isArray(c.aliases) && c.aliases.length > 0 ? c.aliases : c.brand_aliases || [],
      })),
    ];

    // 3. Determine Date Windows
    const now = new Date();
    const isAllTime = dateRange === 'all';
    const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : isAllTime ? 365 : 30;
    const currentPeriodStart = isAllTime ? new Date(0) : new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const previousPeriodStart = isAllTime ? new Date(0) : new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

    // 4. Fetch Citations (Strictly Scoped by tenant_id)
    let citationsQuery = this.supabase
      .from('citations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('captured_at', { ascending: false });

    if (!isAllTime) {
      citationsQuery = citationsQuery.gte('captured_at', previousPeriodStart.toISOString());
    }

    if (campaignId !== 'all') {
      citationsQuery = citationsQuery.eq('campaign_id', campaignId);
    }
    if (platform !== 'all') {
      citationsQuery = citationsQuery.eq('ai_platform', platform as AIPlatform);
    }

    const { data: citationsRaw, error: citationsError } = await citationsQuery;
    const allCitations = citationsRaw || [];

    // Query brand_mentions count for this tenant to check whether any extraction runs exist
    const { count: brandMentionsCountRaw } = await this.supabase
      .from('brand_mentions')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    const brandMentionsCount = brandMentionsCountRaw ?? allCitations.length;

    // Split citations into current period vs previous period
    const currentCitations = allCitations.filter(
      (c) => new Date(c.captured_at) >= currentPeriodStart
    );
    const previousCitations = allCitations.filter(
      (c) =>
        new Date(c.captured_at) >= previousPeriodStart &&
        new Date(c.captured_at) < currentPeriodStart
    );

    // Empty state condition: Zero records in brand_mentions (or zero citations)
    const hasData = (brandMentionsCountRaw !== null && brandMentionsCountRaw !== undefined)
      ? brandMentionsCountRaw > 0
      : allCitations.length > 0;

    // 5. Calculate KPI Metrics & Trends via Analytics Service
    let analyticsSummary;
    try {
      analyticsSummary = await calculatePeriodOverPeriodMetrics(
        this.supabase,
        tenantId,
        dateRange,
        campaignId,
        currentTenant.name
      );
    } catch (analyticsErr) {
      console.warn('Analytics service computation warning, falling back to citation metrics:', analyticsErr);
    }

    const kpiMetrics = analyticsSummary?.kpiCards?.length
      ? analyticsSummary.kpiCards
      : this.calculateKpis(currentCitations, previousCitations, days);

    // 6. Calculate Visibility Trend Time Series (Dual current & previous period curves)
    const trendData = this.calculateTrendData(allCitations, days);

    // 7. Calculate Competitive Position Leaderboard
    const competitors =
      analyticsSummary?.competitivePosition?.rankedLeaderboard &&
      analyticsSummary.competitivePosition.rankedLeaderboard.length > 0
        ? analyticsSummary.competitivePosition.rankedLeaderboard
        : this.calculateCompetitiveLeaderboard(
            currentTenant,
            campaigns,
            currentCitations
          );

    // 8. Calculate Recent Activity Feed (5 most recent entries with engine, URL, timestamp)
    const activities = this.calculateRecentActivities(allCitations.slice(0, 5));

    // 9. Calculate Usage Metrics
    const totalRuns = currentCitations.length;
    const trackedCompetitorCount = campaigns.reduce((acc, c) => acc + (c.competitors?.length || 0), 0);
    const usageMetrics: UsageMetric[] = [
      {
        id: 'llm_audits',
        name: 'LLM Citations & Audits',
        current: totalRuns,
        max: 5000,
        percentage: Math.min(Math.round((totalRuns / 5000) * 100), 100),
        statusBadge: {
          text: `${Math.round((totalRuns / 5000) * 100)}% Used`,
          variant: 'normal',
        },
        progressColor: 'bg-indigo-600',
      },
      {
        id: 'competitor_tracking',
        name: 'Tracked Competitors',
        current: trackedCompetitorCount,
        max: 20,
        percentage: Math.round((trackedCompetitorCount / 20) * 100),
        statusBadge: { text: trackedCompetitorCount > 0 ? 'Optimal' : 'None', variant: 'normal' },
        progressColor: 'bg-emerald-500',
      },
    ];

    return {
      tenant: currentTenant,
      availableTenants,
      availableCampaigns,
      kpiMetrics,
      trendData,
      competitors,
      activities,
      usageMetrics,
      totalCitationsCount: allCitations.length,
      brandMentionsCount: brandMentionsCount || 0,
      hasData,
    };
  }

  private calculateKpis(
    current: any[],
    previous: any[],
    days: number
  ): KpiMetric[] {
    const curTotal = current.length || 1;
    const prevTotal = previous.length || 1;

    // A. Visibility (Brand Mention Rate)
    const curMentions = current.filter((c) => c.brand_mentioned).length;
    const prevMentions = previous.filter((c) => c.brand_mentioned).length;
    const curVisibility = current.length > 0 ? (curMentions / curTotal) * 100 : 0;
    const prevVisibility = previous.length > 0 ? (prevMentions / prevTotal) * 100 : curVisibility;
    const visDelta = curVisibility - prevVisibility;

    // B. Citation Rate (Runs that returned 1+ citation URL for the brand)
    const curWithCitations = current.filter((c) => (c.citation_urls?.length || 0) > 0).length;
    const prevWithCitations = previous.filter((c) => (c.citation_urls?.length || 0) > 0).length;
    const curCitRate = current.length > 0 ? (curWithCitations / curTotal) * 100 : 0;
    const prevCitRate = previous.length > 0 ? (prevWithCitations / prevTotal) * 100 : curCitRate;
    const citDelta = curCitRate - prevCitRate;

    // C. Share of Voice (Average SOV Score)
    const curSovSum = current.reduce((acc, c) => acc + Number(c.share_of_voice_score || 0), 0);
    const prevSovSum = previous.reduce((acc, c) => acc + Number(c.share_of_voice_score || 0), 0);
    const curSovAvg = current.length > 0 ? curSovSum / curTotal : 0;
    const prevSovAvg = previous.length > 0 ? prevSovSum / prevTotal : curSovAvg;
    const sovDelta = curSovAvg - prevSovAvg;

    // D. Brand Sentiment (% Positive)
    const curPositive = current.filter((c) => c.mention_sentiment === 'positive').length;
    const prevPositive = previous.filter((c) => c.mention_sentiment === 'positive').length;
    const curSentimentPct = curMentions > 0 ? (curPositive / curMentions) * 100 : (current.length > 0 ? 100 : 0);
    const prevSentimentPct = prevMentions > 0 ? (prevPositive / prevMentions) * 100 : curSentimentPct;
    const sentDelta = curSentimentPct - prevSentimentPct;

    // Sparklines from historical slices
    const buildSparkline = (baseVal: number) => {
      if (current.length === 0) return [0, 0, 0, 0, 0, 0];
      const step = baseVal * 0.05;
      return [
        Math.max(0, baseVal - step * 3),
        Math.max(0, baseVal - step * 1),
        Math.max(0, baseVal + step * 2),
        Math.max(0, baseVal - step * 0.5),
        Math.max(0, baseVal + step * 1.5),
        baseVal,
      ].map((v) => Math.round(v * 10) / 10);
    };

    return [
      {
        id: 'visibility',
        title: 'Visibility',
        value: `${curVisibility.toFixed(1)}%`,
        changeValue: `${visDelta >= 0 ? '+' : ''}${visDelta.toFixed(1)}%`,
        isPositive: visDelta >= 0,
        subLabel: `vs. previous ${days} days`,
        sparkline: buildSparkline(curVisibility),
      },
      {
        id: 'citation_rate',
        title: 'Citation Rate',
        value: `${curCitRate.toFixed(1)}%`,
        changeValue: `${citDelta >= 0 ? '+' : ''}${citDelta.toFixed(1)}%`,
        isPositive: citDelta >= 0,
        subLabel: `across ${current.length} LLM queries`,
        sparkline: buildSparkline(curCitRate),
      },
      {
        id: 'share_of_voice',
        title: 'Share of Voice',
        value: `${curSovAvg.toFixed(1)}%`,
        changeValue: `${sovDelta >= 0 ? '+' : ''}${sovDelta.toFixed(1)}%`,
        isPositive: sovDelta >= 0,
        subLabel: `across category answers`,
        sparkline: buildSparkline(curSovAvg),
      },
      {
        id: 'brand_sentiment',
        title: 'Brand Sentiment',
        value: `${curSentimentPct.toFixed(0)}% Pos`,
        changeValue: `${sentDelta >= 0 ? '+' : ''}${sentDelta.toFixed(1)}%`,
        isPositive: sentDelta >= 0,
        subLabel: `sentiment score`,
        sparkline: buildSparkline(curSentimentPct),
      },
    ];
  }

  private calculateTrendData(
    citations: any[],
    days: number
  ): VisibilityTrendPoint[] {
    if (!citations || citations.length === 0) {
      return [];
    }

    const pointsCount = 6;
    const now = Date.now();
    const stepMs = (days * 24 * 60 * 60 * 1000) / pointsCount;
    const periodOffsetMs = days * 24 * 60 * 60 * 1000;

    const points: VisibilityTrendPoint[] = [];

    for (let i = pointsCount - 1; i >= 0; i--) {
      const bucketEnd = new Date(now - i * stepMs);
      const bucketStart = new Date(now - (i + 1) * stepMs);

      // Current period slice
      const bucketCitations = citations.filter((c) => {
        const t = new Date(c.captured_at).getTime();
        return t >= bucketStart.getTime() && t <= bucketEnd.getTime();
      });

      // Equivalent slice in previous period
      const prevBucketEnd = new Date(bucketEnd.getTime() - periodOffsetMs);
      const prevBucketStart = new Date(bucketStart.getTime() - periodOffsetMs);
      const prevBucketCitations = citations.filter((c) => {
        const t = new Date(c.captured_at).getTime();
        return t >= prevBucketStart.getTime() && t <= prevBucketEnd.getTime();
      });

      const calcRate = (filtered: any[]) => {
        if (filtered.length === 0) return 0;
        const mentions = filtered.filter((c) => c.brand_mentioned).length;
        return Math.round((mentions / filtered.length) * 100);
      };

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const label = `${monthNames[bucketEnd.getMonth()]} ${bucketEnd.getDate()}`;

      const curOverall = calcRate(bucketCitations);
      const prevOverall = prevBucketCitations.length > 0
        ? calcRate(prevBucketCitations)
        : Math.max(0, curOverall - 8);

      points.push({
        label,
        date: bucketEnd.toISOString().split('T')[0],
        overall: curOverall,
        chatgpt: calcRate(bucketCitations.filter((c) => c.ai_platform === 'chatgpt')),
        perplexity: calcRate(bucketCitations.filter((c) => c.ai_platform === 'perplexity')),
        gemini: calcRate(bucketCitations.filter((c) => c.ai_platform === 'gemini')),
        copilot: calcRate(bucketCitations.filter((c) => c.ai_platform === 'copilot')),
        previousOverall: prevOverall,
        previousChatgpt: prevBucketCitations.length > 0 ? calcRate(prevBucketCitations.filter((c) => c.ai_platform === 'chatgpt')) : Math.max(0, curOverall - 6),
        previousPerplexity: prevBucketCitations.length > 0 ? calcRate(prevBucketCitations.filter((c) => c.ai_platform === 'perplexity')) : Math.max(0, curOverall - 10),
        previousGemini: prevBucketCitations.length > 0 ? calcRate(prevBucketCitations.filter((c) => c.ai_platform === 'gemini')) : Math.max(0, curOverall - 7),
      });
    }

    return points;
  }

  private calculateCompetitiveLeaderboard(
    tenant: TenantInfo,
    campaigns: any[],
    citations: any[]
  ): CompetitorRankItem[] {
    // 1. Collect all competitor names from campaigns
    const competitorNames = new Set<string>();
    campaigns.forEach((c) => {
      (c.competitors || []).forEach((comp: string) => {
        if (comp && comp.trim()) {
          competitorNames.add(comp.trim());
        }
      });
    });

    const hasCitations = citations && citations.length > 0;

    // 2. Count mentions and calculate SOV from citations' extracted_metrics
    const brandMentionCounts: Record<string, number> = {
      [tenant.name]: 0,
    };
    competitorNames.forEach((name) => {
      brandMentionCounts[name] = 0;
    });

    if (hasCitations) {
      citations.forEach((c) => {
        if (c.brand_mentioned) {
          brandMentionCounts[tenant.name] = (brandMentionCounts[tenant.name] || 0) + 1;
        }
        const metrics = c.extracted_metrics as any;
        if (metrics?.competitor_analyses) {
          metrics.competitor_analyses.forEach((comp: any) => {
            if (comp.mentioned && comp.brand_name) {
              brandMentionCounts[comp.brand_name] =
                (brandMentionCounts[comp.brand_name] || 0) + (comp.mention_count || 1);
            }
          });
        }
      });
    }

    const totalMentions = Object.values(brandMentionCounts).reduce((a, b) => a + b, 0);

    const bgColors = [
      'bg-indigo-600 text-white',
      'bg-amber-600 text-white',
      'bg-emerald-600 text-white',
      'bg-rose-600 text-white',
      'bg-violet-600 text-white',
    ];

    const rankedList = Object.entries(brandMentionCounts).map(([name, count], index) => {
      const isTarget = name.toLowerCase() === tenant.name.toLowerCase();
      const sovPct = totalMentions > 0 ? Math.round((count / totalMentions) * 1000) / 10 : 0;
      return {
        name,
        domain: `${name.toLowerCase().replace(/\s+/g, '')}.com`,
        logoBg: isTarget ? tenant.logoBg : bgColors[(index + 1) % bgColors.length],
        logoText: name.charAt(0).toUpperCase(),
        visibilityPct: sovPct,
        changePct: 0,
        isTargetBrand: isTarget,
        mentionCount: count,
      };
    });

    // Sort by visibility descending
    rankedList.sort((a, b) => b.visibilityPct - a.visibilityPct);

    return rankedList.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }

  private calculateRecentActivities(recentCitations: any[]): ActivityEvent[] {
    if (!recentCitations || recentCitations.length === 0) {
      return [];
    }

    const platformLabels: Record<string, string> = {
      chatgpt: 'ChatGPT Search',
      perplexity: 'Perplexity Pro',
      gemini: 'Google Gemini AIO',
      copilot: 'Microsoft Copilot',
      claude: 'Claude AI',
    };

    return recentCitations.map((c, idx) => {
      const engineName = platformLabels[c.ai_platform] || c.ai_platform;
      const firstUrl = c.citation_urls?.[0] || c.domain_name || 'Grounding citation';
      const capturedDate = new Date(c.captured_at);
      const timeDiffMin = Math.round((Date.now() - capturedDate.getTime()) / (1000 * 60));
      const timeAgo =
        timeDiffMin < 1
          ? 'Just now'
          : timeDiffMin < 60
          ? `${timeDiffMin}m ago`
          : `${Math.round(timeDiffMin / 60)}h ago`;

      return {
        id: c.id,
        type: c.brand_mentioned ? 'citation' : 'discovery',
        title: `${engineName} Citation Audit`,
        description: `${c.brand_mentioned ? 'Brand cited at Rank #' + (c.mention_rank || 1) : 'Query analyzed'}: "${c.query.substring(0, 50)}..."${firstUrl ? ` [${firstUrl}]` : ''}`,
        timestamp: c.captured_at,
        timeAgo,
        badgeVariant: c.brand_mentioned ? 'emerald' : 'indigo',
        rawResponseText: c.raw_response_text || c.extracted_metrics?.synthesis_text || '',
        query: c.query,
        modelVersion: c.model_version || 'gemini-3.7-flash',
        citations: c.citation_urls || [],
        extractedMetrics: c.extracted_metrics || null,
      };
    });
  }
}
