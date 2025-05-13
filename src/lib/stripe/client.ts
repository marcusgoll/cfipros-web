import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

/**
 * Initialize Stripe client with the secret API key
 */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest stable API version
  appInfo: {
    name: 'CFIPros',
    version: '1.0.0',
  },
});

/**
 * Retrieve a subscription from Stripe
 * @param subscriptionId - The Stripe subscription ID
 */
export const getSubscription = async (subscriptionId: string) => {
  return stripe.subscriptions.retrieve(subscriptionId);
};

/**
 * Cancel a subscription in Stripe
 * @param subscriptionId - The Stripe subscription ID
 */
export const cancelSubscription = async (subscriptionId: string) => {
  return stripe.subscriptions.cancel(subscriptionId);
};

/**
 * Create a customer in Stripe
 * @param params - Customer creation parameters
 */
export const createCustomer = async (params: Stripe.CustomerCreateParams) => {
  return stripe.customers.create(params);
};

/**
 * Create a subscription in Stripe
 * @param params - Subscription creation parameters
 */
export const createSubscription = async (params: Stripe.SubscriptionCreateParams) => {
  return stripe.subscriptions.create(params);
};

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
