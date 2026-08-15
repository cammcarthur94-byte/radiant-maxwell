import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export const MultiBrandTrackingSchema = z.object({
  mentions: z.array(
    z.object({
      brand_name: z.string().describe('Name of the brand mentioned (primary brand or competitor)'),
      is_primary: z.boolean().describe('Whether this is the primary tracked brand'),
      rank_position: z.number().describe('Recommendation rank position (1 for top/first recommendation)'),
    })
  ).describe('List of ALL brands mentioned in the response (including competitors and primary brand)'),
  citations: z.array(
    z.object({
      url: z.string().describe('Source or grounding URL cited'),
      domain_name: z.string().optional().describe('Clean hostname/domain extracted from URL'),
      domain_authority_type: z.string().optional().describe('Authority tier e.g. Official Portal, Review Platform, Tech Publication, Community'),
      associated_brand: z.string().optional().describe('Brand name associated with this citation URL, if identifiable'),
    })
  ).describe('List of citations and source URLs extracted with optional brand association and domain categorization'),
  synthesis_text: z.string().describe('Complete overview answer to the conversational search query with markdown formatting'),
  mention_sentiment: z.enum(['positive', 'neutral', 'negative', 'mixed']).optional().default('positive'),
  sentiment_label: z.enum(['Positive', 'Neutral', 'Negative', 'Inaccurate']).optional().default('Positive'),
  is_misinformation: z.boolean().optional().default(false).describe('Flag true if response contains hallucinated facts, false claims, or broken brand attributions'),
  share_of_voice_score: z.number().optional().default(50.0),
});

export type MultiBrandTrackingResult = z.infer<typeof MultiBrandTrackingSchema>;

import { promptService } from '@/lib/services/prompt-service';

