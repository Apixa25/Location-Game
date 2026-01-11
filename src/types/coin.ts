// Coin Types for Black Bart's Gold

/**
 * Type of coin - determines whether value is known upfront
 */
export type CoinType = 'fixed' | 'pool';

/**
 * Current status of a coin in the system
 */
export type CoinStatus = 'hidden' | 'visible' | 'collected' | 'confirmed';

/**
 * Tier for multi-find coins (Gold/Silver/Bronze system)
 */
export type CoinTier = 'gold' | 'silver' | 'bronze' | null;

/**
 * Coin entity as stored in the system
 */
export interface Coin {
  id: string;
  coin_type: CoinType;
  /** Value in BBG - null for pool coins (determined at collection) */
  value: number | null;
  /** Amount the hider contributed */
  contribution: number;
  /** GPS coordinates of the coin */
  location: {
    latitude: number;
    longitude: number;
  };
  /** User ID of who hid this coin, or 'system' for auto-placed coins */
  hider_id: string;
  /** When the coin was hidden */
  hidden_at: string; // ISO timestamp
  /** URL for front logo (always Black Bart) */
  logo_front: string | null;
  /** URL for back logo (custom or Black Bart) */
  logo_back: string | null;
  /** Reference to hunt type configuration */
  hunt_type: HuntTypeId;
  /** Whether multiple finders can collect this coin */
  multi_find: boolean;
  /** Remaining finds for multi-find coins (3, 2, 1, or null) */
  finds_remaining: number | null;
  /** Current tier for multi-find coins */
  current_tier: CoinTier;
  /** Current status of the coin */
  status: CoinStatus;
}

/**
 * Hunt type identifier
 */
export type HuntTypeId =
  | 'direct_navigation'
  | 'compass_only'
  | 'pure_ar'
  | 'radar_only'
  | 'timed_release'
  | 'multi_find_race'
  | 'single_find_sequential';

/**
 * Result of attempting to collect a coin
 */
export interface CollectionResult {
  success: boolean;
  coin_id: string;
  value_received: number;
  tier: CoinTier;
  message?: string;
  error?: CollectionError;
}

/**
 * Possible errors when collecting a coin
 */
export type CollectionError =
  | 'TOO_FAR'
  | 'OVER_LIMIT'
  | 'ALREADY_COLLECTED'
  | 'NO_GAS'
  | 'NETWORK_ERROR';

/**
 * Coin as displayed in the AR view with calculated properties
 */
export interface ARCoin extends Coin {
  /** Calculated distance from player in meters */
  distance_meters: number;
  /** Calculated bearing from player in degrees (0-360) */
  bearing: number;
  /** AR scene position [x, y, z] */
  ar_position: [number, number, number];
  /** Whether this coin is within collection range */
  is_collectible: boolean;
  /** Whether this coin is above the player's find limit */
  is_over_limit: boolean;
}
