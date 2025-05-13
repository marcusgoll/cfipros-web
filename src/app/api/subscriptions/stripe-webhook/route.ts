import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { buffer } from 'node:stream/consumers';
import { constructEventFromWebhook } from '@/lib/stripe/client';
import { StripeWebhookEventType } from '@/lib/stripe/types';
import {
  createSubscription,
  getSubscriptionByStripeId,
  handleSubscriptionStatusChange,
} from '@/services/subscriptionService';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Handle Stripe webhook events
 */
export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe webhook secret is not configured' }, { status: 500 });
  }

  try {
    // Get the request body as raw text
    const payload = await buffer(req.body as ReadableStream);
    const payloadString = payload.toString();

    // Get the Stripe signature from the headers
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Stripe signature is missing from request headers' },
        { status: 400 }
      );
    }

    // Construct and verify the webhook event
    const event = constructEventFromWebhook(payloadString, signature);

    // Process the webhook event based on type
    switch (event.type) {
      case StripeWebhookEventType.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case StripeWebhookEventType.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case StripeWebhookEventType.SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    return NextResponse.json({ error: 'Failed to process Stripe webhook' }, { status: 400 });
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // Check if the subscription already exists in our database
  const existingSubscription = await getSubscriptionByStripeId(subscription.id);

  if (existingSubscription) {
    console.log(`Subscription ${subscription.id} already exists, updating instead`);
    return handleSubscriptionUpdated(subscription);
  }

  const customerId = subscription.customer as string;
  const metadata = subscription.metadata || {};

  // Create a new subscription record
  await createSubscription({
    user_id: metadata.user_id || undefined,
    school_id: metadata.school_id || undefined,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  console.log(`Created new subscription record for ${subscription.id}`);
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Update the subscription status
  await handleSubscriptionStatusChange(
    subscription.id,
    subscription.status,
    subscription.current_period_start,
    subscription.current_period_end,
    subscription.cancel_at_period_end
  );

  console.log(`Updated subscription ${subscription.id} to status: ${subscription.status}`);
}

/**
 * Handle subscription deleted (canceled) event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Update the subscription status to canceled
  await handleSubscriptionStatusChange(
    subscription.id,
    subscription.status,
    subscription.current_period_start,
    subscription.current_period_end,
    subscription.cancel_at_period_end
  );

  console.log(`Subscription ${subscription.id} has been canceled`);
}
