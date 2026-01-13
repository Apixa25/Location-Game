// PrizeFinderScreen - AR Treasure Hunt View
// Main screen for finding and collecting coins
//
// Reference: docs/BUILD-GUIDE.md - Sprint 2.5/2.6
// Reference: docs/prize-finder-details.md - HUD Layout

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, BackHandler, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// ViroReact only works on ARM devices - check if available
let ViroARSceneNavigator: any = null;
let PrizeFinderScene: any = null;
let isViroAvailable = false;

try {
  const viroModule = require('@reactvision/react-viro');
  ViroARSceneNavigator = viroModule.ViroARSceneNavigator;
  // Check if the native module actually loaded
  isViroAvailable = ViroARSceneNavigator != null;
  if (isViroAvailable) {
    PrizeFinderScene = require('../ar/PrizeFinderScene').PrizeFinderScene;
  }
} catch (e) {
  console.log('[PrizeFinderScreen] ViroReact not available:', e);
  isViroAvailable = false;
}
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
  const storeGasRemaining = useUserStore((state) => state.gasRemaining);

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
        console.log('[PrizeFinderScreen] Checking gas for userId:', userId, 'storeGasRemaining:', storeGasRemaining);
        
        const result = await checkGasOnLaunch(userId);
        const status = await getDetailedGasStatus(userId);
        const balance = await getBalance(userId);

        console.log('[PrizeFinderScreen] walletService result:', result, 'status:', status);

        // If walletService says NO_GAS but store has gas, use store values
        if (result === 'NO_GAS' && storeGasRemaining > 0) {
          console.log('[PrizeFinderScreen] Using store gas as fallback:', storeGasRemaining);
          setGasCheckResult('OK');
          setGasStatus({
            days_left: storeGasRemaining,
            remaining: storeGasRemaining * 0.33,
            warningDismissed: false,
          } as ExtendedGasStatus);
          setParkedAmount(balance.parked);
          // Don't show no gas screen
        } else {
          setGasCheckResult(result);
          setGasStatus(status);
          setParkedAmount(balance.parked);

          if (result === 'NO_GAS') {
            setShowNoGasScreen(true);
          } else if (result === 'LOW_GAS' && !status.warningDismissed) {
            setShowLowGasWarning(true);
          }
        }
      } catch (error) {
        console.error('[PrizeFinderScreen] Gas check error:', error);
        // On error, check store values before defaulting to OK
        if (storeGasRemaining > 0) {
          setGasCheckResult('OK');
        } else {
          setGasCheckResult('NO_GAS');
          setShowNoGasScreen(true);
        }
      } finally {
        setIsCheckingGas(false);
      }
    };

    checkGas();
  }, [userId, storeGasRemaining]);

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
    
    console.log('[PrizeFinderScreen] Showing exit overlay (NOT navigating yet)...');
    setIsExiting(true);
    
    // DON'T navigate automatically - let user tap "Return to Port" button
    // This prevents the crash from happening immediately
  }, [isExiting]);

  // Separate function for actual navigation
  const doNavigateBack = useCallback(() => {
    console.log('[PrizeFinderScreen] User confirmed exit - navigating back...');
    // Use simple goBack() - the route name was wrong before!
    navigation.goBack();
  }, [navigation]);

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
  // RENDER: AR NOT AVAILABLE (x86 emulator or missing native libs)
  // ─────────────────────────────────────────────────────────────────────────

  if (!isViroAvailable) {
    return (
      <View style={styles.arUnavailableContainer}>
        <Text style={styles.arUnavailableIcon}>🏴‍☠️</Text>
        <Text style={styles.arUnavailableTitle}>AR Not Available</Text>
        <Text style={styles.arUnavailableText}>
          The AR treasure hunting feature requires an ARM-based device.
          {'\n\n'}
          x86 emulators don't support ViroReact's native AR libraries.
          {'\n\n'}
          Please test on a real Android device!
        </Text>
        <TouchableOpacity style={styles.arUnavailableButton} onPress={() => navigation.goBack()}>
          <Text style={styles.arUnavailableButtonText}>⚓ Return to Port</Text>
        </TouchableOpacity>
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
          <Text style={styles.exitingSubtext}>Hunt Complete!</Text>
          {coinsCollectedCount > 0 ? (
            <Text style={styles.exitingStats}>
              🪙 {coinsCollectedCount} coins | +${totalValueCollected.toFixed(2)}
            </Text>
          ) : (
            <Text style={styles.exitingNoCoins}>No coins collected this session</Text>
          )}
          
          <TouchableOpacity style={styles.returnButton} onPress={doNavigateBack}>
            <Text style={styles.returnButtonText}>⚓ Return to Port</Text>
          </TouchableOpacity>
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
  exitingNoCoins: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    marginTop: 15,
  },
  returnButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  returnButtonText: {
    color: COLORS.deepSea,
    fontSize: 18,
    fontWeight: 'bold',
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
  // AR Unavailable Screen (x86 emulator)
  arUnavailableContainer: {
    flex: 1,
    backgroundColor: COLORS.deepSea,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  arUnavailableIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  arUnavailableTitle: {
    color: COLORS.gold,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  arUnavailableText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  arUnavailableButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: 40,
  },
  arUnavailableButtonText: {
    color: COLORS.deepSea,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PrizeFinderScreen;
