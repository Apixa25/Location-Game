// Location Types for Black Bart's Gold

/**
 * GPS coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Extended location with accuracy
 */
export interface LocationData extends Coordinates {
  /** Accuracy in meters */
  accuracy: number;
  /** Altitude in meters (if available) */
  altitude?: number;
  /** Speed in m/s (if available) */
  speed?: number;
  /** Heading in degrees (if available) */
  heading?: number;
  /** Timestamp of the reading */
  timestamp: number;
}

/**
 * Grid for dynamic coin distribution (~3 mile squares)
 */
export interface Grid {
  id: string;
  /** Center coordinates of the grid */
  coordinates: Coordinates;
  /** Number of coins currently in this grid */
  coin_count: number;
  /** Number of active users in this grid */
  active_users: number;
  /** Last activity timestamp */
  last_activity: string;
}

/**
 * Tracking state for AR
 */
export type ARTrackingState = 'UNAVAILABLE' | 'LIMITED' | 'NORMAL';

/**
 * Location permission status
 */
export type LocationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'blocked'
  | 'unavailable'
  | 'limited';

/**
 * Location error types
 */
export type LocationError =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNKNOWN';
