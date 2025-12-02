import { Request, Response } from 'express';
import { NewsletterService } from '../services/newsletterService';
import { EmailService } from '../services/emailService';
import logger from '../config/logger';

export class NewsletterController {
  /**
   * Subscribe a new email to the newsletter
   * POST /api/newsletter/subscribe
   */
  static async subscribe(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();

    try {
      const { email } = req.body;

      // Log incoming request details
      console.log('\n🔵 [Backend] Newsletter subscription request received');
      console.log('📧 [Backend] Email:', email);
      console.log('🌐 [Backend] Origin:', req.headers.origin);
      console.log('🌐 [Backend] Referer:', req.headers.referer);
      console.log('🌐 [Backend] User-Agent:', req.headers['user-agent']);
      console.log('🌐 [Backend] Method:', req.method);
      console.log('🌐 [Backend] Path:', req.path);
      console.log('🌐 [Backend] Headers:', JSON.stringify(req.headers, null, 2));

      if (!email) {
        console.log('❌ [Backend] Validation failed: No email provided');
        res.status(400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      // Get IP and user agent for tracking
      const ipAddress =
        (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      console.log('📍 [Backend] IP Address:', ipAddress);
      console.log('🖥️ [Backend] User Agent:', userAgent);
      console.log('⏱️ [Backend] Calling NewsletterService.subscribe...');

      const result = await NewsletterService.subscribe(email, ipAddress, userAgent);

      const duration = Date.now() - startTime;
      console.log(`✅ [Backend] Subscription successful in ${duration}ms`);
      console.log('📤 [Backend] Result:', result);

      res.status(result.alreadySubscribed ? 200 : 201).json({
        success: true,
        message: result.message,
        alreadySubscribed: result.alreadySubscribed,
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ [Backend] Newsletter subscription error after ${duration}ms:`, error);
      console.error('❌ [Backend] Error name:', error.name);
      console.error('❌ [Backend] Error message:', error.message);
      console.error('❌ [Backend] Error stack:', error.stack);

      res.status(500).json({
        success: false,
        message: error.message || 'Error subscribing to newsletter',
      });
    }
  }

  /**
   * Webhook endpoint for Supabase database events
   * POST /api/newsletter/webhook
   */
  static async webhook(req: Request, res: Response): Promise<void> {
    try {
      // Verify webhook secret
      const webhookSecret = req.headers['x-webhook-secret'];
      
      if (!process.env.SUPABASE_WEBHOOK_SECRET) {
        logger.warn('SUPABASE_WEBHOOK_SECRET not configured');
      } else if (webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
        logger.error('Invalid webhook secret');
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const { type, table, record } = req.body;

      // Handle INSERT events on newsletter_subscribers table
      if (type === 'INSERT' && table === 'newsletter_subscribers') {
        const { email, unsubscribe_token } = record;

        if (email && unsubscribe_token) {
          // Send welcome email asynchronously (don't block webhook response)
          EmailService.sendWelcomeEmail(email, unsubscribe_token)
            .then((result) => {
              if (result.success) {
                logger.info(`Welcome email sent to ${email}`);
              } else {
                logger.error(`Failed to send welcome email to ${email}: ${result.error}`);
              }
            })
            .catch((error) => {
              logger.error('Error sending welcome email:', error);
            });
        }
      }

      // Respond immediately to webhook
      res.status(200).json({
        success: true,
        message: 'Webhook received',
      });
    } catch (error: any) {
      logger.error('Webhook error:', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing error',
      });
    }
  }

  /**
   * Unsubscribe by token (for email links)
   * GET /api/newsletter/unsubscribe/:token
   */
  static async unsubscribeByToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).send(`
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Error - Smashly</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
              .container { background: white; border-radius: 12px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              h1 { color: #e74c3c; margin: 0 0 20px; }
              p { color: #666; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Error</h1>
              <p>El enlace de baja no es válido.</p>
            </div>
          </body>
          </html>
        `);
        return;
      }

      const result = await NewsletterService.unsubscribeByToken(token);

      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Baja Confirmada - Smashly</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .container { background: white; border-radius: 12px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #27ae60; margin: 0 0 20px; }
            p { color: #666; line-height: 1.6; margin: 0 0 15px; }
            .email { color: #333; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✅ Baja Confirmada</h1>
            <p>Te has dado de baja exitosamente de la newsletter de Smashly.</p>
            <p class="email">${result.email}</p>
            <p>Lamentamos verte partir. Si cambias de opinión, siempre puedes volver a suscribirte.</p>
          </div>
        </body>
        </html>
      `);
    } catch (error: any) {
      logger.error('Unsubscribe by token error:', error);
      res.status(400).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error - Smashly</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .container { background: white; border-radius: 12px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #e74c3c; margin: 0 0 20px; }
            p { color: #666; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Error</h1>
            <p>${error.message || 'No se pudo procesar la solicitud de baja.'}</p>
          </div>
        </body>
        </html>
      `);
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
