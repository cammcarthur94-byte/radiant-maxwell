-- Migration: 20260814000006_citations_sentiment_and_source_attribution.sql
-- Description: Expand citations table with domain attribution, raw AI response, user prompt, sentiment label, and misinformation flag.

ALTER TABLE public.citations
    ADD COLUMN IF NOT EXISTS domain_name TEXT,
    ADD COLUMN IF NOT EXISTS domain_authority_type TEXT DEFAULT 'General Publisher',
    ADD COLUMN IF NOT EXISTS raw_ai_response TEXT,
    ADD COLUMN IF NOT EXISTS user_prompt TEXT,
    ADD COLUMN IF NOT EXISTS sentiment_label TEXT CHECK (sentiment_label IN ('Positive', 'Neutral', 'Negative', 'Inaccurate')) DEFAULT 'Positive',
    ADD COLUMN IF NOT EXISTS is_misinformation BOOLEAN NOT NULL DEFAULT false;

-- Backfill legacy records if raw_response_text and query exist
UPDATE public.citations
SET 
    user_prompt = COALESCE(user_prompt, query),
    raw_ai_response = COALESCE(raw_ai_response, raw_response_text),
    domain_name = COALESCE(domain_name, (
        SELECT domain FROM public.citation_links 
        WHERE citation_links.citation_id = citations.id 
        LIMIT 1
    )),
    sentiment_label = CASE 
        WHEN mention_sentiment = 'positive' THEN 'Positive'
        WHEN mention_sentiment = 'negative' THEN 'Negative'
        WHEN mention_sentiment = 'mixed' THEN 'Neutral'
        ELSE 'Positive'
    END
WHERE user_prompt IS NULL OR raw_ai_response IS NULL OR sentiment_label IS NULL;

-- Indexes for lightning-fast domain attribution leaderboards and sentiment filtering
CREATE INDEX IF NOT EXISTS idx_citations_domain_name ON public.citations (tenant_id, domain_name);
CREATE INDEX IF NOT EXISTS idx_citations_sentiment_label ON public.citations (tenant_id, sentiment_label);
CREATE INDEX IF NOT EXISTS idx_citations_is_misinformation ON public.citations (tenant_id, is_misinformation);
