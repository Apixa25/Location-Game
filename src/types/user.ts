// User Types for Black Bart's Gold

/**
 * Subscription status
 */
export type SubscriptionStatus = 'active' | 'inactive' | 'expired' | 'cancelled';

/**
 * Auth provider (how user registered)
 */
export type AuthProvider = 'email' | 'google' | 'apple';

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  /** Optional display name */
  username?: string;
  /** User's age (for sponsor restrictions) */
  age: number | null;
  /** Total BBG balance (gas + parked + pending) */
  bbg_balance?: number;
  /** BBG in gas tank (days remaining) */
  gas_remaining?: number;
  /** Maximum coin value the user can find */
  find_limit: number;
  /** Account creation timestamp */
  created_at: string;
  /** Last login timestamp */
  last_login_at?: string;
  /** Whether the account is active */
  is_active: boolean;
  /** Whether email is verified */
  is_verified: boolean;
  /** Whether the account is banned */
  is_banned?: boolean;
  /** Reason for ban if applicable */
  ban_reason?: string | null;
  /** Subscription status */
  subscription_status: SubscriptionStatus;
  /** How the user registered */
  auth_provider?: AuthProvider;
}

/**
 * User statistics
 */
export interface UserStats {
  /** Total number of coins found */
  total_found_count: number;
  /** Total number of coins hidden */
  total_hidden_count: number;
  /** Total value of all coins found */
  total_value_found: number;
  /** Total value of all coins hidden */
  total_value_hidden: number;
  /** Highest single coin value ever hidden (determines find limit) */
  highest_hidden_value: number;
}

/**
 * User preferences/settings
 */
export interface UserSettings {
  /** Enable haptic feedback */
  haptic_enabled: boolean;
  /** Enable sound effects */
  sound_enabled: boolean;
  /** Display mode preference */
  display_mode: 'light' | 'dark' | 'auto';
  /** Push notification preferences */
  notifications: {
    low_gas_warning: boolean;
    coin_found_nearby: boolean;
    coin_collected: boolean;
  };
}

/**
 * Authentication session
 */
export interface AuthSession {
  user: User;
  token: string;
  expires_at: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegistrationData {
  email: string;
  password: string;
  age: number;
}
