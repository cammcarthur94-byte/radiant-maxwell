/**
 * Verification Script: Financial Unit Economics & Tier Synchronizations
 *
 * Validates:
 * 1. Fixed infrastructure overhead allocations ($75/mo total).
 * 2. Variable model query economics ($0.015/query across 4 runs/mo).
 * 3. Exact tier costs, gross margins, and percentage outputs.
 * 4. Runtime configurations in `src/lib/stripe.ts` and `src/lib/subscription-limits.ts`.
 */

import { STRIPE_PLANS } from '../src/lib/stripe';
import { TIER_LIMITS } from '../src/lib/subscription-limits';

interface TierFinancialSpec {
  tierKey: 'starter' | 'growth' | 'enterprise';
  displayName: string;
  monthlyPrice: number;
  annualPrice: number;
  campaigns: number;
  prompts: number;
  models: number;
  runsPerMonth: number;
  costPerQuery: number;
  allocatedFixedOverhead: number;
  expectedVariableCost: number;
  expectedTotalCost: number;
  expectedGrossMarginDollars: number;
  expectedGrossMarginPercent: number;
}

const FINANCIAL_SPECS: TierFinancialSpec[] = [
  {
    tierKey: 'starter',
    displayName: 'Starter',
    monthlyPrice: 79,
    annualPrice: 63,
    campaigns: 1,
    prompts: 50,
    models: 4,
    runsPerMonth: 4,
    costPerQuery: 0.015,
    allocatedFixedOverhead: 15,
    expectedVariableCost: 12, // 50 * 4 * 4 * 0.015 = 12
    expectedTotalCost: 27, // 12 + 15 = 27
    expectedGrossMarginDollars: 52, // 79 - 27 = 52
    expectedGrossMarginPercent: 65.8, // 52 / 79 = ~65.82%
  },
  {
    tierKey: 'growth',
    displayName: 'Growth',
    monthlyPrice: 199,
    annualPrice: 159,
    campaigns: 5,
    prompts: 250,
    models: 6,
    runsPerMonth: 4,
    costPerQuery: 0.015,
    allocatedFixedOverhead: 25,
    expectedVariableCost: 90, // 250 * 6 * 4 * 0.015 = 90
    expectedTotalCost: 115, // 90 + 25 = 115
    expectedGrossMarginDollars: 84, // 199 - 115 = 84
    expectedGrossMarginPercent: 42.2, // 84 / 199 = ~42.21%
  },
  {
    tierKey: 'enterprise',
    displayName: 'Agency Pro',
    monthlyPrice: 499,
    annualPrice: 399,
    campaigns: 20,
    prompts: 1000,
    models: 6,
    runsPerMonth: 4,
    costPerQuery: 0.015,
    allocatedFixedOverhead: 35,
    expectedVariableCost: 360, // 1000 * 6 * 4 * 0.015 = 360
    expectedTotalCost: 395, // 360 + 35 = 395
    expectedGrossMarginDollars: 104, // 499 - 395 = 104
    expectedGrossMarginPercent: 20.8, // 104 / 499 = ~20.84%
  },
];

