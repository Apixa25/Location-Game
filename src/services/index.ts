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

// ═══════════════════════════════════════════════════════════════════════════
// COIN SERVICE
// ═══════════════════════════════════════════════════════════════════════════
export {
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
  coinService,
} from './coinService';
export type {
  CollectionBlockReason,
  CanCollectResult,
  CollectCoinRequest,
  PlayerFindHistory,
} from './coinService';

// ═══════════════════════════════════════════════════════════════════════════
// FIND LIMIT SERVICE
// ═══════════════════════════════════════════════════════════════════════════
export {
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
  findLimitService,
} from './findLimitService';
export type {
  FindLimitCheckResult,
  FindLimitTier,
  FindLimitHistoryEntry,
} from './findLimitService';

// ═══════════════════════════════════════════════════════════════════════════
// AUTH SERVICE
// ═══════════════════════════════════════════════════════════════════════════
export {
  isValidEmail,
  validatePassword,
  isValidAge,
  register,
  login,
  loginWithGoogle,
  logout,
  storeSession,
  clearSession,
  getCurrentUser,
  isAuthenticated,
  getAuthToken,
  refreshUserData,
  authService,
} from './authService';
export type {
  RegisterData,
  LoginCredentials,
  AuthResult,
  AuthError,
  PasswordValidation,
} from './authService';