export class GeminiTrackingService {
  private apiKey: string | null;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || null;
  }

  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  /**
   * Executes a multi-brand generative tracking analysis using Gemini.
   * If Gemini API is not configured or unavailable, seamlessly falls back to a realistic simulation.
   */
  async executeAIOQuery(params: {
    query: string;
    brandName: string;
    brandDomain: string;
    brandAliases?: string[];
    aliases?: string[];
    competitors: string[];
  }): Promise<{
    data: MultiBrandTrackingResult;
    isLiveGemini: boolean;
    modelVersion: string;
  }> {
    const { query, brandName, brandDomain, brandAliases = [], aliases = [], competitors } = params;
    const combinedAliases = Array.from(
      new Set([...brandAliases, ...aliases].map((a) => a.trim()).filter(Boolean))
    );

    if (this.hasApiKey()) {
      const google = createGoogleGenerativeAI({ apiKey: this.apiKey! });

      // Dynamically fetch prompt template from backend prompt management service
      const prompt = await promptService.getPrompt('gemini_citation_extraction', {
        query,
        brandName,
        brandDomain,
        brandAliases: combinedAliases,
        competitors,
      });

      const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'];

      for (const modelName of modelsToTry) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout querying ${modelName}`)), 12000)
          );

          const generatePromise = generateObject({
            model: google(modelName),
            schema: MultiBrandTrackingSchema,
            prompt: prompt,
            temperature: 0.2,
          });

          const { object } = (await Promise.race([generatePromise, timeoutPromise])) as any;

          return {
            data: object,
            isLiveGemini: true,
            modelVersion: modelName,
          };
        } catch (err: any) {
          console.warn(`Gemini query notice for ${modelName}:`, err.message || err);
          if (
            err.message &&
            (err.message.includes('404') ||
              err.message.includes('not found') ||
              err.message.includes('Timeout'))
          ) {
            continue;
          }
        }
      }
    }

    // Fallback simulation conforming to the multi-brand schema
    const cleanDomain =
      brandDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '') ||
      `${brandName.toLowerCase().replace(/\s+/g, '')}.com`;

    const simulatedData: MultiBrandTrackingResult = {
      mentions: [
        {
          brand_name: brandName,
          is_primary: true,
          rank_position: 1,
        },
        ...competitors.slice(0, 2).map((comp, idx) => ({
          brand_name: comp,
          is_primary: false,
          rank_position: idx + 2,
        })),
      ],
      citations: [
        {
          url: `https://${cleanDomain}`,
          domain_name: cleanDomain,
          domain_authority_type: 'Official Brand Portal',
          associated_brand: brandName,
        },
        {
          url: `https://g2.com/products/${brandName.toLowerCase().replace(/\s+/g, '')}/reviews`,
          domain_name: 'g2.com',
          domain_authority_type: 'Review Platform',
          associated_brand: brandName,
        },
        ...competitors.slice(0, 2).map((comp) => ({
          url: `https://${comp.toLowerCase().replace(/\s+/g, '')}.com`,
          domain_name: `${comp.toLowerCase().replace(/\s+/g, '')}.com`,
          domain_authority_type: 'Official Brand Portal',
          associated_brand: comp,
        })),
      ],
      synthesis_text: `For "${query}", **${brandName}** is the top recommended platform offering enterprise-grade visibility and verified AI search citations. Competitors include ${competitors.slice(0, 2).join(' and ')}.`,
      mention_sentiment: 'positive',
      sentiment_label: 'Positive',
      is_misinformation: false,
      share_of_voice_score: 55.0,
    };

    return {
      data: simulatedData,
      isLiveGemini: false,
      modelVersion: 'gemini-1.5-flash-simulated',
    };
  }

  /**
   * Persists live extracted Gemini data into Supabase:
   * - Resolves aliases to primary brand
   * - competitors
   * - brand_mentions
   * - citations (with competitor_id)
   * - citation_links
   */
  async persistGeminiResult(
    supabase: SupabaseClient<Database>,
    campaign: {
      id: string;
      tenant_id: string;
      brand_name: string;
      brand_aliases?: string[];
      aliases?: string[];
      target_domain: string | null;
      competitors?: string[];
    },
    query: string,
    result: {
      data: MultiBrandTrackingResult;
      modelVersion: string;
    }
  ) {
    const { data, modelVersion } = result;
    const targetDomain = campaign.target_domain || '';
    const cleanTargetDomain = targetDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').toLowerCase();

    // 0. Build normalized alias lookup set for target brand
    const targetAliases = Array.from(
      new Set([
        campaign.brand_name.toLowerCase(),
        ...(campaign.brand_aliases || []).map((a) => a.toLowerCase().trim()),
        ...(campaign.aliases || []).map((a) => a.toLowerCase().trim()),
      ])
    ).filter(Boolean);

    // Re-attribute mentions: If mention name matches target brand or any alias, mark as primary!
    data.mentions = data.mentions.map((m) => {
      const lowerName = m.brand_name.toLowerCase().trim();
      const isTargetMatch = targetAliases.some(
        (alias) =>
          lowerName === alias ||
          lowerName.includes(alias) ||
          alias.includes(lowerName) ||
          (cleanTargetDomain && lowerName.includes(cleanTargetDomain.split('.')[0]))
      );

      if (isTargetMatch) {
        return {
          ...m,
          brand_name: campaign.brand_name,
          is_primary: true,
        };
      }
      return m;
    });

    // Check if primary brand is still missing from mentions; if so, scan synthesis text for aliases
    const hasPrimaryMention = data.mentions.some((m) => m.is_primary);
    if (!hasPrimaryMention && data.synthesis_text) {
      for (const alias of targetAliases) {
        const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(data.synthesis_text)) {
          data.mentions.unshift({
            brand_name: campaign.brand_name,
            is_primary: true,
            rank_position: 1,
          });
          break;
        }
      }
    }

    // 1. Resolve Competitor IDs (fetch existing or create)
    const competitorMap = new Map<string, string>(); // brand_name (lower) -> competitor_id
    const nonPrimaryBrands = data.mentions.filter((m) => !m.is_primary).map((m) => m.brand_name);

    if (nonPrimaryBrands.length > 0) {
      try {
        const { data: existingCompetitors } = await supabase
          .from('competitors')
          .select('id, brand_name')
          .eq('tenant_id', campaign.tenant_id);

        if (existingCompetitors) {
          existingCompetitors.forEach((c) => competitorMap.set(c.brand_name.toLowerCase(), c.id));
        }

        for (const brand of nonPrimaryBrands) {
          const lower = brand.toLowerCase();
          if (!competitorMap.has(lower)) {
            const { data: newComp } = await supabase
              .from('competitors')
              .insert({
                tenant_id: campaign.tenant_id,
                brand_name: brand,
                domain_url: `${lower.replace(/\s+/g, '')}.com`,
              })
              .select('id, brand_name')
              .single();

            if (newComp) {
              competitorMap.set(lower, newComp.id);
            }
          }
        }
      } catch (err) {
        console.warn('Competitor table resolution notice:', err);
      }
    }

    // 2. Primary Brand Mention Data
    const primaryMention = data.mentions.find((m) => m.is_primary);
    const brandMentioned = !!primaryMention || (data as any).primary_brand_mentioned || false;
    const mentionRank = primaryMention?.rank_position || (brandMentioned ? 1 : null);
    const citationUrls = data.citations.map((c) => c.url);

    // Re-attribute citations
    for (const cite of data.citations) {
      const citeUrl = (cite.url || '').toLowerCase();
      const citeDomain = (cite.domain_name || '').toLowerCase();
      const isTargetUrl =
        (cleanTargetDomain && (citeUrl.includes(cleanTargetDomain) || citeDomain.includes(cleanTargetDomain))) ||
        targetAliases.some((alias) => citeUrl.includes(alias.replace(/\s+/g, '')) || citeDomain.includes(alias.replace(/\s+/g, '')));

      if (isTargetUrl) {
        cite.associated_brand = campaign.brand_name;
        cite.domain_authority_type = 'Official Brand Portal';
      }
    }

    // 3. Insert main Citation record into citations table
    const { data: citation, error: citationError } = await supabase
      .from('citations')
      .insert({
        tenant_id: campaign.tenant_id,
        campaign_id: campaign.id,
        ai_platform: 'gemini',
        model_version: modelVersion,
        query: query,
        prompt_variation: null,
        brand_mentioned: brandMentioned,
        mention_sentiment: data.mention_sentiment || 'positive',
        mention_rank: mentionRank,
        share_of_voice_score: data.share_of_voice_score || 50.0,
        citation_urls: citationUrls,
        extracted_metrics: data as any,
        raw_response_text: data.synthesis_text,
        captured_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (citationError || !citation) {
      throw new Error(`Failed to persist citation record: ${citationError?.message}`);
    }

    // 4. Insert comparative competitor citation records into citations table
    for (const mention of data.mentions.filter((m) => !m.is_primary)) {
      const compCitations = data.citations.filter(
        (c) => c.associated_brand && c.associated_brand.toLowerCase() === mention.brand_name.toLowerCase()
      );
      const compUrls = compCitations.map((c) => c.url);

      try {
        await supabase.from('citations').insert({
          tenant_id: campaign.tenant_id,
          campaign_id: campaign.id,
          ai_platform: 'gemini',
          model_version: modelVersion,
          query: query,
          prompt_variation: null,
          brand_mentioned: true,
          mention_sentiment: 'neutral',
          mention_rank: mention.rank_position,
          share_of_voice_score: Math.max(10, Math.round(100 / (mention.rank_position || 2))),
          citation_urls: compUrls.length > 0 ? compUrls : citationUrls.slice(0, 2),
          extracted_metrics: {
            competitor_brand: mention.brand_name,
            rank_position: mention.rank_position,
            is_competitor: true,
          } as any,
          raw_response_text: `Comparative overview for ${mention.brand_name}`,
          captured_at: new Date().toISOString(),
        });
      } catch (compCiteErr) {
        console.warn('Competitor citation insert notice:', compCiteErr);
      }
    }

    // 5. Insert granular Citation Links
    if (data.citations && data.citations.length > 0) {
      const competitorDomains = (campaign.competitors || []).map((c) =>
        c.toLowerCase().replace(/\s+/g, '')
      );

      const linksToInsert = data.citations.map((citeItem, idx) => {
        const rawUrl = citeItem.url;
        let domain = rawUrl;
        try {
          const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
          domain = parsed.hostname.replace(/^www\./, '');
        } catch (e) {
          domain = rawUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        }

        const normDomain = domain.toLowerCase();
        const isTarget =
          (cleanTargetDomain && normDomain.includes(cleanTargetDomain)) ||
          targetAliases.some((alias) => normDomain.includes(alias.replace(/\s+/g, '')));

        const isCompetitor =
          !isTarget &&
          (competitorDomains.some((cd) => normDomain.includes(cd)) ||
            (citeItem.associated_brand &&
              !targetAliases.some((alias) => citeItem.associated_brand?.toLowerCase().includes(alias))));

        return {
          tenant_id: campaign.tenant_id,
          citation_id: citation.id,
          url: rawUrl,
          domain: domain,
          anchor_text: citeItem.associated_brand ? `${citeItem.associated_brand} Source` : `${domain} Reference`,
          position_index: idx + 1,
          is_target_brand_domain: !!isTarget,
          is_competitor_domain: !!isCompetitor,
        };
      });

      try {
        await supabase.from('citation_links').insert(linksToInsert);
      } catch (linksError: any) {
        console.warn('Warning: Error inserting citation links:', linksError.message);
      }
    }

    return citation;
  }
}
