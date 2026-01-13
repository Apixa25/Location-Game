// PrizeFinderScreen - AR Treasure Hunt View
// Main screen for finding and collecting coins
//
// Reference: docs/BUILD-GUIDE.md - Sprint 2.5/2.6
// Reference: docs/prize-finder-details.md - HUD Layout

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { PrizeFinderScene } from '../ar/PrizeFinderScene';
import { PrizeFinderHUD, NoGasScreen, LowGasWarning } from '../components/ui';
import { useUserStore, useLocationStore } from '../store';
import { checkGasOnLaunch, getDetailedGasStatus, ExtendedGasStatus } from '../services/gasService';
import { getBalance } from '../services/walletService';
import type { ARTrackingState, Coordinates, GasCheckResult } from '../types';
import type { MiniMapCoin } from '../components/ui';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  deepSea: '#1A365D',
  gold: '#FFD700',
  white: '#FFFFFF',
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const PrizeFinderScreen: React.FC = () => {
  const navigation = useNavigation();
  const userId = useUserStore((state) => state.userId) || 'default';

  // ─────────────────────────────────────────────────────────────────────────
  // GAS STATE
  // ─────────────────────────────────────────────────────────────────────────

  const [isCheckingGas, setIsCheckingGas] = useState(true);
  const [_gasCheckResult, setGasCheckResult] = useState<GasCheckResult>('OK');
  const [gasStatus, setGasStatus] = useState<ExtendedGasStatus | null>(null);
  const [parkedAmount, setParkedAmount] = useState(0);
  const [showLowGasWarning, setShowLowGasWarning] = useState(false);
  const [showNoGasScreen, setShowNoGasScreen] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // AR STATE
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
  // Add extra safety check for partial location objects
  const playerPosition: Coordinates = (currentLocation && currentLocation.latitude && currentLocation.longitude)
    ? currentLocation
    : {
        latitude: 37.7749,
        longitude: -122.4194,
      };

  // ─────────────────────────────────────────────────────────────────────────
  // GAS CHECK ON MOUNT
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const checkGas = async () => {
      try {
        const result = await checkGasOnLaunch(userId);
        const status = await getDetailedGasStatus(userId);
        const balance = await getBalance(userId);

        setGasCheckResult(result);
        setGasStatus(status);
        setParkedAmount(balance.parked);

        if (result === 'NO_GAS') {
          setShowNoGasScreen(true);
        } else if (result === 'LOW_GAS' && !status.warningDismissed) {
          setShowLowGasWarning(true);
        }
      } catch (error) {
        console.error('[PrizeFinderScreen] Gas check error:', error);
        // Default to allowing play on error (fail open)
        setGasCheckResult('OK');
      } finally {
        setIsCheckingGas(false);
      }
    };

    checkGas();
  }, [userId]);

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
    navigation.navigate('MainTabs', { screen: 'Wallet' });
  }, [navigation]);

  /**
   * Handle NoGasScreen close
   */
  const handleNoGasClose = useCallback(() => {
    setShowNoGasScreen(false);
    navigation.goBack();
  }, [navigation]);

  /**
   * Handle LowGasWarning dismiss
   */
  const handleLowGasDismiss = useCallback(() => {
    setShowLowGasWarning(false);
  }, []);

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
  // RENDER: LOADING STATE
  // ─────────────────────────────────────────────────────────────────────────

  if (isCheckingGas) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>Checking fuel levels...</Text>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* AR SCENE (only render if has gas) */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {!showNoGasScreen && (
        <ViroARSceneNavigator
          autofocus={true}
          initialScene={{
            scene: PrizeFinderScene as () => React.JSX.Element,
          }}
          viroAppProps={viroAppProps}
          style={styles.arView}
        />
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* HUD OVERLAY (only show if not on NoGas screen) */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {!showNoGasScreen && (
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
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* LOW GAS WARNING BANNER */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {showLowGasWarning && gasStatus && (
        <LowGasWarning
          daysRemaining={gasStatus.days_left}
          gasRemaining={gasStatus.remaining}
          onDismiss={handleLowGasDismiss}
          visible={showLowGasWarning}
        />
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* NO GAS SCREEN OVERLAY */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {showNoGasScreen && (
        <NoGasScreen
          onClose={handleNoGasClose}
          hasParkedCoins={parkedAmount > 0}
          parkedAmount={parkedAmount}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.deepSea,
  },
  loadingText: {
    marginTop: 15,
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrizeFinderScreen;
