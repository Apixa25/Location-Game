// PrizeFinderScreen - AR Treasure Hunt View
// Main screen for finding and collecting coins
//
// Reference: docs/BUILD-GUIDE.md - Sprint 2.5/2.6
// Reference: docs/prize-finder-details.md - HUD Layout

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, BackHandler, Platform } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { PrizeFinderScene } from '../ar/PrizeFinderScene';
import { NoGasScreen, LowGasWarning } from '../components/ui';
import { useUserStore, useLocationStore } from '../store';
import { checkGasOnLaunch, getDetailedGasStatus, ExtendedGasStatus } from '../services/gasService';
import { getBalance } from '../services/walletService';
import type { ARTrackingState, Coordinates, GasCheckResult } from '../types';

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

  const [trackingState, setTrackingState] = useState<ARTrackingState>('NORMAL');
  const [coinsCollectedCount, setCoinsCollectedCount] = useState(0);
  const [totalValueCollected, setTotalValueCollected] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // STORE DATA
  // ─────────────────────────────────────────────────────────────────────────

  const addToBalance = useUserStore((state) => state.addToBalance);
  const incrementCoinsFound = useUserStore((state) => state.incrementCoinsFound);
  const currentLocation = useLocationStore((state) => state.currentLocation);

  // Ref to ViroARSceneNavigator for cleanup
  const arNavigatorRef = useRef<any>(null);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playerPosition: Coordinates = (currentLocation && currentLocation.latitude && currentLocation.longitude)
    ? currentLocation
    : { latitude: 37.7749, longitude: -122.4194 };

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
        setGasCheckResult('OK');
      } finally {
        setIsCheckingGas(false);
      }
    };

    checkGas();
  }, [userId]);

  // ─────────────────────────────────────────────────────────────────────────
  // CLEANUP ON UNMOUNT
  // ─────────────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    return () => {
      // Clean up any pending timeouts
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // SAFE EXIT FUNCTION - Unmount AR first, then navigate
  // ─────────────────────────────────────────────────────────────────────────
  
  const safeExit = useCallback(() => {
    // Prevent double-exit
    if (isExiting) {
      console.log('[PrizeFinderScreen] Already exiting, ignoring...');
      return;
    }
    
    console.log('[PrizeFinderScreen] Safe exit - navigating back...');
    setIsExiting(true);
    
    // Show exit overlay briefly, then navigate
    // Note: ViroReact may crash on unmount (known bug with React Native 0.81)
    // User may need to dismiss error dialog
    exitTimeoutRef.current = setTimeout(() => {
      console.log('[PrizeFinderScreen] Navigating back...');
      navigation.goBack();
    }, 500);
  }, [navigation, isExiting]);

  // ─────────────────────────────────────────────────────────────────────────
  // ANDROID BACK BUTTON HANDLER
  // ─────────────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      console.log('[PrizeFinderScreen] Back button pressed');
      safeExit();
      return true;
    });

    return () => backHandler.remove();
  }, [safeExit]);

  // ─────────────────────────────────────────────────────────────────────────
  // CALLBACKS
  // ─────────────────────────────────────────────────────────────────────────

  const handleTrackingStateChange = useCallback((state: ARTrackingState) => {
    setTrackingState(state);
  }, []);

  const handleCoinCollected = useCallback(
    (coinId: string, value: number) => {
      console.log(`[PrizeFinderScreen] Coin collected: ${coinId} - $${value.toFixed(2)}`);
      setCoinsCollectedCount((prev) => prev + 1);
      setTotalValueCollected((prev) => prev + value);
      addToBalance(value);
      incrementCoinsFound(value);
    },
    [addToBalance, incrementCoinsFound]
  );

  const handleExitFromAR = useCallback(() => {
    console.log('[PrizeFinderScreen] Exit pressed from AR scene!');
    safeExit();
  }, [safeExit]);

  const handleNoGasClose = useCallback(() => {
    setShowNoGasScreen(false);
    navigation.goBack();
  }, [navigation]);

  const handleLowGasDismiss = useCallback(() => {
    setShowLowGasWarning(false);
  }, []);

  // Memoize viroAppProps
  const viroAppProps = useMemo(
    () => ({
      onTrackingStateChange: handleTrackingStateChange,
      onCoinCollected: handleCoinCollected,
      onExitPressed: handleExitFromAR,
    }),
    [handleTrackingStateChange, handleCoinCollected, handleExitFromAR]
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
      {/* AR SCENE - Keep it mounted even during exit to prevent crash */}
      {!showNoGasScreen && (
        <ViroARSceneNavigator
          ref={arNavigatorRef}
          autofocus={true}
          initialScene={{
            scene: PrizeFinderScene as () => React.JSX.Element,
          }}
          viroAppProps={viroAppProps}
          style={styles.arView}
        />
      )}

      {/* SIMPLE HUD - Just shows info, no buttons */}
      {!showNoGasScreen && (
        <View style={styles.hudContainer} pointerEvents="none">
          <View style={styles.topHud}>
            <Text style={styles.hudText}>🏴‍☠️ Prize Finder Active</Text>
            {coinsCollectedCount > 0 && (
              <Text style={styles.statsText}>
                🪙 {coinsCollectedCount} | +${totalValueCollected.toFixed(2)}
              </Text>
            )}
          </View>
          <View style={styles.bottomHud}>
            <Text style={styles.exitHint}>Use Android back gesture to exit</Text>
          </View>
        </View>
      )}

      {/* LOW GAS WARNING */}
      {showLowGasWarning && gasStatus && (
        <LowGasWarning
          daysRemaining={gasStatus.days_left}
          gasRemaining={gasStatus.remaining}
          onDismiss={handleLowGasDismiss}
          visible={showLowGasWarning}
        />
      )}

      {/* NO GAS SCREEN */}
      {showNoGasScreen && (
        <NoGasScreen
          onClose={handleNoGasClose}
          hasParkedCoins={parkedAmount > 0}
          parkedAmount={parkedAmount}
        />
      )}

      {/* EXIT OVERLAY - Shows on top of AR without unmounting it */}
      {isExiting && (
        <View style={styles.exitingOverlay}>
          <Text style={styles.exitingText}>🏴‍☠️</Text>
          <Text style={styles.exitingSubtext}>Returning to port...</Text>
          {coinsCollectedCount > 0 && (
            <Text style={styles.exitingStats}>
              +${totalValueCollected.toFixed(2)} collected!
            </Text>
          )}
          <Text style={styles.exitingHint}>Reloading app...</Text>
        </View>
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
  exitingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.deepSea, // Fully opaque to hide AR
  },
  exitingText: {
    fontSize: 64,
    marginBottom: 20,
  },
  exitingSubtext: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: '600',
  },
  exitingStats: {
    color: '#4ADE80',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
  },
  exitingHint: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 30,
  },
  hudContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topHud: {
    paddingTop: Platform.OS === 'android' ? 40 : 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  hudText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statsText: {
    color: '#4ADE80',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bottomHud: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  exitHint: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default PrizeFinderScreen;
