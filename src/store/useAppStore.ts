// App Store for Black Bart's Gold
// Manages AR state, app settings, and global UI state

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ARTrackingState } from '../types';

/**
 * App-wide settings that persist
 */
interface AppSettings {
  hapticEnabled: boolean;
  soundEnabled: boolean;
  displayMode: 'light' | 'dark' | 'auto';
  lowGasWarningDismissed: boolean;
}

/**
 * App store state interface
 */
interface AppState {
  // AR State
  arTrackingState: ARTrackingState;
  isARActive: boolean;
  isARSupported: boolean | null; // null = not yet checked

  // App lifecycle
  isAppActive: boolean; // Is app in foreground
  isInitialized: boolean; // Has app completed startup

  // Network state
  isOnline: boolean;
  lastOnlineCheck: number | null;

  // UI State
  isLoading: boolean;
  loadingMessage: string | null;

  // Modal states
  showNoGasModal: boolean;
  showLowGasWarning: boolean;
  showFindLimitPopup: boolean;
  findLimitPopupCoinId: string | null;

  // Settings
  settings: AppSettings;

  // Error state
  globalError: string | null;
}

/**
 * App store actions interface
 */
interface AppActions {
  // AR Actions
  setTrackingState: (state: ARTrackingState) => void;
  setARActive: (isActive: boolean) => void;
  setARSupported: (isSupported: boolean) => void;

  // App lifecycle actions
  setAppActive: (isActive: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;

  // Network actions
  setOnlineStatus: (isOnline: boolean) => void;

  // Loading actions
  setLoading: (isLoading: boolean, message?: string) => void;
  clearLoading: () => void;

  // Modal actions
  showNoGas: () => void;
  hideNoGas: () => void;
  showLowGas: () => void;
  hideLowGas: () => void;
  showFindLimit: (coinId: string) => void;
  hideFindLimit: () => void;

  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleHaptic: () => void;
  toggleSound: () => void;
  setDisplayMode: (mode: 'light' | 'dark' | 'auto') => void;

  // Error actions
  setGlobalError: (error: string | null) => void;
  clearGlobalError: () => void;

  // Utility
  reset: () => void;
}

/**
 * Default settings
 */
const defaultSettings: AppSettings = {
  hapticEnabled: true,
  soundEnabled: true,
  displayMode: 'auto',
  lowGasWarningDismissed: false,
};

/**
 * Initial state for the app store
 */
const initialState: AppState = {
  arTrackingState: 'UNAVAILABLE',
  isARActive: false,
  isARSupported: null,
  isAppActive: true,
  isInitialized: false,
  isOnline: true,
  lastOnlineCheck: null,
  isLoading: false,
  loadingMessage: null,
  showNoGasModal: false,
  showLowGasWarning: false,
  showFindLimitPopup: false,
  findLimitPopupCoinId: null,
  settings: defaultSettings,
  globalError: null,
};

/**
 * App Store
 *
 * Manages global app state including:
 * - AR tracking state (NORMAL, LIMITED, UNAVAILABLE)
 * - AR active status
 * - App lifecycle (active, initialized)
 * - Network connectivity
 * - Global loading and error states
 * - Modal visibility
 * - User settings (haptic, sound, display mode)
 *
 * Settings are persisted to AsyncStorage.
 *
 * @example
 * ```tsx
 * const { arTrackingState, isARActive } = useAppStore();
 * const { setTrackingState, setARActive } = useAppStore();
 * ```
 */
export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ═══════════════════════════════════════════════════════════════════════
      // AR ACTIONS
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * Set AR tracking state (NORMAL, LIMITED, UNAVAILABLE)
       */
      setTrackingState: (state: ARTrackingState) => {
        set({ arTrackingState: state });
      },

      /**
       * Set whether AR is currently active (camera view open)
       */
      setARActive: (isActive: boolean) => {
        set({ isARActive: isActive });
      },

      /**
       * Set whether device supports AR
       */
      setARSupported: (isSupported: boolean) => {
        set({ isARSupported: isSupported });
      },

      // ═══════════════════════════════════════════════════════════════════════
      // APP LIFECYCLE ACTIONS
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * Set app active state (foreground/background)
       */
      setAppActive: (isActive: boolean) => {
        set({ isAppActive: isActive });
      },

      /**
       * Set app initialized state
       */
      setInitialized: (isInitialized: boolean) => {
        set({ isInitialized });
      },

