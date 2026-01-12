// useAuth Hook for Black Bart's Gold
// Manages authentication state and session persistence
//
// Reference: docs/BUILD-GUIDE.md - Sprint 5.3: Protected Routes & Session
// Reference: docs/user-accounts-security.md

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useUserStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import {
  getCurrentUser,
  logout as authLogout,
  login as authLogin,
  register as authRegister,
  loginWithGoogle as authLoginWithGoogle,
} from '../services/authService';
import type { User } from '../types';
import type {
  LoginCredentials,
  RegisterData,
  AuthResult,
} from '../services/authService';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseAuthReturn {
  /** Current authenticated user */
  user: User | null;
  /** Whether auth state is being loaded */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether user has active subscription */
  hasActiveSubscription: boolean;
  /** Login with email/password */
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  /** Register new account */
  register: (data: RegisterData) => Promise<AuthResult>;
  /** Login with Google */
  loginWithGoogle: () => Promise<AuthResult>;
  /** Logout and clear session */
  logout: () => Promise<void>;
  /** Refresh user data from stored session */
  refreshSession: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * useAuth - React hook for authentication state management
 *
 * Features:
 * - Auto-checks session on mount
 * - Provides login/register/logout functions
 * - Syncs with Zustand user store
 * - Tracks loading state during auth operations
 *
 * @returns Auth state and control functions
 *
 * @example
 * ```tsx
 * const { user, isLoading, isAuthenticated, login, logout } = useAuth();
 *
 * if (isLoading) {
 *   return <LoadingScreen />;
 * }
 *
 * if (!isAuthenticated) {
 *   return <LoginScreen />;
 * }
 *
 * return <HomeScreen user={user} />;
 * ```
 */
export function useAuth(): UseAuthReturn {
  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────

  const [isLoading, setIsLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────────────────
  // STORE STATE - Use useShallow to prevent infinite rerenders
  // ─────────────────────────────────────────────────────────────────────────

  const storeState = useUserStore(
    useShallow((state) => ({
      userId: state.userId,
      email: state.email,
      isAuthenticated: state.isAuthenticated,
      bbgBalance: state.bbgBalance,
      gasRemaining: state.gasRemaining,
      findLimit: state.findLimit,
      setUser: state.setUser,
      logout: state.logout,
    }))
  );

  // Build user object for compatibility - memoize to prevent unnecessary recreations
  const user: User | null = useMemo(() => {
    if (!storeState.userId || !storeState.email) return null;
    return {
      id: storeState.userId,
      email: storeState.email,
      bbg_balance: storeState.bbgBalance,
      gas_remaining: storeState.gasRemaining,
      find_limit: storeState.findLimit,
      subscription_status: storeState.gasRemaining > 0 ? 'active' : 'inactive',
    };
  }, [storeState.userId, storeState.email, storeState.bbgBalance, storeState.gasRemaining, storeState.findLimit]);
  
  // Wrapper functions for store actions
  const setUser = storeState.setUser;
  const clearUser = storeState.logout;

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  const isAuthenticated = storeState.isAuthenticated;
  const hasActiveSubscription = storeState.gasRemaining > 0;

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Check for existing session on mount
   */
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('[useAuth] Checking for existing session...');
        setIsLoading(true);

        const storedUser = await getCurrentUser();

        if (storedUser) {
          console.log('[useAuth] Found valid session for:', storedUser.email);
          setUser(storedUser);
        } else {
          console.log('[useAuth] No valid session found');
          clearUser();
        }
      } catch (error) {
        console.error('[useAuth] Session check error:', error);
        clearUser();
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [setUser, clearUser]);

  // ─────────────────────────────────────────────────────────────────────────
  // CALLBACKS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Login with email/password
   */
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResult> => {
      try {
        console.log('[useAuth] Attempting login...');
        setIsLoading(true);

        const result = await authLogin(credentials);

        if (result.success && result.user) {
          setUser(result.user);
          console.log('[useAuth] Login successful');
        }

        return result;
      } catch (error) {
        console.error('[useAuth] Login error:', error);
        return {
          success: false,
          error: 'NETWORK_ERROR',
          message: 'Login failed. Please try again.',
        };
      } finally {
        setIsLoading(false);
      }
    },
    [setUser]
  );

  /**
   * Register new account
   */
  const register = useCallback(
    async (data: RegisterData): Promise<AuthResult> => {
      try {
        console.log('[useAuth] Attempting registration...');
        setIsLoading(true);

        const result = await authRegister(data);

        if (result.success && result.user) {
          setUser(result.user);
          console.log('[useAuth] Registration successful');
        }

        return result;
      } catch (error) {
        console.error('[useAuth] Registration error:', error);
        return {
          success: false,
          error: 'NETWORK_ERROR',
          message: 'Registration failed. Please try again.',
        };
      } finally {
        setIsLoading(false);
      }
    },
    [setUser]
  );

  /**
   * Login with Google
   */
  const loginWithGoogle = useCallback(async (): Promise<AuthResult> => {
    try {
      console.log('[useAuth] Attempting Google login...');
      setIsLoading(true);

      const result = await authLoginWithGoogle();

      if (result.success && result.user) {
        setUser(result.user);
        console.log('[useAuth] Google login successful');
      }

      return result;
    } catch (error) {
      console.error('[useAuth] Google login error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Google sign-in failed. Please try again.',
      };
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  /**
   * Logout and clear session
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      console.log('[useAuth] Logging out...');
      setIsLoading(true);

      await authLogout();
      clearUser();

      console.log('[useAuth] Logout successful');
    } catch (error) {
      console.error('[useAuth] Logout error:', error);
      // Still clear local state even if API fails
      clearUser();
    } finally {
      setIsLoading(false);
    }
  }, [clearUser]);

  /**
   * Refresh session from stored data
   */
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      console.log('[useAuth] Refreshing session...');
      setIsLoading(true);

      const storedUser = await getCurrentUser();

      if (storedUser) {
        setUser(storedUser);
      } else {
        clearUser();
      }
    } catch (error) {
      console.error('[useAuth] Session refresh error:', error);
      clearUser();
    } finally {
      setIsLoading(false);
    }
  }, [setUser, clearUser]);

  // ─────────────────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────────────────

  return {
    user,
    isLoading,
    isAuthenticated,
    hasActiveSubscription,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshSession,
  };
}

export default useAuth;

