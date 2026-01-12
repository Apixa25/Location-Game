// Coin Store for Black Bart's Gold
// Manages nearby coins, selected coin, and coin interaction state

import { create } from 'zustand';
import type { Coin, ARCoin, CoinStatus } from '../types';

/**
 * Coin store state interface
 */
interface CoinState {
  // Nearby coins (within discovery radius)
  nearbyCoins: ARCoin[];

  // Currently selected/targeted coin
  selectedCoinId: string | null;

  // Coin being collected (for animation state)
  collectingCoinId: string | null;

  // Recently collected coins (for UI feedback)
  recentlyCollected: Array<{
    coinId: string;
    value: number;
    collectedAt: number;
  }>;

  // Loading states
  isLoadingCoins: boolean;
  lastFetched: number | null;

  // Error state
  error: string | null;
}

/**
 * Coin store actions interface
 */
interface CoinActions {
  // Coin management
  setNearbyCoins: (coins: ARCoin[]) => void;
  addCoin: (coin: ARCoin) => void;
  updateCoin: (coinId: string, updates: Partial<ARCoin>) => void;
  removeCoin: (coinId: string) => void;
  clearNearbyCoins: () => void;

  // Selection
  selectCoin: (coinId: string | null) => void;
  clearSelection: () => void;

  // Collection
  startCollecting: (coinId: string) => void;
  finishCollecting: (coinId: string, value: number) => void;
  cancelCollecting: () => void;

  // Recently collected
  addToRecentlyCollected: (coinId: string, value: number) => void;
  clearRecentlyCollected: () => void;

  // Utility
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * Initial state for the coin store
 */
const initialState: CoinState = {
  nearbyCoins: [],
  selectedCoinId: null,
  collectingCoinId: null,
  recentlyCollected: [],
  isLoadingCoins: false,
  lastFetched: null,
  error: null,
};

/**
 * Coin Store
 *
 * Manages all coin-related state including:
 * - Nearby coins discovered via GPS
 * - Currently selected/targeted coin for collection
 * - Collection animation state
 * - Recently collected coins for UI feedback
 *
 * Does NOT persist to storage - coins should be fetched fresh from server.
 *
 * @example
 * ```tsx
 * const { nearbyCoins, selectedCoinId } = useCoinStore();
 * const { selectCoin, removeCoin } = useCoinStore();
 * ```
 */
export const useCoinStore = create<CoinState & CoinActions>()((set, get) => ({
  ...initialState,

  // ═══════════════════════════════════════════════════════════════════════════
  // COIN MANAGEMENT ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Set the full list of nearby coins (replaces existing)
   */
  setNearbyCoins: (coins: ARCoin[]) => {
    set({
      nearbyCoins: coins,
      lastFetched: Date.now(),
      error: null,
    });
  },

  /**
   * Add a single coin to nearby coins
   */
  addCoin: (coin: ARCoin) => {
    const { nearbyCoins } = get();
    // Avoid duplicates
    if (!nearbyCoins.find((c) => c.id === coin.id)) {
      set({ nearbyCoins: [...nearbyCoins, coin] });
    }
  },

  /**
   * Update a specific coin's properties
   */
  updateCoin: (coinId: string, updates: Partial<ARCoin>) => {
    const { nearbyCoins } = get();
    set({
      nearbyCoins: nearbyCoins.map((coin) =>
        coin.id === coinId ? { ...coin, ...updates } : coin
      ),
    });
  },

  /**
   * Remove a coin from nearby coins (e.g., after collection)
   */
  removeCoin: (coinId: string) => {
    const { nearbyCoins, selectedCoinId } = get();
    set({
      nearbyCoins: nearbyCoins.filter((coin) => coin.id !== coinId),
      // Clear selection if the removed coin was selected
      selectedCoinId: selectedCoinId === coinId ? null : selectedCoinId,
    });
  },

  /**
   * Clear all nearby coins
   */
  clearNearbyCoins: () => {
    set({
      nearbyCoins: [],
      selectedCoinId: null,
      lastFetched: null,
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECTION ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Select a coin (for targeting with crosshairs)
   */
  selectCoin: (coinId: string | null) => {
    set({ selectedCoinId: coinId });
  },

  /**
   * Clear the current selection
   */
  clearSelection: () => {
    set({ selectedCoinId: null });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COLLECTION ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Start collecting a coin (triggers animation)
   */
  startCollecting: (coinId: string) => {
    set({ collectingCoinId: coinId });
  },

  /**
   * Finish collecting a coin (after animation completes)
   */
  finishCollecting: (coinId: string, value: number) => {
    const { nearbyCoins, selectedCoinId, recentlyCollected } = get();

    set({
      // Remove from nearby coins
      nearbyCoins: nearbyCoins.filter((coin) => coin.id !== coinId),
      // Clear collecting state
      collectingCoinId: null,
      // Clear selection if collected coin was selected
      selectedCoinId: selectedCoinId === coinId ? null : selectedCoinId,
      // Add to recently collected
      recentlyCollected: [
        ...recentlyCollected,
        {
          coinId,
          value,
          collectedAt: Date.now(),
        },
      ].slice(-10), // Keep only last 10
    });
  },

  /**
   * Cancel ongoing collection (e.g., if walked out of range)
   */
  cancelCollecting: () => {
    set({ collectingCoinId: null });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RECENTLY COLLECTED ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add to recently collected (for showing value popup)
   */
  addToRecentlyCollected: (coinId: string, value: number) => {
    const { recentlyCollected } = get();
    set({
      recentlyCollected: [
        ...recentlyCollected,
        {
          coinId,
          value,
          collectedAt: Date.now(),
        },
      ].slice(-10), // Keep only last 10
    });
  },

  /**
   * Clear recently collected list
   */
  clearRecentlyCollected: () => {
    set({ recentlyCollected: [] });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Set loading state
   */
  setLoading: (isLoading: boolean) => {
    set({ isLoadingCoins: isLoading });
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
}));

// ═══════════════════════════════════════════════════════════════════════════
// SELECTOR HOOKS (for optimized re-renders)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the currently selected coin object
 */
export const useSelectedCoin = () =>
  useCoinStore((state) => {
    if (!state.selectedCoinId) return null;
    return state.nearbyCoins.find((c) => c.id === state.selectedCoinId) || null;
  });

/**
 * Get count of nearby coins
 */
export const useNearbyCoinCount = () => useCoinStore((state) => state.nearbyCoins.length);

/**
 * Get the closest coin
 */
export const useClosestCoin = () =>
  useCoinStore((state) => {
    if (state.nearbyCoins.length === 0) return null;
    return state.nearbyCoins.reduce((closest, coin) =>
      coin.distance_meters < closest.distance_meters ? coin : closest
    );
  });

/**
 * Get coins that are collectible (within range and under find limit)
 */
export const useCollectibleCoins = () =>
  useCoinStore((state) => state.nearbyCoins.filter((c) => c.is_collectible && !c.is_over_limit));

/**
 * Check if currently collecting a coin
 */
export const useIsCollecting = () => useCoinStore((state) => state.collectingCoinId !== null);

/**
 * Get most recent collection for UI feedback
 */
export const useMostRecentCollection = () =>
  useCoinStore((state) => {
    if (state.recentlyCollected.length === 0) return null;
    return state.recentlyCollected[state.recentlyCollected.length - 1];
  });

