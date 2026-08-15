import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { promptService, DEFAULT_PROMPT_TEMPLATES } from '../src/lib/services/prompt-service';
import { GeminiTrackingService } from '../src/lib/services/gemini-tracking-service';

async function verifyPromptManagementSystem() {
  console.log('===============================================================');
  console.log('🧪 VERIFYING DYNAMIC AI PROMPT MANAGEMENT ARCHITECTURE');
  console.log('===============================================================\n');

  let passedTests = 0;
  const totalTests = 4;

  // -------------------------------------------------------------
  // Test 1: Prompt Retrieval & Variable Interpolation
  // -------------------------------------------------------------
  console.log('▶ [TEST 1] Testing Prompt Retrieval & Variable Interpolation:');
  const variables = {
    query: 'What are the best enterprise marketing analytics platforms?',
    brandName: 'Acme Enterprise',
    brandDomain: 'acme.io',
    brandAliases: ['Acme Global', 'Acme Insights'],
    competitors: ['Competitor Alpha', 'Competitor Beta'],
  };

  const renderedPrompt = await promptService.getPrompt('gemini_citation_extraction', variables);
  console.log('   - Rendered Prompt Snippet:');
  console.log('     ' + renderedPrompt.split('\n').slice(0, 5).join('\n     '));

  const hasQuery = renderedPrompt.includes('What are the best enterprise marketing analytics platforms?');
  const hasBrand = renderedPrompt.includes('Primary Target Brand: "Acme Enterprise" (Domain: acme.io, Brand Aliases/Products: Acme Global, Acme Insights)');
  const hasCompetitors = renderedPrompt.includes('Tracked Competitors: Competitor Alpha, Competitor Beta');

  if (hasQuery && hasBrand && hasCompetitors) {
    console.log('   ✅ TEST 1 PASSED: Variable interpolation rendered all target placeholders correctly.\n');
    passedTests++;
  } else {
    console.error('   ❌ TEST 1 FAILED: Missing interpolated variables in prompt output.\n');
  }

  // -------------------------------------------------------------
  // Test 2: In-Memory Caching & Instant Cache Invalidation
  // -------------------------------------------------------------
  console.log('▶ [TEST 2] Testing Dynamic Prompt Updates & Cache Invalidation:');
  const customPromptText = `You are an AI Search Overview evaluator customized for {{brandName}}.
Search Query: {{query}}
Target Domain: {{brandDomain}}
Competitors: {{competitors}}
Analyze brand presence score and extracted citations.`;

  await promptService.updatePrompt('gemini_citation_extraction', {
    prompt_text: customPromptText,
    model_target: 'gemini-2.0-flash',
  });

  const updatedRendered = await promptService.getPrompt('gemini_citation_extraction', {
    query: 'best CRM solutions',
    brandName: 'Nike',
    brandDomain: 'nike.com',
    competitors: ['Adidas', 'Puma'],
  });

  const isCustomized = updatedRendered.includes('You are an AI Search Overview evaluator customized for Nike.');
  if (isCustomized) {
    console.log('   - Updated Rendered Output:');
    console.log('     ' + updatedRendered.split('\n').slice(0, 4).join('\n     '));
    console.log('   ✅ TEST 2 PASSED: Dynamic prompt update took effect instantly via in-memory cache invalidation.\n');
    passedTests++;
  } else {
    console.error('   ❌ TEST 2 FAILED: Updated prompt text was not reflected in cache.\n');
  }

  // Restore factory default for citation extraction
  await promptService.updatePrompt('gemini_citation_extraction', {
    prompt_text: DEFAULT_PROMPT_TEMPLATES.gemini_citation_extraction.prompt_text,
    model_target: DEFAULT_PROMPT_TEMPLATES.gemini_citation_extraction.model_target,
  });

  // -------------------------------------------------------------
  // Test 3: Safe Fallback for Unregistered Prompt Keys
  // -------------------------------------------------------------
  console.log('▶ [TEST 3] Testing Safe Fallback on Unregistered Prompt Keys:');
  const fallbackPrompt = await promptService.getPrompt('unknown_custom_key_123', {
    query: 'test fallback query',
    brandName: 'FallbackBrand',
  });

  const hasFallbackContent = fallbackPrompt.includes('FallbackBrand') && fallbackPrompt.includes('test fallback query');
  if (hasFallbackContent) {
    console.log('   - Fallback Output: ' + fallbackPrompt);
    console.log('   ✅ TEST 3 PASSED: Graceful fallback ensures tracking never throws on missing keys.\n');
    passedTests++;
  } else {
    console.error('   ❌ TEST 3 FAILED: Fallback prompt did not generate expected text.\n');
  }

  // -------------------------------------------------------------
  // Test 4: End-to-End Tracking Pipeline Integration
  // -------------------------------------------------------------
  console.log('▶ [TEST 4] Testing Tracking Service Integration with Dynamic Prompts:');
  const trackingService = new GeminiTrackingService();
  const execResult = await trackingService.executeAIOQuery({
    query: 'What are the top enterprise AIO platforms in 2026?',
    brandName: 'Acme Corp',
    brandDomain: 'acmecorp.com',
    brandAliases: ['Acme Analytics'],
    competitors: ['Competitor One', 'Competitor Two'],
  });

  console.log('   - Model Version Used: ' + execResult.modelVersion);
  console.log('   - Extracted Mentions Count: ' + execResult.data.mentions.length);
  console.log('   - Primary Brand Mentioned: ' + execResult.data.primary_brand_mentioned);
  console.log('   - Citations Count: ' + execResult.data.citations.length);

  if (execResult.data && execResult.data.mentions.length > 0 && execResult.data.citations.length > 0) {
    console.log('   ✅ TEST 4 PASSED: Tracking service successfully executes with dynamically loaded prompt.\n');
    passedTests++;
  } else {
    console.error('   ❌ TEST 4 FAILED: Tracking execution returned invalid data.\n');
  }

  console.log('===============================================================');
  console.log(`🎯 OVERALL RESULT: ${passedTests} / ${totalTests} TEST SUITES PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('===============================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

verifyPromptManagementSystem().catch((err) => {
  console.error('Fatal error verifying prompt management:', err);
  process.exit(1);
});
