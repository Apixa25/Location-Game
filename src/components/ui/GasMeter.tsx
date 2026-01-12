// GasMeter Component for Black Bart's Gold
// Vertical fuel gauge showing remaining gas/playtime
//
// Reference: docs/prize-finder-details.md - Gas Meter section
// Reference: docs/BUILD-GUIDE.md - Sprint 2.5

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface GasMeterProps {
  /** Gas remaining in days */
  gasRemaining: number;

  /** Maximum gas capacity in days (default 30) */
  maxGas?: number;

  /** Callback when meter is tapped */
  onPress?: () => void;

  /** Height of the meter (default 80) */
  height?: number;

  /** Width of the meter (default 30) */
  width?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const LOW_GAS_THRESHOLD = 0.15; // 15% - start warning
const CRITICAL_GAS_THRESHOLD = 0.10; // 10% - critical warning

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * GasMeter - Vertical fuel gauge for playtime remaining
 *
 * Visual states:
 * - Green: > 30% gas remaining
 * - Yellow: 15-30% remaining
 * - Red + Flashing: < 15% remaining
 *
 * @example
 * ```tsx
 * <GasMeter
 *   gasRemaining={25}
 *   maxGas={30}
 *   onPress={() => navigation.navigate('Wallet')}
 * />
 * ```
 */
export const GasMeter: React.FC<GasMeterProps> = ({
  gasRemaining,
  maxGas = 30,
  onPress,
  height = 80,
  width = 30,
}) => {
  // ─────────────────────────────────────────────────────────────────────────
  // ANIMATION
  // ─────────────────────────────────────────────────────────────────────────

  const flashAnim = useRef(new Animated.Value(1)).current;

  // Flash animation when low gas
  const percentage = Math.min(1, Math.max(0, gasRemaining / maxGas));
  const isLow = percentage <= LOW_GAS_THRESHOLD;
  const isCritical = percentage <= CRITICAL_GAS_THRESHOLD;

  useEffect(() => {
    if (isLow) {
      const flash = Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 0.3,
            duration: isCritical ? 200 : 400,
            useNativeDriver: true,
          }),
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: isCritical ? 200 : 400,
            useNativeDriver: true,
          }),
        ])
      );
      flash.start();
      return () => flash.stop();
    } else {
      flashAnim.setValue(1);
    }
  }, [isLow, isCritical, flashAnim]);

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Calculate fill color based on percentage
   */
  const fillColor = useMemo(() => {
    if (percentage > 0.3) return '#4ADE80'; // Green
    if (percentage > LOW_GAS_THRESHOLD) return '#FBBF24'; // Yellow
    return '#EF4444'; // Red
  }, [percentage]);

  /**
   * Format days remaining
   */
  const daysLabel = useMemo(() => {
    if (gasRemaining <= 0) return '0d';
    if (gasRemaining < 1) {
      const hours = Math.round(gasRemaining * 24);
      return `${hours}h`;
    }
    return `${Math.floor(gasRemaining)}d`;
  }, [gasRemaining]);

  /**
   * Warning label
   */
  const warningLabel = useMemo(() => {
    if (isCritical) return '⚠️';
    if (isLow) return 'LOW';
    return 'Gas';
  }, [isLow, isCritical]);

  /**
   * Dynamic styles
   */
  const dynamicStyles = useMemo(
    () => ({
      container: {
        width: width + 16, // Add padding
        height: height + 30, // Add space for labels
      },
      meterContainer: {
        width,
        height,
      },
      fillHeight: percentage * 100,
      fillColor: fillColor,
    }),
    [width, height, percentage, fillColor]
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
      {/* Label */}
      <Animated.Text
        style={[
          styles.label,
          isLow && styles.labelWarning,
          { opacity: isLow ? flashAnim : 1 },
        ]}
      >
        {warningLabel}
      </Animated.Text>

      {/* Meter container */}
      <View style={[styles.meterContainer, dynamicStyles.meterContainer]}>
        {/* Meter background */}
        <View style={styles.meterBackground}>
          {/* Fill level */}
          <Animated.View
            style={[
              styles.meterFill,
              {
                height: `${dynamicStyles.fillHeight}%` as const,
                backgroundColor: dynamicStyles.fillColor,
                opacity: isLow ? flashAnim : 1,
              },
            ]}
          />

          {/* Tick marks */}
          <View style={[styles.tick, styles.tick25]} />
          <View style={[styles.tick, styles.tick50]} />
          <View style={[styles.tick, styles.tick75]} />
        </View>

        {/* Fuel icon */}
        <Text style={styles.fuelIcon}>⛽</Text>
      </View>

      {/* Days remaining */}
      <Text style={[styles.daysLabel, isLow && styles.daysLabelWarning]}>
        {daysLabel}
      </Text>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    padding: 8,
  },
  label: {
    fontSize: 10,
    color: '#8B9DC3',
    fontWeight: '500',
    marginBottom: 4,
  },
  labelWarning: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  meterContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  meterBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  meterFill: {
    width: '100%',
    borderRadius: 6,
  },
  tick: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tick25: {
    bottom: '25%',
  },
  tick50: {
    bottom: '50%',
  },
  tick75: {
    bottom: '75%',
  },
  fuelIcon: {
    position: 'absolute',
    bottom: -2,
    fontSize: 12,
  },
  daysLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 4,
  },
  daysLabelWarning: {
    color: '#EF4444',
  },
});

export default GasMeter;

