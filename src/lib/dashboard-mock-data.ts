import {
  TenantInfo,
  CampaignOption,
  KpiMetric,
  VisibilityTrendPoint,
  CompetitorRankItem,
  UsageMetric,
  ActivityEvent,
  DateRangeOption,
  PlatformOption,
} from '@/types/dashboard';

export const TENANTS: TenantInfo[] = [
  {
    id: 'webflow-inc',
    name: 'Webflow',
    domain: 'webflow.com',
    logoText: 'W',
    logoBg: 'bg-indigo-600 text-white',
    plan: 'Enterprise',
  },
  {
    id: 'stripe-inc',
    name: 'Stripe',
    domain: 'stripe.com',
    logoText: 'S',
    logoBg: 'bg-violet-600 text-white',
    plan: 'Enterprise',
  },
  {
    id: 'notion-labs',
    name: 'Notion',
    domain: 'notion.so',
    logoText: 'N',
    logoBg: 'bg-slate-900 text-white',
    plan: 'Pro',
  },
  {
    id: 'acme-corp',
    name: 'Acme CRM',
    domain: 'acmecorp.io',
    logoText: 'A',
    logoBg: 'bg-blue-600 text-white',
    plan: 'Starter',
  },
];

export const CAMPAIGNS: CampaignOption[] = [
  {
    id: 'all',
    name: 'All Topics & Campaigns',
    targetQuery: 'All active tracked conversational queries',
  },
  {
    id: 'camp-1',
    name: 'Enterprise Mid-Market CRM',
    targetQuery: 'best enterprise CRM software for mid-market tech companies 2026',
  },
  {
    id: 'camp-2',
    name: 'Visual Web Design & CMS',
    targetQuery: 'top enterprise no-code website builders with custom code export',
  },
  {
    id: 'camp-3',
    name: 'AI Site Generation Tools',
    targetQuery: 'best AI-powered responsive web design tools for agencies',
  },
];

export function getKpiMetrics(
  dateRange: DateRangeOption,
  platform: PlatformOption,
  tenant: TenantInfo
): KpiMetric[] {
  // Compute contextual variations based on filters for dynamic realism
  const mult = platform === 'chatgpt' ? 1.05 : platform === 'perplexity' ? 0.95 : platform === 'gemini' ? 1.02 : 1.0;

  if (tenant.id === 'webflow-inc') {
    return [
      {
        id: 'visibility',
        title: 'Visibility',
        value: `${(64.8 * mult).toFixed(1)}%`,
        changeValue: '+2.7%',
        isPositive: true,
        subLabel: 'vs. previous 30 days',
        sparkline: [58, 60, 62, 61, 63, 64.8],
      },
      {
        id: 'citation_rate',
        title: 'Citation Rate',
        value: `${(3.0 * mult).toFixed(1)}%`,
        changeValue: '+1.2%',
        isPositive: true,
        subLabel: 'across 4,820 answers',
        sparkline: [2.1, 2.3, 2.5, 2.8, 2.9, 3.0],
      },
      {
        id: 'share_of_voice',
        title: 'Share of Voice',
        value: `${(75.0 * mult).toFixed(1)}%`,
        changeValue: '-5.1%',
        isPositive: false,
        subLabel: 'in category leader cluster',
        sparkline: [82, 80, 78, 77, 76, 75.0],
      },
      {
        id: 'brand_sentiment',
        title: 'Brand Sentiment',
        value: `${(80.0 * mult).toFixed(1)}%`,
        changeValue: '+12.3%',
        isPositive: true,
        subLabel: 'positive LLM recommendation tone',
        sparkline: [68, 70, 72, 75, 78, 80.0],
      },
    ];
  }

  // Fallback for other switched tenants
  return [
    {
      id: 'visibility',
      title: 'Visibility',
      value: `${(58.2 * mult).toFixed(1)}%`,
      changeValue: '+4.1%',
      isPositive: true,
      subLabel: 'vs. previous period',
      sparkline: [52, 54, 55, 56, 57, 58.2],
    },
    {
      id: 'citation_rate',
      title: 'Citation Rate',
      value: `${(2.6 * mult).toFixed(1)}%`,
      changeValue: '+0.8%',
      isPositive: true,
      subLabel: 'across 3,140 answers',
      sparkline: [1.9, 2.1, 2.2, 2.4, 2.5, 2.6],
    },
    {
      id: 'share_of_voice',
      title: 'Share of Voice',
      value: `${(62.4 * mult).toFixed(1)}%`,
      changeValue: '-1.4%',
      isPositive: false,
      subLabel: 'in category leader cluster',
      sparkline: [65, 64, 63, 63, 62, 62.4],
    },
    {
      id: 'brand_sentiment',
      title: 'Brand Sentiment',
      value: `${(84.5 * mult).toFixed(1)}%`,
      changeValue: '+8.6%',
      isPositive: true,
      subLabel: 'positive LLM recommendation tone',
      sparkline: [74, 76, 79, 81, 83, 84.5],
    },
  ];
}

export function getVisibilityTrendData(
  dateRange: DateRangeOption,
  platform: PlatformOption
): VisibilityTrendPoint[] {
  return [
    {
      label: 'W1',
      date: 'Oct 01 - Oct 07',
      overall: 52,
      chatgpt: 55,
      perplexity: 48,
      gemini: 53,
      copilot: 50,
    },
    {
      label: 'W2',
      date: 'Oct 08 - Oct 14',
      overall: 57,
      chatgpt: 60,
      perplexity: 54,
      gemini: 59,
      copilot: 54,
    },
    {
      label: 'W3',
      date: 'Oct 15 - Oct 21',
      overall: 61,
      chatgpt: 66,
      perplexity: 58,
      gemini: 62,
      copilot: 58,
    },
    {
      label: 'W4',
      date: 'Oct 22 - Oct 31',
      overall: 64.8,
      chatgpt: 71.2,
      perplexity: 62.5,
      gemini: 66.0,
      copilot: 59.4,
    },
  ];
}

