/**
 * Wallet Service for Black Bart's Gold
 *
 * Manages BBG balance, transactions, gas consumption, and coin parking.
 *
 * Key concepts:
 * - Purchased BBG: Must be used as gas, cannot be parked
 * - Found BBG: Can be parked (protected) or used as gas
 * - Pending: Coins collected within last 24h (verification period)
 * - Confirmed: Verified coins, fully usable
 * - Gas: Consumed daily (~$0.33/day, $10/month)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WalletBalance,
  Transaction,
  TransactionType,
  TransactionStatus,
  GasStatus,
  GasCheckResult,
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Daily gas consumption rate in BBG (~$0.33/day = $10/month) */
export const DAILY_GAS_RATE = 0.33;

/** Threshold for low gas warning (15% of monthly gas) */
export const LOW_GAS_THRESHOLD = 0.15;

/** Initial monthly gas amount ($10) */
export const MONTHLY_GAS_AMOUNT = 10.0;

/** Duration in hours before pending coins are confirmed */
export const PENDING_CONFIRMATION_HOURS = 24;

/** AsyncStorage keys */
const STORAGE_KEYS = {
  WALLET_BALANCE: 'wallet_balance',
  TRANSACTIONS: 'transactions',
  LAST_GAS_CONSUMPTION: 'last_gas_consumption',
};

// ═══════════════════════════════════════════════════════════════════════════
// BALANCE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gets the user's current wallet balance breakdown.
 *
 * @param userId - The user's ID
 * @returns Promise<WalletBalance> - Balance breakdown
 */
