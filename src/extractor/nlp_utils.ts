import { BrandTargetConfig, CitationLink, SentimentType } from './types';

// Domain classification heuristics
const REVIEW_DOMAINS = [
  'g2.com', 'capterra.com', 'trustradius.com', 'gartner.com',
  'softwareadvice.com', 'getapp.com', 'trustpilot.com'
];

const TECH_MEDIA_DOMAINS = [
  'techcrunch.com', 'venturebeat.com', 'forbes.com', 'techradar.com',
  'zdnet.com', 'wired.com', 'theverge.com', 'businessinsider.com'
];

export function extractDomain(url: string): string {
  try {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    const parsed = new URL(cleanUrl);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
  }
}

export function categorizeSourceDomain(domain: string, config: BrandTargetConfig): {
  category: CitationLink['source_category'];
  isTarget: boolean;
  isCompetitor: boolean;
  associatedBrand?: string;
} {
  const normDomain = domain.toLowerCase();
  const targetDomain = extractDomain(config.primary_domain);
  const altTargetDomains = (config.alternate_domains || []).map(extractDomain);

  if (normDomain === targetDomain || altTargetDomains.includes(normDomain)) {
    return { category: 'brand_direct', isTarget: true, isCompetitor: false, associatedBrand: config.name };
  }

  for (const comp of config.competitors) {
    const compDomain = extractDomain(comp.primary_domain);
    if (normDomain === compDomain || normDomain.endsWith('.' + compDomain)) {
      return { category: 'brand_direct', isTarget: false, isCompetitor: true, associatedBrand: comp.name };
    }
  }

  if (REVIEW_DOMAINS.some(d => normDomain === d || normDomain.endsWith('.' + d))) {
    return { category: 'review_platform', isTarget: false, isCompetitor: false };
  }

  if (TECH_MEDIA_DOMAINS.some(d => normDomain === d || normDomain.endsWith('.' + d))) {
    return { category: 'tech_publication', isTarget: false, isCompetitor: false };
  }

  return { category: 'other', isTarget: false, isCompetitor: false };
}

// Extract markdown links, footnote citations, and plain URLs from text
export function parseCitationsFromText(
  text: string,
  groundingSources: Array<{ url: string; title?: string; snippet?: string; source_id?: string | number }> = [],
  config: BrandTargetConfig
): CitationLink[] {
  const citations: CitationLink[] = [];
  const seenUrls = new Set<string>();

  // 1. Parse markdown links: [Anchor Text](https://url.com)
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/gi;
  let match: RegExpExecArray | null;

  while ((match = markdownLinkRegex.exec(text)) !== null) {
    const anchorText = match[1].trim();
    const url = match[2].trim();
    const domain = extractDomain(url);
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      const cat = categorizeSourceDomain(domain, config);
      citations.push({
        index: citations.length + 1,
        anchor_text: anchorText,
        url,
        domain,
        is_target_brand_domain: cat.isTarget,
        is_competitor_domain: cat.isCompetitor,
        associated_brand: cat.associatedBrand,
        source_category: cat.category
      });
    }
  }

  // 2. Parse grounding sources provided directly by AIO / Perplexity metadata
  for (const gs of groundingSources) {
    const url = gs.url?.trim();
    if (url && !seenUrls.has(url)) {
      seenUrls.add(url);
      const domain = extractDomain(url);
      const cat = categorizeSourceDomain(domain, config);
      citations.push({
        index: citations.length + 1,
        anchor_text: gs.title || domain,
        url,
        domain,
        is_target_brand_domain: cat.isTarget,
        is_competitor_domain: cat.isCompetitor,
        associated_brand: cat.associatedBrand,
        source_category: cat.category,
        footnote_reference: gs.source_id ? `[${gs.source_id}]` : undefined
      });
    }
  }

  // 3. Parse standalone bracketed URLs e.g. [1] https://... or Source: https://...
  const rawUrlRegex = /(?:source:\s*|sources:\s*|href=")?(https?:\/\/[^\s\<\>"\)]+)/gi;
  while ((match = rawUrlRegex.exec(text)) !== null) {
    const url = match[1].trim().replace(/[.,;]$/, '');
    if (!seenUrls.has(url)) {
      seenUrls.add(url);
      const domain = extractDomain(url);
      const cat = categorizeSourceDomain(domain, config);
      citations.push({
        index: citations.length + 1,
        anchor_text: domain,
        url,
        domain,
        is_target_brand_domain: cat.isTarget,
        is_competitor_domain: cat.isCompetitor,
        associated_brand: cat.associatedBrand,
        source_category: cat.category
      });
    }
  }

  return citations;
}

// Sentiment lexicons for AI recommendation contexts
const POSITIVE_LEXICON = [
  'best for', 'top choice', 'market leader', 'highly recommended', 'cost-effective',
  'exceptional', 'intuitive', 'easy to use', 'fast setup', 'standout', 'seamless',
  'scalable', 'robust', 'powerful automation', 'great value', 'industry standard',
  'top-rated', 'flexible', 'strong integration', 'modern UI', 'cutting-edge',
  'ideal for mid-market', 'superior', 'reliable', 'high adoption'
];

