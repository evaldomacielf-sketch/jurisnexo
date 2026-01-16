/**
 * Application configuration constants
 */
export interface AppConfig {
  name: string;
  version: string;
  description: string;
  hosts: {
    site: string;
    app: string;
    auth: string;
    api: string;
  };
  pagination: {
    defaultLimit: number;
    maxLimit: number;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export const appConfig: AppConfig = {
  name: 'JurisNexo',
  version: '0.0.1',
  description: 'CRM Jurídico Multi-tenant',
  hosts: {
    site: 'jurisnexo.com.br',
    app: 'app.jurisnexo.com.br',
    auth: 'auth.jurisnexo.com.br',
    api: 'api.jurisnexo.com.br',
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },
};
