import { POST } from '../route';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { 
  createSubscription, 
  getSubscriptionByStripeId, 
  updateSubscription 
} from '@/services/subscriptionService';

// Mock the next/server modules
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn().mockImplementation((body, options) => {
      return { body, options };
    }),
  },
}));

// Mock the Stripe client
jest.mock('@/lib/stripe/client', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

// Mock the subscription service
jest.mock('@/services/subscriptionService', () => ({
  createSubscription: jest.fn(),
  getSubscriptionByStripeId: jest.fn(),
  updateSubscription: jest.fn(),
}));

describe('Stripe Webhook Handler', () => {
  // Environment variable setup
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.STRIPE_WEBHOOK_SECRET = 'test_webhook_secret';
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Mock subscription data
  const mockSubscription = {
    id: 'sub_123456',
    customer: 'cus_123456',
    status: 'active',
    current_period_start: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    current_period_end: Math.floor(Date.now() / 1000) + 3600 * 24 * 30, // 30 days from now
    cancel_at_period_end: false,
    metadata: {
      user_id: 'user123',
    },
  };

  const mockDbSubscription = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    stripe_subscription_id: 'sub_123456',
  };

  it('should return 400 if webhook signature is missing', async () => {
    // Mock request with missing signature
    const req = {
      text: jest.fn().mockResolvedValue('{}'),
      headers: {
        get: jest.fn().mockReturnValue(null), // No signature
      },
    } as unknown as NextRequest;

    const response = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Missing webhook secret or signature' },
      { status: 400 }
    );
  });

  it('should return 400 if webhook signature verification fails', async () => {
    // Mock request
    const req = {
      text: jest.fn().mockResolvedValue('{}'),
      headers: {
        get: jest.fn().mockReturnValue('test_signature'),
      },
    } as unknown as NextRequest;

    // Mock Stripe verification failure
    (stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const response = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Webhook signature verification failed: Invalid signature' },
      { status: 400 }
    );
  });

  it('should handle subscription.created event', async () => {
    // Mock request
    const req = {
      text: jest.fn().mockResolvedValue('{}'),
      headers: {
        get: jest.fn().mockReturnValue('test_signature'),
      },
    } as unknown as NextRequest;

    // Mock Stripe verification success
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'customer.subscription.created',
      data: {
        object: mockSubscription,
      },
    });

    // Mock subscription creation
    (createSubscription as jest.Mock).mockResolvedValue({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });

    const response = await POST(req);

    expect(createSubscription).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith({ received: true });
  });

  it('should handle subscription.updated event', async () => {
    // Mock request
    const req = {
      text: jest.fn().mockResolvedValue('{}'),
      headers: {
        get: jest.fn().mockReturnValue('test_signature'),
      },
    } as unknown as NextRequest;

    // Mock Stripe verification success
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'customer.subscription.updated',
      data: {
        object: mockSubscription,
      },
    });

    // Mock existing subscription
    (getSubscriptionByStripeId as jest.Mock).mockResolvedValue(mockDbSubscription);
    (updateSubscription as jest.Mock).mockResolvedValue({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });

    const response = await POST(req);

    expect(getSubscriptionByStripeId).toHaveBeenCalledWith('sub_123456');
    expect(updateSubscription).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith({ received: true });
  });

  it('should handle subscription.deleted event', async () => {
    // Mock request
    const req = {
      text: jest.fn().mockResolvedValue('{}'),
      headers: {
        get: jest.fn().mockReturnValue('test_signature'),
      },
    } as unknown as NextRequest;

    // Mock Stripe verification success
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'customer.subscription.deleted',
      data: {
        object: mockSubscription,
      },
    });

    // Mock existing subscription
    (getSubscriptionByStripeId as jest.Mock).mockResolvedValue(mockDbSubscription);
    (updateSubscription as jest.Mock).mockResolvedValue({
      id: '123e4567-e89b-12d3-a456-426614174000',
    });

    const response = await POST(req);

    expect(getSubscriptionByStripeId).toHaveBeenCalledWith('sub_123456');
    expect(updateSubscription).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000',
      expect.objectContaining({
        status: 'canceled',
        deleted_at: expect.any(String),
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith({ received: true });
  });

  it('should handle unrecognized event types', async () => {
    // Mock request
    const req = {
      text: jest.fn().mockResolvedValue('{}'),
      headers: {
        get: jest.fn().mockReturnValue('test_signature'),
      },
    } as unknown as NextRequest;

    // Mock Stripe verification success with unknown event type
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'unknown.event',
      data: {
        object: {},
      },
    });

    const response = await POST(req);

    // Should not call any handlers but still return success
    expect(createSubscription).not.toHaveBeenCalled();
    expect(getSubscriptionByStripeId).not.toHaveBeenCalled();
    expect(updateSubscription).not.toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith({ received: true });
  });

  it('should return 500 if an unexpected error occurs', async () => {
    // Mock request
    const req = {
      text: jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      }),
      headers: {
        get: jest.fn().mockReturnValue('test_signature'),
      },
    } as unknown as NextRequest;

    const response = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  });
});
