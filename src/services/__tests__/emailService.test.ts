'use client';

import { 
  sendWelcomeEmail, 
  sendNotificationEmail, 
  sendInvitationEmail, 
  sendTestEmail 
} from '../emailService';
import { sendEmail } from '@/lib/resend';

// Mock the sendEmail function from resend lib
jest.mock('@/lib/resend', () => ({
  sendEmail: jest.fn().mockImplementation(async () => ({
    data: { id: 'mock-email-id' },
    error: null
  }))
}));

describe('Email Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('sendWelcomeEmail', () => {
    it('should send a welcome email to student with correct content', async () => {
      const emailData = {
        to: 'student@example.com',
        name: 'John Doe',
        role: 'student' as const
      };

      await sendWelcomeEmail(emailData);

      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'student@example.com',
        subject: expect.stringContaining('Welcome to CFIPros'),
        htmlContent: expect.stringContaining('Welcome to CFIPros, John Doe!')
      }));

      // Check that the content contains student-specific text
      const callArg = (sendEmail as jest.Mock).mock.calls[0][0];
      expect(callArg.htmlContent).toContain('flight students');
      expect(callArg.htmlContent).toContain('Upload your FAA Knowledge Test results');
    });

    it('should send a welcome email to CFI with correct content', async () => {
      const emailData = {
        to: 'cfi@example.com',
        name: 'Jane Instructor',
        role: 'cfi' as const
      };

      await sendWelcomeEmail(emailData);

      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'cfi@example.com',
        subject: expect.stringContaining('Instructor Dashboard'),
        htmlContent: expect.stringContaining('Welcome to CFIPros, Jane Instructor!')
      }));

      // Check that the content contains CFI-specific text
      const callArg = (sendEmail as jest.Mock).mock.calls[0][0];
      expect(callArg.htmlContent).toContain('flight instructors');
      expect(callArg.htmlContent).toContain('Manage your student roster');
    });

    it('should send a welcome email to school with correct content', async () => {
      const emailData = {
        to: 'school@example.com',
        name: 'Acme Flight Academy',
        role: 'school' as const
      };

      await sendWelcomeEmail(emailData);

      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'school@example.com',
        subject: expect.stringContaining('Flight School Dashboard'),
        htmlContent: expect.stringContaining('Welcome to CFIPros, Acme Flight Academy!')
      }));

      // Check that the content contains school-specific text
      const callArg = (sendEmail as jest.Mock).mock.calls[0][0];
      expect(callArg.htmlContent).toContain('flight school');
      expect(callArg.htmlContent).toContain('Manage your instructor roster');
    });
  });

  describe('sendNotificationEmail', () => {
    it('should send a notification email with correct content', async () => {
      const emailData = {
        to: 'user@example.com',
        subject: 'Test Notification',
        message: 'This is a test notification message'
      };

      await sendNotificationEmail(emailData);

      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'user@example.com',
        subject: 'Test Notification',
        htmlContent: expect.stringContaining('This is a test notification message')
      }));

      // Check that no action button is included
      const callArg = (sendEmail as jest.Mock).mock.calls[0][0];
      expect(callArg.htmlContent).not.toContain('href=');
    });

    it('should include an action button when URL and text are provided', async () => {
      const emailData = {
        to: 'user@example.com',
        subject: 'Action Required',
        message: 'Please take action',
        actionUrl: 'https://example.com/action',
        actionText: 'Click Here'
      };

      await sendNotificationEmail(emailData);

      const callArg = (sendEmail as jest.Mock).mock.calls[0][0];
      expect(callArg.htmlContent).toContain('href="https://example.com/action"');
      expect(callArg.htmlContent).toContain('Click Here');
    });
  });

  describe('sendInvitationEmail', () => {
    it('should send an invitation email with correct content', async () => {
      const emailData = {
        to: 'invitee@example.com',
        inviterName: 'John Inviter',
        organizationName: 'Test Flight School',
        role: 'student' as const,
        inviteUrl: 'https://example.com/invite/abc123'
      };

      await sendInvitationEmail(emailData);

      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'invitee@example.com',
        subject: expect.stringContaining('You\'ve been invited to join Test Flight School'),
        htmlContent: expect.stringContaining('John Inviter has invited you')
      }));

      // Check role-specific content
      const callArg = (sendEmail as jest.Mock).mock.calls[0][0];
      expect(callArg.htmlContent).toContain('as a student');
      expect(callArg.htmlContent).toContain('href="https://example.com/invite/abc123"');
    });

    it('should use the correct role title for CFI', async () => {
      const emailData = {
        to: 'cfi@example.com',
        inviterName: 'School Admin',
        organizationName: 'Test Flight School',
        role: 'cfi' as const,
        inviteUrl: 'https://example.com/invite/cfi123'
      };

      await sendInvitationEmail(emailData);

      const callArg = (sendEmail as jest.Mock).mock.calls[0][0];
      expect(callArg.htmlContent).toContain('as a Certified Flight Instructor');
    });
  });

  describe('sendTestEmail', () => {
    it('should send a test email with correct content', async () => {
      await sendTestEmail('test@example.com');

      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        subject: 'CFIPros Email Test',
        htmlContent: expect.stringContaining('Email Configuration Test')
      }));

      const callArg = (sendEmail as jest.Mock).mock.calls[0][0];
      expect(callArg.htmlContent).toContain('your email configuration is working correctly');
    });
  });
}); 