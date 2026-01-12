// Coordinates Utility for Black Bart's Gold
// Converts between GPS coordinates and AR scene positions
//
// Reference: docs/BUILD-GUIDE.md - Sprint 3.4: Connect Location to AR
// Reference: project-vision.md - Location System section

import type { Coordinates } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Meters per degree of latitude (approximately constant)
 * More accurate at different latitudes, but this is a good average
 */
const METERS_PER_DEGREE_LAT = 111320;

/**
 * AR scene scale factor
 * 1.0 means 1 meter in real world = 1 unit in AR
 * Increase to make coins appear closer, decrease to spread them out
 */
const AR_SCALE_FACTOR = 1.0;

/**
 * Maximum visible distance in AR (meters)
 * Coins beyond this won't be positioned in AR
 */
const MAX_AR_DISTANCE = 100;

/**
 * Default coin height above ground (meters)
 */
const DEFAULT_COIN_HEIGHT = 0.0;

/**
 * Coin height offset for visibility (slightly above eye level reference)
 */
const COIN_HEIGHT_OFFSET = 0.3;

// ═══════════════════════════════════════════════════════════════════════════
// GPS TO AR CONVERSION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert GPS coordinates to AR scene position
 *
 * AR Coordinate System (relative to device/player):
 * - X axis: Left (-) / Right (+) — East/West
 * - Y axis: Down (-) / Up (+) — Altitude
 * - Z axis: Behind (+) / In Front (-) — North/South
 *
 * @param playerGPS - Player's current GPS position
 * @param coinGPS - Coin's GPS position
 * @param coinAltitude - Optional altitude offset for the coin (default 0)
 * @returns AR position as [x, y, z] tuple
 *
 * @example
 * ```typescript
 * const playerPos = { latitude: 37.7749, longitude: -122.4194 };
 * const coinPos = { latitude: 37.7750, longitude: -122.4190 };
 *
 * const arPosition = gpsToARPosition(playerPos, coinPos);
 * // Returns something like [35.8, 0.3, -11.1]
 * // Meaning: 35.8m east, 11.1m north
 *
 * <CoinObject position={arPosition} />
 * ```
 */
export function gpsToARPosition(
  playerGPS: Coordinates,
  coinGPS: Coordinates,
  coinAltitude: number = DEFAULT_COIN_HEIGHT
): [number, number, number] {
  // Calculate meters per degree of longitude at this latitude
  const metersPerDegreeLng =
    METERS_PER_DEGREE_LAT * Math.cos((playerGPS.latitude * Math.PI) / 180);

  // Calculate offset in meters
  const dLat = coinGPS.latitude - playerGPS.latitude;
  const dLng = coinGPS.longitude - playerGPS.longitude;

  // Convert to meters
  const offsetNorth = dLat * METERS_PER_DEGREE_LAT; // North/South
  const offsetEast = dLng * metersPerDegreeLng; // East/West

  // Apply scale factor
  const scaledEast = offsetEast * AR_SCALE_FACTOR;
  const scaledNorth = offsetNorth * AR_SCALE_FACTOR;

  // AR coordinates:
  // X = East/West offset (positive = East = right)
  // Y = Altitude (with offset for visibility)
  // Z = North/South offset (negative = North = in front of player)
  const x = scaledEast;
  const y = coinAltitude + COIN_HEIGHT_OFFSET;
  const z = -scaledNorth; // Negative because Z- is forward in AR

  return [x, y, z];
}

/**
 * Convert AR scene position back to GPS coordinates
 *
 * @param playerGPS - Player's current GPS position
 * @param arPosition - AR position as [x, y, z]
 * @returns GPS coordinates
 *
 * @example
 * ```typescript
 * const playerPos = { latitude: 37.7749, longitude: -122.4194 };
 * const arPos: [number, number, number] = [35.8, 0.3, -11.1];
 *
 * const gpsPos = arPositionToGPS(playerPos, arPos);
 * // Returns { latitude: 37.7750, longitude: -122.4190 }
 * ```
 */
