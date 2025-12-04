import logger from '../config/logger';
import {
  generateWelcomeEmail,
  generateWelcomeEmailText,
  WelcomeEmailData,
} from '../templates/welcomeEmailTemplate';
import { BrevoEmailService } from './brevoEmailService';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  /**
   * Send welcome email to new newsletter subscriber
   * Using Brevo (free tier: 300 emails/day)
   */
  static async sendWelcomeEmail(email: string, unsubscribeToken: string): Promise<SendEmailResult> {
    logger.info('Sending welcome email via Brevo');
    return BrevoEmailService.sendWelcomeEmail(email, unsubscribeToken);
  }

  /**
   * Send test email (for debugging)
   */
  static async sendTestEmail(email: string): Promise<SendEmailResult> {
    logger.info('Sending test email via Brevo');
    return BrevoEmailService.sendTestEmail(email);
  }
}
