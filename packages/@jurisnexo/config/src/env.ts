import { z } from 'zod';

/**
 * Service-specific env schemas
 * Each service only validates what it needs
 */

// Base required envs for all services
const baseSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().optional(),
});

// Next.js specific
export const nextEnvSchema = baseSchema.extend({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

// API specific
export const apiEnvSchema = baseSchema.extend({
  SUPABASE_URL: z.string().url('SUPABASE_URL is required').optional().or(z.literal('')),
  SUPABASE_ANON_KEY: z.string().min(1).optional().or(z.literal('')),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional().or(z.literal('')),
  JWT_SECRET: z.string().min(32).default('super-secret-jwt-key-minimum-32-chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().optional(),
  REDIS_URL: z.string().url().optional().or(z.literal('')),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  // SendGrid is strictly required for Prod, but optional for Dev (we'll mock it)
  SENDGRID_API_KEY: z.string().optional().or(z.literal('')),
  EMAIL_FROM: z.string().email().default('noreply@jurisnexo.com.br'),
});

// Worker specific
export const workerEnvSchema = baseSchema.extend({
  SUPABASE_URL: z.string().url('SUPABASE_URL is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().optional().default(6379),
});

// Full schema (for validation reference)
export const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().optional(),

  // Database
  DATABASE_URL: z.string().url().optional(),

  // Supabase
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Next.js public env
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // API
  API_PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default('/api'),
  CORS_ORIGINS: z.string().optional(),

  // Worker
  WORKER_PORT: z.coerce.number().default(4001),
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.coerce.number().optional().default(6379),

  // JWT
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // WhatsApp (optional)
  WHATSAPP_API_URL: z.string().url().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),

  // Stripe (optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
  SENDGRID_API_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;
export type NextEnvConfig = z.infer<typeof nextEnvSchema>;
export type ApiEnvConfig = z.infer<typeof apiEnvSchema>;
export type WorkerEnvConfig = z.infer<typeof workerEnvSchema>;

/**
 * Validate environment at startup - fails fast if invalid
 */
export function validateEnv<T>(schema: z.ZodSchema<T>, serviceName: string): T {
  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    console.error(`❌ [${serviceName}] Invalid environment variables:`);
    const errors = parsed.error.flatten().fieldErrors;
    Object.entries(errors).forEach(([key, messages]) => {
      console.error(`  - ${key}: ${(messages as string[])?.join(', ')}`);
    });
    throw new Error(`[${serviceName}] Environment validation failed. App will not start.`);
  }

  console.log(`✅ [${serviceName}] Environment validated successfully`);
  return parsed.data;
}

// Lazy-loaded env (for general use)
let _env: EnvConfig | null = null;

export const env = new Proxy({} as EnvConfig, {
  get(_, prop: string) {
    if (!_env) {
      _env = envSchema.parse(process.env);
    }
    return _env[prop as keyof EnvConfig];
  },
});
