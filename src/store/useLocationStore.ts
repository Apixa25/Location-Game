// Location Store for Black Bart's Gold
// Manages GPS position, grid tracking, and location state

import { create } from 'zustand';
import type { Coordinates, LocationData, Grid, LocationPermissionStatus, LocationError } from '../types';

/**
 * Location store state interface
 */
interface LocationState {
  // Current position
  currentLocation: Coordinates | null;
  locationData: LocationData | null; // Extended location with accuracy, speed, etc.
  accuracy: number | null; // GPS accuracy in meters

  // Grid system
  currentGrid: Grid | null;

  // Tracking state
  isTracking: boolean;
  watchId: number | null;

  // Permission state
  permissionStatus: LocationPermissionStatus | null;

  // Error handling
  error: LocationError | null;
  errorMessage: string | null;

  // Last update timestamp
  lastUpdated: number | null;
}

/**
 * Location store actions interface
 */
interface LocationActions {
  // Position actions
  setLocation: (location: Coordinates) => void;
  setLocationData: (data: LocationData) => void;
  clearLocation: () => void;

  // Grid actions
  setGrid: (grid: Grid) => void;
  clearGrid: () => void;

  // Tracking actions
  startTracking: (watchId: number) => void;
  stopTracking: () => void;

  // Permission actions
  setPermissionStatus: (status: LocationPermissionStatus) => void;

  // Error actions
  setError: (error: LocationError, message?: string) => void;
  clearError: () => void;

  // Utility actions
  reset: () => void;
}

/**
 * Initial state for the location store
 */
const initialState: LocationState = {
  currentLocation: null,
  locationData: null,
  accuracy: null,
  currentGrid: null,
  isTracking: false,
  watchId: null,
  permissionStatus: null,
  error: null,
  errorMessage: null,
  lastUpdated: null,
};

/**
 * Location Store
 *
 * Manages all location-related state including:
 * - Current GPS position (latitude, longitude)
 * - Extended location data (accuracy, altitude, speed, heading)
 * - Grid system for dynamic coin distribution
 * - Location tracking state
 * - Permission status
 *
 * Does NOT persist to storage - location should be fresh on each session.
 *
 * @example
 * ```tsx
 * const { currentLocation, isTracking } = useLocationStore();
 * const { setLocation, startTracking } = useLocationStore();
 * ```
 */
export const useLocationStore = create<LocationState & LocationActions>()((set, get) => ({
  ...initialState,

  // ═══════════════════════════════════════════════════════════════════════════
  // POSITION ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Set basic location coordinates
   */
  setLocation: (location: Coordinates) => {
    set({
      currentLocation: location,
      lastUpdated: Date.now(),
      error: null,
      errorMessage: null,
    });
  },

  /**
   * Set extended location data (includes accuracy, altitude, speed, heading)
   */
  setLocationData: (data: LocationData) => {
    set({
      currentLocation: {
        latitude: data.latitude,
        longitude: data.longitude,
      },
      locationData: data,
      accuracy: data.accuracy,
      lastUpdated: data.timestamp,
      error: null,
      errorMessage: null,
    });
  },

  /**
   * Clear current location data
   */
  clearLocation: () => {
    set({
      currentLocation: null,
      locationData: null,
      accuracy: null,
      lastUpdated: null,
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GRID ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Set current grid (for dynamic coin distribution)
   */
  setGrid: (grid: Grid) => {
    set({ currentGrid: grid });
  },

  /**
   * Clear current grid
   */
  clearGrid: () => {
    set({ currentGrid: null });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRACKING ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Start location tracking with watch ID
   */
  startTracking: (watchId: number) => {
    set({
      isTracking: true,
      watchId,
      error: null,
      errorMessage: null,
    });
  },

  /**
   * Stop location tracking
   */
  stopTracking: () => {
    set({
      isTracking: false,
      watchId: null,
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERMISSION ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Set location permission status
   */
  setPermissionStatus: (status: LocationPermissionStatus) => {
    set({ permissionStatus: status });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Set location error
   */
  setError: (error: LocationError, message?: string) => {
    set({
      error,
      errorMessage: message || getDefaultErrorMessage(error),
    });
  },

  /**
   * Clear location error
   */
  clearError: () => {
    set({
      error: null,
      errorMessage: null,
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Reset store to initial state
   */
  reset: () => {
    set(initialState);
  },
}));

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get default error message for location errors
 */
function getDefaultErrorMessage(error: LocationError): string {
  switch (error) {
    case 'PERMISSION_DENIED':
      return 'Location permission denied. Please enable in settings.';
    case 'POSITION_UNAVAILABLE':
      return 'Unable to determine location. Please try again.';
    case 'TIMEOUT':
      return 'Location request timed out. Check GPS signal.';
    case 'UNKNOWN':
    default:
      return 'An unknown location error occurred.';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SELECTOR HOOKS (for optimized re-renders)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get just the current coordinates
 */
export const useCurrentLocation = () => useLocationStore((state) => state.currentLocation);

/**
 * Get tracking status
 */
export const useIsTracking = () => useLocationStore((state) => state.isTracking);

/**
 * Get location accuracy in meters
 */
export const useLocationAccuracy = () => useLocationStore((state) => state.accuracy);

/**
 * Check if location is available and accurate enough for gameplay
 * Requires accuracy within 30 meters
 */
export const useIsLocationReady = () =>
  useLocationStore((state) => {
    const { currentLocation, accuracy, permissionStatus } = state;
    return (
      currentLocation !== null &&
      accuracy !== null &&
      accuracy <= 30 && // 30 meter accuracy threshold
      permissionStatus === 'granted'
    );
  });

/**
 * Check if we have location permission
 */
export const useHasLocationPermission = () =>
  useLocationStore((state) => state.permissionStatus === 'granted');

