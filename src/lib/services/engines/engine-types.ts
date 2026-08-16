import { AIPlatform } from '@/types/database';

export type EngineId = 'gemini' | 'perplexity' | 'chatgpt' | 'claude' | 'copilot' | 'meta' | 'google_aio';

export interface GroundingCitation {
  title?: string;
  url: string;
  domain: string;
  snippet?: string;
  index?: number;
}

export interface EngineQueryRequest {
  query: string;
  brandName: string;
  brandDomain: string;
  brandAliases?: string[];
  competitors?: string[];
  category?: string;
  options?: {
    maxTokens?: number;
    temperature?: number;
    timeoutMs?: number;
    searchRecencyFilter?: 'day' | 'week' | 'month' | 'year';
  };
}

export interface EngineRawResult {
  engineId?: EngineId;
  engine?: EngineId;
  platform?: AIPlatform;
  modelName?: string;
  model?: string;
  query: string;
  rawText: string;
  citations: GroundingCitation[];
  isLive?: boolean;
  latencyMs: number;
  tokensUsed?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

export interface AIModelConnector {
  readonly engineId: EngineId;
  readonly platform: AIPlatform;
  readonly defaultModel: string;
  
  isConfigured(): boolean;
  
  executeQuery(request: EngineQueryRequest): Promise<EngineRawResult>;
}
