// Location Service for Black Bart's Gold
// Provides GPS tracking, distance calculations, and bearing
//
// Reference: docs/BUILD-GUIDE.md - Sprint 3.1: Location Service
// Reference: project-vision.md - Location System section

import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation, {
  GeoPosition,
  GeoError,
  GeoOptions,
} from 'react-native-geolocation-service';
import type { Coordinates, LocationData, LocationError } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Earth's radius in meters (for Haversine formula)
 */
const EARTH_RADIUS_METERS = 6371000;

/**
 * Default GPS options for high accuracy
 */
const DEFAULT_GPS_OPTIONS: GeoOptions = {
  enableHighAccuracy: true,
  timeout: 15000, // 15 seconds
  maximumAge: 5000, // Accept cached position up to 5 seconds old
  distanceFilter: 0, // Get all updates
};

/**
 * GPS options for continuous tracking
 *
 * Note: Android-specific options (interval, fastestInterval, showLocationDialog,
 * forceRequestLocation) are passed at runtime but not in the TypeScript type
 */
const TRACKING_GPS_OPTIONS: GeoOptions & Record<string, unknown> = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 3000,
  distanceFilter: 5, // Update every 5 meters of movement
  // Android-specific options (type-safe via Record<string, unknown>)
  interval: 3000, // Android: minimum update interval (ms)
  fastestInterval: 1000, // Android: fastest update interval (ms)
  showLocationDialog: true, // Android: prompt user to enable location
  forceRequestLocation: true, // Android: force location request
};

// ═══════════════════════════════════════════════════════════════════════════
// PERMISSION HANDLING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Request location permission from the user
 *
 * @returns Promise<boolean> - true if permission granted
 *
 * @example
 * ```typescript
 * const granted = await requestLocationPermission();
 * if (granted) {
 *   startTracking();
 * } else {
 *   showPermissionDeniedMessage();
 * }
 * ```
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      // iOS: Request "when in use" permission
      const status = await Geolocation.requestAuthorization('whenInUse');
      console.log('[Location] iOS permission status:', status);
      return status === 'granted';
    }

    if (Platform.OS === 'android') {
      // Android: Request fine location permission
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Black Bart's Gold Location Permission",
          message:
            'This app needs access to your location to find treasure coins hidden in the real world.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      console.log('[Location] Android permission status:', granted);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }

      // For Android 10+, also request background location if needed
      if (Platform.Version >= 29) {
        const bgGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Background Location Permission',
            message:
              'Allow background location access for treasure hunting even when the app is minimized.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        console.log('[Location] Android background permission:', bgGranted);
      }

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return false;
  } catch (error) {
    console.error('[Location] Permission request error:', error);
    return false;
  }
}

/**
 * Check if location permission is already granted
 */
export async function checkLocationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted;
    }
    // iOS: We can't check without requesting, so assume we need to request
    return false;
  } catch (error) {
    console.error('[Location] Permission check error:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POSITION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get current position once (single reading)
 *
 * @param options - Optional GPS configuration
 * @returns Promise<LocationData> - Current location with accuracy
 *
 * @example
 * ```typescript
 * try {
 *   const location = await getCurrentPosition();
 *   console.log(`You are at ${location.latitude}, ${location.longitude}`);
 *   console.log(`Accuracy: ${location.accuracy}m`);
 * } catch (error) {
 *   handleLocationError(error);
 * }
 * ```
 */
export function getCurrentPosition(
  options: Partial<GeoOptions> = {}
): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    const geoOptions: GeoOptions = {
      ...DEFAULT_GPS_OPTIONS,
      ...options,
    };

    console.log('[Location] Getting current position...');

    Geolocation.getCurrentPosition(
      (position: GeoPosition) => {
        const locationData = geoPositionToLocationData(position);
        console.log('[Location] Got position:', locationData);
        resolve(locationData);
      },
      (error: GeoError) => {
        const locationError = geoErrorToLocationError(error);
        console.error('[Location] Position error:', error.message);
        reject(locationError);
      },
      geoOptions
    );
  });
}

/**
 * Start continuous position tracking
 *
 * @param onUpdate - Callback when position updates
 * @param onError - Callback when an error occurs
 * @param options - Optional GPS configuration
 * @returns Watch ID (use to stop tracking)
 *
 * @example
 * ```typescript
 * const watchId = watchPosition(
 *   (location) => {
 *     updatePlayerPosition(location);
 *     checkNearbyCoins(location);
 *   },
 *   (error) => {
 *     showLocationError(error);
 *   }
 * );
 *
 * // Later, to stop:
 * stopWatching(watchId);
 * ```
 */
export function watchPosition(
  onUpdate: (location: LocationData) => void,
  onError: (error: LocationError) => void,
  options: Partial<GeoOptions> = {}
): number {
  const geoOptions: GeoOptions = {
    ...TRACKING_GPS_OPTIONS,
    ...options,
  };

  console.log('[Location] Starting position watch...');

  const watchId = Geolocation.watchPosition(
    (position: GeoPosition) => {
      const locationData = geoPositionToLocationData(position);
      console.log(
        `[Location] Position update: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)} (±${locationData.accuracy.toFixed(1)}m)`
      );
      onUpdate(locationData);
    },
    (error: GeoError) => {
      const locationError = geoErrorToLocationError(error);
      console.error('[Location] Watch error:', error.message);
      onError(locationError);
    },
    geoOptions
  );

  console.log('[Location] Watch started with ID:', watchId);
  return watchId;
}

