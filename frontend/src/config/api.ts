// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://smashlyapp-api.onrender.com';

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
