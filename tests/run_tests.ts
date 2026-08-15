import assert from 'node:assert/strict';
import { AIODataExtractor } from '../src/extractor/aio_extractor';
import { SAMPLE_BRAND_CONFIG, SIMULATED_SEARCH_RESPONSES } from '../src/extractor/simulations/sample_data';
import { extractDomain, categorizeSourceDomain } from '../src/extractor/nlp_utils';

console.log('🧪 RUNNING PHASE 1 TEST SUITE...\n');

const extractor = new AIODataExtractor();

// Test 1: Domain Extractor
console.log('▶ Test 1: Domain Extraction and Normalization');
assert.equal(extractDomain('https://www.acmecrm.io/solutions/mid-market'), 'acmecrm.io');
assert.equal(extractDomain('http://g2.com/categories/crm'), 'g2.com');
assert.equal(extractDomain('https://app.acmecrm.io/auth'), 'app.acmecrm.io');
console.log('  ✅ Domain extraction passed.');

// Test 2: Source Categorization
console.log('▶ Test 2: Source Domain Categorization');
const targetCat = categorizeSourceDomain('acmecrm.io', SAMPLE_BRAND_CONFIG);
assert.equal(targetCat.isTarget, true);
assert.equal(targetCat.category, 'brand_direct');

const g2Cat = categorizeSourceDomain('g2.com', SAMPLE_BRAND_CONFIG);
assert.equal(g2Cat.isTarget, false);
assert.equal(g2Cat.category, 'review_platform');

const compCat = categorizeSourceDomain('salesforce.com', SAMPLE_BRAND_CONFIG);
assert.equal(compCat.isCompetitor, true);
assert.equal(compCat.category, 'brand_direct');
console.log('  ✅ Source domain categorization passed.');

// Test 3: Perplexity Extraction
console.log('▶ Test 3: Perplexity Multi-Source Extraction');
const pplxResp = SIMULATED_SEARCH_RESPONSES.find((r) => r.engine === 'perplexity')!;
const pplxMetrics = extractor.extract(pplxResp, SAMPLE_BRAND_CONFIG);
assert.equal(pplxMetrics.target_brand_presence, true);
assert.equal(pplxMetrics.target_brand_analysis.brand_name, 'AcmeCRM');
assert.equal(pplxMetrics.target_brand_analysis.recommendation_rank, 2);
assert.equal(pplxMetrics.target_brand_analysis.sentiment, 'positive');
assert.ok(pplxMetrics.citations.length >= 6);
assert.ok(pplxMetrics.share_of_voice.target_weighted_visibility_score > 80);
console.log('  ✅ Perplexity extraction passed.');

// Test 4: Gemini AIO Extraction
console.log('▶ Test 4: Gemini AIO Table & Citation Extraction');
const geminiResp = SIMULATED_SEARCH_RESPONSES.find((r) => r.engine === 'gemini_aio')!;
const geminiMetrics = extractor.extract(geminiResp, SAMPLE_BRAND_CONFIG);
assert.equal(geminiMetrics.target_brand_presence, true);
assert.equal(geminiMetrics.target_brand_analysis.recommendation_rank, 1);
assert.equal(geminiMetrics.model_metadata.has_comparison_table, true);
assert.equal(geminiMetrics.share_of_voice.target_weighted_visibility_score, 100);
console.log('  ✅ Gemini AIO extraction passed.');

// Test 5: Negative / Missing Brand Handling
console.log('▶ Test 5: Missing Brand Extraction Safety');
const emptyResponse = {
  id: 'test_empty',
  tenant_id: 'tenant_acme_corp_99',
  engine: 'chatgpt' as const,
  query: 'best erp software 2026',
  timestamp: new Date().toISOString(),
  raw_text: 'Top ERPs are SAP, Oracle, and NetSuite. No CRM mentioned.',
};
const emptyMetrics = extractor.extract(emptyResponse, SAMPLE_BRAND_CONFIG);
assert.equal(emptyMetrics.target_brand_presence, false);
assert.equal(emptyMetrics.target_brand_analysis.recommendation_rank, null);
assert.equal(emptyMetrics.share_of_voice.target_weighted_visibility_score, 0);
console.log('  ✅ Missing brand safety check passed.');

console.log('\n🎉 ALL 5 TEST SUITES PASSED SUCCESSFULLY!');
