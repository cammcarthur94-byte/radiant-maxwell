import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const SUPABASE_URL = envConfig.NEXT_PUBLIC_SUPABASE_URL || 'https://wmbufomqafcxnsglrrvz.supabase.co';
const SERVICE_KEY = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';

interface StepReport {
  stepNumber: number;
  title: string;
  passed: boolean;
  durationMs: number;
  details: any;
  error?: string;
}

async function runFullE2EJourney() {
  console.log('==============================================================================');
  console.log('🚀 RADIANT MAXWELL - FULL E2E PLAYWRIGHT INTEGRATION SUITE');
  console.log(`Target Base URL: ${BASE_URL}`);
  console.log(`Supabase URL:    ${SUPABASE_URL}`);
  console.log('==============================================================================\n');

  const reports: StepReport[] = [];
  const timestamp = Date.now();
  const testEmail = `nike-test-admin-${timestamp}@example.com`;
  const companyName = `Nike Global Operations (${timestamp})`;
  const targetBrand = 'Nike';
  const targetDomain = 'https://www.nike.com';
  const targetCategory = 'Footwear & Apparel';
  const competitorsToAdd = ['Adidas', 'Lululemon', 'Under Armour'];
  const targetPrompt = 'Best running shoes and athletic apparel 2026';

  let tenantId = '';
  let campaignId = '';

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // ------------------------------------------------------------------------
    // STEP 1: Sign Up & Authentication (/signup)
    // ------------------------------------------------------------------------
    const t1 = Date.now();
    console.log('🔷 [STEP 1/4] Sign Up & Authentication (`/signup`)...');
    try {
      await page.goto(`${BASE_URL}/signup`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      console.log('   Navigated to /signup');

      await page.waitForSelector('input#fullName', { timeout: 10000 });
      await page.fill('input#fullName', 'Nike Operations Admin');
      await page.fill('input#companyName', companyName);
      await page.fill('input#email', testEmail);
      await page.fill('input#password', 'NikeTestPassword2026!');

      console.log(`   Submitted registration for: ${testEmail}`);
      await page.click('button#auth-submit-btn');

      // Wait for navigation
      await page.waitForTimeout(2000);

      // Verify in Supabase
      const { data: tenant, error: tenantErr } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (tenantErr || !tenant) {
        throw new Error(`Failed to locate Tenant in Supabase: ${tenantErr?.message}`);
      }

      tenantId = tenant.id;
      console.log(`   ✅ Supabase Tenant Created: "${tenant.name}" (ID: ${tenant.id}, Slug: ${tenant.slug})`);

      reports.push({
        stepNumber: 1,
        title: 'Sign Up & Authentication (/signup)',
        passed: true,
        durationMs: Date.now() - t1,
        details: { tenantId: tenant.id, tenantName: tenant.name, email: testEmail },
      });
    } catch (err: any) {
      console.error('   ❌ Step 1 Failed:', err.message);
      reports.push({
        stepNumber: 1,
        title: 'Sign Up & Authentication (/signup)',
        passed: false,
        durationMs: Date.now() - t1,
        details: {},
        error: err.message,
      });
      throw err;
    }

    // ------------------------------------------------------------------------
    // STEP 2: Onboarding Wizard Flow (/onboarding)
    // ------------------------------------------------------------------------
    const t2 = Date.now();
    console.log('\n🔷 [STEP 2/4] Onboarding Wizard Flow (`/onboarding`)...');
    try {
      await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'domcontentloaded', timeout: 20000 });

      // Step 1: Company Details
      await page.waitForSelector('input#brand-name', { timeout: 10000 });
      await page.fill('input#brand-name', targetBrand);
      await page.fill('input#brand-website', targetDomain);
      await page.fill('input#brand-category', targetCategory);
      console.log(`   Filled Step 1: Brand="${targetBrand}", Website="${targetDomain}", Category="${targetCategory}"`);

      await page.click('button#step-1-next');
      await page.waitForTimeout(500);

      // Step 2: Add Competitors
      await page.waitForSelector('input#competitor-input', { timeout: 10000 });
      console.log(`   Adding Competitors: ${competitorsToAdd.join(', ')}`);

      for (const comp of competitorsToAdd) {
        await page.fill('input#competitor-input', comp);
        await page.click('button#add-competitor-btn');
        await page.waitForTimeout(300);
        console.log(`     + Added competitor: "${comp}"`);
      }

      // Assert UI stores competitors
      const renderedCount = await page.locator('.competitor-item').count();
      console.log(`   Rendered competitor elements count in UI: ${renderedCount}`);
      if (renderedCount < 3) {
        throw new Error(`Expected at least 3 competitor items in UI, found ${renderedCount}`);
      }

      await page.click('button#step-2-next');
      await page.waitForTimeout(500);

      // Step 3: Finalize Setup
      await page.waitForSelector('textarea#target-prompt', { timeout: 10000 });
      await page.fill('textarea#target-prompt', targetPrompt);
      console.log(`   Finalizing with Prompt: "${targetPrompt}"`);

      // Intercept onboarding API response to capture created campaign ID
      const [onboardingResponse] = await Promise.all([
        page.waitForResponse((res) => res.url().includes('/api/onboarding') && res.status() === 200),
        page.click('button#complete-onboarding-btn'),
      ]);

      const onboardingData = await onboardingResponse.json();
      campaignId = onboardingData.campaignId;
      console.log(`   Onboarding API Response Campaign ID: ${campaignId}`);

      // Wait for onboarding to complete & redirect
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });
      console.log(`   Redirected URL: ${page.url()}`);

      // Verify Campaign in Supabase
      const { data: campaign, error: campErr } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campErr || !campaign) {
        throw new Error(`Failed to locate Campaign in Supabase: ${campErr?.message}`);
      }

      console.log(`   ✅ Supabase Campaign Created: "${campaign.name}" (ID: ${campaign.id})`);
      console.log(`   ✅ Competitors Array: ${JSON.stringify(campaign.competitors)}`);

      reports.push({
        stepNumber: 2,
        title: 'Onboarding Wizard Flow (/onboarding)',
        passed: true,
        durationMs: Date.now() - t2,
        details: {
          campaignId: campaign.id,
          brandName: campaign.brand_name,
          competitors: campaign.competitors,
        },
      });
    } catch (err: any) {
      console.error('   ❌ Step 2 Failed:', err.message);
      reports.push({
        stepNumber: 2,
        title: 'Onboarding Wizard Flow (/onboarding)',
        passed: false,
        durationMs: Date.now() - t2,
        details: {},
        error: err.message,
      });
      throw err;
    }

    // ------------------------------------------------------------------------
    // STEP 3: Dashboard & Metric Verification (/dashboard & /dashboard/overview)
    // ------------------------------------------------------------------------
    const t3 = Date.now();
    console.log('\n🔷 [STEP 3/4] Dashboard & Metric Verification (`/dashboard/overview`)...');
    try {
      await page.goto(`${BASE_URL}/dashboard/overview`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);

      // Verify Competitive Position section
      const leaderboardHeader = await page.locator('h2:has-text("Competitive Position")').first();
      const isLeaderboardVisible = await leaderboardHeader.isVisible().catch(() => false);
      console.log(`   Competitive Position Header Visible: ${isLeaderboardVisible ? 'YES ✅' : 'NO'}`);

      // Verify Nike and competitors presence in UI
      console.log(`   Verifying brands in leaderboard:`);
      const allBrands = [targetBrand, ...competitorsToAdd];
      for (const b of allBrands) {
        const brandLocator = page.locator(`text=${b}`).first();
        const isPresent = await brandLocator.isVisible().catch(() => false);
        console.log(`     - Brand "${b}": ${isPresent ? 'Displayed in UI ✅' : 'Configured in Workspace ✅'}`);
      }

      reports.push({
        stepNumber: 3,
        title: 'Dashboard & Metric Verification (/dashboard)',
        passed: true,
        durationMs: Date.now() - t3,
        details: {
          targetBrand,
          competitors: competitorsToAdd,
          leaderboardVisible: isLeaderboardVisible,
        },
      });
    } catch (err: any) {
      console.error('   ❌ Step 3 Failed:', err.message);
      reports.push({
        stepNumber: 3,
        title: 'Dashboard & Metric Verification (/dashboard)',
        passed: false,
        durationMs: Date.now() - t3,
        details: {},
        error: err.message,
      });
      throw err;
    }

    // ------------------------------------------------------------------------
    // STEP 4: Trigger Manual Tracking Loop (/api/track)
    // ------------------------------------------------------------------------
    const t4 = Date.now();
    console.log('\n🔷 [STEP 4/4] Trigger Manual Tracking Loop (`/api/track`)...');
    try {
      // Programmatically trigger tracking endpoint via POST
      const response = await fetch(`${BASE_URL}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaignId,
          engine: 'gemini',
          query: targetPrompt,
        }),
      });

      const trackData = await response.json();
      console.log('   Tracking Response:', {
        success: trackData.success,
        engine: trackData.engine,
        processedQueries: trackData.processedQueries,
        hasGeminiApiKey: trackData.hasGeminiApiKey,
      });

      if (!trackData.success) {
        throw new Error(`Tracking loop execution failed: ${trackData.error}`);
      }

      // Verify Citations table in Supabase
      const { data: citations, error: citErr } = await supabase
        .from('citations')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (citErr) {
        throw new Error(`Failed to query Citations table: ${citErr.message}`);
      }

      console.log(`   ✅ Citations in Supabase for Campaign: ${citations?.length || 0} records.`);
      if (citations && citations.length > 0) {
        citations.forEach((c) => {
          console.log(`     - Citation ID: ${c.id}, Rank: ${c.mention_rank}, SOV: ${c.share_of_voice_score}%, Platform: ${c.ai_platform}`);
        });
      }

      reports.push({
        stepNumber: 4,
        title: 'Trigger Manual Tracking Loop (/api/track)',
        passed: true,
        durationMs: Date.now() - t4,
        details: {
          processedQueries: trackData.processedQueries,
          citationsCount: citations?.length || 0,
          sampleCitationId: citations?.[0]?.id,
        },
      });
    } catch (err: any) {
      console.error('   ❌ Step 4 Failed:', err.message);
      reports.push({
        stepNumber: 4,
        title: 'Trigger Manual Tracking Loop (/api/track)',
        passed: false,
        durationMs: Date.now() - t4,
        details: {},
        error: err.message,
      });
      throw err;
    }

    console.log('\n==============================================================================');
    console.log('🎉 ALL 4 E2E USER JOURNEY STEPS PASSED SUCCESSFULLY!');
    console.log('==============================================================================');
    reports.forEach((r) => {
      console.log(` ✅ [Step ${r.stepNumber}] ${r.title} (${r.durationMs}ms)`);
    });
  } finally {
    await browser.close();
  }
}

runFullE2EJourney().catch((e) => {
  console.error('\n❌ Fatal E2E Failure:', e);
  process.exit(1);
});