export function arPositionToGPS(
  playerGPS: Coordinates,
  arPosition: [number, number, number]
): Coordinates {
  const [x, _y, z] = arPosition;

  // Calculate meters per degree of longitude at this latitude
  const metersPerDegreeLng =
    METERS_PER_DEGREE_LAT * Math.cos((playerGPS.latitude * Math.PI) / 180);

  // Reverse the AR scale
  const offsetEast = x / AR_SCALE_FACTOR;
  const offsetNorth = -z / AR_SCALE_FACTOR; // Negative because Z- is north

  // Convert back to degrees
  const dLng = offsetEast / metersPerDegreeLng;
  const dLat = offsetNorth / METERS_PER_DEGREE_LAT;

  return {
    latitude: playerGPS.latitude + dLat,
    longitude: playerGPS.longitude + dLng,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DISTANCE & POSITION UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate the distance from origin to an AR position
 *
 * @param arPosition - AR position as [x, y, z]
 * @returns Distance in meters (ignoring Y/altitude)
 */
export function getARDistance(arPosition: [number, number, number]): number {
  const [x, _y, z] = arPosition;
  return Math.sqrt(x * x + z * z);
}

/**
 * Check if a coin is within visible AR range
 *
 * @param playerGPS - Player's current GPS position
 * @param coinGPS - Coin's GPS position
 * @param maxDistance - Maximum visible distance (default: MAX_AR_DISTANCE)
 * @returns true if coin should be visible in AR
 */
export function isWithinARRange(
  playerGPS: Coordinates,
  coinGPS: Coordinates,
  maxDistance: number = MAX_AR_DISTANCE
): boolean {
  const arPosition = gpsToARPosition(playerGPS, coinGPS);
  const distance = getARDistance(arPosition);
  return distance <= maxDistance;
}

/**
 * Clamp AR position to maximum visible range
 *
 * If a coin is too far away, this positions it at the maximum
 * visible distance in the correct direction.
 *
 * @param arPosition - Original AR position
 * @param maxDistance - Maximum visible distance
 * @returns Clamped AR position
 */
export function clampARPosition(
  arPosition: [number, number, number],
  maxDistance: number = MAX_AR_DISTANCE
): [number, number, number] {
  const [x, y, z] = arPosition;
  const distance = Math.sqrt(x * x + z * z);

  if (distance <= maxDistance) {
    return arPosition;
  }

  // Scale down to max distance while preserving direction
  const scale = maxDistance / distance;
  return [x * scale, y, z * scale];
}

/**
 * Calculate the bearing from AR position
 *
 * @param arPosition - AR position as [x, y, z]
 * @returns Bearing in degrees (0 = North/forward, 90 = East/right)
 */
export function getARBearing(arPosition: [number, number, number]): number {
  const [x, _y, z] = arPosition;

  // atan2 gives angle from positive X axis
  // We want angle from negative Z axis (forward)
  let bearing = Math.atan2(x, -z) * (180 / Math.PI);

  // Normalize to 0-360
  bearing = (bearing + 360) % 360;

  return bearing;
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH CONVERSION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert multiple coin GPS positions to AR positions
 *
 * @param playerGPS - Player's current GPS position
 * @param coins - Array of objects with location property
 * @returns Array of objects with added ar_position
 *
 * @example
 * ```typescript
 * const coins = [
 *   { id: 'a', location: { latitude: 37.775, longitude: -122.419 } },
 *   { id: 'b', location: { latitude: 37.776, longitude: -122.420 } },
 * ];
 *
 * const withARPositions = convertCoinsToAR(playerPos, coins);
 * // Each coin now has ar_position: [x, y, z]
 * ```
 */
export function convertCoinsToAR<T extends { location: Coordinates }>(
  playerGPS: Coordinates,
  coins: T[]
): Array<T & { ar_position: [number, number, number]; ar_distance: number }> {
  return coins.map((coin) => {
    const ar_position = gpsToARPosition(playerGPS, coin.location);
    const ar_distance = getARDistance(ar_position);

    return {
      ...coin,
      ar_position,
      ar_distance,
    };
  });
}

/**
 * Filter coins to only those within AR visible range
 *
 * @param playerGPS - Player's current GPS position
 * @param coins - Array of objects with location property
 * @param maxDistance - Maximum visible distance
 * @returns Filtered array of coins within range
 */
export function filterCoinsInARRange<T extends { location: Coordinates }>(
  playerGPS: Coordinates,
  coins: T[],
  maxDistance: number = MAX_AR_DISTANCE
): T[] {
  return coins.filter((coin) => isWithinARRange(playerGPS, coin.location, maxDistance));
}

/**
 * Sort coins by distance from player (nearest first)
 *
 * @param playerGPS - Player's current GPS position
 * @param coins - Array of coins with ar_position
 * @returns Sorted array (nearest first)
 */
export function sortCoinsByDistance<
  T extends { ar_position: [number, number, number] }
>(coins: T[]): T[] {
  return [...coins].sort((a, b) => {
    const distA = getARDistance(a.ar_position);
    const distB = getARDistance(b.ar_position);
    return distA - distB;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const coordinatesUtil = {
  gpsToARPosition,
  arPositionToGPS,
  getARDistance,
  isWithinARRange,
  clampARPosition,
  getARBearing,
  convertCoinsToAR,
  filterCoinsInARRange,
  sortCoinsByDistance,
};

export default coordinatesUtil;

