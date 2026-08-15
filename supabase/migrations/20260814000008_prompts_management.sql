-- ============================================================================
-- Migration: 20260814000008_prompts_management.sql
-- Description: Creates the `prompts` table for dynamic AI prompt template
--              management and seeds core Gemini extraction & analysis prompts.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_key VARCHAR(100) UNIQUE NOT NULL,
  prompt_text TEXT NOT NULL,
  model_target VARCHAR(100) NOT NULL DEFAULT 'gemini-1.5-flash',
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'extraction',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by prompt_key and active status
CREATE INDEX IF NOT EXISTS idx_prompts_key ON public.prompts(prompt_key);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON public.prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_active ON public.prompts(is_active);

-- Enable RLS
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active prompts
CREATE POLICY "Allow public read access to active prompts"
  ON public.prompts
  FOR SELECT
  USING (is_active = true);

-- Allow service role full access
CREATE POLICY "Allow service role full access on prompts"
  ON public.prompts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed Core Prompts
INSERT INTO public.prompts (prompt_key, prompt_text, model_target, description, category, is_active)
VALUES
  (
    'gemini_citation_extraction',
    'You are an AI Search Overview engine evaluating conversational AI visibility.
Analyze the following search query from the perspective of an enterprise or consumer buyer seeking recommendations:

Search Query: "{{query}}"
Primary Target Brand: "{{brandName}}" (Domain: {{brandDomain}}{{#if brandAliases}}, Brand Aliases/Products: {{brandAliases}}{{/if}})
Tracked Competitors: {{competitors}}

Provide a comprehensive, authoritative AI Overview answering the query. Include citations to authoritative domains, reviews, and official portals.
Then analyze the generated response and extract a list of ALL brands mentioned in the response (including competitors and primary brand or its aliases) with their rank positions and citations with associated brands.
If any variant alias or product of "{{brandName}}" ({{brandAliases}}) is mentioned, attribute it as the primary brand.
Return the result strictly conforming to the JSON schema.',
    'gemini-1.5-flash',
    'Core AI Overview analysis and multi-brand citation extraction prompt used in the live tracking loop.',
    'extraction',
    true
  ),
  (
    'gemini_prompt_optimizer_system',
    'You are an elite Generative Engine Optimization (GEO) & Answer Engine Optimization (AEO) Prompt Engineer.
Your task is to analyze user search queries and rewrite them into maximum-impact prompts that cause conversational AI engines (ChatGPT, Google Gemini, Perplexity, Copilot) to generate rich comparative summaries, citation lists, and authoritative brand overviews.',
    'gemini-1.5-flash',
    'System instruction for AI prompt optimizer service that refines search queries into high-intent conversational prompts.',
    'optimization',
    true
  ),
  (
    'gemini_recommendation_audit',
    'You are a search quality and generative engine optimization evaluator.
Evaluate the market positioning and citation authority for "{{brandName}}" on the topic "{{query}}".
Identify key competitor brands from {{competitors}}, analyze citation grounding domains, and provide prescriptive recommendations for closing visibility gaps.',
    'gemini-1.5-flash',
    'Generative engine recommendation audit and competitive gap analysis prompt.',
    'recommendations',
    true
  )
ON CONFLICT (prompt_key) DO UPDATE
SET
  prompt_text = EXCLUDED.prompt_text,
  model_target = EXCLUDED.model_target,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active,
  updated_at = now();
