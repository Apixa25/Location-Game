// Find Limit Popup for Black Bart's Gold
// Displays when player encounters a locked coin above their find limit
//
// Reference: docs/BUILD-GUIDE.md - Sprint 4.4: Find Limit System
// Reference: docs/economy-and-currency.md - Finding Limits section

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {
  getTierForLimit,
  getTierProgress,
  getNextTierUnlockAmount,
} from '../../services/findLimitService';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface FindLimitPopupProps {
  /** Whether the popup is visible */
  visible: boolean;
  /** Value of the locked coin */
  coinValue: number;
  /** Player's current find limit */
  playerLimit: number;
  /** Callback when popup is dismissed */
  onDismiss: () => void;
  /** Optional callback to navigate to hide coin screen */
  onHideCoin?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  background: 'rgba(0, 0, 0, 0.85)',
  cardBg: '#1A365D',
  gold: '#FFD700',
  pirateRed: '#8B0000',
  parchment: '#F5E6D3',
  locked: '#EF4444',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0AEC0',
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const FindLimitPopup: React.FC<FindLimitPopupProps> = ({
  visible,
  coinValue,
  playerLimit,
  onDismiss,
  onHideCoin,
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Calculate tier info
  const currentTier = getTierForLimit(playerLimit);
  const progress = getTierProgress(playerLimit);
  const nextUnlock = getNextTierUnlockAmount(playerLimit);
  const hintAmount = coinValue + 5;

  // Animate on show
  useEffect(() => {
    if (visible) {
      // Pop in animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Shake animation for locked icon
      Animated.sequence([
        Animated.delay(300),
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      shakeAnim.setValue(0);
    }
  }, [visible, scaleAnim, shakeAnim]);

  // Handle dismiss with animation
  const handleDismiss = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  // Handle hide coin action
  const handleHideCoin = () => {
    handleDismiss();
    if (onHideCoin) {
      setTimeout(onHideCoin, 200);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={handleDismiss}
        >
          <Animated.View
            style={[
              styles.card,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Locked Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ translateX: shakeAnim }] },
              ]}
            >
              <Text style={styles.lockedIcon}>🔒</Text>
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>Treasure Locked!</Text>

            {/* Coin Value */}
            <View style={styles.coinValueContainer}>
              <Text style={styles.coinValueLabel}>Coin Value</Text>
              <Text style={styles.coinValue}>${coinValue.toFixed(2)}</Text>
            </View>

            {/* Your Limit */}
            <View style={styles.limitContainer}>
              <View style={styles.limitRow}>
                <Text style={styles.limitLabel}>Your Limit:</Text>
                <Text style={styles.limitValue}>${playerLimit.toFixed(2)}</Text>
              </View>
              <View style={styles.limitRow}>
                <Text style={styles.tierIcon}>{currentTier.icon}</Text>
                <Text style={[styles.tierName, { color: currentTier.color }]}>
                  {currentTier.name}
                </Text>
              </View>
              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress * 100}%`, backgroundColor: currentTier.color },
                  ]}
                />
              </View>
            </View>

            {/* Hint */}
            <View style={styles.hintContainer}>
              <Text style={styles.hintIcon}>💡</Text>
              <Text style={styles.hintText}>
                Hide{' '}
                <Text style={styles.hintAmount}>${hintAmount.toFixed(2)}</Text>{' '}
                to unlock this tier!
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {onHideCoin && (
                <TouchableOpacity
                  style={styles.hideCoinButton}
                  onPress={handleHideCoin}
                  activeOpacity={0.8}
                >
                  <Text style={styles.hideCoinButtonText}>🪙 Hide Coin</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={handleDismiss}
                activeOpacity={0.8}
              >
                <Text style={styles.dismissButtonText}>
                  {onHideCoin ? 'Maybe Later' : 'OK'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Next tier info */}
            {nextUnlock && (
              <Text style={styles.nextTierHint}>
                Next tier unlocks at ${nextUnlock.toFixed(2)}
              </Text>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouch: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 24,
    width: SCREEN_WIDTH - 48,
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.locked,
    shadowColor: COLORS.locked,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  lockedIcon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.locked,
    marginBottom: 20,
    textAlign: 'center',
  },
  coinValueContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    width: '100%',
  },
  coinValueLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  coinValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  limitContainer: {
    width: '100%',
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  limitLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  limitValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  tierIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  tierName: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  hintIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  hintText: {
    fontSize: 14,
    color: COLORS.parchment,
    flex: 1,
  },
  hintAmount: {
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  hideCoinButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  hideCoinButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A365D',
  },
  dismissButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dismissButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  nextTierHint: {
    marginTop: 16,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default FindLimitPopup;

