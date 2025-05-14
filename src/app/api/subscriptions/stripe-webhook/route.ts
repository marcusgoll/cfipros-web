/**
 * Stripe Webhook Handler
 *
 * This is a webhook endpoint for handling Stripe events related to subscriptions.
 * It validates the webhook signature and processes subscription-related events to
 * update the subscription status in the database.
 */

import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe/client';

// Type imports
import type { SubscriptionCreateParams } from '@/lib/types/subscription';
import type { SubscriptionStatus } from '@/lib/stripe/types';

// Value imports for services
import {
  createSubscription,
  getSubscriptionByStripeId,
  updateSubscription,
} from '@/services/subscriptionService';

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

  if (!userId && !schoolId) {
    console.error('Subscription created without user_id or school_id in metadata');
    return;
  }

  // Create a new subscription record
  const subscriptionData: SubscriptionCreateParams = {
    user_id: userId || undefined,
    school_id: schoolId || undefined,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    status: subscription.status as SubscriptionStatus,
    current_period_start: new Date(
      (subscription.current_period_start as number) * 1000
    ).toISOString(),
    current_period_end: new Date((subscription.current_period_end as number) * 1000).toISOString(),
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
    status: subscription.status as SubscriptionStatus,
    current_period_start: new Date(
      (subscription.current_period_start as number) * 1000
    ).toISOString(),
    current_period_end: new Date((subscription.current_period_end as number) * 1000).toISOString(),
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
    status: 'canceled' as SubscriptionStatus,
    deleted_at: new Date().toISOString(),
  });

  console.log(`Subscription deleted: ${subscription.id}`);
}
