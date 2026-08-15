import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export interface CreateCampaignInput {
  tenantId: string;
  name: string;
  brandName: string;
  brandAliases?: string[];
  aliases?: string[];
  targetDomain?: string;
  targetQueries: string[];
  competitors?: string[];
  frequency?: string;
}

export class CampaignService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Creates a new tracking campaign scoped to a tenant
   */
  async createCampaign(input: CreateCampaignInput) {
    const combinedAliases = Array.from(
      new Set([...(input.aliases || []), ...(input.brandAliases || [])])
    );

    const { data, error } = await this.supabase
      .from('campaigns')
      .insert({
        tenant_id: input.tenantId,
        name: input.name,
        brand_name: input.brandName,
        brand_aliases: combinedAliases,
        aliases: combinedAliases,
        target_domain: input.targetDomain || null,
        target_queries: input.targetQueries,
        competitors: input.competitors || [],
        tracking_frequency: input.frequency || 'daily',
        is_active: true,
      } as any)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create campaign: ${error?.message}`);
    }
    return data;
  }

  /**
   * Retrieves all active campaigns for a tenant
   */
  async listCampaigns(tenantId: string) {
    const { data, error } = await this.supabase
      .from('campaigns')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to list campaigns: ${error.message}`);
    }
    return data;
  }

  /**
   * Retrieves a single campaign by ID scoped to a tenant
   */
  async getCampaign(tenantId: string, campaignId: string) {
    const { data, error } = await this.supabase
      .from('campaigns')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', campaignId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch campaign: ${error.message}`);
    }
    return data;
  }
}
