// PrizeFinderHUD Component for Black Bart's Gold
// Combines all HUD elements into a single overlay for the AR view
//
// Reference: docs/prize-finder-details.md - HUD Layout
// Reference: docs/BUILD-GUIDE.md - Sprint 2.5/2.6

import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Compass } from './Compass';
import { FindLimit } from './FindLimit';
import { Crosshairs } from './Crosshairs';
import { MiniMap, MiniMapCoin } from './MiniMap';
import { GasMeter } from './GasMeter';
import { useUserStore, useAppStore } from '../../store';
import type { Coordinates, ARTrackingState } from '../../types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PrizeFinderHUDProps {
  /** Current AR tracking state */
  trackingState: ARTrackingState;

  /** Player's current GPS position */
  playerPosition: Coordinates | null;

  /** Currently hovered coin ID (for crosshairs) */
  hoveredCoinId: string | null;

  /** Whether the hovered coin is locked (above find limit) */
  isHoveredCoinLocked?: boolean;

  /** Whether the hovered coin is out of range */
  isHoveredCoinOutOfRange?: boolean;

  /** Direction to selected coin in degrees */
  directionToTarget: number | null;

  /** Distance to selected coin in meters */
  distanceToTarget: number | null;

  /** Nearby coins for mini map */
  nearbyCoins: MiniMapCoin[];

  /** Selected coin ID */
  selectedCoinId: string | null;

  /** Coins collected this session */
  coinsCollectedCount?: number;

  /** Total value collected this session */
  totalValueCollected?: number;

  /** Callback when close button is pressed */
  onClose: () => void;

  /** Callback when mini map is pressed */
  onMiniMapPress?: () => void;

  /** Callback when compass is pressed */
  onCompassPress?: () => void;

  /** Callback when find limit is pressed */
  onFindLimitPress?: () => void;

  /** Callback when gas meter is pressed */
  onGasMeterPress?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * PrizeFinderHUD - Complete HUD overlay for the Prize Finder AR view
 *
 * Layout:
 * ┌─────────────────────────────────────────────────┐
 * │ [✕] [🪙 2 | +$6.00]          [Find: $5.00]     │  ← Top bar
 * │                                                 │
 * │                      ⊕                          │  ← Crosshairs (center)
 * │              [TAP TO COLLECT]                   │
 * │                                                 │
 * │  [🧭]                                           │
 * │  [N]     [$25.00]                      [Gas]   │  ← Bottom bar
 * │  [MAP]   Balance                       [████]  │
 * │  [3]                                   [24d]   │
 * └─────────────────────────────────────────────────┘
 *
 * @example
 * ```tsx
 * <PrizeFinderHUD
 *   trackingState="NORMAL"
 *   playerPosition={{ latitude: 37.77, longitude: -122.41 }}
 *   hoveredCoinId={currentTarget}
 *   directionToTarget={45}
 *   nearbyCoins={coins}
 *   onClose={() => navigation.goBack()}
 * />
 * ```
 */
export const PrizeFinderHUD: React.FC<PrizeFinderHUDProps> = ({
  trackingState,
  playerPosition,
  hoveredCoinId,
  isHoveredCoinLocked = false,
  isHoveredCoinOutOfRange = false,
  directionToTarget,
  distanceToTarget,
  nearbyCoins,
  selectedCoinId,
  coinsCollectedCount = 0,
  totalValueCollected = 0,
  onClose,
  onMiniMapPress,
  onCompassPress,
  onFindLimitPress,
  onGasMeterPress,
}) => {
  const navigation = useNavigation();

  // ─────────────────────────────────────────────────────────────────────────
  // STORE DATA
  // ─────────────────────────────────────────────────────────────────────────

  const { gasRemaining, findLimit, bbgBalance } = useUserStore((state) => ({
    gasRemaining: state.gasRemaining,
    findLimit: state.findLimit,
    bbgBalance: state.bbgBalance,
  }));

  // ─────────────────────────────────────────────────────────────────────────
  // CALLBACKS
  // ─────────────────────────────────────────────────────────────────────────

  const handleMiniMapPress = useCallback(() => {
    if (onMiniMapPress) {
      onMiniMapPress();
    } else {
      // Default: navigate to Map screen
      // @ts-ignore - navigation type
      navigation.navigate('Map');
    }
  }, [navigation, onMiniMapPress]);

  const handleGasMeterPress = useCallback(() => {
    if (onGasMeterPress) {
      onGasMeterPress();
    } else {
      // Default: navigate to Wallet screen
      // @ts-ignore - navigation type
      navigation.navigate('Wallet');
    }
  }, [navigation, onGasMeterPress]);

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  const hasTarget = hoveredCoinId !== null || selectedCoinId !== null;
  const showSessionStats = coinsCollectedCount > 0;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">
      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TOP BAR */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <View style={styles.topBar} pointerEvents="box-none">
        {/* Back hint - just informational */}
        <View style={styles.backHint}>
          <Text style={styles.backHintText}>← Swipe to exit</Text>
        </View>

        {/* Session Stats (center) - only show if coins collected */}
        {showSessionStats && (
          <View style={styles.sessionStats}>
            <Text style={styles.sessionStatsText}>
              🪙 {coinsCollectedCount} | +${totalValueCollected.toFixed(2)}
            </Text>
          </View>
        )}

        {/* Find Limit (right) */}
        <FindLimit limit={findLimit} onPress={onFindLimitPress} />
      </View>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* CENTER - CROSSHAIRS */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <View style={styles.centerContainer} pointerEvents="none">
        <Crosshairs
          isTargeting={hoveredCoinId !== null}
          isLocked={isHoveredCoinLocked}
          isOutOfRange={isHoveredCoinOutOfRange}
        />
      </View>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* BOTTOM BAR */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <View style={styles.bottomBar} pointerEvents="box-none">
        {/* Left side: Compass + MiniMap stacked */}
        <View style={styles.leftColumn}>
          <Compass
            direction={directionToTarget}
            distance={distanceToTarget}
            hasTarget={hasTarget}
            onPress={onCompassPress}
            size={50}
          />
          <View style={styles.spacer} />
          <MiniMap
            playerPosition={playerPosition}
            coins={nearbyCoins}
            selectedCoinId={selectedCoinId}
            onPress={handleMiniMapPress}
            size={70}
          />
        </View>

        {/* Center: Balance */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceValue}>${bbgBalance.toFixed(2)}</Text>
        </View>

        {/* Right side: Gas Meter */}
        <GasMeter
          gasRemaining={gasRemaining}
          maxGas={30}
          onPress={handleGasMeterPress}
          height={70}
          width={24}
        />
      </View>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TRACKING WARNING BANNER */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {trackingState === 'LIMITED' && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠️ AR tracking limited - move to a better lit area
          </Text>
        </View>
      )}

      {trackingState === 'UNAVAILABLE' && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            🔄 Initializing AR... move phone slowly to calibrate
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  backHint: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  backHintText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  sessionStats: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  sessionStatsText: {
    fontSize: 14,
    color: '#4ADE80',
    fontWeight: 'bold',
  },

  // Center
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  leftColumn: {
    alignItems: 'center',
  },
  spacer: {
    height: 8,
  },
  balanceContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  balanceLabel: {
    fontSize: 10,
    color: '#8B9DC3',
    marginBottom: 2,
  },
  balanceValue: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: 'bold',
  },

  // Warning Banners
  warningBanner: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(251, 191, 36, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
  },
  warningText: {
    fontSize: 14,
    color: '#1A365D',
    fontWeight: 'bold',
  },
});

export default PrizeFinderHUD;

