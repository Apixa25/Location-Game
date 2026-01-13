// useLocation Hook for Black Bart's Gold
// React hook for location tracking with automatic cleanup
//
// Reference: docs/BUILD-GUIDE.md - Sprint 3.2: Location Hook
// Reference: project-vision.md - Location System section

import { useEffect, useCallback, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  requestLocationPermission,
  getCurrentPosition,
  watchPosition,
  stopWatching,
  calculateDistance,
  calculateBearing,
} from '../services/location';
import { useLocationStore, useCoinStore } from '../store';
import type { Coordinates, LocationData, LocationError } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseLocationOptions {
  /** Auto-start tracking on mount (default: true) */
  autoStart?: boolean;
  /** Distance filter in meters (default: 5) */
  distanceFilter?: number;
  /** Enable high accuracy (default: true) */
  enableHighAccuracy?: boolean;
  /** Pause tracking when app is backgrounded (default: true) */
  pauseInBackground?: boolean;
}

export interface UseLocationReturn {
  /** Current location coordinates */
  location: Coordinates | null;
  /** Full location data with accuracy, altitude, etc. */
  locationData: LocationData | null;
  /** GPS accuracy in meters */
  accuracy: number | null;
  /** Error message if any */
  error: string | null;
  /** Whether actively tracking */
  isTracking: boolean;
  /** Whether permission is granted */
  hasPermission: boolean | null;
  /** Distance to selected coin in meters */
  distanceToSelectedCoin: number | null;
  /** Bearing to selected coin in degrees */
  bearingToSelectedCoin: number | null;
  /** Manually refresh position */
  refresh: () => Promise<void>;
  /** Start tracking */
  startTracking: () => Promise<void>;
  /** Stop tracking */
  stopTracking: () => void;
  /** Request permission */
  requestPermission: () => Promise<boolean>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * useLocation - React hook for GPS location tracking
 *
 * Features:
 * - Automatic permission handling
 * - Continuous position tracking
 * - Background pause/resume
 * - Distance/bearing to selected coin
 * - Automatic store updates
 * - Proper cleanup on unmount
 *
 * @param options - Configuration options
 * @returns Location state and control functions
 *
 * @example
 * ```tsx
 * const {
 *   location,
 *   accuracy,
 *   isTracking,
 *   distanceToSelectedCoin,
 *   bearingToSelectedCoin,
 * } = useLocation();
 *
 * // In your render:
 * {location && (
 *   <Text>
 *     You are at {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
 *   </Text>
 * )}
 * ```
 */
export function useLocation(options: UseLocationOptions = {}): UseLocationReturn {
  const {
    autoStart = true,
    distanceFilter = 5,
    enableHighAccuracy = true,
    pauseInBackground = true,
  } = options;

  // ─────────────────────────────────────────────────────────────────────────
  // REFS
  // ─────────────────────────────────────────────────────────────────────────

  const watchIdRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // ─────────────────────────────────────────────────────────────────────────
  // LOCAL STATE
  // ─────────────────────────────────────────────────────────────────────────

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // STORE STATE
  // ─────────────────────────────────────────────────────────────────────────

  // Location store
  const currentLocation = useLocationStore((state) => state.currentLocation);
  const locationData = useLocationStore((state) => state.locationData);
  const accuracy = useLocationStore((state) => state.accuracy);
  const isTracking = useLocationStore((state) => state.isTracking);
  const setLocation = useLocationStore((state) => state.setLocation);
  const setLocationData = useLocationStore((state) => state.setLocationData);
  const startTrackingStore = useLocationStore((state) => state.startTracking);
  const stopTrackingStore = useLocationStore((state) => state.stopTracking);
  const setPermissionStatus = useLocationStore((state) => state.setPermissionStatus);
  const setLocationError = useLocationStore((state) => state.setError);
  const clearLocationError = useLocationStore((state) => state.clearError);

  // Coin store - for distance/bearing calculations
  const selectedCoinId = useCoinStore((state) => state.selectedCoinId);
  const nearbyCoins = useCoinStore((state) => state.nearbyCoins);

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get selected coin from store
   */
  const selectedCoin = selectedCoinId
    ? nearbyCoins.find((c) => c.id === selectedCoinId)
    : null;

  /**
   * Calculate distance to selected coin
   * Handle both coin.location and coin.latitude/longitude formats
   */
  const distanceToSelectedCoin =
    currentLocation && selectedCoin
      ? calculateDistance(
          currentLocation, 
          selectedCoin.location || { latitude: (selectedCoin as any).latitude, longitude: (selectedCoin as any).longitude }
        )
      : null;

  /**
   * Calculate bearing to selected coin
   * Handle both coin.location and coin.latitude/longitude formats
   */
  const bearingToSelectedCoin =
    currentLocation && selectedCoin
      ? calculateBearing(
          currentLocation, 
          selectedCoin.location || { latitude: (selectedCoin as any).latitude, longitude: (selectedCoin as any).longitude }
        )
      : null;

  // ─────────────────────────────────────────────────────────────────────────
  // CALLBACKS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Request location permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[useLocation] Requesting permission...');
      const granted = await requestLocationPermission();
      
      if (isMountedRef.current) {
        setHasPermission(granted);
        setPermissionStatus(granted ? 'granted' : 'denied');
        
        if (!granted) {
          setError('Location permission denied');
          setLocationError('PERMISSION_DENIED', 'Location permission denied');
        } else {
          setError(null);
          clearLocationError();
        }
      }
      
      return granted;
    } catch (err) {
      console.error('[useLocation] Permission error:', err);
      if (isMountedRef.current) {
        setHasPermission(false);
        setError('Failed to request permission');
      }
      return false;
    }
  }, [setPermissionStatus, setLocationError, clearLocationError]);

  /**
   * Handle location update from GPS
   */
  const handleLocationUpdate = useCallback(
    (data: LocationData) => {
      if (!isMountedRef.current) return;
      
      setLocationData(data);
      setError(null);
      clearLocationError();
    },
    [setLocationData, clearLocationError]
  );

  /**
   * Handle location error from GPS
   */
  const handleLocationError = useCallback(
    (locError: LocationError) => {
      if (!isMountedRef.current) return;

      let message: string;
      switch (locError) {
        case 'PERMISSION_DENIED':
          message = 'Location permission denied';
          setHasPermission(false);
          break;
        case 'POSITION_UNAVAILABLE':
          message = 'Unable to determine location';
          break;
        case 'TIMEOUT':
          message = 'Location request timed out';
          break;
        default:
          message = 'Location error occurred';
      }

      setError(message);
      setLocationError(locError, message);
    },
    [setLocationError]
  );

  /**
   * Start position tracking
   */
  const startTracking = useCallback(async () => {
    // Check/request permission first
    if (hasPermission !== true) {
      const granted = await requestPermission();
      if (!granted) {
        console.log('[useLocation] Cannot start tracking - no permission');
        return;
      }
    }

    // Don't start if already tracking
    if (watchIdRef.current !== null) {
      console.log('[useLocation] Already tracking');
      return;
    }

    console.log('[useLocation] Starting tracking...');

    // Get initial position
    try {
      const position = await getCurrentPosition({ enableHighAccuracy });
      handleLocationUpdate(position);
    } catch (err) {
      console.warn('[useLocation] Initial position failed:', err);
      // Continue anyway - watch might work
    }

    // Start continuous tracking
    const watchId = watchPosition(
      handleLocationUpdate,
      handleLocationError,
      {
        enableHighAccuracy,
        distanceFilter,
      }
    );

    watchIdRef.current = watchId;
    startTrackingStore(watchId);
  }, [
    hasPermission,
    requestPermission,
    enableHighAccuracy,
    distanceFilter,
    handleLocationUpdate,
    handleLocationError,
    startTrackingStore,
  ]);

  /**
   * Stop position tracking
   */
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      console.log('[useLocation] Stopping tracking...');
      stopWatching(watchIdRef.current);
      watchIdRef.current = null;
      stopTrackingStore();
    }
  }, [stopTrackingStore]);

  /**
   * Refresh position (single reading)
   */
  const refresh = useCallback(async () => {
    try {
      setError(null);
      const position = await getCurrentPosition({ enableHighAccuracy });
      handleLocationUpdate(position);
    } catch (err) {
      handleLocationError(err as LocationError);
    }
  }, [enableHighAccuracy, handleLocationUpdate, handleLocationError]);

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Track mounted state
   */
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Auto-start tracking on mount
   */
  useEffect(() => {
    if (autoStart) {
      startTracking();
    }

    // Cleanup on unmount
    return () => {
      stopTracking();
    };
  }, [autoStart]); // Only run on mount/unmount, not when callbacks change

  /**
   * Handle app state changes (background/foreground)
   */
  useEffect(() => {
    if (!pauseInBackground) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground - resume tracking
        if (autoStart && watchIdRef.current === null) {
          console.log('[useLocation] App active - resuming tracking');
          startTracking();
        }
      } else if (nextAppState === 'background') {
        // App went to background - pause tracking
        console.log('[useLocation] App backgrounded - pausing tracking');
        stopTracking();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [pauseInBackground, autoStart, startTracking, stopTracking]);

  // ─────────────────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────────────────

  return {
    location: currentLocation,
    locationData,
    accuracy,
    error,
    isTracking,
    hasPermission,
    distanceToSelectedCoin,
    bearingToSelectedCoin,
    refresh,
    startTracking,
    stopTracking,
    requestPermission,
  };
}

export default useLocation;

