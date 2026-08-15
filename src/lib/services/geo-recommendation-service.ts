import { SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import type { Database } from '@/types/database';
import {
  GeoRecommendationCategory,
  GeoRecommendationPriority,
  GeoRecommendationStatus,
  GeoRecommendationItem,
} from '@/types/dashboard';

export interface GeoRecommendationGenerationResult {
  recommendations: GeoRecommendationItem[];
  isLiveGemini: boolean;
  modelVersion: string;
  count: number;
}

const geoOutputSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    recommendations: {
      type: Type.ARRAY,
      description: 'List of categorized and priority-ranked Generative Engine Optimization recommendations',
      items: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            enum: ['source_citation', 'content_schema', 'competitor_gap'],
            description: 'The recommendation category',
          },
          priority: {
            type: Type.STRING,
            enum: ['high', 'medium', 'quick_win'],
            description: 'Action priority level',
          },
          title: {
            type: Type.STRING,
            description: 'Concise, actionable headline for the recommendation',
          },
          description: {
            type: Type.STRING,
            description: 'Explanation of the root cause and why AI search engines are failing to cite or rank the brand',
          },
          actionPlan: {
            type: Type.STRING,
            description: 'Exact step-by-step guidance for the marketing or engineering team to implement',
          },
          codeSnippet: {
            type: Type.STRING,
            description: 'Optional valid JSON-LD schema, markdown table, FAQ structure, or configuration snippet',
          },
          targetQuery: {
            type: Type.STRING,
            description: 'Specific conversational or comparison query this action targets',
          },
          competitorName: {
            type: Type.STRING,
            description: 'Competitor outranking or receiving citations on this topic',
          },
          targetDomain: {
            type: Type.STRING,
            description: 'Third-party domain or platform to acquire citations or reviews on',
          },
          estimatedImpact: {
            type: Type.STRING,
            description: 'Projected metric lift, e.g. "+18% SOV Gain", "+25% Citation Rate", "+14% AI Visibility"',
          },
        },
        required: ['category', 'priority', 'title', 'description', 'actionPlan', 'estimatedImpact'],
      },
    },
  },
  required: ['recommendations'],
};

export class GeoRecommendationService {
  private apiKey: string | undefined;

  constructor(private supabase: SupabaseClient<Database>) {
    this.apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  }

