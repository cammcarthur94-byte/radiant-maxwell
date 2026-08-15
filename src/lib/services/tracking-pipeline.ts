import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, AIPlatform } from '@/types/database';
import { AIODataExtractor } from '@/extractor/aio_extractor';
import type { BrandTargetConfig, RawAISearchResponse } from '@/extractor/types';
import { CitationService } from './citation-service';

export interface TrackingJobContext {
  supabase: SupabaseClient<Database>;
  campaignId: string;
  tenantId: string;
}

export class TrackingPipeline {
  private extractor: AIODataExtractor;

  constructor() {
    this.extractor = new AIODataExtractor();
  }

  /**
   * Runs extraction on an AI search response and commits the results to Supabase
   */
  async processAndPersist(
    supabase: SupabaseClient<Database>,
    campaign: {
      id: string;
      tenant_id: string;
      brand_name: string;
      brand_aliases: string[];
      target_domain: string | null;
      competitors: string[];
    },
    rawResponse: RawAISearchResponse
  ) {
    const brandConfig: BrandTargetConfig = {
      tenant_id: campaign.tenant_id,
      brand_id: campaign.id,
      name: campaign.brand_name,
      aliases: campaign.brand_aliases,
      primary_domain: campaign.target_domain || '',
      competitors: campaign.competitors.map((compName) => ({
        name: compName,
        aliases: [compName],
        primary_domain: `${compName.toLowerCase().replace(/\s+/g, '')}.com`,
      })),
    };

    // 1. Run NLP and AIO extraction logic
    const extractedMetrics = this.extractor.extract(rawResponse, brandConfig);

    // 2. Map engine name to database platform enum
    const engineMap: Record<string, AIPlatform> = {
      chatgpt: 'chatgpt',
      perplexity: 'perplexity',
      gemini_aio: 'gemini',
      copilot: 'copilot',
    };
    const platform: AIPlatform = engineMap[rawResponse.engine] || 'chatgpt';

    // 3. Persist to Supabase using CitationService
    const citationService = new CitationService(supabase);
    const savedCitation = await citationService.saveCitationExtraction({
      tenantId: campaign.tenant_id,
      campaignId: campaign.id,
      aiPlatform: platform,
      modelVersion: `${rawResponse.engine}-standard`,
      query: rawResponse.query,
      promptVariation: rawResponse.prompt_variation_id,
      metrics: extractedMetrics,
      rawResponseText: rawResponse.raw_text,
    });

    return {
      citationId: savedCitation.id,
      extractedMetrics,
    };
  }
}
