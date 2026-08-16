import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CronLoggerService } from '@/lib/services/cron-logger';
import { globalMultiEngineWorker, TrackingTask } from '@/lib/services/multi-engine-tracking-worker';
import { EngineId } from '@/lib/services/engines/engine-types';
import type { Database } from '@/types/database';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Vercel 5 min maximum execution limit for background serverless jobs

/**
 * Vercel Serverless Automated Cron Handler - Multi-Engine Weekly Tracking Schedule
 *
 * Schedule: 0 0 * * 0 (Every Sunday at 00:00 UTC)
 * Configured in: vercel.json
 *
 * Engines Covered:
 * - Google Gemini (Gemini 1.5 Flash with Search Grounding)
 * - Perplexity AI (Sonar Search Grounded)
 * - OpenAI (ChatGPT / GPT-4o with Search Ranking)
 * - Anthropic (Claude 3.5 Sonnet Deep Analysis)
 * - Microsoft Copilot (Bing Search Grounding)
 * - Meta AI (Llama 3 Conversational Extraction)
 *
 * Execution:
 * - Uses createAdminClient() with Supabase / Supavisor connection pooling.
 * - Concurrency-limited asynchronous queue worker (max 4 concurrent requests).
 * - Exponential backoff retry with jitter on API rate limits.
 * - Logs all execution outcomes and metrics to the CronLogs table.
 */
export async function GET(req: NextRequest) {
  return handleCronTracking(req);
}

export async function POST(req: NextRequest) {
  return handleCronTracking(req);
}

async function handleCronTracking(req: NextRequest) {
  const startedAt = Date.now();
  let logId = '';
  let supabase: ReturnType<typeof createAdminClient> | null = null;

  try {
    // 1. Verify Vercel CRON_SECRET Security
    const authHeader = req.headers.get('authorization');
    const xCronSecret = req.headers.get('x-cron-secret');
    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get('secret') || searchParams.get('cronSecret');
    const dryRun = searchParams.get('dryRun') === 'true';
    const requestedEngine = searchParams.get('engine') as EngineId | null;

    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && expectedSecret.trim().length > 0 && !expectedSecret.includes('[SENSITIVE]')) {
      const isValidBearer = authHeader === `Bearer ${expectedSecret}`;
      const isValidHeader = xCronSecret === expectedSecret;
      const isValidQuery = querySecret === expectedSecret;

      if (!isValidBearer && !isValidHeader && !isValidQuery) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized: Missing or invalid CRON_SECRET verification header.',
            hint: 'Vercel Cron automatically includes Authorization: Bearer <CRON_SECRET>. For manual triggers, provide ?secret=<CRON_SECRET> or Authorization header.',
          },
          { status: 401 }
        );
      }
    }

    // 2. Initialize Service Role Supabase Client with Supavisor Connection Pooling
    supabase = createAdminClient();

    // Determine target engines (default: full multi-engine suite)
    const targetEngines: EngineId[] = requestedEngine
      ? [requestedEngine]
      : ['gemini', 'perplexity', 'chatgpt', 'claude', 'copilot', 'meta'];

    // 3. Start Cron Execution Log
    const logInfo = await CronLoggerService.startCronRun(supabase, {
      jobName: 'track-citations',
      engine: targetEngines.join(', '),
    });
    logId = logInfo.logId;

    // 4. Fetch active campaigns across all tenants with multi-tenant isolation
    const { data: rawCampaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('is_active', true);

    if (campaignsError) {
      throw new Error(`Database error fetching active campaigns: ${campaignsError.message}`);
    }

    type CampaignRow = Database['public']['Tables']['campaigns']['Row'];
    const campaigns: CampaignRow[] = (rawCampaigns as CampaignRow[]) || [];

    if (campaigns.length === 0) {
      const completion = await CronLoggerService.completeCronRun(supabase, {
        logId,
        startedAt,
        jobName: 'track-citations',
        processedCampaigns: 0,
        processedQueries: 0,
        successfulQueries: 0,
        failedQueries: 0,
        engine: targetEngines.join(', '),
        details: { message: 'No active campaigns configured for tracking.' },
      });

      return NextResponse.json({
        success: true,
        message: 'No active tracking campaigns found.',
        processedCampaigns: 0,
        processedQueries: 0,
        log: completion,
      });
    }

    // 5. Build queue of tracking tasks across active campaigns and target engines
    const tasks: TrackingTask[] = [];

    for (const campaign of campaigns) {
      const queries = campaign.target_queries && campaign.target_queries.length > 0
        ? campaign.target_queries
        : [`best solutions for ${campaign.brand_name}`];

      for (const query of queries) {
        for (const engineId of targetEngines) {
          tasks.push({ campaign, query, engineId });
        }
      }
    }

    // 6. Execute Batch via Resilient Multi-Engine Queue Worker
    const batchResult = await globalMultiEngineWorker.executeBatch(
      supabase,
      tasks,
      {
        concurrency: 4,
        maxRetries: 3,
        dryRun,
      }
    );

    // 7. Complete and log cron run to CronLogs table
    const completedLog = await CronLoggerService.completeCronRun(supabase, {
      logId,
      startedAt,
      jobName: 'track-citations',
      processedCampaigns: campaigns.length,
      processedQueries: tasks.length,
      successfulQueries: batchResult.successful,
      failedQueries: batchResult.failed,
      engine: targetEngines.join(', '),
      details: {
        dryRun,
        totalTasks: tasks.length,
        skipped: batchResult.skipped,
        targetEngines,
        summary: batchResult.results.slice(0, 15),
      },
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      schedule: '0 0 * * 0 (Weekly Sunday at 00:00 UTC)',
      engines: targetEngines,
      pooling: 'Supavisor (port 6543 / pooled)',
      processedCampaigns: campaigns.length,
      processedQueries: tasks.length,
      successfulQueries: batchResult.successful,
      failedQueries: batchResult.failed,
      skippedQueries: batchResult.skipped,
      durationMs: completedLog.duration_ms,
      cronLog: completedLog,
      results: batchResult.results,
    });
  } catch (err: any) {
    console.error('Unhandled failure in citation tracking cron:', err);

    if (supabase) {
      try {
        await CronLoggerService.failCronRun(supabase, {
          logId: logId || `cron_fail_${Date.now()}`,
          startedAt,
          jobName: 'track-citations',
          errorMessage: err?.message || 'Unknown cron tracking error',
          engine: 'multi-engine-suite',
        });
      } catch (logErr) {
        console.error('Failed to write failure cron log:', logErr);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Internal serverless cron execution failure',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
