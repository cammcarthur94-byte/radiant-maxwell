import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/tenants/aliases?tenantId=...
 * Returns the brand aliases configured for the specified tenant.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required.' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch tenant settings and campaigns aliases
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, name, settings, aliases')
      .eq('id', tenantId)
      .maybeSingle();

    if (tenantError) {
      throw new Error(`Failed to fetch tenant: ${tenantError.message}`);
    }

    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, name, brand_name, brand_aliases, aliases')
      .eq('tenant_id', tenantId);

    const tenantSettings = (tenant?.settings as any) || {};
    const tenantAliases: string[] = Array.isArray(tenant?.aliases) && tenant.aliases.length > 0
      ? tenant.aliases
      : Array.isArray(tenantSettings.aliases)
      ? tenantSettings.aliases
      : [];

    const campaignAliases = (campaigns || []).flatMap((c: any) => [
      ...(Array.isArray(c.aliases) ? c.aliases : []),
      ...(Array.isArray(c.brand_aliases) ? c.brand_aliases : [])
    ]);

    const combinedAliases = Array.from(
      new Set(
        [...tenantAliases, ...campaignAliases]
          .map((a) => (typeof a === 'string' ? a.trim() : ''))
          .filter(Boolean)
      )
    );

    return NextResponse.json({
      success: true,
      tenantId,
      brandName: tenant?.name || 'Unknown Brand',
      aliases: combinedAliases,
      campaignCount: campaigns?.length || 0,
    });
  } catch (error: any) {
    console.error('Error fetching brand aliases:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch brand aliases' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenants/aliases
 * Updates the aliases array for the tenant and all associated active campaigns.
 * Body: { tenantId: string, aliases: string[] }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, aliases } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required.' }, { status: 400 });
    }

    if (!Array.isArray(aliases)) {
      return NextResponse.json({ error: 'aliases must be an array of strings.' }, { status: 400 });
    }

    const cleanedAliases = Array.from(
      new Set(
        aliases
          .map((a) => (typeof a === 'string' ? a.trim() : ''))
          .filter((a) => a.length > 0)
      )
    );

    const supabase = createAdminClient();

    // 1. Fetch existing tenant to preserve other settings
    const { data: tenant, error: fetchErr } = await supabase
      .from('tenants')
      .select('id, settings')
      .eq('id', tenantId)
      .single();

    if (fetchErr || !tenant) {
      return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 });
    }

    const updatedSettings = {
      ...((tenant.settings as any) || {}),
      aliases: cleanedAliases,
    };

    // 2. Update tenant record (settings and aliases column if exists)
    try {
      await supabase
        .from('tenants')
        .update({
          settings: updatedSettings,
          aliases: cleanedAliases,
        } as any)
        .eq('id', tenantId);
    } catch {
      await supabase
        .from('tenants')
        .update({
          settings: updatedSettings,
        } as any)
        .eq('id', tenantId);
    }

    // 3. Propagate aliases to all campaigns under this tenant
    try {
      await supabase
        .from('campaigns')
        .update({
          brand_aliases: cleanedAliases,
          aliases: cleanedAliases,
        } as any)
        .eq('tenant_id', tenantId);
    } catch {
      await supabase
        .from('campaigns')
        .update({
          brand_aliases: cleanedAliases,
        } as any)
        .eq('tenant_id', tenantId);
    }

    return NextResponse.json({
      success: true,
      tenantId,
      aliases: cleanedAliases,
      message: 'Brand aliases successfully saved and synced with active tracking campaigns.',
    });
  } catch (error: any) {
    console.error('Error saving brand aliases:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save brand aliases' },
      { status: 500 }
    );
  }
}
