export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AIPlatform = 'chatgpt' | 'perplexity' | 'gemini' | 'copilot' | 'claude';
export type MentionSentiment = 'positive' | 'neutral' | 'negative' | 'mixed';
export type TenantRole = 'owner' | 'admin' | 'member' | 'viewer';

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          subscription_tier: 'starter' | 'growth' | 'agency';
          created_at: string;
          updated_at: string;
          settings: Json;
          aliases?: string[];
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          subscription_tier?: 'starter' | 'growth' | 'agency';
          created_at?: string;
          updated_at?: string;
          settings?: Json;
          aliases?: string[];
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          subscription_tier?: 'starter' | 'growth' | 'agency';
          created_at?: string;
          updated_at?: string;
          settings?: Json;
          aliases?: string[];
        };
        Relationships: [];
      };
      tenant_members: {
        Row: {
          id: string;
          tenant_id: string;
          user_id: string;
          role: TenantRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          user_id: string;
          role?: TenantRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          user_id?: string;
          role?: TenantRole;
          created_at?: string;
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          brand_name: string;
          brand_aliases: string[];
          aliases?: string[];
          target_domain: string | null;
          target_queries: string[];
          competitors: string[];
          tracking_frequency: string;
          query_intent: 'Brand' | 'Product' | 'Competitor' | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          brand_name: string;
          brand_aliases?: string[];
          aliases?: string[];
          target_domain?: string | null;
          target_queries?: string[];
          competitors?: string[];
          tracking_frequency?: string;
          query_intent?: 'Brand' | 'Product' | 'Competitor' | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          name?: string;
          brand_name?: string;
          brand_aliases?: string[];
          aliases?: string[];
          target_domain?: string | null;
          target_queries?: string[];
          competitors?: string[];
          tracking_frequency?: string;
          query_intent?: 'Brand' | 'Product' | 'Competitor' | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      competitors: {
        Row: {
          id: string;
          tenant_id: string;
          brand_name: string;
          domain_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          brand_name: string;
          domain_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          brand_name?: string;
          domain_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      brand_mentions: {
        Row: {
          id: string;
          tenant_id: string;
          campaign_id: string;
          competitor_id: string | null;
          brand_name: string;
          is_primary_brand: boolean;
          rank_position: number;
          ai_model: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          campaign_id: string;
          competitor_id?: string | null;
          brand_name: string;
          is_primary_brand?: boolean;
          rank_position?: number;
          ai_model: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          campaign_id?: string;
          competitor_id?: string | null;
          brand_name?: string;
          is_primary_brand?: boolean;
          rank_position?: number;
          ai_model?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      citations: {
        Row: {
          id: string;
          tenant_id: string;
          campaign_id: string;
          competitor_id: string | null;
          ai_platform: AIPlatform;
          model_version: string;
          query: string;
          user_prompt: string | null;
          domain_name: string | null;
          domain_authority_type: string | null;
          prompt_variation: string | null;
          brand_mentioned: boolean;
          mention_sentiment: MentionSentiment | null;
          sentiment_label: 'Positive' | 'Neutral' | 'Negative' | 'Inaccurate' | null;
          is_misinformation: boolean;
          mention_rank: number | null;
          share_of_voice_score: number;
          citation_urls: string[];
          extracted_metrics: Json;
          raw_response_text: string | null;
          raw_ai_response: string | null;
          captured_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          campaign_id: string;
          competitor_id?: string | null;
          ai_platform: AIPlatform;
          model_version: string;
          query: string;
          user_prompt?: string | null;
          domain_name?: string | null;
          domain_authority_type?: string | null;
          prompt_variation?: string | null;
          brand_mentioned?: boolean;
          mention_sentiment?: MentionSentiment | null;
          sentiment_label?: 'Positive' | 'Neutral' | 'Negative' | 'Inaccurate' | null;
          is_misinformation?: boolean;
          mention_rank?: number | null;
          share_of_voice_score?: number;
          citation_urls?: string[];
          extracted_metrics?: Json;
          raw_response_text?: string | null;
          raw_ai_response?: string | null;
          captured_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          campaign_id?: string;
          competitor_id?: string | null;
          ai_platform?: AIPlatform;
          model_version?: string;
          query?: string;
          user_prompt?: string | null;
          domain_name?: string | null;
          domain_authority_type?: string | null;
          prompt_variation?: string | null;
          brand_mentioned?: boolean;
          mention_sentiment?: MentionSentiment | null;
          sentiment_label?: 'Positive' | 'Neutral' | 'Negative' | 'Inaccurate' | null;
          is_misinformation?: boolean;
          mention_rank?: number | null;
          share_of_voice_score?: number;
          citation_urls?: string[];
          extracted_metrics?: Json;
          raw_response_text?: string | null;
          raw_ai_response?: string | null;
          captured_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      citation_links: {
        Row: {
          id: string;
          tenant_id: string;
          citation_id: string;
          url: string;
          domain: string;
          anchor_text: string | null;
          position_index: number;
          is_target_brand_domain: boolean;
          is_competitor_domain: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          citation_id: string;
          url: string;
          domain: string;
          anchor_text?: string | null;
          position_index: number;
          is_target_brand_domain?: boolean;
          is_competitor_domain?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          citation_id?: string;
          url?: string;
          domain?: string;
          anchor_text?: string | null;
          position_index?: number;
          is_target_brand_domain?: boolean;
          is_competitor_domain?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      cron_logs: {
        Row: {
          id: string;
          job_name: string;
          status: 'success' | 'failure' | 'partial' | 'running';
          started_at: string;
          completed_at: string | null;
          duration_ms: number | null;
          processed_campaigns: number;
          processed_queries: number;
          successful_queries: number;
          failed_queries: number;
          engine: string;
          error_message: string | null;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_name?: string;
          status: 'success' | 'failure' | 'partial' | 'running';
          started_at?: string;
          completed_at?: string | null;
          duration_ms?: number | null;
          processed_campaigns?: number;
          processed_queries?: number;
          successful_queries?: number;
          failed_queries?: number;
          engine?: string;
          error_message?: string | null;
          details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_name?: string;
          status?: 'success' | 'failure' | 'partial' | 'running';
          started_at?: string;
          completed_at?: string | null;
          duration_ms?: number | null;
          processed_campaigns?: number;
          processed_queries?: number;
          successful_queries?: number;
          failed_queries?: number;
          engine?: string;
          error_message?: string | null;
          details?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      prompts: {
        Row: {
          id: string;
          prompt_key: string;
          prompt_text: string;
          model_target: string;
          description: string | null;
          category: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prompt_key: string;
          prompt_text: string;
          model_target?: string;
          description?: string | null;
          category?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prompt_key?: string;
          prompt_text?: string;
          model_target?: string;
          description?: string | null;
          category?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      geo_recommendations: {
        Row: {
          id: string;
          tenant_id: string;
          category: 'source_citation' | 'content_schema' | 'competitor_gap';
          priority: 'high' | 'medium' | 'quick_win';
          title: string;
          description: string;
          action_plan: string;
          code_snippet: string | null;
          target_query: string | null;
          competitor_name: string | null;
          target_domain: string | null;
          estimated_impact: string;
          status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          category: 'source_citation' | 'content_schema' | 'competitor_gap';
          priority: 'high' | 'medium' | 'quick_win';
          title: string;
          description: string;
          action_plan: string;
          code_snippet?: string | null;
          target_query?: string | null;
          competitor_name?: string | null;
          target_domain?: string | null;
          estimated_impact: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'dismissed';
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tenant_id?: string;
          category?: 'source_citation' | 'content_schema' | 'competitor_gap';
          priority?: 'high' | 'medium' | 'quick_win';
          title?: string;
          description?: string;
          action_plan?: string;
          code_snippet?: string | null;
          target_query?: string | null;
          competitor_name?: string | null;
          target_domain?: string | null;
          estimated_impact?: string;
          status?: 'pending' | 'in_progress' | 'completed' | 'dismissed';
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_tenant_member: {
        Args: { lookup_tenant_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      ai_platform: AIPlatform;
      mention_sentiment: MentionSentiment;
      tenant_role: TenantRole;
      query_intent_type: 'Brand' | 'Product' | 'Competitor';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
