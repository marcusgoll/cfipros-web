/**
 * Stripe subscription status
 */
export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid';

/**
 * Simplified Stripe subscription object for internal use
 */
export interface StripeSubscription {
  id: string;
  customerId: string;
  status: SubscriptionStatus;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  productId?: string;
  priceId?: string;
}

/**
 * Types of Stripe webhook events we handle
 */
export enum StripeWebhookEventType {
  SUBSCRIPTION_CREATED = 'customer.subscription.created',
  SUBSCRIPTION_UPDATED = 'customer.subscription.updated',
  SUBSCRIPTION_DELETED = 'customer.subscription.deleted',
}

/**
 * Basic representation of a Stripe webhook event
 */
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
}

/**
 * Possible subscription types we offer
 */
export enum SubscriptionType {
  CFI = 'cfi',
  SCHOOL = 'school',
}

/**
 * Product IDs for our subscription offerings
 * This will be populated once products are created in Stripe
 */
export const STRIPE_PRODUCTS = {
  CFI: '',
  SCHOOL: '',
};

/**
 * Price IDs for our subscription offerings
 * This will be populated once prices are created in Stripe
 */
export const STRIPE_PRICES = {
  CFI_MONTHLY: '',
  CFI_ANNUAL: '',
  SCHOOL_MONTHLY: '',
  SCHOOL_ANNUAL: '',
};
