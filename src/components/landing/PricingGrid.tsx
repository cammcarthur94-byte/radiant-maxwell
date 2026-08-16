'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  popular?: boolean;
  campaigns: string;
  prompts: string;
  models: string;
  frequency: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
}

export function PricingGrid() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const tiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Essential multi-engine AI search telemetry and citation tracking for single-brand marketers.',
      monthlyPrice: 79,
      annualPrice: 63,
      popular: false,
      campaigns: '1 Brand Campaign',
      prompts: '50 Prompts Tracked',
      models: '4 Core Models (Gemini Flash, GPT-4o-mini, Perplexity Sonar, Claude Haiku)',
      frequency: 'Weekly Automated Runs (4x / month)',
      ctaText: 'Start with Starter',
      ctaHref: '/signup?plan=starter',
      features: [
        '1 Brand Campaign',
        '50 Prompts Tracked',
        '4 Core Models (Gemini, ChatGPT, Sonar, Claude)',
        'Weekly Automated Tracking Runs (4x/mo)',
        'Up to 3 Competitors Monitored',
        'Weekly Email Intelligence Digest',
      ],
    },
    {
      id: 'growth',
      name: 'Growth',
      badge: 'Most Popular',
      description: 'Advanced multi-engine Share of Voice, competitor gap analysis, and GEO optimization.',
      monthlyPrice: 199,
      annualPrice: 159,
      popular: true,
      campaigns: '5 Brand Campaigns',
      prompts: '250 Prompts Tracked',
      models: '6 Top-Tier Models (+ GPT-4o & Claude 3.5 Sonnet)',
      frequency: 'Weekly Automated Runs (4x / month)',
      ctaText: 'Start 14-Day Free Trial',
      ctaHref: '/signup?plan=growth',
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
    {
      id: 'agency',
      name: 'Agency Pro',
      badge: 'Enterprise Governance',
      description: 'Full multi-brand governance, enterprise prompt volume, and on-demand trigger pipelines.',
      monthlyPrice: 499,
      annualPrice: 399,
      popular: false,
      campaigns: '20 Brand Campaigns',
      prompts: '1,000 Prompts Tracked',
      models: '6 LLMs + Custom Fine-Tuned Model Endpoints',
      frequency: 'Priority Weekly Runs & On-Demand Triggers',
      ctaText: 'Start with Agency Pro',
      ctaHref: '/signup?plan=agency',
      features: [
        '20 Brand Campaigns',
        '1,000 Prompts Tracked',
        '6 LLMs + Custom Model Endpoints',
        'Priority Weekly Runs & On-Demand Crawl Triggers',
        'Up to 50 Competitors Monitored',
        'Custom LLM Fine-Tuning & Webhooks',
        'AEO Schema Injection Automation',
        'Dedicated API & Data Warehouse Export',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-24 bg-white border-t border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Transparent Pricing</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Transparent Plans for Every Growth Stage.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Predictable pricing backed by multi-tenant security, direct Stripe checkout, and automated LLM telemetry pipelines.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-4 flex items-center justify-center space-x-3">
            <span
              className={`text-xs font-bold ${
                billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
              className="w-12 h-6 bg-slate-200 rounded-full p-1 transition-colors relative focus:outline-hidden cursor-pointer"
            >
              <div
                className={`w-4 h-4 bg-indigo-600 rounded-full shadow-md transform transition-transform ${
                  billingCycle === 'annually' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold flex items-center gap-1.5 ${
                billingCycle === 'annually' ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* 3 Side-by-Side Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => {
            const price = billingCycle === 'annually' ? tier.annualPrice : tier.monthlyPrice;

            return (
              <div
                key={tier.id}
                className={`bg-white rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between relative ${
                  tier.popular
                    ? 'border-2 border-indigo-600 shadow-xl shadow-indigo-100/50 ring-4 ring-indigo-50'
                    : 'border border-slate-200/90 shadow-xs hover:shadow-lg'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[11px] shadow-sm tracking-wide uppercase font-mono">
                    {tier.badge}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Tier Title & Description */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                    <p className="text-xs text-slate-500 mt-2 min-h-[36px] leading-relaxed">
                      {tier.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline space-x-1">
                    <span className="text-4xl font-extrabold text-slate-900 font-sans">
                      ${price}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      / month {billingCycle === 'annually' && '(billed annually)'}
                    </span>
                  </div>

                  {/* Core Capacity Highlights */}
                  <div className="py-3 px-4 bg-[#f8fafc] rounded-xl border border-slate-200/70 space-y-1.5 text-xs text-slate-700 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Campaigns:</span>
                      <span className="font-bold text-slate-900">{tier.campaigns}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Prompts:</span>
                      <span className="font-bold text-slate-900">{tier.prompts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Frequency:</span>
                      <span className="font-bold text-slate-900">{tier.frequency}</span>
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <div className="space-y-2.5 pt-2">
                    <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider font-mono">
                      Included in {tier.name}:
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA Button */}
                <div className="mt-8 pt-4 border-t border-slate-100">
                  <Link
                    href={tier.ctaHref}
                    className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
                      tier.popular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-500/20 active:scale-98'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                    }`}
                  >
                    <span>{tier.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