/**
 * Stop watching position
 *
 * @param watchId - The ID returned from watchPosition
 */
export function stopWatching(watchId: number): void {
  console.log('[Location] Stopping watch ID:', watchId);
  Geolocation.clearWatch(watchId);
}

/**
 * Stop all position watchers
 */
export function stopAllWatching(): void {
  console.log('[Location] Stopping all watchers');
  Geolocation.stopObserving();
}

// ═══════════════════════════════════════════════════════════════════════════
// DISTANCE & BEARING CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate distance between two points using Haversine formula
 *
 * @param point1 - First coordinate
 * @param point2 - Second coordinate
 * @returns Distance in meters
 *
 * @example
 * ```typescript
 * const playerPos = { latitude: 37.7749, longitude: -122.4194 };
 * const coinPos = { latitude: 37.7750, longitude: -122.4195 };
 * const distance = calculateDistance(playerPos, coinPos);
 * console.log(`Coin is ${distance.toFixed(1)}m away`);
 * ```
 */
export function calculateDistance(
  point1: Coordinates | null | undefined,
  point2: Coordinates | null | undefined
): number {
  // Safety check for null/undefined coordinates
  if (!point1?.latitude || !point1?.longitude || !point2?.latitude || !point2?.longitude) {
    return 0;
  }
  
  const lat1Rad = toRadians(point1.latitude);
  const lat2Rad = toRadians(point2.latitude);
  const dLatRad = toRadians(point2.latitude - point1.latitude);
  const dLngRad = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLngRad / 2) *
      Math.sin(dLngRad / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculate compass bearing from one point to another
 *
 * @param from - Starting coordinate
 * @param to - Target coordinate
 * @returns Bearing in degrees (0-360, where 0 = North)
 *
 * @example
 * ```typescript
 * const playerPos = { latitude: 37.7749, longitude: -122.4194 };
 * const coinPos = { latitude: 37.7760, longitude: -122.4180 };
 * const bearing = calculateBearing(playerPos, coinPos);
 * console.log(`Coin is at ${bearing.toFixed(0)}° from North`);
 * // Output: "Coin is at 45° from North" (northeast)
 * ```
 */
export function calculateBearing(
  from: Coordinates | null | undefined,
  to: Coordinates | null | undefined
): number {
  // Safety check for null/undefined coordinates
  if (!from?.latitude || !from?.longitude || !to?.latitude || !to?.longitude) {
    return 0;
  }
  
  const fromLatRad = toRadians(from.latitude);
  const toLatRad = toRadians(to.latitude);
  const dLngRad = toRadians(to.longitude - from.longitude);

  const y = Math.sin(dLngRad) * Math.cos(toLatRad);
  const x =
    Math.cos(fromLatRad) * Math.sin(toLatRad) -
    Math.sin(fromLatRad) * Math.cos(toLatRad) * Math.cos(dLngRad);

  let bearing = toDegrees(Math.atan2(y, x));

  // Normalize to 0-360
  bearing = (bearing + 360) % 360;

  return bearing;
}

/**
 * Get cardinal direction from bearing
 *
 * @param bearing - Bearing in degrees (0-360)
 * @returns Cardinal direction string (N, NE, E, SE, S, SW, W, NW)
 */
export function bearingToCardinal(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const normalized = ((bearing % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return directions[index];
}

/**
 * Check if a point is within a certain radius of another point
 *
 * @param center - Center point
 * @param point - Point to check
 * @param radiusMeters - Radius in meters
 * @returns true if point is within radius
 */
export function isWithinRadius(
  center: Coordinates,
  point: Coordinates,
  radiusMeters: number
): boolean {
  return calculateDistance(center, point) <= radiusMeters;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert GeoPosition to our LocationData format
 */
function geoPositionToLocationData(position: GeoPosition): LocationData {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    altitude: position.coords.altitude ?? undefined,
    speed: position.coords.speed ?? undefined,
    heading: position.coords.heading ?? undefined,
    timestamp: position.timestamp,
  };
}

/**
 * Convert GeoError to our LocationError format
 */
function geoErrorToLocationError(error: GeoError): LocationError {
  switch (error.code) {
    case 1: // PERMISSION_DENIED
      return 'PERMISSION_DENIED';
    case 2: // POSITION_UNAVAILABLE
      return 'POSITION_UNAVAILABLE';
    case 3: // TIMEOUT
      return 'TIMEOUT';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const locationService = {
  requestLocationPermission,
  checkLocationPermission,
  getCurrentPosition,
  watchPosition,
  stopWatching,
  stopAllWatching,
  calculateDistance,
  calculateBearing,
  bearingToCardinal,
  isWithinRadius,
};

export default locationService;

