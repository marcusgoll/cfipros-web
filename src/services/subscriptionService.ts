import { createClient } from '@supabase/supabase-js';
import type {
  CreateSubscriptionPayload,
  Subscription,
  UpdateSubscriptionPayload,
} from '@/lib/types/subscription';
import type { SubscriptionStatus } from '@/lib/stripe/types';
import type { Database } from '@/lib/types/database';

// Initialize Supabase client with service role key for admin access
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

/**
 * Create a new subscription record in the database
 */
export const createSubscription = async (
  data: CreateSubscriptionPayload
): Promise<Subscription | null> => {
  const { data: subscription, error } = await supabaseAdmin
    .from('subscriptions')
    .insert(data)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }

  return subscription;
};

/**
 * Get a subscription by its Stripe subscription ID
 */
export const getSubscriptionByStripeId = async (
  stripeSubscriptionId: string
): Promise<Subscription | null> => {
  const { data: subscription, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "no rows returned" error
    console.error('Error fetching subscription:', error);
    throw error;
  }

  return subscription;
};

/**
 * Update a subscription record in the database
 */
export const updateSubscription = async (
  stripeSubscriptionId: string,
  data: UpdateSubscriptionPayload
): Promise<Subscription | null> => {
  const { data: subscription, error } = await supabaseAdmin
    .from('subscriptions')
    .update(data)
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

  return subscription;
};

/**
 * Delete a subscription record from the database (soft delete)
 */
export const deleteSubscription = async (stripeSubscriptionId: string): Promise<void> => {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('stripe_subscription_id', stripeSubscriptionId);

  if (error) {
    console.error('Error deleting subscription:', error);
    throw error;
  }
};

/**
 * Check if a user has an active subscription
 */
export const checkUserSubscription = async (userId: string): Promise<boolean> => {
  const { data: subscription, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    console.error('Error checking user subscription:', error);
    throw error;
  }

  return !!subscription;
};

/**
 * Check if a school has an active subscription
 */
export const checkSchoolSubscription = async (schoolId: string): Promise<boolean> => {
  const { data: subscription, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('school_id', schoolId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    console.error('Error checking school subscription:', error);
    throw error;
  }

  return !!subscription;
};

/**
 * Handle a subscription status change from a Stripe webhook event
 */
export const handleSubscriptionStatusChange = async (
  stripeSubscriptionId: string,
  status: SubscriptionStatus,
  currentPeriodStart: number,
  currentPeriodEnd: number,
  cancelAtPeriodEnd: boolean
): Promise<Subscription | null> => {
  const subscription = await getSubscriptionByStripeId(stripeSubscriptionId);

  if (!subscription) {
    console.error(`Subscription with Stripe ID ${stripeSubscriptionId} not found`);
    return null;
  }

  return updateSubscription(stripeSubscriptionId, {
    status,
    current_period_start: new Date(currentPeriodStart * 1000).toISOString(),
    current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
    cancel_at_period_end: cancelAtPeriodEnd,
  });
};
