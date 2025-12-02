/**
 * Welcome Email Template
 * Professional HTML email template for newsletter welcome emails
 */

import fs from 'fs';
import path from 'path';

export interface WelcomeEmailData {
  email: string;
  unsubscribeToken: string;
  unsubscribeUrl: string;
}

export function generateWelcomeEmail(data: WelcomeEmailData): string {
  const { email, unsubscribeUrl } = data;

  // Leer el logo y convertirlo a base64 para incrustarlo en el email
  // Esto funciona en todos los clientes de correo sin necesidad de URLs externas
  let logoDataUri = '';
  try {
    // En desarrollo: __dirname = /backend/api/src/templates
    // En producción: __dirname = /backend/api/dist/templates
    // Necesitamos ir a la raíz del proyecto y luego a public/images/icons/
    const logoPath = path.join(__dirname, '../../../../public/images/icons/smashly-icon.png');
    console.log('Intentando cargar logo desde:', logoPath);
    console.log('__dirname:', __dirname);
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = logoBuffer.toString('base64');
    logoDataUri = `data:image/png;base64,${logoBase64}`;
    console.log('Logo cargado exitosamente, tamaño base64:', logoBase64.length);
  } catch (error) {
    console.error('Error loading logo:', error);
    console.error('__dirname:', __dirname);
    console.error(
      'Ruta intentada:',
      path.join(__dirname, '../../../../public/images/icons/smashly-icon.png')
    );
    // Si falla, usar un placeholder o continuar sin logo
  }

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
                <img src="${logoDataUri}" alt="Smashly Logo" style="width: 80px; height: 80px; margin: 0 auto; display: block; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);" />
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
                <a href="mailto:smashly.app.2025@gmail.com" style="color: #16a34a; text-decoration: none; margin: 0 8px;">Email</a>
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
 * Plain text version of the welcome email (fallback)
 */
export function generateWelcomeEmailText(data: WelcomeEmailData): string {
  const { email, unsubscribeUrl } = data;

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
Email: hello@smashly.app
  `.trim();
}
