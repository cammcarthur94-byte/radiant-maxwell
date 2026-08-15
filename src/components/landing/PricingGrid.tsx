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
      description: 'Essential AI search telemetry for individual marketers and growing brands.',
      monthlyPrice: 29,
      annualPrice: 24,
      popular: false,
      ctaText: 'Start with Starter',
      ctaHref: '/signup?plan=starter',
      features: [
        'Up to 3 Campaigns',
        'Track 25 total prompts per day',
        'Track up to 3 Competitors',
        'Tracks 2 Models (Gemini Flash & GPT-4o-mini)',
      ],
    },
    {
      id: 'growth',
      name: 'Growth',
      badge: 'Most Popular',
      description: 'Advanced intelligence and competitive gap analysis for high-velocity teams.',
      monthlyPrice: 129,
      annualPrice: 103,
      popular: true,
      ctaText: 'Get Started with Growth',
      ctaHref: '/signup?plan=growth',
      features: [
        'Up to 20 Campaigns',
        'Track 150 total prompts per day',
        'Track up to 10 Competitors',
        'Tracks 4 Models (Adds Claude Haiku & Perplexity Sonar)',
        'Competitor Gap Analysis',
      ],
    },
    {
      id: 'agency',
      name: 'Agency',
      description: 'Full multi-brand governance, enterprise prompt volume, and raw API access.',
      monthlyPrice: 499,
      annualPrice: 399,
      popular: false,
      ctaText: 'Start with Agency',
      ctaHref: '/signup?plan=agency',
      features: [
        'Unlimited Campaigns',
        'Track 1,000 total prompts per day',
        'Track up to 50 Competitors',
        'Multi-Brand Workspace',
        'Raw Data API Access',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-200/80 relative overflow-hidden">
      {/* Background soft ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-100/40 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Simple, Transparent Pricing</span>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Choose the plan that fits your growth stage.
          </h2>

          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Monitor real-time AI recommendations, outrank your competitors across top LLMs, and scale with confidence.
          </p>

          {/* Monthly / Annually Billing Toggle */}
          <div className="pt-4 flex items-center justify-center">
            <div className="bg-slate-200/80 p-1 rounded-2xl inline-flex items-center space-x-1 border border-slate-300/60 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly billing
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('annually')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center space-x-1.5 ${
                  billingCycle === 'annually'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Annual billing</span>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto">
          {tiers.map((tier) => {
            const price = billingCycle === 'monthly' ? tier.monthlyPrice : tier.annualPrice;

            return (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 bg-white ${
                  tier.popular
                    ? 'border-2 border-indigo-600 shadow-xl shadow-indigo-500/10 lg:-translate-y-2.5 z-20'
                    : 'border border-slate-200 shadow-xs hover:shadow-lg hover:border-slate-300 z-10'
                }`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center space-x-1 bg-indigo-600 text-white text-[11px] font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md shadow-indigo-500/25">
                      <Zap className="w-3 h-3 fill-current" />
                      <span>{tier.badge}</span>
                    </span>
                  </div>
                )}

                {/* Top Content */}
                <div className="space-y-6">
                  {/* Plan Name & Description */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                        {tier.name}
                      </h3>
                      {tier.popular && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                      {tier.description}
                    </p>
                  </div>

                  {/* Pricing Display */}
                  <div className="pb-6 border-b border-slate-100">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                        ${price}
                      </span>
                      <span className="text-sm font-semibold text-slate-500">
                        / mo
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {billingCycle === 'annually'
                        ? 'Billed annually (Save 20%)'
                        : 'Billed monthly, cancel anytime'}
                    </p>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-3.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      What's included
                    </p>
                    <ul className="space-y-3">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-3 text-xs sm:text-sm text-slate-700">
                          <div
                            className={`p-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                              tier.popular
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Action */}
                <div className="pt-8 mt-8 border-t border-slate-100">
                  {tier.popular ? (
                    <Link
                      href={tier.ctaHref}
                      className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.99]"
                    >
                      <span>{tier.ctaText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Link
                      href={tier.ctaHref}
                      className="w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 hover:border-slate-400 transition-all shadow-2xs active:scale-[0.99]"
                    >
                      <span>{tier.ctaText}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust & Assurance Footnote */}
        <div className="mt-14 pt-8 border-t border-slate-200/60 max-w-4xl mx-auto text-center flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>14-day risk-free guarantee</span>
          </div>
          <span className="hidden sm:inline text-slate-300">•</span>
          <div className="flex items-center space-x-1.5">
            <Check className="w-4 h-4 text-indigo-600" />
            <span>No credit card required to start</span>
          </div>
          <span className="hidden sm:inline text-slate-300">•</span>
          <div className="flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Instant API & dashboard setup</span>
          </div>
        </div>
      </div>
    </section>
  );
}
