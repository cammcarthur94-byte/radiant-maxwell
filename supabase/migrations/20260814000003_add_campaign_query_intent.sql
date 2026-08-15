-- ==============================================================================
-- QUERY INTENT CLASSIFICATION SCHEMA MIGRATION
-- ==============================================================================

-- 1. Create Query Intent Enum Type if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'query_intent_type') THEN
        CREATE TYPE public.query_intent_type AS ENUM ('Brand', 'Product', 'Competitor');
    END IF;
END $$;

-- 2. Add query_intent column to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS query_intent public.query_intent_type NOT NULL DEFAULT 'Brand';

-- 3. Add index for query intent filtering
CREATE INDEX IF NOT EXISTS idx_campaigns_query_intent ON public.campaigns(tenant_id, query_intent);
