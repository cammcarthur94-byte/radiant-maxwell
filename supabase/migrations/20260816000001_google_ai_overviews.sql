-- ==============================================================================
-- Migration: 20260816000001_google_ai_overviews.sql
-- Description: Extends citations schema with Google AI Overviews tracking fields:
--              ai_overview_present, is_cited, and ai_overview_data JSONB payload.
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'citations' AND column_name = 'ai_overview_present'
    ) THEN
        ALTER TABLE public.citations ADD COLUMN ai_overview_present BOOLEAN NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'citations' AND column_name = 'is_cited'
    ) THEN
        ALTER TABLE public.citations ADD COLUMN is_cited BOOLEAN NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'citations' AND column_name = 'ai_overview_data'
    ) THEN
        ALTER TABLE public.citations ADD COLUMN ai_overview_data JSONB NOT NULL DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Create performance indexes for AI Overview lookups
CREATE INDEX IF NOT EXISTS idx_citations_ai_overview_present ON public.citations (ai_overview_present);
CREATE INDEX IF NOT EXISTS idx_citations_is_cited ON public.citations (is_cited);
