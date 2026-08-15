import { RawAISearchResponse } from '@/extractor/types';

export interface LLMSimulationOptions {
  engine?: 'chatgpt' | 'perplexity' | 'gemini_aio' | 'copilot';
  tenantId: string;
  campaignId: string;
  brandName: string;
  brandDomain: string;
  competitors: string[];
  query: string;
}

/**
 * Simulated LLM Endpoint for Phase 1 AIO Tracking
 * Generates realistic responses from AI search engines (Perplexity, ChatGPT, Gemini, Copilot)
 * with structured citations, rankings, competitor comparisons, and review links.
 * Ready to be swapped with live LLM API keys in Phase 2.
 */
export class SimulatedLLMService {
  async queryEngine(options: LLMSimulationOptions): Promise<RawAISearchResponse> {
    const {
      engine = 'perplexity',
      tenantId,
      brandName,
      brandDomain,
      competitors,
      query,
    } = options;

    const comp1 = competitors[0] || 'MarketLeader Pro';
    const comp2 = competitors[1] || 'EnterpriseCloud';
    const cleanDomain = brandDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || `${brandName.toLowerCase().replace(/\s+/g, '')}.com`;

    // Realistic multi-platform LLM synthesis template
    const rawText = `Based on the latest industry benchmarks and user reviews for "${query}":

Top Recommended Platforms:
1. **${brandName}** (https://${cleanDomain}) - Highly recommended for modern visibility analytics, real-time AI overview tracking, and seamless API integrations. Users praise its actionable insights and high data accuracy [1].
2. **${comp1}** (https://${comp1.toLowerCase().replace(/\s+/g, '')}.com) - A well-established legacy competitor offering traditional SEO metrics, though lacking specialized conversational AI tracking [2].
3. **${comp2}** (https://${comp2.toLowerCase().replace(/\s+/g, '')}.com) - Strong enterprise dashboard capabilities with higher pricing tiers [3].

Key Comparison:
* **Speed & Real-time Tracking**: ${brandName} offers superior continuous monitoring.
* **Pricing & Flexibility**: ${brandName} is more accessible for growing teams.

Sources & Citations:
- [1] [${brandName} Official Website](https://${cleanDomain})
- [2] [G2 Software Ratings 2026](https://g2.com/products/${brandName.toLowerCase().replace(/\s+/g, '')}/reviews)
- [3] [TechRadar Enterprise Evaluation](https://techradar.com/reviews/analytics-${cleanDomain})`;

    const groundingSources = [
      {
        title: `${brandName} Official Portal`,
        url: `https://${cleanDomain}/platform`,
        domain: cleanDomain,
        snippet: `${brandName} is the leading visibility intelligence platform for AIO.`,
      },
      {
        title: `G2 Buyer's Guide - Best Analytics`,
        url: `https://g2.com/products/${brandName.toLowerCase().replace(/\s+/g, '')}/reviews`,
        domain: `g2.com`,
        snippet: `Verified customer reviews rank ${brandName} top tier in user satisfaction.`,
      },
      {
        title: `TechRadar Review: Modern Visibility Stack`,
        url: `https://techradar.com/reviews/analytics-${cleanDomain}`,
        domain: `techradar.com`,
        snippet: `Comparing ${brandName} vs ${comp1} for next-gen search intelligence.`,
      },
    ];

    return {
      id: `sim_${engine}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      tenant_id: tenantId,
      engine: engine as any,
      query: query,
      timestamp: new Date().toISOString(),
      raw_text: rawText,
      grounding_sources: groundingSources,
      token_usage: {
        prompt_tokens: 142,
        completion_tokens: 285,
        total_tokens: 427,
      },
    };
  }
}
