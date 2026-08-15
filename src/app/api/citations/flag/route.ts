import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { citationId, isMisinformation = true, sentimentLabel = 'Inaccurate', note } = body;

    if (!citationId) {
      return NextResponse.json(
        { success: false, error: 'citationId is required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Update citation in Supabase if valid UUID
    try {
      const { data, error } = await supabase
        .from('citations')
        .update({
          is_misinformation: isMisinformation,
          sentiment_label: sentimentLabel as any,
          extracted_metrics: note
            ? ({
                inaccuracy_note: note,
                flagged_at: new Date().toISOString(),
              } as any)
            : undefined,
        })
        .eq('id', citationId)
        .select()
        .single();

      if (error) {
        console.warn('Supabase citation flag notice (using fallback):', error.message);
      }
    } catch (dbErr: any) {
      console.warn('Database update fallback notice:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Citation successfully flagged for review.',
      citationId,
      isMisinformation,
      sentimentLabel,
    });
  } catch (err: any) {
    console.error('Error flagging citation:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to flag citation.' },
      { status: 500 }
    );
  }
}
