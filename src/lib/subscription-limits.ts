import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export type SubscriptionTier = 'starter' | 'growth' | 'enterprise';

export interface TierLimitConfig {
  maxCampaigns: number;
  maxCompetitors: number;
  maxDailyPrompts: number;
  displayName: string;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimitConfig> = {
  starter: {
    maxCampaigns: 3,
    maxCompetitors: 1, // Starter: Max 1 competitor
    maxDailyPrompts: 25,
    displayName: 'Starter',
  },
  growth: {
    maxCampaigns: 20,
    maxCompetitors: 10, // Growth: Max 10 competitors
    maxDailyPrompts: 150,
    displayName: 'Growth',
  },
  enterprise: {
    maxCampaigns: Infinity, // Enterprise: Unlimited campaigns
    maxCompetitors: Infinity, // Enterprise: Unlimited competitors
    maxDailyPrompts: 1000,
    displayName: 'Enterprise',
  },
};

export interface LimitValidationResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  tier: SubscriptionTier;
  errorMessage?: string;
}

/**
 * Retrieves the current subscription tier for a tenant
 */
export async function getTenantTier(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<SubscriptionTier> {
  const { data: tenant } = await supabase
    .from('tenants')
    .select('subscription_tier, settings')
    .eq('id', tenantId)
    .single();

  if (!tenant) {
    return 'starter';
  }

  const rawTier = (
    (tenant as any).plan_type ||
    tenant.subscription_tier ||
    (tenant.settings as any)?.plan ||
    'starter'
  ).toLowerCase();

  if (rawTier === 'growth') return 'growth';
  if (rawTier === 'enterprise' || rawTier === 'agency' || rawTier === 'pro') return 'enterprise';
  return 'starter';
}

/**
 * Validates if the tenant can add another competitor
 */
export async function canAddCompetitor(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  additionalCount: number = 1
): Promise<LimitValidationResult> {
  const tier = await getTenantTier(supabase, tenantId);
  const limit = TIER_LIMITS[tier].maxCompetitors;

  let currentCount = 0;

  try {
    const { count, error } = await supabase
      .from('competitors')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    if (error || count === null) {
      // Fallback: count distinct competitors in campaigns
      const { data: camps } = await supabase
        .from('campaigns')
        .select('competitors')
        .eq('tenant_id', tenantId);

      const uniqueCompetitors = new Set<string>();
      (camps || []).forEach((c) => {
        (c.competitors || []).forEach((comp) => {
          if (comp && typeof comp === 'string') {
            uniqueCompetitors.add(comp.toLowerCase().trim());
          }
        });
      });
      currentCount = uniqueCompetitors.size;
    } else {
      currentCount = count;
    }
  } catch (e) {
    currentCount = 0;
  }

  // If limit is Infinity (Enterprise), always allowed
  if (limit === Infinity) {
    return {
      allowed: true,
      currentCount,
      limit,
      tier,
    };
  }

  const allowed = currentCount + additionalCount <= limit;

  return {
    allowed,
    currentCount,
    limit,
    tier,
    errorMessage: allowed
      ? undefined
      : `Competitor limit reached (${currentCount}/${limit} on ${TIER_LIMITS[tier].displayName} plan). Upgrade to add more competitors.`,
  };
}

/**
 * Validates if a proposed list of competitors exceeds the tenant's tier limit
 */
export async function validateCompetitorList(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  proposedCompetitors: string[]
): Promise<LimitValidationResult> {
  const tier = await getTenantTier(supabase, tenantId);
  const limit = TIER_LIMITS[tier].maxCompetitors;

  if (limit === Infinity) {
    return {
      allowed: true,
      currentCount: proposedCompetitors.length,
      limit,
      tier,
    };
  }

  const uniqueProposed = new Set(
    proposedCompetitors.map((c) => c.toLowerCase().trim()).filter(Boolean)
  );
  const count = uniqueProposed.size;
  const allowed = count <= limit;

  return {
    allowed,
    currentCount: count,
    limit,
    tier,
    errorMessage: allowed
      ? undefined
      : `Cannot configure ${count} competitors on the ${TIER_LIMITS[tier].displayName} tier (Max: ${limit}). Upgrade to monitor more competitors.`,
  };
}

/**
 * Validates if the tenant can add another tracking campaign
 */
export async function canAddCampaign(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<LimitValidationResult> {
  const tier = await getTenantTier(supabase, tenantId);
  const limit = TIER_LIMITS[tier].maxCampaigns;

  if (limit === Infinity) {
    return {
      allowed: true,
      currentCount: 0,
      limit,
      tier,
    };
  }

  const { count } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);

  const currentCount = count || 0;
  const allowed = currentCount < limit;

  return {
    allowed,
    currentCount,
    limit,
    tier,
    errorMessage: allowed
      ? undefined
      : `Campaign limit reached (${currentCount}/${limit} on ${TIER_LIMITS[tier].displayName} plan). Please upgrade your plan.`,
  };
}

/**
 * Validates daily prompt quota and calculates remaining allowed queries for today
 */
export async function validatePromptLimit(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  requestedQueryCount: number
): Promise<{
  allowed: boolean;
  dailyLimit: number;
  todayCount: number;
  processableCount: number;
  tier: SubscriptionTier;
  message?: string;
}> {
  const tier = await getTenantTier(supabase, tenantId);
  const dailyLimit = TIER_LIMITS[tier].maxDailyPrompts;

  // Start of today (UTC)
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('citations')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .gte('captured_at', startOfDay.toISOString());

  const todayCount = count || 0;
  const remainingAllowance = Math.max(0, dailyLimit - todayCount);
  const processableCount = Math.min(requestedQueryCount, remainingAllowance);
  const allowed = processableCount > 0;

  return {
    allowed,
    dailyLimit,
    todayCount,
    processableCount,
    tier,
    message:
      processableCount < requestedQueryCount
        ? `Daily prompt tracking limit reached (${todayCount}/${dailyLimit} used today on ${TIER_LIMITS[tier].displayName} plan).`
        : undefined,
  };
}
