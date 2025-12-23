// Configuración de la API
// Newsletter ahora usa función serverless de Vercel (sin cold starts)
// Otras APIs futuras pueden usar Render

const isDevelopment = import.meta.env.MODE === 'development';

// Para el newsletter, usamos la función serverless local de Vercel
// En desarrollo: /api/newsletter/subscribe (Vercel Dev)
// En producción: /api/newsletter/subscribe (Vercel Edge)
const NEWSLETTER_ENDPOINT = '/api/newsletter/subscribe';

// Para otras APIs futuras (si las necesitas), puedes usar Render
const DEFAULT_API_URL = isDevelopment
  ? 'http://localhost:3000'
  : 'https://smashlyapp-api.onrender.com';

const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  endpoints: {
    newsletter: {
      subscribe: NEWSLETTER_ENDPOINT, // Ahora usa Vercel serverless
    },
  },
};

// Helper para construir URLs completas
export const getApiUrl = (endpoint: string): string => {
  // Si el endpoint empieza con /api/, es una ruta local de Vercel
  if (endpoint.startsWith('/api/')) {
    return endpoint;
  }
  // Si no, usa la base URL (para otras APIs futuras)
  return `${API_CONFIG.baseURL}${endpoint}`;
};
