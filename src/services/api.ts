/**
 * API Client for Black Bart's Gold
 *
 * Centralized API configuration with:
 * - Base URL management (dev/prod)
 * - JWT token injection
 * - Error handling
 * - Request/response interceptors
 * - Retry logic
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/** API base URLs for different environments */
const API_URLS = {
  development: 'http://localhost:3000/api/v1',
  production: 'https://api.blackbartsgold.com/api/v1',
  // For Android emulator, use 10.0.2.2 instead of localhost
  android_emulator: 'http://10.0.2.2:3000/api/v1',
};

/** Current environment - change for production */
const ENVIRONMENT: 'development' | 'production' | 'android_emulator' = 'development';

/** Base URL for API requests */
export const API_BASE_URL = API_URLS[ENVIRONMENT];

/** Storage key for auth token */
const AUTH_TOKEN_KEY = 'authToken';

/** Request timeout in milliseconds */
const REQUEST_TIMEOUT = 30000;

/** Maximum retry attempts */
const MAX_RETRIES = 3;

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

/**
 * API error class
 */
export class ApiError extends Error {
  statusCode: number;
  code?: string;
  isNetworkError: boolean;
  isAuthError: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isNetworkError: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.isNetworkError = isNetworkError;
    this.isAuthError = statusCode === 401;
  }
}

/**
 * Request options
 */
interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  skipAuth?: boolean;
  retries?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// TOKEN MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Store auth token
 */
export async function setAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Get stored auth token
 */
export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Clear auth token (logout)
 */
export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

// ═══════════════════════════════════════════════════════════════════════════
// REQUEST HANDLING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Make an API request
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions
): Promise<T> {
  const { method, headers = {}, body, skipAuth = false, retries = 0 } = options;

  // Build URL
  const url = `${API_BASE_URL}${endpoint}`;

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  // Add auth token if not skipped
  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  // Build request config
  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new ApiError('Request timeout', 408, 'TIMEOUT', true));
      }, REQUEST_TIMEOUT);
    });

    // Make request with timeout
    const response = await Promise.race([fetch(url, config), timeoutPromise]);

    // Parse response
    const data: ApiResponse<T> = await response.json();

    // Handle error responses
    if (!response.ok) {
      const errorMessage = data.error?.message || `Request failed with status ${response.status}`;

      // Handle 401 - clear token and throw
      if (response.status === 401) {
        await clearAuthToken();
        throw new ApiError(errorMessage, 401, 'UNAUTHORIZED');
      }

      throw new ApiError(errorMessage, response.status, data.error?.code);
    }

    // Return data
    if (data.data !== undefined) {
      return data.data;
    }

    return data as unknown as T;
  } catch (error) {
    // Handle network errors with retry
    if (error instanceof TypeError && error.message.includes('fetch')) {
      if (retries < MAX_RETRIES) {
        console.log(`[API] Retrying request (${retries + 1}/${MAX_RETRIES})...`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retries + 1)));
        return request<T>(endpoint, { ...options, retries: retries + 1 });
      }
      throw new ApiError('Network error. Check your connection.', 0, 'NETWORK_ERROR', true);
    }

    // Re-throw ApiErrors
    if (error instanceof ApiError) {
      throw error;
    }

    // Wrap other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      500,
      'UNKNOWN_ERROR'
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HTTP METHODS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GET request
 */
export function get<T>(endpoint: string, skipAuth = false): Promise<T> {
  return request<T>(endpoint, { method: 'GET', skipAuth });
}

/**
 * POST request
 */
export function post<T>(endpoint: string, body?: unknown, skipAuth = false): Promise<T> {
  return request<T>(endpoint, { method: 'POST', body, skipAuth });
}

/**
 * PUT request
 */
export function put<T>(endpoint: string, body?: unknown): Promise<T> {
  return request<T>(endpoint, { method: 'PUT', body });
}

/**
 * DELETE request
 */
export function del<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'DELETE' });
}

/**
 * PATCH request
 */
export function patch<T>(endpoint: string, body?: unknown): Promise<T> {
  return request<T>(endpoint, { method: 'PATCH', body });
}

// ═══════════════════════════════════════════════════════════════════════════
// API SERVICE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export const api = {
  get,
  post,
  put,
  delete: del,
  patch,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  baseUrl: API_BASE_URL,
};

export default api;

