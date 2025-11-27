// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  endpoints: {
    newsletter: {
      subscribe: '/api/newsletter/subscribe',
    },
  },
};

// Helper para construir URLs completas
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};
