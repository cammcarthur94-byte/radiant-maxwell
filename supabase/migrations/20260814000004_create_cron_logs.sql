-- ==============================================================================
-- CRON LOGS TABLE FOR AUTOMATED CITATION TRACKING HEALTH MONITORING
-- ==============================================================================

-- 1. TABLE: Cron Logs
CREATE TABLE IF NOT EXISTS public.cron_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL DEFAULT 'track-citations',
    status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'partial', 'running')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    processed_campaigns INTEGER NOT NULL DEFAULT 0,
    processed_queries INTEGER NOT NULL DEFAULT 0,
    successful_queries INTEGER NOT NULL DEFAULT 0,
    failed_queries INTEGER NOT NULL DEFAULT 0,
    engine TEXT NOT NULL DEFAULT 'gemini',
    error_message TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for fast status filtering and timeline lookups
CREATE INDEX IF NOT EXISTS idx_cron_logs_status ON public.cron_logs (status);
CREATE INDEX IF NOT EXISTS idx_cron_logs_started_at ON public.cron_logs (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_logs_job_name ON public.cron_logs (job_name);

-- 3. Row Level Security (RLS)
ALTER TABLE public.cron_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view cron logs for health dashboard
CREATE POLICY "Authenticated users can view cron logs"
    ON public.cron_logs FOR SELECT
    TO authenticated
    USING (true);

-- Allow service role full access
CREATE POLICY "Service role has full access to cron logs"
    ON public.cron_logs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
