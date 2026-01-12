// Export all services for Black Bart's Gold

// ═══════════════════════════════════════════════════════════════════════════
// LOCATION SERVICE
// ═══════════════════════════════════════════════════════════════════════════
export {
  requestLocationPermission,
  checkLocationPermission,
  getCurrentPosition,
  watchPosition,
  stopWatching,
  stopAllWatching,
  calculateDistance,
  calculateBearing,
  bearingToCardinal,
  isWithinRadius,
  locationService,
} from './location';

// ═══════════════════════════════════════════════════════════════════════════
// HAPTICS SERVICE
// ═══════════════════════════════════════════════════════════════════════════
export {
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
  hapticsService,
} from './haptics';
export type { ProximityZone, HapticIntensity } from './haptics';

