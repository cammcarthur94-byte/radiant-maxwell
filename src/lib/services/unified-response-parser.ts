import { GroundingCitation, EngineRawResult } from './engines/engine-types';
import { MentionSentiment } from '@/types/database';

export interface BrandTargetProfile {
  name: string;
  domain: string;
  aliases: string[];
  competitors: Array<{
    name: string;
    domain: string;
    aliases: string[];
  }>;
}

export interface ParsedBrandMention {
  brandName: string;
  isTargetBrand: boolean;
  isCompetitor: boolean;
  mentioned: boolean;
  mentionCount: number;
  matchedAliases: string[];
  recommendationRank: number | null; // 1-indexed recommendation rank
  prominenceScore: number; // 0 - 100
  prominenceTier: 'primary_recommendation' | 'secondary_mention' | 'footnote_citation' | 'not_mentioned';
  contextSnippets: string[];
  sentiment: MentionSentiment;
  sentimentScore: number; // -1.0 to +1.0
  positiveSignals: string[];
  negativeSignals: string[];
  hasDirectDomainCitation: boolean;
}

export interface UnifiedParsedResponse {
  engineId: string;
  platform: string;
  modelName: string;
  query: string;
  cleanedText: string;
  rawText: string;
  targetBrand: ParsedBrandMention;
  competitors: ParsedBrandMention[];
  citations: GroundingCitation[];
  domainMatches: string[];
  shareOfVoiceScore: number; // 0 - 100
  recommendationRank: number | null;
  prominenceScore: number; // 0 - 100
  prominenceTier: 'primary_recommendation' | 'secondary_mention' | 'footnote_citation' | 'not_mentioned';
  sentiment: MentionSentiment;
  sentimentScore: number;
  extractedSnippets: string[];
}

export class UnifiedResponseParser {
  private static POSITIVE_KEYWORDS = [
    'best', 'top', 'leading', 'leader', 'excellent', 'superior', 'recommended',
    'premier', 'state-of-the-art', 'outstanding', 'robust', 'powerful', 'fast',
    'accurate', 'high-precision', 'preferred', 'effective', 'champion', 'first choice',
    'innovative', 'reliable', 'easy-to-use', 'seamless'
  ];

  private static NEGATIVE_KEYWORDS = [
    'worst', 'poor', 'slow', 'expensive', 'lacks', 'limited', 'inferior',
    'difficult', 'outdated', 'clunky', 'issues', 'drawback', 'trade-off',
    'failing', 'unreliable', 'avoid', 'weakness', 'bugs', 'steep learning curve'
  ];

  /**
   * Main parsing entry point
   */
  public parse(engineResult: EngineRawResult, targetProfile: BrandTargetProfile): UnifiedParsedResponse {
    const rawText = engineResult.rawText || '';
    const cleanedText = this.stripMarkdownAndHtml(rawText);
    const sentences = this.splitIntoSentences(cleanedText);

    // 1. Analyze Target Brand
    const targetBrandAnalysis = this.analyzeBrandEntity(
      targetProfile.name,
      targetProfile.domain,
      targetProfile.aliases,
      true,
      false,
      rawText,
      cleanedText,
      sentences,
      engineResult.citations
    );

    // 2. Analyze Competitors
    const competitorAnalyses = targetProfile.competitors.map((comp) =>
      this.analyzeBrandEntity(
        comp.name,
        comp.domain,
        comp.aliases,
        false,
        true,
        rawText,
        cleanedText,
        sentences,
        engineResult.citations
      )
    );

    // 3. Compute Share of Voice & Domain Matches
    const domainMatches = this.extractDomainMatches(rawText, engineResult.citations);
    const shareOfVoiceScore = this.calculateShareOfVoice(targetBrandAnalysis, competitorAnalyses);

    return {
      engineId: engineResult.engineId || engineResult.engine || 'google_aio',
      platform: engineResult.platform || (engineResult.engineId === 'google_aio' || engineResult.engine === 'google_aio' ? 'google_aio' : 'gemini'),
      modelName: engineResult.modelName || engineResult.model || 'google-ai-overview',
      query: engineResult.query,
      cleanedText,
      rawText,
      targetBrand: targetBrandAnalysis,
      competitors: competitorAnalyses,
      citations: engineResult.citations || [],
      domainMatches,
      shareOfVoiceScore,
      recommendationRank: targetBrandAnalysis.recommendationRank,
      prominenceScore: targetBrandAnalysis.prominenceScore,
      prominenceTier: targetBrandAnalysis.prominenceTier,
      sentiment: targetBrandAnalysis.sentiment,
      sentimentScore: targetBrandAnalysis.sentimentScore,
      extractedSnippets: targetBrandAnalysis.contextSnippets,
    };
  }

