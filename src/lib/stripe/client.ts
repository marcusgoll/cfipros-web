/**
 * Stripe Client Setup
 *
 * This module initializes the Stripe client and provides methods for subscription-related operations.
 */

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

// Initialize Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // apiVersion: '2023-10-16', // Ensure this is the intended API version
  appInfo: {
    name: 'CFIPros',
    version: '1.0.0',
  },
});

/**
 * Creates a customer in Stripe
 * @param email Customer's email
 * @param name Customer's name (optional)
 * @param metadata Additional metadata
 * @returns Stripe Customer object
 */
export async function createCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  return await stripe.customers.create({
    email,
    name,
    metadata,
  });
}

/**
 * Creates a subscription for a customer
 * @param customerId Stripe customer ID
 * @param priceId Stripe price ID
 * @param metadata Additional metadata
 * @returns Stripe Subscription object
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    metadata,
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  });
}

/**
 * Cancels a subscription at period end
 * @param subscriptionId Stripe subscription ID
 * @returns Stripe Subscription object
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Reactivates a subscription that was set to cancel at period end
 * @param subscriptionId Stripe subscription ID
 * @returns Stripe Subscription object
 */
export async function reactivateSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

/**
 * Retrieves a subscription by ID
 * @param subscriptionId Stripe subscription ID
 * @returns Stripe Subscription object
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Construct a webhook event and verify its signature
 * @param payload - The raw request body from the webhook
 * @param signature - The Stripe signature from the request headers
 */
export const constructEventFromWebhook = (payload: string | Buffer, signature: string) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
  }

  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
};

export default stripe;