      // ═══════════════════════════════════════════════════════════════════════
      // NETWORK ACTIONS
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * Set online status
       */
      setOnlineStatus: (isOnline: boolean) => {
        set({
          isOnline,
          lastOnlineCheck: Date.now(),
        });
      },

      // ═══════════════════════════════════════════════════════════════════════
      // LOADING ACTIONS
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * Set loading state with optional message
       */
      setLoading: (isLoading: boolean, message?: string) => {
        set({
          isLoading,
          loadingMessage: message || null,
        });
      },

      /**
       * Clear loading state
       */
      clearLoading: () => {
        set({
          isLoading: false,
          loadingMessage: null,
        });
      },

      // ═══════════════════════════════════════════════════════════════════════
      // MODAL ACTIONS
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * Show "No Gas" modal
       */
      showNoGas: () => {
        set({ showNoGasModal: true });
      },

      /**
       * Hide "No Gas" modal
       */
      hideNoGas: () => {
        set({ showNoGasModal: false });
      },

      /**
       * Show low gas warning banner
       */
      showLowGas: () => {
        const { settings } = get();
        if (!settings.lowGasWarningDismissed) {
          set({ showLowGasWarning: true });
        }
      },

      /**
       * Hide low gas warning and remember dismissal
       */
      hideLowGas: () => {
        set({
          showLowGasWarning: false,
          settings: {
            ...get().settings,
            lowGasWarningDismissed: true,
          },
        });
      },

      /**
       * Show find limit popup for a specific coin
       */
      showFindLimit: (coinId: string) => {
        set({
          showFindLimitPopup: true,
          findLimitPopupCoinId: coinId,
        });
      },

      /**
       * Hide find limit popup
       */
      hideFindLimit: () => {
        set({
          showFindLimitPopup: false,
          findLimitPopupCoinId: null,
        });
      },

      // ═══════════════════════════════════════════════════════════════════════
      // SETTINGS ACTIONS
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * Update multiple settings at once
       */
      updateSettings: (newSettings: Partial<AppSettings>) => {
        const { settings } = get();
        set({
          settings: {
            ...settings,
            ...newSettings,
          },
        });
      },

      /**
       * Toggle haptic feedback
       */
      toggleHaptic: () => {
        const { settings } = get();
        set({
          settings: {
            ...settings,
            hapticEnabled: !settings.hapticEnabled,
          },
        });
      },

      /**
       * Toggle sound effects
       */
      toggleSound: () => {
        const { settings } = get();
        set({
          settings: {
            ...settings,
            soundEnabled: !settings.soundEnabled,
          },
        });
      },

      /**
       * Set display mode
       */
      setDisplayMode: (mode: 'light' | 'dark' | 'auto') => {
        const { settings } = get();
        set({
          settings: {
            ...settings,
            displayMode: mode,
          },
        });
      },

      // ═══════════════════════════════════════════════════════════════════════
      // ERROR ACTIONS
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * Set global error message
       */
      setGlobalError: (error: string | null) => {
        set({ globalError: error });
      },

      /**
       * Clear global error
       */
      clearGlobalError: () => {
        set({ globalError: null });
      },

      // ═══════════════════════════════════════════════════════════════════════
      // UTILITY ACTIONS
      // ═══════════════════════════════════════════════════════════════════════

      /**
       * Reset store to initial state (keeps settings)
       */
      reset: () => {
        const { settings } = get();
        set({
          ...initialState,
          settings, // Preserve settings on reset
        });
      },
    }),
    {
      name: 'bbg-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist settings
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// SELECTOR HOOKS (for optimized re-renders)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get AR tracking state
 */
export const useARTrackingState = () => useAppStore((state) => state.arTrackingState);

/**
 * Check if AR is ready for use (active + tracking normal)
 */
export const useIsARReady = () =>
  useAppStore((state) => state.isARActive && state.arTrackingState === 'NORMAL');

/**
 * Get app settings
 */
export const useAppSettings = () => useAppStore((state) => state.settings);

/**
 * Check if haptic feedback is enabled
 */
export const useHapticEnabled = () => useAppStore((state) => state.settings.hapticEnabled);

/**
 * Check if sound is enabled
 */
export const useSoundEnabled = () => useAppStore((state) => state.settings.soundEnabled);

/**
 * Check if app is online
 */
export const useIsOnline = () => useAppStore((state) => state.isOnline);

/**
 * Check if there's a global error
 */
export const useHasGlobalError = () => useAppStore((state) => state.globalError !== null);

