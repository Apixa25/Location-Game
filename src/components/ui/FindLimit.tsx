// FindLimit Component for Black Bart's Gold
// Displays the player's current find limit
//
// Reference: docs/economy-and-currency.md - Finding limits section
// Reference: docs/BUILD-GUIDE.md - Sprint 2.5

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface FindLimitProps {
  /** Current find limit in dollars */
  limit: number;

  /** Callback when tapped (to show info modal) */
  onPress?: () => void;

  /** Whether to show compact version */
  compact?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * FindLimit - Displays the player's maximum findable coin value
 *
 * The find limit is determined by the highest single coin the player
 * has ever hidden. Default is $1.00.
 *
 * @example
 * ```tsx
 * <FindLimit
 *   limit={5.00}
 *   onPress={() => showFindLimitInfoModal()}
 * />
 * ```
 */
export const FindLimit: React.FC<FindLimitProps> = ({
  limit,
  onPress,
  compact = false,
}) => {
  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Format limit for display
   */
  const formattedLimit = useMemo(() => {
    if (limit >= 100) {
      return `$${Math.floor(limit)}`;
    }
    return `$${limit.toFixed(2)}`;
  }, [limit]);

  /**
   * Determine limit tier for styling
   */
  const limitTier = useMemo(() => {
    if (limit >= 50) return 'high';
    if (limit >= 10) return 'medium';
    if (limit >= 5) return 'low';
    return 'starter';
  }, [limit]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.containerCompact}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        <Text style={styles.labelCompact}>🎯 {formattedLimit}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, styles[`container_${limitTier}`]]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Text style={styles.label}>Find:</Text>
      <Text style={[styles.value, styles[`value_${limitTier}`]]}>
        {formattedLimit}
      </Text>
      {onPress && <Text style={styles.infoIcon}>ⓘ</Text>}
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    gap: 4,
  },
  container_starter: {
    borderColor: 'rgba(139, 157, 195, 0.5)',
  },
  container_low: {
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  container_medium: {
    borderColor: 'rgba(255, 215, 0, 0.7)',
  },
  container_high: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  containerCompact: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  label: {
    fontSize: 12,
    color: '#8B9DC3',
    fontWeight: '500',
  },
  labelCompact: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  value_starter: {
    color: '#8B9DC3',
  },
  value_low: {
    color: '#FFD700',
  },
  value_medium: {
    color: '#FFD700',
  },
  value_high: {
    color: '#FFD700',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  infoIcon: {
    fontSize: 12,
    color: '#8B9DC3',
    marginLeft: 4,
  },
});

export default FindLimit;

