import {
  createSubscription,
  getSubscriptionByStripeId,
  updateSubscription,
  getSubscriptionByUserId,
  getSubscriptionBySchoolId,
  hasActiveUserSubscription,
  hasActiveSchoolSubscription,
  supabaseAdmin,
} from '../subscriptionService';
import type { SubscriptionStatus } from '@/lib/stripe/types';

// Mock the Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: jest.fn(),
}));

// Mock the @supabase/supabase-js createClient
jest.mock('@supabase/supabase-js', () => {
  const mockSupabaseInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  };
  return {
    createClient: jest.fn(() => mockSupabaseInstance),
  };
});

describe('Subscription Service', () => {
  // Mock data
  const mockSubscription = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    created_at: '2023-05-13T12:00:00Z',
    updated_at: '2023-05-13T12:00:00Z',
    deleted_at: null,
    user_id: 'user123',
    school_id: null,
    stripe_customer_id: 'cus_123456',
    stripe_subscription_id: 'sub_123456',
    status: 'active' as SubscriptionStatus,
    current_period_start: '2023-05-13T12:00:00Z',
    current_period_end: '2023-06-13T12:00:00Z',
    cancel_at_period_end: false,
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock the Supabase client response
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    single: jest.fn(),
    maybeSingle: jest.fn(),
  };

  // Set up Supabase mock for success scenario
  function setupSupabaseSuccess() {
    mockSupabase.single.mockResolvedValue({ data: mockSubscription, error: null });
    mockSupabase.maybeSingle.mockResolvedValue({ data: mockSubscription, error: null });
    jest
      .requireMock('@/lib/supabase/server')
      .createServerSupabaseClient.mockReturnValue(mockSupabase);
  }

  // Set up Supabase mock for error scenario
  function setupSupabaseError() {
    const error = { message: 'Database error', code: 'ERROR' };
    mockSupabase.single.mockResolvedValue({ data: null, error });
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error });
    jest
      .requireMock('@/lib/supabase/server')
      .createServerSupabaseClient.mockReturnValue(mockSupabase);
  }

  // Set up Supabase mock for not found scenario
  function setupSupabaseNotFound() {
    mockSupabase.single.mockResolvedValue({ data: null, error: null });
    mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
    jest
      .requireMock('@/lib/supabase/server')
      .createServerSupabaseClient.mockReturnValue(mockSupabase);
  }

  describe('getSubscriptionByStripeId', () => {
    it('should return subscription when found', async () => {
      setupSupabaseSuccess();

      const result = await getSubscriptionByStripeId('sub_123456');

      expect(mockSupabase.from).toHaveBeenCalledWith('subscriptions');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('stripe_subscription_id', 'sub_123456');
      expect(mockSupabase.is).toHaveBeenCalledWith('deleted_at', null);
      expect(mockSupabase.single).toHaveBeenCalled();
      expect(result).toEqual(mockSubscription);
    });

    it('should return null when error occurs', async () => {
      setupSupabaseError();

      const result = await getSubscriptionByStripeId('sub_123456');

      expect(result).toBeNull();
    });
  });

  describe('createSubscription', () => {
    it('should create and return subscription', async () => {
      // Mock the exported supabaseAdmin object
      const mockFromFn = jest.fn().mockReturnThis();
      const mockInsertFn = jest.fn().mockReturnThis();
      const mockSelectFn = jest.fn().mockReturnThis();
      const mockSingleFn = jest.fn().mockResolvedValue({ data: mockSubscription, error: null });

      // Override the from method on the actual supabaseAdmin export
      supabaseAdmin.from = mockFromFn;

      // Build the chain
      mockFromFn.mockReturnValue({
        insert: mockInsertFn,
        select: mockSelectFn,
        single: mockSingleFn,
      });

      mockInsertFn.mockReturnValue({
        select: mockSelectFn,
      });

      mockSelectFn.mockReturnValue({
        single: mockSingleFn,
      });

      const params = {
        user_id: 'user123',
        stripe_customer_id: 'cus_123456',
        stripe_subscription_id: 'sub_123456',
        status: 'active' as SubscriptionStatus,
        current_period_start: '2023-05-13T12:00:00Z',
        current_period_end: '2023-06-13T12:00:00Z',
        cancel_at_period_end: false,
      };

      const result = await createSubscription(params);

      expect(mockFromFn).toHaveBeenCalledWith('subscriptions');
      expect(mockInsertFn).toHaveBeenCalled();
      expect(mockSelectFn).toHaveBeenCalled();
      expect(mockSingleFn).toHaveBeenCalled();
      expect(result).toEqual(mockSubscription);
    });

    it('should return null when error occurs', async () => {
      // Mock the exported supabaseAdmin object for error
      const mockFromFn = jest.fn().mockReturnThis();
      const mockInsertFn = jest.fn().mockReturnThis();
      const mockSelectFn = jest.fn().mockReturnThis();
      const mockSingleFn = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Database error' } });

      // Override the from method on the actual supabaseAdmin export
      supabaseAdmin.from = mockFromFn;

      // Build the chain
      mockFromFn.mockReturnValue({
        insert: mockInsertFn,
        select: mockSelectFn,
        single: mockSingleFn,
      });

      mockInsertFn.mockReturnValue({
        select: mockSelectFn,
      });

      mockSelectFn.mockReturnValue({
        single: mockSingleFn,
      });

      const params = {
        user_id: 'user123',
        stripe_customer_id: 'cus_123456',
        stripe_subscription_id: 'sub_123456',
        status: 'active' as SubscriptionStatus,
        current_period_start: '2023-05-13T12:00:00Z',
        current_period_end: '2023-06-13T12:00:00Z',
        cancel_at_period_end: false,
      };

      const result = await createSubscription(params);

      expect(result).toBeNull();
    });
  });

  describe('updateSubscription', () => {
    it('should update and return subscription', async () => {
      // Mock the exported supabaseAdmin object
      const mockFromFn = jest.fn().mockReturnThis();
      const mockUpdateFn = jest.fn().mockReturnThis();
      const mockEqFn = jest.fn().mockReturnThis();
      const mockSelectFn = jest.fn().mockReturnThis();
      const mockSingleFn = jest.fn().mockResolvedValue({ data: mockSubscription, error: null });

      // Override the from method on the actual supabaseAdmin export
      supabaseAdmin.from = mockFromFn;

      // Build the chain
      mockFromFn.mockReturnValue({
        update: mockUpdateFn,
      });

      mockUpdateFn.mockReturnValue({
        eq: mockEqFn,
      });

      mockEqFn.mockReturnValue({
        select: mockSelectFn,
      });

      mockSelectFn.mockReturnValue({
        single: mockSingleFn,
      });

      const params = {
        status: 'active' as SubscriptionStatus,
        current_period_end: '2023-07-13T12:00:00Z',
      };

      const result = await updateSubscription('sub_123456', params);

      expect(mockFromFn).toHaveBeenCalledWith('subscriptions');
      expect(mockUpdateFn).toHaveBeenCalledWith(params);
      expect(mockEqFn).toHaveBeenCalledWith('stripe_subscription_id', 'sub_123456');
      expect(mockSelectFn).toHaveBeenCalled();
      expect(mockSingleFn).toHaveBeenCalled();
      expect(result).toEqual(mockSubscription);
    });

    it('should return null when error occurs', async () => {
      // Mock the exported supabaseAdmin object for error
      const mockFromFn = jest.fn().mockReturnThis();
      const mockUpdateFn = jest.fn().mockReturnThis();
      const mockEqFn = jest.fn().mockReturnThis();
      const mockSelectFn = jest.fn().mockReturnThis();
      const mockSingleFn = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Database error' } });

      // Override the from method on the actual supabaseAdmin export
      supabaseAdmin.from = mockFromFn;

      // Build the chain
      mockFromFn.mockReturnValue({
        update: mockUpdateFn,
      });

      mockUpdateFn.mockReturnValue({
        eq: mockEqFn,
      });

      mockEqFn.mockReturnValue({
        select: mockSelectFn,
      });

      mockSelectFn.mockReturnValue({
        single: mockSingleFn,
      });

      const params = {
        status: 'active' as SubscriptionStatus,
        current_period_end: '2023-07-13T12:00:00Z',
      };

      const result = await updateSubscription('sub_123456', params);

      expect(result).toBeNull();
    });
  });

  describe('getSubscriptionByUserId', () => {
    it('should return subscription when found', async () => {
      setupSupabaseSuccess();

      const result = await getSubscriptionByUserId('user123');

      expect(mockSupabase.from).toHaveBeenCalledWith('subscriptions');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user123');
      expect(mockSupabase.is).toHaveBeenCalledWith('deleted_at', null);
      expect(mockSupabase.maybeSingle).toHaveBeenCalled();
      expect(result).toEqual(mockSubscription);
    });

    it('should return null when not found', async () => {
      setupSupabaseNotFound();

      const result = await getSubscriptionByUserId('user123');

      expect(result).toBeNull();
    });
  });

  describe('getSubscriptionBySchoolId', () => {
    it('should return subscription when found', async () => {
      // Override the mock subscription for school test
      const schoolSubscription = { ...mockSubscription, user_id: null, school_id: 'school123' };
      mockSupabase.maybeSingle.mockResolvedValue({ data: schoolSubscription, error: null });
      jest
        .requireMock('@/lib/supabase/server')
        .createServerSupabaseClient.mockReturnValue(mockSupabase);

      const result = await getSubscriptionBySchoolId('school123');

      expect(mockSupabase.from).toHaveBeenCalledWith('subscriptions');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('school_id', 'school123');
      expect(mockSupabase.is).toHaveBeenCalledWith('deleted_at', null);
      expect(mockSupabase.maybeSingle).toHaveBeenCalled();
      expect(result).toEqual(schoolSubscription);
    });

    it('should return null when not found', async () => {
      setupSupabaseNotFound();

      const result = await getSubscriptionBySchoolId('school123');

      expect(result).toBeNull();
    });
  });

  describe('hasActiveUserSubscription', () => {
    it('should return true for active subscription', async () => {
      // Setup for active subscription
      // Update the mock to use ACTIVE status in the response
      const activeSubscription = {
        ...mockSubscription,
        status: 'active' as SubscriptionStatus,
        current_period_end: '2099-12-31T23:59:59Z', // Future date to ensure it's always active
      };
      mockSupabase.maybeSingle.mockResolvedValue({ data: activeSubscription, error: null });
      jest
        .requireMock('@/lib/supabase/server')
        .createServerSupabaseClient.mockReturnValue(mockSupabase);

      const result = await hasActiveUserSubscription('user123');

      expect(result).toBe(true);
    });

    it('should return false for inactive subscription', async () => {
      const inactiveSubscription = {
        ...mockSubscription,
        status: 'canceled' as SubscriptionStatus,
      };
      mockSupabase.maybeSingle.mockResolvedValue({ data: inactiveSubscription, error: null });
      jest
        .requireMock('@/lib/supabase/server')
        .createServerSupabaseClient.mockReturnValue(mockSupabase);

      const result = await hasActiveUserSubscription('user123');

      expect(result).toBe(false);
    });

    it('should return false when no subscription found', async () => {
      setupSupabaseNotFound();

      const result = await hasActiveUserSubscription('user123');

      expect(result).toBe(false);
    });
  });

  describe('hasActiveSchoolSubscription', () => {
    it('should return true for active subscription', async () => {
      // Override the mock subscription for school test
      const schoolSubscription = {
        ...mockSubscription,
        user_id: null,
        school_id: 'school123',
        status: 'active' as SubscriptionStatus,
        current_period_end: '2099-12-31T23:59:59Z', // Future date to ensure it's always active
      };
      mockSupabase.maybeSingle.mockResolvedValue({ data: schoolSubscription, error: null });
      jest
        .requireMock('@/lib/supabase/server')
        .createServerSupabaseClient.mockReturnValue(mockSupabase);

      const result = await hasActiveSchoolSubscription('school123');

      expect(result).toBe(true);
    });

    it('should return false when no subscription found', async () => {
      setupSupabaseNotFound();

      const result = await hasActiveSchoolSubscription('school123');

      expect(result).toBe(false);
    });
  });
});
