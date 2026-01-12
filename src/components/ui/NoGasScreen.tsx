/**
 * NoGasScreen - Full screen overlay when user has no gas
 *
 * Displayed when user tries to access Prize Finder with 0 gas.
 * Shows pirate-themed messaging and options to add gas.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../store';
import { getBalance } from '../../services/walletService';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface NoGasScreenProps {
  /** Callback when user chooses to close/dismiss */
  onClose?: () => void;
  /** Whether user has parked coins available */
  hasParkedCoins?: boolean;
  /** Amount of parked coins */
  parkedAmount?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const { width, height } = Dimensions.get('window');

const COLORS = {
  deepSea: '#1A365D',
  darkerSea: '#0F2440',
  gold: '#FFD700',
  mutedBlue: '#8B9DC3',
  white: '#FFFFFF',
  pirateRed: '#8B0000',
  danger: '#EF4444',
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const NoGasScreen: React.FC<NoGasScreenProps> = ({
  onClose,
  hasParkedCoins = false,
  parkedAmount = 0,
}) => {
  const navigation = useNavigation<any>();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const shipBobAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Ship bobbing animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(shipBobAnim, {
          toValue: -10,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(shipBobAnim, {
          toValue: 10,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Wave animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim, shipBobAnim, waveAnim]);

  const handleBuyGas = () => {
    // Navigate to wallet for purchase
    onClose?.();
    navigation.navigate('MainTabs', { screen: 'Wallet' });
  };

  const handleUnparkCoins = () => {
    // Navigate to wallet to unpark
    onClose?.();
    navigation.navigate('MainTabs', { screen: 'Wallet' });
  };

  const handleGoBack = () => {
    onClose?.();
    navigation.goBack();
  };

  // Wave translation interpolation
  const waveTranslate = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Background waves */}
      <Animated.View
        style={[
          styles.waveBackground,
          { transform: [{ translateX: waveTranslate }] },
        ]}
      >
        <Text style={styles.waveEmoji}>🌊🌊🌊🌊🌊🌊🌊🌊</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Ship Icon with bobbing */}
        <Animated.Text
          style={[
            styles.shipIcon,
            { transform: [{ translateY: shipBobAnim }] },
          ]}
        >
          ⛵
        </Animated.Text>

        {/* Main Message */}
        <Text style={styles.title}>Ye've Run Aground!</Text>
        <Text style={styles.subtitle}>No gas in the tank, Captain!</Text>

        {/* Description */}
        <View style={styles.messageBox}>
          <Text style={styles.message}>
            Your ship has run out of fuel and can't hunt for treasure.
          </Text>
          <Text style={styles.message}>
            Add gas to get back on the high seas!
          </Text>
        </View>

        {/* Gas Meter (empty) */}
        <View style={styles.emptyMeter}>
          <View style={styles.meterBackground}>
            <View style={styles.meterEmpty} />
          </View>
          <Text style={styles.emptyText}>EMPTY</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleBuyGas}>
            <Text style={styles.primaryButtonIcon}>💳</Text>
            <Text style={styles.primaryButtonText}>Buy More Gas</Text>
            <Text style={styles.priceText}>$10 = 30 days</Text>
          </TouchableOpacity>

          {hasParkedCoins && parkedAmount > 0 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleUnparkCoins}
            >
              <Text style={styles.secondaryButtonIcon}>🅿️</Text>
              <Text style={styles.secondaryButtonText}>
                Unpark Coins (${parkedAmount.toFixed(2)})
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.linkButton} onPress={handleGoBack}>
            <Text style={styles.linkButtonText}>← Return to Port</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Find coins to extend your voyage, or purchase gas to continue.
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.darkerSea,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  waveBackground: {
    position: 'absolute',
    bottom: 50,
    width: width * 2,
    opacity: 0.3,
  },
  waveEmoji: {
    fontSize: 60,
    letterSpacing: -10,
  },
  content: {
    width: '90%',
    maxWidth: 380,
    alignItems: 'center',
    padding: 30,
  },
  shipIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.danger,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: 20,
  },
  messageBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    width: '100%',
  },
  message: {
    fontSize: 15,
    color: COLORS.mutedBlue,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 5,
  },
  emptyMeter: {
    width: '80%',
    marginBottom: 30,
    alignItems: 'center',
  },
  meterBackground: {
    width: '100%',
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.danger,
    overflow: 'hidden',
  },
  meterEmpty: {
    width: '5%',
    height: '100%',
    backgroundColor: COLORS.danger,
    borderRadius: 8,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.danger,
    letterSpacing: 2,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.pirateRed,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  primaryButtonIcon: {
    fontSize: 28,
    marginBottom: 5,
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  priceText: {
    fontSize: 13,
    color: COLORS.mutedBlue,
    marginTop: 4,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  secondaryButtonIcon: {
    fontSize: 20,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gold,
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: 16,
    color: COLORS.mutedBlue,
  },
  footer: {
    marginTop: 25,
    fontSize: 12,
    color: COLORS.mutedBlue,
    textAlign: 'center',
    opacity: 0.7,
  },
});

