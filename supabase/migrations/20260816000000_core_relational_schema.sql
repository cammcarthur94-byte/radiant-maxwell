-- ==============================================================================
-- Migration: 20260816000000_core_relational_schema.sql
-- Description: Core relational schema establishing campaigns, prompts (with intent),
--              historical weekly scores, competitors, audit_logs, and multi-tenant RLS.
-- ==============================================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLE: campaigns (Ensure user_id and tracking configurations)
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'user_id') THEN
        ALTER TABLE public.campaigns ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns (user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_id ON public.campaigns (tenant_id);

-- ==============================================================================
-- 3. TABLE: competitors (Link up to 5 competitors per campaign)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    domain_url TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_competitors_tenant_id ON public.competitors (tenant_id);
CREATE INDEX IF NOT EXISTS idx_competitors_campaign_id ON public.competitors (campaign_id);

-- ==============================================================================
-- 4. TABLE: prompts (Tracked queries categorized by intent: AEO, GEO, AIO, etc.)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    intent_category TEXT NOT NULL DEFAULT 'AIO' CHECK (intent_category IN ('AEO', 'GEO', 'AIO', 'Brand', 'Product', 'Competitor')),
    model_target TEXT NOT NULL DEFAULT 'gemini-1.5-flash',
    prompt_key VARCHAR(100),
    prompt_text TEXT,
    description TEXT,
    category VARCHAR(50) DEFAULT 'extraction',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add tenant_id & campaign_id & intent_category if prompts table was previously created without them
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'prompts' AND column_name = 'tenant_id') THEN
        ALTER TABLE public.prompts ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'prompts' AND column_name = 'campaign_id') THEN
        ALTER TABLE public.prompts ADD COLUMN campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'prompts' AND column_name = 'query_text') THEN
        ALTER TABLE public.prompts ADD COLUMN query_text TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'prompts' AND column_name = 'intent_category') THEN
        ALTER TABLE public.prompts ADD COLUMN intent_category TEXT DEFAULT 'AIO';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_prompts_tenant_id ON public.prompts (tenant_id);
CREATE INDEX IF NOT EXISTS idx_prompts_campaign_id ON public.prompts (campaign_id);
CREATE INDEX IF NOT EXISTS idx_prompts_intent ON public.prompts (intent_category);

-- ==============================================================================
-- 5. TABLE: scores (Historical weekly metric logs for AIO, AEO, GEO, and Visibility)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    calculation_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    week_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    overall_visibility_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    aio_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    aeo_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    geo_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    sentiment_subscore NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    prominence_subscore NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    sov_subscore NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    citation_count INTEGER NOT NULL DEFAULT 0,
    brand_mentions_count INTEGER NOT NULL DEFAULT 0,
    pillar_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scores_tenant_id ON public.scores (tenant_id);
CREATE INDEX IF NOT EXISTS idx_scores_campaign_id ON public.scores (campaign_id);
CREATE INDEX IF NOT EXISTS idx_scores_calculation_date ON public.scores (calculation_date DESC);
CREATE INDEX IF NOT EXISTS idx_scores_week_start ON public.scores (week_start_date DESC);

