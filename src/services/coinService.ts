// Coin Service for Black Bart's Gold
// Handles coin collection, validation, and pool calculations
//
// Reference: docs/BUILD-GUIDE.md - Sprint 4.1: Coin Collection Logic
// Reference: docs/coins-and-collection.md
// Reference: docs/economy-and-currency.md
// Reference: docs/dynamic-coin-distribution.md

import type { Coin, CoinType, CollectionResult, ARCoin } from '../types';
import type { Coordinates } from '../types';
import { calculateDistance } from './location';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Reasons why a coin cannot be collected
 */
export type CollectionBlockReason =
  | 'TOO_FAR' // Player needs to get closer
  | 'OVER_LIMIT' // Coin value exceeds player's find limit
  | 'ALREADY_COLLECTED' // Coin already taken by another player
  | 'NO_GAS' // Player has no gas remaining
  | 'NOT_VISIBLE' // Coin not in AR view
  | 'PENDING' // Collection in progress
  | 'NETWORK_ERROR'; // Connection issue

/**
 * Result of checking if a coin can be collected
 */
export interface CanCollectResult {
  canCollect: boolean;
  reason?: CollectionBlockReason;
  message?: string;
  hint?: string;
}

/**
 * Coin collection request
 */
export interface CollectCoinRequest {
  coinId: string;
  playerId: string;
  playerPosition: Coordinates;
  timestamp: number;
}

/**
 * Player find history for slot machine calculations
 */
