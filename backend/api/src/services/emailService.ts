import nodemailer from 'nodemailer';
import logger from '../config/logger';
import {
  generateWelcomeEmail,
  generateWelcomeEmailText,
  WelcomeEmailData,
} from '../templates/welcomeEmailTemplate';

// Create reusable transporter using Gmail SMTP
const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    logger.warn('Gmail credentials not configured. Email sending will fail.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

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
      const transporter = createTransporter();

      if (!transporter) {
        logger.error('Email transporter not configured');
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

      // Send email via Nodemailer
      const info = await transporter.sendMail({
        from: `"Smashly" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: '¡Bienvenido a Smashly! 🎾',
        html: htmlContent,
        text: textContent,
      });

      logger.info(`Welcome email sent successfully to ${email}`, {
        messageId: info.messageId,
      });

      return {
        success: true,
        messageId: info.messageId,
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
      const transporter = createTransporter();

      if (!transporter) {
        return {
          success: false,
          error: 'Email service not configured',
        };
      }

      const info = await transporter.sendMail({
        from: `"Smashly" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Test Email - Smashly',
        html: '<p>This is a test email from Smashly newsletter system.</p>',
        text: 'This is a test email from Smashly newsletter system.',
      });

      logger.info(`Test email sent successfully to ${email}`, {
        messageId: info.messageId,
      });

      return {
        success: true,
        messageId: info.messageId,
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
