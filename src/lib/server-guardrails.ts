import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import {
  canAddCompetitor,
  validateCompetitorList,
  canAddCampaign,
  TIER_LIMITS,
  SubscriptionTier,
  getTenantTier,
} from '@/lib/subscription-limits';

export class SubscriptionGuardrailError extends Error {
  public statusCode: number = 403;
  public tier: SubscriptionTier;
  public limit: number;
  public currentCount: number;

  constructor(message: string, tier: SubscriptionTier, limit: number, currentCount: number) {
    super(message);
    this.name = 'SubscriptionGuardrailError';
    this.tier = tier;
    this.limit = limit;
    this.currentCount = currentCount;
  }
}

/**
 * Server-side guardrail to enforce competitor limits before INSERT or UPDATE operations
 * Tier restrictions:
 * - Starter: Max 1 competitor
 * - Growth: Max 10 competitors
 * - Enterprise: Unlimited competitors
 */
export async function enforceCompetitorGuardrail(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  additionalCount: number = 1
): Promise<void> {
  const result = await canAddCompetitor(supabase, tenantId, additionalCount);

  if (!result.allowed) {
    throw new SubscriptionGuardrailError(
      result.errorMessage ||
        `Competitor limit reached (${result.currentCount}/${result.limit} on ${TIER_LIMITS[result.tier].displayName} plan). Please upgrade your subscription.`,
      result.tier,
      result.limit,
      result.currentCount
    );
  }
}

/**
 * Server-side guardrail to enforce competitor count limits when updating campaign competitor arrays
 */
export async function enforceCampaignCompetitorListGuardrail(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  proposedCompetitors: string[]
): Promise<void> {
  const result = await validateCompetitorList(supabase, tenantId, proposedCompetitors);

  if (!result.allowed) {
    throw new SubscriptionGuardrailError(
      result.errorMessage ||
        `Cannot track ${result.currentCount} competitors on ${TIER_LIMITS[result.tier].displayName} plan (Max: ${result.limit}). Upgrade to Growth or Enterprise.`,
      result.tier,
      result.limit,
      result.currentCount
    );
  }
}

/**
 * Server-side guardrail to enforce campaign creation limits before INSERT operations
 */
export async function enforceCampaignGuardrail(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<void> {
  const result = await canAddCampaign(supabase, tenantId);

  if (!result.allowed) {
    throw new SubscriptionGuardrailError(
      result.errorMessage ||
        `Campaign limit reached (${result.currentCount}/${result.limit} on ${TIER_LIMITS[result.tier].displayName} plan). Please upgrade your subscription.`,
      result.tier,
      result.limit,
      result.currentCount
    );
  }
}
