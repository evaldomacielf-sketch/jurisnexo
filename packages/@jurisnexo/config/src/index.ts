/**
 * JurisNexo Configuration Package
 * Environment validation and shared configuration
 */

export {
  env,
  envSchema,
  apiEnvSchema,
  nextEnvSchema,
  workerEnvSchema,
  validateEnv,
  type EnvConfig,
} from './env.js';
export { appConfig, type AppConfig } from './app.js';
