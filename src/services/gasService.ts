/**
 * Gas Service for Black Bart's Gold
 *
 * Specialized service for managing gas consumption and warnings.
 * Works in conjunction with walletService for balance management.
 *
 * Gas System Rules:
 * - Daily rate: ~$0.33/day ($10/month)
 * - Low warning: < 15% remaining (~5 days)
 * - Push notification: 3 days remaining
 * - Empty: Prize Finder disabled
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GasStatus, GasCheckResult } from '../types';
import {
  getBalance,
  consumeGas as walletConsumeGas,
  getGasStatus as walletGetGasStatus,
  DAILY_GAS_RATE,
  MONTHLY_GAS_AMOUNT,
} from './walletService';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Days remaining threshold for push notification */
const LOW_GAS_NOTIFICATION_DAYS = 3;

/** Days remaining threshold for warning UI */
const LOW_GAS_WARNING_DAYS = 5;

/** Percentage threshold for low gas (15%) */
const LOW_GAS_PERCENTAGE = 0.15;

/** AsyncStorage keys */
const STORAGE_KEYS = {
  LAST_GAS_CHECK: 'last_gas_check',
  GAS_NOTIFICATION_SCHEDULED: 'gas_notification_scheduled',
  GAS_WARNING_DISMISSED: 'gas_warning_dismissed',
};

// ═══════════════════════════════════════════════════════════════════════════
// GAS STATUS CHECKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Extended gas status with additional UI-relevant information.
 */
export interface ExtendedGasStatus extends GasStatus {
  /** Percentage of monthly gas remaining (0-100) */
  percentage: number;
  /** Whether to show the low gas warning UI */
  showWarning: boolean;
  /** Whether user dismissed the warning this session */
  warningDismissed: boolean;
  /** Days remaining as a formatted string */
  daysLeftFormatted: string;
}

/**
 * Gets detailed gas status for UI display.
 *
 * @param userId - The user's ID
 * @returns Promise<ExtendedGasStatus>
 */
export async function getDetailedGasStatus(userId: string): Promise<ExtendedGasStatus> {
  const basicStatus = await walletGetGasStatus(userId);

  // Check if warning was dismissed this session
  const warningDismissed = await AsyncStorage.getItem(
    `${STORAGE_KEYS.GAS_WARNING_DISMISSED}_${userId}`
  );

  // Calculate percentage
  const percentage = (basicStatus.remaining / MONTHLY_GAS_AMOUNT) * 100;

  // Determine if warning should show
  const showWarning =
    basicStatus.is_low &&
    !basicStatus.is_empty &&
    warningDismissed !== 'true';

  // Format days left
  let daysLeftFormatted: string;
  if (basicStatus.days_left === 0) {
    daysLeftFormatted = 'Empty!';
  } else if (basicStatus.days_left === 1) {
    daysLeftFormatted = '1 day left';
  } else {
    daysLeftFormatted = `${basicStatus.days_left} days left`;
  }

  return {
    ...basicStatus,
    percentage: Math.max(0, Math.min(100, percentage)),
    showWarning,
    warningDismissed: warningDismissed === 'true',
    daysLeftFormatted,
  };
}

/**
 * Checks gas status on app launch and handles notifications.
 *
 * @param userId - The user's ID
 * @returns Promise<GasCheckResult>
 */
export async function checkGasOnLaunch(userId: string): Promise<GasCheckResult> {
  const status = await getDetailedGasStatus(userId);

  // Schedule notification if needed
  if (status.days_left <= LOW_GAS_NOTIFICATION_DAYS && status.days_left > 0) {
    await scheduleGasNotification(status.days_left);
  }

  // Also try to consume gas if a new day has started
  await checkAndConsumeGas(userId);

  if (status.is_empty) {
    return 'NO_GAS';
  }

  if (status.is_low) {
    return 'LOW_GAS';
  }

  return 'OK';
}

/**
 * Checks if gas should be consumed (new day) and consumes it.
 *
 * @param userId - The user's ID
 * @returns Promise<boolean> - True if gas was consumed
 */
