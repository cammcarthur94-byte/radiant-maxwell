-- ==============================================================================
-- SUBSCRIPTION TIERS & PLAN LIMITS MIGRATION
-- ==============================================================================

-- 1. Add subscription_tier column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'starter';

-- Ensure check constraint for supported tiers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_tenants_subscription_tier'
    ) THEN
        ALTER TABLE public.tenants
        ADD CONSTRAINT check_tenants_subscription_tier
        CHECK (subscription_tier IN ('starter', 'growth', 'agency'));
    END IF;
END $$;

-- 2. Index for subscription tier lookup
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_tier ON public.tenants(subscription_tier);
