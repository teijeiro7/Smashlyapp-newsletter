import { supabase } from '../config/supabase';
import logger from '../config/logger';

export interface SubscribeResult {
  success: boolean;
  message: string;
  alreadySubscribed: boolean;
}

export interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribed: number;
  recentSubscriptions: number; // Last 7 days
}

export class NewsletterService {
  /**
   * Subscribe an email to the newsletter
   */
  static async subscribe(
    email: string,
    ipAddress: string,
    userAgent: string
  ): Promise<SubscribeResult> {
    console.log('\n🔷 [Service] NewsletterService.subscribe called');
    console.log('📧 [Service] Email:', email);
    console.log('📍 [Service] IP:', ipAddress);

    // Validate email format
    if (!this.isValidEmail(email)) {
      console.log('❌ [Service] Invalid email format');
      throw new Error('Invalid email format');
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim();
    console.log('✅ [Service] Email normalized:', normalizedEmail);

    try {
      console.log('🔍 [Service] Checking if email already exists in database...');

      // Check if email already exists
      const { data: existingSubscriber, error: fetchError } = await supabase
        .from('newsletter_subscribers')
        .select('id, unsubscribed_at')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ [Service] Error checking existing subscriber:', fetchError);
        logger.error('Error checking existing subscriber:', fetchError);
        throw new Error('Failed to check subscription status');
      }

      console.log('📊 [Service] Existing subscriber check result:', existingSubscriber);

      if (existingSubscriber) {
        // If previously unsubscribed, resubscribe
        if (existingSubscriber.unsubscribed_at) {
          console.log('🔄 [Service] Resubscribing previously unsubscribed email...');

          const { error: updateError } = await supabase
            .from('newsletter_subscribers')
            .update({
              unsubscribed_at: null,
              subscribed_at: new Date().toISOString(),
              confirmed: false,
            })
            .eq('id', existingSubscriber.id);

          if (updateError) {
            console.error('❌ [Service] Error resubscribing:', updateError);
            logger.error('Error resubscribing:', updateError);
            throw new Error('Failed to resubscribe');
          }

          console.log('✅ [Service] Successfully resubscribed');
          return {
            success: true,
            message: 'Successfully resubscribed to newsletter',
            alreadySubscribed: false,
          };
        }

        // Already subscribed and active
        console.log('ℹ️ [Service] Email is already subscribed and active');
        return {
          success: true,
          message: 'Email is already subscribed',
          alreadySubscribed: true,
        };
      }

      // Insert new subscriber
      const unsubscribeToken = this.generateUnsubscribeToken();
      
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            email: normalizedEmail,
            ip_address: ipAddress,
            user_agent: userAgent,
            unsubscribe_token: unsubscribeToken,
          },
        ]);

      if (insertError) {
        console.error('❌ [Service] Error inserting subscriber:', insertError);
        logger.error('Error inserting subscriber:', insertError);
        throw new Error('Failed to subscribe to newsletter');
      }

      console.log('✅ [Service] Successfully subscribed new email');
      return {
        success: true,
        message: 'Successfully subscribed to newsletter',
        alreadySubscribed: false,
      };
    } catch (error: any) {
      console.error('❌ [Service] Newsletter subscription error:', error);
      logger.error('Newsletter subscription error:', error);
      throw new Error('Failed to subscribe to newsletter');
    }
  }

  /**
   * Unsubscribe an email from the newsletter
   */
  static async unsubscribe(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq('email', normalizedEmail)
        .is('unsubscribed_at', null)
        .select();

      if (error) {
        logger.error('Newsletter unsubscribe error:', error);
        throw new Error('Failed to unsubscribe from newsletter');
      }

      if (!data || data.length === 0) {
        throw new Error('Email not found or already unsubscribed');
      }
    } catch (error: any) {
      logger.error('Newsletter unsubscribe error:', error);
      throw error;
    }
  }

  /**
   * Get newsletter statistics
   */
  static async getStats(): Promise<NewsletterStats> {
    try {
      // Get total subscribers
      const { count: total, error: totalError } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true });

      // Get active subscribers
      const { count: active, error: activeError } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .is('unsubscribed_at', null);

      // Get unsubscribed
      const { count: unsubscribed, error: unsubscribedError } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .not('unsubscribed_at', 'is', null);

      // Get recent subscriptions (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: recent, error: recentError } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .gte('subscribed_at', sevenDaysAgo.toISOString())
        .is('unsubscribed_at', null);

      if (totalError || activeError || unsubscribedError || recentError) {
        logger.error('Error fetching newsletter stats');
        throw new Error('Failed to fetch newsletter stats');
      }

      return {
        totalSubscribers: total || 0,
        activeSubscribers: active || 0,
        unsubscribed: unsubscribed || 0,
        recentSubscriptions: recent || 0,
      };
    } catch (error: any) {
      logger.error('Newsletter stats error:', error);
      throw new Error('Failed to fetch newsletter stats');
    }
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate unique unsubscribe token
   */
  private static generateUnsubscribeToken(): string {
    // Generate a random token using crypto-safe method
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    const randomPart2 = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomPart}${randomPart2}`;
  }

  /**
   * Unsubscribe by token (for email links)
   */
  static async unsubscribeByToken(token: string): Promise<{ email: string }> {
    try {
      // Find subscriber by token
      const { data: subscriber, error: fetchError } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, unsubscribed_at')
        .eq('unsubscribe_token', token)
        .maybeSingle();

      if (fetchError) {
        logger.error('Error fetching subscriber by token:', fetchError);
        throw new Error('Invalid unsubscribe link');
      }

      if (!subscriber) {
        throw new Error('Invalid unsubscribe link');
      }

      if (subscriber.unsubscribed_at) {
        // Already unsubscribed
        return { email: subscriber.email };
      }

      // Update subscriber to unsubscribed
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ unsubscribed_at: new Date().toISOString() })
        .eq('id', subscriber.id);

      if (updateError) {
        logger.error('Error unsubscribing by token:', updateError);
        throw new Error('Failed to unsubscribe');
      }

      logger.info(`Subscriber unsubscribed via token: ${subscriber.email}`);

      return { email: subscriber.email };
    } catch (error: any) {
      logger.error('Unsubscribe by token error:', error);
      throw error;
    }
  }

  /**
   * Get all active subscribers (for email campaigns)
   */
  static async getActiveSubscribers(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .is('unsubscribed_at', null)
        .eq('confirmed', true)
        .order('subscribed_at', { ascending: false });

      if (error) {
        logger.error('Get active subscribers error:', error);
        throw new Error('Failed to fetch active subscribers');
      }

      return data?.map(row => row.email) || [];
    } catch (error: any) {
      logger.error('Get active subscribers error:', error);
      throw new Error('Failed to fetch active subscribers');
    }
  }
}
