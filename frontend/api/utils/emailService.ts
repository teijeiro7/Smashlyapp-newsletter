/**
 * Email Service for Vercel Serverless Functions
 * Sends emails using Brevo (Sendinblue) API
 */

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://smashlyapp-newsletter.vercel.app';

if (!BREVO_API_KEY) {
  console.warn('⚠️ BREVO_API_KEY not configured - emails will not be sent');
}

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

/**
 * Send welcome email via Brevo
 */
export async function sendWelcomeEmail(
  email: string,
  unsubscribeToken: string
): Promise<void> {
  if (!BREVO_API_KEY) {
    console.warn('⚠️ Skipping email send - BREVO_API_KEY not configured');
    return;
  }

  const unsubscribeUrl = `${FRONTEND_URL}/unsubscribe?token=${unsubscribeToken}`;

  const emailData = {
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
    htmlContent: generateWelcomeEmailHTML(email, unsubscribeUrl),
    textContent: generateWelcomeEmailText(email, unsubscribeUrl),
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Brevo API error:', errorData);
      throw new Error(`Brevo API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Welcome email sent successfully:', result.messageId);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
}
