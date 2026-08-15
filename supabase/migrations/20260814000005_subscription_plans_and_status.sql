-- ==============================================================================
-- MULTI-TENANT SUBSCRIPTION PLAN & STATUS SYNC MIGRATION
-- ==============================================================================

-- 1. Ensure subscription_status column exists
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'active';

-- 2. Ensure plan_type column exists
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'starter';

-- 3. Ensure subscription_tier column exists for backwards compatibility
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'starter';

-- 4. Update check constraints to allow starter, growth, enterprise, agency
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_tenants_subscription_tier'
    ) THEN
        ALTER TABLE public.tenants DROP CONSTRAINT check_tenants_subscription_tier;
    END IF;

    ALTER TABLE public.tenants
    ADD CONSTRAINT check_tenants_subscription_tier
    CHECK (subscription_tier IN ('starter', 'growth', 'enterprise', 'agency'));
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_tenants_plan_type'
    ) THEN
        ALTER TABLE public.tenants
        ADD CONSTRAINT check_tenants_plan_type
        CHECK (plan_type IN ('starter', 'growth', 'enterprise', 'agency'));
    END IF;
END $$;

-- 5. Indexes for fast subscription lookups
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON public.tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenants_plan_type ON public.tenants(plan_type);
