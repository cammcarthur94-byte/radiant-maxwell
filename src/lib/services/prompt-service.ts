import { createAdminClient } from '@/lib/supabase/admin';
import type { Database } from '@/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface PromptTemplateRecord {
  id?: string;
  prompt_key: string;
  prompt_text: string;
  model_target: string;
  description: string | null;
  category: string;
  is_active: boolean;
  updated_at?: string;
  created_at?: string;
}

export interface PromptVariables {
  query?: string;
  brandName?: string;
  brandDomain?: string;
  brandAliases?: string[] | string;
  aliases?: string[] | string;
  competitors?: string[] | string;
  [key: string]: any;
}

/**
 * Built-in Core Safe Fallback Prompts
 * Ensures the tracking pipeline and optimization services NEVER fail even if the database is unreachable.
 */
export const DEFAULT_PROMPT_TEMPLATES: Record<string, PromptTemplateRecord> = {
  gemini_citation_extraction: {
    prompt_key: 'gemini_citation_extraction',
    prompt_text: `You are an AI Search Overview engine evaluating conversational AI visibility.
Analyze the following search query from the perspective of an enterprise or consumer buyer seeking recommendations:

Search Query: "{{query}}"
Primary Target Brand: "{{brandName}}" (Domain: {{brandDomain}}{{#if brandAliases}}, Brand Aliases/Products: {{brandAliases}}{{/if}})
Tracked Competitors: {{competitors}}

Provide a comprehensive, authoritative AI Overview answering the query. Include citations to authoritative domains, reviews, and official portals.
Then analyze the generated response and extract a list of ALL brands mentioned in the response (including competitors and primary brand or its aliases) with their rank positions and citations with associated brands.
If any variant alias or product of "{{brandName}}" ({{brandAliases}}) is mentioned, attribute it as the primary brand.
Return the result strictly conforming to the JSON schema.`,
    model_target: 'gemini-1.5-flash',
    description: 'Core AI Overview analysis and multi-brand citation extraction prompt used in the live tracking loop.',
    category: 'extraction',
    is_active: true,
  },
  gemini_prompt_optimizer_system: {
    prompt_key: 'gemini_prompt_optimizer_system',
    prompt_text: `You are an elite Generative Engine Optimization (GEO) & Answer Engine Optimization (AEO) Prompt Engineer.
Your task is to analyze user search queries and rewrite them into maximum-impact prompts that cause conversational AI engines (ChatGPT, Google Gemini, Perplexity, Copilot) to generate rich comparative summaries, citation lists, and authoritative brand overviews.`,
    model_target: 'gemini-1.5-flash',
    description: 'System instruction for AI prompt optimizer service that refines search queries into high-intent conversational prompts.',
    category: 'optimization',
    is_active: true,
  },
  gemini_recommendation_audit: {
    prompt_key: 'gemini_recommendation_audit',
    prompt_text: `You are a search quality and generative engine optimization evaluator.
Evaluate the market positioning and citation authority for "{{brandName}}" on the topic "{{query}}".
Identify key competitor brands from {{competitors}}, analyze citation grounding domains, and provide prescriptive recommendations for closing visibility gaps.`,
    model_target: 'gemini-1.5-flash',
    description: 'Generative engine recommendation audit and competitive gap analysis prompt.',
    category: 'recommendations',
    is_active: true,
  },
};

interface CacheEntry {
  prompt: PromptTemplateRecord;
  cachedAt: number;
}

export class PromptService {
  private static instance: PromptService;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes in-memory cache

