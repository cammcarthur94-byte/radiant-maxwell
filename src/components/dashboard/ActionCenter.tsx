'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  X,
  ChevronRight,
} from 'lucide-react';

export interface ActionItem {
  id: string;
  type: 'warning' | 'opportunity' | 'competitor';
  title: string;
  description: string;
  ctaText: string;
  impactBadge: string;
  drawerPayload?: {
    title: string;
    category: string;
    details: string;
    recommendation: string;
    codeSnippet?: string;
  };
}

interface ActionCenterProps {
  onSelectAction?: (item: ActionItem) => void;
}

export function ActionCenter({ onSelectAction }: ActionCenterProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const defaultActions: ActionItem[] = [
    {
      id: 'action-1',
      type: 'warning',
      title: 'AIO Alert: Schema markup missing on /pricing',
      description: 'Google AI Overviews failed entity extraction on tier comparison tables.',
      ctaText: 'View Fix',
      impactBadge: '+8.4 pts AIO',
      drawerPayload: {
        title: 'Fix Structured Schema on Pricing Page',
        category: 'Entity Extraction & Knowledge Graph',
        details:
          'Googlebot-Extended and Gemini Search Grounding detected missing SoftwareApplication / Product JSON-LD schema on your /pricing route, causing AI Overviews to omit tier pricing in comparative summaries.',
        recommendation:
          'Inject valid Schema.org Product and PriceSpecification markup into the <head> of /pricing.',
        codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Acme Visibility Engine",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "79",
    "highPrice": "499",
    "priceCurrency": "USD"
  }
}
</script>`,
      },
    },
    {
      id: 'action-2',
      type: 'opportunity',
      title: 'Opportunity: Gemini ranking #2 on "enterprise CRM solutions"',
      description: 'Brand is cited in 4/6 models; +1 citation needed to take #1 rank from Vertex.',
      ctaText: 'View Prompt',
      impactBadge: '+12% SOV',
      drawerPayload: {
        title: 'Optimize Target Query: "enterprise CRM solutions"',
        category: 'Brand Recommendation Optimization',
        details:
          'Your brand is currently cited as the #2 alternative behind Vertex Solutions across Google Gemini and ChatGPT 4o with Search.',
        recommendation:
          'Publish a comparison guide emphasizing multi-tenant data isolation and SOC2 compliance to capture top recommendation status.',
        codeSnippet: `Target Query: enterprise CRM solutions with AI
Current Rank: #2 (Gemini), #1 (Perplexity), #3 (ChatGPT)
Citing Sources: g2.com/categories/crm, techradar.com/best/crm`,
      },
    },
    {
      id: 'action-3',
      type: 'competitor',
      title: 'Competitor Shift: Horizon Tech gained 3 citations on Perplexity',
      description: 'Horizon Tech published new benchmark data cited in discovery queries.',
      ctaText: 'Compare Gap',
      impactBadge: 'Alert',
      drawerPayload: {
        title: 'Competitor Velocity: Horizon Tech',
        category: 'Competitive Intelligence',
        details:
          'Horizon Tech gained 3 net citations over the past 7 days across Perplexity Sonar search results for cloud security automation.',
        recommendation:
          'Review Horizon Tech reference domain links in Top Domains to identify co-citation opportunities.',
        codeSnippet: `Competitor: Horizon Tech
Platform: Perplexity Sonar
Detected URLs: horizontech.io/benchmarks-2025, venturebeat.com/ai-security`,
      },
    },
  ];

  const activeActions = defaultActions.filter((a) => !dismissedIds.includes(a.id));

  if (activeActions.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Strategic Action Center &bull; High Impact Insights
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {activeActions.length} active alerts
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {activeActions.map((action) => {
          const isWarning = action.type === 'warning';
          const isOpportunity = action.type === 'opportunity';

          return (
            <div
              key={action.id}
              className={`relative rounded-2xl border p-4 shadow-2xs transition-all duration-200 hover:shadow-xs flex flex-col justify-between ${
                isWarning
                  ? 'bg-amber-50/40 border-amber-200/70 hover:border-amber-300'
                  : isOpportunity
                  ? 'bg-emerald-50/40 border-emerald-200/70 hover:border-emerald-300'
                  : 'bg-indigo-50/40 border-indigo-200/70 hover:border-indigo-300'
              }`}
            >
              {/* Dismiss Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDismissedIds((prev) => [...prev, action.id]);
                }}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-white/60 transition-colors cursor-pointer"
                title="Dismiss alert"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="space-y-2 pr-6">
                {/* Header Icon + Badge */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isWarning
                        ? 'bg-amber-100 text-amber-700'
                        : isOpportunity
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {isWarning ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : isOpportunity ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <Target className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border font-mono ${
                      isWarning
                        ? 'bg-amber-100/80 text-amber-800 border-amber-300/60'
                        : isOpportunity
                        ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300/60'
                        : 'bg-indigo-100/80 text-indigo-800 border-indigo-300/60'
                    }`}
                  >
                    {action.impactBadge}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-snug">
                    {action.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Action Link Button */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSelectAction && onSelectAction(action)}
                  className={`text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer ${
                    isWarning
                      ? 'text-amber-800'
                      : isOpportunity
                      ? 'text-emerald-800'
                      : 'text-indigo-800'
                  }`}
                >
                  <span>{action.ctaText}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <span className="text-[10px] text-slate-400 font-mono">1-click inspect</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