export interface PlayerFindHistory {
  recentFinds: number[]; // Last 10 coin values
  lifetimeTotal: number; // Total BBG found ever
  lifetimeCount: number; // Total coins found
  isNewPlayer: boolean; // First week?
  lastFindTimestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Collection range in meters
 * Reference: docs/coins-and-collection.md - "10-30 feet, device-dependent"
 */
const COLLECTION_RANGE_METERS = 10; // ~33 feet

/**
 * Default find limit for new players
 */
const DEFAULT_FIND_LIMIT = 1.0; // $1.00

/**
 * Hint offset - how much more to hide to unlock
 * Reference: docs/economy-and-currency.md - "hint = current coin value + $5"
 */
const HINT_OFFSET = 5.0; // $5.00

/**
 * Pool coin payout ranges based on player history
 * Reference: docs/dynamic-coin-distribution.md
 */
const POOL_PAYOUT_RANGES = {
  hotStreak: { min: 0.25, max: 1.0 }, // Last 3 were high value
  coldStreak: { min: 2.0, max: 8.0 }, // Last 5 were low value
  newPlayer: { min: 0.5, max: 5.0 }, // First week, exciting variance
  normal: { min: 0.1, max: 3.0 }, // Standard play
};

/**
 * Thresholds for determining hot/cold streaks
 */
const STREAK_THRESHOLDS = {
  hotValueMin: 5.0, // $5+ is considered "high value"
  coldValueMax: 1.0, // $1 or less is "low value"
  hotStreakCount: 3, // 3 high value finds = hot streak
  coldStreakCount: 5, // 5 low value finds = cold streak
};

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTION VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if a coin can be collected by a player
 *
 * Validates all collection requirements:
 * 1. Within GPS range (~10 meters)
 * 2. Coin value within find limit
 * 3. Coin still available (not collected)
 * 4. Player has gas
 *
 * @param coin - The coin to collect
 * @param playerPosition - Player's current GPS position
 * @param playerFindLimit - Player's current find limit
 * @param playerHasGas - Whether player has gas remaining
 * @returns Collection eligibility result
 *
 * @example
 * ```typescript
 * const result = canCollectCoin(coin, playerPos, 5.0, true);
 * if (result.canCollect) {
 *   await collectCoin(coin.id, playerId);
 * } else {
 *   showMessage(result.message);
 *   if (result.hint) showHint(result.hint);
 * }
 * ```
 */
export function canCollectCoin(
  coin: Coin | ARCoin,
  playerPosition: Coordinates,
  playerFindLimit: number = DEFAULT_FIND_LIMIT,
  playerHasGas: boolean = true
): CanCollectResult {
  // Check 1: Player has gas
  if (!playerHasGas) {
    return {
      canCollect: false,
      reason: 'NO_GAS',
      message: "Ye've run out of gas, matey!",
      hint: 'Purchase or use found coins as gas to continue hunting.',
    };
  }

  // Check 2: Coin is still available
  if (coin.status === 'collected' || coin.status === 'confirmed') {
    return {
      canCollect: false,
      reason: 'ALREADY_COLLECTED',
      message: 'This treasure has already been claimed!',
    };
  }

  // Check 3: Within collection range
  const distance = calculateDistance(playerPosition, coin.location);
  if (distance > COLLECTION_RANGE_METERS) {
    return {
      canCollect: false,
      reason: 'TOO_FAR',
      message: `Get closer to collect! (${Math.round(distance)}m away)`,
      hint: `Move within ${COLLECTION_RANGE_METERS}m of the coin.`,
    };
  }

  // Check 4: Find limit (only for fixed value coins with known value)
  // Pool coins don't have a value until collected, so they bypass this check
  if (coin.coin_type === 'fixed' && coin.value !== null) {
    if (coin.value > playerFindLimit) {
      const hintAmount = coin.value + HINT_OFFSET;
      return {
        canCollect: false,
        reason: 'OVER_LIMIT',
        message: getOverLimitMessage(coin.value, playerFindLimit),
        hint: getOverLimitHint(hintAmount),
      };
    }
  }

  // All checks passed!
  return {
    canCollect: true,
  };
}

/**
 * Get message for when a coin is above player's find limit
 *
 * @param coinValue - Value of the coin
 * @param playerFindLimit - Player's current find limit
 * @returns User-friendly message
 */
export function getOverLimitMessage(
  coinValue: number,
  playerFindLimit: number
): string {
  return `This $${coinValue.toFixed(2)} coin is above yer $${playerFindLimit.toFixed(2)} limit!`;
}

/**
 * Get hint for unlocking higher find limits
 *
 * @param requiredAmount - Amount to hide to unlock
 * @returns Hint message
 */
export function getOverLimitHint(requiredAmount: number): string {
  return `Hide $${requiredAmount.toFixed(2)} to unlock bigger treasure, ye scallywag!`;
}

/**
 * Check if a coin is locked (above find limit)
 *
 * @param coin - The coin to check
 * @param playerFindLimit - Player's find limit
 * @returns true if coin is locked
 */
export function isCoinLocked(
  coin: Coin | ARCoin,
  playerFindLimit: number
): boolean {
  // Pool coins are never locked (value unknown until collection)
  if (coin.coin_type === 'pool' || coin.value === null) {
    return false;
  }
  return coin.value > playerFindLimit;
}

/**
 * Check if player is within collection range of a coin
 *
 * @param playerPosition - Player's GPS position
 * @param coinPosition - Coin's GPS position
 * @returns true if within range
 */
export function isInCollectionRange(
  playerPosition: Coordinates,
  coinPosition: Coordinates
): boolean {
  const distance = calculateDistance(playerPosition, coinPosition);
  return distance <= COLLECTION_RANGE_METERS;
}

/**
 * Get distance to a coin
 *
 * @param playerPosition - Player's GPS position
 * @param coinPosition - Coin's GPS position
 * @returns Distance in meters
 */
export function getDistanceToCoin(
  playerPosition: Coordinates,
  coinPosition: Coordinates
): number {
  return calculateDistance(playerPosition, coinPosition);
}

// ═══════════════════════════════════════════════════════════════════════════
// POOL COIN VALUE CALCULATION (SLOT MACHINE)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate pool coin value for a finder (slot machine algorithm)
 *
 * Reference: docs/dynamic-coin-distribution.md
 *
 * The value is personalized based on:
 * 1. Player's recent find history (last 10 coins)
 * 2. Whether they're on a hot or cold streak
 * 3. If they're a new player
 * 4. Randomness for excitement
 *
 * @param history - Player's find history
 * @returns Calculated coin value in BBG
 *
 * @example
 * ```typescript
 * const value = calculatePoolCoinValue({
 *   recentFinds: [0.25, 0.10, 0.50, 0.10, 0.25],
 *   lifetimeTotal: 12.50,
 *   lifetimeCount: 45,
 *   isNewPlayer: false,
 *   lastFindTimestamp: Date.now() - 3600000,
 * });
 * // Might return 3.50 because player is on a cold streak
 * ```
 */
export function calculatePoolCoinValue(history: PlayerFindHistory): number {
  // Determine which payout range to use
  let range = POOL_PAYOUT_RANGES.normal;

  if (history.isNewPlayer) {
    // New players get exciting variance to hook them
    range = POOL_PAYOUT_RANGES.newPlayer;
  } else if (isHotStreak(history.recentFinds)) {
    // Cool down hot streaks to protect company
    range = POOL_PAYOUT_RANGES.hotStreak;
  } else if (isColdStreak(history.recentFinds)) {
    // Reward cold streaks to keep engagement
    range = POOL_PAYOUT_RANGES.coldStreak;
  }

  // Calculate value within range with weighted randomness
  // Use a slight bias toward lower values (house edge)
  const random = Math.random();
  const weightedRandom = Math.pow(random, 1.2); // Slight bias to lower end
  const value = range.min + weightedRandom * (range.max - range.min);

  // Round to nearest cent
  return Math.round(value * 100) / 100;
}

/**
 * Check if player is on a hot streak
 * Hot streak = last 3 finds were all high value ($5+)
 */
function isHotStreak(recentFinds: number[]): boolean {
  if (recentFinds.length < STREAK_THRESHOLDS.hotStreakCount) {
    return false;
  }

  const lastThree = recentFinds.slice(0, STREAK_THRESHOLDS.hotStreakCount);
  return lastThree.every((value) => value >= STREAK_THRESHOLDS.hotValueMin);
}

/**
 * Check if player is on a cold streak
 * Cold streak = last 5 finds were all low value ($1 or less)
 */
function isColdStreak(recentFinds: number[]): boolean {
  if (recentFinds.length < STREAK_THRESHOLDS.coldStreakCount) {
    return false;
  }

  const lastFive = recentFinds.slice(0, STREAK_THRESHOLDS.coldStreakCount);
  return lastFive.every((value) => value <= STREAK_THRESHOLDS.coldValueMax);
}

// ═══════════════════════════════════════════════════════════════════════════
// COIN COLLECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Collect a coin (API stub for now)
 *
 * In production, this will:
 * 1. Send request to backend
 * 2. Backend validates and claims coin
 * 3. Returns result with final value
 *
 * @param coinId - ID of coin to collect
 * @param playerId - ID of collecting player
 * @returns Collection result
 */
export async function collectCoin(
  coinId: string,
  _playerId: string
): Promise<CollectionResult> {
  // TODO: Replace with real API call in Sprint 7

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulate successful collection
  const mockResult: CollectionResult = {
    success: true,
    coin_id: coinId,
    value_received: 1.0, // Would come from server
    tier: null,
    message: "Arrr! Fine treasure ye've found!",
  };

  console.log('[CoinService] Collected coin:', coinId, 'Value:', mockResult.value_received);

  return mockResult;
}

/**
 * Collect a pool coin (value calculated at collection time)
 *
 * @param coinId - ID of coin to collect
 * @param playerId - ID of collecting player
 * @param history - Player's find history for value calculation
 * @returns Collection result with calculated value
 */
export async function collectPoolCoin(
  coinId: string,
  _playerId: string,
  history: PlayerFindHistory
): Promise<CollectionResult> {
  // Calculate personalized value based on player history
  const calculatedValue = calculatePoolCoinValue(history);

  // TODO: Replace with real API call in Sprint 7
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockResult: CollectionResult = {
    success: true,
    coin_id: coinId,
    value_received: calculatedValue,
    tier: null,
    message: getCollectionMessage(calculatedValue),
  };

  console.log(
    '[CoinService] Collected pool coin:',
    coinId,
    'Calculated value:',
    mockResult.value_received
  );

  return mockResult;
}

/**
 * Get Black Bart congratulation message based on value
 *
 * @param value - Coin value collected
 * @returns Pirate-themed congratulation
 */
function getCollectionMessage(value: number): string {
  if (value >= 10) {
    return "Shiver me timbers! That's a hefty doubloon, matey!";
  } else if (value >= 5) {
    return 'Arrr! A fine treasure ye have found!';
  } else if (value >= 1) {
    return "Black Bart's gold finds a worthy hunter!";
  } else {
    return "Ye've got the eyes of a true treasure hunter!";
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COIN HIDING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Validate a location for hiding a coin
 *
 * @param location - Proposed hide location
 * @returns Validation result
 */
export async function validateHideLocation(_location: Coordinates): Promise<{
  valid: boolean;
  reason?: string;
}> {
  // TODO: In production, check against:
  // - Water bodies (ocean, lakes, rivers)
  // - Banned zones (dangerous areas)
  // - Server-side validation

  // For now, always valid
  return { valid: true };
}

/**
 * Hide a coin at a location (API stub)
 *
 * @param type - fixed or pool
 * @param value - Amount to hide/contribute
 * @param location - GPS location
 * @param hiderId - User hiding the coin
 * @returns Created coin
 */
export async function hideCoin(
  type: CoinType,
  value: number,
  location: Coordinates,
  hiderId: string
): Promise<Coin> {
  // Validate location first
  const validation = await validateHideLocation(location);
  if (!validation.valid) {
    throw new Error(validation.reason || 'Invalid hide location');
  }

  // TODO: Replace with real API call in Sprint 7

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const coin: Coin = {
    id: `coin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    coin_type: type,
    value: type === 'fixed' ? value : null, // Pool coins have null value
    contribution: value,
    location,
    hider_id: hiderId,
    hidden_at: new Date().toISOString(),
    status: 'visible',
    hunt_type: 'direct_navigation',
    multi_find: false,
    finds_remaining: null,
    current_tier: null,
    logo_front: 'black_bart',
    logo_back: 'black_bart',
  };

  console.log('[CoinService] Hid coin:', coin.id, 'Type:', type, 'Value/Contribution:', value);

  return coin;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const coinService = {
  canCollectCoin,
  getOverLimitMessage,
  getOverLimitHint,
  isCoinLocked,
  isInCollectionRange,
  getDistanceToCoin,
  calculatePoolCoinValue,
  collectCoin,
  collectPoolCoin,
  validateHideLocation,
  hideCoin,
};

export default coinService;