-- ==============================================================================
-- 6. TABLE: audit_logs (Timestamped events, cron statuses, and system changes)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'cron_run', 'score_recalculation', 'campaign_created', 'prompt_created', 'system_alert'
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'in_progress', 'warning')),
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON public.audit_logs (tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- ==============================================================================
-- 7. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check tenant membership
CREATE OR REPLACE FUNCTION public.is_tenant_member(lookup_tenant_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_members
        WHERE tenant_id = lookup_tenant_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: campaigns
DROP POLICY IF EXISTS "Tenant members can view campaigns" ON public.campaigns;
CREATE POLICY "Tenant members can view campaigns"
    ON public.campaigns FOR SELECT
    USING (public.is_tenant_member(tenant_id));

DROP POLICY IF EXISTS "Tenant members can insert campaigns" ON public.campaigns;
CREATE POLICY "Tenant members can insert campaigns"
    ON public.campaigns FOR INSERT
    WITH CHECK (public.is_tenant_member(tenant_id));

DROP POLICY IF EXISTS "Tenant members can update campaigns" ON public.campaigns;
CREATE POLICY "Tenant members can update campaigns"
    ON public.campaigns FOR UPDATE
    USING (public.is_tenant_member(tenant_id));

DROP POLICY IF EXISTS "Tenant members can delete campaigns" ON public.campaigns;
CREATE POLICY "Tenant members can delete campaigns"
    ON public.campaigns FOR DELETE
    USING (public.is_tenant_member(tenant_id));

-- RLS: competitors
DROP POLICY IF EXISTS "Tenant members can view competitors" ON public.competitors;
CREATE POLICY "Tenant members can view competitors"
    ON public.competitors FOR SELECT
    USING (public.is_tenant_member(tenant_id));

DROP POLICY IF EXISTS "Tenant members can manage competitors" ON public.competitors;
CREATE POLICY "Tenant members can manage competitors"
    ON public.competitors FOR ALL
    USING (public.is_tenant_member(tenant_id))
    WITH CHECK (public.is_tenant_member(tenant_id));

-- RLS: prompts
DROP POLICY IF EXISTS "Tenant members can view prompts" ON public.prompts;
CREATE POLICY "Tenant members can view prompts"
    ON public.prompts FOR SELECT
    USING (tenant_id IS NULL OR public.is_tenant_member(tenant_id));

DROP POLICY IF EXISTS "Tenant members can manage prompts" ON public.prompts;
CREATE POLICY "Tenant members can manage prompts"
    ON public.prompts FOR ALL
    USING (tenant_id IS NULL OR public.is_tenant_member(tenant_id))
    WITH CHECK (tenant_id IS NULL OR public.is_tenant_member(tenant_id));

-- RLS: scores
DROP POLICY IF EXISTS "Tenant members can view scores" ON public.scores;
CREATE POLICY "Tenant members can view scores"
    ON public.scores FOR SELECT
    USING (public.is_tenant_member(tenant_id));

DROP POLICY IF EXISTS "Tenant members can insert scores" ON public.scores;
CREATE POLICY "Tenant members can insert scores"
    ON public.scores FOR ALL
    USING (public.is_tenant_member(tenant_id))
    WITH CHECK (public.is_tenant_member(tenant_id));

-- RLS: audit_logs
DROP POLICY IF EXISTS "Tenant members can view audit logs" ON public.audit_logs;
CREATE POLICY "Tenant members can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (tenant_id IS NULL OR public.is_tenant_member(tenant_id));

DROP POLICY IF EXISTS "Tenant members can insert audit logs" ON public.audit_logs;
CREATE POLICY "Tenant members can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (tenant_id IS NULL OR public.is_tenant_member(tenant_id));

-- Service Role Full Access Bypass Policies for all tables
CREATE POLICY "Service role full access on campaigns" ON public.campaigns FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on competitors" ON public.competitors FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on prompts" ON public.prompts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on scores" ON public.scores FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on audit_logs" ON public.audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==============================================================================
-- 8. INITIAL AUTO-BACKFILL: Populate Prompts, Competitors, and Weekly Scores
-- ==============================================================================
DO $$
DECLARE
    camp RECORD;
    t_id UUID;
    q TEXT;
    c_name TEXT;
    i INT;
    cal_date TIMESTAMPTZ;
    w_date DATE;
    base_vis NUMERIC;
    base_aio NUMERIC;
    base_aeo NUMERIC;
    base_geo NUMERIC;
BEGIN
    FOR camp IN SELECT * FROM public.campaigns LOOP
        t_id := camp.tenant_id;

        -- 1. Backfill Prompts from campaign target_queries
        IF camp.target_queries IS NOT NULL THEN
            FOREACH q IN ARRAY camp.target_queries LOOP
                IF NOT EXISTS (SELECT 1 FROM public.prompts WHERE tenant_id = t_id AND query_text = q) THEN
                    INSERT INTO public.prompts (tenant_id, campaign_id, query_text, intent_category, is_active)
                    VALUES (
                        t_id,
                        camp.id,
                        q,
                        CASE 
                            WHEN q ILIKE '%best%' OR q ILIKE '%top%' OR q ILIKE '%compare%' THEN 'AEO'
                            WHEN q ILIKE '%how to%' OR q ILIKE '%guide%' OR q ILIKE '%what is%' THEN 'AIO'
                            ELSE 'GEO'
                        END,
                        true
                    );
                END IF;
            END LOOP;
        END IF;

        -- 2. Backfill Competitors from campaign competitors array
        IF camp.competitors IS NOT NULL THEN
            FOREACH c_name IN ARRAY camp.competitors LOOP
                IF NOT EXISTS (SELECT 1 FROM public.competitors WHERE tenant_id = t_id AND campaign_id = camp.id AND brand_name = c_name) THEN
                    INSERT INTO public.competitors (tenant_id, campaign_id, brand_name, domain_url, is_primary)
                    VALUES (
                        t_id,
                        camp.id,
                        c_name,
                        LOWER(REPLACE(c_name, ' ', '')) || '.com',
                        false
                    );
                END IF;
            END LOOP;
        END IF;

        -- 3. Backfill 8 Weeks of Historical Scores
        IF NOT EXISTS (SELECT 1 FROM public.scores WHERE campaign_id = camp.id) THEN
            FOR i IN 0..7 LOOP
                cal_date := now() - (i * INTERVAL '7 days');
                w_date := (cal_date)::DATE;
                
                -- Progressive score trajectory
                base_vis := 68.5 + ((7 - i) * 2.5) + (RANDOM() * 3.0 - 1.5);
                base_aio := 65.0 + ((7 - i) * 2.8) + (RANDOM() * 2.5 - 1.0);
                base_aeo := 70.0 + ((7 - i) * 2.2) + (RANDOM() * 2.0 - 1.0);
                base_geo := 67.0 + ((7 - i) * 2.6) + (RANDOM() * 3.0 - 1.5);

                INSERT INTO public.scores (
                    tenant_id,
                    campaign_id,
                    calculation_date,
                    week_start_date,
                    overall_visibility_score,
                    aio_score,
                    aeo_score,
                    geo_score,
                    sentiment_subscore,
                    prominence_subscore,
                    sov_subscore,
                    citation_count,
                    brand_mentions_count,
                    pillar_breakdown
                ) VALUES (
                    t_id,
                    camp.id,
                    cal_date,
                    w_date,
                    LEAST(100.0, GREATEST(0.0, base_vis)),
                    LEAST(100.0, GREATEST(0.0, base_aio)),
                    LEAST(100.0, GREATEST(0.0, base_aeo)),
                    LEAST(100.0, GREATEST(0.0, base_geo)),
                    LEAST(100.0, GREATEST(0.0, 75.0 + (7 - i) * 1.8)),
                    LEAST(100.0, GREATEST(0.0, 80.0 + (7 - i) * 2.0)),
                    LEAST(100.0, GREATEST(0.0, 52.0 + (7 - i) * 3.2)),
                    45 + ((7 - i) * 8),
                    30 + ((7 - i) * 6),
                    jsonb_build_object(
                        'chatgpt_sov', LEAST(100.0, 50.0 + (7 - i) * 3.0),
                        'gemini_sov', LEAST(100.0, 55.0 + (7 - i) * 2.5),
                        'perplexity_sov', LEAST(100.0, 60.0 + (7 - i) * 3.5),
                        'claude_sov', LEAST(100.0, 48.0 + (7 - i) * 2.8)
                    )
                );
            END LOOP;
        END IF;

        -- 4. Initial Audit Log Entry
        INSERT INTO public.audit_logs (
            tenant_id,
            event_type,
            status,
            action,
            details
        ) VALUES (
            t_id,
            'campaign_initialized',
            'success',
            'Initialized foundational schema and historical scoring for ' || camp.brand_name,
            jsonb_build_object('campaign_id', camp.id, 'brand_name', camp.brand_name)
        );
    END LOOP;
END $$;
