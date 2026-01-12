// PrizeFinderScreen - AR Treasure Hunt View
// Main screen for finding and collecting coins
//
// Reference: docs/BUILD-GUIDE.md - Sprint 2.5/2.6
// Reference: docs/prize-finder-details.md - HUD Layout

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { PrizeFinderScene } from '../ar/PrizeFinderScene';
import { PrizeFinderHUD } from '../components/ui';
import { useUserStore, useLocationStore } from '../store';
import type { ARTrackingState, Coordinates } from '../types';
import type { MiniMapCoin } from '../components/ui';

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

  // Currently hovered coin (for crosshairs)
  const [hoveredCoinId, setHoveredCoinId] = useState<string | null>(null);

  // Coins collected this session (for feedback)
  const [coinsCollectedCount, setCoinsCollectedCount] = useState(0);
  const [totalValueCollected, setTotalValueCollected] = useState(0);

  // Nearby coins for mini map (will be updated from AR scene in future)
  const [nearbyCoins, setNearbyCoins] = useState<MiniMapCoin[]>([
    // Mock data for testing - will come from AR scene
    { id: 'test-coin-1', position: { latitude: 37.7750, longitude: -122.4195 }, coinType: 'fixed' },
    { id: 'test-coin-2', position: { latitude: 37.7748, longitude: -122.4190 }, coinType: 'fixed' },
    { id: 'test-coin-3', position: { latitude: 37.7752, longitude: -122.4200 }, coinType: 'pool' },
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // STORE DATA
  // ─────────────────────────────────────────────────────────────────────────

  // User economy data
  const addToBalance = useUserStore((state) => state.addToBalance);
  const incrementCoinsFound = useUserStore((state) => state.incrementCoinsFound);

  // Location data
  const currentLocation = useLocationStore((state) => state.currentLocation);

  // Mock player position for testing (will use real GPS later)
  const playerPosition: Coordinates = currentLocation ?? {
    latitude: 37.7749,
    longitude: -122.4194,
  };

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

      // Remove from mini map
      setNearbyCoins((prev) => prev.filter((c) => c.id !== coinId));

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

  /**
   * Handle close button
   */
  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  /**
   * Handle mini map press
   */
  const handleMiniMapPress = useCallback(() => {
    // @ts-ignore - navigation type
    navigation.navigate('Map');
  }, [navigation]);

  /**
   * Handle gas meter press
   */
  const handleGasMeterPress = useCallback(() => {
    // @ts-ignore - navigation type
    navigation.navigate('Wallet');
  }, [navigation]);

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  // Calculate direction to nearest coin (mock for now)
  const directionToTarget = useMemo(() => {
    if (!hoveredCoinId) return null;
    // In real implementation, calculate bearing from GPS positions
    return 45; // Mock: 45 degrees (northeast)
  }, [hoveredCoinId]);

  // Calculate distance to nearest coin (mock for now)
  const distanceToTarget = useMemo(() => {
    if (!hoveredCoinId) return null;
    // In real implementation, calculate from GPS positions
    return 25; // Mock: 25 meters
  }, [hoveredCoinId]);

  // Memoize viroAppProps to prevent re-renders
  const viroAppProps = useMemo(
    () => ({
      onTrackingStateChange: handleTrackingStateChange,
      onCoinCollected: handleCoinCollected,
      onCoinHovered: handleCoinHovered,
    }),
    [handleTrackingStateChange, handleCoinCollected, handleCoinHovered]
  );

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
          scene: PrizeFinderScene as () => React.JSX.Element,
        }}
        viroAppProps={viroAppProps}
        style={styles.arView}
      />

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* HUD OVERLAY */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <PrizeFinderHUD
        trackingState={trackingState}
        playerPosition={playerPosition}
        hoveredCoinId={hoveredCoinId}
        isHoveredCoinLocked={false}
        isHoveredCoinOutOfRange={false}
        directionToTarget={directionToTarget}
        distanceToTarget={distanceToTarget}
        nearbyCoins={nearbyCoins}
        selectedCoinId={hoveredCoinId}
        coinsCollectedCount={coinsCollectedCount}
        totalValueCollected={totalValueCollected}
        onClose={handleClose}
        onMiniMapPress={handleMiniMapPress}
        onGasMeterPress={handleGasMeterPress}
      />
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
});

export default PrizeFinderScreen;
