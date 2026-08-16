import Stripe from 'stripe';

export type StripeTier = 'starter' | 'growth' | 'enterprise';

export interface PlanConfig {
  name: string;
  priceId: string;
  priceIdAnnual?: string;
  price: number;
  annualPrice: number;
  tier: StripeTier;
  maxCampaigns: number;
  maxPrompts: number;
  maxCompetitors: number;
  modelsCount: number;
  modelsDescription: string;
  runFrequency: string;
  estimatedCostMonthly: number;
  allocatedOverhead: number;
  variableCost: number;
  grossMarginMonthly: number;
  grossMarginPercent: number;
  description: string;
  features: string[];
}

export const STRIPE_PLANS: Record<string, PlanConfig> = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_79_monthly',
    priceIdAnnual: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || 'price_starter_63_annual',
    price: 79,
    annualPrice: 63,
    tier: 'starter',
    maxCampaigns: 1,
    maxPrompts: 50,
    maxCompetitors: 3,
    modelsCount: 4,
    modelsDescription: '4 Models (Gemini Flash, GPT-4o-mini, Perplexity Sonar, Claude Haiku)',
    runFrequency: 'Weekly scheduled runs (4x / month)',
    variableCost: 12,
    allocatedOverhead: 15,
    estimatedCostMonthly: 27,
    grossMarginMonthly: 52,
    grossMarginPercent: 65.8,
    description: 'Essential multi-engine AI visibility and citation tracking for single-brand marketers.',
    features: [
      '1 Brand Campaign',
      '50 Prompts Tracked',
      '4 Core LLMs (Gemini, ChatGPT, Perplexity, Claude)',
      'Weekly Automated Tracking Runs (4x/mo)',
      'Up to 3 Competitors Monitored',
      'Weekly Email Intelligence Digest',
    ],
  },
  growth: {
    name: 'Growth',
    priceId: process.env.STRIPE_GROWTH_PRICE_ID || 'price_growth_199_monthly',
    priceIdAnnual: process.env.STRIPE_GROWTH_ANNUAL_PRICE_ID || 'price_growth_159_annual',
    price: 199,
    annualPrice: 159,
    tier: 'growth',
    maxCampaigns: 5,
    maxPrompts: 250,
    maxCompetitors: 10,
    modelsCount: 6,
    modelsDescription: '6 Models (Adds GPT-4o & Claude 3.5 Sonnet)',
    runFrequency: 'Weekly scheduled runs (4x / month)',
    variableCost: 90,
    allocatedOverhead: 25,
    estimatedCostMonthly: 115,
    grossMarginMonthly: 84,
    grossMarginPercent: 42.2,
    description: 'Advanced multi-engine Share of Voice, competitor gap analysis, and GEO optimization.',
    features: [
      '5 Brand Campaigns',
      '250 Prompts Tracked',
      '6 Top-Tier LLMs (+ GPT-4o & Claude Sonnet)',
      'Weekly Automated Tracking Runs (4x/mo)',
      'Up to 10 Competitors Monitored',
      'GEO Optimizer Engine Synchronization',
      'Automated Citation & Anomaly Alerts',
      'CSV & PDF Executive Report Export',
    ],
  },
  enterprise: {
    name: 'Agency Pro',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || process.env.STRIPE_AGENCY_PRICE_ID || 'price_agency_499_monthly',
    priceIdAnnual: process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID || 'price_agency_399_annual',
    price: 499,
    annualPrice: 399,
    tier: 'enterprise',
    maxCampaigns: 20,
    maxPrompts: 1000,
    maxCompetitors: 50,
    modelsCount: 6,
    modelsDescription: '6 Models + Custom Fine-Tuned LLM Endpoints',
    runFrequency: 'Priority Weekly Runs & On-Demand Triggers',
    variableCost: 360,
    allocatedOverhead: 35,
    estimatedCostMonthly: 395,
    grossMarginMonthly: 104,
    grossMarginPercent: 20.8,
    description: 'Full multi-brand governance, enterprise prompt volume, and on-demand trigger pipelines.',
    features: [
      '20 Brand Campaigns',
      '1,000 Prompts Tracked',
      '6 LLMs + Custom Model Endpoints',
      'Priority Weekly Runs & On-Demand Crawl Triggers',
      'Up to 50 Competitors Monitored',
      'Custom LLM Fine-Tuning & Webhooks',
      'AEO Schema Injection Automation',
      'Dedicated API & Data Warehouse Export',
      'Dedicated AI Visibility Strategist & SLAs',
    ],
  },
  // Alias for backward compatibility with 'agency' and 'agency_pro'
  agency: {
    name: 'Agency Pro',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || process.env.STRIPE_AGENCY_PRICE_ID || 'price_agency_499_monthly',
    priceIdAnnual: process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID || 'price_agency_399_annual',
    price: 499,
    annualPrice: 399,
    tier: 'enterprise',
    maxCampaigns: 20,
    maxPrompts: 1000,
    maxCompetitors: 50,
    modelsCount: 6,
    modelsDescription: '6 Models + Custom Fine-Tuned LLM Endpoints',
    runFrequency: 'Priority Weekly Runs & On-Demand Triggers',
    variableCost: 360,
    allocatedOverhead: 35,
    estimatedCostMonthly: 395,
    grossMarginMonthly: 104,
    grossMarginPercent: 20.8,
    description: 'Full multi-brand governance, enterprise prompt volume, and on-demand trigger pipelines.',
    features: [
      '20 Brand Campaigns',
      '1,000 Prompts Tracked',
      '6 LLMs + Custom Model Endpoints',
      'Priority Weekly Runs & On-Demand Crawl Triggers',
      'Up to 50 Competitors Monitored',
      'Custom LLM Fine-Tuning & Webhooks',
      'AEO Schema Injection Automation',
      'Dedicated API & Data Warehouse Export',
      'Dedicated AI Visibility Strategist & SLAs',
    ],
  },
};

let stripeClient: Stripe | null = null;

export function getStripeServer(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY || 'mock_stripe_key_for_development';
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
      appInfo: {
        name: 'Radiant Maxwell AI Visibility Platform',
        version: '0.1.0',
      },
    });
  }
  return stripeClient;
}
