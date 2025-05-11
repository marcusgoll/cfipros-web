// First mock Resend class before importing anything else
jest.mock('resend', () => {
  return {
    Resend: jest.fn(() => ({
      emails: {
        send: jest.fn(),
      },
    })),
  };
});

// Now import the module under test and types
import { sendEmail, resend } from '../index';
import type { EmailData } from '../index';

describe('Resend Client', () => {
  const originalEnv = process.env;
  const mockSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup the mock response
    mockSend.mockResolvedValue({ id: 'mock-email-id', message: 'Email sent successfully' });

    // Update the mock implementation
    // @ts-expect-error - we know this isn't completely type-safe but it's a test mock
    resend.emails.send = mockSend;

    // Setup test environment variables
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: 'test-api-key',
      RESEND_FROM_EMAIL: 'test@example.com',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should send an email successfully', async () => {
    const emailData: EmailData = {
      to: 'recipient@example.com',
      subject: 'Test Email',
      htmlContent: '<p>Test Content</p>',
    };

    const result = await sendEmail(emailData);

    expect(result.error).toBeNull();
    expect(result.data).toEqual({
      id: 'mock-email-id',
      message: 'Email sent successfully',
    });

    expect(mockSend).toHaveBeenCalledWith({
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<p>Test Content</p>',
      text: undefined,
      reply_to: undefined,
    });
  });

  it('should use custom from email when provided', async () => {
    const emailData: EmailData = {
      to: 'recipient@example.com',
      subject: 'Test Email',
      htmlContent: '<p>Test Content</p>',
      from: 'custom@example.com',
    };

    await sendEmail(emailData);

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'custom@example.com',
      })
    );
  });

  it('should throw an error if no from email is provided', async () => {
    // Remove the from email environment variable
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: 'test-api-key',
      RESEND_FROM_EMAIL: undefined,
    };

    const emailData: EmailData = {
      to: 'recipient@example.com',
      subject: 'Test Email',
      htmlContent: '<p>Test Content</p>',
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await sendEmail(emailData);

    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error.message).toBe('No sender email provided and RESEND_FROM_EMAIL not set');

    consoleSpy.mockRestore();
  });

  it('should handle errors when sending fails', async () => {
    const error = new Error('Failed to send email');
    mockSend.mockRejectedValueOnce(error);

    const emailData: EmailData = {
      to: 'recipient@example.com',
      subject: 'Test Email',
      htmlContent: '<p>Test Content</p>',
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = await sendEmail(emailData);

    expect(result.data).toBeNull();
    expect(result.error).toBe(error);

    consoleSpy.mockRestore();
  });
});
