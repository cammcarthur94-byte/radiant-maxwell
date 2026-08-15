export interface BrandTargetConfig {
  tenant_id: string;
  brand_id: string;
  name: string;
  aliases: string[];
  primary_domain: string;
  alternate_domains?: string[];
  competitors: Array<{
    name: string;
    aliases: string[];
    primary_domain: string;
  }>;
}

export type EngineType = 'chatgpt' | 'perplexity' | 'gemini_aio' | 'copilot';

export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface GroundingSource {
  title?: string;
  url: string;
  snippet?: string;
  source_id?: string | number;
}

export interface RawAISearchResponse {
  id: string;
  tenant_id: string;
  engine: EngineType;
  query: string;
  prompt_variation_id?: string;
  timestamp: string;
  raw_text: string;
  grounding_sources?: GroundingSource[];
  token_usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface CitationLink {
  index: number;
  anchor_text: string;
  url: string;
  domain: string;
  is_target_brand_domain: boolean;
  is_competitor_domain: boolean;
  associated_brand?: string;
  source_category: 'brand_direct' | 'review_platform' | 'tech_publication' | 'aggregator' | 'other';
  footnote_reference?: string;
}

export interface BrandMentionAnalysis {
  brand_name: string;
  is_target: boolean;
  is_competitor: boolean;
  mentioned: boolean;
  mention_count: number;
  matched_aliases: string[];
  recommendation_rank: number | null; // 1-indexed recommendation rank if in list/ranked structure
  sentiment: SentimentType;
  sentiment_score: number; // -1.0 to +1.0
  sentiment_signals: {
    positive_phrases: string[];
    negative_phrases: string[];
  };
  context_snippets: string[];
  key_attributes_cited: string[];
  has_direct_domain_citation: boolean;
}

export interface ShareOfVoiceMetrics {
  target_raw_mention_share_pct: number;
  target_weighted_visibility_score: number; // 0 - 100
  brand_visibility_breakdown: Record<string, {
    raw_mentions: number;
    rank: number | null;
    sentiment_score: number;
    citation_count: number;
    weighted_score: number;
    share_of_voice_pct: number;
  }>;
  industry_total_mentions: number;
  industry_total_citations: number;
}

export interface ExtractedAIOMetrics {
  extraction_id: string;
  tenant_id: string;
  query: string;
  engine: EngineType;
  timestamp: string;
  target_brand_presence: boolean;
  target_brand_analysis: BrandMentionAnalysis;
  competitor_analyses: BrandMentionAnalysis[];
  citations: CitationLink[];
  citation_summary: {
    total_citations: number;
    target_brand_citations: number;
    competitor_citations: number;
    third_party_review_citations: number;
  };
  share_of_voice: ShareOfVoiceMetrics;
  model_metadata: {
    engine: EngineType;
    query: string;
    char_length: number;
    word_count: number;
    estimated_tokens: number;
    has_structured_list: boolean;
    has_comparison_table: boolean;
    response_latency_ms?: number;
  };
}
