// Haptic Feedback Service for Black Bart's Gold
// Provides vibration patterns based on proximity to coins
//
// Reference: docs/BUILD-GUIDE.md - Sprint 3.3: Haptic Feedback Service
// Reference: docs/prize-finder-details.md - Vibration patterns

import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';
import { useAppStore } from '../store';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Proximity zones for vibration feedback
 */
export type ProximityZone =
  | 'far' // > 50m - no vibration
  | 'approaching' // 30-50m - gentle pulses
  | 'close' // 15-30m - medium pulses
  | 'veryClose' // 5-15m - strong pulses
  | 'collectible'; // < 5m - continuous buzz

/**
 * Haptic intensity levels
 */
export type HapticIntensity = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Haptic feedback options
 */
const HAPTIC_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Distance thresholds in meters
 * Reference: docs/prize-finder-details.md
 *
 * | Distance    | Vibration Pattern      |
 * |-------------|------------------------|
 * | Far         | No vibration           |
 * | Approaching | Gentle pulses          |
 * | Close       | Strong, rapid pulses   |
 * | Collectible | Continuous buzz        |
 */
const DISTANCE_THRESHOLDS = {
  FAR: 50, // > 50m = no vibration
  APPROACHING: 30, // 30-50m = gentle
  CLOSE: 15, // 15-30m = medium
  VERY_CLOSE: 5, // 5-15m = strong
  // < 5m = collectible range
};

/**
 * Pulse intervals in milliseconds
 */
const PULSE_INTERVALS = {
  approaching: 2000, // Every 2 seconds
  close: 1000, // Every 1 second
  veryClose: 500, // Every 0.5 seconds
  collectible: 200, // Continuous rapid
};

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════

let proximityIntervalId: ReturnType<typeof setInterval> | null = null;
let currentZone: ProximityZone = 'far';

// ═══════════════════════════════════════════════════════════════════════════
// SINGLE HAPTIC TRIGGERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Trigger a single haptic feedback
 *
 * @param intensity - Intensity level
 *
 * @example
 * ```typescript
 * triggerHaptic('light');    // Gentle tap
 * triggerHaptic('medium');   // Normal tap
 * triggerHaptic('heavy');    // Strong tap
 * triggerHaptic('success');  // Success pattern
 * ```
 */
export function triggerHaptic(intensity: HapticIntensity): void {
  // Check if haptics are enabled in settings
  const hapticEnabled = useAppStore.getState().settings.hapticEnabled;
  if (!hapticEnabled) return;

  let type: HapticFeedbackTypes;

  switch (intensity) {
    case 'light':
      type = HapticFeedbackTypes.impactLight;
      break;
    case 'medium':
      type = HapticFeedbackTypes.impactMedium;
      break;
    case 'heavy':
      type = HapticFeedbackTypes.impactHeavy;
      break;
    case 'success':
      type = HapticFeedbackTypes.notificationSuccess;
      break;
    case 'warning':
      type = HapticFeedbackTypes.notificationWarning;
      break;
    case 'error':
      type = HapticFeedbackTypes.notificationError;
      break;
    default:
      type = HapticFeedbackTypes.impactMedium;
  }

  ReactNativeHapticFeedback.trigger(type, HAPTIC_OPTIONS);
}

/**
 * Trigger selection feedback (for UI interactions)
 */
