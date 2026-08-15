import { GoogleGenAI, Type, Schema } from '@google/genai';
import { promptService } from '@/lib/services/prompt-service';

export interface PromptVariationSuggestion {
  title: string;
  improvedQuery: string;
  category: string;
  intent: 'Commercial Intent' | 'Conversational / AIO' | 'Competitor Comparison' | 'Long-Tail Problem-Solution';
  expectedAdvantage: string;
  recommendedEngine: string;
  estimatedCitationLift: string;
}

export interface PromptImprovementResult {
  originalQuery: string;
  clarityScore: number;
  aiReadinessScore: number;
  critique: string;
  weaknesses: string[];
  strengths: string[];
  suggestions: PromptVariationSuggestion[];
  isLiveGemini: boolean;
  modelVersion: string;
}

const improvementOutputSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    clarityScore: {
      type: Type.INTEGER,
      description: 'Score from 0 to 100 on how clear and specific the original prompt is.',
    },
    aiReadinessScore: {
      type: Type.INTEGER,
      description: 'Score from 0 to 100 on how effectively conversational AI engines cite brands for this prompt.',
    },
    critique: {
      type: Type.STRING,
      description: 'Detailed explanation of how conversational search engines (Gemini, ChatGPT, Perplexity) interpret this query.',
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of 2-3 specific weaknesses in the wording (e.g. ambiguity, lack of buyer intent, lack of comparative criteria).',
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of 1-2 strengths in the original prompt if any.',
    },
    suggestions: {
      type: Type.ARRAY,
      description: 'List of 4 distinct high-performing prompt variations.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Short descriptive title for this variation' },
          improvedQuery: { type: Type.STRING, description: 'The rewritten prompt text' },
          category: { type: Type.STRING, description: 'Category e.g. Commercial Intent, Evaluative, Enterprise' },
          intent: {
            type: Type.STRING,
            enum: [
              'Commercial Intent',
              'Conversational / AIO',
              'Competitor Comparison',
              'Long-Tail Problem-Solution',
            ],
          },
          expectedAdvantage: {
            type: Type.STRING,
            description: 'Why this variation triggers citations, product matrices, or authority rankings in LLMs',
          },
          recommendedEngine: { type: Type.STRING, description: 'e.g. Perplexity & Gemini, ChatGPT & Copilot, All Engines' },
          estimatedCitationLift: { type: Type.STRING, description: 'e.g. +35% citation probability' },
        },
        required: [
          'title',
          'improvedQuery',
          'category',
          'intent',
          'expectedAdvantage',
          'recommendedEngine',
          'estimatedCitationLift',
        ],
      },
    },
  },
  required: ['clarityScore', 'aiReadinessScore', 'critique', 'weaknesses', 'strengths', 'suggestions'],
};