  /**
   * Deep Entity Analysis for Brand or Competitor
   */
  private analyzeBrandEntity(
    brandName: string,
    brandDomain: string,
    aliases: string[],
    isTarget: boolean,
    isCompetitor: boolean,
    rawText: string,
    cleanedText: string,
    sentences: string[],
    citations: GroundingCitation[]
  ): ParsedBrandMention {
    const allAliases = Array.from(
      new Set(
        [brandName, brandDomain, ...aliases]
          .filter(Boolean)
          .map((a) => a.trim().toLowerCase())
      )
    );

    // 1. Regex Brand Matching
    const matchedAliases: string[] = [];
    let mentionCount = 0;

    for (const alias of allAliases) {
      if (alias.length < 2) continue;
      // Word boundary regex with case-insensitivity
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      const matches = rawText.match(regex);
      if (matches && matches.length > 0) {
        matchedAliases.push(alias);
        mentionCount += matches.length;
      }
    }

    // Check domain citation presence
    const normalizedDomain = brandDomain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    const hasDirectDomainCitation = (citations || []).some(
      (c) => c.domain && (c.domain.includes(normalizedDomain) || normalizedDomain.includes(c.domain))
    );

    const mentioned = mentionCount > 0 || hasDirectDomainCitation;

    // 2. Extract Surrounding Context Snippets (2-3 sentences around each match)
    const contextSnippets = this.extractSurroundingSnippets(sentences, allAliases);

    // 3. Extract Recommendation Rank
    const recommendationRank = this.detectRecommendationRank(rawText, allAliases);

    // 4. Calculate Position & Prominence Scoring
    const { prominenceScore, prominenceTier } = this.calculateProminenceScore(
      rawText,
      allAliases,
      recommendationRank,
      mentionCount,
      hasDirectDomainCitation,
      mentioned
    );

    // 5. Sentiment Analysis & Signals
    const { sentiment, sentimentScore, positiveSignals, negativeSignals } = this.analyzeSentiment(
      contextSnippets.join(' ')
    );

    return {
      brandName,
      isTargetBrand: isTarget,
      isCompetitor,
      mentioned,
      mentionCount,
      matchedAliases,
      recommendationRank,
      prominenceScore,
      prominenceTier,
      contextSnippets,
      sentiment,
      sentimentScore,
      positiveSignals,
      negativeSignals,
      hasDirectDomainCitation,
    };
  }

  /**
   * Multi-tiered Prominence Scoring:
   * - Primary Recommendation: 80 - 100
   * - Secondary Mention: 40 - 79
   * - Footnote / Citation link only: 10 - 39
   * - Not Mentioned: 0
   */
  private calculateProminenceScore(
    rawText: string,
    aliases: string[],
    rank: number | null,
    mentionCount: number,
    hasCitation: boolean,
    mentioned: boolean
  ): { prominenceScore: number; prominenceTier: 'primary_recommendation' | 'secondary_mention' | 'footnote_citation' | 'not_mentioned' } {
    if (!mentioned) {
      return { prominenceScore: 0, prominenceTier: 'not_mentioned' };
    }

    // Check if listed as Rank 1, 2, or 3
    if (rank === 1) {
      const score = Math.min(100, 90 + Math.min(mentionCount * 2, 10));
      return { prominenceScore: score, prominenceTier: 'primary_recommendation' };
    }
    if (rank === 2) {
      return { prominenceScore: 85, prominenceTier: 'primary_recommendation' };
    }
    if (rank === 3) {
      return { prominenceScore: 80, prominenceTier: 'primary_recommendation' };
    }

    // Check if mentioned in top 25% of text
    const lower = rawText.toLowerCase();
    let earliestIndex = Infinity;
    for (const alias of aliases) {
      const idx = lower.indexOf(alias);
      if (idx !== -1 && idx < earliestIndex) earliestIndex = idx;
    }

    const relativePosition = rawText.length > 0 ? earliestIndex / rawText.length : 1;

    if (relativePosition < 0.35 && mentionCount >= 2) {
      return { prominenceScore: 75, prominenceTier: 'secondary_mention' };
    } else if (mentionCount >= 1) {
      const score = Math.min(70, 45 + mentionCount * 5);
      return { prominenceScore: score, prominenceTier: 'secondary_mention' };
    }

    // Only in footnotes or citation links
    if (hasCitation && mentionCount === 0) {
      return { prominenceScore: 25, prominenceTier: 'footnote_citation' };
    }

    return { prominenceScore: 40, prominenceTier: 'secondary_mention' };
  }

