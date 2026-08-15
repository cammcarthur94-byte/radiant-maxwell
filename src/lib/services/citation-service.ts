import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, AIPlatform, MentionSentiment } from '@/types/database';
import type { ExtractedAIOMetrics } from '@/extractor/types';

export interface SaveCitationPayload {
  tenantId: string;
  campaignId: string;
  aiPlatform: AIPlatform;
  modelVersion: string;
  query: string;
  promptVariation?: string;
  metrics: ExtractedAIOMetrics;
  rawResponseText?: string;
}

export class CitationService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Persists extracted AIO metrics and associated citation links atomically
   */
  async saveCitationExtraction(payload: SaveCitationPayload) {
    const {
      tenantId,
      campaignId,
      aiPlatform,
      modelVersion,
      query,
      promptVariation,
      metrics,
      rawResponseText,
    } = payload;

    const sentiment = metrics.target_brand_analysis.sentiment as MentionSentiment;
    const citationUrls = metrics.citations.map((c) => c.url);

    // 1. Insert main Citation record
    const { data: citation, error: citationError } = await this.supabase
      .from('citations')
      .insert({
        tenant_id: tenantId,
        campaign_id: campaignId,
        ai_platform: aiPlatform,
        model_version: modelVersion,
        query: query,
        prompt_variation: promptVariation || null,
        brand_mentioned: metrics.target_brand_presence,
        mention_sentiment: sentiment || null,
        mention_rank: metrics.target_brand_analysis.recommendation_rank,
        share_of_voice_score: metrics.share_of_voice.target_weighted_visibility_score,
        citation_urls: citationUrls,
        extracted_metrics: metrics as any,
        raw_response_text: rawResponseText || null,
        captured_at: metrics.timestamp || new Date().toISOString(),
      })
      .select()
      .single();

    if (citationError || !citation) {
      throw new Error(`Failed to save citation record: ${citationError?.message}`);
    }

    // 2. Insert granular Citation Links
    if (metrics.citations && metrics.citations.length > 0) {
      const linkInserts = metrics.citations.map((link) => ({
        tenant_id: tenantId,
        citation_id: citation.id,
        url: link.url,
        domain: link.domain,
        anchor_text: link.anchor_text || null,
        position_index: link.index,
        is_target_brand_domain: link.is_target_brand_domain,
        is_competitor_domain: link.is_competitor_domain,
      }));

      const { error: linksError } = await this.supabase
        .from('citation_links')
        .insert(linkInserts);

      if (linksError) {
        console.error('Warning: Error inserting citation links:', linksError.message);
      }
    }

    return citation;
  }

  /**
   * Retrieves citations for a campaign with tenant scoping
   */
  async getCampaignCitations(tenantId: string, campaignId: string, limit = 50) {
    const { data, error } = await this.supabase
      .from('citations')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('campaign_id', campaignId)
      .order('captured_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch citations: ${error.message}`);
    }
    return data;
  }

  /**
   * Calculates aggregate Share-of-Voice and visibility benchmarks for a campaign
   */
  async getCampaignAnalytics(tenantId: string, campaignId: string) {
    const citations = await this.getCampaignCitations(tenantId, campaignId, 100);
    if (!citations || citations.length === 0) {
      return {
        totalRuns: 0,
        mentionRatePct: 0,
        averageRank: null,
        averageSovScore: 0,
        engineBreakdown: {},
      };
    }

    const totalRuns = citations.length;
    const mentions = citations.filter((c) => c.brand_mentioned);
    const mentionRatePct = (mentions.length / totalRuns) * 100;

    const rankedMentions = mentions.filter((c) => c.mention_rank !== null);
    const avgRank =
      rankedMentions.length > 0
        ? rankedMentions.reduce((acc, c) => acc + (c.mention_rank || 0), 0) /
          rankedMentions.length
        : null;

    const totalSov = citations.reduce(
      (acc, c) => acc + Number(c.share_of_voice_score || 0),
      0
    );
    const averageSovScore = totalSov / totalRuns;

    return {
      totalRuns,
      mentionRatePct: Math.round(mentionRatePct * 10) / 10,
      averageRank: avgRank !== null ? Math.round(avgRank * 10) / 10 : null,
      averageSovScore: Math.round(averageSovScore * 10) / 10,
    };
  }
}