export class PromptOptimizerService {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  }

  public hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0 && !this.apiKey.includes('[SENSITIVE]');
  }

  async optimizePrompt(params: {
    query: string;
    brandName?: string;
    brandDomain?: string;
    category?: string;
    competitors?: string[];
  }): Promise<PromptImprovementResult> {
    const {
      query,
      brandName = 'Your Brand',
      brandDomain = '',
      category = 'General',
      competitors = [],
    } = params;

    const trimmedQuery = query.trim();

    if (this.hasApiKey()) {
      try {
        const ai = new GoogleGenAI({ apiKey: this.apiKey! });
        const baseInstruction = await promptService.getPrompt('gemini_prompt_optimizer_system');
        const systemInstruction = `${baseInstruction}

Original Query: "${trimmedQuery}"
Target Brand: "${brandName}" (${brandDomain})
Target Category: "${category}"
Competitors: ${competitors.join(', ')}

Evaluate the query wording. Generate:
1. Clarity score (0-100) & AI Overview readiness score (0-100).
2. Diagnostic critique & weaknesses.
3. 4 tailored variations:
   - Commercial Intent (buyer seeking recommendations / vendor selection)
   - Conversational / AIO (natural question format that triggers multi-source synthesis)
   - Competitor Comparison (explicit head-to-head benchmarking)
   - Long-Tail Problem-Solution (high-specificity query for enterprise pain points)

Ensure all rewritten queries are authentic, natural, and highly effective for citation extraction.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: systemInstruction,
          config: {
            responseMimeType: 'application/json',
            responseSchema: improvementOutputSchema,
            temperature: 0.3,
          },
        });

        const rawJson = response.text;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          return {
            originalQuery: trimmedQuery,
            clarityScore: parsed.clarityScore || 68,
            aiReadinessScore: parsed.aiReadinessScore || 62,
            critique: parsed.critique || 'Evaluated for multi-engine citation visibility.',
            weaknesses: parsed.weaknesses || ['Broad phrasing without qualification parameters'],
            strengths: parsed.strengths || ['Clear topical focus'],
            suggestions: parsed.suggestions || [],
            isLiveGemini: true,
            modelVersion: 'gemini-2.5-flash',
          };
        }
      } catch (err) {
        console.warn('Gemini Prompt Optimization failed, falling back to smart heuristic optimizer:', err);
      }
    }

    // Heuristic Smart Generator Fallback
    return this.generateHeuristicOptimization(trimmedQuery, brandName, category, competitors);
  }

  private generateHeuristicOptimization(
    query: string,
    brandName: string,
    category: string,
    competitors: string[]
  ): PromptImprovementResult {
    const cleanQuery = query.replace(/^(what is|who is|how to|best|top)/i, '').trim();
    const primaryComp = competitors[0] || 'top alternatives';

    // Calculate heuristic scores
    const wordCount = query.split(/\s+/).length;
    const hasIntentKeyword = /(best|top|vs|compare|pricing|features|tools|platforms|enterprise|alternatives)/i.test(query);
    const hasQuestionFormat = /^(how|what|which|why|is)/i.test(query);

    let clarity = 55 + Math.min(wordCount * 5, 25);
    if (hasIntentKeyword) clarity += 10;
    clarity = Math.min(Math.max(clarity, 45), 92);

    let aiReadiness = 50 + (hasQuestionFormat ? 15 : 5) + (hasIntentKeyword ? 15 : 0);
    aiReadiness = Math.min(Math.max(aiReadiness, 40), 90);

    const weaknesses: string[] = [];
    if (wordCount < 4) weaknesses.push('Query is overly terse; LLMs may default to general dictionary definitions rather than commercial recommendations.');
    if (!hasIntentKeyword) weaknesses.push('Lacks high-intent qualification tokens (e.g., "enterprise", "features", "comparison") that trigger AI citation grids.');
    if (!hasQuestionFormat && wordCount < 6) weaknesses.push('Does not leverage conversational prompting syntax favored by Perplexity & Gemini multi-step reasoning.');

    if (weaknesses.length === 0) {
      weaknesses.push('Could incorporate more specific buyer decision criteria to force citation placement.');
    }

    const suggestions: PromptVariationSuggestion[] = [
      {
        title: 'Commercial Buyer Evaluation',
        improvedQuery: `best enterprise ${cleanQuery || query} platforms with verified customer reviews and SOC2 compliance`,
        category: 'Commercial Intent',
        intent: 'Commercial Intent',
        expectedAdvantage: 'Triggers G2/TrustRadius citation synthesis and structured feature evaluation grids.',
        recommendedEngine: 'Google Gemini & Perplexity',
        estimatedCitationLift: '+42% citation probability',
      },
      {
        title: 'Conversational AIO Multi-Source',
        improvedQuery: `What are the top recommended ${cleanQuery || query} solutions for scaling teams in 2026, and how do they compare?`,
        category: 'AIO Question',
        intent: 'Conversational / AIO',
        expectedAdvantage: 'Directly triggers AI Overview bullet lists and multi-source web domain citations.',
        recommendedEngine: 'ChatGPT & Perplexity',
        estimatedCitationLift: '+38% citation probability',
      },
      {
        title: 'Head-to-Head Competitor Benchmark',
        improvedQuery: `${brandName} vs ${primaryComp} for ${cleanQuery || query}: feature breakdown, pros & cons, and pricing`,
        category: 'Competitor Comparison',
        intent: 'Competitor Comparison',
        expectedAdvantage: 'Forces conversational engines to directly evaluate target brand positioning against rival.',
        recommendedEngine: 'All Engines (Gemini, ChatGPT, Copilot)',
        estimatedCitationLift: '+55% citation probability',
      },
      {
        title: 'Long-Tail Technical / Problem-Solving',
        improvedQuery: `how to implement automated ${cleanQuery || query} with native API integrations and real-time tracking`,
        category: 'Technical / How-To',
        intent: 'Long-Tail Problem-Solution',
        expectedAdvantage: 'Captures high-intent technical decision-makers and developer documentation citations.',
        recommendedEngine: 'Perplexity & Copilot',
        estimatedCitationLift: '+30% citation probability',
      },
    ];

    return {
      originalQuery: query,
      clarityScore: clarity,
      aiReadinessScore: aiReadiness,
      critique: `The query "${query}" provides a baseline keyword foundation, but conversational AI models synthesize richer overviews when queries include explicit evaluation criteria, comparison anchors, and natural language framing.`,
      weaknesses,
      strengths: [
        'Clear core subject matter',
        'Direct relevance to target category',
      ],
      suggestions,
      isLiveGemini: false,
      modelVersion: 'heuristic-geo-engine',
    };
  }
}
