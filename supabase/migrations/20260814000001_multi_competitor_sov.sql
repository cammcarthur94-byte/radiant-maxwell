-- ==============================================================================
-- MULTI-COMPETITOR TRACKING & SHARE OF VOICE (SoV) SCHEMA MIGRATION
-- ==============================================================================

-- 1. TABLE: Competitors
CREATE TABLE IF NOT EXISTS public.competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    domain_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes on competitors
CREATE INDEX IF NOT EXISTS idx_competitors_tenant ON public.competitors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_competitors_brand ON public.competitors(tenant_id, brand_name);

-- 2. TABLE: Brand Mentions
CREATE TABLE IF NOT EXISTS public.brand_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    competitor_id UUID REFERENCES public.competitors(id) ON DELETE SET NULL,
    brand_name TEXT NOT NULL,
    is_primary_brand BOOLEAN NOT NULL DEFAULT false,
    rank_position INTEGER NOT NULL DEFAULT 1,
    ai_model TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes on brand_mentions
CREATE INDEX IF NOT EXISTS idx_brand_mentions_tenant ON public.brand_mentions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_brand_mentions_campaign ON public.brand_mentions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_brand_mentions_competitor ON public.brand_mentions(competitor_id);
CREATE INDEX IF NOT EXISTS idx_brand_mentions_created_at ON public.brand_mentions(created_at DESC);

-- 3. Update Citations Table
ALTER TABLE public.citations 
ADD COLUMN IF NOT EXISTS competitor_id UUID REFERENCES public.competitors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_citations_competitor ON public.citations(competitor_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_mentions ENABLE ROW LEVEL SECURITY;

-- Competitors Policies
CREATE POLICY "Users can view competitors in their tenant"
    ON public.competitors FOR SELECT
    USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Users can manage competitors in their tenant"
    ON public.competitors FOR ALL
    USING (public.is_tenant_member(tenant_id))
    WITH CHECK (public.is_tenant_member(tenant_id));

-- Brand Mentions Policies
CREATE POLICY "Users can view brand mentions in their tenant"
    ON public.brand_mentions FOR SELECT
    USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Users can manage brand mentions in their tenant"
    ON public.brand_mentions FOR ALL
    USING (public.is_tenant_member(tenant_id))
    WITH CHECK (public.is_tenant_member(tenant_id));