const NEGATIVE_LEXICON = [
  'steep learning curve', 'expensive', 'hidden fees', 'complex configuration',
  'lacks native', 'sluggish', 'poor customer support', 'limited customization',
  'overkill for', 'clunky', 'outdated interface', 'frequent bugs', 'high maintenance',
  'difficult to migrate', 'costly add-ons', 'weak reporting', 'lacks depth'
];

export function analyzeContextSentiment(contextSnippets: string[]): {
  sentiment: SentimentType;
  score: number;
  positive_phrases: string[];
  negative_phrases: string[];
} {
  if (contextSnippets.length === 0) {
    return { sentiment: 'neutral', score: 0, positive_phrases: [], negative_phrases: [] };
  }

  const fullContext = contextSnippets.join(' ').toLowerCase();
  const positiveFound: string[] = [];
  const negativeFound: string[] = [];

  for (const phrase of POSITIVE_LEXICON) {
    if (fullContext.includes(phrase)) {
      positiveFound.push(phrase);
    }
  }

  for (const phrase of NEGATIVE_LEXICON) {
    if (fullContext.includes(phrase)) {
      negativeFound.push(phrase);
    }
  }

  const posCount = positiveFound.length;
  const negCount = negativeFound.length;
  const total = posCount + negCount;

  let score = 0;
  if (total > 0) {
    score = (posCount - negCount) / Math.max(total, 1);
  }

  // Clamp between -1.0 and 1.0
  score = Math.max(-1.0, Math.min(1.0, score));

  let sentiment: SentimentType = 'neutral';
  if (score >= 0.25) {
    sentiment = 'positive';
  } else if (score <= -0.25) {
    sentiment = 'negative';
  }

  return {
    sentiment,
    score: parseFloat(score.toFixed(2)),
    positive_phrases: positiveFound,
    negative_phrases: negativeFound
  };
}

// Detect recommendation rank based on list numbering or heading position
export function detectRecommendationRank(brandName: string, aliases: string[], text: string): number | null {
  const allNames = [brandName, ...aliases];
  const lines = text.split('\n');

  let currentRankCounter = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    // Matches numbered items e.g., "1. **AcmeCRM**", "1) AcmeCRM", "### 1. AcmeCRM"
    const matchNumbered = trimmed.match(/^(?:###\s*)?(\d+)[\.\)]\s*(.*)$/i);
    if (matchNumbered) {
      currentRankCounter = parseInt(matchNumbered[1], 10);
      const restOfLine = matchNumbered[2];
      for (const name of allNames) {
        const regex = new RegExp(`\\b${escapeRegExp(name)}\\b`, 'i');
        if (regex.test(restOfLine)) {
          return currentRankCounter;
        }
      }
    }

    // Matches bold bulleted lists like "- **AcmeCRM**:" or "* **AcmeCRM** (Best for...)"
    const bulletMatch = trimmed.match(/^[\*\-]\s*\*\*([^\*]+)\*\*/i);
    if (bulletMatch) {
      const itemTitle = bulletMatch[1];
      for (const name of allNames) {
        const regex = new RegExp(`\\b${escapeRegExp(name)}\\b`, 'i');
        if (regex.test(itemTitle)) {
          return currentRankCounter > 0 ? currentRankCounter : null;
        }
      }
    }
  }

  // Fallback: check if brand appears in "Top pick" or "#1" statements
  for (const name of allNames) {
    const pattern = new RegExp(`(?:#(\\d+)|rank(?:ed)?\\s*#?(\\d+)|(?:top|first|1st)\\s+pick)\\s*(?:is|:)?\\s*.*\\b${escapeRegExp(name)}\\b`, 'i');
    const m = text.match(pattern);
    if (m) {
      if (m[1]) return parseInt(m[1], 10);
      if (m[2]) return parseInt(m[2], 10);
      return 1;
    }
  }

  return null;
}

export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Extract context snippets around brand mentions
export function extractSnippets(text: string, names: string[], windowChars: number = 160): string[] {
  const snippets: string[] = [];
  const sentences = text.split(/(?<=[.!?\n])\s+/);

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    for (const name of names) {
      const regex = new RegExp(`\\b${escapeRegExp(name)}\\b`, 'i');
      if (regex.test(trimmed)) {
        snippets.push(trimmed);
        break;
      }
    }
  }

  // If no clean sentences found, use window slicing
  if (snippets.length === 0) {
    for (const name of names) {
      const regex = new RegExp(`\\b${escapeRegExp(name)}\\b`, 'gi');
      let m: RegExpExecArray | null;
      while ((m = regex.exec(text)) !== null) {
        const start = Math.max(0, m.index - windowChars / 2);
        const end = Math.min(text.length, m.index + name.length + windowChars / 2);
        snippets.push(text.slice(start, end).replace(/\n+/g, ' ').trim());
      }
    }
  }

  return snippets.slice(0, 5); // Return up to 5 best snippets
}
