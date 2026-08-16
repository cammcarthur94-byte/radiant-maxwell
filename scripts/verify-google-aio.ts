import { GoogleAIOConnector } from '../src/lib/services/engines/google-aio-connector';
import { globalEngineRegistry } from '../src/lib/services/engines/engine-registry';
import { UnifiedResponseParser } from '../src/lib/services/unified-response-parser';

async function verifyGoogleAIOverviewPipeline() {
  console.log('--- 1. Testing GoogleAIOConnector ---');
  const connector = new GoogleAIOConnector();
  console.log(`[GoogleAIOConnector] engineId: ${connector.engineId}, defaultModel: ${connector.defaultModel}`);

  const testRequest = {
    query: 'best enterprise website builder with React and SOC2 compliance',
    brandName: 'Radiant Enterprise',
    brandDomain: 'radiant.com',
    competitors: ['Webflow Enterprise', 'Contentful'],
  };

  const rawResult = await connector.executeQuery(testRequest);
  console.log('Raw Result Engine:', rawResult.engineId || rawResult.engine);
  console.log('AI Overview Present:', rawResult.metadata?.ai_overview_present);
  console.log('Client Is Cited:', rawResult.metadata?.is_cited);
  console.log('Extracted Citations Count:', rawResult.citations.length);
  console.log('Sample Citation Title:', rawResult.citations[0]?.title);
  console.log('Sample Citation URL:', rawResult.citations[0]?.url);

  if (rawResult.metadata?.ai_overview_present !== true) {
    throw new Error('Expected ai_overview_present to be true');
  }

  if (rawResult.citations.length === 0) {
    throw new Error('Expected citations to be populated');
  }

  console.log('--- 2. Testing UnifiedResponseParser with Google AIO ---');
  const parser = new UnifiedResponseParser();
  const parsed = parser.parse(
    {
      engineId: 'google_aio',
      platform: 'google_aio' as any,
      modelName: 'google-ai-overview-v2',
      query: testRequest.query,
      rawText: rawResult.rawText,
      citations: rawResult.citations,
      latencyMs: rawResult.latencyMs,
      metadata: rawResult.metadata,
    },
    {
      name: testRequest.brandName,
      domain: testRequest.brandDomain,
      aliases: ['Radiant', 'Radiant App'],
      competitors: [
        { name: 'Webflow', domain: 'webflow.com', aliases: ['Webflow Inc'] },
      ],
    }
  );

  console.log('Parsed Brand Mentioned:', parsed.targetBrand.mentioned);
  console.log('Parsed Prominence Score:', parsed.prominenceScore);
  console.log('Parsed SOV Score:', parsed.shareOfVoiceScore);
  console.log('Parsed Citations Count:', parsed.citations.length);

  console.log('--- 3. Testing EngineRegistry ---');
  const registeredEngines = globalEngineRegistry.getAvailableEngines();
  console.log('Available Engines in Registry:', registeredEngines);

  if (!registeredEngines.includes('google_aio')) {
    throw new Error('EngineRegistry missing google_aio');
  }

  const aioFromRegistry = globalEngineRegistry.getConnector('google_aio');
  console.log('Retrieved AIO Connector from Registry:', aioFromRegistry.engineId);

  console.log('✅ ALL GOOGLE AI OVERVIEW PIPELINE CHECKS PASSED SUCCESSFULLY!');
}

verifyGoogleAIOverviewPipeline().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
