import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, AIPlatform } from '@/types/database';
import { EngineId, EngineQueryRequest, EngineRawResult } from './engines/engine-types';
import { EngineRegistry, globalEngineRegistry } from './engines/engine-registry';
import { UnifiedResponseParser, globalUnifiedResponseParser, UnifiedParsedResponse, BrandTargetProfile } from './unified-response-parser';
import { validatePromptLimit } from '@/lib/subscription-limits';

export interface TrackingTask {
  campaign: Database['public']['Tables']['campaigns']['Row'];
  query: string;
  engineId: EngineId;
}

export interface TaskExecutionResult {
  taskId: string;
  campaignId: string;
  tenantId: string;
  brandName: string;
  query: string;
  engineId: EngineId;
  platform: AIPlatform;
  status: 'success' | 'failed' | 'skipped';
  citationId?: string;
  isLive?: boolean;
  brandMentioned?: boolean;
  prominenceScore?: number;
  prominenceTier?: string;
  recommendationRank?: number | null;
  shareOfVoice?: number;
  sentiment?: string;
  citationsCount?: number;
  latencyMs?: number;
  error?: string;
}

export interface BatchWorkerOptions {
  concurrency?: number; // default: 4 concurrent queries
  maxRetries?: number; // default: 3 retries
  dryRun?: boolean;
}

export class MultiEngineTrackingWorker {
  private registry: EngineRegistry;
  private parser: UnifiedResponseParser;

  constructor(registry?: EngineRegistry, parser?: UnifiedResponseParser) {
    this.registry = registry || globalEngineRegistry;
    this.parser = parser || globalUnifiedResponseParser;
  }