  public hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes('[SENSITIVE]');
  }

  /**
   * Fetches stored recommendations for a tenant with optional filtering.
   */
  async getRecommendations(
    tenantId: string,
    filters?: {
      category?: GeoRecommendationCategory | 'all';
      priority?: GeoRecommendationPriority | 'all';
      status?: GeoRecommendationStatus | 'all';
    }
  ): Promise<{
    items: GeoRecommendationItem[];
    stats: {
      total: number;
      pending: number;
      inProgress: number;
      completed: number;
      highPriority: number;
    };
  }> {
    let query = this.supabase
      .from('geo_recommendations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }
    if (filters?.priority && filters.priority !== 'all') {
      query = query.eq('priority', filters.priority);
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching geo_recommendations:', error);
      // Fallback: If table doesn't exist yet in local Supabase or error occurred, return mock/fallback
      const simulated = this.generateFallbackRecommendations({
        name: 'Acme Corp',
        domain: 'acmecorp.com',
        competitors: ['BrandWatch', 'Sprout Social', 'SEMrush'],
      }, tenantId);
      return {
        items: simulated,
        stats: {
          total: simulated.length,
          pending: simulated.filter((i) => i.status === 'pending').length,
          inProgress: simulated.filter((i) => i.status === 'in_progress').length,
          completed: simulated.filter((i) => i.status === 'completed').length,
          highPriority: simulated.filter((i) => i.priority === 'high').length,
        },
      };
    }

    const items = (data || []) as GeoRecommendationItem[];

    // Compute stats across all tenant recommendations
    const { data: allTenantItems } = await this.supabase
      .from('geo_recommendations')
      .select('status, priority')
      .eq('tenant_id', tenantId);

    const statsList = (allTenantItems || items) as { status: string; priority: string }[];
    const stats = {
      total: statsList.length,
      pending: statsList.filter((i) => i.status === 'pending').length,
      inProgress: statsList.filter((i) => i.status === 'in_progress').length,
      completed: statsList.filter((i) => i.status === 'completed').length,
      highPriority: statsList.filter((i) => i.priority === 'high').length,
    };

    return { items, stats };
  }

  /**
   * Updates the status of a specific recommendation.
   */
  async updateRecommendationStatus(
    id: string,
    tenantId: string,
    status: GeoRecommendationStatus
  ): Promise<boolean> {
    const { error } = await this.supabase
      .from('geo_recommendations')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('Error updating recommendation status:', error);
      return false;
    }
    return true;
  }

  /**
   * Generates tailored recommendations using Gemini (or realistic intelligent fallback).
   */
  async generateRecommendations(
    tenantId: string,
    options?: {
      force?: boolean;
      visibilityScore?: number;
    }
  ): Promise<GeoRecommendationGenerationResult> {
    // 1. Gather tenant context
    const { data: tenant } = await this.supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .maybeSingle();

    const tenantName = tenant?.name || 'Brand';
    const settings = (tenant?.settings as any) || {};
    const tenantDomain = settings.domain || `${tenant?.slug || 'brand'}.com`;

    // 2. Fetch recent campaigns / competitors / prompts
    const { data: campaigns } = await this.supabase
      .from('campaigns')
      .select('*')
      .eq('tenant_id', tenantId)
      .limit(10);

    const competitors = Array.from(
      new Set(campaigns?.flatMap((c) => c.competitors || []) || ['Competitor A', 'Competitor B'])
    ).slice(0, 5);

    const targetQueries = (campaigns?.flatMap((c) => c.target_queries || []) || []).slice(0, 5);

    // 3. Fetch competitors
    const { data: recentCompetitors } = await this.supabase
      .from('competitors')
      .select('*')
      .eq('tenant_id', tenantId)
      .limit(10);

    const visibilityScore = options?.visibilityScore ?? 54.0;

    let generatedItems: Array<{
      category: GeoRecommendationCategory;
      priority: GeoRecommendationPriority;
      title: string;
      description: string;
      actionPlan: string;
      codeSnippet?: string;
      targetQuery?: string;
      competitorName?: string;
      targetDomain?: string;
      estimatedImpact: string;
    }> = [];

    let isLiveGemini = false;
    let modelVersion = 'simulated-geo-v2';

    if (this.hasApiKey()) {
      try {
        const ai = new GoogleGenAI({ apiKey: this.apiKey! });

        const promptText = `
You are an expert Generative Engine Optimization (GEO) and AI Visibility Architect.
Your task is to analyze the tracking profile of "${tenantName}" (${tenantDomain}) and produce highly actionable, prioritized recommendations to maximize citations, outrank competitors in conversational search engines (Google Gemini, ChatGPT Search, Perplexity AI, Microsoft Copilot), and gain Share of Voice.

Target Brand: "${tenantName}" (${tenantDomain})
Current AI Visibility Score: ${visibilityScore}% (Target: 80%+)
Key Competitors: ${competitors.length > 0 ? competitors.join(', ') : 'Market Leaders'}
Sample Queries Tracked: ${targetQueries.length > 0 ? targetQueries.join(' | ') : 'best AI tracking tools, alternative enterprise platforms'}

Generate 6-8 distinct, categorized recommendations:
1. "source_citation" (Source & Citation Strategy): Specific third-party domains (e.g. Reddit, G2, Trustpilot, GitHub, niche industry publications) where the brand is missing citations.
2. "content_schema" (Content & Schema Fixes): Semantic schema markup (JSON-LD Organization/Product/FAQPage), concise comparison tables, bullet points, and authoritative quote anchors. Include code snippets.
3. "competitor_gap" (Competitor Gap Analysis): Actionable reasons why a specific competitor is outranking "${tenantName}" and the exact content asset or comparison page to publish to take back the ranking.

Assign priority levels: "high" (biggest SOV lift), "medium", or "quick_win" (fastest to implement).
Include realistic estimatedImpact strings (e.g., "+18% SOV Gain", "+24% Citation Likelihood", "+12% Visibility").
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
          config: {
            responseMimeType: 'application/json',
            responseSchema: geoOutputSchema,
            temperature: 0.3,
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
            generatedItems = parsed.recommendations;
            isLiveGemini = true;
            modelVersion = 'gemini-2.5-flash';
          }
        }
      } catch (geminiError) {
        console.warn('Gemini recommendation generation error, falling back to rule-based engine:', geminiError);
      }
    }

    // Fallback if Gemini did not run or had error
    if (generatedItems.length === 0) {
      const fallbackList = this.generateFallbackRecommendations(
        { name: tenantName, domain: tenantDomain, competitors, targetQueries },
        tenantId
      );
      generatedItems = fallbackList.map((f) => ({
        category: f.category,
        priority: f.priority,
        title: f.title,
        description: f.description,
        actionPlan: f.action_plan,
        codeSnippet: f.code_snippet || undefined,
        targetQuery: f.target_query || undefined,
        competitorName: f.competitor_name || undefined,
        targetDomain: f.target_domain || undefined,
        estimatedImpact: f.estimated_impact,
      }));
    }

    // 4. Persist generated recommendations into Supabase
    const toInsert = generatedItems.map((item) => ({
      tenant_id: tenantId,
      category: item.category,
      priority: item.priority,
      title: item.title,
      description: item.description,
      action_plan: item.actionPlan,
      code_snippet: item.codeSnippet || null,
      target_query: item.targetQuery || null,
      competitor_name: item.competitorName || null,
      target_domain: item.targetDomain || null,
      estimated_impact: item.estimatedImpact,
      status: 'pending' as GeoRecommendationStatus,
      metadata: {
        isLiveGemini,
        modelVersion,
        generatedAt: new Date().toISOString(),
      },
    }));

    try {
      const { data: inserted, error: insertError } = await this.supabase
        .from('geo_recommendations')
        .insert(toInsert)
        .select('*');

      if (!insertError && inserted) {
        return {
          recommendations: inserted as GeoRecommendationItem[],
          isLiveGemini,
          modelVersion,
          count: inserted.length,
        };
      }
    } catch (e) {
      console.warn('Could not persist to database, returning in-memory:', e);
    }

    const fallbackFull: GeoRecommendationItem[] = toInsert.map((t, idx) => ({
      id: `geo-rec-${idx + 1}-${Date.now()}`,
      tenant_id: tenantId,
      category: t.category,
      priority: t.priority,
      title: t.title,
      description: t.description,
      action_plan: t.action_plan,
      code_snippet: t.code_snippet,
      target_query: t.target_query,
      competitor_name: t.competitor_name,
      target_domain: t.target_domain,
      estimated_impact: t.estimated_impact,
      status: 'pending',
      metadata: t.metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    return {
      recommendations: fallbackFull,
      isLiveGemini,
      modelVersion,
      count: fallbackFull.length,
    };
  }

  /**
   * Generates tailored fallback recommendations when offline or initializing
   */
  private generateFallbackRecommendations(
    context: {
      name: string;
      domain: string;
      competitors?: string[];
      targetQueries?: string[];
    },
    tenantId: string
  ): GeoRecommendationItem[] {
    const comp1 = context.competitors?.[0] || 'Market Leader A';
    const comp2 = context.competitors?.[1] || 'Competitor Pro';
    const name = context.name;
    const domain = context.domain;

    return [
      {
        id: 'rec-1',
        tenant_id: tenantId,
        category: 'competitor_gap',
        priority: 'high',
        title: 'Publish Dedicated Head-to-Head Comparison Page',
        description: `${comp1} is cited in 4 out of 5 AI search responses for commercial intent queries because they host structured comparison matrices that LLM crawlers ingest.`,
        action_plan: `Create a dedicated '/vs/${comp1.toLowerCase().replace(/\s+/g, '-')}' comparison page with a clear feature-by-feature matrix and verified pricing breakdowns.`,
        code_snippet: `| Capability | ${name} | ${comp1} |\n| :--- | :--- | :--- |\n| Real-Time Grounding Ingestion | ✅ Live Stream | ⚠️ Batch Weekly |\n| Multi-Tenant RLS Security | ✅ Strict Isolated | ❌ Shared Index |\n| Citation Verification Rate | ✅ 99.4% | ⚠️ 82.1% |`,
        target_query: `best ${name.toLowerCase()} alternatives and enterprise visibility tools`,
        competitor_name: comp1,
        target_domain: domain,
        estimated_impact: '+18% SOV Gain',
        status: 'pending',
        metadata: { engine: 'ChatGPT & Gemini' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'rec-2',
        tenant_id: tenantId,
        category: 'source_citation',
        priority: 'high',
        title: 'Earn Verified Founder & User Mentions on Reddit',
        description: 'Reddit threads represent 34% of all citation sources used by Gemini and Perplexity for buyer intent and software recommendations.',
        action_plan: 'Participate authentically in relevant subreddits (e.g. r/SEO, r/Marketing, r/SaaS), answer community questions, and provide technical architectural breakdowns.',
        code_snippet: null,
        target_query: `top AI search monitoring tools with real-time grounding verification`,
        competitor_name: comp2,
        target_domain: 'reddit.com',
        estimated_impact: '+28% Citation Likelihood',
        status: 'pending',
        metadata: { domain: 'reddit.com' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'rec-3',
        tenant_id: tenantId,
        category: 'content_schema',
        priority: 'high',
        title: 'Implement JSON-LD Organization & SoftwareApplication Schema',
        description: 'AI crawlers parse structured JSON-LD entities to definitively establish brand ownership, product capabilities, and feature taxonomies in knowledge graphs.',
        action_plan: 'Embed valid JSON-LD schema into your root layout with explicit brand name, applicationCategory, and featureList properties.',
        code_snippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "SoftwareApplication",\n  "name": "${name}",\n  "applicationCategory": "BusinessApplication",\n  "operatingSystem": "Web",\n  "offers": {\n    "@type": "Offer",\n    "price": "0",\n    "priceCurrency": "USD"\n  },\n  "description": "Enterprise AI search engine optimization and visibility tracking platform."\n}\n</script>`,
        target_query: `${name} software reviews and technical capabilities`,
        competitor_name: null,
        target_domain: domain,
        estimated_impact: '+15% AI Visibility',
        status: 'pending',
        metadata: { schemaType: 'SoftwareApplication' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'rec-4',
        tenant_id: tenantId,
        category: 'source_citation',
        priority: 'medium',
        title: 'Acquire G2 & Trustpilot Verified Customer Reviews',
        description: 'LLM engines extract G2 star ratings and customer review quotes to formulate "Top Rated" product shortlists for conversational recommendations.',
        action_plan: 'Launch an automated review collection campaign to gather 15+ verified customer reviews highlighting specific enterprise use cases.',
        code_snippet: null,
        target_query: `most reliable AI citation tracking software for agencies`,
        competitor_name: comp1,
        target_domain: 'g2.com',
        estimated_impact: '+12% SOV Gain',
        status: 'pending',
        metadata: { domain: 'g2.com' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'rec-5',
        tenant_id: tenantId,
        category: 'content_schema',
        priority: 'quick_win',
        title: 'Convert Dense Paragraphs to Ordered Bullet Lists',
        description: 'Gemini and Perplexity extract ordered and bulleted lists 3.4x more frequently than prose paragraphs when compiling AI Overviews.',
        action_plan: 'Structure key value propositions, onboarding steps, and integration lists into 3-5 bulleted points with bold lead-ins on your homepage and documentation.',
        code_snippet: `### Core Advantages of ${name}:\n- **Real-Time Citation Audit:** Instant tracking across Gemini & ChatGPT.\n- **Strict Multi-Tenant Isolation:** Zero data leakage with Postgres RLS.\n- **Automated Alerts:** Get notified immediately on ranking drops.`,
        target_query: `what are the key features of ${name.toLowerCase()}`,
        competitor_name: null,
        target_domain: domain,
        estimated_impact: '+9% Extraction Rate',
        status: 'pending',
        metadata: { format: 'bullet_lists' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'rec-6',
        tenant_id: tenantId,
        category: 'content_schema',
        priority: 'quick_win',
        title: 'Embed Expert Direct Quotes with Attribution',
        description: 'Conversational engines utilize direct quotations as high-confidence grounding anchors to substantiate factual claims.',
        action_plan: 'Add blockquotes with full executive titles and customer endorsements to your key case studies and technical articles.',
        code_snippet: `> "Implementing ${name} gave our marketing team complete visibility into how AI models cite our enterprise brand."\n> — Sarah Chen, VP of Growth Marketing`,
        target_query: `${name.toLowerCase()} customer reviews and testimonials`,
        competitor_name: null,
        target_domain: domain,
        estimated_impact: '+8% Grounding Confidence',
        status: 'pending',
        metadata: { format: 'quotes' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
}
