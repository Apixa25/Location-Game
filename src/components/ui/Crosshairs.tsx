// Crosshairs Component for Black Bart's Gold
// Targeting reticle for coin collection
//
// Reference: docs/prize-finder-details.md - HUD Layout
// Reference: docs/BUILD-GUIDE.md - Sprint 2.5

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CrosshairsProps {
  /** Whether crosshairs are hovering over a collectible coin */
  isTargeting?: boolean;

  /** Whether the targeted coin is locked (above find limit) */
  isLocked?: boolean;

  /** Whether the targeted coin is out of range */
  isOutOfRange?: boolean;

  /** Size of the crosshairs (default 60) */
  size?: number;

  /** Opacity of the crosshairs (default 0.8) */
  opacity?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Crosshairs - Targeting reticle for the Prize Finder
 *
 * Color states:
 * - Gold: Default (no target)
 * - Green: Targeting a collectible coin
 * - Red: Targeting a locked coin (above find limit)
 * - Yellow: Targeting but out of range
 *
 * @example
 * ```tsx
 * <Crosshairs
 *   isTargeting={hoveredCoinId !== null}
 *   isLocked={targetCoin?.isLocked}
 * />
 * ```
 */
export const Crosshairs: React.FC<CrosshairsProps> = ({
  isTargeting = false,
  isLocked = false,
  isOutOfRange = false,
  size = 60,
  opacity = 0.8,
}) => {
  // ─────────────────────────────────────────────────────────────────────────
  // ANIMATION
  // ─────────────────────────────────────────────────────────────────────────

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation when targeting
  useEffect(() => {
    if (isTargeting && !isLocked && !isOutOfRange) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTargeting, isLocked, isOutOfRange, pulseAnim]);

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Determine crosshairs color based on state
   */
  const crosshairsColor = useMemo(() => {
    if (isLocked) return '#EF4444'; // Red for locked
    if (isOutOfRange) return '#FBBF24'; // Yellow for out of range
    if (isTargeting) return '#4ADE80'; // Green for collectible
    return '#FFD700'; // Gold for default
  }, [isTargeting, isLocked, isOutOfRange]);

  /**
   * Status text below crosshairs
   */
  const statusText = useMemo(() => {
    if (isLocked) return '🔒 LOCKED';
    if (isOutOfRange) return 'GET CLOSER';
    if (isTargeting) return 'TAP TO COLLECT';
    return null;
  }, [isTargeting, isLocked, isOutOfRange]);

  /**
   * Status text color
   */
  const statusColor = useMemo(() => {
    if (isLocked) return '#EF4444';
    if (isOutOfRange) return '#FBBF24';
    return '#4ADE80';
  }, [isLocked, isOutOfRange]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.crosshairsContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {/* Custom crosshairs design */}
        <View style={styles.crosshairsInner}>
          {/* Center dot */}
          <View
            style={[
              styles.centerDot,
              { backgroundColor: crosshairsColor },
            ]}
          />

          {/* Crosshair lines */}
          <View
            style={[
              styles.lineHorizontal,
              styles.lineLeft,
              { backgroundColor: crosshairsColor },
            ]}
          />
          <View
            style={[
              styles.lineHorizontal,
              styles.lineRight,
              { backgroundColor: crosshairsColor },
            ]}
          />
          <View
            style={[
              styles.lineVertical,
              styles.lineTop,
              { backgroundColor: crosshairsColor },
            ]}
          />
          <View
            style={[
              styles.lineVertical,
              styles.lineBottom,
              { backgroundColor: crosshairsColor },
            ]}
          />

          {/* Corner brackets */}
          <View style={[styles.corner, styles.cornerTL, { borderColor: crosshairsColor }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: crosshairsColor }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: crosshairsColor }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: crosshairsColor }]} />
        </View>
      </Animated.View>

      {/* Status text */}
      {statusText && (
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusText}
          </Text>
        </View>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const CROSSHAIR_SIZE = 60;
const LINE_LENGTH = 15;
const LINE_WIDTH = 2;
const GAP = 8;
const CORNER_SIZE = 12;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairsContainer: {
    width: CROSSHAIR_SIZE,
    height: CROSSHAIR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairsInner: {
    width: CROSSHAIR_SIZE,
    height: CROSSHAIR_SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  lineHorizontal: {
    position: 'absolute',
    width: LINE_LENGTH,
    height: LINE_WIDTH,
    top: CROSSHAIR_SIZE / 2 - LINE_WIDTH / 2,
  },
  lineVertical: {
    position: 'absolute',
    width: LINE_WIDTH,
    height: LINE_LENGTH,
    left: CROSSHAIR_SIZE / 2 - LINE_WIDTH / 2,
  },
  lineLeft: {
    right: CROSSHAIR_SIZE / 2 + GAP,
  },
  lineRight: {
    left: CROSSHAIR_SIZE / 2 + GAP,
  },
  lineTop: {
    bottom: CROSSHAIR_SIZE / 2 + GAP,
  },
  lineBottom: {
    top: CROSSHAIR_SIZE / 2 + GAP,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderWidth: LINE_WIDTH,
    borderColor: 'transparent',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopColor: 'inherit',
    borderLeftColor: 'inherit',
    borderTopWidth: LINE_WIDTH,
    borderLeftWidth: LINE_WIDTH,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopColor: 'inherit',
    borderRightColor: 'inherit',
    borderTopWidth: LINE_WIDTH,
    borderRightWidth: LINE_WIDTH,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomColor: 'inherit',
    borderLeftColor: 'inherit',
    borderBottomWidth: LINE_WIDTH,
    borderLeftWidth: LINE_WIDTH,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomColor: 'inherit',
    borderRightColor: 'inherit',
    borderBottomWidth: LINE_WIDTH,
    borderRightWidth: LINE_WIDTH,
  },
  statusContainer: {
    marginTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Crosshairs;

