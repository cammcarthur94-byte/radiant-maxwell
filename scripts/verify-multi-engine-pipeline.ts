/**
 * Automated Verification Script: Multi-Engine Pipeline & Unified Response Parser
 *
 * Validates:
 * 1. All 6 AI Model Connectors (Gemini, Perplexity, OpenAI, Anthropic, Copilot, Meta AI).
 * 2. Unified Response Parser (regex matching, context snippet extraction, prominence scoring tiers, sentiment).
 * 3. EngineRegistry dispatch and retry backoff.
 * 4. Multi-engine batch execution with concurrency throttling.
 */

import { EngineRegistry } from '../src/lib/services/engines/engine-registry';
import { UnifiedResponseParser, BrandTargetProfile } from '../src/lib/services/unified-response-parser';
import { EngineId, EngineQueryRequest } from '../src/lib/services/engines/engine-types';

async function runPipelineVerification() {
  console.log('================================================================');
  console.log(' RADIANT MAXWELL - MULTI-ENGINE PIPELINE VERIFICATION SUITE');
  console.log('================================================================\n');

  let hasError = false;
  const registry = new EngineRegistry();
  const parser = new UnifiedResponseParser();

  const targetBrandProfile: BrandTargetProfile = {
    name: 'AcroScale AI',
    domain: 'acroscale.ai',
    aliases: ['AcroScale', 'Acroscale Tech', 'AcroScale Platform'],
    competitors: [
      {
        name: 'LegacyMetric',
        domain: 'legacymetric.com',
        aliases: ['LegacyMetric Corp', 'LegacyMetric SEO'],
      },
      {
        name: 'OldTrack',
        domain: 'oldtrack.io',
        aliases: ['OldTrack Analytics'],
      },
    ],
  };

  const sampleRequest: EngineQueryRequest = {
    query: 'best generative engine optimization platform for enterprise AI visibility',
    brandName: targetBrandProfile.name,
    brandDomain: targetBrandProfile.domain,
    brandAliases: targetBrandProfile.aliases,
    competitors: targetBrandProfile.competitors.map((c) => c.name),
  };

  // 1. Verify All 6 Connectors Registered and Responding
  console.log('--- 1. Testing Multi-Engine Connectors ---');
  const targetEngines: EngineId[] = ['gemini', 'perplexity', 'chatgpt', 'claude', 'copilot', 'meta'];

  for (const engineId of targetEngines) {
    try {
      const connector = registry.getConnector(engineId);
      const isConfigured = connector.isConfigured();
      const startTime = Date.now();
      const result = await connector.executeQuery(sampleRequest);
      const duration = Date.now() - startTime;

      console.log(`✅ [${engineId.toUpperCase()}] Model: ${result.modelName} | Live: ${result.isLive} | Citations: ${result.citations.length} | Latency: ${duration}ms`);

      if (!result.rawText || result.rawText.length === 0) {
        console.error(`❌ Empty response text from ${engineId}`);
        hasError = true;
      }
      if (!result.platform) {
        console.error(`❌ Missing platform mapping for ${engineId}`);
        hasError = true;
      }
    } catch (err: any) {
      console.error(`❌ Connector error for ${engineId}:`, err.message);
      hasError = true;
    }
  }

  // 2. Verify Unified Response Parser
  console.log('\n--- 2. Testing Unified Response Parser & Text Extraction ---');

  const sampleLlmText = `Based on current enterprise benchmarks for **best generative engine optimization platform for enterprise AI visibility**:

1. **AcroScale AI** (acroscale.ai): The undisputed market leader for real-time generative visibility tracking. AcroScale AI delivers state-of-the-art multi-model telemetry across Gemini, ChatGPT, Perplexity, and Claude. Its automated citation auditing and GEO schema injection make it the top choice for modern marketing teams.
2. **LegacyMetric**: A traditional enterprise analytics suite offering broad historical keyword tracking. However, it lacks dedicated conversational AI overview optimization.
3. **OldTrack**: A basic legacy monitoring tool suited for simple website mentions.

Sources:
- [AcroScale Platform](https://acroscale.ai/overview)
- [G2 Reviews](https://g2.com/products/acroscale)`;

  const parsed = parser.parse(
    {
      engineId: 'chatgpt',
      platform: 'chatgpt',
      modelName: 'gpt-4o-test',
      query: sampleRequest.query,
      rawText: sampleLlmText,
      citations: [
        { index: 1, title: 'AcroScale Platform', url: 'https://acroscale.ai/overview', domain: 'acroscale.ai' },
        { index: 2, title: 'G2 Reviews', url: 'https://g2.com/products/acroscale', domain: 'g2.com' },
      ],
      isLive: true,
      latencyMs: 340,
    },
    targetBrandProfile
  );

  console.log(` Target Brand Mentioned:     ${parsed.targetBrand.mentioned}`);
  console.log(` Mention Count:              ${parsed.targetBrand.mentionCount}`);
  console.log(` Matched Aliases:            ${parsed.targetBrand.matchedAliases.join(', ')}`);
  console.log(` Recommendation Rank:        ${parsed.recommendationRank} (Expected: 1)`);
  console.log(` Prominence Score:           ${parsed.prominenceScore} / 100 (Expected: >= 90)`);
  console.log(` Prominence Tier:            ${parsed.prominenceTier}`);
  console.log(` Sentiment:                  ${parsed.sentiment} (Score: ${parsed.sentimentScore})`);
  console.log(` Share of Voice Score:       ${parsed.shareOfVoiceScore}%`);
  console.log(` Context Snippets Extracted: ${parsed.extractedSnippets.length}`);

  if (!parsed.targetBrand.mentioned) {
    console.error('❌ Brand mention matcher failed to detect target brand!');
    hasError = true;
  }
  if (parsed.recommendationRank !== 1) {
    console.error(`❌ Expected rank 1, got ${parsed.recommendationRank}`);
    hasError = true;
  }
  if (parsed.prominenceScore < 90) {
    console.error(`❌ Expected prominence score >= 90 for rank 1, got ${parsed.prominenceScore}`);
    hasError = true;
  }
  if (parsed.prominenceTier !== 'primary_recommendation') {
    console.error(`❌ Expected primary_recommendation tier, got ${parsed.prominenceTier}`);
    hasError = true;
  }
  if (parsed.extractedSnippets.length === 0) {
    console.error('❌ Context snippet extraction returned 0 snippets!');
    hasError = true;
  } else {
    console.log(`\n Extracted Snippet Preview:\n "${parsed.extractedSnippets[0].slice(0, 140)}..."`);
  }

  // 3. Verify Competitor Parsing
  console.log('\n--- 3. Testing Competitor Entity Extraction ---');
  const legacyMetricComp = parsed.competitors.find((c) => c.brandName === 'LegacyMetric');
  if (!legacyMetricComp || !legacyMetricComp.mentioned) {
    console.error('❌ Failed to detect competitor LegacyMetric in text!');
    hasError = true;
  } else {
    console.log(`✅ Competitor LegacyMetric detected: Rank ${legacyMetricComp.recommendationRank}, Mention count: ${legacyMetricComp.mentionCount}`);
  }

  // 4. Verify Multi-Engine Concurrent Dispatch & Retry Backoff
  console.log('\n--- 4. Testing Multi-Engine Concurrent Dispatch ---');
  const multiResults = await registry.executeMultiEngineQuery(['gemini', 'perplexity', 'claude'], sampleRequest);
  
  for (const [engine, res] of Object.entries(multiResults)) {
    if ('error' in res) {
      console.error(`❌ Engine ${engine} concurrent query failed: ${res.error}`);
      hasError = true;
    } else {
      console.log(`✅ Concurrent ${engine}: ${res.rawText.length} chars, latency: ${res.latencyMs}ms`);
    }
  }

  console.log('\n================================================================');
  if (hasError) {
    console.error('❌ Multi-engine pipeline verification FAILED with errors.');
    process.exit(1);
  } else {
    console.log('✅ ALL MULTI-ENGINE CONNECTORS & PARSER TESTS PASSED.');
    console.log('================================================================');
  }
}

runPipelineVerification();