  /**
   * Detects list/rank (e.g., "1. BrandName", "#1 BrandName", "Top Pick: BrandName")
   */
  private detectRecommendationRank(text: string, aliases: string[]): number | null {
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase();
      for (const alias of aliases) {
        if (line.includes(alias)) {
          // Check numbered list patterns: "1. Brand", "1) Brand", "#1 Brand", "1 - Brand"
          const rankMatch = line.match(/^(?:#|\b)?([1-9]|10)[\.\)\:\-]\s+/i);
          if (rankMatch) {
            return parseInt(rankMatch[1], 10);
          }
          if (line.includes('top pick') || line.includes('best overall') || line.includes('1st')) {
            return 1;
          }
          if (line.includes('runner up') || line.includes('2nd')) {
            return 2;
          }
          if (line.includes('3rd')) {
            return 3;
          }
        }
      }
    }
    return null;
  }

  /**
   * Extracts 2-3 sentence context windows around brand occurrences
   */
  private extractSurroundingSnippets(sentences: string[], aliases: string[]): string[] {
    const matchedSnippetIndices = new Set<number>();

    for (let i = 0; i < sentences.length; i++) {
      const lower = sentences[i].toLowerCase();
      const containsBrand = aliases.some((a) => lower.includes(a));
      if (containsBrand) {
        matchedSnippetIndices.add(i);
      }
    }

    const snippets: string[] = [];
    const processedIndices = new Set<number>();

    for (const idx of matchedSnippetIndices) {
      if (processedIndices.has(idx)) continue;

      const start = Math.max(0, idx - 1);
      const end = Math.min(sentences.length - 1, idx + 1);

      for (let s = start; s <= end; s++) processedIndices.add(s);

      const snippet = sentences.slice(start, end + 1).join(' ').trim();
      if (snippet.length > 20) {
        snippets.push(snippet);
      }
    }

    return snippets.slice(0, 3); // Return up to top 3 context windows
  }

  /**
   * Analyzes sentiment from extracted text
   */
  private analyzeSentiment(text: string): {
    sentiment: MentionSentiment;
    sentimentScore: number;
    positiveSignals: string[];
    negativeSignals: string[];
  } {
    const lower = text.toLowerCase();
    const positiveSignals = UnifiedResponseParser.POSITIVE_KEYWORDS.filter((k) => lower.includes(k));
    const negativeSignals = UnifiedResponseParser.NEGATIVE_KEYWORDS.filter((k) => lower.includes(k));

    let score = 0.0;
    if (positiveSignals.length > 0 || negativeSignals.length > 0) {
      score = (positiveSignals.length - negativeSignals.length) / Math.max(1, positiveSignals.length + negativeSignals.length);
    }

    let sentiment: MentionSentiment = 'neutral';
    if (score > 0.25) sentiment = 'positive';
    else if (score < -0.25) sentiment = 'negative';
    else if (positiveSignals.length > 0 && negativeSignals.length > 0) sentiment = 'mixed';

    return {
      sentiment,
      sentimentScore: parseFloat(score.toFixed(2)),
      positiveSignals,
      negativeSignals,
    };
  }

  /**
   * Computes comparative Share of Voice Score (0 - 100)
   */
  private calculateShareOfVoice(target: ParsedBrandMention, competitors: ParsedBrandMention[]): number {
    if (!target.mentioned) return 0;

    let targetPoints = target.prominenceScore * (1 + target.sentimentScore * 0.2);
    let totalPoints = targetPoints;

    for (const comp of competitors) {
      if (comp.mentioned) {
        const compPoints = comp.prominenceScore * (1 + comp.sentimentScore * 0.2);
        totalPoints += compPoints;
      }
    }

    if (totalPoints <= 0) return 50.0;
    const sov = (targetPoints / totalPoints) * 100;
    return parseFloat(Math.min(100, Math.max(0, sov)).toFixed(1));
  }

  private extractDomainMatches(text: string, citations: GroundingCitation[]): string[] {
    const domains = new Set<string>();
    for (const c of citations || []) {
      if (c.domain) domains.add(c.domain);
    }
    const domainRegex = /\b([a-zA-Z0-9-]+\.(?:com|org|net|io|ai|co|app|dev))\b/gi;
    let match: RegExpExecArray | null;
    while ((match = domainRegex.exec(text)) !== null) {
      domains.add(match[1].toLowerCase());
    }
    return Array.from(domains);
  }

  private stripMarkdownAndHtml(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // remove HTML tags
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
      .replace(/[#*_~`]/g, '') // remove Markdown symbols
      .replace(/\n\s*\n/g, '\n') // normalize newlines
      .trim();
  }

  private splitIntoSentences(text: string): string[] {
    return text
      .split(/(?<=[.?!])\s+(?=[A-Z0-9])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);
  }
}

export const globalUnifiedResponseParser = new UnifiedResponseParser();
