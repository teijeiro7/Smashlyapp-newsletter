import express from 'express';
import { NewsletterController } from '../controllers/newsletterController';

const router = express.Router();

/**
 * @route   POST /api/v1/newsletter/subscribe
 * @desc    Subscribe to newsletter
 * @access  Public
 */
router.post('/subscribe', NewsletterController.subscribe);

/**
 * @route   POST /api/v1/newsletter/webhook
 * @desc    Webhook endpoint for Supabase database events
 * @access  Public (protected by webhook secret)
 */
router.post('/webhook', NewsletterController.webhook);

/**
 * @route   GET /api/v1/newsletter/unsubscribe/:token
 * @desc    Unsubscribe from newsletter using token
 * @access  Public
 */
router.get('/unsubscribe/:token', NewsletterController.unsubscribeByToken);

/**
 * @route   POST /api/v1/newsletter/unsubscribe
 * @desc    Unsubscribe from newsletter
 * @access  Public
 */
router.post('/unsubscribe', NewsletterController.unsubscribe);

/**
 * @route   GET /api/v1/newsletter/stats
 * @desc    Get newsletter statistics
 * @access  Public (should be protected in production)
 */
router.get('/stats', NewsletterController.getStats);

export default router;
