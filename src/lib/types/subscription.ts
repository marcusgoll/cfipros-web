/**
 * Subscription Types
 *
 * This module defines the types used for subscription management.
 */

/**
 * Database subscription status type - based on public.subscription_status enum
 */
export type DbSubscriptionStatus =
  | 'ACTIVE'
  | 'CANCELED'
  | 'PAST_DUE'
  | 'INCOMPLETE'
  | 'INCOMPLETE_EXPIRED'
  | 'TRIALING';

/**
 * Base subscription interface
 */
export interface Subscription {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user_id: string | null;
  school_id: string | null;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: DbSubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

/**
 * Subscription create params
 */
export interface SubscriptionCreateParams {
  user_id: string;
  school_id?: string | null;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: DbSubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

/**
 * Subscription update params
 */
export interface SubscriptionUpdateParams {
  status?: DbSubscriptionStatus;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  updated_at?: string;
  deleted_at?: string | null;
}
