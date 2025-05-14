'use server';

import { sendEmail } from '@/lib/resend';
import type { EmailData } from '@/lib/resend';

/**
 * Higher-level email service that provides specialized email functions
 * for different types of communications beyond auth flows.
 *
 * Auth-related emails (signup, verification, password reset) are handled
 * by Supabase Auth directly and not through this service.
 */

// Interface for welcome email data
interface WelcomeEmailData {
  to: string;
  name: string;
  role: 'student' | 'cfi' | 'school';
}

// Interface for notification email data
interface NotificationEmailData {
  to: string;
  subject: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

// Interface for invitation email data
interface InvitationEmailData {
  to: string;
  inviterName: string;
  organizationName: string;
  role: 'student' | 'cfi' | 'instructor';
  inviteUrl: string;
}

/**
 * Sends a welcome email to a new user
 * @param data Welcome email parameters
 */
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  const { to, name, role } = data;

  let subject = '';
  let htmlContent = '';

  // Customize the subject and content based on user role
  switch (role) {
    case 'student':
      subject = 'Welcome to CFIPros - Your Aviation Knowledge Partner';
      htmlContent = `
        <div>
          <h1>Welcome to CFIPros, ${name}!</h1>
          <p>We're excited to have you join our platform dedicated to helping flight students excel in their knowledge tests.</p>
          <p>With CFIPros, you can:</p>
          <ul>
            <li>Upload your FAA Knowledge Test results</li>
            <li>Get detailed analysis of your performance</li>
            <li>Connect with CFIs for targeted instruction</li>
          </ul>
        </div>
      `;
      break;
    case 'cfi':
      subject = 'Welcome to CFIPros - Your Instructor Dashboard';
      htmlContent = `
        <div>
          <h1>Welcome to CFIPros, ${name}!</h1>
          <p>We're excited to have you join our platform dedicated to helping flight instructors provide targeted instruction.</p>
          <p>With CFIPros, you can:</p>
          <ul>
            <li>Manage your student roster</li>
            <li>Analyze student test results</li>
            <li>Provide tailored feedback and resources</li>
          </ul>
        </div>
      `;
      break;
    case 'school':
      subject = 'Welcome to CFIPros - Your Flight School Dashboard';
      htmlContent = `
        <div>
          <h1>Welcome to CFIPros, ${name}!</h1>
          <p>We're excited to have your flight school join our platform.</p>
          <p>With CFIPros, your flight school can:</p>
          <ul>
            <li>Manage your instructor roster</li>
            <li>Track student progress</li>
            <li>Gain insights into curriculum effectiveness</li>
          </ul>
        </div>
      `;
      break;
  }

  const emailData: EmailData = {
    to,
    subject,
    htmlContent,
  };

  return sendEmail(emailData);
}

/**
 * Sends a notification email to a user
 * @param data Notification email parameters
 */
export async function sendNotificationEmail(data: NotificationEmailData) {
  const { to, subject, message, actionUrl, actionText } = data;

  let actionButton = '';
  if (actionUrl && actionText) {
    actionButton = `
      <div style="margin: 20px 0;">
        <a href="${actionUrl}" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${actionText}</a>
      </div>
    `;
  }

  const htmlContent = `
    <div>
      <h1>${subject}</h1>
      <p>${message}</p>
      ${actionButton}
    </div>
  `;

  const emailData: EmailData = {
    to,
    subject,
    htmlContent,
  };

  return sendEmail(emailData);
}

/**
 * Sends an invitation email to join an organization
 * @param data Invitation email parameters
 */
export async function sendInvitationEmail(data: InvitationEmailData) {
  const { to, inviterName, organizationName, role, inviteUrl } = data;

  let roleTitle = '';
  switch (role) {
    case 'student':
      roleTitle = 'student';
      break;
    case 'cfi':
      roleTitle = 'Certified Flight Instructor';
      break;
    case 'instructor':
      roleTitle = 'instructor';
      break;
  }

  const subject = `You've been invited to join ${organizationName} on CFIPros`;

  const htmlContent = `
    <div>
      <h1>You've Been Invited!</h1>
      <p>${inviterName} has invited you to join ${organizationName} as a ${roleTitle} on CFIPros.</p>
      <div style="margin: 20px 0;">
        <a href="${inviteUrl}" style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
      </div>
      <p>If you're not expecting this invitation, you can safely ignore this email.</p>
    </div>
  `;

  const emailData: EmailData = {
    to,
    subject,
    htmlContent,
  };

  return sendEmail(emailData);
}

/**
 * Sends a test email to verify configuration
 * @param to Email address to send the test to
 */
export async function sendTestEmail(to: string) {
  const subject = 'CFIPros Email Test';
  const htmlContent = `
    <div>
      <h1>Email Configuration Test</h1>
      <p>This is a test email from CFIPros to verify that your email configuration is working correctly.</p>
      <p>If you received this email, your Resend integration is functioning properly!</p>
    </div>
  `;

  const emailData: EmailData = {
    to,
    subject,
    htmlContent,
  };

  return sendEmail(emailData);
}