  /**
   * Executes a batch of tracking tasks with controlled concurrency, retries, and error boundaries
   */
  public async executeBatch(
    supabase: SupabaseClient<Database>,
    tasks: TrackingTask[],
    options: BatchWorkerOptions = {}
  ): Promise<{
    totalTasks: number;
    successful: number;
    failed: number;
    skipped: number;
    results: TaskExecutionResult[];
  }> {
    const concurrency = options.concurrency || 4;
    const maxRetries = options.maxRetries || 3;
    const dryRun = Boolean(options.dryRun);

    const results: TaskExecutionResult[] = [];
    let successful = 0;
    let failed = 0;
    let skipped = 0;

    // Queue worker concurrency limiter pool
    for (let i = 0; i < tasks.length; i += concurrency) {
      const chunk = tasks.slice(i, i + concurrency);
      const chunkPromises = chunk.map(async (task, chunkIdx) => {
        const taskId = `task_${i + chunkIdx + 1}`;
        try {
          // 1. Validate subscription tier limits
          if (!dryRun) {
            const quota = await validatePromptLimit(supabase, task.campaign.tenant_id, 1);
            if (!quota.allowed) {
              skipped++;
              return {
                taskId,
                campaignId: task.campaign.id,
                tenantId: task.campaign.tenant_id,
                brandName: task.campaign.brand_name,
                query: task.query,
                engineId: task.engineId,
                platform: this.mapEngineToPlatform(task.engineId),
                status: 'skipped' as const,
                error: 'Daily/monthly prompt quota reached for tenant plan',
              };
            }
          }

          // 2. Build Brand Profile and Query Request
          const aliases = Array.from(
            new Set([
              ...(Array.isArray(task.campaign.aliases) ? task.campaign.aliases : []),
              ...(Array.isArray(task.campaign.brand_aliases) ? task.campaign.brand_aliases : []),
            ])
          );

          const competitorList = task.campaign.competitors || [];
          const targetDomain = task.campaign.target_domain || `${task.campaign.brand_name.toLowerCase().replace(/\s+/g, '')}.com`;

          const targetProfile: BrandTargetProfile = {
            name: task.campaign.brand_name,
            domain: targetDomain,
            aliases,
            competitors: competitorList.map((compName) => ({
              name: compName,
              domain: `${compName.toLowerCase().replace(/\s+/g, '')}.com`,
              aliases: [compName],
            })),
          };

          const engineRequest: EngineQueryRequest = {
            query: task.query,
            brandName: task.campaign.brand_name,
            brandDomain: targetDomain,
            brandAliases: aliases,
            competitors: competitorList,
            options: {
              timeoutMs: 25000,
            },
          };

          // 3. Execute Engine Query with Retry & Backoff
          const engineResult: EngineRawResult = await this.registry.executeWithRetry(
            task.engineId,
            engineRequest,
            maxRetries
          );

          // 4. Ingest and Parse Response
          const parsed: UnifiedParsedResponse = this.parser.parse(engineResult, targetProfile);

          // 5. Persist to Database if not dry run
          let citationId: string | undefined;
          if (!dryRun) {
            citationId = await this.persistResult(supabase, task.campaign, parsed, engineResult);
          }

          successful++;
          return {
            taskId,
            campaignId: task.campaign.id,
            tenantId: task.campaign.tenant_id,
            brandName: task.campaign.brand_name,
            query: task.query,
            engineId: task.engineId,
            platform: engineResult.platform || this.mapEngineToPlatform(task.engineId),
            status: 'success' as const,
            citationId,
            isLive: engineResult.isLive ?? false,
            brandMentioned: parsed.targetBrand.mentioned,
            prominenceScore: parsed.prominenceScore,
            prominenceTier: parsed.prominenceTier,
            recommendationRank: parsed.recommendationRank,
            shareOfVoice: parsed.shareOfVoiceScore,
            sentiment: parsed.sentiment,
            citationsCount: parsed.citations.length,
            latencyMs: engineResult.latencyMs,
          };
        } catch (taskErr: any) {
          failed++;
          console.error(`[MultiEngineTrackingWorker] Task failure for ${task.campaign.brand_name} (${task.engineId}):`, taskErr);
          return {
            taskId,
            campaignId: task.campaign.id,
            tenantId: task.campaign.tenant_id,
            brandName: task.campaign.brand_name,
            query: task.query,
            engineId: task.engineId,
            platform: this.mapEngineToPlatform(task.engineId),
            status: 'failed' as const,
            error: taskErr?.message || 'Unknown query execution error',
          };
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }

    return {
      totalTasks: tasks.length,
      successful,
      failed,
      skipped,
      results,
    };
  }

  /**
   * Persists normalized parsed citation record into Supabase
   */
  private async persistResult(
    supabase: SupabaseClient<Database>,
    campaign: Database['public']['Tables']['campaigns']['Row'],
    parsed: UnifiedParsedResponse,
    rawResult: EngineRawResult
  ): Promise<string> {
    const isAIOEngine = parsed.engineId === 'google_aio' || parsed.platform === 'google_aio' || (rawResult.metadata?.ai_overview_present !== undefined);
    const aiOverviewPresent = rawResult.metadata?.ai_overview_present ?? isAIOEngine;
    const isCited = rawResult.metadata?.is_cited ?? parsed.targetBrand.mentioned;

    const citationPayload: any = {
      tenant_id: campaign.tenant_id,
      campaign_id: campaign.id,
      ai_platform: parsed.platform || (isAIOEngine ? 'google_aio' : 'gemini'),
      model_version: rawResult.modelName || rawResult.model || 'google-ai-overview',
      query: parsed.query,
      brand_mentioned: parsed.targetBrand.mentioned,
      sentiment: parsed.sentiment,
      sentiment_score: parsed.sentimentScore,
      share_of_voice: parsed.shareOfVoiceScore,
      recommendation_rank: parsed.recommendationRank,
      prominence_score: parsed.prominenceScore,
      citation_urls: parsed.citations.map((c) => c.url),
      ai_overview_present: aiOverviewPresent,
      is_cited: isCited,
      ai_overview_data: {
        present: aiOverviewPresent,
        is_cited: isCited,
        serp_provider: rawResult.metadata?.serpProvider || (isAIOEngine ? 'google_ai_overview' : 'conversational_llm'),
        reference_citations: parsed.citations,
        target_brand_rank: parsed.recommendationRank,
        prominence_tier: parsed.prominenceTier,
        extracted_snippet: rawResult.metadata?.extractedSnippet || parsed.extractedSnippets?.[0] || '',
      },
      citations_data: {
        citations: parsed.citations,
        target_brand: parsed.targetBrand,
        competitors: parsed.competitors,
        prominence_tier: parsed.prominenceTier,
        extracted_snippets: parsed.extractedSnippets,
        latency_ms: rawResult.latencyMs,
        is_live: rawResult.isLive,
        ai_overview_present: aiOverviewPresent,
        is_cited: isCited,
      },
      raw_response: rawResult.rawText,
      raw_response_text: rawResult.rawText,
      captured_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('citations')
      .insert(citationPayload)
      .select('id')
      .single();

    if (error) {
      throw new Error(`Supabase citation insertion error: ${error.message}`);
    }

    return data.id;
  }

  private mapEngineToPlatform(engineId: EngineId): AIPlatform {
    const map: Record<EngineId, AIPlatform> = {
      gemini: 'gemini',
      google_aio: 'google_aio',
      perplexity: 'perplexity',
      chatgpt: 'chatgpt',
      claude: 'claude',
      copilot: 'copilot',
      meta: 'meta',
    };
    return map[engineId] || 'gemini';
  }
}

export const globalMultiEngineWorker = new MultiEngineTrackingWorker();
