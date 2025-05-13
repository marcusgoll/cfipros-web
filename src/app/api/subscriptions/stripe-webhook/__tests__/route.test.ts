import { NextRequest } from 'next/server';
import { POST } from '../route';
import { constructEventFromWebhook } from '@/lib/stripe/client';
import {
  createSubscription,
  getSubscriptionByStripeId,
  handleSubscriptionStatusChange,
} from '@/services/subscriptionService';

// Mock dependencies
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body, options) => ({ body, options })),
  },
}));

jest.mock('next/headers', () => ({
  headers: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue('stripe-signature-mock'),
  }),
}));

jest.mock('@/lib/stripe/client', () => ({
  constructEventFromWebhook: jest.fn(),
}));

jest.mock('@/services/subscriptionService', () => ({
  createSubscription: jest.fn(),
  getSubscriptionByStripeId: jest.fn(),
  handleSubscriptionStatusChange: jest.fn(),
}));

// Mock buffer function
jest.mock('node:stream/consumers', () => ({
  buffer: jest.fn().mockImplementation(async () => Buffer.from('payload')),
}));

describe('Stripe Webhook Handler', () => {
  // Store original environment variables
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup environment variables
    process.env.STRIPE_WEBHOOK_SECRET = 'test-webhook-secret';
  });

  afterEach(() => {
    // Restore environment variables
    process.env = { ...originalEnv };
  });

  it('should handle subscription created event', async () => {
    // Setup mocks for this test
    const mockEvent = {
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_1234',
          customer: 'cus_1234',
          status: 'active',
          current_period_start: 1684108800,
          current_period_end: 1686787200,
          cancel_at_period_end: false,
          metadata: {
            user_id: 'user-1234',
          },
        },
      },
    };

    (constructEventFromWebhook as jest.Mock).mockReturnValue(mockEvent);
    (getSubscriptionByStripeId as jest.Mock).mockResolvedValue(null);

    // Create mock request
    const request = new NextRequest(new Request('https://example.com'));
    Object.defineProperty(request, 'body', {
      value: new ReadableStream({
        start(controller) {
          controller.enqueue(Buffer.from('payload'));
          controller.close();
        },
      }),
    });

    // Call the endpoint
    const response = await POST(request);

    // Verify webhook was verified
    expect(constructEventFromWebhook).toHaveBeenCalledWith('payload', 'stripe-signature-mock');

    // Verify subscription was created
    expect(createSubscription).toHaveBeenCalledWith({
      user_id: 'user-1234',
      stripe_customer_id: 'cus_1234',
      stripe_subscription_id: 'sub_1234',
      status: 'active',
      current_period_start: expect.any(String),
      current_period_end: expect.any(String),
      cancel_at_period_end: false,
    });

    // Verify response
    expect(response).toEqual({
      body: { received: true },
      options: { status: 200 },
    });
  });

  it('should handle subscription updated event', async () => {
    // Setup mocks for this test
    const mockEvent = {
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_1234',
          customer: 'cus_1234',
          status: 'active',
          current_period_start: 1684108800,
          current_period_end: 1686787200,
          cancel_at_period_end: false,
        },
      },
    };

    (constructEventFromWebhook as jest.Mock).mockReturnValue(mockEvent);

    // Create mock request
    const request = new NextRequest(new Request('https://example.com'));
    Object.defineProperty(request, 'body', {
      value: new ReadableStream({
        start(controller) {
          controller.enqueue(Buffer.from('payload'));
          controller.close();
        },
      }),
    });

    // Call the endpoint
    const response = await POST(request);

    // Verify subscription was updated
    expect(handleSubscriptionStatusChange).toHaveBeenCalledWith(
      'sub_1234',
      'active',
      1684108800,
      1686787200,
      false
    );

    // Verify response
    expect(response).toEqual({
      body: { received: true },
      options: { status: 200 },
    });
  });

  it('should handle errors when webhook secret is missing', async () => {
    // Set webhook secret to undefined instead of using delete
    const tempEnv = { ...originalEnv };
    process.env = { ...tempEnv };
    process.env.STRIPE_WEBHOOK_SECRET = undefined;

    // Create mock request
    const request = new NextRequest(new Request('https://example.com'));

    // Call the endpoint
    const response = await POST(request);

    // Verify response
    expect(response).toEqual({
      body: { error: 'Stripe webhook secret is not configured' },
      options: { status: 500 },
    });
  });

  it('should handle errors when stripe signature is missing', async () => {
    // Mock missing signature
    jest.requireMock('next/headers').headers.mockReturnValueOnce({
      get: jest.fn().mockReturnValue(null),
    });

    // Create mock request
    const request = new NextRequest(new Request('https://example.com'));
    Object.defineProperty(request, 'body', {
      value: new ReadableStream({
        start(controller) {
          controller.enqueue(Buffer.from('payload'));
          controller.close();
        },
      }),
    });

    // Call the endpoint
    const response = await POST(request);

    // Verify response
    expect(response).toEqual({
      body: { error: 'Stripe signature is missing from request headers' },
      options: { status: 400 },
    });
  });

  it('should handle webhook verification errors', async () => {
    // Mock verification error
    (constructEventFromWebhook as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    // Create mock request
    const request = new NextRequest(new Request('https://example.com'));
    Object.defineProperty(request, 'body', {
      value: new ReadableStream({
        start(controller) {
          controller.enqueue(Buffer.from('payload'));
          controller.close();
        },
      }),
    });

    // Call the endpoint
    const response = await POST(request);

    // Verify response
    expect(response).toEqual({
      body: { error: 'Failed to process Stripe webhook' },
      options: { status: 400 },
    });
  });
});
