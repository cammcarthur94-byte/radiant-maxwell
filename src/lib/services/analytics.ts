import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { DateRangeOption, KpiMetric, CompetitorRankItem } from '@/types/dashboard';

export interface DateWindow {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
  days: number;
}

export interface MetricCalculationResult {
  currentValue: number;
  previousValue: number;
  delta: number;
}

export interface CompetitivePositionResult extends MetricCalculationResult {
  currentRank: number;
  previousRank: number;
  rankDelta: number; // positive means improved rank (e.g. from 2 to 1 is +1)
  rankedLeaderboard: CompetitorRankItem[];
}

export interface DashboardKpiSummary {
  shareOfVoice: MetricCalculationResult;
  visibilityScore: MetricCalculationResult;
  citationRate: MetricCalculationResult;
  competitivePosition: CompetitivePositionResult;
  kpiCards: KpiMetric[];
}

/**
 * Calculates start and end timestamps for the current period and the immediately preceding period of equal length.
 */
export function resolveDateWindows(dateRange: DateRangeOption | number = '30d'): DateWindow {
  const now = new Date();

  if (dateRange === 'all') {
    const beginningOfTime = new Date(0);
    return {
      currentStart: beginningOfTime,
      currentEnd: now,
      previousStart: beginningOfTime,
      previousEnd: now,
      days: 365,
    };
  }

  const days = typeof dateRange === 'number'
    ? dateRange
    : dateRange === '7d'
    ? 7
    : dateRange === '90d'
    ? 90
    : 30;

  const currentStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const previousStart = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

  return {
    currentStart,
    currentEnd: now,
    previousStart,
    previousEnd: currentStart,
    days,
  };
}

/**
 * Helper to normalize date parameters when accepting either Date or DateRangeOption
 */
function normalizeDateRangeParams(
  startDateOrRange: Date | DateRangeOption = '30d',
  endDateOrCampaign?: Date | string,
  campaignId?: string
): { startDate: Date; endDate: Date; campaignId?: string } {
  if (typeof startDateOrRange === 'string') {
    const window = resolveDateWindows(startDateOrRange as DateRangeOption);
    return {
      startDate: window.currentStart,
      endDate: window.currentEnd,
      campaignId: typeof endDateOrCampaign === 'string' ? endDateOrCampaign : campaignId,
    };
  }

  return {
    startDate: startDateOrRange,
    endDate: endDateOrCampaign instanceof Date ? endDateOrCampaign : new Date(),
    campaignId,
  };
}

/**
 * 1. Share of Voice (SoV):
 * Count total brand_mentions where is_primary_brand = true.
 * Divide by the total count of all brand_mentions for that tenant. Multiply by 100.
 */
export async function calculateShareOfVoice(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  startDateOrRange: Date | DateRangeOption = '30d',
  endDateOrCampaign?: Date | string,
  campaignId?: string
): Promise<number> {
  const params = normalizeDateRangeParams(startDateOrRange, endDateOrCampaign, campaignId);
  let query = supabase
    .from('brand_mentions')
    .select('is_primary_brand, campaign_id')
    .eq('tenant_id', tenantId)
    .gte('created_at', params.startDate.toISOString())
    .lte('created_at', params.endDate.toISOString());

  if (params.campaignId && params.campaignId !== 'all') {
    query = query.eq('campaign_id', params.campaignId);
  }

  const { data: mentions, error } = await query;
  if (error || !mentions || mentions.length === 0) {
    return 0;
  }

  const totalMentions = mentions.length;
  const primaryMentions = mentions.filter((m) => m.is_primary_brand === true).length;

  return totalMentions > 0 ? (primaryMentions / totalMentions) * 100 : 0;
}

/**
 * 2. Visibility Score:
 * Count unique campaign_ids in brand_mentions where is_primary_brand = true.
 * Divide by the total unique campaign_ids run in that period. Multiply by 100.
 */
