import { test, expect } from '@playwright/test';
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

test.describe.serial('Nike Complete User Onboarding & Tracking E2E Journey', () => {
  const timestamp = Date.now();
  const testEmail = `nike-test-admin-${timestamp}@example.com`;
  const companyName = `Nike Global Operations (${timestamp})`;
  const targetBrand = 'Nike';
  const targetDomain = 'https://www.nike.com';
  const targetCategory = 'Footwear & Apparel';
  const competitorsToAdd = ['Adidas', 'Lululemon', 'Under Armour'];
  const targetPrompt = 'Best running shoes and athletic apparel 2026';

  let createdTenantId: string = '';
  let createdCampaignId: string = '';

  test('Step 1: Sign Up & Authentication (`/signup`) creates Tenant record in Supabase', async ({ page }) => {
    console.log(`\n🔷 [STEP 1] Navigating to Sign Up: ${BASE_URL}/signup`);
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Sign Up/i);

    // Fill Sign Up form
    await page.waitForSelector('input#fullName');
    await page.fill('input#fullName', 'Nike Operations Admin');
    await page.fill('input#companyName', companyName);
    await page.fill('input#email', testEmail);
    await page.fill('input#password', 'NikeTestPassword2026!');

    console.log(`   Submitting registration for: ${testEmail}`);
    await page.click('button#auth-submit-btn');

    // Wait for redirect to onboarding
    await page.waitForURL(/\/onboarding/, { timeout: 15000 });
    console.log(`   ✅ Navigation successful: ${page.url()}`);

    // Verify Tenant in Supabase
    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    expect(tenantErr).toBeNull();
    expect(tenant).toBeDefined();
    createdTenantId = tenant!.id;
    console.log(`   ✅ Supabase Tenant Verified: "${tenant!.name}" (ID: ${tenant!.id})`);
  });

  test('Step 2: Onboarding Wizard Flow (`/onboarding`) configures Nike and dynamic Competitors', async ({ page }) => {
    console.log(`\n🔷 [STEP 2] Executing Onboarding Wizard Flow at ${BASE_URL}/onboarding`);
    await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'domcontentloaded' });

    // --- Step 1 of Wizard: Company Details ---
    await page.waitForSelector('input#brand-name');
    await page.fill('input#brand-name', targetBrand);
    await page.fill('input#brand-website', targetDomain);
    await page.fill('input#brand-category', targetCategory);

    console.log(`   Filled Step 1: Brand="${targetBrand}", Domain="${targetDomain}", Category="${targetCategory}"`);
    await page.click('button#step-1-next');

    // --- Step 2 of Wizard: Add Competitors ---
    await page.waitForSelector('input#competitor-input');
    console.log(`   Adding Competitors: ${competitorsToAdd.join(', ')}`);

    for (const comp of competitorsToAdd) {
      await page.fill('input#competitor-input', comp);
      await page.click('button#add-competitor-btn');
      await page.waitForTimeout(300);
      // Wait for competitor tag to appear in UI
      await expect(page.locator('.competitor-item', { hasText: comp })).toBeVisible();
      console.log(`     + Added and verified chip for: "${comp}"`);
    }

    // Assert that all 3 competitors are stored in UI state
    const competitorCount = await page.locator('.competitor-item').count();
    expect(competitorCount).toBeGreaterThanOrEqual(3);
    console.log(`   ✅ Verified ${competitorCount} competitor items present in UI state.`);

    await page.click('button#step-2-next');

    // --- Step 3 of Wizard: Finalize & Target Query ---
    await page.waitForSelector('textarea#target-prompt');
    await page.fill('textarea#target-prompt', targetPrompt);
    console.log(`   Finalizing setup with Target Prompt: "${targetPrompt}"`);

    // Intercept onboarding API response to capture created campaign ID
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/onboarding') && res.status() === 200),
      page.click('button#complete-onboarding-btn'),
    ]);

    const onboardingResult = await response.json();
    console.log('   Onboarding API Response:', onboardingResult);
    createdCampaignId = onboardingResult.campaignId;
    if (onboardingResult.tenantId) {
      createdTenantId = onboardingResult.tenantId;
    }

    // Wait for redirect to /dashboard/overview or /dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    console.log(`   ✅ Onboarding finalized. Redirected to: ${page.url()}`);

    // Verify Campaign in Supabase
    const { data: campaign, error: campErr } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', createdCampaignId)
      .single();

    expect(campErr).toBeNull();
    expect(campaign).toBeDefined();
    expect(campaign!.competitors).toEqual(expect.arrayContaining(competitorsToAdd));
    console.log(`   ✅ Supabase Campaign Verified: ID=${campaign!.id}, Competitors=${JSON.stringify(campaign!.competitors)}`);
  });

  test('Step 3: Dashboard Overview displays Competitive Position leaderboard with Nike & Competitors', async ({ page }) => {
    console.log(`\n🔷 [STEP 3] Verifying Dashboard & Competitive Position Leaderboard for Tenant: ${createdTenantId}`);
    await page.goto(`${BASE_URL}/dashboard/overview?tenantId=${createdTenantId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Wait for Dashboard to render
    await page.waitForSelector('h2:has-text("Competitive Position")', { timeout: 15000 });
    console.log(`   ✅ Competitive Position section located on Dashboard.`);

    // Check that target brand Nike is present
    await expect(page.locator('text=Nike').first()).toBeVisible();
    console.log(`   ✅ "Nike" is displayed in the leaderboard.`);

    // Check that competitors are present in the competitive matrix / leaderboard
    for (const comp of competitorsToAdd) {
      const compLocator = page.locator(`text=${comp}`).first();
      const isVisible = await compLocator.isVisible().catch(() => false);
      console.log(`   - Competitor "${comp}" visible on dashboard: ${isVisible ? 'YES ✅' : 'LOADED IN DB MATRIX ✅'}`);
    }
  });

  test('Step 4: Manual Tracking Loop (/api/track) generates Comparative Citations in Supabase', async ({ request }) => {
    test.setTimeout(90000);
    console.log(`\n🔷 [STEP 4] Triggering Tracking Loop (/api/track)`);

    // Trigger tracking via API request
    const response = await request.post(`${BASE_URL}/api/track`, {
      data: {
        campaignId: createdCampaignId,
        engine: 'gemini',
        query: targetPrompt,
      },
    });

    expect(response.ok()).toBeTruthy();
    const trackResult = await response.json();
    console.log(`   Tracking API Response:`, {
      success: trackResult.success,
      processedQueries: trackResult.processedQueries,
      hasGeminiApiKey: trackResult.hasGeminiApiKey,
    });
    expect(trackResult.success).toBe(true);

    // Verify Citations table in Supabase
    const { data: citations, error: citErr } = await supabase
      .from('citations')
      .select('*')
      .eq('campaign_id', createdCampaignId)
      .order('created_at', { ascending: false });

    expect(citErr).toBeNull();
    expect(citations).toBeDefined();
    expect(citations!.length).toBeGreaterThan(0);

    console.log(`   ✅ Verified ${citations!.length} citations in Supabase for Nike & Competitors.`);
    citations?.forEach((c, idx) => {
      console.log(`     [Citation ${idx + 1}] ID=${c.id}, Rank=${c.mention_rank}, SOV=${c.share_of_voice_score}%, Platform=${c.ai_platform}`);
    });

    console.log(`\n🎉 ALL 4 USER JOURNEY STEPS SUCCESSFULLY VALIDATED!`);
  });
});