  public static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }

  /**
   * Renders a template string by replacing Handlebars/Mustache style placeholders and conditional blocks.
   */
  public renderTemplate(template: string, variables: PromptVariables = {}): string {
    let output = template;

    // 1. Process conditional blocks: {{#if variable}}...{{/if}}
    output = output.replace(/\{\{#if\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
      const val = variables[key];
      const hasValue = Array.isArray(val) ? val.length > 0 : !!val;
      if (hasValue) {
        // Render any nested variables inside the conditional block
        return this.renderSimpleVariables(content, variables);
      }
      return '';
    });

    // 2. Process variable placeholders: {{variable}}
    output = this.renderSimpleVariables(output, variables);

    return output;
  }

  private renderSimpleVariables(template: string, variables: PromptVariables): string {
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
      if (key in variables) {
        const val = variables[key];
        if (Array.isArray(val)) {
          return val.filter(Boolean).join(', ');
        }
        if (val === null || val === undefined) {
          return '';
        }
        return String(val);
      }
      return match;
    });
  }

  /**
   * Dynamically fetches a prompt template from database cache or fallback, and interpolates variables.
   */
  public async getPrompt(
    promptKey: string,
    variables?: PromptVariables,
    supabaseClient?: SupabaseClient<Database>
  ): Promise<string> {
    const templateRecord = await this.getPromptRecord(promptKey, supabaseClient);
    if (!variables) {
      return templateRecord.prompt_text;
    }
    return this.renderTemplate(templateRecord.prompt_text, variables);
  }

  /**
   * Retrieves the raw prompt template record with caching and fallback.
   */
  public async getPromptRecord(
    promptKey: string,
    supabaseClient?: SupabaseClient<Database>
  ): Promise<PromptTemplateRecord> {
    const cached = this.cache.get(promptKey);
    const now = Date.now();

    if (cached && now - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached.prompt;
    }

    try {
      const supabase = supabaseClient || createAdminClient();
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('prompt_key', promptKey)
        .eq('is_active', true)
        .maybeSingle();

      if (!error && data) {
        const record: PromptTemplateRecord = {
          id: data.id,
          prompt_key: data.prompt_key,
          prompt_text: data.prompt_text,
          model_target: data.model_target,
          description: data.description,
          category: data.category,
          is_active: data.is_active,
          updated_at: data.updated_at,
          created_at: data.created_at,
        };
        this.cache.set(promptKey, { prompt: record, cachedAt: now });
        return record;
      }
    } catch (err) {
      console.warn(`[PromptService] Error fetching prompt '${promptKey}' from database:`, err);
    }

    // Fallback to default safe template
    const fallback = DEFAULT_PROMPT_TEMPLATES[promptKey] || {
      prompt_key: promptKey,
      prompt_text: `You are an AI assistant analyzing {{query}} for {{brandName}}.`,
      model_target: 'gemini-1.5-flash',
      description: 'Auto-generated fallback template',
      category: 'general',
      is_active: true,
    };

    this.cache.set(promptKey, { prompt: fallback, cachedAt: now });
    return fallback;
  }

  /**
   * Fetches all managed prompts from the database (or default seeds if table is empty).
   */
  public async getAllPrompts(supabaseClient?: SupabaseClient<Database>): Promise<PromptTemplateRecord[]> {
    try {
      const supabase = supabaseClient || createAdminClient();
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .order('category', { ascending: true })
        .order('prompt_key', { ascending: true });

      if (!error && data && data.length > 0) {
        const list: PromptTemplateRecord[] = data.map((d) => ({
          id: d.id,
          prompt_key: d.prompt_key,
          prompt_text: d.prompt_text,
          model_target: d.model_target,
          description: d.description,
          category: d.category,
          is_active: d.is_active,
          updated_at: d.updated_at,
          created_at: d.created_at,
        }));

        // Populate in-memory cache
        const now = Date.now();
        list.forEach((p) => this.cache.set(p.prompt_key, { prompt: p, cachedAt: now }));
        return list;
      }
    } catch (err) {
      console.warn('[PromptService] Error fetching all prompts from database:', err);
    }

    // Fallback: return default templates
    return Object.values(DEFAULT_PROMPT_TEMPLATES);
  }

  /**
   * Upserts / updates a prompt in the database and immediately updates the in-memory cache.
   */
  public async updatePrompt(
    promptKey: string,
    updates: Partial<Omit<PromptTemplateRecord, 'id' | 'prompt_key'>>,
    supabaseClient?: SupabaseClient<Database>
  ): Promise<PromptTemplateRecord> {
    const existing = await this.getPromptRecord(promptKey, supabaseClient);
    const updatedRecord: PromptTemplateRecord = {
      ...existing,
      ...updates,
      prompt_key: promptKey,
      updated_at: new Date().toISOString(),
    };

    try {
      const supabase = supabaseClient || createAdminClient();
      const { data, error } = await supabase
        .from('prompts')
        .upsert(
          {
            prompt_key: promptKey,
            prompt_text: updatedRecord.prompt_text,
            model_target: updatedRecord.model_target,
            description: updatedRecord.description,
            category: updatedRecord.category,
            is_active: updatedRecord.is_active,
            updated_at: updatedRecord.updated_at,
          },
          { onConflict: 'prompt_key' }
        )
        .select()
        .single();

      if (!error && data) {
        updatedRecord.id = data.id;
      }
    } catch (err) {
      console.warn(`[PromptService] Error persisting prompt '${promptKey}' update to database:`, err);
    }

    // Instantly invalidate/update in-memory cache
    this.cache.set(promptKey, { prompt: updatedRecord, cachedAt: Date.now() });
    return updatedRecord;
  }

  /**
   * Clears the in-memory cache.
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

export const promptService = PromptService.getInstance();
