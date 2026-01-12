// CoinObject Component for Black Bart's Gold
// Renders a 3D coin in the AR scene with animations and effects
//
// Reference: docs/BUILD-GUIDE.md - Sprint 2.3: Coin 3D Component
// Reference: docs/coins-and-collection.md - Coin visual design

import React, { useState, useCallback, useMemo } from 'react';
import {
  ViroNode,
  ViroBox,
  ViroText,
  // ViroParticleEmitter, // TODO: Enable when particle texture is added
  ViroMaterials,
  ViroSound,
} from '@reactvision/react-viro';
import { ANIMATIONS } from './animations';
import type { CoinType, CoinTier } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// SOUND CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sound file paths
 * Note: These are placeholder paths - actual audio files need to be added
 * TODO: Add actual audio files to assets/audio/ folder
 */
// Sound files temporarily disabled until audio assets are added
// const SOUNDS = {
//   // Collection sound - coin pickup
//   collect: require('../../assets/audio/coin-collect.mp3'),
//   // Black Bart congratulation
//   congratulate: require('../../assets/audio/blackbart-congrats.mp3'),
//   // Locked coin error sound
//   locked: require('../../assets/audio/coin-locked.mp3'),
// };

// Placeholder for when sounds are disabled
const SOUNDS: Record<string, any> = {};

// Flag to disable sounds if assets are missing (for development)
const SOUNDS_ENABLED = false; // Set to true when audio files are added

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Props for the CoinObject component
 */
export interface CoinObjectProps {
  /** Unique identifier for this coin */
  id: string;

  /** Position in AR world [x, y, z] */
  position: [number, number, number];

  /** Value in BBG dollars (null for undetermined pool coins) */
  value: number | null;

  /** Type of coin - 'fixed' shows exact value, 'pool' shows mystery */
  coinType: CoinType;

  /** Current tier for multi-find coins */
  tier?: CoinTier;

  /** Whether this coin is above player's find limit */
  isLocked?: boolean;

  /** Whether this coin is within collection range */
  isInRange?: boolean;

  /** Callback when coin is collected */
  onCollect: (coinId: string) => void;

  /** Callback when hover state changes */
  onHover?: (coinId: string, isHovering: boolean) => void;

  /** Callback when collection animation finishes */
  onCollectAnimationComplete?: (coinId: string) => void;

  /** Optional scale multiplier (default 1.0) */
  scale?: number;

  /** Whether to show sparkle particles (default true) */
  showParticles?: boolean;
}

/**
 * Internal animation state
 */
type AnimationState = 'idle' | 'collecting' | 'locked' | 'appearing';

// ═══════════════════════════════════════════════════════════════════════════
// MATERIALS REGISTRATION
// ═══════════════════════════════════════════════════════════════════════════

