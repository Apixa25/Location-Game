// Wallet Types for Black Bart's Gold

/**
 * Transaction types
 */
export type TransactionType =
  | 'found'        // Collected a coin
  | 'hidden'       // Hid a coin
  | 'gas_consumed' // Daily gas fee
  | 'purchased'    // Bought BBG with real money
  | 'parked'       // Moved to parked status
  | 'unparked'     // Moved from parked to gas
  | 'transfer_in'  // Received from another user
  | 'transfer_out' // Sent to another user
  | 'refund';      // Coin retrieved (unfound)

/**
 * Transaction status
 */
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

/**
 * Transaction record
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  /** Positive for income, negative for expense */
  amount: number;
  /** When the transaction occurred */
  timestamp: string;
  /** Related coin ID if applicable */
  coin_id: string | null;
  /** Current status */
  status: TransactionStatus;
  /** Human-readable description */
  description: string;
  /** Other user ID for transfers */
  other_user_id?: string;
}

/**
 * Wallet balance breakdown
 */
export interface WalletBalance {
  /** Total BBG balance (sum of all below) */
  total: number;
  /** BBG available as gas (consumed daily) */
  gas_tank: number;
  /** BBG parked (protected from gas consumption) */
  parked: number;
  /** BBG pending confirmation (within 24h of collection) */
  pending: number;
}

/**
 * Gas status information
 */
export interface GasStatus {
  /** Amount of gas remaining in BBG */
  remaining: number;
  /** Approximate days of gas left */
  days_left: number;
  /** Whether gas is low (<15%) */
  is_low: boolean;
  /** Whether gas is empty */
  is_empty: boolean;
  /** Daily consumption rate */
  daily_rate: number;
}

/**
 * Gas check result on app launch
 */
export type GasCheckResult = 'OK' | 'LOW_GAS' | 'NO_GAS';

/**
 * Coin denomination options
 */
export type CoinDenomination =
  | 0.05  // 5¢
  | 0.10  // 10¢
  | 0.25  // 25¢
  | 0.50  // 50¢
  | 1     // $1
  | 5     // $5
  | 10    // $10
  | 25    // $25
  | 50    // $50
  | 100;  // $100
