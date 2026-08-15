export type NavSectionId = 'visibility' | 'citations' | 'competitors' | 'optimization';

export type NavTabId =
  // AI Visibility
  | 'visibility-overview'
  | 'visibility-prompts'
  | 'visibility-engines'
  | 'visibility-sov'
  | 'visibility-recommendations'
  // Citations
  | 'citations-overview'
  | 'citations-sources'
  | 'citations-opportunities'
  | 'citations-competitors'
  // Competitors
  | 'competitors-overview'
  | 'competitors-visibility'
  | 'competitors-content'
  | 'competitors-prompt-gaps'
  // Optimization
  | 'optimization-geo'
  | 'optimization-aeo';

export interface TenantInfo {
  id: string;
  name: string;
  slug?: string;
  domain: string;
  logoText: string;
  logoBg: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  aliases?: string[];
}

export type DateRangeOption = '7d' | '30d' | '90d' | 'all';

export type ComparisonPeriodOption = 'previous_period' | 'previous_month' | 'previous_year' | 'off';

export type PlatformOption = 'all' | 'chatgpt' | 'gemini' | 'perplexity' | 'copilot';

export type RegionOption = 'us' | 'uk' | 'ca' | 'au' | 'de';

export type LanguageOption = 'en' | 'fr' | 'de' | 'es';

export type SnapshotFrequencyOption = 'daily' | 'weekly' | 'monthly';

export type QueryIntent = 'Brand' | 'Product' | 'Competitor';

export interface SourceAttributionItem {
  id: string;
  domain: string;
  url: string;
  anchorText: string;
  citationsCount: number;
  citationSharePct: number;
  authorityScore: number;
  isTargetBrand: boolean;
  engineBadges: PlatformOption[];
  sentiment: 'positive' | 'neutral' | 'negative';
  previousCitationsCount?: number;
  previousCitationSharePct?: number;
  citationShareDelta?: number;
}

export interface SentimentDistribution {
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  netScore: number;
  sampleSnippet: string;
  sampleQuery: string;
  sampleEngine: string;
  sampleTimestamp: string;
}

export interface CampaignOption {
  id: string;
  name: string;
  targetQuery: string;
  queryIntent?: QueryIntent;
  aliases?: string[];
}

export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  changeValue: string;
  isPositive: boolean;
  subLabel: string;
  sparkline: number[];
  previousValue?: string;
  rawCurrent?: number;
  rawPrevious?: number;
  percentageDelta?: number;
  absoluteDelta?: number;
}

export interface VisibilityTrendPoint {
  label: string;
  date: string;
  overall: number;
  chatgpt: number;
  perplexity: number;
  gemini: number;
  copilot: number;
  previousOverall?: number;
  previousChatgpt?: number;
  previousPerplexity?: number;
  previousGemini?: number;
}

export interface CompetitorRankItem {
  rank: number;
  name: string;
  domain: string;
  logoBg: string;
  logoText: string;
  visibilityPct: number;
  changePct: number;
  isTargetBrand: boolean;
  mentionCount?: number;
  citationsCount?: number;
  previousRank?: number;
  previousVisibilityPct?: number;
  positionDelta?: number;
  visibilityDelta?: number;
}

export interface UsageMetric {
  id: string;
  name: string;
  current: number;
  max: number;
  percentage: number;
  statusBadge: {
    text: string;
    variant: 'warning' | 'danger' | 'normal';
  };
  progressColor: string;
}

export interface ActivityEvent {
  id: string;
  type: 'audit' | 'citation' | 'discovery' | 'competitor';
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
  badgeVariant: 'indigo' | 'emerald' | 'amber' | 'rose';
  rawResponseText?: string;
  raw_ai_response?: string;
  query?: string;
  user_prompt?: string;
  domain_name?: string;
  domain_authority_type?: string;
  sentiment_label?: 'Positive' | 'Neutral' | 'Negative' | 'Inaccurate';
  is_misinformation?: boolean;
  modelVersion?: string;
  url?: string;
  citations?: string[];
  extractedMetrics?: any;
}

export interface DashboardState {
  activeTenant: TenantInfo;
  selectedDateRange: DateRangeOption;
  comparisonPeriod: ComparisonPeriodOption;
  selectedPlatform: PlatformOption;
  selectedCampaign: string;
  activeTab: NavTabId;
  sidebarCollapsed: boolean;
  comparePreviousPeriod: boolean;
}

export type GeoRecommendationCategory = 'source_citation' | 'content_schema' | 'competitor_gap';
export type GeoRecommendationPriority = 'high' | 'medium' | 'quick_win';
export type GeoRecommendationStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed';

export interface GeoRecommendationItem {
  id: string;
  tenant_id: string;
  category: GeoRecommendationCategory;
  priority: GeoRecommendationPriority;
  title: string;
  description: string;
  action_plan: string;
  code_snippet?: string | null;
  target_query?: string | null;
  competitor_name?: string | null;
  target_domain?: string | null;
  estimated_impact: string;
  status: GeoRecommendationStatus;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
