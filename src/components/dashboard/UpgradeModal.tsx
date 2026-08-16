'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Check, Sparkles, ShieldCheck, Zap, Bot, ArrowRight, Loader2, Crown, Lock } from 'lucide-react';
import { TenantInfo } from '@/types/dashboard';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTenant: TenantInfo;
}

export function UpgradeModal({
  isOpen,
  onClose,
  activeTenant,
}: UpgradeModalProps) {
  const [isLoadingTier, setIsLoadingTier] = useState<'growth' | 'enterprise' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlan = (activeTenant?.plan || 'starter').toLowerCase();

  const handleStripeCheckout = async (tier: 'growth' | 'enterprise') => {
    try {
      setIsLoadingTier(tier);
      setErrorMessage(null);

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: activeTenant.id,
          tier,
          returnUrl: window.location.href,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Unable to initiate Stripe checkout');
      }

      window.location.href = data.url;
    } catch (err: any) {
      console.error('Stripe checkout error:', err);
      setErrorMessage(err.message || 'Payment system error. Please try again.');
      setIsLoadingTier(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Scale Multi-Engine AI Visibility</span>
          </div>

          <h2 className="text-2xl font-bold mt-1 tracking-tight">
            Upgrade Plan for {activeTenant.name}
          </h2>
          <p className="text-indigo-100 text-xs mt-1 max-w-xl">
            Unlock 10 to Unlimited competitors, daily automated prompt crawls across Gemini, ChatGPT & Perplexity, and GEO optimization engines.
          </p>
        </div>

        {/* Plan Comparisons */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Growth Plan */}
            <div className="border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-slate-300 transition-all bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 uppercase">Growth</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    5 Campaigns &bull; 250 Prompts
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Growth Plan</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">$199</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>

                <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span><strong>5</strong> brand campaigns (vs 1 on Starter)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span><strong>250</strong> monitored prompt keywords</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span><strong>6</strong> AI engines (+ GPT-4o & Claude Sonnet)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Up to <strong>10</strong> competitors monitored</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>GEO Optimizer Engine synchronization</span>
                  </li>
                </ul>
              </div>

              <button
                disabled={isLoadingTier !== null || currentPlan === 'growth'}
                onClick={() => handleStripeCheckout('growth')}
                className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-semibold text-xs text-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoadingTier === 'growth' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting to Stripe...</span>
                  </>
                ) : currentPlan === 'growth' ? (
                  <span>Current Active Plan</span>
                ) : (
                  <span>Upgrade to Growth ($199/mo)</span>
                )}
              </button>
            </div>

            {/* Enterprise / Agency Pro Plan (Featured) */}
            <div className="border-2 border-indigo-600 rounded-2xl p-5 space-y-4 relative bg-indigo-50/40 shadow-md flex flex-col justify-between">
              <span className="absolute -top-3 right-4 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Crown className="w-3 h-3" />
                <span>Enterprise Scale</span>
              </span>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 uppercase">Agency Pro</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    20 Campaigns &bull; 1,000 Prompts
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Agency Pro Plan</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">$499</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>

                <ul className="mt-4 space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span><strong>20</strong> brand campaigns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span><strong>1,000</strong> monitored prompt keywords</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span><strong>Priority</strong> weekly crawls & on-demand triggers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Up to <strong>50</strong> competitors monitored</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Custom LLM Fine-Tuning & Webhooks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Dedicated SLAs & AI Visibility Strategist</span>
                  </li>
                </ul>
              </div>

              <button
                disabled={isLoadingTier !== null || currentPlan.includes('enterprise')}
                onClick={() => handleStripeCheckout('enterprise')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm hover:shadow-indigo-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLoadingTier === 'enterprise' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting to Stripe...</span>
                  </>
                ) : currentPlan.includes('enterprise') ? (
                  <span>Current Active Plan</span>
                ) : (
                  <>
                    <span>Upgrade to Agency Pro ($499/mo)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Secured by Stripe
              </span>
              <span>&bull;</span>
              <span>Cancel anytime</span>
            </div>
            <Link
              href="/subscription"
              onClick={onClose}
              className="text-indigo-600 hover:underline font-semibold"
            >
              View Full Tier Comparison Table &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