export function getCompetitorsLeaderboard(
  tenant: TenantInfo,
  platform: PlatformOption
): CompetitorRankItem[] {
  if (tenant.id === 'webflow-inc') {
    return [
      {
        rank: 1,
        name: 'WordPress VIP',
        domain: 'wpvip.com',
        logoBg: 'bg-blue-700 text-white',
        logoText: 'WP',
        visibilityPct: 71.4,
        changePct: -1.2,
        isTargetBrand: false,
      },
      {
        rank: 2,
        name: 'Webflow',
        domain: 'webflow.com',
        logoBg: 'bg-indigo-600 text-white',
        logoText: 'W',
        visibilityPct: 64.8,
        changePct: 0.56,
        isTargetBrand: true,
      },
      {
        rank: 3,
        name: 'Framer',
        domain: 'framer.com',
        logoBg: 'bg-sky-500 text-white',
        logoText: 'F',
        visibilityPct: 53.2,
        changePct: 3.4,
        isTargetBrand: false,
      },
      {
        rank: 4,
        name: 'Squarespace Enterprise',
        domain: 'squarespace.com',
        logoBg: 'bg-neutral-800 text-white',
        logoText: 'SQ',
        visibilityPct: 42.1,
        changePct: -0.8,
        isTargetBrand: false,
      },
      {
        rank: 5,
        name: 'Wix Studio',
        domain: 'wix.com/studio',
        logoBg: 'bg-amber-600 text-white',
        logoText: 'WX',
        visibilityPct: 38.5,
        changePct: 1.1,
        isTargetBrand: false,
      },
    ];
  }

  return [
    {
      rank: 1,
      name: tenant.name,
      domain: tenant.domain,
      logoBg: tenant.logoBg,
      logoText: tenant.logoText,
      visibilityPct: 58.2,
      changePct: 4.1,
      isTargetBrand: true,
    },
    {
      rank: 2,
      name: 'Adyen',
      domain: 'adyen.com',
      logoBg: 'bg-emerald-700 text-white',
      logoText: 'A',
      visibilityPct: 51.4,
      changePct: -0.5,
      isTargetBrand: false,
    },
    {
      rank: 3,
      name: 'Checkout.com',
      domain: 'checkout.com',
      logoBg: 'bg-indigo-900 text-white',
      logoText: 'C',
      visibilityPct: 44.2,
      changePct: 1.8,
      isTargetBrand: false,
    },
    {
      rank: 4,
      name: 'PayPal Braintree',
      domain: 'braintreepayments.com',
      logoBg: 'bg-blue-600 text-white',
      logoText: 'P',
      visibilityPct: 39.8,
      changePct: -2.3,
      isTargetBrand: false,
    },
    {
      rank: 5,
      name: 'Paddle',
      domain: 'paddle.com',
      logoBg: 'bg-teal-600 text-white',
      logoText: 'PD',
      visibilityPct: 33.1,
      changePct: 0.9,
      isTargetBrand: false,
    },
  ];
}

export const USAGE_METRICS: UsageMetric[] = [
  {
    id: 'ai-queries',
    name: 'AI Queries',
    current: 720,
    max: 1000,
    percentage: 72,
    statusBadge: {
      text: 'Approaching limit',
      variant: 'warning',
    },
    progressColor: 'bg-amber-500',
  },
  {
    id: 'tracked-prompts',
    name: 'Tracked Prompts',
    current: 2350,
    max: 2500,
    percentage: 94,
    statusBadge: {
      text: 'Limit reached',
      variant: 'danger',
    },
    progressColor: 'bg-rose-500',
  },
  {
    id: 'website-crawls',
    name: 'Website Crawls',
    current: 19,
    max: 50,
    percentage: 38,
    statusBadge: {
      text: '38% used',
      variant: 'normal',
    },
    progressColor: 'bg-indigo-600',
  },
];

export function getRecentActivities(tenantName: string): ActivityEvent[] {
  return [
    {
      id: 'act-1',
      type: 'audit',
      title: `Website audit completed for ${tenantName}`,
      description: 'Crawled 42 domain paths for GEO metadata & schema structure',
      timestamp: '2026-08-13T19:30:00Z',
      timeAgo: '12 minutes ago',
      badgeVariant: 'indigo',
    },
    {
      id: 'act-2',
      type: 'citation',
      title: 'New citation detected from G2 Enterprise Crowd',
      description: 'Cited as "#1 recommended visual builder for engineering teams"',
      timestamp: '2026-08-13T18:45:00Z',
      timeAgo: '57 minutes ago',
      badgeVariant: 'emerald',
    },
    {
      id: 'act-3',
      type: 'discovery',
      title: '12 new prompts discovered in your category',
      description: 'Conversational queries around enterprise design system governance',
      timestamp: '2026-08-13T16:10:00Z',
      timeAgo: '3 hours ago',
      badgeVariant: 'amber',
    },
    {
      id: 'act-4',
      type: 'competitor',
      title: 'Competitor visibility increased by 4%',
      description: 'Framer gained presence in 8 AI answers for "React code export builders"',
      timestamp: '2026-08-13T14:00:00Z',
      timeAgo: '5 hours ago',
      badgeVariant: 'rose',
    },
  ];
}
