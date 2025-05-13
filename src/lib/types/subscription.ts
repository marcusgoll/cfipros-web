import type { SubscriptionStatus } from '../stripe/types';

/**
 * Database Subscription model
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
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

/**
 * Subscription creation payload
 */
export interface CreateSubscriptionPayload {
  user_id?: string;
  school_id?: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

/**
 * Subscription update payload
 */
export interface UpdateSubscriptionPayload {
  status?: SubscriptionStatus;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}
