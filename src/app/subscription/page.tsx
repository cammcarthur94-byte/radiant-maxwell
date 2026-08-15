'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Loader2,
  Lock,
  Swords,
  ChevronLeft,
  Layers,
  Bot,
  Receipt,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { STRIPE_PLANS } from '@/lib/stripe';

export default function SubscriptionPage() {
  const [currentTier, setCurrentTier] = useState<'starter' | 'growth' | 'enterprise'>('starter');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('active');
  const [tenantId, setTenantId] = useState<string>('');
  const [tenantName, setTenantName] = useState<string>('');
  const [isLoadingTier, setIsLoadingTier] = useState<string | null>(null);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [annualBilling, setAnnualBilling] = useState(false);

  // Fetch current tenant and subscription data
  useEffect(() => {
    async function loadTenantData() {
      try {
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        if (json.success && json.data?.tenant) {
          const t = json.data.tenant;
          setTenantId(t.id);
          setTenantName(t.name);
          const rawPlan = (t.plan || 'starter').toLowerCase();
          if (rawPlan.includes('growth')) setCurrentTier('growth');
          else if (rawPlan.includes('enterprise') || rawPlan.includes('agency')) setCurrentTier('enterprise');
          else setCurrentTier('starter');
        }
      } catch (e) {
        console.warn('Failed to load active tenant subscription details:', e);
      }
    }

    loadTenantData();

    // Check URL parameters for Stripe return
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const upgraded = params.get('upgraded');
      const canceled = params.get('canceled');
      if (upgraded) {
        setBannerMessage({
          type: 'success',
          text: `Payment successful! Your account has been upgraded to the ${upgraded.toUpperCase()} plan.`,
        });
        if (upgraded === 'growth' || upgraded === 'enterprise' || upgraded === 'starter') {
          setCurrentTier(upgraded as any);
        }
      } else if (canceled) {
        setBannerMessage({
          type: 'error',
          text: 'Checkout was canceled. No charges were made.',
        });
      }
    }
  }, []);

  const handleCheckout = async (tier: 'starter' | 'growth' | 'enterprise') => {
    try {
      setIsLoadingTier(tier);
      setBannerMessage(null);

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenantId || 'tenant_default',
          tier,
          returnUrl: `${window.location.origin}/subscription`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to initiate Stripe checkout');
      }

      window.location.href = data.url;
    } catch (err: any) {
      setBannerMessage({
        type: 'error',
        text: err.message || 'Payment system error. Please try again.',
      });
      setIsLoadingTier(null);
    }
  };

  const handleOpenPortal = async () => {
    try {
      setIsLoadingPortal(true);
      setBannerMessage(null);

      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenantId || 'tenant_default',
          returnUrl: `${window.location.origin}/subscription`,
        }),
      });

      const data = await res.json();
      if (data.demoMode) {
        setBannerMessage({
          type: 'success',
          text: 'Stripe Customer Portal simulated in demo mode.',
        });
        setIsLoadingPortal(false);
        return;
      }

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to generate Customer Portal session');
      }

      window.location.href = data.url;
    } catch (err: any) {
      setBannerMessage({
        type: 'error',
        text: err.message || 'Error redirecting to Stripe Billing Portal.',
      });
      setIsLoadingPortal(false);
    }
  };

  const tiers = [
    {
      id: 'starter' as const,
      name: 'Starter',
      badge: 'Free Tier',
      priceMonthly: 0,
      priceAnnual: 0,
      competitorLimit: '1 Competitor',
      campaignLimit: '3 Campaigns',
      promptsLimit: '25 Daily Prompts',
      description: 'Ideal for emerging brands and solo founders testing generative AI search visibility.',
      features: [
        'Max 1 Competitor monitored',
        '3 Active tracking campaigns',
        '25 Daily prompts crawled',
        'Gemini, ChatGPT & Perplexity coverage',
        'Weekly email intelligence digest',
        'Standard community support',
      ],
      isPopular: false,
      buttonText: currentTier === 'starter' ? 'Current Plan' : 'Downgrade to Starter',
    },
    {
      id: 'growth' as const,
      name: 'Growth',
      badge: 'Most Popular',
      priceMonthly: 149,
      priceAnnual: 119,
      competitorLimit: '10 Competitors',
      campaignLimit: '20 Campaigns',
      promptsLimit: '150 Daily Prompts',
      description: 'Designed for fast-scaling brands needing deep competitor benchmarking & GEO optimization.',
      features: [
        'Max 10 Competitors monitored',
        '20 Active tracking campaigns',
        '150 Daily prompts crawled',
        'GEO Optimizer Engine synchronization',
        'Hourly AI visibility re-indexing',
        'Automated citation anomaly alerts',
        'CSV & PDF Executive Report export',
        'Priority email & Slack support',
      ],
      isPopular: true,
      buttonText: currentTier === 'growth' ? 'Current Plan' : 'Upgrade to Growth',
    },
    {
      id: 'enterprise' as const,
      name: 'Enterprise',
      badge: 'Maximum Scale',
      priceMonthly: 499,
      priceAnnual: 399,
      competitorLimit: 'Unlimited Competitors',
      campaignLimit: 'Unlimited Campaigns',
      promptsLimit: '1,000+ Daily Prompts',
      description: 'Full-scale market dominance for high-volume enterprises and growth agencies.',
      features: [
        'Unlimited Competitors monitored',
        'Unlimited Active tracking campaigns',
        '1,000+ Daily prompts crawled',
        'Custom LLM fine-tuning & webhook pipeline',
        'AEO Schema injection automation',
        'Dedicated data warehouse sync',
        '99.9% SLA & Custom contracts',
        'Dedicated AI visibility strategist',
      ],
      isPopular: false,
      buttonText: currentTier === 'enterprise' ? 'Current Plan' : 'Upgrade to Enterprise',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-900">Subscription & Billing</span>
              {tenantName && (
                <span className="text-xs text-slate-500 font-medium hidden md:inline">
                  &bull; {tenantName}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenPortal}
              disabled={isLoadingPortal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isLoadingPortal ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Receipt className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>Manage Stripe Billing Portal</span>
              <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Banner Alerts */}
        {bannerMessage && (
          <div
            className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between shadow-2xs animate-in fade-in ${
              bannerMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {bannerMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{bannerMessage.text}</span>
            </div>
            <button
              onClick={() => setBannerMessage(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Monetization & Feature Guardrails</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Transparent, Tiered Plans for AI Visibility
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Choose the subscription tier tailored to your scale. From single competitor tracking on Starter to unlimited enterprise monitoring across Gemini, ChatGPT, and Perplexity.
          </p>

          {/* Billing Interval Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span
              className={`text-xs font-semibold transition-colors ${
                !annualBilling ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              Monthly Billing
            </span>
            <button
              type="button"
              onClick={() => setAnnualBilling(!annualBilling)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                annualBilling ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  annualBilling ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-semibold transition-colors ${
                  annualBilling ? 'text-slate-900' : 'text-slate-400'
                }`}
              >
                Annual Billing
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => {
            const isCurrent = currentTier === tier.id;
            const price = annualBilling ? tier.priceAnnual : tier.priceMonthly;

            return (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all ${
                  tier.isPopular
                    ? 'bg-white border-2 border-indigo-600 shadow-xl shadow-indigo-100/50 ring-4 ring-indigo-50'
                    : 'bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300'
                }`}
              >
                {tier.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">{tier.description}</p>
                    </div>
                    {isCurrent && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-indigo-600" />
                        Active
                      </span>
                    )}
                  </div>

                  {/* Price Display */}
                  <div className="mt-6 flex items-baseline gap-1.5 pb-6 border-b border-slate-100">
                    <span className="text-4xl font-extrabold text-slate-900">
                      ${price}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / month {annualBilling && tier.priceMonthly > 0 ? '(billed annually)' : ''}
                    </span>
                  </div>

                  {/* Limits Highlights */}
                  <div className="mt-6 bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Competitors Limit:</span>
                      <span className="font-bold text-slate-900">{tier.competitorLimit}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Active Campaigns:</span>
                      <span className="font-bold text-slate-900">{tier.campaignLimit}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Daily AI Prompts:</span>
                      <span className="font-bold text-slate-900">{tier.promptsLimit}</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-6 space-y-3">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Included in {tier.name}:
                    </div>
                    <ul className="space-y-2.5">
                      {tier.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <button
                    disabled={isCurrent || isLoadingTier !== null}
                    onClick={() => handleCheckout(tier.id)}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-500 border border-slate-200'
                        : tier.isPopular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 active:scale-98'
                        : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-98'
                    }`}
                  >
                    {isLoadingTier === tier.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Connecting to Stripe...</span>
                      </>
                    ) : isCurrent ? (
                      <span>Current Active Plan</span>
                    ) : (
                      <>
                        <span>{tier.buttonText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Limit Guardrail Matrix Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Detailed Plan Feature Matrix & Middleware Guardrails
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enforced server-side via Supabase Row-Level Security and API validation before database insertion.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>PCI-DSS Level 1 Encrypted Payments via Stripe</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Feature / Guardrail</th>
                  <th className="py-3 px-4">Starter</th>
                  <th className="py-3 px-4 text-indigo-600">Growth</th>
                  <th className="py-3 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Competitors Monitored</td>
                  <td className="py-3.5 px-4">Max 1</td>
                  <td className="py-3.5 px-4 font-semibold text-indigo-700">Max 10</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Active Tracking Campaigns</td>
                  <td className="py-3.5 px-4">3 Campaigns</td>
                  <td className="py-3.5 px-4">20 Campaigns</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Daily Prompts Extraction Quota</td>
                  <td className="py-3.5 px-4">25 / day</td>
                  <td className="py-3.5 px-4">150 / day</td>
                  <td className="py-3.5 px-4">1,000+ / day</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">AI Search Engine Models</td>
                  <td className="py-3.5 px-4">Gemini, ChatGPT, Perplexity</td>
                  <td className="py-3.5 px-4">All Models + Copilot</td>
                  <td className="py-3.5 px-4">Custom Models & Raw API</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">GEO Optimizer Engine</td>
                  <td className="py-3.5 px-4 text-slate-400">Locked</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-semibold">Included</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-semibold">Included</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">Stripe Customer Portal</td>
                  <td className="py-3.5 px-4 text-emerald-600">Self-serve</td>
                  <td className="py-3.5 px-4 text-emerald-600">Self-serve</td>
                  <td className="py-3.5 px-4 text-emerald-600">Dedicated Account Exec</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & FAQ Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Stripe 256-Bit SSL Encryption</span>
            </span>
            <span>&bull;</span>
            <span>Cancel or modify plan anytime</span>
            <span>&bull;</span>
            <span>Instant multi-tenant provisioning</span>
          </div>
          <div>
            <button
              onClick={handleOpenPortal}
              className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline"
            >
              Need an invoice or VAT receipt? Visit Customer Portal &rarr;
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
