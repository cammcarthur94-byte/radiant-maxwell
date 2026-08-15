import { AIODataExtractor } from '../src/extractor/aio_extractor';
import { SAMPLE_BRAND_CONFIG, SIMULATED_SEARCH_RESPONSES } from '../src/extractor/simulations/sample_data';
import { extractDomain, categorizeSourceDomain } from '../src/extractor/nlp_utils';

describe('Phase 1 Standalone Citation Tracker Pipeline', () => {
  const extractor = new AIODataExtractor();

  test('Domain extractor properly normalizes URLs and subdomains', () => {
    expect(extractDomain('https://www.acmecrm.io/solutions/mid-market')).toBe('acmecrm.io');
    expect(extractDomain('http://g2.com/categories/crm')).toBe('g2.com');
    expect(extractDomain('https://app.acmecrm.io/auth')).toBe('app.acmecrm.io');
  });

  test('Categorizes source domains into brand_direct vs review platforms', () => {
    const directRes = categorizeSourceDomain('acmecrm.io', SAMPLE_BRAND_CONFIG);
    expect(directRes.isTarget).toBe(true);
    expect(directRes.category).toBe('brand_direct');

    const g2Res = categorizeSourceDomain('g2.com', SAMPLE_BRAND_CONFIG);
    expect(g2Res.isTarget).toBe(false);
    expect(g2Res.category).toBe('review_platform');

    const compRes = categorizeSourceDomain('salesforce.com', SAMPLE_BRAND_CONFIG);
    expect(compRes.isCompetitor).toBe(true);
    expect(compRes.category).toBe('brand_direct');
  });

  test('Extracts metrics from Perplexity Pro response with citations and rank', () => {
    const pplxResp = SIMULATED_SEARCH_RESPONSES.find((r) => r.engine === 'perplexity')!;
    const metrics = extractor.extract(pplxResp, SAMPLE_BRAND_CONFIG);

    expect(metrics.target_brand_presence).toBe(true);
    expect(metrics.target_brand_analysis.brand_name).toBe('AcmeCRM');
    expect(metrics.target_brand_analysis.recommendation_rank).toBe(2);
    expect(metrics.target_brand_analysis.sentiment).toBe('positive');
    expect(metrics.citations.length).toBeGreaterThan(0);
    expect(metrics.share_of_voice.target_weighted_visibility_score).toBeGreaterThan(0);
  });

  test('Extracts metrics from Gemini AIO response with comparison table', () => {
    const geminiResp = SIMULATED_SEARCH_RESPONSES.find((r) => r.engine === 'gemini_aio')!;
    const metrics = extractor.extract(geminiResp, SAMPLE_BRAND_CONFIG);

    expect(metrics.target_brand_presence).toBe(true);
    expect(metrics.target_brand_analysis.recommendation_rank).toBe(1);
    expect(metrics.model_metadata.has_comparison_table).toBe(true);
    expect(metrics.share_of_voice.target_weighted_visibility_score).toBe(100);
  });

  test('Handles non-mentioned brands safely', () => {
    const emptyResponse = {
      id: 'test_empty',
      tenant_id: 'tenant_acme_corp_99',
      engine: 'chatgpt' as const,
      query: 'best erp software 2026',
      timestamp: new Date().toISOString(),
      raw_text: 'Top ERPs are SAP, Oracle, and NetSuite. No CRM mentioned.',
    };

    const metrics = extractor.extract(emptyResponse, SAMPLE_BRAND_CONFIG);
    expect(metrics.target_brand_presence).toBe(false);
    expect(metrics.target_brand_analysis.recommendation_rank).toBeNull();
    expect(metrics.share_of_voice.target_weighted_visibility_score).toBe(0);
  });
});
