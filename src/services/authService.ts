// Auth Service for Black Bart's Gold
// Handles authentication, registration, and session management
//
// Reference: docs/BUILD-GUIDE.md - Sprint 5.1: Auth Service
// Reference: docs/user-accounts-security.md

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Registration data from user
 */
export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  acceptedTerms: boolean;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Authentication result
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: AuthError;
  message?: string;
}

/**
 * Auth errors
 */
export type AuthError =
  | 'INVALID_EMAIL'
  | 'WEAK_PASSWORD'
  | 'PASSWORDS_DONT_MATCH'
  | 'EMAIL_IN_USE'
  | 'INVALID_CREDENTIALS'
  | 'TERMS_NOT_ACCEPTED'
  | 'INVALID_AGE'
  | 'NETWORK_ERROR'
  | 'SESSION_EXPIRED'
  | 'UNKNOWN_ERROR';

/**
 * Password validation result
 */
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Storage keys for auth data
 */
const STORAGE_KEYS = {
  AUTH_TOKEN: '@bbg_auth_token',
  USER_DATA: '@bbg_user_data',
  SESSION_EXPIRY: '@bbg_session_expiry',
};

/**
 * Password requirements
 */
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false, // Keep it simple for MVP
};

/**
 * Session duration (30 days in milliseconds)
 */
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Minimum age to register
 */
const MINIMUM_AGE = 13;

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate email format
 *
 * @param email - Email to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

/**
 * Validate password strength
 *
 * @param password - Password to validate
 * @returns Validation result with specific errors
 */
export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain an uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain a lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain a number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain a special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate age
 *
 * @param age - Age to validate
 * @returns true if valid age
 */
export function isValidAge(age: number): boolean {
  return age >= MINIMUM_AGE && age <= 120;
}

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Register a new user account
 *
 * @param data - Registration data
 * @returns Auth result with user if successful
 *
 * @example
 * ```typescript
 * const result = await register({
 *   email: 'pirate@blackbart.gold',
 *   password: 'TreasureHunter123',
 *   confirmPassword: 'TreasureHunter123',
 *   age: 25,
 *   acceptedTerms: true,
 * });
 *
 * if (result.success) {
 *   console.log('Welcome aboard!', result.user);
 * }
 * ```
 */
export async function register(data: RegisterData): Promise<AuthResult> {
  try {
    console.log('[Auth] Starting registration for:', data.email);

    // Validate email
    if (!isValidEmail(data.email)) {
      return {
        success: false,
        error: 'INVALID_EMAIL',
        message: 'Please enter a valid email address',
      };
    }

    // Validate password
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        error: 'WEAK_PASSWORD',
        message: passwordValidation.errors[0],
      };
    }

    // Check passwords match
    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        error: 'PASSWORDS_DONT_MATCH',
        message: 'Passwords do not match',
      };
    }

    // Validate age
    if (!isValidAge(data.age)) {
      return {
        success: false,
        error: 'INVALID_AGE',
        message: `You must be at least ${MINIMUM_AGE} years old to register`,
      };
    }

    // Check terms accepted
    if (!data.acceptedTerms) {
      return {
        success: false,
        error: 'TERMS_NOT_ACCEPTED',
        message: 'You must accept the Terms of Service',
      };
    }

    // TODO: Replace with real API call in Sprint 7
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create mock user
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: data.email.trim().toLowerCase(),
      username: data.email.split('@')[0], // Use email prefix as username
      age: data.age,
      created_at: new Date().toISOString(),
      is_active: true,
      is_verified: false,
      find_limit: 1.0, // Default find limit
      subscription_status: 'inactive', // Need to pay $10
    };

    // Generate mock token
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

    // Store session
    await storeSession(user, token);

    console.log('[Auth] Registration successful:', user.id);

    return {
      success: true,
      user,
      token,
    };
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    return {
      success: false,
      error: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Login with email and password
 *
 * @param credentials - Login credentials
 * @returns Auth result with user if successful
 *
 * @example
 * ```typescript
 * const result = await login({
 *   email: 'pirate@blackbart.gold',
 *   password: 'TreasureHunter123',
 * });
 *
 * if (result.success) {
 *   console.log('Welcome back!', result.user);
 * }
 * ```
 */
export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    console.log('[Auth] Attempting login for:', credentials.email);

    // Basic validation
    if (!isValidEmail(credentials.email)) {
      return {
        success: false,
        error: 'INVALID_EMAIL',
        message: 'Please enter a valid email address',
      };
    }

    if (!credentials.password || credentials.password.length < 1) {
      return {
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Please enter your password',
      };
    }

    // TODO: Replace with real API call in Sprint 7
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock: Accept any valid email/password for development
    // In production, this would verify against the backend
    const user: User = {
      id: `user_${Date.now()}`,
      email: credentials.email.trim().toLowerCase(),
      username: credentials.email.split('@')[0],
      age: 25,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      is_active: true,
      is_verified: true,
      find_limit: 5.0, // Example: user has hidden a $5 coin
      subscription_status: 'active',
    };

    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

    // Store session
    await storeSession(user, token);

    console.log('[Auth] Login successful:', user.id);

    return {
      success: true,
      user,
      token,
    };
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Unable to connect. Please check your connection.',
    };
  }
}

