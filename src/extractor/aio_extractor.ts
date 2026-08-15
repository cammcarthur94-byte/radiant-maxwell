import {
  BrandTargetConfig,
  RawAISearchResponse,
  ExtractedAIOMetrics,
  BrandMentionAnalysis,
  ShareOfVoiceMetrics,
  CitationLink
} from './types';
import {
  parseCitationsFromText,
  analyzeContextSentiment,
  detectRecommendationRank,
  extractSnippets,
  escapeRegExp
} from './nlp_utils';

export class AIODataExtractor {
  /**
   * Main entry point to extract AIO / LLM metrics from an AI search response.
   */
  public extract(
    response: RawAISearchResponse,
    config: BrandTargetConfig
  ): ExtractedAIOMetrics {
    const rawText = response.raw_text;

    // 1. Extract and categorize all citations / grounding sources
    const citations: CitationLink[] = parseCitationsFromText(
      rawText,
      response.grounding_sources || [],
      config
    );

    // 2. Analyze Target Brand
    const targetBrandAnalysis = this.analyzeBrand(
      config.name,
      config.aliases,
      rawText,
      citations,
      true,
      false
    );

    // 3. Analyze Competitor Brands
    const competitorAnalyses: BrandMentionAnalysis[] = config.competitors.map(comp =>
      this.analyzeBrand(
        comp.name,
        comp.aliases,
        rawText,
        citations,
        false,
        true
      )
    );

    // 4. Calculate Share of Voice and Weighted Visibility Score
    const shareOfVoice = this.calculateShareOfVoice(
      targetBrandAnalysis,
      competitorAnalyses,
      citations
    );

    // 5. Compute Citation Summary
    const citationSummary = {
      total_citations: citations.length,
      target_brand_citations: citations.filter(c => c.is_target_brand_domain).length,
      competitor_citations: citations.filter(c => c.is_competitor_domain).length,
      third_party_review_citations: citations.filter(c => c.source_category === 'review_platform').length
    };

    // 6. Compute Text & Model Metadata
    const wordCount = rawText.trim().split(/\s+/).length;
    const charLength = rawText.length;
    const estimatedTokens = response.token_usage?.total_tokens || Math.round(charLength / 3.8);

    const hasStructuredList = /^\s*(?:\d+[\.\)]|[\*\-]\s*\*\*)/m.test(rawText);
    const hasComparisonTable = /\|[^\n]+\|[^\n]+\|\n\|[\s\-:|]+\|/m.test(rawText);

