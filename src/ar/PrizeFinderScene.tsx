// PrizeFinderScene - Main AR scene for Black Bart's Gold
// Contains the AR camera view with coins, lighting, and effects
//
// Reference: docs/BUILD-GUIDE.md - Sprint 2.4: Test Coins in AR
// Reference: project-vision.md - AR Implementation section

import React, { useState, useCallback, useEffect } from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroText,
  ViroTrackingReason,
  ViroTrackingStateConstants,
} from '@reactvision/react-viro';
import { CoinObject, ValuePopup } from './CoinObject';
import { useAppStore } from '../store';
import type { CoinType, CoinTier, ARTrackingState } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Test coin data structure
 */
interface TestCoin {
  id: string;
  position: [number, number, number];
  value: number | null;
  coinType: CoinType;
  tier?: CoinTier;
  isLocked?: boolean;
}

/**
 * Value popup data for showing collected value
 */
interface ValuePopupData {
  id: string;
  value: number;
  position: [number, number, number];
}

/**
 * Props passed from ViroARSceneNavigator
 */
interface PrizeFinderSceneProps {
  sceneNavigator?: {
    viroAppProps?: {
      onTrackingStateChange?: (state: ARTrackingState) => void;
      onCoinCollected?: (coinId: string, value: number) => void;
      onCoinHovered?: (coinId: string | null) => void;
    };
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST COIN DATA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initial test coins for development
 * These are hardcoded positions in AR space (meters from user)
 *
 * AR Coordinate System:
 * - X: Left(-) / Right(+)
 * - Y: Down(-) / Up(+)
 * - Z: Behind(+) / In Front(-)
 */
const INITIAL_TEST_COINS: TestCoin[] = [
  {
    // Coin 1: Directly in front, at eye level
    id: 'test-coin-1',
    position: [0, 0, -2],
    value: 1.0,
    coinType: 'fixed',
  },
  {
    // Coin 2: To the left, slightly lower
    id: 'test-coin-2',
    position: [-1, -0.3, -3],
    value: 5.0,
    coinType: 'fixed',
  },
  {
    // Coin 3: To the right, slightly higher - mystery pool coin
    id: 'test-coin-3',
    position: [1, 0.5, -2.5],
    value: null, // Pool coin - value determined at collection
    coinType: 'pool',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * PrizeFinderScene - The main AR scene for treasure hunting
 *
 * Features:
 * - AR camera with tracking state detection
 * - Test coins at various positions
 * - Lighting for coin visibility
 * - Coin collection with animation
 * - Value popup after collection
 * - Hover tracking for crosshairs
 *
 * @example
 * ```tsx
 * <ViroARSceneNavigator
 *   initialScene={{ scene: PrizeFinderScene }}
 *   viroAppProps={{
 *     onTrackingStateChange: (state) => console.log('Tracking:', state),
 *     onCoinCollected: (id, value) => console.log(`Collected $${value}`),
 *   }}
 * />
 * ```
 */
export const PrizeFinderScene: React.FC<PrizeFinderSceneProps> = (props) => {
  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────

  // Tracking state for AR - default to NORMAL since if we get here, AR is working
  const [trackingState, setTrackingState] = useState<ARTrackingState>('NORMAL');
  const [trackingMessage, setTrackingMessage] = useState('');

  // Coins currently visible in the scene
  const [coins, setCoins] = useState<TestCoin[]>(INITIAL_TEST_COINS);

  // Currently hovered coin (for crosshairs)
  const [hoveredCoinId, setHoveredCoinId] = useState<string | null>(null);

  // Value popups to display (after collection)
  const [valuePopups, setValuePopups] = useState<ValuePopupData[]>([]);

  // Coins currently being collected (for animation)
  const [collectingCoinIds, setCollectingCoinIds] = useState<Set<string>>(new Set());

  // App store for global state
  const setAppTrackingState = useAppStore((state) => state.setTrackingState);

  // ─────────────────────────────────────────────────────────────────────────
  // CALLBACKS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Handle AR tracking state updates
   */
  const handleTrackingUpdated = useCallback(
    (state: number, reason: ViroTrackingReason) => {
      let newState: ARTrackingState;
      let message: string;

      if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
        newState = 'NORMAL';
        message = 'AR Ready - Prize Finder Active!';
      } else if (state === ViroTrackingStateConstants.TRACKING_LIMITED) {
        newState = 'LIMITED';
        message = 'AR Limited - Move to better area';
      } else {
        newState = 'UNAVAILABLE';
        message = 'AR Unavailable';
      }

      setTrackingState(newState);
      setTrackingMessage(message);

      // Update global store
      setAppTrackingState(newState);

      // Notify parent component
      props.sceneNavigator?.viroAppProps?.onTrackingStateChange?.(newState);

      console.log(`[PrizeFinderScene] Tracking: ${newState} - ${message}`);
    },
    [setAppTrackingState, props.sceneNavigator?.viroAppProps]
  );

  /**
   * Handle coin collection
   */
  const handleCoinCollect = useCallback(
    (coinId: string) => {
      console.log(`[PrizeFinderScene] Collecting coin: ${coinId}`);

      // Find the coin
      const coin = coins.find((c) => c.id === coinId);
      if (!coin) {
        console.warn(`[PrizeFinderScene] Coin not found: ${coinId}`);
        return;
      }

      // Mark as collecting (for animation)
      setCollectingCoinIds((prev) => new Set(prev).add(coinId));

      // For pool coins, generate a random value (in real app, this comes from server)
      const collectedValue = coin.value ?? Math.floor(Math.random() * 10) + 1;

      console.log(`[PrizeFinderScene] Coin ${coinId} value: $${collectedValue.toFixed(2)}`);

      // Notify parent
      props.sceneNavigator?.viroAppProps?.onCoinCollected?.(coinId, collectedValue);

      // Add value popup at coin's position (slightly above)
      setValuePopups((prev) => [
        ...prev,
        {
          id: `popup-${coinId}`,
          value: collectedValue,
          position: [coin.position[0], coin.position[1] + 0.2, coin.position[2]],
        },
      ]);
    },
    [coins, props.sceneNavigator?.viroAppProps]
  );

  /**
   * Handle collection animation complete - remove coin from scene
   */
  const handleCollectAnimationComplete = useCallback((coinId: string) => {
    console.log(`[PrizeFinderScene] Removing coin from scene: ${coinId}`);

    // Remove from coins array
    setCoins((prev) => prev.filter((c) => c.id !== coinId));

    // Remove from collecting set
    setCollectingCoinIds((prev) => {
      const next = new Set(prev);
      next.delete(coinId);
      return next;
    });
  }, []);

  /**
   * Handle coin hover (for crosshairs)
   */
  const handleCoinHover = useCallback(
    (coinId: string, isHovering: boolean) => {
      const newHoveredId = isHovering ? coinId : null;
      setHoveredCoinId(newHoveredId);

      // Notify parent
      props.sceneNavigator?.viroAppProps?.onCoinHovered?.(newHoveredId);
    },
    [props.sceneNavigator?.viroAppProps]
  );

  /**
   * Handle value popup complete - remove from scene
   */
  const handleValuePopupComplete = useCallback((popupId: string) => {
    setValuePopups((prev) => prev.filter((p) => p.id !== popupId));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────

  // Log when coins change
  useEffect(() => {
    console.log(`[PrizeFinderScene] Coins in scene: ${coins.length}`);
  }, [coins.length]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <ViroARScene onTrackingUpdated={handleTrackingUpdated}>
      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* LIGHTING */}
      {/* ───────────────────────────────────────────────────────────────────── */}

      {/* Ambient light for base visibility */}
      <ViroAmbientLight color="#FFFFFF" intensity={500} />

      {/* Directional light for shadows and depth */}
      <ViroDirectionalLight
        color="#FFFFFF"
        direction={[0, -1, -0.5]}
        intensity={800}
        castsShadow={true}
        shadowOrthographicPosition={[0, 3, -2]}
        shadowOrthographicSize={5}
        shadowNearZ={1}
        shadowFarZ={5}
        shadowMapSize={1024}
        shadowOpacity={0.5}
      />

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TRACKING STATUS TEXT (only shown when not tracking normally) */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {trackingState !== 'NORMAL' && (
        <ViroText
          text={trackingMessage}
          scale={[0.3, 0.3, 0.3]}
          position={[0, 0.5, -1.5]}
          style={{
            fontFamily: 'Arial',
            fontSize: 20,
            fontWeight: 'bold',
            color: trackingState === 'LIMITED' ? '#FFD700' : '#FF6B6B',
            textAlign: 'center',
            textAlignVertical: 'center',
          }}
          transformBehaviors={['billboard']}
        />
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* COINS */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {coins.map((coin) => (
        <CoinObject
          key={coin.id}
          id={coin.id}
          position={coin.position}
          value={coin.value}
          coinType={coin.coinType}
          tier={coin.tier}
          isLocked={coin.isLocked}
          isInRange={true} // For testing, all coins are in range
          onCollect={handleCoinCollect}
          onHover={handleCoinHover}
          onCollectAnimationComplete={handleCollectAnimationComplete}
          showParticles={true}
        />
      ))}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* VALUE POPUPS */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {valuePopups.map((popup) => (
        <ValuePopup
          key={popup.id}
          value={popup.value}
          position={popup.position}
          onComplete={() => handleValuePopupComplete(popup.id)}
        />
      ))}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* COIN COUNT INDICATOR (for testing) */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {trackingState === 'NORMAL' && (
        <ViroText
          text={`🪙 ${coins.length} coins nearby`}
          scale={[0.15, 0.15, 0.15]}
          position={[0, -0.8, -1.5]}
          style={{
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#FFFFFF',
            textAlign: 'center',
            textAlignVertical: 'center',
          }}
          transformBehaviors={['billboard']}
        />
      )}
    </ViroARScene>
  );
};

export default PrizeFinderScene;

