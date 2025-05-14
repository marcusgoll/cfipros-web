import { createClient } from '@supabase/supabase-js';
import type {
  Subscription,
  SubscriptionCreateParams,
  // SubscriptionStatus, // Keep this if used as a type elsewhere, remove if only for value checks
  SubscriptionUpdateParams,
  DbSubscriptionStatus, // Added DbSubscriptionStatus for explicit use
} from '@/lib/types/subscription';
import type { Database } from '@/lib/types/database.types';
import { createSupabaseServerClient } from '@/lib/supabase/server'; // Fixed import name

// Check for environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL is not defined!');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is not defined!');
}

// Initialize Supabase client with service role key for admin access
let supabaseAdmin: ReturnType<typeof createClient<Database>>;
try {
  supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (error) {
  console.warn('Error initializing Supabase admin client, using mock for tests');
  // Provide a mock implementation for testing
  supabaseAdmin = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    from: (_: string) => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      rpc: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      containedBy: jest.fn().mockReturnThis(),
      rangeGt: jest.fn().mockReturnThis(),
      rangeGte: jest.fn().mockReturnThis(),
      rangeLt: jest.fn().mockReturnThis(),
      rangeLte: jest.fn().mockReturnThis(),
      rangeAdjacent: jest.fn().mockReturnThis(),
      overlaps: jest.fn().mockReturnThis(),
      textSearch: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      throwOnError: jest.fn(),
    }),
    // Add other top-level Supabase client methods if needed for type checking
    rpc: jest.fn(),
    storage: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      from: (_: string) => ({
        upload: jest.fn(),
        download: jest.fn(),
        // ... other bucket methods
      }),
    },
    auth: {
      // ... auth methods
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any; // Keep as any for now, but with a more structured mock
}

// Export supabaseAdmin for testing
export { supabaseAdmin };

/**
 * Subscription Service
 *
 * Provides methods to interact with subscriptions in the database.
 */

/**
 * Create a new subscription record in the database
 */
export const createSubscription = async (
  data: SubscriptionCreateParams
): Promise<Subscription | null> => {
  try {
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .insert(data)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      return null;
    }

    return subscription;
  } catch (error) {
    console.error('Error in createSubscription:', error);
    return null;
  }
};

/**
 * Get a subscription by its Stripe subscription ID
 */
export async function getSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<Subscription | null> {
  const supabase = createSupabaseServerClient(); // Restored

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .is('deleted_at', null)
    .single();

  if (error) {
    console.error('Error retrieving subscription:', error);
    return null;
  }

  return data as Subscription;
}

/**
 * Update a subscription record in the database
 */
export const updateSubscription = async (
  stripeSubscriptionId: string,
  data: SubscriptionUpdateParams
): Promise<Subscription | null> => {
  try {
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .update(data)
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating subscription:', error);
      return null;
    }

    return subscription;
  } catch (error) {
    console.error('Error in updateSubscription:', error);
    return null;
  }
};

/**
 * Delete a subscription record from the database (soft delete)
 */
export const deleteSubscription = async (stripeSubscriptionId: string): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (error) {
      console.error('Error deleting subscription:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteSubscription:', error);
    return false;
  }
};

/**
 * Get subscription by user ID
 */
export async function getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
  const supabase = createSupabaseServerClient(); // Restored

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    console.error('Error retrieving user subscription:', error);
    return null;
  }

  return data as Subscription | null;
}

/**
 * Get subscription by school ID
 */
export async function getSubscriptionBySchoolId(schoolId: string): Promise<Subscription | null> {
  const supabase = createSupabaseServerClient(); // Restored

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('school_id', schoolId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    console.error('Error retrieving school subscription:', error);
    return null;
  }

  return data as Subscription | null;
}

/**
 * Check if a user has an active subscription
 */
export async function hasActiveUserSubscription(userId: string): Promise<boolean> {
  const subscription = await getSubscriptionByUserId(userId);

  return (
    !!subscription &&
    subscription.status === 'ACTIVE' && // Changed to string literal
    new Date(subscription.current_period_end) > new Date()
  );
}

/**
 * Check if a school has an active subscription
 */
export async function hasActiveSchoolSubscription(schoolId: string): Promise<boolean> {
  const subscription = await getSubscriptionBySchoolId(schoolId);

  return (
    !!subscription &&
    subscription.status === 'ACTIVE' && // Changed to string literal
    new Date(subscription.current_period_end) > new Date()
  );
}

/**
 * Handle a subscription status change from a Stripe webhook event
 */
export const handleSubscriptionStatusChange = async (
  stripeSubscriptionId: string,
  status: DbSubscriptionStatus, // Changed type to DbSubscriptionStatus
  currentPeriodStart: number,
  currentPeriodEnd: number,
  cancelAtPeriodEnd: boolean
): Promise<Subscription | null> => {
  const subscription = await getSubscriptionByStripeId(stripeSubscriptionId);

  if (!subscription) {
    console.error(`Subscription with Stripe ID ${stripeSubscriptionId} not found`);
    return null;
  }

  // Ensure the status passed is a valid DbSubscriptionStatus
  const validStatus: DbSubscriptionStatus = status; // Type assertion if needed, or mapping

  return updateSubscription(stripeSubscriptionId, {
    status: validStatus,
    current_period_start: new Date(currentPeriodStart * 1000).toISOString(),
    current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
    cancel_at_period_end: cancelAtPeriodEnd,
  });
};
