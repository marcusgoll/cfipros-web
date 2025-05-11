import { sendEmail } from '../index';
import type { EmailData } from '../index';

// Mock variable needs to be defined inside the mock setup
const mockSendFn = jest.fn().mockImplementation(async () => {
  return { id: 'mock-email-id', message: 'Email sent successfully' };
});

// Define the mock with direct access to the send function
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockSendFn
    }
  }))
}));

describe('Resend Client', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup test environment variables
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: 'test-api-key',
      RESEND_FROM_EMAIL: 'test@example.com'
    };
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });
  
  it('should send an email successfully', async () => {
    const emailData: EmailData = {
      to: 'recipient@example.com',
      subject: 'Test Email',
      htmlContent: '<p>Test Content</p>'
    };
    
    const result = await sendEmail(emailData);
    
    expect(result.error).toBeNull();
    expect(result.data).toEqual({
      id: 'mock-email-id',
      message: 'Email sent successfully'
    });
    
    expect(mockSendFn).toHaveBeenCalledWith({
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<p>Test Content</p>',
      text: undefined,
      reply_to: undefined
    });
  });
  
  it('should use custom from email when provided', async () => {
    const emailData: EmailData = {
      to: 'recipient@example.com',
      subject: 'Test Email',
      htmlContent: '<p>Test Content</p>',
      from: 'custom@example.com'
    };
    
    await sendEmail(emailData);
    
    expect(mockSendFn).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'custom@example.com'
      })
    );
  });
  
  it('should throw an error if no from email is provided', async () => {
    // Remove the from email environment variable
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: 'test-api-key',
      RESEND_FROM_EMAIL: undefined
    };
    
    const emailData: EmailData = {
      to: 'recipient@example.com',
      subject: 'Test Email',
      htmlContent: '<p>Test Content</p>'
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
    mockSendFn.mockRejectedValueOnce(error);
    
    const emailData: EmailData = {
      to: 'recipient@example.com',
      subject: 'Test Email',
      htmlContent: '<p>Test Content</p>'
    };
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const result = await sendEmail(emailData);
    
    expect(result.data).toBeNull();
    expect(result.error).toBe(error);
    
    consoleSpy.mockRestore();
  });
}); 