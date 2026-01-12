// Export all Zustand stores for Black Bart's Gold
// These stores manage the global application state

// ═══════════════════════════════════════════════════════════════════════════
// USER STORE
// ═══════════════════════════════════════════════════════════════════════════
// Manages user authentication, balance, gas, and find limits
export {
  useUserStore,
  useIsAuthenticated,
  useEconomy,
  useIsLowGas,
  useIsOutOfGas,
} from './useUserStore';

// ═══════════════════════════════════════════════════════════════════════════
// LOCATION STORE
// ═══════════════════════════════════════════════════════════════════════════
// Manages GPS position, grid tracking, and location state
export {
  useLocationStore,
  useCurrentLocation,
  useIsTracking,
  useLocationAccuracy,
  useIsLocationReady,
  useHasLocationPermission,
} from './useLocationStore';

// ═══════════════════════════════════════════════════════════════════════════
// COIN STORE
// ═══════════════════════════════════════════════════════════════════════════
// Manages nearby coins, selected coin, and coin interaction state
export {
  useCoinStore,
  useSelectedCoin,
  useNearbyCoinCount,
  useClosestCoin,
  useCollectibleCoins,
  useIsCollecting,
  useMostRecentCollection,
} from './useCoinStore';

// ═══════════════════════════════════════════════════════════════════════════
// APP STORE
// ═══════════════════════════════════════════════════════════════════════════
// Manages AR state, app settings, and global UI state
export {
  useAppStore,
  useARTrackingState,
  useIsARReady,
  useAppSettings,
  useHapticEnabled,
  useSoundEnabled,
  useIsOnline,
  useHasGlobalError,
} from './useAppStore';

