// PrizeFinderScreen - AR Treasure Hunt View
// Main screen for finding and collecting coins
//
// Reference: docs/BUILD-GUIDE.md - Sprint 2.4 & 2.5/2.6
// Reference: docs/prize-finder-details.md - HUD Layout

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { PrizeFinderScene } from '../ar/PrizeFinderScene';
import { useUserStore, useAppStore } from '../store';
import type { ARTrackingState } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const PrizeFinderScreen: React.FC = () => {
  const navigation = useNavigation();

  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────

  // Tracking state from AR scene
  const [trackingState, setTrackingState] = useState<ARTrackingState>('UNAVAILABLE');

  // Currently hovered coin (for crosshairs color)
  const [hoveredCoinId, setHoveredCoinId] = useState<string | null>(null);

  // Coins collected this session (for feedback)
  const [coinsCollectedCount, setCoinsCollectedCount] = useState(0);
  const [totalValueCollected, setTotalValueCollected] = useState(0);

  // ─────────────────────────────────────────────────────────────────────────
  // STORE DATA
  // ─────────────────────────────────────────────────────────────────────────

  // User economy data
  const { gasRemaining, findLimit, bbgBalance } = useUserStore((state) => ({
    gasRemaining: state.gasRemaining,
    findLimit: state.findLimit,
    bbgBalance: state.bbgBalance,
  }));

  // Update balance when coin is collected
  const addToBalance = useUserStore((state) => state.addToBalance);
  const incrementCoinsFound = useUserStore((state) => state.incrementCoinsFound);

  // ─────────────────────────────────────────────────────────────────────────
  // CALLBACKS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Handle tracking state changes from AR scene
   */
  const handleTrackingStateChange = useCallback((state: ARTrackingState) => {
    setTrackingState(state);
  }, []);

  /**
   * Handle coin collection from AR scene
   */
  const handleCoinCollected = useCallback(
    (coinId: string, value: number) => {
      console.log(`[PrizeFinderScreen] Coin collected: ${coinId} - $${value.toFixed(2)}`);

      // Update local session stats
      setCoinsCollectedCount((prev) => prev + 1);
      setTotalValueCollected((prev) => prev + value);

      // Update global store
      addToBalance(value);
      incrementCoinsFound(value);

      // TODO: Play sound effect
      // TODO: Trigger haptic feedback
    },
    [addToBalance, incrementCoinsFound]
  );

  /**
   * Handle coin hover from AR scene
   */
  const handleCoinHovered = useCallback((coinId: string | null) => {
    setHoveredCoinId(coinId);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  // Crosshairs color based on hover state
  const crosshairsColor = hoveredCoinId ? '#4ADE80' : '#FFD700'; // Green when targeting, gold otherwise

  // Gas meter fill percentage
  const gasPercentage = Math.min(100, Math.max(0, (gasRemaining / 30) * 100));

  // Gas meter color (green -> yellow -> red based on level)
  const gasMeterColor =
    gasPercentage > 30 ? '#4ADE80' : gasPercentage > 15 ? '#FBBF24' : '#EF4444';

  // Show low gas warning
  const isLowGas = gasPercentage <= 15;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* AR SCENE */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: PrizeFinderScene,
        }}
        viroAppProps={{
          onTrackingStateChange: handleTrackingStateChange,
          onCoinCollected: handleCoinCollected,
          onCoinHovered: handleCoinHovered,
        }}
        style={styles.arView}
      />

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* HUD OVERLAY */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <SafeAreaView style={styles.hudOverlay} pointerEvents="box-none">
        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TOP BAR */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.topBar}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Session Stats (center) */}
          {coinsCollectedCount > 0 && (
            <View style={styles.sessionStats}>
              <Text style={styles.sessionStatsText}>
                🪙 {coinsCollectedCount} | +${totalValueCollected.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Find Limit (right) */}
          <View style={styles.findLimit}>
            <Text style={styles.findLimitText}>
              Find: ${findLimit.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* CENTER - CROSSHAIRS */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.crosshairsContainer}>
          <Text style={[styles.crosshairs, { color: crosshairsColor }]}>⊕</Text>
          {/* Targeting indicator */}
          {hoveredCoinId && (
            <Text style={styles.targetingText}>TAP TO COLLECT</Text>
          )}
        </View>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* BOTTOM BAR */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.bottomBar}>
          {/* Compass (left) */}
          <View style={styles.compass}>
            <Text style={styles.compassIcon}>🧭</Text>
            <Text style={styles.compassText}>N</Text>
          </View>

          {/* Balance Display (center) */}
          <View style={styles.balanceDisplay}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceValue}>${bbgBalance.toFixed(2)}</Text>
          </View>

          {/* Gas Meter (right) */}
          <View style={styles.gasMeter}>
            <Text style={styles.gasMeterLabel}>
              {isLowGas ? '⚠️ LOW' : 'Gas'}
            </Text>
            <View style={styles.gasMeterBar}>
              <View
                style={[
                  styles.gasMeterFill,
                  {
                    height: `${gasPercentage}%`,
                    backgroundColor: gasMeterColor,
                  },
                ]}
              />
            </View>
            <Text style={styles.gasMeterValue}>{Math.floor(gasRemaining)}d</Text>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TRACKING WARNING BANNER */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {trackingState === 'LIMITED' && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ AR tracking limited - move to a better area
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  arView: {
    flex: 1,
  },

  // HUD Overlay
  hudOverlay: {
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
  closeButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sessionStats: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  sessionStatsText: {
    fontSize: 14,
    color: '#4ADE80',
    fontWeight: 'bold',
  },
  findLimit: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  findLimitText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },

  // Crosshairs
  crosshairsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairs: {
    fontSize: 60,
    opacity: 0.8,
  },
  targetingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#4ADE80',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },

  // Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  compass: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassIcon: {
    fontSize: 24,
  },
  compassText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  balanceDisplay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 10,
    color: '#8B9DC3',
  },
  balanceValue: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  gasMeter: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 10,
  },
  gasMeterLabel: {
    fontSize: 10,
    color: '#8B9DC3',
    marginBottom: 4,
  },
  gasMeterBar: {
    width: 20,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  gasMeterFill: {
    width: '100%',
    borderRadius: 10,
  },
  gasMeterValue: {
    fontSize: 10,
    color: '#FFFFFF',
    marginTop: 4,
    fontWeight: 'bold',
  },

  // Warning Banner
  warningBanner: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(251, 191, 36, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#1A365D',
    fontWeight: 'bold',
  },
});

export default PrizeFinderScreen;

