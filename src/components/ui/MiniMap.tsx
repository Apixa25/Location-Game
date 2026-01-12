// MiniMap Component for Black Bart's Gold
// Radar-style mini map showing nearby coins
//
// Reference: docs/prize-finder-details.md - HUD Layout
// Reference: docs/BUILD-GUIDE.md - Sprint 2.5

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Coordinates } from '../../types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface MiniMapCoin {
  id: string;
  position: Coordinates;
  coinType: 'fixed' | 'pool';
  isLocked?: boolean;
}

export interface MiniMapProps {
  /** Player's current position */
  playerPosition: Coordinates | null;

  /** Array of nearby coins to display */
  coins: MiniMapCoin[];

  /** Currently selected coin ID */
  selectedCoinId?: string | null;

  /** Callback when map is tapped (to expand to full map) */
  onPress?: () => void;

  /** Size of the mini map (default 80) */
  size?: number;

  /** Visible radius in meters (default 100) */
  radiusMeters?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PLAYER_DOT_SIZE = 8;
const COIN_DOT_SIZE = 6;
const SELECTED_DOT_SIZE = 10;

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate relative position of coin from player
 * Returns normalized position (-1 to 1) based on radius
 */
function calculateRelativePosition(
  playerPos: Coordinates,
  coinPos: Coordinates,
  radiusMeters: number
): { x: number; y: number; distance: number } {
  // Approximate meters per degree at equator (simplified)
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320 * Math.cos((playerPos.latitude * Math.PI) / 180);

  const dLat = coinPos.latitude - playerPos.latitude;
  const dLng = coinPos.longitude - playerPos.longitude;

  const dx = dLng * metersPerDegreeLng;
  const dy = dLat * metersPerDegreeLat;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Normalize to -1 to 1 based on radius
  const normalizedX = Math.max(-1, Math.min(1, dx / radiusMeters));
  const normalizedY = Math.max(-1, Math.min(1, dy / radiusMeters));

  return { x: normalizedX, y: -normalizedY, distance }; // Flip Y for screen coords
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * MiniMap - Radar-style mini map showing nearby coins
 *
 * Features:
 * - Shows player position at center
 * - Displays nearby coins as dots
 * - Different colors for fixed/pool/locked coins
 * - Selected coin highlighted
 * - Tap to expand to full map
 *
 * @example
 * ```tsx
 * <MiniMap
 *   playerPosition={{ latitude: 37.7749, longitude: -122.4194 }}
 *   coins={nearbyCoins}
 *   selectedCoinId="coin-123"
 *   onPress={() => navigation.navigate('Map')}
 * />
 * ```
 */
export const MiniMap: React.FC<MiniMapProps> = ({
  playerPosition,
  coins,
  selectedCoinId,
  onPress,
  size = 80,
  radiusMeters = 100,
}) => {
  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Calculate coin positions on the mini map
   */
  const coinPositions = useMemo(() => {
    if (!playerPosition) return [];

    return coins.map((coin) => {
      const { x, y, distance } = calculateRelativePosition(
        playerPosition,
        coin.position,
        radiusMeters
      );

      // Convert normalized position to screen position
      const mapRadius = (size - 20) / 2; // Leave some padding
      const screenX = size / 2 + x * mapRadius;
      const screenY = size / 2 + y * mapRadius;

      return {
        ...coin,
        screenX,
        screenY,
        distance,
        isSelected: coin.id === selectedCoinId,
      };
    });
  }, [playerPosition, coins, selectedCoinId, size, radiusMeters]);

  /**
   * Dynamic styles based on size
   */
  const dynamicStyles = useMemo(
    () => ({
      container: {
        width: size,
        height: size,
        borderRadius: size / 2,
      },
    }),
    [size]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <TouchableOpacity
      style={[styles.container, dynamicStyles.container]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Radar circles */}
      <View style={[styles.radarCircle, styles.radarCircleOuter, { width: size - 10, height: size - 10, borderRadius: (size - 10) / 2 }]} />
      <View style={[styles.radarCircle, styles.radarCircleMiddle, { width: size - 30, height: size - 30, borderRadius: (size - 30) / 2 }]} />
      <View style={[styles.radarCircle, styles.radarCircleInner, { width: size - 50, height: size - 50, borderRadius: (size - 50) / 2 }]} />

      {/* Coin dots */}
      {coinPositions.map((coin) => {
        const dotSize = coin.isSelected ? SELECTED_DOT_SIZE : COIN_DOT_SIZE;
        const dotColor = coin.isLocked
          ? '#EF4444' // Red for locked
          : coin.coinType === 'pool'
          ? '#C0C0C0' // Silver for pool
          : '#FFD700'; // Gold for fixed

        return (
          <View
            key={coin.id}
            style={[
              styles.coinDot,
              {
                left: coin.screenX - dotSize / 2,
                top: coin.screenY - dotSize / 2,
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: dotColor,
              },
              coin.isSelected && styles.coinDotSelected,
            ]}
          />
        );
      })}

      {/* Player dot (always center) */}
      <View style={styles.playerDot} />

      {/* Coin count label */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>{coins.length}</Text>
      </View>

      {/* Expand icon */}
      {onPress && (
        <View style={styles.expandIcon}>
          <Text style={styles.expandIconText}>⤢</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    overflow: 'hidden',
  },
  radarCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  radarCircleOuter: {
    borderColor: 'rgba(255, 215, 0, 0.15)',
  },
  radarCircleMiddle: {
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  radarCircleInner: {
    borderColor: 'rgba(255, 215, 0, 0.25)',
  },
  playerDot: {
    width: PLAYER_DOT_SIZE,
    height: PLAYER_DOT_SIZE,
    borderRadius: PLAYER_DOT_SIZE / 2,
    backgroundColor: '#4ADE80',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  coinDot: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  coinDotSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  countContainer: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countText: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  expandIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  expandIconText: {
    fontSize: 12,
    color: '#8B9DC3',
  },
});

export default MiniMap;

