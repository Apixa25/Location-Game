/**
 * Coin Service
 *
 * Handles coin-related business logic including:
 * - Geospatial queries for finding nearby coins
 * - Grid-based coin distribution
 * - Dynamic coin seeding
 * - Collection logic
 */

import { prisma } from '../utils/prisma';
import { config } from '../config';
import { Coin, CoinStatus, CoinType } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Grid size in degrees (approximately 3 miles at mid-latitudes) */
const GRID_SIZE_DEGREES = 0.05; // ~5.5 km

/** Earth's radius in meters */
const EARTH_RADIUS_METERS = 6371000;

// ═══════════════════════════════════════════════════════════════════════════
// GEOSPATIAL UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate distance between two coordinates in meters using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculate bearing from point A to point B in degrees
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Convert meters to approximate degrees at a given latitude
 */
export function metersToDegreesLat(meters: number): number {
  return meters / 111000;
}

export function metersToDegreesLon(meters: number, latitude: number): number {
  return meters / (111000 * Math.cos((latitude * Math.PI) / 180));
}

/**
 * Generate a random point within a bounding box
 */
export function randomPointInBox(
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number
): { latitude: number; longitude: number } {
  return {
    latitude: minLat + Math.random() * (maxLat - minLat),
    longitude: minLon + Math.random() * (maxLon - minLon),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// GRID SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate grid ID for a location
 */
export function getGridId(latitude: number, longitude: number): string {
  const gridLat = Math.floor(latitude / GRID_SIZE_DEGREES) * GRID_SIZE_DEGREES;
  const gridLon = Math.floor(longitude / GRID_SIZE_DEGREES) * GRID_SIZE_DEGREES;
  return `${gridLat.toFixed(4)}_${gridLon.toFixed(4)}`;
}

/**
 * Get grid center coordinates from grid ID
 */
export function getGridCenter(gridId: string): {
  latitude: number;
  longitude: number;
} {
  const [latStr, lonStr] = gridId.split('_');
  const baseLat = parseFloat(latStr);
  const baseLon = parseFloat(lonStr);

  return {
    latitude: baseLat + GRID_SIZE_DEGREES / 2,
    longitude: baseLon + GRID_SIZE_DEGREES / 2,
  };
}

/**
 * Get grid bounding box
 */
export function getGridBounds(gridId: string): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} {
  const [latStr, lonStr] = gridId.split('_');
  const baseLat = parseFloat(latStr);
  const baseLon = parseFloat(lonStr);

  return {
    minLat: baseLat,
    maxLat: baseLat + GRID_SIZE_DEGREES,
    minLon: baseLon,
    maxLon: baseLon + GRID_SIZE_DEGREES,
  };
}

/**
 * Get or create a grid record
 */
export async function getOrCreateGrid(
  latitude: number,
  longitude: number
): Promise<{ id: string; latitude: number; longitude: number }> {
  const center = getGridCenter(getGridId(latitude, longitude));

  const grid = await prisma.grid.upsert({
    where: {
      latitude_longitude: {
        latitude: center.latitude,
        longitude: center.longitude,
      },
    },
    update: {
      lastActivity: new Date(),
    },
    create: {
      latitude: center.latitude,
      longitude: center.longitude,
      lastActivity: new Date(),
    },
  });

  return grid;
}

// ═══════════════════════════════════════════════════════════════════════════
// COIN QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get coins near a location
 */
export async function getCoinsNearLocation(
  latitude: number,
  longitude: number,
  radiusMeters: number = 500
): Promise<Coin[]> {
  // Convert radius to approximate degrees for bounding box
  const latDelta = metersToDegreesLat(radiusMeters);
  const lonDelta = metersToDegreesLon(radiusMeters, latitude);

  // Query with bounding box
  const coins = await prisma.coin.findMany({
    where: {
      status: 'visible',
      latitude: {
        gte: latitude - latDelta,
        lte: latitude + latDelta,
      },
      longitude: {
        gte: longitude - lonDelta,
        lte: longitude + lonDelta,
      },
    },
  });

  // Filter by actual distance
  return coins.filter((coin) => {
    const distance = calculateDistance(
      latitude,
      longitude,
      coin.latitude,
      coin.longitude
    );
    return distance <= radiusMeters;
  });
}

/**
 * Get coin count in a grid
 */
export async function getCoinCountInGrid(gridId: string): Promise<number> {
  const bounds = getGridBounds(gridId);

  return prisma.coin.count({
    where: {
      status: 'visible',
      latitude: {
        gte: bounds.minLat,
        lte: bounds.maxLat,
      },
      longitude: {
        gte: bounds.minLon,
        lte: bounds.maxLon,
      },
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// DYNAMIC COIN DISTRIBUTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Ensure a grid has minimum coins
 * Seeds system coins if below threshold
 */
export async function ensureGridHasCoins(
  latitude: number,
  longitude: number
): Promise<number> {
  const gridId = getGridId(latitude, longitude);
  const currentCount = await getCoinCountInGrid(gridId);

  if (currentCount >= config.game.minCoinsPerGrid) {
    return 0;
  }

  const neededCoins = config.game.minCoinsPerGrid - currentCount;
  let seeded = 0;

  for (let i = 0; i < neededCoins; i++) {
    await placeSystemCoin(gridId);
    seeded++;
  }

  console.log(`[CoinService] Seeded ${seeded} coins in grid ${gridId}`);
  return seeded;
}

/**
 * Place a system-generated coin in a grid
 */
export async function placeSystemCoin(gridId: string): Promise<Coin> {
  const bounds = getGridBounds(gridId);
  const position = randomPointInBox(
    bounds.minLat,
    bounds.maxLat,
    bounds.minLon,
    bounds.maxLon
  );

  // Random value between $0.10 and $5.00
  const contribution = Math.round((0.1 + Math.random() * 4.9) * 100) / 100;

  const coin = await prisma.coin.create({
    data: {
      coinType: 'pool', // System coins are always pool type
      value: null, // Determined at collection
      contribution,
      latitude: position.latitude,
      longitude: position.longitude,
      hiderId: 'system', // Special system user ID
      status: 'visible',
      huntType: 'direct_navigation',
    },
  });

  return coin;
}

/**
 * Recycle stale coins from inactive grids
 * Should be run as a scheduled job
 */
export async function recycleStaleCoins(): Promise<number> {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 24); // 24 hours of inactivity

  // Find inactive grids
  const inactiveGrids = await prisma.grid.findMany({
    where: {
      lastActivity: {
        lt: cutoff,
      },
    },
  });

  let recycledCount = 0;

  for (const grid of inactiveGrids) {
    const gridId = getGridId(grid.latitude, grid.longitude);
    const bounds = getGridBounds(gridId);

    // Delete system-placed coins in inactive grids
    const deleted = await prisma.coin.deleteMany({
      where: {
        hiderId: 'system',
        status: 'visible',
        latitude: {
          gte: bounds.minLat,
          lte: bounds.maxLat,
        },
        longitude: {
          gte: bounds.minLon,
          lte: bounds.maxLon,
        },
      },
    });

    recycledCount += deleted.count;
  }

  console.log(`[CoinService] Recycled ${recycledCount} stale coins`);
  return recycledCount;
}

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTION LOGIC
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if a user can collect a coin
 */
export async function canCollectCoin(
  userId: string,
  coinId: string,
  userLat: number,
  userLon: number
): Promise<{
  canCollect: boolean;
  reason?: string;
  coin?: Coin;
  distance?: number;
}> {
  // Get coin
  const coin = await prisma.coin.findUnique({
    where: { id: coinId },
  });

  if (!coin) {
    return { canCollect: false, reason: 'Coin not found' };
  }

  if (coin.status !== 'visible') {
    return { canCollect: false, reason: 'Coin already collected' };
  }

  // Check distance
  const distance = calculateDistance(
    userLat,
    userLon,
    coin.latitude,
    coin.longitude
  );

  if (distance > config.game.collectionRangeMeters) {
    return {
      canCollect: false,
      reason: `Too far (${Math.round(distance)}m away)`,
      distance,
    };
  }

  // Check find limit
  const userStats = await prisma.userStats.findUnique({
    where: { userId },
  });

  const findLimit = userStats?.findLimit || config.game.defaultFindLimit;

  if (coin.coinType === 'fixed' && coin.value !== null && coin.value > findLimit) {
    return {
      canCollect: false,
      reason: 'Coin exceeds find limit',
      coin,
      distance,
    };
  }

  // Check gas
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet || wallet.gasTank <= 0) {
    return {
      canCollect: false,
      reason: 'No gas remaining',
      coin,
      distance,
    };
  }

  return {
    canCollect: true,
    coin,
    distance,
  };
}

/**
 * Calculate value for a pool coin based on player history
 * Implements "slot machine" logic
 */
export async function calculatePoolCoinValue(
  userId: string,
  contribution: number
): Promise<number> {
  // Get user's recent find history
  const recentFinds = await prisma.coinFind.findMany({
    where: { finderId: userId },
    orderBy: { foundAt: 'desc' },
    take: 10,
  });

  const userStats = await prisma.userStats.findUnique({
    where: { userId },
  });

  let baseValue = contribution * 0.5; // Start at 50% of contribution

  // Cold streak bonus (3+ low value finds)
  const lowValueFinds = recentFinds.filter((f) => f.valueReceived < 1).length;
  if (lowValueFinds >= 3) {
    baseValue += contribution * 0.3; // 30% bonus
  }

  // New player variance
  const isNewPlayer = (userStats?.totalFoundCount || 0) < 10;
  if (isNewPlayer) {
    baseValue += Math.random() * contribution; // Up to 100% extra variance
  }

  // Add randomness
  const variance = contribution * (Math.random() * 0.5 - 0.25); // ±25%
  let finalValue = baseValue + variance;

  // Clamp to reasonable range
  finalValue = Math.max(0.05, finalValue); // Min $0.05
  finalValue = Math.min(contribution * 3, finalValue); // Max 3x contribution

  return Math.round(finalValue * 100) / 100;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const coinService = {
  calculateDistance,
  calculateBearing,
  getGridId,
  getGridCenter,
  getGridBounds,
  getOrCreateGrid,
  getCoinsNearLocation,
  getCoinCountInGrid,
  ensureGridHasCoins,
  placeSystemCoin,
  recycleStaleCoins,
  canCollectCoin,
  calculatePoolCoinValue,
};

export default coinService;