/**
 * Login with Google OAuth
 *
 * @returns Auth result with user if successful
 *
 * @example
 * ```typescript
 * const result = await loginWithGoogle();
 * if (result.success) {
 *   console.log('Welcome, Google user!', result.user);
 * }
 * ```
 */
export async function loginWithGoogle(): Promise<AuthResult> {
  try {
    console.log('[Auth] Starting Google OAuth flow...');

    // TODO: Implement actual Google OAuth in production
    // For now, simulate the flow

    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock Google user
    const user: User = {
      id: `google_${Date.now()}`,
      email: 'pirate.hunter@gmail.com',
      username: 'GooglePirate',
      age: 28,
      created_at: new Date().toISOString(),
      is_active: true,
      is_verified: true, // Google accounts are pre-verified
      find_limit: 1.0,
      subscription_status: 'inactive',
      auth_provider: 'google',
    };

    const token = `google_token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

    // Store session
    await storeSession(user, token);

    console.log('[Auth] Google login successful:', user.id);

    return {
      success: true,
      user,
      token,
    };
  } catch (error) {
    console.error('[Auth] Google login error:', error);
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Google sign-in failed. Please try again.',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGOUT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Logout and clear session
 *
 * @example
 * ```typescript
 * await logout();
 * // User is now logged out, show login screen
 * ```
 */
export async function logout(): Promise<void> {
  try {
    console.log('[Auth] Logging out...');

    await clearSession();

    // TODO: Notify backend to invalidate token

    console.log('[Auth] Logout successful');
  } catch (error) {
    console.error('[Auth] Logout error:', error);
    // Still clear local session even if API fails
    await clearSession();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Store session data in AsyncStorage
 *
 * @param user - User object
 * @param token - Auth token
 */
export async function storeSession(user: User, token: string): Promise<void> {
  try {
    const expiry = Date.now() + SESSION_DURATION_MS;

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, token],
      [STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
      [STORAGE_KEYS.SESSION_EXPIRY, expiry.toString()],
    ]);

    console.log('[Auth] Session stored, expires:', new Date(expiry).toISOString());
  } catch (error) {
    console.error('[Auth] Failed to store session:', error);
    throw error;
  }
}

/**
 * Clear session data from AsyncStorage
 */
export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.SESSION_EXPIRY,
    ]);

    console.log('[Auth] Session cleared');
  } catch (error) {
    console.error('[Auth] Failed to clear session:', error);
  }
}

/**
 * Get current user from stored session
 *
 * @returns User if session is valid, null otherwise
 *
 * @example
 * ```typescript
 * const user = await getCurrentUser();
 * if (user) {
 *   console.log('User is logged in:', user.email);
 * } else {
 *   console.log('No active session');
 * }
 * ```
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const [tokenResult, userResult, expiryResult] = await AsyncStorage.multiGet([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.SESSION_EXPIRY,
    ]);

    const token = tokenResult[1];
    const userData = userResult[1];
    const expiry = expiryResult[1];

    // Check if we have all required data
    if (!token || !userData || !expiry) {
      console.log('[Auth] No stored session found');
      return null;
    }

    // Check if session has expired
    const expiryTime = parseInt(expiry, 10);
    if (Date.now() > expiryTime) {
      console.log('[Auth] Session expired');
      await clearSession();
      return null;
    }

    // Parse user data
    const user = JSON.parse(userData) as User;

    // TODO: Validate token with backend
    // For now, trust the stored session

    console.log('[Auth] Restored session for:', user.email);
    return user;
  } catch (error) {
    console.error('[Auth] Failed to get current user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 *
 * @returns true if user has valid session
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Get stored auth token
 *
 * @returns Token if available
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('[Auth] Failed to get auth token:', error);
    return null;
  }
}

/**
 * Refresh user data from server
 *
 * @returns Updated user or null if failed
 */
export async function refreshUserData(): Promise<User | null> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return null;
    }

    // TODO: Fetch updated user data from backend
    // For now, return stored user
    return await getCurrentUser();
  } catch (error) {
    console.error('[Auth] Failed to refresh user data:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const authService = {
  // Validation
  isValidEmail,
  validatePassword,
  isValidAge,
  // Auth actions
  register,
  login,
  loginWithGoogle,
  logout,
  // Session
  storeSession,
  clearSession,
  getCurrentUser,
  isAuthenticated,
  getAuthToken,
  refreshUserData,
};

export default authService;

