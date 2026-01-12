/**
 * Configuration Module
 *
 * Centralizes all environment variables and configuration settings.
 * Validates required variables on startup.
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Environment type
 */
type Environment = 'development' | 'production' | 'test';

/**
 * Get required environment variable or throw
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get optional environment variable
 */
function getOptionalEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Parse boolean environment variable
 */
function _getBoolEnvVar(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}
// Exported for future use
export const getBoolEnvVar = _getBoolEnvVar;

/**
 * Parse number environment variable
 */
function getNumEnvVar(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Application configuration
 */
export const config = {
  // ─────────────────────────────────────────────────────────────────────────
  // Server
  // ─────────────────────────────────────────────────────────────────────────
  env: (getOptionalEnvVar('NODE_ENV', 'development') as Environment),
  port: getNumEnvVar('PORT', 3000),
  isProduction: getOptionalEnvVar('NODE_ENV', 'development') === 'production',
  isDevelopment: getOptionalEnvVar('NODE_ENV', 'development') === 'development',

  // ─────────────────────────────────────────────────────────────────────────
  // Database
  // ─────────────────────────────────────────────────────────────────────────
  database: {
    url: getEnvVar('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/blackbarts_gold?schema=public'),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Authentication
  // ─────────────────────────────────────────────────────────────────────────
  jwt: {
    secret: getEnvVar('JWT_SECRET', 'dev-secret-change-in-production'),
    expiresIn: getOptionalEnvVar('JWT_EXPIRES_IN', '30d'),
  },

  google: {
    clientId: getOptionalEnvVar('GOOGLE_CLIENT_ID', ''),
    clientSecret: getOptionalEnvVar('GOOGLE_CLIENT_SECRET', ''),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Rate Limiting
  // ─────────────────────────────────────────────────────────────────────────
  rateLimit: {
    windowMs: getNumEnvVar('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes
    maxRequests: getNumEnvVar('RATE_LIMIT_MAX_REQUESTS', 100),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Game Configuration
  // ─────────────────────────────────────────────────────────────────────────
  game: {
    dailyGasRate: getNumEnvVar('DAILY_GAS_RATE', 0.33),
    defaultFindLimit: getNumEnvVar('DEFAULT_FIND_LIMIT', 1.0),
    minCoinsPerGrid: getNumEnvVar('MIN_COINS_PER_GRID', 3),
    gridSizeMiles: getNumEnvVar('GRID_SIZE_MILES', 3),
    pendingConfirmationHours: getNumEnvVar('PENDING_CONFIRMATION_HOURS', 24),
    collectionRangeMeters: getNumEnvVar('COLLECTION_RANGE_METERS', 10),
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CORS
  // ─────────────────────────────────────────────────────────────────────────
  cors: {
    origins: getOptionalEnvVar('CORS_ORIGINS', 'http://localhost:3000,http://localhost:8081')
      .split(',')
      .map((origin) => origin.trim()),
  },
};

/**
 * Validate configuration on startup
 */
export function validateConfig(): void {
  console.log('🔧 Validating configuration...');

  // Check required in production
  if (config.isProduction) {
    if (config.jwt.secret === 'dev-secret-change-in-production') {
      throw new Error('JWT_SECRET must be set in production!');
    }
    if (!config.database.url) {
      throw new Error('DATABASE_URL must be set in production!');
    }
  }

  console.log(`✅ Configuration valid for ${config.env} environment`);
}

export default config;