export async function checkAndConsumeGas(userId: string): Promise<boolean> {
  try {
    const lastCheck = await AsyncStorage.getItem(
      `${STORAGE_KEYS.LAST_GAS_CHECK}_${userId}`
    );

    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

    if (lastCheck !== today) {
      // New day - consume gas
      await walletConsumeGas(userId);

      // Update last check date
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.LAST_GAS_CHECK}_${userId}`,
        today
      );

      console.log('[GasService] Daily gas consumed for:', userId);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[GasService] Error checking gas consumption:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Schedules a push notification for low gas warning.
 * TODO: Integrate with react-native-push-notification or similar library.
 *
 * @param daysRemaining - Number of days of gas left
 */
export async function scheduleGasNotification(daysRemaining: number): Promise<void> {
  try {
    // Check if we already scheduled a notification
    const scheduled = await AsyncStorage.getItem(STORAGE_KEYS.GAS_NOTIFICATION_SCHEDULED);

    if (scheduled === 'true') {
      console.log('[GasService] Gas notification already scheduled');
      return;
    }

    // TODO: In production, use react-native-push-notification
    // For now, just log the intent
    console.log(
      `[GasService] Would schedule notification: "Running low on gas! ${daysRemaining} days remaining. Add more gas to keep hunting!"`
    );

    // Mark as scheduled
    await AsyncStorage.setItem(STORAGE_KEYS.GAS_NOTIFICATION_SCHEDULED, 'true');
  } catch (error) {
    console.error('[GasService] Error scheduling notification:', error);
  }
}

/**
 * Clears scheduled gas notification (e.g., after purchase).
 */
export async function clearGasNotification(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.GAS_NOTIFICATION_SCHEDULED);
    console.log('[GasService] Gas notification cleared');

    // TODO: Cancel actual push notification if using react-native-push-notification
  } catch (error) {
    console.error('[GasService] Error clearing notification:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WARNING MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Dismisses the low gas warning for this session.
 *
 * @param userId - The user's ID
 */
export async function dismissGasWarning(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.GAS_WARNING_DISMISSED}_${userId}`,
      'true'
    );
    console.log('[GasService] Gas warning dismissed');
  } catch (error) {
    console.error('[GasService] Error dismissing warning:', error);
  }
}

/**
 * Resets the gas warning dismissed state (e.g., on app restart).
 *
 * @param userId - The user's ID
 */
export async function resetGasWarning(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(
      `${STORAGE_KEYS.GAS_WARNING_DISMISSED}_${userId}`
    );
  } catch (error) {
    console.error('[GasService] Error resetting warning:', error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GAS METER HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gets the appropriate color for the gas meter based on fill level.
 *
 * @param percentage - Gas percentage (0-100)
 * @returns Hex color code
 */
export function getGasMeterColor(percentage: number): string {
  if (percentage <= 15) {
    return '#EF4444'; // Red - critical
  } else if (percentage <= 30) {
    return '#F97316'; // Orange - warning
  } else if (percentage <= 50) {
    return '#EAB308'; // Yellow - caution
  } else {
    return '#22C55E'; // Green - good
  }
}

/**
 * Gets a pirate-themed message based on gas level.
 *
 * @param percentage - Gas percentage (0-100)
 * @returns Pirate-themed message
 */
export function getGasMessage(percentage: number): string {
  if (percentage <= 0) {
    return "Ye've run aground, matey! No gas in the tank!";
  } else if (percentage <= 15) {
    return '🚨 LOW FUEL! Fill up or walk the plank!';
  } else if (percentage <= 30) {
    return "Runnin' low on fuel, Captain...";
  } else if (percentage <= 50) {
    return "Half a tank left, keep sailin'!";
  } else if (percentage <= 75) {
    return 'Plenty of fuel for treasure huntin!';
  } else {
    return "Full steam ahead, Cap'n! ⚓";
  }
}

/**
 * Gets display format for gas remaining.
 *
 * @param remaining - Gas remaining in BBG
 * @param daysLeft - Days of gas remaining
 * @returns Formatted display string
 */
export function formatGasDisplay(remaining: number, daysLeft: number): string {
  if (remaining <= 0) {
    return 'EMPTY';
  }

  if (daysLeft <= 1) {
    return `$${remaining.toFixed(2)} (~${daysLeft} day)`;
  }

  return `$${remaining.toFixed(2)} (~${daysLeft} days)`;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTED SERVICE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gas service object for convenient access to all functions.
 */
export const gasService = {
  getDetailedGasStatus,
  checkGasOnLaunch,
  checkAndConsumeGas,
  scheduleGasNotification,
  clearGasNotification,
  dismissGasWarning,
  resetGasWarning,
  getGasMeterColor,
  getGasMessage,
  formatGasDisplay,
};

