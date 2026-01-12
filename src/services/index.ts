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

// ═══════════════════════════════════════════════════════════════════════════
// WALLET SERVICE
// ═══════════════════════════════════════════════════════════════════════════
export {
  DAILY_GAS_RATE,
  LOW_GAS_THRESHOLD,
  MONTHLY_GAS_AMOUNT,
  PENDING_CONFIRMATION_HOURS,
  getBalance,
  updateBalance,
  addGas,
  addPendingCoins,
  getTransactions,
  addTransaction,
  updateTransactionStatus,
  parkCoins,
  unparkCoins,
  consumeGas,
  canPlay,
  getGasStatus,
  checkGasOnLaunch,
  confirmPendingCoins,
  getTransactionIcon,
  formatTransactionAmount,
  getTransactionColor,
  formatRelativeTime,
  simulatePurchase,
  clearWalletData,
} from './walletService';

// ═══════════════════════════════════════════════════════════════════════════
// GAS SERVICE
// ═══════════════════════════════════════════════════════════════════════════
export {
  getDetailedGasStatus,
  checkGasOnLaunch as checkGasOnLaunchDetailed,
  checkAndConsumeGas,
  scheduleGasNotification,
  clearGasNotification,
  dismissGasWarning,
  resetGasWarning,
  getGasMeterColor,
  getGasMessage,
  formatGasDisplay,
  gasService,
} from './gasService';
export type { ExtendedGasStatus } from './gasService';

