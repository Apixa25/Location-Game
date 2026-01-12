// Export all AR-related modules for Black Bart's Gold

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════
// Animation registry and constants
// IMPORTANT: Import this file early in app startup to register animations!
export {
  ANIMATIONS,
  ANIMATION_TIMING,
  ANIMATION_VALUES,
  ANIMATION_DURATIONS,
} from './animations';
export type { AnimationName } from './animations';

// ═══════════════════════════════════════════════════════════════════════════
// SCENES
// ═══════════════════════════════════════════════════════════════════════════
export { PrizeFinderScene } from './PrizeFinderScene';

// ═══════════════════════════════════════════════════════════════════════════
// AR COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════
export { CoinObject, ValuePopup } from './CoinObject';
export type { CoinObjectProps, ValuePopupProps } from './CoinObject';