    return {
      extraction_id: `ext_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      tenant_id: config.tenant_id,
      query: response.query,
      engine: response.engine,
      timestamp: response.timestamp || new Date().toISOString(),
      target_brand_presence: targetBrandAnalysis.mentioned,
      target_brand_analysis: targetBrandAnalysis,
      competitor_analyses: competitorAnalyses,
      citations,
      citation_summary: citationSummary,
      share_of_voice: shareOfVoice,
      model_metadata: {
        engine: response.engine,
        query: response.query,
        char_length: charLength,
        word_count: wordCount,
        estimated_tokens: estimatedTokens,
        has_structured_list: hasStructuredList,
        has_comparison_table: hasComparisonTable
      }
    };
  }

  /**
   * Performs deep analysis on a specific brand (target or competitor).
   */
  private analyzeBrand(
    brandName: string,
    aliases: string[],
    rawText: string,
    citations: CitationLink[],
    isTarget: boolean,
    isCompetitor: boolean
  ): BrandMentionAnalysis {
    const allNames = [brandName, ...aliases];
    const matchedAliases: string[] = [];
    let totalMentions = 0;

    for (const name of allNames) {
      const regex = new RegExp(`\\b${escapeRegExp(name)}\\b`, 'gi');
      const matches = rawText.match(regex);
      if (matches && matches.length > 0) {
        matchedAliases.push(name);
        totalMentions += matches.length;
      }
    }

    const mentioned = totalMentions > 0;
    const rank = mentioned ? detectRecommendationRank(brandName, aliases, rawText) : null;
    const snippets = mentioned ? extractSnippets(rawText, allNames) : [];
    const sentimentAnalysis = analyzeContextSentiment(snippets);

    const hasDirectDomainCitation = citations.some(c =>
      (isTarget && c.is_target_brand_domain) ||
      (isCompetitor && c.associated_brand?.toLowerCase() === brandName.toLowerCase())
    );

    // Identify key attributes cited from context
    const keyAttributesCited: string[] = [];
    const lowerText = snippets.join(' ').toLowerCase();
    if (lowerText.includes('mid-market')) keyAttributesCited.push('Mid-Market Focus');
    if (lowerText.includes('automation') || lowerText.includes('workflow')) keyAttributesCited.push('Sales Automation');
    if (lowerText.includes('ai') || lowerText.includes('copilot') || lowerText.includes('intelligence')) keyAttributesCited.push('AI Capabilities');
    if (lowerText.includes('pricing') || lowerText.includes('cost') || lowerText.includes('/mo') || lowerText.includes('tier')) keyAttributesCited.push('Transparent Pricing');
    if (lowerText.includes('integration') || lowerText.includes('api') || lowerText.includes('ecosystem')) keyAttributesCited.push('Ecosystem Integrations');

    return {
      brand_name: brandName,
      is_target: isTarget,
      is_competitor: isCompetitor,
      mentioned,
      mention_count: totalMentions,
      matched_aliases: Array.from(new Set(matchedAliases)),
      recommendation_rank: rank,
      sentiment: sentimentAnalysis.sentiment,
      sentiment_score: sentimentAnalysis.score,
      sentiment_signals: {
        positive_phrases: sentimentAnalysis.positive_phrases,
        negative_phrases: sentimentAnalysis.negative_phrases
      },
      context_snippets: snippets,
      key_attributes_cited: keyAttributesCited,
      has_direct_domain_citation: hasDirectDomainCitation
    };
  }

  /**
   * Multi-tenant Share of Voice (SOV) and Weighted Visibility calculation.
   */
  private calculateShareOfVoice(
    targetAnalysis: BrandMentionAnalysis,
    competitorAnalyses: BrandMentionAnalysis[],
    citations: CitationLink[]
  ): ShareOfVoiceMetrics {
    const allBrands: BrandMentionAnalysis[] = [targetAnalysis, ...competitorAnalyses];
    const totalIndustryMentions = allBrands.reduce((acc, b) => acc + b.mention_count, 0);
    const totalIndustryCitations = citations.length;

    const breakdown: ShareOfVoiceMetrics['brand_visibility_breakdown'] = {};
    let totalIndustryWeightedPoints = 0;

    for (const brand of allBrands) {
      if (!brand.mentioned) {
        breakdown[brand.brand_name] = {
          raw_mentions: 0,
          rank: null,
          sentiment_score: 0,
          citation_count: 0,
          weighted_score: 0,
          share_of_voice_pct: 0
        };
        continue;
      }

      // 1. Base mention points (10 pts per mention)
      const mentionPoints = brand.mention_count * 10;

      // 2. Recommendation Rank bonus
      let rankPoints = 10; // default for mentioned but unranked
      if (brand.recommendation_rank === 1) rankPoints = 65;
      else if (brand.recommendation_rank === 2) rankPoints = 48;
      else if (brand.recommendation_rank === 3) rankPoints = 32;
      else if (brand.recommendation_rank === 4) rankPoints = 20;
      else if (brand.recommendation_rank && brand.recommendation_rank >= 5) rankPoints = 15;

      // 3. Citation count bonus (25 pts per brand-linked citation)
      const brandCitations = citations.filter(c =>
        (brand.is_target && c.is_target_brand_domain) ||
        (brand.is_competitor && c.associated_brand?.toLowerCase() === brand.brand_name.toLowerCase())
      ).length;
      const citationBonus = brandCitations * 25;

      // 4. Sentiment modifier (-40% to +40%)
      const sentimentModifier = 1 + (brand.sentiment_score * 0.4);

      // Total brand points calculation
      const rawPoints = (mentionPoints + rankPoints + citationBonus) * sentimentModifier;
      const weightedScore = Math.max(0, parseFloat(rawPoints.toFixed(2)));

      totalIndustryWeightedPoints += weightedScore;

      breakdown[brand.brand_name] = {
        raw_mentions: brand.mention_count,
        rank: brand.recommendation_rank,
        sentiment_score: brand.sentiment_score,
        citation_count: brandCitations,
        weighted_score: weightedScore,
        share_of_voice_pct: 0 // Will populate after total is known
      };
    }

    // Populate SOV percentages
    for (const brandName of Object.keys(breakdown)) {
      if (totalIndustryWeightedPoints > 0) {
        const pct = (breakdown[brandName].weighted_score / totalIndustryWeightedPoints) * 100;
        breakdown[brandName].share_of_voice_pct = parseFloat(pct.toFixed(2));
      }
    }

    const targetRawMentionShare = totalIndustryMentions > 0
      ? parseFloat(((targetAnalysis.mention_count / totalIndustryMentions) * 100).toFixed(2))
      : 0;

    const targetBreakdown = breakdown[targetAnalysis.brand_name];
    const targetSOV = targetBreakdown ? targetBreakdown.share_of_voice_pct : 0;

    // Normalize weighted visibility score to a 0-100 SaaS index
    // Score reflects positioning, citations, and positive recommendation
    let targetVisibilityIndex = 0;
    if (targetAnalysis.mentioned) {
      const rankFactor = targetAnalysis.recommendation_rank ? Math.max(0, 100 - (targetAnalysis.recommendation_rank - 1) * 20) : 40;
      const citationFactor = targetAnalysis.has_direct_domain_citation ? 30 : 0;
      const sentimentFactor = (targetAnalysis.sentiment_score + 1) * 20; // 0 to 40
      targetVisibilityIndex = Math.min(100, Math.round((rankFactor * 0.4) + citationFactor + (sentimentFactor * 0.75)));
    }

    return {
      target_raw_mention_share_pct: targetRawMentionShare,
      target_weighted_visibility_score: targetVisibilityIndex,
      brand_visibility_breakdown: breakdown,
      industry_total_mentions: totalIndustryMentions,
      industry_total_citations: totalIndustryCitations
    };
  }
}
