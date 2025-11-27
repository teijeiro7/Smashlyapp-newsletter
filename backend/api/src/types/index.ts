// API Configuration Types

export interface ApiConfig {
  port: number;
  nodeEnv: string;
  corsOrigin: string[];
  jwtSecret?: string;
  database: {
    url: string;
    key: string;
  };
  gemini: {
    apiKey: string;
  };
}

// Add other shared types here as needed
