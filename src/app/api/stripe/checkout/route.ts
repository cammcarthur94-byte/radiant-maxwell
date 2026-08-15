import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer, STRIPE_PLANS } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session for subscription tier upgrades
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, tier, returnUrl } = body;

    if (!tenantId || !tier) {
      return NextResponse.json(
        { error: 'Missing tenantId or tier parameter.' },
        { status: 400 }
      );
    }

    const normalizedTier = tier.toLowerCase();
    const selectedPlan = STRIPE_PLANS[normalizedTier];
    if (!selectedPlan) {
      return NextResponse.json(
        { error: `Invalid subscription tier: ${tier}. Allowed: starter, growth, enterprise` },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Fetch tenant information
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: `Tenant not found: ${tenantError?.message || tenantId}` },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const baseUrl = returnUrl || `${appUrl}/subscription`;

    // Starter free tier selection
    if (normalizedTier === 'starter') {
      const currentSettings = (tenant.settings as any) || {};
      await supabase
        .from('tenants')
        .update({
          subscription_tier: 'starter',
          plan_type: 'starter',
          subscription_status: 'active',
          settings: {
            ...currentSettings,
            plan: 'starter',
            updated_at: new Date().toISOString(),
          },
        } as any)
        .eq('id', tenantId);

      return NextResponse.json({
        success: true,
        url: `${baseUrl}?upgraded=starter`,
        message: `Tenant ${tenant.name} switched to Starter tier.`,
      });
    }

    // Fallback mode if live Stripe credentials are not yet configured in local environment
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret || stripeSecret.includes('mock') || stripeSecret.includes('placeholder')) {
      // In development / demo mode without Stripe secret, smoothly upgrade tenant directly
      const currentSettings = (tenant.settings as any) || {};
      await supabase
        .from('tenants')
        .update({
          subscription_tier: selectedPlan.tier,
          plan_type: selectedPlan.tier,
          subscription_status: 'active',
          settings: {
            ...currentSettings,
            plan: selectedPlan.tier,
            upgraded_at: new Date().toISOString(),
            demo_stripe_checkout: true,
          },
        } as any)
        .eq('id', tenantId);

      return NextResponse.json({
        success: true,
        demoMode: true,
        url: `${baseUrl}?upgraded=${selectedPlan.tier}&session_id=demo_session_${Date.now()}`,
        message: `Tenant ${tenant.name} upgraded to ${selectedPlan.name} in demo mode.`,
      });
    }

    // 2. Production Stripe Checkout Session Creation
    const stripe = getStripeServer();
    const tenantSettings = (tenant.settings as any) || {};
    let customerId = tenantSettings.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        name: tenant.name,
        metadata: {
          tenant_id: tenant.id,
          slug: tenant.slug,
        },
      });
      customerId = customer.id;

      await supabase
        .from('tenants')
        .update({
          settings: {
            ...tenantSettings,
            stripe_customer_id: customerId,
          },
        })
        .eq('id', tenant.id);
    }

    const lineItems: any[] = selectedPlan.priceId.startsWith('price_') && !selectedPlan.priceId.includes('monthly') && !selectedPlan.priceId.includes('starter')
      ? [{ price: selectedPlan.priceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Radiant Maxwell - ${selectedPlan.name} Plan`,
                description: selectedPlan.description,
              },
              unit_amount: selectedPlan.price * 100,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${baseUrl}?session_id={CHECKOUT_SESSION_ID}&upgraded=${selectedPlan.tier}`,
      cancel_url: `${baseUrl}?canceled=true`,
      metadata: {
        tenant_id: tenant.id,
        target_tier: selectedPlan.tier,
      },
      subscription_data: {
        metadata: {
          tenant_id: tenant.id,
          target_tier: selectedPlan.tier,
        },
      },
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Stripe checkout session error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}
