import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DashboardDataService } from '@/lib/services/dashboard-data-service';
import { DateRangeOption, PlatformOption } from '@/types/dashboard';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard
 * Live data fetching endpoint for Dashboard metrics with strict multi-tenant isolation.
 *
 * Query Params:
 *  - tenantId (optional, defaults to first active tenant)
 *  - dateRange: '7d' | '30d' | '90d' (default: '30d')
 *  - platform: 'all' | 'chatgpt' | 'perplexity' | 'gemini' | 'copilot'
 *  - campaignId: string (default: 'all')
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantIdParam = searchParams.get('tenantId');
    const dateRangeParam = searchParams.get('range') || searchParams.get('dateRange') || '30d';
    const dateRange = (['7d', '30d', '90d', 'all'].includes(dateRangeParam) ? dateRangeParam : '30d') as DateRangeOption;
    const platform = (searchParams.get('platform') || 'all') as PlatformOption;
    const campaignId = searchParams.get('campaign') || searchParams.get('campaignId') || 'all';

    const supabase = createAdminClient();
    const service = new DashboardDataService(supabase);

    // 1. Fetch accessible tenants
    const tenants = await service.getTenants();
    const activeTenantId = tenantIdParam || tenants[0]?.id;

    if (!activeTenantId) {
      return NextResponse.json(
        { error: 'No active tenant found in system.' },
        { status: 404 }
      );
    }

    // 2. Fetch aggregated dashboard data strictly scoped to activeTenantId
    const dashboardData = await service.getDashboardData(activeTenantId, {
      dateRange,
      platform,
      campaignId,
    });

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error: any) {
    console.error('Dashboard data query error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch dashboard data',
      },
      { status: 500 }
    );
  }
}
