import { AIModelConnector, EngineId, EngineQueryRequest, EngineRawResult } from './engine-types';
import { GeminiConnector } from './gemini-connector';
import { PerplexityConnector } from './perplexity-connector';
import { OpenAIConnector } from './openai-connector';
import { AnthropicConnector } from './anthropic-connector';
import { CopilotConnector } from './copilot-connector';
import { MetaConnector } from './meta-connector';
import { GoogleAIOConnector } from './google-aio-connector';

export class EngineRegistry {
  private connectors: Map<EngineId, AIModelConnector>;

  constructor() {
    this.connectors = new Map<EngineId, AIModelConnector>();
    this.registerConnector(new GeminiConnector());
    this.registerConnector(new GoogleAIOConnector());
    this.registerConnector(new PerplexityConnector());
    this.registerConnector(new OpenAIConnector());
    this.registerConnector(new AnthropicConnector());
    this.registerConnector(new CopilotConnector());
    this.registerConnector(new MetaConnector());
  }

  public registerConnector(connector: AIModelConnector): void {
    this.connectors.set(connector.engineId, connector);
  }

  public getConnector(engineId: EngineId): AIModelConnector {
    const connector = this.connectors.get(engineId);
    if (!connector) {
      throw new Error(`Unregistered AI engine ID: ${engineId}. Available engines: ${Array.from(this.connectors.keys()).join(', ')}`);
    }
    return connector;
  }

  public getAvailableEngines(): EngineId[] {
    return Array.from(this.connectors.keys());
  }

  public getLiveEngines(): EngineId[] {
    return Array.from(this.connectors.entries())
      .filter(([_, connector]) => connector.isConfigured())
      .map(([id]) => id);
  }

  /**
   * Executes query on a single engine with retry logic and exponential backoff
   */
  public async executeWithRetry(
    engineId: EngineId,
    request: EngineQueryRequest,
    maxRetries: number = 3
  ): Promise<EngineRawResult> {
    const connector = this.getConnector(engineId);
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await connector.executeQuery(request);
      } catch (err: any) {
        lastError = err;
        console.warn(`[EngineRegistry] Engine ${engineId} attempt ${attempt}/${maxRetries} failed: ${err.message}`);
        
        if (attempt < maxRetries) {
          // Exponential backoff with jitter: 500ms * 2^(attempt - 1) + jitter
          const baseDelay = 500 * Math.pow(2, attempt - 1);
          const jitter = Math.random() * 250;
          await new Promise((resolve) => setTimeout(resolve, baseDelay + jitter));
        }
      }
    }

    throw new Error(`Engine ${engineId} failed after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown'}`);
  }

  /**
   * Executes query across all registered engines concurrently with error boundaries
   */
  public async executeMultiEngineQuery(
    engines: EngineId[],
    request: EngineQueryRequest
  ): Promise<Record<EngineId, EngineRawResult | { error: string }>> {
    const results: Record<string, EngineRawResult | { error: string }> = {};

    const promises = engines.map(async (engineId) => {
      try {
        const res = await this.executeWithRetry(engineId, request);
        results[engineId] = res;
      } catch (err: any) {
        results[engineId] = { error: err?.message || 'Engine execution failed' };
      }
    });

    await Promise.all(promises);
    return results as Record<EngineId, EngineRawResult | { error: string }>;
  }
}

// Global singleton instance
export const globalEngineRegistry = new EngineRegistry();
