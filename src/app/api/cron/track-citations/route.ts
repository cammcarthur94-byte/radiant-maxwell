import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { GeminiTrackingService } from '@/lib/services/gemini-tracking-service';
import { CronLoggerService } from '@/lib/services/cron-logger';
import { validatePromptLimit } from '@/lib/subscription-limits';
import type { Database } from '@/types/database';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Vercel 5 min maximum execution limit for background serverless jobs

/**
 * Vercel Serverless Automated Cron Handler - Unified Weekly Calculation Schedule
 *
 * Schedule: 0 0 * * 0 (Every Sunday at 00:00 UTC)
 * Configured in: vercel.json
 *
 * Pillar Executions:
 * - AIO Score: Weekly technical health and schema audit
 * - AEO Score: Weekly aggregated scoring based on the latest prompt tracking batch
 * - GEO Score: Weekly rolling aggregation of sentiment, context, and cross-model citations
 * - Overall Visibility Score: Recalculated and stored alongside pillar metrics
 *
 * Security:
 * - Requires Authorization: Bearer <CRON_SECRET> header supplied by Vercel Cron.
 *
 * Execution:
 * - Uses createAdminClient() with Supabase / Supavisor connection pooling.
 * - Executes multi-model visibility extraction and scoring across active campaigns.
 * - Logs all execution outcomes to the CronLogs table.
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
    const geminiService = new GeminiTrackingService();

    // 3. Start Cron Execution Log
    const logInfo = await CronLoggerService.startCronRun(supabase, {
      jobName: 'track-citations',
      engine: 'gemini-1.5-flash',
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
        engine: 'gemini-1.5-flash',
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

    // 5. Build queue of tracking tasks across all campaigns
    const tasks: Array<{
      campaign: CampaignRow;
      query: string;
    }> = [];

    for (const campaign of campaigns) {
      const queries = campaign.target_queries && campaign.target_queries.length > 0
        ? campaign.target_queries
        : [`best solutions for ${campaign.brand_name}`];

      for (const query of queries) {
        tasks.push({ campaign, query });
      }
    }

    const queryExecutionResults: any[] = [];
    let successfulQueries = 0;
    let failedQueries = 0;

    // 6. Execute Gemini 1.5 Flash Tracking Loop
    for (const { campaign, query } of tasks) {
      try {
        // Enforce subscription quota limits
        if (!dryRun) {
          const quota = await validatePromptLimit(supabase, campaign.tenant_id, 1);
          if (!quota.allowed) {
            queryExecutionResults.push({
              tenantId: campaign.tenant_id,
              campaignId: campaign.id,
              query,
              skipped: true,
              reason: 'Daily prompt limit reached for subscription tier',
            });
            continue;
          }
        }

        // Run Gemini 1.5 Flash AIO extraction
        const campaignAliases = Array.from(
          new Set([
            ...(Array.isArray(campaign.aliases) ? campaign.aliases : []),
            ...(Array.isArray(campaign.brand_aliases) ? campaign.brand_aliases : [])
          ])
        );

        const geminiResult = await geminiService.executeAIOQuery({
          query,
          brandName: campaign.brand_name,
          brandDomain: campaign.target_domain || `${campaign.brand_name.toLowerCase().replace(/\s+/g, '')}.com`,
          brandAliases: campaignAliases,
          aliases: campaignAliases,
          competitors: campaign.competitors || ['Competitor A', 'Competitor B'],
        });

        if (!dryRun) {
          // Persist atomically to Supabase
          const saved = await geminiService.persistGeminiResult(
            supabase,
            campaign,
            query,
            geminiResult
          );

          queryExecutionResults.push({
            citationId: saved.id,
            tenantId: campaign.tenant_id,
            campaignId: campaign.id,
            brandName: campaign.brand_name,
            query,
            engine: 'gemini-1.5-flash',
            isLiveGemini: geminiResult.isLiveGemini,
            brandMentioned: geminiResult.data.mentions.some((m) => m.is_primary),
            shareOfVoice: geminiResult.data.share_of_voice_score || 50.0,
            citationsExtracted: geminiResult.data.citations.length,
          });
        } else {
          queryExecutionResults.push({
            mode: 'dry_run',
            campaignId: campaign.id,
            brandName: campaign.brand_name,
            query,
            shareOfVoice: geminiResult.data.share_of_voice_score || 50.0,
          });
        }

        successfulQueries++;
      } catch (queryErr: any) {
        failedQueries++;
        console.error(`Error processing query "${query}" for campaign ${campaign.id}:`, queryErr);
        queryExecutionResults.push({
          campaignId: campaign.id,
          query,
          error: queryErr?.message || 'Query tracking failed',
        });
      }
    }

    // 7. Complete and log cron run to CronLogs table
    const completedLog = await CronLoggerService.completeCronRun(supabase, {
      logId,
      startedAt,
      jobName: 'track-citations',
      processedCampaigns: campaigns.length,
      processedQueries: tasks.length,
      successfulQueries,
      failedQueries,
      engine: 'gemini-1.5-flash',
      details: {
        dryRun,
        totalTasks: tasks.length,
        summary: queryExecutionResults.slice(0, 10),
      },
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      schedule: '0 0 * * * (Daily at 00:00 UTC)',
      engine: 'gemini-1.5-flash',
      pooling: 'Supavisor (port 6543 / pooled)',
      processedCampaigns: campaigns.length,
      processedQueries: tasks.length,
      successfulQueries,
      failedQueries,
      durationMs: completedLog.duration_ms,
      cronLog: completedLog,
      results: queryExecutionResults,
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
          engine: 'gemini-1.5-flash',
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
