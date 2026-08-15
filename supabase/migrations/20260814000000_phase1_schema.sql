-- ==============================================================================
-- PHASE 1: STANDALONE CITATION TRACKER SCHEMA & MULTI-TENANT RLS POLICIES
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE: Tenants (Organizations / Accounts)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for tenant lookup by slug
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants (slug);

-- ==============================================================================
-- 3. TABLE: Tenant Members (Auth Users -> Tenants Mapping)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tenant_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, user_id)
);

-- Indexes for membership lookups
CREATE INDEX IF NOT EXISTS idx_tenant_members_user_id ON public.tenant_members (user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_id ON public.tenant_members (tenant_id);

-- ==============================================================================
-- 4. TABLE: Campaigns (Target AIO Queries & Tracking Targets)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    brand_aliases TEXT[] NOT NULL DEFAULT '{}'::text[],
    target_domain TEXT,
    target_queries TEXT[] NOT NULL DEFAULT '{}'::text[],
    competitors TEXT[] NOT NULL DEFAULT '{}'::text[],
    tracking_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (tracking_frequency IN ('hourly', 'daily', 'weekly', 'manual')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for multi-tenant query filtering
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_id ON public.campaigns (tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON public.campaigns (is_active);

-- ==============================================================================
-- 5. TABLE: Citations (AI Model Runs, Mentions, SOV Scores & Timestamp Logs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    ai_platform TEXT NOT NULL CHECK (ai_platform IN ('chatgpt', 'perplexity', 'gemini', 'copilot', 'claude')),
    model_version TEXT NOT NULL,
    query TEXT NOT NULL,
    prompt_variation TEXT,
    brand_mentioned BOOLEAN NOT NULL DEFAULT false,
    mention_sentiment TEXT CHECK (mention_sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
    mention_rank INTEGER,
    share_of_voice_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    citation_urls TEXT[] NOT NULL DEFAULT '{}'::text[],
    extracted_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    raw_response_text TEXT,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for fast aggregate lookups and timeline analytics
CREATE INDEX IF NOT EXISTS idx_citations_tenant_id ON public.citations (tenant_id);
CREATE INDEX IF NOT EXISTS idx_citations_campaign_id ON public.citations (campaign_id);
CREATE INDEX IF NOT EXISTS idx_citations_captured_at ON public.citations (captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_citations_ai_platform ON public.citations (ai_platform);
CREATE INDEX IF NOT EXISTS idx_citations_brand_mentioned ON public.citations (brand_mentioned);

-- ==============================================================================
-- 6. TABLE: Citation Links (Dedicated AIO Citation Link Breakdown)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.citation_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    citation_id UUID NOT NULL REFERENCES public.citations(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    anchor_text TEXT,
    position_index INTEGER NOT NULL,
    is_target_brand_domain BOOLEAN NOT NULL DEFAULT false,
    is_competitor_domain BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for link graph & domain ranking
CREATE INDEX IF NOT EXISTS idx_citation_links_tenant_id ON public.citation_links (tenant_id);
CREATE INDEX IF NOT EXISTS idx_citation_links_citation_id ON public.citation_links (citation_id);
CREATE INDEX IF NOT EXISTS idx_citation_links_domain ON public.citation_links (domain);

-- ==============================================================================
-- 7. HELPER FUNCTION: Tenant Membership Check for RLS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_tenant_member(lookup_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_members
    WHERE tenant_members.tenant_id = lookup_tenant_id
      AND tenant_members.user_id = auth.uid()
  );
$$;

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citation_links ENABLE ROW LEVEL SECURITY;

-- 8.1. Tenants RLS Policies
CREATE POLICY "Users can view tenants they belong to"
  ON public.tenants FOR SELECT
  USING (public.is_tenant_member(id));

CREATE POLICY "Tenant owners/admins can update tenant details"
  ON public.tenants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members
      WHERE tenant_members.tenant_id = id
        AND tenant_members.user_id = auth.uid()
        AND tenant_members.role IN ('owner', 'admin')
    )
  );

-- 8.2. Tenant Members RLS Policies
CREATE POLICY "Users can view memberships for their tenants"
  ON public.tenant_members FOR SELECT
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Tenant owners/admins can manage memberships"
  ON public.tenant_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = tenant_members.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
    )
  );

-- 8.3. Campaigns RLS Policies
CREATE POLICY "Users can view campaigns belonging to their tenant"
  ON public.campaigns FOR SELECT
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Users can insert campaigns into their tenant"
  ON public.campaigns FOR INSERT
  WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "Users can update campaigns in their tenant"
  ON public.campaigns FOR UPDATE
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "Tenant admins/owners can delete campaigns in their tenant"
  ON public.campaigns FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members
      WHERE tenant_members.tenant_id = campaigns.tenant_id
        AND tenant_members.user_id = auth.uid()
        AND tenant_members.role IN ('owner', 'admin')
    )
  );

-- 8.4. Citations RLS Policies
CREATE POLICY "Users can view citations belonging to their tenant"
  ON public.citations FOR SELECT
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Users can insert citations for their tenant"
  ON public.citations FOR INSERT
  WITH CHECK (public.is_tenant_member(tenant_id));

CREATE POLICY "Tenant admins can delete citations in their tenant"
  ON public.citations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members
      WHERE tenant_members.tenant_id = citations.tenant_id
        AND tenant_members.user_id = auth.uid()
        AND tenant_members.role IN ('owner', 'admin')
    )
  );

-- 8.5. Citation Links RLS Policies
CREATE POLICY "Users can view citation links belonging to their tenant"
  ON public.citation_links FOR SELECT
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "Users can insert citation links for their tenant"
  ON public.citation_links FOR INSERT
  WITH CHECK (public.is_tenant_member(tenant_id));
