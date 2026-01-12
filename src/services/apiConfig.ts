/**
 * API Configuration
 *
 * Controls whether to use real API or mock data.
 * Toggle USE_REAL_API for development vs production.
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Set to true to use real backend API
 * Set to false to use mock data (for development without backend)
 */
export const USE_REAL_API = false;

/**
 * API Base URLs
 */
export const API_URLS = {
  development: 'http://localhost:3000/api/v1',
  production: 'https://api.blackbartsgold.com/api/v1',
  android_emulator: 'http://10.0.2.2:3000/api/v1',
  ios_simulator: 'http://localhost:3000/api/v1',
};

/**
 * Current environment
 */
export type Environment = 'development' | 'production' | 'android_emulator' | 'ios_simulator';

/**
 * Get the current environment
 * In production builds, this would be determined by build config
 */
export function getCurrentEnvironment(): Environment {
  // For now, default to development
  // TODO: Use react-native-config or similar for build-time config
  return 'development';
}

/**
 * Get the API base URL for current environment
 */
export function getApiBaseUrl(): string {
  const env = getCurrentEnvironment();
  return API_URLS[env];
}

/**
 * Check if we should use real API calls
 */
export function shouldUseRealApi(): boolean {
  return USE_REAL_API;
}

export default {
  USE_REAL_API,
  API_URLS,
  getCurrentEnvironment,
  getApiBaseUrl,
  shouldUseRealApi,
};

