/**
 * Vercel Serverless Function: Newsletter Subscribe
 * Handles newsletter subscriptions without cold starts
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';




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
    // Initialize Supabase client inside handler to avoid module-level crashes
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ [Serverless] Missing Supabase credentials');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

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

/**
 * Welcome email template
 */
function generateWelcomeEmailHTML(email: string, unsubscribeUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Bienvenido a Smashly!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <!-- Logo -->
              <div style="margin-bottom: 20px;">
                <img src="https://i.imgur.com/OibI6bi.png" alt="Smashly Logo" style="width: 80px; height: 80px; margin: 0 auto; display: block; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);" />
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                ¡Bienvenido a Smashly!
              </h1>
              <p style="margin: 10px 0 0; color: #dcfce7; font-size: 16px;">
                Tu plataforma de pádel favorita
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                ¡Hola! 👋
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Gracias por suscribirte a nuestra newsletter. Estamos emocionados de tenerte con nosotros en <strong style="color: #16a34a;">Smashly</strong>, tu próxima plataforma favorita para todo lo relacionado con el pádel.
              </p>

              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                <strong>No te perderás ninguna novedad.</strong> Serás el primero en enterarte de:
              </p>

              <!-- Benefits List -->
              <table role="presentation" style="width: 100%; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px; background-color: #f0fdf4; border-left: 4px solid #16a34a; margin-bottom: 10px; border-radius: 4px;">
                    <p style="margin: 0; color: #333333; font-size: 15px;">
                      <strong style="color: #15803d;">🚀 Acceso anticipado a la app</strong><br>
                      <span style="color: #666666; font-size: 14px;">Sé de los primeros en probar todas las funcionalidades exclusivas antes del lanzamiento oficial.</span>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f0fdf4; border-left: 4px solid #16a34a; margin-bottom: 10px; border-radius: 4px;">
                    <p style="margin: 0; color: #333333; font-size: 15px;">
                      <strong style="color: #15803d;">📱 Novedades y actualizaciones</strong><br>
                      <span style="color: #666666; font-size: 14px;">Mantente al día con las últimas características, mejoras y contenido exclusivo.</span>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f0fdf4; border-left: 4px solid #16a34a; margin-bottom: 10px; border-radius: 4px;">
                    <p style="margin: 0; color: #333333; font-size: 15px;">
                      <strong style="color: #15803d;">🎁 Ofertas especiales</strong><br>
                      <span style="color: #666666; font-size: 14px;">Descuentos y promociones exclusivas para suscriptores de la newsletter.</span>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px; background-color: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 4px;">
                    <p style="margin: 0; color: #333333; font-size: 15px;">
                      <strong style="color: #15803d;">💡 Tips y consejos</strong><br>
                      <span style="color: #666666; font-size: 14px;">Guías, recomendaciones y todo lo que necesitas saber sobre el mundo del pádel.</span>
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Estamos trabajando duro para crear la mejor experiencia posible. ¡Muy pronto tendrás noticias nuestras!
              </p>

              <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                ¡Nos vemos en la pista! 🎾<br>
                <strong style="color: #16a34a;">El equipo de Smashly</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 15px; color: #666666; font-size: 13px; line-height: 1.5;">
                Has recibido este email porque te suscribiste a la newsletter de Smashly con la dirección: <strong>${email}</strong>
              </p>
              
              <p style="margin: 0; color: #999999; font-size: 12px;">
                <a href="${unsubscribeUrl}" style="color: #16a34a; text-decoration: none; font-weight: 500;">
                  Darse de baja de la newsletter
                </a>
              </p>
              
              <p style="margin: 15px 0 0; color: #999999; font-size: 12px;">
                <a href="https://www.instagram.com/smashly.app/" style="color: #16a34a; text-decoration: none; margin: 0 8px;">Instagram</a> •
                <a href="https://www.tiktok.com/@smashlyapp" style="color: #16a34a; text-decoration: none; margin: 0 8px;">TikTok</a> •
                <a href="mailto:info@smashly-app.es" style="color: #16a34a; text-decoration: none; margin: 0 8px;">Email</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Plain text version of welcome email
 */
function generateWelcomeEmailText(email: string, unsubscribeUrl: string): string {
  return `
¡Bienvenido a Smashly! 🎾

¡Hola!

Gracias por suscribirte a nuestra newsletter. Estamos emocionados de tenerte con nosotros en Smashly, tu próxima plataforma favorita para todo lo relacionado con el pádel.

No te perderás ninguna novedad. Serás el primero en enterarte de:

🚀 Acceso anticipado a la app
Sé de los primeros en probar todas las funcionalidades exclusivas antes del lanzamiento oficial.

📱 Novedades y actualizaciones
Mantente al día con las últimas características, mejoras y contenido exclusivo.

🎁 Ofertas especiales
Descuentos y promociones exclusivas para suscriptores de la newsletter.

💡 Tips y consejos
Guías, recomendaciones y todo lo que necesitas saber sobre el mundo del pádel.

Estamos trabajando duro para crear la mejor experiencia posible. ¡Muy pronto tendrás noticias nuestras!

¡Nos vemos en la pista! 🎾
El equipo de Smashly

---
Has recibido este email porque te suscribiste a la newsletter de Smashly con la dirección: ${email}

Darse de baja: ${unsubscribeUrl}

Síguenos:
Instagram: https://www.instagram.com/smashly.app/
TikTok: https://www.tiktok.com/@smashlyapp
Email: info@smashly-app.es
  `.trim();
}

// Email service constants
const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Send welcome email via Resend
 */
async function sendWelcomeEmail(
  email: string,
  unsubscribeToken: string
): Promise<void> {

  // Read environment variables inside function to avoid module-level crashes
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://smashlyapp-newsletter.vercel.app';

  if (!RESEND_API_KEY) {
    console.warn('⚠️ Skipping email send - RESEND_API_KEY not configured');
    return;
  }

  const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?token=${unsubscribeToken}`;

  const emailData = {
    from: 'Smashly <info@smashly-app.es>',
    to: [email],
    subject: '¡Bienvenido a Smashly! 🎾',
    html: generateWelcomeEmailHTML(email, unsubscribeUrl),
    text: generateWelcomeEmailText(email, unsubscribeUrl),
    tags: [
      {
        name: 'category',
        value: 'welcome_newsletter',
      },
    ],
  };

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Resend API error:', errorData);
      throw new Error(`Resend API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Welcome email sent successfully:', result.id);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
}

