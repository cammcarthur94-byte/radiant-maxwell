import * as fs from 'node:fs';
import * as path from 'node:path';
import { AIODataExtractor } from './aio_extractor';
import { SAMPLE_BRAND_CONFIG, SIMULATED_SEARCH_RESPONSES } from './simulations/sample_data';
import { ExtractedAIOMetrics } from './types';

async function runExtractionPipeline() {
  console.log('================================================================');
  console.log('🚀 AIO BRAND CITATION & SOV EXTRACTION PIPELINE (Phase 1)');
  console.log('================================================================\n');

  const extractor = new AIODataExtractor();
  const extractedResults: ExtractedAIOMetrics[] = [];

  for (const resp of SIMULATED_SEARCH_RESPONSES) {
    console.log(`🔍 Processing Engine: [${resp.engine.toUpperCase()}] | Query: "${resp.query}"`);
    const metrics = extractor.extract(resp, SAMPLE_BRAND_CONFIG);
    extractedResults.push(metrics);

    console.log(`   - Target Brand Mentioned: ${metrics.target_brand_presence ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Recommendation Rank: #${metrics.target_brand_analysis.recommendation_rank ?? 'N/A'}`);
    console.log(`   - Sentiment: ${metrics.target_brand_analysis.sentiment.toUpperCase()} (Score: ${metrics.target_brand_analysis.sentiment_score})`);
    console.log(`   - Total Citations Found: ${metrics.citation_summary.total_citations} (Target Direct: ${metrics.citation_summary.target_brand_citations}, Competitors: ${metrics.citation_summary.competitor_citations})`);
    console.log(`   - Target Share of Voice: ${metrics.share_of_voice.target_weighted_visibility_score}% (Weighted Visibility Index: ${metrics.share_of_voice.target_weighted_visibility_score}/100)`);
    console.log('----------------------------------------------------------------');
  }

  // Cross-Engine Aggregation Summary
  const totalEngines = extractedResults.length;
  const enginesPresent = extractedResults.filter(r => r.target_brand_presence).length;
  const avgSov = extractedResults.reduce((sum, r) => {
    const sov = r.share_of_voice.brand_visibility_breakdown[SAMPLE_BRAND_CONFIG.name]?.share_of_voice_pct || 0;
    return sum + sov;
  }, 0) / totalEngines;

  const ranks = extractedResults
    .map(r => r.target_brand_analysis.recommendation_rank)
    .filter((rank): rank is number => rank !== null);
  const avgRank = ranks.length > 0 ? (ranks.reduce((a, b) => a + b, 0) / ranks.length).toFixed(1) : 'N/A';

  const totalCitations = extractedResults.reduce((sum, r) => sum + r.citation_summary.total_citations, 0);
  const brandCitations = extractedResults.reduce((sum, r) => sum + r.citation_summary.target_brand_citations, 0);

  const aggregateOutput = {
    pipeline_version: '1.0.0-phase1',
    execution_timestamp: new Date().toISOString(),
    tenant_id: SAMPLE_BRAND_CONFIG.tenant_id,
    target_brand: SAMPLE_BRAND_CONFIG.name,
    target_primary_domain: SAMPLE_BRAND_CONFIG.primary_domain,
    query_analyzed: SIMULATED_SEARCH_RESPONSES[0].query,
    aggregated_benchmark: {
      total_engines_tested: totalEngines,
      brand_presence_rate_pct: parseFloat(((enginesPresent / totalEngines) * 100).toFixed(2)),
      average_recommendation_rank: avgRank,
      average_share_of_voice_pct: parseFloat(avgSov.toFixed(2)),
      total_citations_analyzed: totalCitations,
      brand_direct_citations_count: brandCitations,
      brand_domain_citation_rate_pct: parseFloat(((brandCitations / Math.max(1, totalCitations)) * 100).toFixed(2))
    },
    engine_extractions: extractedResults
  };

  // Destination artifact paths
  const targetArtifactDir = path.resolve('C:\\Users\\Cam\\.gemini\\antigravity\\brain\\59a7fb79-0d58-49d6-9882-25320d478199');
  const targetArtifactFile = path.join(targetArtifactDir, 'aio_metrics_extracted.json');

  if (!fs.existsSync(targetArtifactDir)) {
    fs.mkdirSync(targetArtifactDir, { recursive: true });
  }

  fs.writeFileSync(targetArtifactFile, JSON.stringify(aggregateOutput, null, 2), 'utf-8');
  console.log(`\n💾 Successfully wrote output JSON Artifact to:`);
  console.log(`   ${targetArtifactFile}`);

  // Also save a local copy in project for reference
  const localDir = path.resolve('./output');
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
  fs.writeFileSync(path.join(localDir, 'aio_metrics_extracted.json'), JSON.stringify(aggregateOutput, null, 2), 'utf-8');
  console.log(`   ${path.join(localDir, 'aio_metrics_extracted.json')}\n`);
}

runExtractionPipeline().catch(err => {
  console.error('Extraction pipeline failed:', err);
  process.exit(1);
});
