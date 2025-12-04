import axios from 'axios';
import logger from '../config/logger';
import {
  generateWelcomeEmail,
  generateWelcomeEmailText,
  WelcomeEmailData,
} from '../templates/welcomeEmailTemplate';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class BrevoEmailService {
  private static apiKey = process.env.BREVO_API_KEY;
  private static apiUrl = 'https://api.brevo.com/v3/smtp/email';

  /**
   * Send welcome email to new newsletter subscriber using Brevo
   */
  static async sendWelcomeEmail(email: string, unsubscribeToken: string): Promise<SendEmailResult> {
    try {
      if (!this.apiKey) {
        logger.error('Brevo API key not configured');
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

      // Send email via Brevo API
      const response = await axios.post(
        this.apiUrl,
        {
          sender: {
            name: 'Smashly',
            email: 'info@smashly-app.es',
          },
          to: [
            {
              email: email,
              name: email.split('@')[0],
            },
          ],
          subject: '¡Bienvenido a Smashly! 🎾',
          htmlContent: htmlContent,
          textContent: textContent,
          replyTo: {
            email: 'info@smashly-app.es',
            name: 'Smashly',
          },
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
        }
      );

      logger.info(`Welcome email sent successfully to ${email} via Brevo`, {
        messageId: response.data.messageId,
      });

      return {
        success: true,
        messageId: response.data.messageId,
      };
    } catch (error: any) {
      logger.error('Brevo email service error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send test email (for debugging)
   */
  static async sendTestEmail(email: string): Promise<SendEmailResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'Email service not configured',
        };
      }

      const response = await axios.post(
        this.apiUrl,
        {
          sender: {
            name: 'Smashly',
            email: 'info@smashly-app.es',
          },
          to: [
            {
              email: email,
            },
          ],
          subject: 'Test Email - Smashly',
          htmlContent: '<p>This is a test email from Smashly newsletter system using Brevo.</p>',
          textContent: 'This is a test email from Smashly newsletter system using Brevo.',
          replyTo: {
            email: 'info@smashly-app.es',
            name: 'Smashly',
          },
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
            'accept': 'application/json',
          },
        }
      );

      logger.info(`Test email sent successfully to ${email} via Brevo`, {
        messageId: response.data.messageId,
      });

      return {
        success: true,
        messageId: response.data.messageId,
      };
    } catch (error: any) {
      logger.error('Brevo test email error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send test email',
      };
    }
  }
}
