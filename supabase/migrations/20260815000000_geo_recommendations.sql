-- ==============================================================================
-- Migration: 20260815000000_geo_recommendations.sql
-- Table: geo_recommendations
-- Purpose: Store AI-driven Generative Engine Optimization (GEO) actionable tips
--          with priority ranking, impact estimates, status tracking, and strict
--          multi-tenant isolation.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.geo_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('source_citation', 'content_schema', 'competitor_gap')),
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'quick_win')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    action_plan TEXT NOT NULL,
    code_snippet TEXT,
    target_query TEXT,
    competitor_name TEXT,
    target_domain TEXT,
    estimated_impact TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'dismissed')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for efficient querying by tenant, status, priority, and category
CREATE INDEX IF NOT EXISTS idx_geo_rec_tenant_status ON public.geo_recommendations(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_geo_rec_tenant_priority ON public.geo_recommendations(tenant_id, priority);
CREATE INDEX IF NOT EXISTS idx_geo_rec_tenant_category ON public.geo_recommendations(tenant_id, category);
CREATE INDEX IF NOT EXISTS idx_geo_rec_created_at ON public.geo_recommendations(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.geo_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view and manage recommendations for tenants they belong to
CREATE POLICY "Users can view geo_recommendations for their tenants"
    ON public.geo_recommendations
    FOR SELECT
    USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Users can insert geo_recommendations for their tenants"
    ON public.geo_recommendations
    FOR INSERT
    WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "Users can update geo_recommendations for their tenants"
    ON public.geo_recommendations
    FOR UPDATE
    USING (public.is_tenant_member(tenant_id))
    WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "Users can delete geo_recommendations for their tenants"
    ON public.geo_recommendations
    FOR DELETE
    USING (public.is_tenant_member(tenant_id));