export async function calculateVisibilityScore(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  startDateOrRange: Date | DateRangeOption = '30d',
  endDateOrCampaign?: Date | string,
  campaignId?: string
): Promise<number> {
  const params = normalizeDateRangeParams(startDateOrRange, endDateOrCampaign, campaignId);

  // A. Get unique campaign_ids with primary brand mentions
  let mentionQuery = supabase
    .from('brand_mentions')
    .select('campaign_id')
    .eq('tenant_id', tenantId)
    .eq('is_primary_brand', true)
    .gte('created_at', params.startDate.toISOString())
    .lte('created_at', params.endDate.toISOString());

  if (params.campaignId && params.campaignId !== 'all') {
    mentionQuery = mentionQuery.eq('campaign_id', params.campaignId);
  }

  // B. Get total unique campaign_ids run in that period from citations
  let citationsQuery = supabase
    .from('citations')
    .select('campaign_id')
    .eq('tenant_id', tenantId)
    .gte('captured_at', params.startDate.toISOString())
    .lte('captured_at', params.endDate.toISOString());

  if (params.campaignId && params.campaignId !== 'all') {
    citationsQuery = citationsQuery.eq('campaign_id', params.campaignId);
  }

  const [{ data: mentionRows, error: mErr }, { data: citationRows, error: cErr }] =
    await Promise.all([mentionQuery, citationsQuery]);

  if (mErr || cErr || !citationRows || citationRows.length === 0) {
    return 0;
  }

  const uniquePrimaryCampaigns = new Set(
    (mentionRows || []).map((r) => r.campaign_id)
  ).size;

  const totalUniqueCampaignsRun = new Set(
    citationRows.map((r) => r.campaign_id)
  ).size;

  return totalUniqueCampaignsRun > 0
    ? (uniquePrimaryCampaigns / totalUniqueCampaignsRun) * 100
    : 0;
}

/**
 * 3. Citation Rate:
 * Count unique campaign_ids in citations linked to the primary brand (brand_mentioned = true AND competitor_id IS NULL).
 * Divide by the total unique campaign_ids run in that period. Multiply by 100.
 */
export async function calculateCitationRate(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  startDateOrRange: Date | DateRangeOption = '30d',
  endDateOrCampaign?: Date | string,
  campaignId?: string
): Promise<number> {
  const params = normalizeDateRangeParams(startDateOrRange, endDateOrCampaign, campaignId);
  let citationsQuery = supabase
    .from('citations')
    .select('campaign_id, brand_mentioned, competitor_id')
    .eq('tenant_id', tenantId)
    .gte('captured_at', params.startDate.toISOString())
    .lte('captured_at', params.endDate.toISOString());

  if (params.campaignId && params.campaignId !== 'all') {
    citationsQuery = citationsQuery.eq('campaign_id', params.campaignId);
  }

  const { data: citations, error } = await citationsQuery;
  if (error || !citations || citations.length === 0) {
    return 0;
  }

  // Unique campaign_ids run
  const totalUniqueCampaignsRun = new Set(citations.map((c) => c.campaign_id)).size;

  // Unique campaign_ids linked to the primary brand
  const primaryCampaigns = new Set(
    citations
      .filter((c) => c.brand_mentioned === true && !c.competitor_id)
      .map((c) => c.campaign_id)
  ).size;

  return totalUniqueCampaignsRun > 0
    ? (primaryCampaigns / totalUniqueCampaignsRun) * 100
    : 0;
}

/**
 * 4. Competitive Position:
 * Calculate the total mentions for all distinct brand_names in brand_mentions.
 * Sort descending. Return the integer rank (1, 2, 3...) of the primary brand.
 */
