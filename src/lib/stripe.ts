import Stripe from 'stripe';

export type StripeTier = 'starter' | 'growth' | 'enterprise';

export interface PlanConfig {
  name: string;
  priceId: string;
  price: number;
  tier: StripeTier;
  maxCompetitors: number;
  maxCampaigns: number;
  description: string;
  features: string[];
}

export const STRIPE_PLANS: Record<string, PlanConfig> = {
  starter: {
    name: 'Starter',
    priceId: 'price_starter_free',
    price: 0,
    tier: 'starter',
    maxCompetitors: 1,
    maxCampaigns: 3,
    description: 'Essential AI visibility tracking for emerging brands.',
    features: [
      '1 Competitor Monitored',
      '3 Active Campaigns',
      '25 Daily Prompts Tracked',
      'Gemini, ChatGPT & Perplexity Crawling',
      'Daily Email Digest',
    ],
  },
  growth: {
    name: 'Growth',
    priceId: process.env.STRIPE_GROWTH_PRICE_ID || 'price_growth_monthly',
    price: 149,
    tier: 'growth',
    maxCompetitors: 10,
    maxCampaigns: 20,
    description: 'Advanced multi-engine Share of Voice and competitor benchmarking.',
    features: [
      '10 Competitors Monitored',
      '20 Active Campaigns',
      '150 Daily Prompts Tracked',
      'GEO Optimizer Engine Sync',
      'Hourly Visibility Re-indexing',
      'Automated Citation Alerts',
      'CSV & PDF Export',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || process.env.STRIPE_AGENCY_PRICE_ID || 'price_enterprise_monthly',
    price: 499,
    tier: 'enterprise',
    maxCompetitors: Infinity,
    maxCampaigns: Infinity,
    description: 'Full-scale AI visibility intelligence for global market leaders.',
    features: [
      'Unlimited Competitors Monitored',
      'Unlimited Active Campaigns',
      '1,000+ Daily Prompts Tracked',
      'Custom LLM Fine-Tuning & Webhooks',
      'Dedicated API & Data Warehouse Export',
      'AEO Schema Injection Engine',
      'Dedicated Account Manager & SLAs',
    ],
  },
  // Alias for backward compatibility
  agency: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || process.env.STRIPE_AGENCY_PRICE_ID || 'price_enterprise_monthly',
    price: 499,
    tier: 'enterprise',
    maxCompetitors: Infinity,
    maxCampaigns: Infinity,
    description: 'Full-scale AI visibility intelligence for global market leaders.',
    features: [
      'Unlimited Competitors Monitored',
      'Unlimited Active Campaigns',
      '1,000+ Daily Prompts Tracked',
      'Custom LLM Fine-Tuning & Webhooks',
      'Dedicated API & Data Warehouse Export',
      'AEO Schema Injection Engine',
      'Dedicated Account Manager & SLAs',
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