export async function getBalance(userId: string): Promise<WalletBalance> {
  try {
    const stored = await AsyncStorage.getItem(`${STORAGE_KEYS.WALLET_BALANCE}_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[WalletService] Error getting balance:', error);
  }

  // Default balance for new users
  return {
    total: 0,
    gas_tank: 0,
    parked: 0,
    pending: 0,
  };
}

/**
 * Updates the user's wallet balance.
 *
 * @param userId - The user's ID
 * @param balance - New balance values
 * @returns Promise<void>
 */
export async function updateBalance(
  userId: string,
  balance: Partial<WalletBalance>
): Promise<void> {
  try {
    const current = await getBalance(userId);
    const updated: WalletBalance = {
      ...current,
      ...balance,
      // Recalculate total
      total: (balance.gas_tank ?? current.gas_tank) +
             (balance.parked ?? current.parked) +
             (balance.pending ?? current.pending),
    };

    await AsyncStorage.setItem(
      `${STORAGE_KEYS.WALLET_BALANCE}_${userId}`,
      JSON.stringify(updated)
    );

    console.log('[WalletService] Balance updated:', updated);
  } catch (error) {
    console.error('[WalletService] Error updating balance:', error);
    throw new Error('Failed to update wallet balance');
  }
}

/**
 * Adds gas to the user's account (from purchase or unparking).
 *
 * @param userId - The user's ID
 * @param amount - Amount to add to gas tank
 * @param isPurchased - Whether this is purchased BBG (vs found)
 * @returns Promise<WalletBalance> - Updated balance
 */
export async function addGas(
  userId: string,
  amount: number,
  isPurchased: boolean = false
): Promise<WalletBalance> {
  const current = await getBalance(userId);

  const updated: WalletBalance = {
    ...current,
    gas_tank: current.gas_tank + amount,
    total: current.total + amount,
  };

  await AsyncStorage.setItem(
    `${STORAGE_KEYS.WALLET_BALANCE}_${userId}`,
    JSON.stringify(updated)
  );

  // Record transaction
  await addTransaction(userId, {
    id: `txn_${Date.now()}`,
    type: isPurchased ? 'purchased' : 'unparked',
    amount: amount,
    timestamp: new Date().toISOString(),
    coin_id: null,
    status: 'confirmed',
    description: isPurchased
      ? `Purchased $${amount.toFixed(2)} BBG`
      : `Moved $${amount.toFixed(2)} from parked to gas`,
  });

  console.log('[WalletService] Added gas:', amount, 'Purchased:', isPurchased);
  return updated;
}

/**
 * Adds pending coins to the user's wallet.
 *
 * @param userId - The user's ID
 * @param amount - Amount to add as pending
 * @param coinId - Related coin ID
 * @param description - Transaction description
 * @returns Promise<WalletBalance> - Updated balance
 */
export async function addPendingCoins(
  userId: string,
  amount: number,
  coinId: string,
  description: string
): Promise<WalletBalance> {
  const current = await getBalance(userId);

  const updated: WalletBalance = {
    ...current,
    pending: current.pending + amount,
    total: current.total + amount,
  };

  await AsyncStorage.setItem(
    `${STORAGE_KEYS.WALLET_BALANCE}_${userId}`,
    JSON.stringify(updated)
  );

  // Record transaction
  await addTransaction(userId, {
    id: `txn_${Date.now()}`,
    type: 'found',
    amount: amount,
    timestamp: new Date().toISOString(),
    coin_id: coinId,
    status: 'pending',
    description,
  });

  console.log('[WalletService] Added pending coins:', amount);
  return updated;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSACTION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gets the user's transaction history.
 *
 * @param userId - The user's ID
 * @param limit - Maximum number of transactions to return
 * @param offset - Number of transactions to skip
 * @returns Promise<Transaction[]> - List of transactions
 */
export async function getTransactions(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Transaction[]> {
  try {
    const stored = await AsyncStorage.getItem(`${STORAGE_KEYS.TRANSACTIONS}_${userId}`);
    if (stored) {
      const transactions: Transaction[] = JSON.parse(stored);
      // Sort by timestamp descending (newest first)
      const sorted = transactions.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      return sorted.slice(offset, offset + limit);
    }
  } catch (error) {
    console.error('[WalletService] Error getting transactions:', error);
  }
  return [];
}

/**
 * Adds a new transaction to the user's history.
 *
 * @param userId - The user's ID
 * @param transaction - Transaction to add
 * @returns Promise<void>
 */
export async function addTransaction(
  userId: string,
  transaction: Transaction
): Promise<void> {
  try {
    const transactions = await getTransactions(userId, 1000, 0);
    transactions.unshift(transaction); // Add to beginning

    // Keep only last 500 transactions
    const trimmed = transactions.slice(0, 500);

    await AsyncStorage.setItem(
      `${STORAGE_KEYS.TRANSACTIONS}_${userId}`,
      JSON.stringify(trimmed)
    );

    console.log('[WalletService] Transaction added:', transaction.type, transaction.amount);
  } catch (error) {
    console.error('[WalletService] Error adding transaction:', error);
    throw new Error('Failed to record transaction');
  }
}

/**
 * Updates a transaction's status.
 *
 * @param userId - The user's ID
 * @param transactionId - ID of transaction to update
 * @param status - New status
 * @returns Promise<boolean> - Success status
 */
export async function updateTransactionStatus(
  userId: string,
  transactionId: string,
  status: TransactionStatus
): Promise<boolean> {
  try {
    const transactions = await getTransactions(userId, 1000, 0);
    const index = transactions.findIndex((t) => t.id === transactionId);

    if (index === -1) {
      console.warn('[WalletService] Transaction not found:', transactionId);
      return false;
    }

    transactions[index].status = status;

    await AsyncStorage.setItem(
      `${STORAGE_KEYS.TRANSACTIONS}_${userId}`,
      JSON.stringify(transactions)
    );

    console.log('[WalletService] Transaction status updated:', transactionId, status);
    return true;
  } catch (error) {
    console.error('[WalletService] Error updating transaction:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PARKING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parks coins from gas tank to protected storage.
 * Only found coins can be parked (not purchased BBG).
 *
 * @param userId - The user's ID
 * @param amount - Amount to park
 * @returns Promise<WalletBalance> - Updated balance
 */
export async function parkCoins(userId: string, amount: number): Promise<WalletBalance> {
  const current = await getBalance(userId);

  // Validate: Can only park from gas tank
  if (amount > current.gas_tank) {
    throw new Error(
      `Cannot park $${amount.toFixed(2)}. Only $${current.gas_tank.toFixed(2)} available in gas tank.`
    );
  }

  // Validate: Must have some amount to park
  if (amount <= 0) {
    throw new Error('Amount to park must be greater than zero.');
  }

  const updated: WalletBalance = {
    ...current,
    gas_tank: current.gas_tank - amount,
    parked: current.parked + amount,
    // Total stays the same (just moving between buckets)
  };

  await AsyncStorage.setItem(
    `${STORAGE_KEYS.WALLET_BALANCE}_${userId}`,
    JSON.stringify(updated)
  );

  // Record transaction
  await addTransaction(userId, {
    id: `txn_${Date.now()}`,
    type: 'parked',
    amount: -amount, // Negative since it's leaving gas tank
    timestamp: new Date().toISOString(),
    coin_id: null,
    status: 'confirmed',
    description: `Parked $${amount.toFixed(2)} (protected from gas)`,
  });

  console.log('[WalletService] Parked coins:', amount);
  return updated;
}

/**
 * Unparks coins from protected storage to gas tank.
 * Immediately charges 1 day's gas fee.
 *
 * @param userId - The user's ID
 * @param amount - Amount to unpark
 * @returns Promise<WalletBalance> - Updated balance
 */
export async function unparkCoins(userId: string, amount: number): Promise<WalletBalance> {
  const current = await getBalance(userId);

  // Validate: Can only unpark what's parked
  if (amount > current.parked) {
    throw new Error(
      `Cannot unpark $${amount.toFixed(2)}. Only $${current.parked.toFixed(2)} parked.`
    );
  }

  // Validate: Must have some amount to unpark
  if (amount <= 0) {
    throw new Error('Amount to unpark must be greater than zero.');
  }

  // Charge 1 day's gas fee immediately
  const gasFee = DAILY_GAS_RATE;
  const netAmount = Math.max(0, amount - gasFee);

  const updated: WalletBalance = {
    ...current,
    parked: current.parked - amount,
    gas_tank: current.gas_tank + netAmount,
    total: current.total - gasFee, // Lost gas fee
  };

  await AsyncStorage.setItem(
    `${STORAGE_KEYS.WALLET_BALANCE}_${userId}`,
    JSON.stringify(updated)
  );

  // Record unpark transaction
  await addTransaction(userId, {
    id: `txn_${Date.now()}`,
    type: 'unparked',
    amount: amount,
    timestamp: new Date().toISOString(),
    coin_id: null,
    status: 'confirmed',
    description: `Unparked $${amount.toFixed(2)} to gas tank`,
  });

  // Record gas fee transaction
  await addTransaction(userId, {
    id: `txn_${Date.now() + 1}`,
    type: 'gas_consumed',
    amount: -gasFee,
    timestamp: new Date().toISOString(),
    coin_id: null,
    status: 'confirmed',
    description: `Unpark gas fee: $${gasFee.toFixed(2)}`,
  });

  console.log('[WalletService] Unparked coins:', amount, 'Net after fee:', netAmount);
  return updated;
}

// ═══════════════════════════════════════════════════════════════════════════
// GAS CONSUMPTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Consumes daily gas from the user's account.
 * Should be called once per day (at midnight).
 *
 * @param userId - The user's ID
 * @returns Promise<number> - Remaining gas after consumption
 */
export async function consumeGas(userId: string): Promise<number> {
  const current = await getBalance(userId);

  // Check last consumption to prevent double-charging
  const lastConsumption = await AsyncStorage.getItem(
    `${STORAGE_KEYS.LAST_GAS_CONSUMPTION}_${userId}`
  );

  if (lastConsumption) {
    const lastDate = new Date(lastConsumption);
    const today = new Date();

    // If already consumed today, skip
    if (
      lastDate.getDate() === today.getDate() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getFullYear() === today.getFullYear()
    ) {
      console.log('[WalletService] Gas already consumed today');
      return current.gas_tank;
    }
  }

  // Calculate gas to consume
  const gasToConsume = Math.min(DAILY_GAS_RATE, current.gas_tank);
  const newGasTank = Math.max(0, current.gas_tank - gasToConsume);

  const updated: WalletBalance = {
    ...current,
    gas_tank: newGasTank,
    total: current.total - gasToConsume,
  };

  await AsyncStorage.setItem(
    `${STORAGE_KEYS.WALLET_BALANCE}_${userId}`,
    JSON.stringify(updated)
  );

  // Record last consumption time
  await AsyncStorage.setItem(
    `${STORAGE_KEYS.LAST_GAS_CONSUMPTION}_${userId}`,
    new Date().toISOString()
  );

  // Record transaction
  await addTransaction(userId, {
    id: `txn_gas_${Date.now()}`,
    type: 'gas_consumed',
    amount: -gasToConsume,
    timestamp: new Date().toISOString(),
    coin_id: null,
    status: 'confirmed',
    description: `Daily gas fee: $${gasToConsume.toFixed(2)}`,
  });

  console.log('[WalletService] Gas consumed:', gasToConsume, 'Remaining:', newGasTank);
  return newGasTank;
}

/**
 * Checks if the user has enough gas to play.
 *
 * @param userId - The user's ID
 * @returns Promise<boolean> - True if user can play
 */
export async function canPlay(userId: string): Promise<boolean> {
  const balance = await getBalance(userId);
  return balance.gas_tank > 0;
}

/**
 * Gets the current gas status for display.
 *
 * @param userId - The user's ID
 * @returns Promise<GasStatus> - Current gas status
 */
export async function getGasStatus(userId: string): Promise<GasStatus> {
  const balance = await getBalance(userId);

  const remaining = balance.gas_tank;
  const daysLeft = remaining / DAILY_GAS_RATE;
  const isLow = daysLeft < 5 && daysLeft > 0; // Low if less than 5 days
  const isEmpty = remaining <= 0;

  return {
    remaining,
    days_left: Math.floor(daysLeft),
    is_low: isLow,
    is_empty: isEmpty,
    daily_rate: DAILY_GAS_RATE,
  };
}

/**
 * Checks gas status on app launch.
 *
 * @param userId - The user's ID
 * @returns Promise<GasCheckResult> - Gas status
 */
export async function checkGasOnLaunch(userId: string): Promise<GasCheckResult> {
  const status = await getGasStatus(userId);

  if (status.is_empty) {
    return 'NO_GAS';
  }

  if (status.is_low) {
    return 'LOW_GAS';
  }

  return 'OK';
}

// ═══════════════════════════════════════════════════════════════════════════
// PENDING COIN CONFIRMATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Confirms pending coins that are older than 24 hours.
 * Moves them from pending to gas tank.
 *
 * @param userId - The user's ID
 * @returns Promise<number> - Number of coins confirmed
 */
export async function confirmPendingCoins(userId: string): Promise<number> {
  const transactions = await getTransactions(userId, 1000, 0);
  const balance = await getBalance(userId);

  const now = new Date();
  const cutoff = new Date(now.getTime() - PENDING_CONFIRMATION_HOURS * 60 * 60 * 1000);

  let confirmedCount = 0;
  let confirmedAmount = 0;

  for (const txn of transactions) {
    if (txn.type === 'found' && txn.status === 'pending') {
      const txnDate = new Date(txn.timestamp);

      if (txnDate < cutoff) {
        // Confirm this transaction
        await updateTransactionStatus(userId, txn.id, 'confirmed');
        confirmedCount++;
        confirmedAmount += txn.amount;
      }
    }
  }

  if (confirmedCount > 0) {
    // Move from pending to gas tank
    const updated: WalletBalance = {
      ...balance,
      pending: Math.max(0, balance.pending - confirmedAmount),
      gas_tank: balance.gas_tank + confirmedAmount,
      // Total stays the same
    };

    await AsyncStorage.setItem(
      `${STORAGE_KEYS.WALLET_BALANCE}_${userId}`,
      JSON.stringify(updated)
    );

    console.log(
      '[WalletService] Confirmed pending coins:',
      confirmedCount,
      'Total:',
      confirmedAmount
    );
  }

  return confirmedCount;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSACTION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gets a human-readable icon for a transaction type.
 *
 * @param type - Transaction type
 * @returns Emoji icon
 */
export function getTransactionIcon(type: TransactionType): string {
  switch (type) {
    case 'found':
      return '🪙';
    case 'hidden':
      return '🏴‍☠️';
    case 'gas_consumed':
      return '⛽';
    case 'purchased':
      return '💳';
    case 'parked':
      return '🅿️';
    case 'unparked':
      return '🚀';
    case 'transfer_in':
      return '📥';
    case 'transfer_out':
      return '📤';
    case 'refund':
      return '↩️';
    default:
      return '💰';
  }
}

/**
 * Formats a transaction amount with color indicator.
 *
 * @param amount - Transaction amount
 * @returns Formatted string with + or - prefix
 */
export function formatTransactionAmount(amount: number): string {
  const prefix = amount >= 0 ? '+' : '';
  return `${prefix}$${Math.abs(amount).toFixed(2)}`;
}

/**
 * Gets the color for a transaction amount (green for positive, red for negative).
 *
 * @param amount - Transaction amount
 * @returns Color hex code
 */
export function getTransactionColor(amount: number): string {
  return amount >= 0 ? '#4ADE80' : '#EF4444'; // Green or red
}

/**
 * Formats a relative timestamp (e.g., "2 hours ago").
 *
 * @param timestamp - ISO timestamp string
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PURCHASE SIMULATION (for development)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Simulates a BBG purchase (for development only).
 *
 * @param userId - The user's ID
 * @param amount - Amount to purchase
 * @returns Promise<WalletBalance> - Updated balance
 */
export async function simulatePurchase(
  userId: string,
  amount: number = MONTHLY_GAS_AMOUNT
): Promise<WalletBalance> {
  console.log('[WalletService] Simulating purchase of:', amount);
  return addGas(userId, amount, true);
}

/**
 * Clears all wallet data for a user (for testing).
 *
 * @param userId - The user's ID
 */
export async function clearWalletData(userId: string): Promise<void> {
  await AsyncStorage.removeItem(`${STORAGE_KEYS.WALLET_BALANCE}_${userId}`);
  await AsyncStorage.removeItem(`${STORAGE_KEYS.TRANSACTIONS}_${userId}`);
  await AsyncStorage.removeItem(`${STORAGE_KEYS.LAST_GAS_CONSUMPTION}_${userId}`);
  console.log('[WalletService] Wallet data cleared for user:', userId);
}

