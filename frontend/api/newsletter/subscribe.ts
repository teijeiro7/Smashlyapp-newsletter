/**
 * Vercel Serverless Function: Newsletter Subscribe
 * Handles newsletter subscriptions without cold starts
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '../utils/emailService';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // En producción, especifica tu dominio
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions
function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function generateUnsubscribeToken(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}${randomPart2}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }

  try {
    const { email } = req.body;

    console.log('📧 [Serverless] Newsletter subscription request:', email);

    // Validate email
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Get client IP and user agent
    const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                     (req.headers['x-real-ip'] as string) || 
                     'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    console.log('🔍 [Serverless] Checking if email exists:', normalizedEmail);

    // Check if email already exists
    const { data: existingSubscriber, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('id, unsubscribed_at, unsubscribe_token')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ [Serverless] Error checking subscriber:', fetchError);
      throw new Error('Database error');
    }

    let unsubscribeToken: string;

    if (existingSubscriber) {
      unsubscribeToken = existingSubscriber.unsubscribe_token;

      // If previously unsubscribed, resubscribe
      if (existingSubscriber.unsubscribed_at) {
        console.log('🔄 [Serverless] Resubscribing user');

        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({
            unsubscribed_at: null,
            subscribed_at: new Date().toISOString(),
            confirmed: false,
          })
          .eq('id', existingSubscriber.id);

        if (updateError) {
          console.error('❌ [Serverless] Error resubscribing:', updateError);
          throw new Error('Failed to resubscribe');
        }

        // Send welcome email
        await sendWelcomeEmail(normalizedEmail, unsubscribeToken);

        return res.status(200).json({
          success: true,
          message: 'Successfully resubscribed to newsletter',
          alreadySubscribed: false,
        });
      }

      // Already subscribed and active
      console.log('ℹ️ [Serverless] Email already subscribed');
      return res.status(200).json({
        success: true,
        message: 'Email is already subscribed',
        alreadySubscribed: true,
      });
    }

    // Insert new subscriber
    unsubscribeToken = generateUnsubscribeToken();

    console.log('➕ [Serverless] Creating new subscriber');

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
      console.error('❌ [Serverless] Error inserting subscriber:', insertError);
      throw new Error('Failed to subscribe');
    }

    // Send welcome email
    console.log('📨 [Serverless] Sending welcome email');
    await sendWelcomeEmail(normalizedEmail, unsubscribeToken);

    console.log('✅ [Serverless] Subscription successful');

    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      alreadySubscribed: false,
    });
  } catch (error: any) {
    console.error('❌ [Serverless] Error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

// Set CORS headers for all responses
export const config = {
  api: {
    bodyParser: true,
  },
};