export function triggerSelection(): void {
  const hapticEnabled = useAppStore.getState().settings.hapticEnabled;
  if (!hapticEnabled) return;
  
  ReactNativeHapticFeedback.trigger(
    HapticFeedbackTypes.selection,
    HAPTIC_OPTIONS
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROXIMITY FEEDBACK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get proximity zone from distance
 *
 * @param distanceMeters - Distance in meters
 * @returns Proximity zone
 */
export function getProximityZone(distanceMeters: number): ProximityZone {
  if (distanceMeters > DISTANCE_THRESHOLDS.FAR) {
    return 'far';
  } else if (distanceMeters > DISTANCE_THRESHOLDS.APPROACHING) {
    return 'approaching';
  } else if (distanceMeters > DISTANCE_THRESHOLDS.CLOSE) {
    return 'close';
  } else if (distanceMeters > DISTANCE_THRESHOLDS.VERY_CLOSE) {
    return 'veryClose';
  } else {
    return 'collectible';
  }
}

/**
 * Start proximity-based haptic feedback
 *
 * Call this repeatedly as the player moves to update the vibration pattern
 * based on distance to the nearest coin.
 *
 * @param distanceMeters - Distance to target in meters
 *
 * @example
 * ```typescript
 * // In your location update handler:
 * useEffect(() => {
 *   if (distanceToNearestCoin !== null) {
 *     startProximityFeedback(distanceToNearestCoin);
 *   } else {
 *     stopProximityFeedback();
 *   }
 * }, [distanceToNearestCoin]);
 * ```
 */
export function startProximityFeedback(distanceMeters: number): void {
  const hapticEnabled = useAppStore.getState().settings.hapticEnabled;
  if (!hapticEnabled) {
    stopProximityFeedback();
    return;
  }

  const newZone = getProximityZone(distanceMeters);

  // If zone hasn't changed, keep current pattern
  if (newZone === currentZone && proximityIntervalId !== null) {
    return;
  }

  // Zone changed - update pattern
  console.log(`[Haptics] Zone changed: ${currentZone} → ${newZone}`);
  currentZone = newZone;

  // Clear existing interval
  if (proximityIntervalId !== null) {
    clearInterval(proximityIntervalId);
    proximityIntervalId = null;
  }

  // Set up new pattern based on zone
  switch (newZone) {
    case 'far':
      // No vibration
      break;

    case 'approaching':
      // Gentle pulse every 2 seconds
      triggerHaptic('light');
      proximityIntervalId = setInterval(() => {
        triggerHaptic('light');
      }, PULSE_INTERVALS.approaching);
      break;

    case 'close':
      // Medium pulse every 1 second
      triggerHaptic('medium');
      proximityIntervalId = setInterval(() => {
        triggerHaptic('medium');
      }, PULSE_INTERVALS.close);
      break;

    case 'veryClose':
      // Strong pulse every 0.5 seconds
      triggerHaptic('heavy');
      proximityIntervalId = setInterval(() => {
        triggerHaptic('heavy');
      }, PULSE_INTERVALS.veryClose);
      break;

    case 'collectible':
      // Rapid continuous pulses
      triggerHaptic('heavy');
      proximityIntervalId = setInterval(() => {
        triggerHaptic('medium');
      }, PULSE_INTERVALS.collectible);
      break;
  }
}

/**
 * Stop proximity feedback
 */
export function stopProximityFeedback(): void {
  if (proximityIntervalId !== null) {
    clearInterval(proximityIntervalId);
    proximityIntervalId = null;
  }
  currentZone = 'far';
}

// ═══════════════════════════════════════════════════════════════════════════
// SPECIAL FEEDBACK PATTERNS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Trigger collection success feedback
 *
 * Special pattern for successful coin collection:
 * Short-short-long vibration pattern
 */
export function triggerCollectionFeedback(): void {
  const hapticEnabled = useAppStore.getState().settings.hapticEnabled;
  if (!hapticEnabled) return;

  // Stop proximity feedback
  stopProximityFeedback();

  // Short-short-long pattern
  triggerHaptic('light');
  setTimeout(() => triggerHaptic('light'), 100);
  setTimeout(() => triggerHaptic('success'), 200);
}

/**
 * Trigger feedback for locked coin (above find limit)
 */
export function triggerLockedFeedback(): void {
  const hapticEnabled = useAppStore.getState().settings.hapticEnabled;
  if (!hapticEnabled) return;

  triggerHaptic('error');
}

/**
 * Trigger feedback for out of range
 */
export function triggerOutOfRangeFeedback(): void {
  const hapticEnabled = useAppStore.getState().settings.hapticEnabled;
  if (!hapticEnabled) return;

  triggerHaptic('warning');
}

/**
 * Trigger feedback when coin appears in range
 */
export function triggerCoinDiscoveredFeedback(): void {
  const hapticEnabled = useAppStore.getState().settings.hapticEnabled;
  if (!hapticEnabled) return;

  // Double tap to indicate discovery
  triggerHaptic('medium');
  setTimeout(() => triggerHaptic('light'), 100);
}

/**
 * Trigger feedback for low gas warning
 */
export function triggerLowGasFeedback(): void {
  const hapticEnabled = useAppStore.getState().settings.hapticEnabled;
  if (!hapticEnabled) return;

  triggerHaptic('warning');
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const hapticsService = {
  triggerHaptic,
  triggerSelection,
  getProximityZone,
  startProximityFeedback,
  stopProximityFeedback,
  triggerCollectionFeedback,
  triggerLockedFeedback,
  triggerOutOfRangeFeedback,
  triggerCoinDiscoveredFeedback,
  triggerLowGasFeedback,
};

export default hapticsService;

