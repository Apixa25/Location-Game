// User Store for Black Bart's Gold
// Manages user authentication state, balance, gas, and find limits

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, UserStats } from '../types';

/**
 * User store state interface
 */
interface UserState {
  // User data
  userId: string | null;
  email: string | null;
  isAuthenticated: boolean;

  // Economy data
  bbgBalance: number;
  gasRemaining: number; // Days of gas left
  findLimit: number; // Maximum coin value user can find

  // User stats
  stats: UserStats;

  // Loading states
  isLoading: boolean;
  error: string | null;
}

/**
 * User store actions interface
 */
interface UserActions {
  // Authentication actions
  setUser: (user: User) => void;
  logout: () => void;

  // Economy actions
  updateBalance: (newBalance: number) => void;
  addToBalance: (amount: number) => void;
  subtractFromBalance: (amount: number) => void;
  updateGas: (daysRemaining: number) => void;
  consumeGas: (days?: number) => void;
  updateFindLimit: (newLimit: number) => void;

  // Stats actions
  updateStats: (stats: Partial<UserStats>) => void;
  incrementCoinsFound: (value: number) => void;
  incrementCoinsHidden: (value: number) => void;

  // Utility actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Initial state for the user store
 */
const initialState: UserState = {
  userId: null,
  email: null,
  isAuthenticated: false,
  bbgBalance: 0,
  gasRemaining: 0,
  findLimit: 1.0, // Default $1.00 find limit
  stats: {
    total_found_count: 0,
    total_hidden_count: 0,
    total_value_found: 0,
    total_value_hidden: 0,
    highest_hidden_value: 0,
  },
  isLoading: false,
  error: null,
};

/**
 * User Store
 *
 * Manages all user-related state including:
 * - Authentication (userId, email, isAuthenticated)
 * - Economy (bbgBalance, gasRemaining, findLimit)
 * - Statistics (coins found, coins hidden, values)
 *
 * Uses persist middleware to save to AsyncStorage for session persistence.
 *
 * @example
 * ```tsx
 * const { bbgBalance, gasRemaining, findLimit } = useUserStore();
 * const { updateBalance, consumeGas } = useUserStore();
 * ```
 */
export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ═══════════════════════════════════════════════════════════════════════
      // AUTHENTICATION ACTIONS
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * Set user data after successful login/registration
       */
      setUser: (user: User) => {
        console.log('[UserStore] setUser called with:', {
          id: user.id,
          email: user.email,
          bbg_balance: user.bbg_balance,
          gas_remaining: user.gas_remaining,
          find_limit: user.find_limit,
        });
        set({
          userId: user.id,
          email: user.email,
          isAuthenticated: true,
          bbgBalance: user.bbg_balance ?? 0,
          gasRemaining: user.gas_remaining ?? 0,
          findLimit: user.find_limit ?? 1.0,
          error: null,
        });
        console.log('[UserStore] Store updated - bbgBalance:', user.bbg_balance ?? 0, 'gasRemaining:', user.gas_remaining ?? 0);
      },

      /**
       * Clear user data on logout
       */
      logout: () => {
        set(initialState);
      },

      // ═══════════════════════════════════════════════════════════════════════
      // ECONOMY ACTIONS
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * Set absolute balance value
       */
      updateBalance: (newBalance: number) => {
        set({ bbgBalance: Math.max(0, newBalance) });
      },

      /**
       * Add to current balance (e.g., after finding a coin)
       */
      addToBalance: (amount: number) => {
        const { bbgBalance } = get();
        set({ bbgBalance: bbgBalance + amount });
      },

      /**
       * Subtract from balance (e.g., after hiding a coin)
       */
      subtractFromBalance: (amount: number) => {
        const { bbgBalance } = get();
        set({ bbgBalance: Math.max(0, bbgBalance - amount) });
      },

      /**
       * Update gas remaining (days)
       */
      updateGas: (daysRemaining: number) => {
        set({ gasRemaining: Math.max(0, daysRemaining) });
      },

      /**
       * Consume gas (default 1 day)
       * Called daily to deduct gas fee
       */
      consumeGas: (days = 1) => {
        const { gasRemaining } = get();
        set({ gasRemaining: Math.max(0, gasRemaining - days) });
      },

      /**
       * Update find limit (only if new limit is higher)
       * Find limit = highest single coin ever hidden
       */
      updateFindLimit: (newLimit: number) => {
        const { findLimit } = get();
        // Find limits never decrease
        if (newLimit > findLimit) {
          set({ findLimit: newLimit });
        }
      },

      // ═══════════════════════════════════════════════════════════════════════
      // STATS ACTIONS
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * Update user statistics
       */
      updateStats: (stats: Partial<UserStats>) => {
        const currentStats = get().stats;
        set({
          stats: {
            ...currentStats,
            ...stats,
          },
        });
      },

      /**
       * Increment coins found counter and value
       */
      incrementCoinsFound: (value: number) => {
        const { stats } = get();
        set({
          stats: {
            ...stats,
            total_found_count: stats.total_found_count + 1,
            total_value_found: stats.total_value_found + value,
          },
        });
      },

      /**
       * Increment coins hidden counter and value
       * Also updates find limit if this is the highest coin hidden
       */
      incrementCoinsHidden: (value: number) => {
        const { stats, findLimit } = get();
        const newHighest = Math.max(stats.highest_hidden_value, value);

        set({
          stats: {
            ...stats,
            total_hidden_count: stats.total_hidden_count + 1,
            total_value_hidden: stats.total_value_hidden + value,
            highest_hidden_value: newHighest,
          },
          // Update find limit if this is a new high
          findLimit: Math.max(findLimit, newHighest),
        });
      },

      // ═══════════════════════════════════════════════════════════════════════
      // UTILITY ACTIONS
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * Set loading state
       */
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      /**
       * Set error state
       */
      setError: (error: string | null) => {
        set({ error });
      },

      /**
       * Reset store to initial state
       */
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'bbg-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential data, not loading states
      partialize: (state) => ({
        userId: state.userId,
        email: state.email,
        isAuthenticated: state.isAuthenticated,
        bbgBalance: state.bbgBalance,
        gasRemaining: state.gasRemaining,
        findLimit: state.findLimit,
        stats: state.stats,
      }),
    }
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// SELECTOR HOOKS (for optimized re-renders)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get just the authentication status
 */
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated);

/**
 * Get economy data (balance, gas, find limit)
 */
export const useEconomy = () =>
  useUserStore((state) => ({
    bbgBalance: state.bbgBalance,
    gasRemaining: state.gasRemaining,
    findLimit: state.findLimit,
  }));

/**
 * Check if user is low on gas (less than 15% or 4.5 days of 30)
 */
export const useIsLowGas = () =>
  useUserStore((state) => state.gasRemaining > 0 && state.gasRemaining <= 4.5);

/**
 * Check if user has no gas
 */
export const useIsOutOfGas = () => useUserStore((state) => state.gasRemaining <= 0);

