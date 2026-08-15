-- Migration: 20260814000007_brand_aliases_management.sql
-- Description: Add aliases array column to campaigns and tenants tables with GIN indexing and bidirectional backfilling.

-- 1. Add aliases column to campaigns if not exists
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS aliases TEXT[] NOT NULL DEFAULT '{}'::text[];

-- 2. Add aliases column to tenants if not exists
ALTER TABLE public.tenants
    ADD COLUMN IF NOT EXISTS aliases TEXT[] NOT NULL DEFAULT '{}'::text[];

-- 3. Backfill campaigns.aliases from campaigns.brand_aliases if brand_aliases exists
UPDATE public.campaigns
SET aliases = brand_aliases
WHERE (aliases IS NULL OR cardinality(aliases) = 0)
  AND (brand_aliases IS NOT NULL AND cardinality(brand_aliases) > 0);

-- Backfill campaigns.brand_aliases from campaigns.aliases if brand_aliases is empty
UPDATE public.campaigns
SET brand_aliases = aliases
WHERE (brand_aliases IS NULL OR cardinality(brand_aliases) = 0)
  AND (aliases IS NOT NULL AND cardinality(aliases) > 0);

-- 4. Create GIN index on aliases for rapid array containment operations
CREATE INDEX IF NOT EXISTS idx_campaigns_aliases ON public.campaigns USING GIN(aliases);
CREATE INDEX IF NOT EXISTS idx_tenants_aliases ON public.tenants USING GIN(aliases);
