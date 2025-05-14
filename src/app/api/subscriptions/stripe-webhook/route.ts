/**
 * Stripe Webhook Handler
 *
 * This is a webhook endpoint for handling Stripe events related to subscriptions.
 * It validates the webhook signature and processes subscription-related events to
 * update the subscription status in the database.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';

// Type imports
import type { SubscriptionCreateParams, DbSubscriptionStatus } from '@/lib/types/subscription';

// Value imports for services
import {
  createSubscription,
  getSubscriptionByStripeId,
  updateSubscription,
} from '@/services/subscriptionService';
import { supabaseAdmin } from '@/services/subscriptionService';

/**
 * Handles Stripe webhook events
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing webhook secret or signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      const error = err as Error;
      console.error(`Webhook signature verification failed: ${error.message}`);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${error.message}` },
        { status: 400 }
      );
    }

    // Handle the event based on type
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded': {
        const invoiceObject = event.data.object as Stripe.Invoice;
        // Attempt to access subscription via type assertion to any, then to string | null
        let subscriptionIdFromInvoice: string | null = null;
        // Cast to any to bypass strict type checking for the 'subscription' property
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawSubscription: string | Stripe.Subscription | null = (invoiceObject as any)
          .subscription;

        if (rawSubscription) {
          if (typeof rawSubscription === 'string') {
            subscriptionIdFromInvoice = rawSubscription;
          } else if (typeof rawSubscription === 'object' && rawSubscription.id) {
            // It's a Stripe.Subscription object, so get its id
            subscriptionIdFromInvoice = rawSubscription.id;
          }
        }

        if (subscriptionIdFromInvoice) {
          // Ensure subscriptionIdFromInvoice is treated as a string for retrieve
          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionIdFromInvoice);

          const user_id = stripeSubscription.metadata.user_id;
          if (!user_id) {
            console.error('User ID not found in subscription metadata');
            return new Response('Webhook Error: User ID not found', {
              status: 400,
            });
          }

          // Update subscription status and current period
          const subscriptionData = {
            id: stripeSubscription.id,
            user_id,
            status: mapStripeStatusToDbStatus(stripeSubscription.status),
            metadata: stripeSubscription.metadata,
            price_id: stripeSubscription.items.data[0]?.price.id,
            quantity: stripeSubscription.items.data[0]?.quantity,
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            cancel_at: stripeSubscription.cancel_at
              ? new Date(stripeSubscription.cancel_at * 1000).toISOString()
              : null,
            canceled_at: stripeSubscription.canceled_at
              ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
              : null,
            current_period_start: new Date(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (stripeSubscription as any).current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (stripeSubscription as any).current_period_end * 1000
            ).toISOString(),
            ended_at: stripeSubscription.ended_at
              ? new Date(stripeSubscription.ended_at * 1000).toISOString()
              : null,
            trial_start: stripeSubscription.trial_start
              ? new Date(stripeSubscription.trial_start * 1000).toISOString()
              : null,
            trial_end: stripeSubscription.trial_end
              ? new Date(stripeSubscription.trial_end * 1000).toISOString()
              : null,
            stripe_subscription_id: stripeSubscription.id,
            stripe_customer_id: stripeSubscription.customer as string,
          };

          try {
            await supabaseAdmin.from('subscriptions').upsert(subscriptionData);
            console.log(
              `Updated subscription [${stripeSubscription.id}] for user [${user_id}] after payment succeeded`
            );
          } catch (error) {
            console.error('Error updating subscription after payment:', error);
            return new Response('Webhook Error: Error updating subscription after payment', {
              status: 500,
            });
          }
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const error = err as Error;
    console.error(`Webhook error: ${error.message}`);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`Processing subscription created: ${subscription.id}`);

  // Extract metadata to determine if this is a user or school subscription
  const metadata = subscription.metadata || {};
  const userId = metadata.user_id;
  const schoolId = metadata.school_id;

  if (!userId) {
    console.error(
      `Subscription created (ID: ${subscription.id}) without user_id in metadata. Cannot create DB record.`
    );
    return;
  }

  // Create a new subscription record
  const subscriptionData: SubscriptionCreateParams = {
    user_id: userId,
    school_id: schoolId || null,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    status: mapStripeStatusToDbStatus(subscription.status),
    current_period_start: new Date(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (subscription as any).current_period_start * 1000
    ).toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  };

  await createSubscription(subscriptionData);
  console.log(`Subscription created: ${subscription.id}`);
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`Processing subscription updated: ${subscription.id}`);

  // Find the existing subscription
  const existingSubscription = await getSubscriptionByStripeId(subscription.id);
  if (!existingSubscription) {
    console.error(`Subscription not found: ${subscription.id}`);
    return;
  }

  // Update the subscription
  await updateSubscription(existingSubscription.id, {
    status: mapStripeStatusToDbStatus(subscription.status),
    current_period_start: new Date(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (subscription as any).current_period_start * 1000
    ).toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  console.log(`Subscription updated: ${subscription.id}`);
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Processing subscription deleted: ${subscription.id}`);

  // Find the existing subscription
  const existingSubscription = await getSubscriptionByStripeId(subscription.id);
  if (!existingSubscription) {
    console.error(`Subscription not found: ${subscription.id}`);
    return;
  }

  // Update the subscription status to canceled and set deleted_at
  await updateSubscription(existingSubscription.id, {
    status: 'CANCELED',
    deleted_at: new Date().toISOString(),
  });

  console.log(`Subscription deleted: ${subscription.id}`);
}

// Helper function to map Stripe status to DB status
function mapStripeStatusToDbStatus(stripeStatus: Stripe.Subscription.Status): DbSubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return 'ACTIVE';
    case 'canceled':
      return 'CANCELED';
    case 'incomplete':
      return 'INCOMPLETE';
    case 'incomplete_expired':
      return 'INCOMPLETE_EXPIRED';
    case 'past_due':
      return 'PAST_DUE';
    case 'trialing':
      return 'TRIALING';
    case 'unpaid': // Stripe 'unpaid' can be mapped to 'PAST_DUE' or a new status if needed
      return 'PAST_DUE';
    default:
      // Fallback or throw error for unhandled statuses
      console.warn(`Unhandled Stripe subscription status: ${stripeStatus}`);
      return 'INCOMPLETE'; // Or a more appropriate default/error status
  }
}
