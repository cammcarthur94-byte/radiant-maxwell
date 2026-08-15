import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/webhook
 * Handles incoming Stripe events to sync subscription status and tiers to Supabase
 */
export async function POST(req: NextRequest) {
  const stripe = getStripeServer();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();

    if (webhookSecret) {
      const sig = req.headers.get('stripe-signature');
      if (!sig) {
        return NextResponse.json({ error: 'Missing Stripe signature header' }, { status: 400 });
      }
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err: any) {
    console.error('Stripe webhook verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenant_id;
        const targetTier = (session.metadata?.target_tier || 'growth') as 'starter' | 'growth' | 'enterprise';

        if (tenantId) {
          const { data: tenant } = await supabase
            .from('tenants')
            .select('settings')
            .eq('id', tenantId)
            .single();

          const currentSettings = (tenant?.settings as any) || {};

          // Update both columns and settings JSONB
          await supabase
            .from('tenants')
            .update({
              subscription_tier: targetTier,
              plan_type: targetTier,
              subscription_status: 'active',
              settings: {
                ...currentSettings,
                plan: targetTier,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                subscription_status: 'active',
                updated_via_webhook_at: new Date().toISOString(),
              },
            } as any)
            .eq('id', tenantId);

          console.log(`[Stripe Webhook] Successfully activated tenant ${tenantId} on plan: ${targetTier}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const tenantId = subscription.metadata?.tenant_id;
        const targetTier = (subscription.metadata?.target_tier || 'growth') as 'starter' | 'growth' | 'enterprise';
        const status = subscription.status; // 'active', 'past_due', 'unpaid', 'canceled', etc.

        if (tenantId) {
          const { data: tenant } = await supabase
            .from('tenants')
            .select('settings')
            .eq('id', tenantId)
            .single();

          const currentSettings = (tenant?.settings as any) || {};
          const resolvedTier = status === 'active' || status === 'trialing' ? targetTier : 'starter';

          await supabase
            .from('tenants')
            .update({
              subscription_tier: resolvedTier,
              plan_type: resolvedTier,
              subscription_status: status,
              settings: {
                ...currentSettings,
                plan: resolvedTier,
                stripe_subscription_id: subscription.id,
                subscription_status: status,
                updated_via_webhook_at: new Date().toISOString(),
              },
            } as any)
            .eq('id', tenantId);

          console.log(`[Stripe Webhook] Updated subscription for tenant ${tenantId}: status=${status}, tier=${resolvedTier}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const tenantId = subscription.metadata?.tenant_id;

        if (tenantId) {
          const { data: tenant } = await supabase
            .from('tenants')
            .select('settings')
            .eq('id', tenantId)
            .single();

          const currentSettings = (tenant?.settings as any) || {};

          await supabase
            .from('tenants')
            .update({
              subscription_tier: 'starter',
              plan_type: 'starter',
              subscription_status: 'canceled',
              settings: {
                ...currentSettings,
                plan: 'starter',
                subscription_status: 'canceled',
                canceled_at: new Date().toISOString(),
              },
            } as any)
            .eq('id', tenantId);

          console.log(`[Stripe Webhook] Downgraded tenant ${tenantId} to starter due to subscription cancellation`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (customerId) {
          const { data: tenants } = await supabase
            .from('tenants')
            .select('id, settings');

          const matchingTenant = (tenants || []).find(
            (t) => (t.settings as any)?.stripe_customer_id === customerId
          );

          if (matchingTenant) {
            const currentSettings = (matchingTenant.settings as any) || {};
            await supabase
              .from('tenants')
              .update({
                subscription_status: 'past_due',
                settings: {
                  ...currentSettings,
                  subscription_status: 'past_due',
                  payment_failed_at: new Date().toISOString(),
                },
              } as any)
              .eq('id', matchingTenant.id);

            console.log(`[Stripe Webhook] Marked tenant ${matchingTenant.id} as past_due`);
          }
        }
        break;
      }

      default:
        // Ignore unhandled event types
        break;
    }

    return NextResponse.json({ received: true, eventType: event.type });
  } catch (error: any) {
    console.error('Error handling Stripe webhook event:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal webhook processing error' },
      { status: 500 }
    );
  }
}
