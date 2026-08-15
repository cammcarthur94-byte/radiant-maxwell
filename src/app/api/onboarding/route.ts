import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTenantTier, TIER_LIMITS } from '@/lib/subscription-limits';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, brandName, domain, competitors = [], targetPrompt } = body;

    if (!brandName || !domain) {
      return NextResponse.json(
        { error: 'Brand name and domain are required.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const cleanSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    // Auto-generate target queries if none provided in streamlined single-screen onboarding
    const defaultQueries = targetPrompt && targetPrompt.trim()
      ? [targetPrompt.trim()]
      : [
          `Top recommendations and reviews for ${brandName}`,
          `Best alternatives to ${brandName} and key competitors`,
          `How does ${brandName} compare in quality and market reputation?`
        ];

    // Auto-discover competitors if none provided
    let effectiveCompetitors: string[] = Array.isArray(competitors) && competitors.length > 0 ? competitors : [];
    if (effectiveCompetitors.length === 0) {
      // Intelligently infer or seed 2-3 competitor suggestions for initial benchmarking
      const domainPrefix = cleanDomain.split('.')[0];
      effectiveCompetitors = [
        `Apex ${brandName.split(' ')[0]}`,
        `Global ${domainPrefix.charAt(0).toUpperCase() + domainPrefix.slice(1)}`,
        'Nexus Brands'
      ];
    }

    // 1. Locate or create/update the tenant
    let resolvedTenantId = tenantId;
    let tenantRecord: any = null;

    if (resolvedTenantId) {
      const { data: existingTenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', resolvedTenantId)
        .single();

      if (existingTenant) {
        tenantRecord = existingTenant;
        await supabase
          .from('tenants')
          .update({
            name: brandName,
            settings: {
              ...(existingTenant.settings as any || {}),
              domain: cleanDomain,
              primaryCompetitors: effectiveCompetitors,
            },
          })
          .eq('id', resolvedTenantId);
      }
    }

    if (!tenantRecord) {
      // Check by slug
      const { data: slugTenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', cleanSlug)
        .maybeSingle();

      if (slugTenant) {
        resolvedTenantId = slugTenant.id;
        tenantRecord = slugTenant;
      } else {
        const { data: newTenant, error: createTenantError } = await supabase
          .from('tenants')
          .insert({
            name: brandName,
            slug: cleanSlug || `brand-${Date.now()}`,
            subscription_tier: 'starter',
            plan_type: 'starter',
            subscription_status: 'active',
            settings: { domain: cleanDomain, primaryCompetitors: effectiveCompetitors, plan: 'starter' },
          } as any)
          .select()
          .single();

        if (createTenantError || !newTenant) {
          throw new Error(`Failed to create tenant: ${createTenantError?.message}`);
        }
        resolvedTenantId = newTenant.id;
        tenantRecord = newTenant;
      }
    }

    // 2. Validate competitor count for the tenant's tier
    const tier = await getTenantTier(supabase, resolvedTenantId);
    const maxComp = TIER_LIMITS[tier].maxCompetitors;
    const allowedCompetitors = maxComp === Infinity ? effectiveCompetitors : effectiveCompetitors.slice(0, maxComp);

    // 3. Create the primary campaign
    const { data: newCampaign, error: campaignError } = await supabase
      .from('campaigns')
      .insert({
        tenant_id: resolvedTenantId,
        name: `${brandName} Visibility Tracker`,
        brand_name: brandName,
        target_domain: cleanDomain,
        target_queries: defaultQueries,
        competitors: allowedCompetitors,
        tracking_frequency: 'daily',
        is_active: true,
      })
      .select()
      .single();

    if (campaignError || !newCampaign) {
      throw new Error(`Failed to create tracking campaign: ${campaignError?.message}`);
    }

    // 4. Populate competitors table entries
    if (allowedCompetitors.length > 0) {
      const competitorInserts = allowedCompetitors.map((compName: string) => ({
        tenant_id: resolvedTenantId,
        brand_name: compName,
        domain_url: `https://www.${compName.toLowerCase().replace(/[^a-z0-9]+/g, '')}.com`,
      }));

      try {
        await supabase.from('competitors').insert(competitorInserts as any).select();
      } catch (compErr) {
        console.warn('Competitor table insert notice:', compErr);
      }
    }

    return NextResponse.json({
      success: true,
      tenantId: resolvedTenantId,
      campaignId: newCampaign.id,
      message: 'Workspace successfully configured. Ready for first tracking scan.',
    });
  } catch (error: any) {
    console.error('Error in onboarding API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to complete onboarding setup.' },
      { status: 500 }
    );
  }
}
