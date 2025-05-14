/**
 * Types for Stripe integration
 */

import type Stripe from 'stripe';

/**
 * Subscription status values
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
  UNPAID = 'unpaid',
}

/**
 * Subscription types for webhook events
 */
export type StripeWebhookEventType =
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed';

/**
 * Webhook event handler function type
 */
export type WebhookEventHandler = (
  event: Stripe.Event,
  eventData: Stripe.Subscription | Stripe.Invoice
) => Promise<void>;

/**
 * Type for product pricing tiers
 */
export interface StripePriceTier {
  id: string;
  productId: string;
  name: string;
  description: string;
  unitAmount: number;
  currency: string;
  interval: 'month' | 'year';
}

/**
 * Type for Stripe products we offer
 */
export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  priceTiers: StripePriceTier[];
}

/**
 * Customer type containing Stripe customer details
 */
export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

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
