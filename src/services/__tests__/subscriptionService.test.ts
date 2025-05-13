import {
  createSubscription,
  getSubscriptionByStripeId,
  handleSubscriptionStatusChange,
  checkUserSubscription,
} from '../subscriptionService';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock data for tests
const mockSubscription = {
  id: 'uuid-1234',
  created_at: '2023-05-13T00:00:00Z',
  updated_at: '2023-05-13T00:00:00Z',
  deleted_at: null,
  user_id: 'user-1234',
  school_id: null,
  stripe_customer_id: 'cus_1234',
  stripe_subscription_id: 'sub_1234',
  status: 'active',
  current_period_start: '2023-05-13T00:00:00Z',
  current_period_end: '2023-06-13T00:00:00Z',
  cancel_at_period_end: false,
};

describe('Subscription Service', () => {
  let mockFrom: jest.Mock;
  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockEq: jest.Mock;
  let mockIs: jest.Mock;
  let mockSingle: jest.Mock;
  let mockMaybeSingle: jest.Mock;

  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();

    // Setup chain of mock functions for Supabase client
    mockMaybeSingle = jest.fn().mockResolvedValue({ data: mockSubscription, error: null });
    mockSingle = jest.fn().mockResolvedValue({ data: mockSubscription, error: null });
    mockIs = jest.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    mockEq = jest.fn().mockImplementation((field) => {
      if (field === 'status') {
        return { is: mockIs };
      }
      return { select: mockSelect, update: mockUpdate, single: mockSingle };
    });
    mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    mockSelect = jest.fn().mockReturnValue({ eq: mockEq, single: mockSingle });
    mockInsert = jest.fn().mockReturnValue({ select: mockSelect });
    mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    });

    // Mock createClient to return our mock client
    (createClient as jest.Mock).mockReturnValue({
      from: mockFrom,
    });
  });

  describe('createSubscription', () => {
    it('should create a subscription and return it', async () => {
      const subscriptionData = {
        user_id: 'user-1234',
        stripe_customer_id: 'cus_1234',
        stripe_subscription_id: 'sub_1234',
        status: 'active' as const,
        current_period_start: '2023-05-13T00:00:00Z',
        current_period_end: '2023-06-13T00:00:00Z',
        cancel_at_period_end: false,
      };

      const result = await createSubscription(subscriptionData);

      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockInsert).toHaveBeenCalledWith(subscriptionData);
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockSingle).toHaveBeenCalled();
      expect(result).toEqual(mockSubscription);
    });

    it('should throw an error if creation fails', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: new Error('Database error'),
      });

      const subscriptionData = {
        user_id: 'user-1234',
        stripe_customer_id: 'cus_1234',
        stripe_subscription_id: 'sub_1234',
        status: 'active' as const,
        current_period_start: '2023-05-13T00:00:00Z',
        current_period_end: '2023-06-13T00:00:00Z',
        cancel_at_period_end: false,
      };

      await expect(createSubscription(subscriptionData)).rejects.toThrow();
    });
  });

  describe('getSubscriptionByStripeId', () => {
    it('should retrieve a subscription by Stripe ID', async () => {
      const result = await getSubscriptionByStripeId('sub_1234');

      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('stripe_subscription_id', 'sub_1234');
      expect(result).toEqual(mockSubscription);
    });

    it('should return null if no subscription is found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await getSubscriptionByStripeId('non_existent');

      expect(result).toBeNull();
    });
  });

  describe('checkUserSubscription', () => {
    it('should return true if user has active subscription', async () => {
      const result = await checkUserSubscription('user-1234');

      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-1234');
      expect(mockEq).toHaveBeenCalledWith('status', 'active');
      expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
      expect(result).toBe(true);
    });

    it('should return false if user has no active subscription', async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const result = await checkUserSubscription('user-no-sub');

      expect(result).toBe(false);
    });
  });

  describe('handleSubscriptionStatusChange', () => {
    it('should update subscription status', async () => {
      const result = await handleSubscriptionStatusChange(
        'sub_1234',
        'active',
        1684108800, // 2023-05-15T00:00:00Z
        1686787200, // 2023-06-15T00:00:00Z
        false
      );

      expect(mockFrom).toHaveBeenCalledWith('subscriptions');
      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'active',
        current_period_start: expect.any(String),
        current_period_end: expect.any(String),
        cancel_at_period_end: false,
      });
      expect(mockEq).toHaveBeenCalledWith('stripe_subscription_id', 'sub_1234');
      expect(result).toEqual(mockSubscription);
    });

    it('should return null if subscription not found', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await handleSubscriptionStatusChange(
        'non_existent',
        'active',
        1684108800,
        1686787200,
        false
      );

      expect(result).toBeNull();
    });
  });
});
