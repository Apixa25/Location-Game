// Find Limit Service for Black Bart's Gold
// Manages find limit calculations, enforcement, and hints
//
// Reference: docs/BUILD-GUIDE.md - Sprint 4.4: Find Limit System
// Reference: docs/economy-and-currency.md - Finding Limits section

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Result of checking a coin against find limit
 */
export interface FindLimitCheckResult {
  isLocked: boolean;
  coinValue: number | null;
  playerLimit: number;
  message?: string;
  hint?: string;
  hintAmount?: number;
}

/**
 * Find limit tier with styling information
 */
export interface FindLimitTier {
  id: string;
  name: string;
  minLimit: number;
  maxLimit: number;
  color: string;
  icon: string;
  description: string;
}

/**
 * History entry for find limit changes
 */
export interface FindLimitHistoryEntry {
  previousLimit: number;
  newLimit: number;
  timestamp: number;
  reason: 'hide_fixed' | 'hide_pool' | 'initial';
  contributionAmount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Default find limit for new players
 * Reference: docs/economy-and-currency.md - "Nothing hidden = $1.00"
 */
export const DEFAULT_FIND_LIMIT = 1.0;

/**
 * Hint offset amount
 * Reference: docs/economy-and-currency.md - "hint = current coin value + $5"
 */
export const HINT_OFFSET = 5.0;

/**
 * Find limit tiers for visual styling
 */
export const FIND_LIMIT_TIERS: FindLimitTier[] = [
  {
    id: 'beginner',
    name: 'Cabin Boy',
    minLimit: 0,
    maxLimit: 1,
    color: '#A0AEC0', // Gray
    icon: '🪶',
    description: 'Just starting your treasure hunting journey',
  },
  {
    id: 'apprentice',
    name: 'Deck Hand',
    minLimit: 1.01,
    maxLimit: 5,
    color: '#CD7F32', // Bronze
    icon: '⚓',
    description: 'Earning your sea legs',
  },
  {
    id: 'hunter',
    name: 'Treasure Hunter',
    minLimit: 5.01,
    maxLimit: 25,
    color: '#C0C0C0', // Silver
    icon: '🗺️',
    description: 'A skilled seeker of treasure',
  },
  {
    id: 'captain',
    name: 'Captain',
    minLimit: 25.01,
    maxLimit: 100,
    color: '#FFD700', // Gold
    icon: '⚔️',
    description: "Commanding the seas for Black Bart's gold",
  },
  {
    id: 'legend',
    name: 'Pirate Legend',
    minLimit: 100.01,
    maxLimit: Infinity,
    color: '#8B5CF6', // Purple
    icon: '👑',
    description: 'A legend among treasure hunters',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// FIND LIMIT CALCULATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate new find limit based on contribution
 *
 * The rule: Your limit = your highest single CONTRIBUTION
 * - Based on what YOU contributed (not what finder receives)
 * - Based on single highest (not cumulative)
 * - Never decreases once unlocked
 *
 * @param currentLimit - Player's current find limit
 * @param contributionAmount - Amount being contributed
 * @returns New find limit (may be unchanged if contribution is lower)
 *
 * @example
 * ```typescript
 * // Current limit is $5, hiding $10
 * const newLimit = calculateNewFindLimit(5.0, 10.0);
 * // Returns 10.0 (limit increased)
 *
 * // Current limit is $10, hiding $3
 * const newLimit = calculateNewFindLimit(10.0, 3.0);
 * // Returns 10.0 (limit unchanged, never decreases)
 * ```
 */
export function calculateNewFindLimit(
  currentLimit: number,
  contributionAmount: number
): number {
  // Find limit only increases, never decreases
  return Math.max(currentLimit, contributionAmount);
}

/**
 * Check if a coin is locked based on find limit
 *
 * @param coinValue - Value of the coin (null for pool coins)
 * @param playerLimit - Player's current find limit
 * @returns Check result with message and hint
 */
export function checkFindLimit(
  coinValue: number | null,
  playerLimit: number
): FindLimitCheckResult {
  // Pool coins (null value) are never locked
  if (coinValue === null) {
    return {
      isLocked: false,
      coinValue: null,
      playerLimit,
    };
  }

  const isLocked = coinValue > playerLimit;

  if (!isLocked) {
    return {
      isLocked: false,
      coinValue,
      playerLimit,
    };
  }

  // Coin is locked - generate message and hint
  const hintAmount = coinValue + HINT_OFFSET;

  return {
    isLocked: true,
    coinValue,
    playerLimit,
    message: `This $${coinValue.toFixed(2)} coin is above yer $${playerLimit.toFixed(2)} limit!`,
    hint: `Hide $${hintAmount.toFixed(2)} to unlock bigger treasure!`,
    hintAmount,
  };
}

/**
 * Get the hint amount needed to unlock a specific coin value
 *
 * @param coinValue - Value of the locked coin
 * @returns Amount to hide to unlock this tier
 */
export function getHintAmount(coinValue: number): number {
  return coinValue + HINT_OFFSET;
}

/**
 * Get amount needed to unlock the next tier
 *
 * @param currentLimit - Player's current find limit
 * @returns Amount to hide, or null if at max tier
 */
export function getNextTierUnlockAmount(currentLimit: number): number | null {
  const currentTier = getTierForLimit(currentLimit);
  const currentIndex = FIND_LIMIT_TIERS.findIndex((t) => t.id === currentTier.id);

  if (currentIndex >= FIND_LIMIT_TIERS.length - 1) {
    return null; // Already at max tier
  }

  const nextTier = FIND_LIMIT_TIERS[currentIndex + 1];
  return nextTier.minLimit;
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the tier for a given find limit
 *
 * @param findLimit - Player's find limit
 * @returns Tier information
 */
export function getTierForLimit(findLimit: number): FindLimitTier {
  const tier = FIND_LIMIT_TIERS.find(
    (t) => findLimit >= t.minLimit && findLimit <= t.maxLimit
  );
  return tier || FIND_LIMIT_TIERS[0]; // Default to first tier
}

/**
 * Get tier name for display
 *
 * @param findLimit - Player's find limit
 * @returns Tier name with icon
 */
export function getTierName(findLimit: number): string {
  const tier = getTierForLimit(findLimit);
  return `${tier.icon} ${tier.name}`;
}

/**
 * Get tier color for styling
 *
 * @param findLimit - Player's find limit
 * @returns Hex color string
 */
export function getTierColor(findLimit: number): string {
  const tier = getTierForLimit(findLimit);
  return tier.color;
}

/**
 * Get progress to next tier (0-1)
 *
 * @param findLimit - Player's find limit
 * @returns Progress percentage (0-1), or 1 if at max tier
 */
export function getTierProgress(findLimit: number): number {
  const tier = getTierForLimit(findLimit);
  const currentIndex = FIND_LIMIT_TIERS.findIndex((t) => t.id === tier.id);

  if (currentIndex >= FIND_LIMIT_TIERS.length - 1) {
    return 1; // Max tier
  }

  const nextTier = FIND_LIMIT_TIERS[currentIndex + 1];
  const tierRange = nextTier.minLimit - tier.minLimit;
  const progress = (findLimit - tier.minLimit) / tierRange;

  return Math.min(Math.max(progress, 0), 1);
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get locked coin message in pirate speak
 *
 * @param coinValue - Value of the locked coin
 * @param playerLimit - Player's find limit
 * @returns Pirate-themed message
 */
export function getLockedMessage(coinValue: number, playerLimit: number): string {
  const messages = [
    `Arrr! This $${coinValue.toFixed(2)} treasure be beyond yer $${playerLimit.toFixed(2)} reach!`,
    `Blimey! Ye need a higher limit to claim this $${coinValue.toFixed(2)} doubloon!`,
    `Shiver me timbers! This coin's too rich for yer blood, matey!`,
    `This here treasure requires more experience, ye landlubber!`,
  ];

  // Pick a consistent message based on coin value (for UX consistency)
  const index = Math.floor(coinValue * 100) % messages.length;
  return messages[index];
}

/**
 * Get unlock hint message
 *
 * @param hintAmount - Amount to hide
 * @returns Hint message
 */
export function getUnlockHint(hintAmount: number): string {
  return `Hide $${hintAmount.toFixed(2)} to unlock this tier of treasure!`;
}

/**
 * Get congratulation message when limit increases
 *
 * @param oldLimit - Previous limit
 * @param newLimit - New limit
 * @returns Congratulation message
 */
export function getLimitIncreaseMessage(
  oldLimit: number,
  newLimit: number
): string {
  const oldTier = getTierForLimit(oldLimit);
  const newTier = getTierForLimit(newLimit);

  if (oldTier.id !== newTier.id) {
    // Tier changed - big celebration!
    return `🎉 Arrr! Ye've reached ${newTier.icon} ${newTier.name}! Find limit now $${newLimit.toFixed(2)}!`;
  }

  // Same tier, just higher limit
  return `⬆️ Find limit increased to $${newLimit.toFixed(2)}!`;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const findLimitService = {
  DEFAULT_FIND_LIMIT,
  HINT_OFFSET,
  FIND_LIMIT_TIERS,
  calculateNewFindLimit,
  checkFindLimit,
  getHintAmount,
  getNextTierUnlockAmount,
  getTierForLimit,
  getTierName,
  getTierColor,
  getTierProgress,
  getLockedMessage,
  getUnlockHint,
  getLimitIncreaseMessage,
};

export default findLimitService;

