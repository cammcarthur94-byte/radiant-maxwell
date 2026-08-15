import { NextRequest, NextResponse } from 'next/server';
import { PromptOptimizerService } from '@/lib/services/prompt-optimizer-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, brandName, brandDomain, category, competitors } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Query is required to perform prompt improvement.' },
        { status: 400 }
      );
    }

    const optimizer = new PromptOptimizerService();
    const result = await optimizer.optimizePrompt({
      query: query.trim(),
      brandName,
      brandDomain,
      category,
      competitors,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error optimizing prompt:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to optimize prompt.' },
      { status: 500 }
    );
  }
}
