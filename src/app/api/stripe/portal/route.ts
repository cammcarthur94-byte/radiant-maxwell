import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/portal
 * Generates a Stripe Customer Portal session link for managing billing & invoices
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, returnUrl } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required.' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const baseUrl = returnUrl || `${appUrl}/dashboard/settings`;

    const tenantSettings = (tenant.settings as any) || {};
    const customerId = tenantSettings.stripe_customer_id;

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret || stripeSecret.includes('mock') || !customerId) {
      return NextResponse.json({
        success: true,
        demoMode: true,
        url: `${baseUrl}?portal_demo=true`,
        message: 'Stripe customer portal simulated in demo mode.',
      });
    }

    const stripe = getStripeServer();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: baseUrl,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Stripe portal session error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create customer portal session.' },
      { status: 500 }
    );
  }
}