export async function calculateCompetitivePosition(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  startDateOrRange: Date | DateRangeOption = '30d',
  endDateOrCampaign?: Date | string,
  campaignIdOrBrand?: string,
  fallbackPrimaryBrandName?: string
): Promise<{
  rank: number;
  leaderboard: CompetitorRankItem[];
}> {
  let startDate: Date;
  let endDate: Date;
  let campaignId: string | undefined;
  let brandNameFallback: string | undefined = fallbackPrimaryBrandName;

  if (typeof startDateOrRange === 'string') {
    const window = resolveDateWindows(startDateOrRange as DateRangeOption);
    startDate = window.currentStart;
    endDate = window.currentEnd;
    campaignId = typeof endDateOrCampaign === 'string' ? endDateOrCampaign : undefined;
    brandNameFallback = campaignIdOrBrand;
  } else {
    startDate = startDateOrRange;
    endDate = endDateOrCampaign instanceof Date ? endDateOrCampaign : new Date();
    campaignId = campaignIdOrBrand;
  }

  let query = supabase
    .from('brand_mentions')
    .select('brand_name, is_primary_brand, campaign_id')
    .eq('tenant_id', tenantId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (campaignId && campaignId !== 'all') {
    query = query.eq('campaign_id', campaignId);
  }

  const { data: mentions, error } = await query;

  if (error || !mentions || mentions.length === 0) {
    return {
      rank: 1,
      leaderboard: [],
    };
  }

  // Aggregate mention counts per brand
  const brandStats: Record<
    string,
    { brandName: string; mentionCount: number; isPrimary: boolean }
  > = {};

  mentions.forEach((m) => {
    const brand = m.brand_name.trim();
    if (!brandStats[brand]) {
      brandStats[brand] = {
        brandName: brand,
        mentionCount: 0,
        isPrimary: Boolean(m.is_primary_brand),
      };
    }
    brandStats[brand].mentionCount += 1;
    if (m.is_primary_brand) {
      brandStats[brand].isPrimary = true;
    }
  });

  const totalMentions = mentions.length || 1;

  // Sort descending by mention count
  const sortedBrands = Object.values(brandStats).sort(
    (a, b) => b.mentionCount - a.mentionCount
  );

  const bgColors = [
    'bg-indigo-600 text-white',
    'bg-amber-600 text-white',
    'bg-emerald-600 text-white',
    'bg-rose-600 text-white',
    'bg-violet-600 text-white',
  ];

  let primaryBrandRank = 1;

  const leaderboard: CompetitorRankItem[] = sortedBrands.map((item, idx) => {
    const rank = idx + 1;
    const isTargetBrand =
      item.isPrimary ||
      (fallbackPrimaryBrandName &&
        item.brandName.toLowerCase() === fallbackPrimaryBrandName.toLowerCase());

    if (isTargetBrand) {
      primaryBrandRank = rank;
    }

    const visibilityPct = Math.round((item.mentionCount / totalMentions) * 1000) / 10;

    return {
      rank,
      name: item.brandName,
      domain: `${item.brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      logoBg: isTargetBrand ? 'bg-indigo-600 text-white' : bgColors[(idx + 1) % bgColors.length],
      logoText: item.brandName.charAt(0).toUpperCase(),
      visibilityPct,
      changePct: isTargetBrand ? 0 : 0, // Period-over-period delta will be layered on top
      isTargetBrand: Boolean(isTargetBrand),
    };
  });

  return {
    rank: primaryBrandRank,
    leaderboard,
  };
}

/**
 * Period-over-Period Wrapper:
 * Computes metrics for both the current date range AND the immediately preceding date range of equal length,
 * then calculates absolute point differences (e.g. +2.7 or -1.5).
 */
export async function calculatePeriodOverPeriodMetrics(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  dateRange: DateRangeOption = '30d',
  campaignId: string = 'all',
  primaryBrandName?: string
): Promise<DashboardKpiSummary> {
  const window = resolveDateWindows(dateRange);

  // Run calculations in parallel for current and previous periods
  const [
    curSov,
    prevSov,
    curVis,
    prevVis,
    curCit,
    prevCit,
    curComp,
    prevComp,
  ] = await Promise.all([
    calculateShareOfVoice(supabase, tenantId, window.currentStart, window.currentEnd, campaignId),
    calculateShareOfVoice(supabase, tenantId, window.previousStart, window.previousEnd, campaignId),
    calculateVisibilityScore(supabase, tenantId, window.currentStart, window.currentEnd, campaignId),
    calculateVisibilityScore(supabase, tenantId, window.previousStart, window.previousEnd, campaignId),
    calculateCitationRate(supabase, tenantId, window.currentStart, window.currentEnd, campaignId),
    calculateCitationRate(supabase, tenantId, window.previousStart, window.previousEnd, campaignId),
    calculateCompetitivePosition(supabase, tenantId, window.currentStart, window.currentEnd, campaignId, primaryBrandName),
    calculateCompetitivePosition(supabase, tenantId, window.previousStart, window.previousEnd, campaignId, primaryBrandName),
  ]);

  const sovDelta = Math.round((curSov - prevSov) * 10) / 10;
  const visDelta = Math.round((curVis - prevVis) * 10) / 10;
  const citDelta = Math.round((curCit - prevCit) * 10) / 10;

  // Percentage deltas (e.g. ((cur - prev) / prev) * 100)
  const calcPctDelta = (cur: number, prev: number) => {
    if (prev === 0) return cur > 0 ? 100 : 0;
    return Math.round(((cur - prev) / prev) * 1000) / 10;
  };

  // Rank change: e.g. moving from rank 3 to rank 1 is +2 improvement
  const rankDelta = prevComp.rank - curComp.rank;

  // Build sparkline helper based on base value and trend direction
  const buildSparkline = (baseVal: number, isPos: boolean) => {
    const step = Math.max(1, baseVal * 0.05);
    const s1 = Math.max(0, isPos ? baseVal - step * 3 : baseVal + step * 3);
    const s2 = Math.max(0, isPos ? baseVal - step * 1 : baseVal + step * 1.5);
    const s3 = Math.max(0, isPos ? baseVal + step * 1 : baseVal - step * 0.5);
    const s4 = Math.max(0, isPos ? baseVal - step * 0.5 : baseVal + step * 0.5);
    const s5 = Math.max(0, isPos ? baseVal + step * 1.5 : baseVal - step * 1.5);
    return [s1, s2, s3, s4, s5, baseVal].map((v) => Math.round(v * 10) / 10);
  };

  // Map previous ranks & visibility to current leaderboard
  const prevRankMap = new Map(prevComp.leaderboard.map((item) => [item.name.toLowerCase(), item]));
  const enrichedLeaderboard: CompetitorRankItem[] = curComp.leaderboard.map((item) => {
    const prevItem = prevRankMap.get(item.name.toLowerCase());
    const prevRank = prevItem?.rank ?? item.rank;
    const prevVis = prevItem?.visibilityPct ?? item.visibilityPct;
    const rankDiff = prevRank - item.rank;
    const visDelta = Math.round((item.visibilityPct - prevVis) * 10) / 10;
    return {
      ...item,
      previousRank: prevRank,
      previousVisibilityPct: prevVis,
      positionDelta: rankDiff,
      visibilityDelta: visDelta,
      changePct: rankDiff !== 0 ? rankDiff : visDelta,
    };
  });

  const kpiCards: KpiMetric[] = [
    {
      id: 'visibility',
      title: 'Visibility Score',
      value: `${curVis.toFixed(1)}%`,
      previousValue: `${prevVis.toFixed(1)}%`,
      changeValue: `${visDelta >= 0 ? '+' : ''}${visDelta.toFixed(1)}%`,
      percentageDelta: calcPctDelta(curVis, prevVis),
      absoluteDelta: visDelta,
      rawCurrent: curVis,
      rawPrevious: prevVis,
      isPositive: visDelta >= 0,
      subLabel: `vs. previous ${window.days} days`,
      sparkline: buildSparkline(curVis, visDelta >= 0),
    },
    {
      id: 'citation_rate',
      title: 'Citation Rate',
      value: `${curCit.toFixed(1)}%`,
      previousValue: `${prevCit.toFixed(1)}%`,
      changeValue: `${citDelta >= 0 ? '+' : ''}${citDelta.toFixed(1)}%`,
      percentageDelta: calcPctDelta(curCit, prevCit),
      absoluteDelta: citDelta,
      rawCurrent: curCit,
      rawPrevious: prevCit,
      isPositive: citDelta >= 0,
      subLabel: `across target queries`,
      sparkline: buildSparkline(curCit, citDelta >= 0),
    },
    {
      id: 'share_of_voice',
      title: 'Share of Voice (SoV)',
      value: `${curSov.toFixed(1)}%`,
      previousValue: `${prevSov.toFixed(1)}%`,
      changeValue: `${sovDelta >= 0 ? '+' : ''}${sovDelta.toFixed(1)}%`,
      percentageDelta: calcPctDelta(curSov, prevSov),
      absoluteDelta: sovDelta,
      rawCurrent: curSov,
      rawPrevious: prevSov,
      isPositive: sovDelta >= 0,
      subLabel: `of total category mentions`,
      sparkline: buildSparkline(curSov, sovDelta >= 0),
    },
    {
      id: 'competitive_position',
      title: 'Competitive Position',
      value: `Rank #${curComp.rank}`,
      previousValue: `Rank #${prevComp.rank}`,
      changeValue: `${rankDelta > 0 ? '+' : ''}${rankDelta} pos`,
      percentageDelta: rankDelta,
      absoluteDelta: rankDelta,
      rawCurrent: curComp.rank,
      rawPrevious: prevComp.rank,
      isPositive: rankDelta >= 0,
      subLabel: `out of ${curComp.leaderboard.length || 1} brands`,
      sparkline: buildSparkline(curComp.rank, rankDelta >= 0),
    },
  ];

  return {
    shareOfVoice: {
      currentValue: curSov,
      previousValue: prevSov,
      delta: sovDelta,
    },
    visibilityScore: {
      currentValue: curVis,
      previousValue: prevVis,
      delta: visDelta,
    },
    citationRate: {
      currentValue: curCit,
      previousValue: prevCit,
      delta: citDelta,
    },
    competitivePosition: {
      currentValue: curComp.rank,
      previousValue: prevComp.rank,
      delta: rankDelta,
      currentRank: curComp.rank,
      previousRank: prevComp.rank,
      rankDelta,
      rankedLeaderboard: enrichedLeaderboard,
    },
    kpiCards,
  };
}
