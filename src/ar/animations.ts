// Animation Registry for Black Bart's Gold
// Registers all ViroReact animations for coins and effects
//
// Reference: docs/tech-stack-setup-guide.md - Animation System section
// Reference: docs/BUILD-GUIDE.md - Sprint 2.2: Animation Registry

import { ViroAnimations } from '@reactvision/react-viro';

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION CONFIGURATION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Animation timing constants (in milliseconds)
 * Adjust these to tweak the feel of animations globally
 */
export const ANIMATION_TIMING = {
  // Idle animation timing
  SPIN_DURATION: 2000, // Full 360° rotation
  BOB_DURATION: 600, // Single bob up or down

  // Collection animation timing
  FLY_DURATION: 400, // Fly toward camera
  FAST_SPIN_DURATION: 400, // Rapid spin during collection
  SHRINK_DURATION: 300, // Shrink down
  SHRINK_DELAY: 400, // Delay before shrink starts
  FADE_DURATION: 200, // Fade out
  FADE_DELAY: 500, // Delay before fade starts

  // Pulse animation timing
  PULSE_DURATION: 300, // Single pulse up or down

  // Appear animation timing
  APPEAR_DURATION: 500, // Coin appearing/spawning

  // Locked coin timing
  LOCKED_PULSE_DURATION: 800, // Slower pulse for locked coins
} as const;

/**
 * Animation value constants
 * Adjust these to tweak the magnitude of animations
 */
