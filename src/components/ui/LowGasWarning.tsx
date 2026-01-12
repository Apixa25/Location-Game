/**
 * LowGasWarning - Banner that appears when gas is running low
 *
 * Displays at the top of the screen when user has < 15% gas remaining.
 * Flashes "LOW FUEL" and shows days remaining.
 * Can be dismissed for the current session.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { dismissGasWarning } from '../../services/gasService';
import { useUserStore } from '../../store';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface LowGasWarningProps {
  /** Number of days remaining */
  daysRemaining: number;
  /** Amount of gas in BBG */
  gasRemaining: number;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Whether to show the warning */
  visible?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  warning: '#F97316',
  warningDark: '#C2410C',
  gold: '#FFD700',
  white: '#FFFFFF',
  black: '#000000',
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const LowGasWarning: React.FC<LowGasWarningProps> = ({
  daysRemaining,
  gasRemaining,
  onDismiss,
  visible = true,
}) => {
  const navigation = useNavigation<any>();
  const userId = useUserStore((state) => state.userId);

  // Animation values
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const flashAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Slide in from top
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Flashing "LOW FUEL" text
      Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, {
            toValue: 0.3,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(flashAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Gentle pulse for the whole banner
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim, flashAnim, pulseAnim]);

  const handleDismiss = async () => {
    if (userId) {
      await dismissGasWarning(userId);
    }
    onDismiss?.();
  };

  const handleGoToWallet = () => {
    handleDismiss();
    navigation.navigate('MainTabs', { screen: 'Wallet' });
  };

  if (!visible) {
    return null;
  }

  // Determine urgency
  const isUrgent = daysRemaining <= 1;
  const urgentStyle = isUrgent ? styles.urgent : {};

  return (
    <Animated.View
      style={[
        styles.container,
        urgentStyle,
        {
          transform: [
            { translateY: slideAnim },
            { scale: pulseAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={handleGoToWallet}
        activeOpacity={0.8}
      >
        {/* Gas Icon */}
        <Text style={styles.icon}>⛽</Text>

        {/* Warning Text */}
        <View style={styles.textContainer}>
          <Animated.Text
            style={[styles.warningText, { opacity: flashAnim }]}
          >
            LOW FUEL!
          </Animated.Text>
          <Text style={styles.daysText}>
            {daysRemaining === 0
              ? 'Less than 1 day left!'
              : daysRemaining === 1
              ? '1 day remaining'
              : `${daysRemaining} days remaining`}
          </Text>
        </View>

        {/* Gas Amount */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>${gasRemaining.toFixed(2)}</Text>
          <Text style={styles.tapText}>Tap to refuel</Text>
        </View>

        {/* Dismiss Button */}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Progress bar showing gas level */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(5, (daysRemaining / 30) * 100)}%` },
            ]}
          />
        </View>
      </View>
    </Animated.View>
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
    backgroundColor: COLORS.warning,
    zIndex: 999,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  urgent: {
    backgroundColor: COLORS.warningDark,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50, // Account for status bar
    paddingBottom: 12,
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  warningText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 2,
  },
  daysText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  tapText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dismissText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 15,
    paddingBottom: 8,
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
});

