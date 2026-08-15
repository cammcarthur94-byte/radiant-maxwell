import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { GeoRecommendationService } from '@/lib/services/geo-recommendation-service';
import {
  GeoRecommendationCategory,
  GeoRecommendationPriority,
  GeoRecommendationStatus,
} from '@/types/dashboard';

export const dynamic = 'force-dynamic';

/**
 * GET /api/recommendations
 * Query Params:
 *  - tenantId: string (required or defaults to first tenant)
 *  - category: 'all' | 'source_citation' | 'content_schema' | 'competitor_gap'
 *  - priority: 'all' | 'high' | 'medium' | 'quick_win'
 *  - status: 'all' | 'pending' | 'in_progress' | 'completed' | 'dismissed'
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantIdParam = searchParams.get('tenantId');
    const category = (searchParams.get('category') || 'all') as GeoRecommendationCategory | 'all';
    const priority = (searchParams.get('priority') || 'all') as GeoRecommendationPriority | 'all';
    const status = (searchParams.get('status') || 'all') as GeoRecommendationStatus | 'all';

    const supabase = createAdminClient();

    let tenantId = tenantIdParam || '6be44719-b8a1-4f61-a899-dcce78a31a95';
    if (!tenantIdParam) {
      const { data: firstTenant } = await supabase
        .from('tenants')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (firstTenant?.id) {
        tenantId = firstTenant.id;
      }
    }

    const service = new GeoRecommendationService(supabase);
    const result = await service.getRecommendations(tenantId, {
      category,
      priority,
      status,
    });

    // If no recommendations exist yet for this tenant, generate initial recommendations
    if (result.items.length === 0 && (!status || status === 'all' || status === 'pending')) {
      const initialGen = await service.generateRecommendations(tenantId);
      return NextResponse.json({
        success: true,
        data: {
          items: initialGen.recommendations,
          stats: {
            total: initialGen.count,
            pending: initialGen.count,
            inProgress: 0,
            completed: 0,
            highPriority: initialGen.recommendations.filter((r) => r.priority === 'high').length,
          },
          isLiveGemini: initialGen.isLiveGemini,
          modelVersion: initialGen.modelVersion,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        items: result.items,
        stats: result.stats,
        isLiveGemini: service.hasApiKey(),
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/recommendations:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations
 * Generates fresh AI recommendations on-demand for a tenant
 * Body: { tenantId: string, force?: boolean, visibilityScore?: number }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { tenantId, force = true, visibilityScore } = body;

    const supabase = createAdminClient();

    let activeTenantId = tenantId;
    if (!activeTenantId) {
      const { data: firstTenant } = await supabase
        .from('tenants')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      activeTenantId = firstTenant?.id || '6be44719-b8a1-4f61-a899-dcce78a31a95';
    }

    const service = new GeoRecommendationService(supabase);
    const result = await service.generateRecommendations(activeTenantId, {
      force,
      visibilityScore,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error in POST /api/recommendations:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/recommendations
 * Updates the status of a specific recommendation
 * Body: { id: string, tenantId: string, status: 'pending' | 'in_progress' | 'completed' | 'dismissed' }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, tenantId, status } = body;

    if (!id || !tenantId || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: id, tenantId, status' },
        { status: 400 }
      );
    }

    const validStatuses: GeoRecommendationStatus[] = ['pending', 'in_progress', 'completed', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const service = new GeoRecommendationService(supabase);
    const updated = await service.updateRecommendationStatus(id, tenantId, status);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update recommendation status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Recommendation status updated successfully',
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/recommendations:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
