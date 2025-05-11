import { Resend } from 'resend';

// Set up Resend client with API key from environment variables
const resendApiKey = process.env.RESEND_API_KEY;

// Make sure we have the API key before initializing
if (!resendApiKey) {
  // In development, we'll just log a warning; in production this would be a critical error
  if (process.env.NODE_ENV === 'production') {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  
  console.warn('RESEND_API_KEY environment variable is not set. Email functionality will not work.');
}

// Initialize Resend client
export const resend = new Resend(resendApiKey);

// Types for email parameters
export interface EmailData {
  to: string | string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  from?: string; // If not provided, will use default from env
  replyTo?: string;
}

/**
 * Sends an email using Resend API
 * @param data Email parameters
 * @returns Response from Resend API
 */
export async function sendEmail(data: EmailData) {
  try {
    const { to, subject, htmlContent, textContent, from, replyTo } = data;
    
    const fromEmail = from || process.env.RESEND_FROM_EMAIL;
    
    if (!fromEmail) {
      throw new Error('No sender email provided and RESEND_FROM_EMAIL not set');
    }
    
    const response = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html: htmlContent,
      text: textContent,
      reply_to: replyTo,
    });
    
    return { data: response, error: null };
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    return { data: null, error };
  }
} 