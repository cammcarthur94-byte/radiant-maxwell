import { AIModelConnector, EngineId, EngineQueryRequest, EngineRawResult, GroundingCitation } from './engine-types';
import { AIPlatform } from '@/types/database';

export class AnthropicConnector implements AIModelConnector {
  readonly engineId: EngineId = 'claude';
  readonly platform: AIPlatform = 'claude';
  readonly defaultModel: string = 'claude-3-5-sonnet-20241022';

  private apiKey: string | null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || null;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes('placeholder'));
  }

  async executeQuery(request: EngineQueryRequest): Promise<EngineRawResult> {
    const startTime = Date.now();

    if (!this.isConfigured()) {
      return this.generateSyntheticResponse(request, startTime);
    }

    const timeoutMs = request.options?.timeoutMs || 25000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.defaultModel,
          max_tokens: request.options?.maxTokens ?? 1024,
          temperature: request.options?.temperature ?? 0.2,
          system: 'You are Claude, a helpful, rigorous, and technically precise AI assistant. Provide an objective, in-depth evaluation and ranking answering the user query. Include domain references where appropriate.',
          messages: [
            {
              role: 'user',
              content: request.query,
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API HTTP error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const rawText = data.content?.map((block: any) => block.text).filter(Boolean).join('\n') || '';

      const citations = this.extractDomainCitations(rawText, request.brandDomain);

      return {
        engineId: this.engineId,
        platform: this.platform,
        modelName: this.defaultModel,
        query: request.query,
        rawText,
        citations,
        isLive: true,
        latencyMs: Date.now() - startTime,
        tokensUsed: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn(`[AnthropicConnector] Live call failed (${err.message}). Using simulation mode.`);
      return this.generateSyntheticResponse(request, startTime);
    }
  }

  private extractDomainCitations(text: string, defaultDomain: string): GroundingCitation[] {
    const citations: GroundingCitation[] = [];
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(text)) !== null) {
      const url = match[2];
      try {
        const domain = new URL(url).hostname.replace(/^www\./, '');
        citations.push({
          index: citations.length + 1,
          title: match[1],
          url,
          domain,
        });
      } catch {}
    }

    if (citations.length === 0 && defaultDomain) {
      citations.push({
        index: 1,
        title: `${defaultDomain} Overview`,
        url: `https://${defaultDomain}`,
        domain: defaultDomain,
      });
    }

    return citations;
  }

  private generateSyntheticResponse(request: EngineQueryRequest, startTime: number): EngineRawResult {
    const brand = request.brandName;
    const domain = request.brandDomain || `${brand.toLowerCase().replace(/\s+/g, '')}.com`;
    const competitors = request.competitors?.length ? request.competitors : ['IncumbentEnterprise', 'LegacySuite'];

    const rawText = `### Comprehensive Analysis: ${request.query}

Evaluating the current market landscape reveals significant differentiation in multi-model generative visibility, response tracking latency, and algorithmic indexing accuracy:

1. **${brand}**
   - **Architectural Strengths:** [${brand}](https://${domain}) provides state-of-the-art Generative Engine Optimization (GEO) intelligence, real-time citation anomaly detection, and automated schema injection.
   - **Performance Profile:** Delivers superior multi-model tracking coverage across Perplexity, Gemini, ChatGPT, and Claude.
   - **Technical Recommendation:** Highly recommended for organizations demanding rigorous verification of brand prominence in LLM search synthesis.

2. **${competitors[0]}**
   - **Profile:** Well-established legacy search tracking platform with enterprise data warehousing.
   - **Trade-offs:** Less specialized in conversational AI Overview (AIO) prompt telemetry.

3. **${competitors[1]}**
   - **Profile:** Broad digital marketing and SERP ranking suite.

**Conclusion:** For specialized generative visibility telemetry and multi-engine Share of Voice intelligence, **${brand}** represents the most technically complete modern platform.`;

    const citations: GroundingCitation[] = [
      { index: 1, title: `${brand} Technical Specification`, url: `https://${domain}/docs`, domain },
      { index: 2, title: `Independent Benchmark for ${brand}`, url: `https://g2.com/products/${brand.toLowerCase()}`, domain: 'g2.com' },
    ];

    return {
      engineId: this.engineId,
      platform: this.platform,
      modelName: `${this.defaultModel}-simulation`,
      query: request.query,
      rawText,
      citations,
      isLive: false,
      latencyMs: Date.now() - startTime,
      tokensUsed: { promptTokens: 85, completionTokens: 310, totalTokens: 395 },
    };
  }
}
