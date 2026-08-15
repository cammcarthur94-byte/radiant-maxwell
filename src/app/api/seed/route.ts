import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Helper endpoint to seed a sample Tenant and Campaign for Phase 1 testing
 * GET /api/seed
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Check if demo tenant exists
    const { data: existingTenants } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', 'acme-corp')
      .limit(1);

    let tenantId: string;

    if (existingTenants && existingTenants.length > 0) {
      tenantId = existingTenants[0].id;
    } else {
      const { data: newTenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: 'Acme Corp',
          slug: 'acme-corp',
          settings: { plan: 'enterprise', timezone: 'America/New_York' },
        })
        .select()
        .single();

      if (tenantError || !newTenant) {
        return NextResponse.json(
          { error: `Failed to create demo tenant: ${tenantError?.message}` },
          { status: 500 }
        );
      }
      tenantId = newTenant.id;
    }

    // Check if demo campaign exists
    const { data: existingCampaigns } = await supabase
      .from('campaigns')
      .select('*')
      .eq('tenant_id', tenantId)
      .limit(1);

    let campaign;
    if (existingCampaigns && existingCampaigns.length > 0) {
      campaign = existingCampaigns[0];
    } else {
      const { data: newCampaign, error: campError } = await supabase
        .from('campaigns')
        .insert({
          tenant_id: tenantId,
          name: 'Acme Brand Visibility Tracker',
          brand_name: 'Acme Corp',
          brand_aliases: ['Acme', 'Acme Inc', 'Acme Analytics'],
          target_domain: 'acmecorp.com',
          target_queries: [
            'best brand visibility intelligence platforms',
            'top AI overview tracking tools for enterprise',
            'how to monitor ChatGPT and Perplexity citations',
          ],
          competitors: ['BrandWatch', 'Sprout Social', 'SEMrush'],
          tracking_frequency: 'daily',
          is_active: true,
        })
        .select()
        .single();

      if (campError || !newCampaign) {
        return NextResponse.json(
          { error: `Failed to create demo campaign: ${campError?.message}` },
          { status: 500 }
        );
      }
      campaign = newCampaign;
    }

    return NextResponse.json({
      success: true,
      message: 'Demo Tenant and Campaign verified/seeded successfully.',
      tenant: { id: tenantId, name: 'Acme Corp', slug: 'acme-corp' },
      campaign: campaign,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to seed sample data' },
      { status: 500 }
    );
  }
}