function runVerification() {
  console.log('================================================================');
  console.log(' RADIANT MAXWELL - FINANCIAL & TIER LIMIT VERIFICATION SUITE');
  console.log('================================================================\n');

  let hasError = false;

  // 1. Verify Fixed Infrastructure Breakdown
  const fixedComponents = {
    vercelPro: 20,
    supabasePro: 25,
    devAndMonitoring: 30,
  };
  const totalBaselineOverhead = Object.values(fixedComponents).reduce((a, b) => a + b, 0);

  console.log('--- 1. Infrastructure Baseline Overhead ---');
  console.log(` Vercel Pro:             $${fixedComponents.vercelPro}/mo`);
  console.log(` Supabase Pro:           $${fixedComponents.supabasePro}/mo`);
  console.log(` Dev & Monitoring:       $${fixedComponents.devAndMonitoring}/mo`);
  console.log(` Total Baseline:         $${totalBaselineOverhead}/mo`);

  if (totalBaselineOverhead !== 75) {
    console.error(`❌ Total fixed overhead mismatch! Expected $75, got $${totalBaselineOverhead}`);
    hasError = true;
  } else {
    console.log('✅ Baseline infrastructure overhead matches $75/mo target.\n');
  }

  // 2. Verify Fixed Overhead Tier Allocation Sum
  const totalAllocatedOverhead = FINANCIAL_SPECS.reduce((sum, spec) => sum + spec.allocatedFixedOverhead, 0);
  console.log('--- 2. Overhead Allocation Across Tiers ---');
  console.log(` Starter Overhead:       $${FINANCIAL_SPECS[0].allocatedFixedOverhead}/mo`);
  console.log(` Growth Overhead:        $${FINANCIAL_SPECS[1].allocatedFixedOverhead}/mo`);
  console.log(` Agency Pro Overhead:    $${FINANCIAL_SPECS[2].allocatedFixedOverhead}/mo`);
  console.log(` Sum of Tier Overhead:   $${totalAllocatedOverhead}/mo`);

  if (totalAllocatedOverhead !== 75) {
    console.error(`❌ Sum of allocated overhead must equal $75 baseline. Got $${totalAllocatedOverhead}`);
    hasError = true;
  } else {
    console.log('✅ Allocated overhead completely absorbs the $75/mo fixed baseline.\n');
  }

  // 3. Verify Tier Economics and Formulas
  console.log('--- 3. Tier Financial Modeling & Unit Economics ---');
  for (const spec of FINANCIAL_SPECS) {
    const totalMonthlyQueries = spec.prompts * spec.models * spec.runsPerMonth;
    const calculatedVariableCost = totalMonthlyQueries * spec.costPerQuery;
    const calculatedTotalCost = calculatedVariableCost + spec.allocatedFixedOverhead;
    const calculatedMarginDollars = spec.monthlyPrice - calculatedTotalCost;
    const calculatedMarginPercent = (calculatedMarginDollars / spec.monthlyPrice) * 100;

    console.log(`\n[${spec.displayName} Tier - $${spec.monthlyPrice}/mo]`);
    console.log(`  Campaigns: ${spec.campaigns} | Prompts: ${spec.prompts} | Models: ${spec.models} | Runs/Mo: ${spec.runsPerMonth}`);
    console.log(`  Total Monthly Queries: ${totalMonthlyQueries}`);
    console.log(`  Variable LLM Cost: $${calculatedVariableCost.toFixed(2)} (Target: $${spec.expectedVariableCost})`);
    console.log(`  Allocated Overhead: $${spec.allocatedFixedOverhead.toFixed(2)}`);
    console.log(`  Total Monthly Cost: $${calculatedTotalCost.toFixed(2)} (Target: $${spec.expectedTotalCost})`);
    console.log(`  Gross Margin: +$${calculatedMarginDollars.toFixed(2)} / ${calculatedMarginPercent.toFixed(1)}%`);

    if (Math.abs(calculatedVariableCost - spec.expectedVariableCost) > 0.01) {
      console.error(`❌ Variable cost mismatch for ${spec.displayName}!`);
      hasError = true;
    }
    if (Math.abs(calculatedTotalCost - spec.expectedTotalCost) > 0.01) {
      console.error(`❌ Total cost mismatch for ${spec.displayName}!`);
      hasError = true;
    }
    if (Math.abs(calculatedMarginDollars - spec.expectedGrossMarginDollars) > 0.01) {
      console.error(`❌ Gross margin dollars mismatch for ${spec.displayName}!`);
      hasError = true;
    }
    if (Math.abs(calculatedMarginPercent - spec.expectedGrossMarginPercent) > 0.1) {
      console.error(`❌ Margin percent mismatch for ${spec.displayName}!`);
      hasError = true;
    }
  }

  // 4. Verify Stripe Plans & Subscription Limits Codebase Alignment
  console.log('\n--- 4. Codebase Runtime Configuration Alignment ---');
  for (const spec of FINANCIAL_SPECS) {
    const stripePlan = STRIPE_PLANS[spec.tierKey];
    const tierLimit = TIER_LIMITS[spec.tierKey];

    if (!stripePlan) {
      console.error(`❌ Missing STRIPE_PLANS entry for ${spec.tierKey}`);
      hasError = true;
      continue;
    }

    if (!tierLimit) {
      console.error(`❌ Missing TIER_LIMITS entry for ${spec.tierKey}`);
      hasError = true;
      continue;
    }

    if (stripePlan.price !== spec.monthlyPrice) {
      console.error(`❌ Stripe price mismatch for ${spec.tierKey}: code=${stripePlan.price}, expected=${spec.monthlyPrice}`);
      hasError = true;
    }

    if (stripePlan.maxCampaigns !== spec.campaigns) {
      console.error(`❌ Stripe maxCampaigns mismatch for ${spec.tierKey}: code=${stripePlan.maxCampaigns}, expected=${spec.campaigns}`);
      hasError = true;
    }

    if (tierLimit.maxCampaigns !== spec.campaigns) {
      console.error(`❌ TIER_LIMITS maxCampaigns mismatch for ${spec.tierKey}: code=${tierLimit.maxCampaigns}, expected=${spec.campaigns}`);
      hasError = true;
    }

    if (tierLimit.maxDailyPrompts !== spec.prompts && tierLimit.maxTrackedPrompts !== spec.prompts) {
      console.error(`❌ TIER_LIMITS prompt quota mismatch for ${spec.tierKey}`);
      hasError = true;
    }

    console.log(`✅ ${spec.displayName}: Codebase configs (Stripe & Limits) match financial specification.`);
  }

  console.log('\n================================================================');
  if (hasError) {
    console.error('❌ Verification FAILED with errors.');
    process.exit(1);
  } else {
    console.log('✅ ALL MARGIN CALCULATIONS & TIER CONFIGURATIONS VERIFIED.');
    console.log('================================================================');
  }
}

runVerification();
