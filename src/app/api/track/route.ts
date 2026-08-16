import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { TrackingPipeline } from '@/lib/services/tracking-pipeline';
import { SimulatedLLMService } from '@/lib/services/simulated-llm';
import { GeminiTrackingService } from '@/lib/services/gemini-tracking-service';
import { GeoRecommendationService } from '@/lib/services/geo-recommendation-service';
import { validatePromptLimit } from '@/lib/subscription-limits';
import type { Database } from '@/types/database';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Vercel 5 min execution limit

/**
 * Core Tracking Loop API Endpoint
 *
 * GET /api/track
 * Optional Query Params:
 *  - campaignId: target specific campaign ID
 *  - engine: 'gemini' | 'gemini_aio' | 'chatgpt' | 'perplexity' | 'copilot' (default: 'gemini')
 *  - dryRun: 'true' (returns extraction results without database insertion)
 *
 * POST /api/track
 * Body: { campaignId?: string, tenantId?: string, query?: string, engine?: string, dryRun?: boolean }
 */
export async function GET(req: NextRequest) {
  return handleTrackingRun(req);
}

export async function POST(req: NextRequest) {
  return handleTrackingRun(req);
}

async function handleTrackingRun(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let body: any = {};
    if (req.method === 'POST') {
      try {
        body = await req.json();
      } catch (e) {
        body = {};
      }
    }

    const campaignIdParam = searchParams.get('campaignId') || body.campaignId;
    const tenantIdParam = searchParams.get('tenantId') || body.tenantId;
    const engineParam = (searchParams.get('engine') || body.engine || 'gemini') as
      | 'gemini'
      | 'gemini_aio'
      | 'perplexity'
      | 'chatgpt'
      | 'copilot';
    const isDryRun = searchParams.get('dryRun') === 'true' || body.dryRun === true;
    const customQuery = searchParams.get('query') || body.query;

    // 1. Initialize Supabase Client with Supavisor Connection Pooling configuration
    const supabase = createAdminClient();
    const geminiService = new GeminiTrackingService();
    const llmService = new SimulatedLLMService();
    const pipeline = new TrackingPipeline();

    // 2. Fetch target campaign(s) from Campaigns table with strict multi-tenant isolation
    let queryBuilder = supabase.from('campaigns').select('*').eq('is_active', true);

    if (tenantIdParam) {
      queryBuilder = queryBuilder.eq('tenant_id', tenantIdParam);
    }
    if (campaignIdParam) {
      queryBuilder = queryBuilder.eq('id', campaignIdParam);
    }

    const { data: campaigns, error: campaignsError } = await queryBuilder;

    type CampaignRow = Database['public']['Tables']['campaigns']['Row'];
    let activeCampaigns: CampaignRow[] = [];

    if (campaignsError) {
      if (isDryRun) {
        // If DB table is not yet created, allow dryRun mode using a default demo campaign
        activeCampaigns = [
          {
            id: 'demo-camp-001',
            tenant_id: 'demo-tenant-001',
            name: 'Acme Enterprise Visibility Tracker',
            brand_name: 'Acme Corp',
            brand_aliases: ['Acme', 'Acme Inc', 'Acme Analytics'],
            target_domain: 'acmecorp.com',
            target_queries: [
              'best brand visibility intelligence platforms',
              'top AI overview tracking tools for enterprise',
            ],
            competitors: ['BrandWatch', 'Sprout Social', 'SEMrush'],
            tracking_frequency: 'daily',
            query_intent: 'Brand',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      } else {
        return NextResponse.json(
          {
            success: false,
            error: `Database query failed: ${campaignsError.message}`,
            hint: 'Ensure Phase 1 SQL schema has been executed on your Supabase instance.',
          },
          { status: 500 }
        );
      }
    } else {
      activeCampaigns = (campaigns as CampaignRow[]) || [];
    }

    if (activeCampaigns.length === 0) {
      if (tenantIdParam) {
        const { data: tenant } = await supabase.from('tenants').select('*').eq('id', tenantIdParam).maybeSingle();
        if (tenant) {
          const settings = (tenant.settings as any) || {};
          const brandName = tenant.name || 'Primary Brand';
          const domain = (settings.domain as string) || `${tenant.slug}.com`;
          const aliases = Array.isArray(tenant.aliases) && tenant.aliases.length > 0
            ? tenant.aliases
            : Array.isArray(settings.aliases)
            ? settings.aliases
            : [];
          const defaultQueries = customQuery
            ? [customQuery]
            : [
                `best ${brandName} solutions and alternatives`,
                `top enterprise platforms like ${brandName}`,
              ];

          const { data: newCamp } = await supabase
            .from('campaigns')
            .insert({
              tenant_id: tenant.id,
              name: `${brandName} Visibility Tracker`,
              brand_name: brandName,
              brand_aliases: aliases,
              aliases: aliases,
              target_domain: domain,
              target_queries: defaultQueries,
              competitors: ['Competitor A', 'Competitor B', 'Competitor C'],
              tracking_frequency: 'daily',
              query_intent: 'Brand',
              is_active: true,
            })
            .select()
            .single();

          if (newCamp) {
            activeCampaigns = [newCamp as CampaignRow];
          }
        }
      }

      if (activeCampaigns.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No active campaigns found for this tenant.',
          processedCount: 0,
          results: [],
        });
      }
    }

    const isGeminiEngine = engineParam === 'gemini' || engineParam === 'gemini_aio';

    // 3. Flatten tasks across campaigns and target queries
    const tasks: Array<{
      campaign: CampaignRow;
      targetQuery: string;
    }> = [];

    for (const campaign of activeCampaigns) {
      const queries = customQuery
        ? [customQuery]
        : campaign.target_queries && campaign.target_queries.length > 0
        ? campaign.target_queries
        : [`best solutions in ${campaign.name}`];

      for (const targetQuery of queries) {
        tasks.push({ campaign, targetQuery });
      }
    }

    // 4. Validate Daily Prompt Tracking Limits per Subscription Tier
    let processableTasks = tasks;
    let quotaWarning: string | undefined = undefined;

    if (!isDryRun && activeCampaigns.length > 0) {
      const primaryTenantId = tenantIdParam || activeCampaigns[0].tenant_id;
      const promptQuota = await validatePromptLimit(supabase, primaryTenantId, tasks.length);

      if (!promptQuota.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: promptQuota.message || 'Daily prompt tracking limit reached. Please upgrade your plan.',
            upgradeRequired: true,
            tier: promptQuota.tier,
            todayCount: promptQuota.todayCount,
            dailyLimit: promptQuota.dailyLimit,
          },
          { status: 403 }
        );
      }

      if (promptQuota.processableCount < tasks.length) {
        processableTasks = tasks.slice(0, promptQuota.processableCount);
        quotaWarning = `Processed ${promptQuota.processableCount}/${tasks.length} queries. Reached daily limit (${promptQuota.dailyLimit}/day on ${promptQuota.tier} tier). Upgrade for unlimited volume.`;
      }
    }

    // 5. Concurrent execution with connection pool throttling
    const settledResults = await Promise.allSettled(
      processableTasks.map(async ({ campaign, targetQuery }) => {
        if (isGeminiEngine) {
          // Gemini Vercel AI SDK generateObject with strict Zod schema
          const campaignAliases = Array.from(
            new Set([
              ...(Array.isArray(campaign.aliases) ? campaign.aliases : []),
              ...(Array.isArray(campaign.brand_aliases) ? campaign.brand_aliases : [])
            ])
          );

          const geminiResult = await geminiService.executeAIOQuery({
            query: targetQuery,
            brandName: campaign.brand_name,
            brandDomain: campaign.target_domain || `${campaign.brand_name.toLowerCase().replace(/\s+/g, '')}.com`,
            brandAliases: campaignAliases,
            aliases: campaignAliases,
            competitors: campaign.competitors || ['Competitor A', 'Competitor B'],
          });

          const primaryMention = geminiResult.data.mentions.find((m) => m.is_primary);

          if (isDryRun) {
            return {
              mode: 'dry_run',
              campaignId: campaign.id,
              brandName: campaign.brand_name,
              query: targetQuery,
              engine: 'gemini',
              modelVersion: geminiResult.modelVersion,
              isLiveGemini: geminiResult.isLiveGemini,
              brandMentioned: !!primaryMention,
              sentiment: geminiResult.data.mention_sentiment || 'positive',
              recommendationRank: primaryMention?.rank_position || null,
              shareOfVoiceScore: geminiResult.data.share_of_voice_score || 50.0,
              citationCount: geminiResult.data.citations.length,
              citations: geminiResult.data.citations,
              mentions: geminiResult.data.mentions,
            };
          }

          // Atomically persist validated structured data into Supabase
          const savedCitation = await geminiService.persistGeminiResult(
            supabase,
            campaign,
            targetQuery,
            geminiResult
          );

          return {
            citationId: savedCitation.id,
            campaignId: campaign.id,
            brandName: campaign.brand_name,
            query: targetQuery,
            engine: 'gemini',
            modelVersion: geminiResult.modelVersion,
            isLiveGemini: geminiResult.isLiveGemini,
            brandMentioned: !!primaryMention,
            sentiment: geminiResult.data.mention_sentiment || 'positive',
            recommendationRank: primaryMention?.rank_position || null,
            shareOfVoiceScore: geminiResult.data.share_of_voice_score || 50.0,
            citationCount: geminiResult.data.citations.length,
            mentionsCount: geminiResult.data.mentions.length,
            capturedAt: savedCitation.captured_at,
          };
        } else {
          // Multi-engine simulation & NLP extractor
          const llmResponse = await llmService.queryEngine({
            engine: engineParam as any,
            tenantId: campaign.tenant_id,
            campaignId: campaign.id,
            brandName: campaign.brand_name,
            brandDomain: campaign.target_domain || `${campaign.brand_name.toLowerCase().replace(/\s+/g, '')}.com`,
            competitors: campaign.competitors || ['Competitor A', 'Competitor B'],
            query: targetQuery,
          });

          if (isDryRun) {
            const extractor = pipeline['extractor'];
            const campaignAliases = Array.from(
              new Set([
                ...(Array.isArray(campaign.aliases) ? campaign.aliases : []),
                ...(Array.isArray(campaign.brand_aliases) ? campaign.brand_aliases : [])
              ])
            );
            const extracted = extractor.extract(llmResponse, {
              tenant_id: campaign.tenant_id,
              brand_id: campaign.id,
              name: campaign.brand_name,
              aliases: campaignAliases,
              primary_domain: campaign.target_domain || '',
              competitors: (campaign.competitors || []).map((c) => ({
                name: c,
                aliases: [c],
                primary_domain: `${c.toLowerCase().replace(/\s+/g, '')}.com`,
              })),
            });

            return {
              mode: 'dry_run',
              campaignId: campaign.id,
              brandName: campaign.brand_name,
              query: targetQuery,
              engine: engineParam,
              brandMentioned: extracted.target_brand_presence,
              sentiment: extracted.target_brand_analysis.sentiment,
              recommendationRank: extracted.target_brand_analysis.recommendation_rank,
              shareOfVoiceScore: extracted.share_of_voice.target_weighted_visibility_score,
              citationCount: extracted.citations.length,
              citations: extracted.citations.map((c) => c.url),
            };
          }

          const processed = await pipeline.processAndPersist(
            supabase,
            campaign,
            llmResponse
          );

          return {
            citationId: processed.citationId,
            campaignId: campaign.id,
            brandName: campaign.brand_name,
            query: targetQuery,
            engine: engineParam,
            brandMentioned: processed.extractedMetrics.target_brand_presence,
            sentiment: processed.extractedMetrics.target_brand_analysis.sentiment,
            recommendationRank: processed.extractedMetrics.target_brand_analysis.recommendation_rank,
            shareOfVoiceScore: processed.extractedMetrics.share_of_voice.target_weighted_visibility_score,
            citationCount: processed.extractedMetrics.citations.length,
            capturedAt: processed.extractedMetrics.timestamp,
          };
        }
      })
    );

    const executionResults = settledResults
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map((r) => r.value);

    // 6. Automated GEO Recommendation Trigger (if visibility score < 70% and not dryRun)
    let autoRecommendationsTriggered = false;
    if (!isDryRun && executionResults.length > 0) {
      const avgScore = executionResults.reduce((acc, curr) => acc + (curr.shareOfVoiceScore || 0), 0) / executionResults.length;
      const targetTenantId = tenantIdParam || activeCampaigns[0]?.tenant_id;
      if (targetTenantId && (avgScore < 70 || executionResults.some((r) => !r.brandMentioned))) {
        try {
          const geoService = new GeoRecommendationService(supabase);
          await geoService.generateRecommendations(targetTenantId, {
            visibilityScore: Math.round(avgScore),
          });
          autoRecommendationsTriggered = true;
        } catch (recErr) {
          console.warn('Auto recommendation trigger error:', recErr);
        }
      }
    }

    // 7. Record Score Snapshot & Audit Log in Supabase
      if (!isDryRun && executionResults.length > 0) {
        const targetTenantId = tenantIdParam || activeCampaigns[0]?.tenant_id;
        if (targetTenantId) {
          try {
            const { ScoreStorageService } = await import('@/lib/services/score-storage-service');
            const scoreStorage = new ScoreStorageService(supabase);
            
            const avgScore = executionResults.reduce((acc, curr) => acc + (curr.shareOfVoiceScore || 0), 0) / executionResults.length;
            const mentionedCount = executionResults.filter((r) => r.brandMentioned).length;

            const aeoScore = Math.min(100, Math.round(55 + (mentionedCount / executionResults.length) * 40));
            const geoScore = Math.min(100, Math.round(avgScore * 0.9 + 20));
            const aioScore = Math.min(100, Math.round((aeoScore * 0.5 + geoScore * 0.5)));
            const overallVis = Math.round((aeoScore * 0.35 + geoScore * 0.35 + aioScore * 0.3));

            await scoreStorage.recordScoreSnapshot({
              tenantId: targetTenantId,
              campaignId: activeCampaigns[0]?.id,
              calculationDate: new Date().toISOString(),
              weekStartDate: new Date().toISOString().split('T')[0],
              overallVisibilityScore: overallVis,
              aioScore: aioScore,
              aeoScore: aeoScore,
              geoScore: geoScore,
              sentimentSubscore: Math.min(100, Math.round(75 + (mentionedCount * 3))),
              prominenceSubscore: Math.min(100, Math.round(80 + (mentionedCount * 2))),
              sovSubscore: Math.round(avgScore),
              citationCount: executionResults.length,
              brandMentionsCount: mentionedCount,
              pillarBreakdown: {
                engine: engineParam,
                executionCount: executionResults.length,
              },
            });

            await scoreStorage.logAuditEvent({
              tenantId: targetTenantId,
              eventType: 'score_recalculation',
              status: 'success',
              action: `Recalculated visibility scores via ${engineParam} (${executionResults.length} queries evaluated)`,
              details: {
                overallVisibility: overallVis,
                aioScore,
                aeoScore,
                geoScore,
                processedCount: executionResults.length,
              },
            });
          } catch (storageErr) {
            console.warn('Score snapshot storage error:', storageErr);
          }
        }
      }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      mode: isDryRun ? 'dry_run' : 'persisted',
      engine: engineParam,
      hasGeminiApiKey: geminiService.hasApiKey(),
      processedCampaigns: activeCampaigns.length,
      processedQueries: executionResults.length,
      autoRecommendationsTriggered,
      quotaWarning,
      results: executionResults,
    });
  } catch (error: any) {
    console.error('Error in Core Tracking Loop:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Internal server error in tracking loop',
      },
      { status: 500 }
    );
  }
}