export const ANIMATION_VALUES = {
  // Bob amount (Y axis offset)
  BOB_DISTANCE: 0.03,

  // Collection fly distance
  FLY_FORWARD_Z: 1.5, // Toward camera
  FLY_UP_Y: 0.3, // Slight upward arc

  // Scale values
  SHRINK_SCALE: 0.05, // Final scale when collected
  PULSE_SCALE: 1.1, // Scale when pulsing up
  NORMAL_SCALE: 1.0, // Normal scale
  APPEAR_START_SCALE: 0.01, // Starting scale when appearing
  LOCKED_PULSE_SCALE: 1.15, // Larger pulse for locked coins

  // Rotation values
  FULL_ROTATION: 360, // Single full rotation
  DOUBLE_ROTATION: 720, // Double rotation for fast spin
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// REGISTER ALL ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Register all animations with ViroReact
 *
 * Animation naming convention:
 * - spinXxx: Rotation animations
 * - bobXxx: Vertical movement
 * - flyXxx: Translation toward/away from camera
 * - pulseXxx: Scale up/down effects
 * - fadeXxx: Opacity changes
 * - coinXxx: Combined/chained coin animations
 *
 * Chaining syntax:
 * - [["a", "b"]]: Run a and b in PARALLEL
 * - [["a"], ["b"]]: Run a, THEN b (sequential)
 * - [["a", "b"], ["c"]]: Run a+b parallel, THEN c
 */
ViroAnimations.registerAnimations({
  // ═════════════════════════════════════════════════════════════════════════
  // IDLE ANIMATIONS (Looping)
  // Used when coin is just floating in AR, waiting to be collected
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Continuous Y-axis rotation (coin spinning)
   * - Full 360° rotation
   * - Linear easing for smooth continuous motion
   * - 2 second duration
   */
  spinCoin: {
    properties: { rotateY: '+=360' },
    duration: ANIMATION_TIMING.SPIN_DURATION,
    easing: 'Linear',
  },

  /**
   * Bob upward (first half of float)
   * - Move up 0.03 units on Y axis
   * - Ease in-out for natural floating feel
   */
  bobUp: {
    properties: { positionY: `+=${ANIMATION_VALUES.BOB_DISTANCE}` },
    duration: ANIMATION_TIMING.BOB_DURATION,
    easing: 'EaseInEaseOut',
  },

  /**
   * Bob downward (second half of float)
   * - Move down 0.03 units on Y axis
   * - Ease in-out for natural floating feel
   */
  bobDown: {
    properties: { positionY: `-=${ANIMATION_VALUES.BOB_DISTANCE}` },
    duration: ANIMATION_TIMING.BOB_DURATION,
    easing: 'EaseInEaseOut',
  },

  /**
   * Complete float cycle (bobUp then bobDown)
   * Sequential chain: up, then down
   */
  coinFloat: [['bobUp', 'bobDown']],

  /**
   * Full idle animation (spin + float simultaneously)
   * Parallel chain: spin while floating
   * This is the main animation for coins waiting to be collected
   */
  coinIdle: [['spinCoin'], ['coinFloat']],

  // ═════════════════════════════════════════════════════════════════════════
  // COLLECTION ANIMATIONS (One-shot)
  // Triggered when player collects a coin
  // Reference: docs/coins-and-collection.md - Collection sequence
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Fly toward camera with slight upward arc
   * - Z +1.5 (toward camera in AR space)
   * - Y +0.3 (slight upward movement)
   * - Ease in for acceleration effect
   */
  flyForward: {
    properties: {
      positionZ: `+=${ANIMATION_VALUES.FLY_FORWARD_Z}`,
      positionY: `+=${ANIMATION_VALUES.FLY_UP_Y}`,
    },
    duration: ANIMATION_TIMING.FLY_DURATION,
    easing: 'EaseIn',
  },

  /**
   * Rapid double spin (shows both sides of coin)
   * - 720° rotation (two full spins)
   * - Fast duration for exciting effect
   */
  spinFast: {
    properties: { rotateY: `+=${ANIMATION_VALUES.DOUBLE_ROTATION}` },
    duration: ANIMATION_TIMING.FAST_SPIN_DURATION,
    easing: 'Linear',
  },

  /**
   * Shrink down to tiny size
   * - Scale to 0.05 (5% of original size)
   * - Delayed start (after fly + spin complete)
   */
  shrink: {
    properties: {
      scaleX: ANIMATION_VALUES.SHRINK_SCALE,
      scaleY: ANIMATION_VALUES.SHRINK_SCALE,
      scaleZ: ANIMATION_VALUES.SHRINK_SCALE,
    },
    duration: ANIMATION_TIMING.SHRINK_DURATION,
    delay: ANIMATION_TIMING.SHRINK_DELAY,
    easing: 'EaseIn',
  },

  /**
   * Fade to invisible
   * - Opacity to 0
   * - Delayed to start after shrink begins
   */
  fadeOut: {
    properties: { opacity: 0 },
    duration: ANIMATION_TIMING.FADE_DURATION,
    delay: ANIMATION_TIMING.FADE_DELAY,
    easing: 'EaseIn',
  },

  /**
   * Complete collection animation sequence
   * Chain: [flyForward + spinFast] parallel, then shrink, then fadeOut
   *
   * Visual sequence:
   * 1. Coin flies toward player while spinning rapidly (0-400ms)
   * 2. Coin shrinks down (400-700ms)
   * 3. Coin fades out (500-700ms)
   * Total duration: ~700ms
   */
  coinCollect: [['flyForward', 'spinFast'], ['shrink'], ['fadeOut']],

  // ═════════════════════════════════════════════════════════════════════════
  // PULSE EFFECTS
  // Used for targeting/hover states and special effects
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Pulse up (scale increase)
   * - Scale to 1.1 (10% larger)
   * - Quick ease out for "pop" effect
   */
  pulseUp: {
    properties: {
      scaleX: ANIMATION_VALUES.PULSE_SCALE,
      scaleY: ANIMATION_VALUES.PULSE_SCALE,
      scaleZ: ANIMATION_VALUES.PULSE_SCALE,
    },
    duration: ANIMATION_TIMING.PULSE_DURATION,
    easing: 'EaseOut',
  },

  /**
   * Pulse down (scale decrease back to normal)
   * - Scale back to 1.0
   * - Ease in for settling effect
   */
  pulseDown: {
    properties: {
      scaleX: ANIMATION_VALUES.NORMAL_SCALE,
      scaleY: ANIMATION_VALUES.NORMAL_SCALE,
      scaleZ: ANIMATION_VALUES.NORMAL_SCALE,
    },
    duration: ANIMATION_TIMING.PULSE_DURATION,
    easing: 'EaseIn',
  },

  /**
   * Complete pulse cycle (up then down)
   * Used when crosshairs hover over coin
   */
  coinPulse: [['pulseUp', 'pulseDown']],

  // ═════════════════════════════════════════════════════════════════════════
  // LOCKED COIN ANIMATIONS
  // For coins above the player's find limit
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Slower, larger pulse for locked coins
   * - Scale to 1.15 (15% larger)
   * - Slower timing feels more "forbidden"
   */
  lockedPulseUp: {
    properties: {
      scaleX: ANIMATION_VALUES.LOCKED_PULSE_SCALE,
      scaleY: ANIMATION_VALUES.LOCKED_PULSE_SCALE,
      scaleZ: ANIMATION_VALUES.LOCKED_PULSE_SCALE,
    },
    duration: ANIMATION_TIMING.LOCKED_PULSE_DURATION / 2,
    easing: 'EaseOut',
  },

  lockedPulseDown: {
    properties: {
      scaleX: ANIMATION_VALUES.NORMAL_SCALE,
      scaleY: ANIMATION_VALUES.NORMAL_SCALE,
      scaleZ: ANIMATION_VALUES.NORMAL_SCALE,
    },
    duration: ANIMATION_TIMING.LOCKED_PULSE_DURATION / 2,
    easing: 'EaseIn',
  },

  /**
   * Complete locked pulse cycle
   * Slower, more dramatic pulse for locked coins
   */
  lockedPulse: [['lockedPulseUp', 'lockedPulseDown']],

  /**
   * Locked coin idle (spin + locked pulse)
   * Different feel from normal idle to indicate "locked" state
   */
  coinLockedIdle: [['spinCoin'], ['lockedPulse']],

  // ═════════════════════════════════════════════════════════════════════════
  // APPEAR/SPAWN ANIMATIONS
  // For coins appearing in the AR view (entering visibility range)
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Scale up from tiny to normal
   * - Start at 0.01 scale
   * - Grow to full size with bounce effect
   */
  scaleUp: {
    properties: {
      scaleX: ANIMATION_VALUES.NORMAL_SCALE,
      scaleY: ANIMATION_VALUES.NORMAL_SCALE,
      scaleZ: ANIMATION_VALUES.NORMAL_SCALE,
    },
    duration: ANIMATION_TIMING.APPEAR_DURATION,
    easing: 'Bounce',
  },

  /**
   * Fade in from invisible
   * - Opacity from 0 to 1
   */
  fadeIn: {
    properties: { opacity: 1 },
    duration: ANIMATION_TIMING.APPEAR_DURATION,
    easing: 'EaseOut',
  },

  /**
   * Complete appear animation
   * Coin pops into existence with a bounce
   */
  coinAppear: [['scaleUp', 'fadeIn']],

  // ═════════════════════════════════════════════════════════════════════════
  // SHIMMER/SPARKLE ANIMATIONS
  // For particle effects and highlights
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Quick flash effect (for sparkle particles)
   */
  sparkleFlash: {
    properties: { opacity: 0 },
    duration: 200,
    easing: 'Linear',
  },

  /**
   * Orbit animation for particles around coin
   * - Full 360° rotation
   * - Slightly faster than coin spin
   */
  particleOrbit: {
    properties: { rotateY: '+=360' },
    duration: 1500,
    easing: 'Linear',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // VALUE POPUP ANIMATIONS
  // For the "$5.00" text that appears after collection
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Float upward (for value text after collection)
   */
  floatUp: {
    properties: { positionY: '+=0.5' },
    duration: 800,
    easing: 'EaseOut',
  },

  /**
   * Fade out slowly (for value text)
   */
  valueFadeOut: {
    properties: { opacity: 0 },
    duration: 600,
    delay: 400,
    easing: 'EaseIn',
  },

  /**
   * Complete value popup animation
   * Text floats up while fading
   */
  valuePopup: [['floatUp', 'valueFadeOut']],
});

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION HELPER CONSTANTS
// For use in components to reference animations by name
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Animation name constants for type-safe references
 *
 * @example
 * ```tsx
 * <Viro3DObject
 *   animation={{
 *     name: ANIMATIONS.COIN_IDLE,
 *     run: true,
 *     loop: true,
 *   }}
 * />
 * ```
 */
export const ANIMATIONS = {
  // Idle animations
  SPIN_COIN: 'spinCoin',
  BOB_UP: 'bobUp',
  BOB_DOWN: 'bobDown',
  COIN_FLOAT: 'coinFloat',
  COIN_IDLE: 'coinIdle',

  // Collection animations
  FLY_FORWARD: 'flyForward',
  SPIN_FAST: 'spinFast',
  SHRINK: 'shrink',
  FADE_OUT: 'fadeOut',
  COIN_COLLECT: 'coinCollect',

  // Pulse animations
  PULSE_UP: 'pulseUp',
  PULSE_DOWN: 'pulseDown',
  COIN_PULSE: 'coinPulse',

  // Locked coin animations
  LOCKED_PULSE_UP: 'lockedPulseUp',
  LOCKED_PULSE_DOWN: 'lockedPulseDown',
  LOCKED_PULSE: 'lockedPulse',
  COIN_LOCKED_IDLE: 'coinLockedIdle',

  // Appear animations
  SCALE_UP: 'scaleUp',
  FADE_IN: 'fadeIn',
  COIN_APPEAR: 'coinAppear',

  // Sparkle animations
  SPARKLE_FLASH: 'sparkleFlash',
  PARTICLE_ORBIT: 'particleOrbit',

  // Value popup animations
  FLOAT_UP: 'floatUp',
  VALUE_FADE_OUT: 'valueFadeOut',
  VALUE_POPUP: 'valuePopup',
} as const;

/**
 * Animation durations for external timing calculations
 * Useful for knowing when animations complete
 */
export const ANIMATION_DURATIONS = {
  /** Total duration of idle animation loop */
  IDLE_LOOP: ANIMATION_TIMING.SPIN_DURATION, // Spin is longest

  /** Total duration of collection animation */
  COLLECT_TOTAL: ANIMATION_TIMING.FADE_DELAY + ANIMATION_TIMING.FADE_DURATION, // ~700ms

  /** Total duration of appear animation */
  APPEAR_TOTAL: ANIMATION_TIMING.APPEAR_DURATION,

  /** Total duration of pulse animation */
  PULSE_TOTAL: ANIMATION_TIMING.PULSE_DURATION * 2,

  /** Total duration of value popup animation */
  VALUE_POPUP_TOTAL: 1000, // floatUp duration + buffer
} as const;

// Type exports for TypeScript
export type AnimationName = (typeof ANIMATIONS)[keyof typeof ANIMATIONS];

