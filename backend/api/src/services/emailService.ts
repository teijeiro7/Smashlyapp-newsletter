import { Resend } from 'resend';
import logger from '../config/logger';
import {
  generateWelcomeEmail,
  generateWelcomeEmailText,
  WelcomeEmailData,
} from '../templates/welcomeEmailTemplate';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  /**
   * Send welcome email to new newsletter subscriber
   */
  static async sendWelcomeEmail(email: string, unsubscribeToken: string): Promise<SendEmailResult> {
    try {
      if (!process.env.RESEND_API_KEY) {
        logger.error('Resend API key not configured');
        return {
          success: false,
          error: 'Email service not configured',
        };
      }

      // Get base URL from environment or use default
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:3000';
      const unsubscribeUrl = `${baseUrl}/api/v1/newsletter/unsubscribe/${unsubscribeToken}`;

      // Prepare email data
      const emailData: WelcomeEmailData = {
        email,
        unsubscribeToken,
        unsubscribeUrl,
      };

      // Generate HTML and text versions
      const htmlContent = generateWelcomeEmail(emailData);
      const textContent = generateWelcomeEmailText(emailData);

      // Send email via Resend
      const { data, error } = await resend.emails.send({
        from: 'Smashly <onboarding@resend.dev>',
        replyTo: 'smashly.app.2025@gmail.com',
        to: email,
        subject: '¡Bienvenido a Smashly! 🎾',
        html: htmlContent,
        text: textContent,
      });

      if (error) {
        logger.error('Resend API error:', error);
        return {
          success: false,
          error: error.message || 'Failed to send email',
        };
      }

      logger.info(`Welcome email sent successfully to ${email}`, {
        messageId: data?.id,
      });

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error: any) {
      logger.error('Email service error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send test email (for debugging)
   */
  static async sendTestEmail(email: string): Promise<SendEmailResult> {
    try {
      if (!process.env.RESEND_API_KEY) {
        return {
          success: false,
          error: 'Email service not configured',
        };
      }

      const { data, error } = await resend.emails.send({
        from: 'Smashly <onboarding@resend.dev>',
        replyTo: 'smashly.app.2025@gmail.com',
        to: email,
        subject: 'Test Email - Smashly',
        html: '<p>This is a test email from Smashly newsletter system.</p>',
        text: 'This is a test email from Smashly newsletter system.',
      });

      if (error) {
        logger.error('Test email error:', error);
        return {
          success: false,
          error: error.message || 'Failed to send test email',
        };
      }

      logger.info(`Test email sent successfully to ${email}`, {
        messageId: data?.id,
      });

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error: any) {
      logger.error('Test email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send test email',
      };
    }
  }
}