// Register materials for different coin states
ViroMaterials.createMaterials({
  // Gold material for fixed-value coins
  goldCoin: {
    diffuseColor: '#FFD700',
    shininess: 0.8,
    lightingModel: 'Blinn',
  },

  // Silver material for pool coins (mystery value)
  silverCoin: {
    diffuseColor: '#C0C0C0',
    shininess: 0.9,
    lightingModel: 'Blinn',
  },

  // Bronze material for third-tier multi-find
  bronzeCoin: {
    diffuseColor: '#CD7F32',
    shininess: 0.6,
    lightingModel: 'Blinn',
  },

  // Locked coin material (darker, red tint)
  lockedCoin: {
    diffuseColor: '#8B4513',
    shininess: 0.4,
    lightingModel: 'Blinn',
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/** Default coin dimensions (will be replaced with 3D model) */
const COIN_SIZE = {
  width: 0.15,
  height: 0.02,
  length: 0.15,
};

/** Value label offset above coin */
const LABEL_Y_OFFSET = 0.15;

/*
 * TODO: Enable particles when texture is added to assets/images/sparkle.png
 * 
 * const SPARKLE_CONFIG = {
 *   duration: 2000,
 *   loop: true,
 *   delay: 0,
 *   image: {
 *     source: require('../../assets/images/sparkle.png'),
 *     height: 0.02,
 *     width: 0.02,
 *     bloomThreshold: 0.5,
 *   },
 *   spawnBehavior: {
 *     emissionRatePerSecond: [8, 12],
 *     maxParticles: 20,
 *     particleLifetime: [1000, 2000],
 *     spawnVolume: { shape: 'sphere', params: [0.1], spawnOnSurface: true },
 *   },
 *   particleAppearance: {
 *     opacity: { initialRange: [0.6, 1.0], interpolation: [{ endValue: 0, interval: [0.8, 1.0] }] },
 *     scale: { initialRange: [[0.5, 0.5, 0.5], [1.0, 1.0, 1.0]] },
 *     color: { initialRange: ['#FFD700', '#FFFF00'] },
 *   },
 *   particlePhysics: { velocity: { initialRange: [[-0.02, 0.05, -0.02], [0.02, 0.1, 0.02]] } },
 * };
 */

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CoinObject - A 3D coin that renders in the AR scene
 *
 * Features:
 * - Spinning idle animation
 * - Gentle bobbing motion
 * - Sparkle particle effects
 * - Value label (fixed coins show value, pool coins show "?")
 * - Collection animation on tap
 * - Different appearance for locked coins (above find limit)
 * - Different materials for gold (fixed), silver (pool), bronze (tier 3)
 *
 * @example
 * ```tsx
 * <CoinObject
 *   id="coin-123"
 *   position={[0, 0, -2]}
 *   value={5.00}
 *   coinType="fixed"
 *   onCollect={(id) => console.log(`Collected coin ${id}`)}
 * />
 * ```
 */
export const CoinObject: React.FC<CoinObjectProps> = ({
  id,
  position,
  value,
  coinType,
  tier = null,
  isLocked = false,
  isInRange = true,
  onCollect,
  onHover,
  onCollectAnimationComplete,
  scale = 1.0,
  showParticles: _showParticles = true, // TODO: Use when particles enabled
}) => {
  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────

  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [isHovering, setIsHovering] = useState(false);
  const [playCollectSound, setPlayCollectSound] = useState(false);
  const [playLockedSound, setPlayLockedSound] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Determine which material to use based on coin state
   */
  const coinMaterial = useMemo(() => {
    if (isLocked) return 'lockedCoin';
    if (tier === 'bronze') return 'bronzeCoin';
    if (coinType === 'pool') return 'silverCoin';
    return 'goldCoin';
  }, [isLocked, tier, coinType]);

  /**
   * Format the value label text
   * - Fixed coins: Show exact value (e.g., "$5.00")
   * - Pool coins: Show mystery (e.g., "?")
   * - Locked coins: Show lock icon
   */
  const valueLabelText = useMemo(() => {
    if (isLocked) return '🔒';
    if (coinType === 'pool' || value === null) return '?';
    return `$${value.toFixed(2)}`;
  }, [isLocked, coinType, value]);

  /**
   * Value label color based on state
   */
  const valueLabelColor = useMemo(() => {
    if (isLocked) return '#FF6B6B'; // Red for locked
    if (coinType === 'pool') return '#C0C0C0'; // Silver for mystery
    if (tier === 'gold') return '#FFD700'; // Gold
    if (tier === 'silver') return '#C0C0C0'; // Silver
    if (tier === 'bronze') return '#CD7F32'; // Bronze
    return '#FFD700'; // Default gold
  }, [isLocked, coinType, tier]);

  /**
   * Get current animation name based on state
   */
  const currentAnimation = useMemo(() => {
    switch (animationState) {
      case 'collecting':
        return ANIMATIONS.COIN_COLLECT;
      case 'locked':
        return ANIMATIONS.COIN_LOCKED_IDLE;
      case 'appearing':
        return ANIMATIONS.COIN_APPEAR;
      case 'idle':
      default:
        return isHovering ? ANIMATIONS.COIN_PULSE : ANIMATIONS.COIN_IDLE;
    }
  }, [animationState, isHovering]);

  /**
   * Whether animation should loop
   */
  const shouldLoop = animationState === 'idle' || animationState === 'locked';

  /**
   * Scaled coin size
   */
  const scaledSize: [number, number, number] = useMemo(
    () => [
      COIN_SIZE.width * scale,
      COIN_SIZE.height * scale,
      COIN_SIZE.length * scale,
    ],
    [scale]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Handle coin click/tap
   */
  const handleClick = useCallback(() => {
    // Don't allow collection if already collecting
    if (animationState === 'collecting') return;

    // Don't allow collection if locked (show popup instead)
    if (isLocked) {
      console.log(`[CoinObject] Coin ${id} is locked (above find limit)`);
      // Play locked sound
      if (SOUNDS_ENABLED) {
        setPlayLockedSound(true);
        setTimeout(() => setPlayLockedSound(false), 1000);
      }
      // The parent component should show the FindLimitPopup
      return;
    }

    // Don't allow collection if out of range
    if (!isInRange) {
      console.log(`[CoinObject] Coin ${id} is out of range`);
      return;
    }

    console.log(`[CoinObject] Starting collection for coin ${id}`);
    setAnimationState('collecting');

    // Play collection sound
    if (SOUNDS_ENABLED) {
      setPlayCollectSound(true);
    }

    // Notify parent
    onCollect(id);
  }, [animationState, isLocked, isInRange, id, onCollect]);

  /**
   * Handle hover enter
   */
  const handleHoverEnter = useCallback(() => {
    if (animationState !== 'collecting') {
      setIsHovering(true);
      onHover?.(id, true);
    }
  }, [animationState, id, onHover]);

  /**
   * Handle hover exit
   */
  const handleHoverExit = useCallback(() => {
    setIsHovering(false);
    onHover?.(id, false);
  }, [id, onHover]);

  /**
   * Handle animation completion
   */
  const handleAnimationFinish = useCallback(() => {
    if (animationState === 'collecting') {
      console.log(`[CoinObject] Collection animation complete for coin ${id}`);
      onCollectAnimationComplete?.(id);
    } else if (animationState === 'appearing') {
      // After appear animation, switch to idle
      setAnimationState(isLocked ? 'locked' : 'idle');
    }
  }, [animationState, id, isLocked, onCollectAnimationComplete]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <ViroNode position={position}>
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* COIN 3D MODEL (using ViroBox as placeholder) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <ViroBox
        height={scaledSize[1]}
        width={scaledSize[0]}
        length={scaledSize[2]}
        position={[0, 0, 0]}
        materials={[coinMaterial]}
        animation={{
          name: currentAnimation,
          run: true,
          loop: shouldLoop,
          onFinish: handleAnimationFinish,
        }}
        onClick={handleClick}
        onHover={(isHover) => (isHover ? handleHoverEnter() : handleHoverExit())}
        opacity={animationState === 'collecting' ? undefined : 1.0}
      />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VALUE LABEL (billboard - always faces camera) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <ViroText
        text={valueLabelText}
        position={[0, LABEL_Y_OFFSET * scale, 0]}
        scale={[0.15 * scale, 0.15 * scale, 0.15 * scale]}
        style={{
          fontFamily: 'Arial',
          fontSize: 30,
          fontWeight: 'bold',
          color: valueLabelColor,
          textAlign: 'center',
          textAlignVertical: 'center',
        }}
        transformBehaviors={['billboard']} // Always face camera
        // Hide label during collection animation
        visible={animationState !== 'collecting'}
      />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SPARKLE PARTICLES */}
      {/* TODO: Enable when particle texture is added to assets/images/sparkle.png */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 
      {PARTICLES_ENABLED && showParticles && animationState !== 'collecting' && (
        <ViroParticleEmitter
          position={[0, 0, 0]}
          duration={SPARKLE_CONFIG.duration}
          loop={SPARKLE_CONFIG.loop}
          delay={SPARKLE_CONFIG.delay}
          run={true}
          image={{
            source: require('../../assets/images/sparkle.png'),
            height: SPARKLE_CONFIG.image.height * scale,
            width: SPARKLE_CONFIG.image.width * scale,
            bloomThreshold: SPARKLE_CONFIG.image.bloomThreshold,
          }}
          spawnBehavior={{
            ...SPARKLE_CONFIG.spawnBehavior,
            emissionRatePerSecond: isLocked
              ? [4, 6]
              : SPARKLE_CONFIG.spawnBehavior.emissionRatePerSecond,
          }}
          particleAppearance={{
            ...SPARKLE_CONFIG.particleAppearance,
            color: {
              initialRange: isLocked
                ? ['#FF6B6B', '#FF4444']
                : coinType === 'pool'
                ? ['#C0C0C0', '#FFFFFF']
                : ['#FFD700', '#FFFF00'],
            },
          }}
          particlePhysics={SPARKLE_CONFIG.particlePhysics}
        />
      )}
      */}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* SOUND EFFECTS */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {SOUNDS_ENABLED && playCollectSound && (
        <ViroSound
          source={SOUNDS.collect}
          paused={false}
          loop={false}
          volume={1.0}
          onFinish={() => setPlayCollectSound(false)}
        />
      )}

      {SOUNDS_ENABLED && playLockedSound && (
        <ViroSound
          source={SOUNDS.locked}
          paused={false}
          loop={false}
          volume={0.8}
          onFinish={() => setPlayLockedSound(false)}
        />
      )}
    </ViroNode>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Value popup that appears after collection
 * Shows the collected value floating upward
 */
export interface ValuePopupProps {
  value: number;
  position: [number, number, number];
  onComplete?: () => void;
}

export const ValuePopup: React.FC<ValuePopupProps> = ({
  value,
  position,
  onComplete,
}) => {
  return (
    <ViroText
      text={`+$${value.toFixed(2)}`}
      position={position}
      scale={[0.2, 0.2, 0.2]}
      style={{
        fontFamily: 'Arial',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#4ADE80', // Green for positive value
        textAlign: 'center',
        textAlignVertical: 'center',
      }}
      transformBehaviors={['billboard']}
      animation={{
        name: ANIMATIONS.VALUE_POPUP,
        run: true,
        loop: false,
        onFinish: onComplete,
      }}
    />
  );
};

export default CoinObject;

