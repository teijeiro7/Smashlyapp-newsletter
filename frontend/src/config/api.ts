// Configuración de la API
// En desarrollo, usar localhost por defecto
// En producción, usar la URL de Render
const isDevelopment = import.meta.env.MODE === 'development';
const DEFAULT_API_URL = isDevelopment
  ? 'http://localhost:3000'
  : 'https://smashlyapp-api.onrender.com';

const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  endpoints: {
    newsletter: {
      subscribe: '/api/v1/newsletter/subscribe',
    },
  },
};

// Helper para construir URLs completas
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};
