import { Request, Response } from 'express';
import { NewsletterService } from '../services/newsletterService';

export class NewsletterController {
  /**
   * Subscribe a new email to the newsletter
   * POST /api/newsletter/subscribe
   */
  static async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      // Get IP and user agent for tracking
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const result = await NewsletterService.subscribe(email, ipAddress, userAgent);

      res.status(result.alreadySubscribed ? 200 : 201).json({
        success: true,
        message: result.message,
        alreadySubscribed: result.alreadySubscribed,
      });
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error subscribing to newsletter',
      });
    }
  }

  /**
   * Get newsletter statistics (admin only)
   * GET /api/newsletter/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await NewsletterService.getStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Newsletter stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching newsletter stats',
      });
    }
  }

  /**
   * Unsubscribe an email from the newsletter
   * POST /api/newsletter/unsubscribe
   */
  static async unsubscribe(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      await NewsletterService.unsubscribe(email);

      res.status(200).json({
        success: true,
        message: 'Successfully unsubscribed from newsletter',
      });
    } catch (error: any) {
      console.error('Newsletter unsubscribe error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error unsubscribing from newsletter',
      });
    }
  }
}
