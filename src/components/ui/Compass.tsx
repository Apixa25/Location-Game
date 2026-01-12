// Compass Component for Black Bart's Gold
// Shows direction indicator pointing to selected coin or nearest treasure
//
// Reference: docs/prize-finder-details.md - HUD Layout
// Reference: docs/BUILD-GUIDE.md - Sprint 2.5

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CompassProps {
  /** Direction to target in degrees (0 = North, 90 = East, etc.) */
  direction: number | null;

  /** Distance to target in meters */
  distance?: number | null;

  /** Whether a coin is currently targeted */
  hasTarget?: boolean;

  /** Callback when compass is tapped (for expanding) */
  onPress?: () => void;

  /** Size of the compass (default 60) */
  size?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const CARDINAL_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Compass - Shows direction to target coin
 *
 * Features:
 * - Displays cardinal direction (N, NE, E, etc.)
 * - Arrow rotates to point toward target
 * - Shows distance when target is selected
 * - Glows when target is nearby
 *
 * @example
 * ```tsx
 * <Compass
 *   direction={45}
 *   distance={150}
 *   hasTarget={true}
 *   onPress={() => console.log('Expand compass')}
 * />
 * ```
 */
export const Compass: React.FC<CompassProps> = ({
  direction,
  distance,
  hasTarget = false,
  onPress,
  size = 60,
}) => {
  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get cardinal direction label from degrees
   */
  const cardinalDirection = useMemo(() => {
    if (direction === null) return 'N';
    // Normalize to 0-360
    const normalized = ((direction % 360) + 360) % 360;
    // Each direction covers 45 degrees
    const index = Math.round(normalized / 45) % 8;
    return CARDINAL_DIRECTIONS[index];
  }, [direction]);

  /**
   * Format distance for display
   */
  const distanceLabel = useMemo(() => {
    if (distance === null || distance === undefined) return null;
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  }, [distance]);

  /**
   * Arrow rotation transform
   */
  const arrowRotation = useMemo(() => {
    if (direction === null) return '0deg';
    return `${direction}deg`;
  }, [direction]);

  // ─────────────────────────────────────────────────────────────────────────
  // STYLES
  // ─────────────────────────────────────────────────────────────────────────

  const dynamicStyles = useMemo(
    () => ({
      container: {
        width: size,
        height: size,
        borderRadius: size / 2,
      },
      arrow: {
        transform: [{ rotate: arrowRotation }],
      },
    }),
    [size, arrowRotation]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <TouchableOpacity
      style={[
        styles.container,
        dynamicStyles.container,
        hasTarget && styles.containerActive,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Compass background */}
      <View style={styles.compassRing}>
        {/* Direction arrow (only shown when has target) */}
        {hasTarget && direction !== null && (
          <View style={[styles.arrowContainer, dynamicStyles.arrow]}>
            <Text style={styles.arrow}>▲</Text>
          </View>
        )}

        {/* Compass icon */}
        <Text style={styles.compassIcon}>🧭</Text>
      </View>

      {/* Cardinal direction label */}
      <Text style={[styles.directionLabel, hasTarget && styles.directionLabelActive]}>
        {cardinalDirection}
      </Text>

      {/* Distance label (shown below compass when has target) */}
      {hasTarget && distanceLabel && (
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceLabel}>{distanceLabel}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  containerActive: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  compassRing: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassIcon: {
    fontSize: 28,
  },
  arrowContainer: {
    position: 'absolute',
    top: -20,
  },
  arrow: {
    fontSize: 16,
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  directionLabel: {
    fontSize: 10,
    color: '#8B9DC3',
    fontWeight: 'bold',
    marginTop: 2,
  },
  directionLabelActive: {
    color: '#FFD700',
  },
  distanceContainer: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  distanceLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default Compass;

