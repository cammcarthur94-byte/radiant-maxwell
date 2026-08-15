import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { promptService, DEFAULT_PROMPT_TEMPLATES } from '@/lib/services/prompt-service';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const prompts = await promptService.getAllPrompts(supabase);

    return NextResponse.json({
      success: true,
      prompts,
      count: prompts.length,
      defaultTemplatesCount: Object.keys(DEFAULT_PROMPT_TEMPLATES).length,
    });
  } catch (error: any) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch prompt templates',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt_key, prompt_text, model_target, description, category, is_active } = body;

    if (!prompt_key || typeof prompt_key !== 'string') {
      return NextResponse.json(
        { success: false, error: 'prompt_key is required and must be a string.' },
        { status: 400 }
      );
    }

    if (!prompt_text || typeof prompt_text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'prompt_text is required and must be a string.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const updated = await promptService.updatePrompt(
      prompt_key,
      {
        prompt_text,
        model_target: model_target || 'gemini-1.5-flash',
        description: description ?? null,
        category: category || 'extraction',
        is_active: is_active ?? true,
      },
      supabase
    );

    return NextResponse.json({
      success: true,
      message: `Prompt '${prompt_key}' successfully updated and cache invalidated.`,
      prompt: updated,
    });
  } catch (error: any) {
    console.error('Error updating prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update prompt template',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const promptKey = searchParams.get('prompt_key');

    if (!promptKey) {
      return NextResponse.json(
        { success: false, error: 'prompt_key query parameter is required.' },
        { status: 400 }
      );
    }

    const defaultTpl = DEFAULT_PROMPT_TEMPLATES[promptKey];
    if (!defaultTpl) {
      return NextResponse.json(
        { success: false, error: `No default template found for key '${promptKey}'.` },
        { status: 404 }
      );
    }

    const supabase = createAdminClient();
    const restored = await promptService.updatePrompt(
      promptKey,
      {
        prompt_text: defaultTpl.prompt_text,
        model_target: defaultTpl.model_target,
        description: defaultTpl.description,
        category: defaultTpl.category,
        is_active: true,
      },
      supabase
    );

    return NextResponse.json({
      success: true,
      message: `Prompt '${promptKey}' restored to factory default.`,
      prompt: restored,
    });
  } catch (error: any) {
    console.error('Error resetting prompt:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to reset prompt template',
      },
      { status: 500 }
    );
  }
}
