/**
 * LoadingOverlay - Full screen or inline loading indicator
 *
 * Shows a pirate-themed loading animation.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Modal,
} from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface LoadingOverlayProps {
  /** Whether to show the overlay */
  visible: boolean;
  /** Loading message */
  message?: string;
  /** Show as modal (full screen) or inline */
  fullScreen?: boolean;
  /** Transparent background */
  transparent?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  deepSea: '#1A365D',
  gold: '#FFD700',
  mutedBlue: '#8B9DC3',
  overlay: 'rgba(26, 54, 93, 0.9)',
};

const LOADING_MESSAGES = [
  'Charting the seas...',
  'Consulting the map...',
  'Searching for treasure...',
  'Sailing the high seas...',
  'Loading the booty...',
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  fullScreen = true,
  transparent = false,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Random message if none provided
  const displayMessage =
    message || LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];

  useEffect(() => {
    if (visible) {
      // Compass rotation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Pulse effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    return () => {
      rotateAnim.setValue(0);
      pulseAnim.setValue(1);
    };
  }, [visible, rotateAnim, pulseAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const content = (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        transparent && styles.transparent,
      ]}
    >
      <Animated.Text
        style={[
          styles.compass,
          {
            transform: [{ rotate: spin }, { scale: pulseAnim }],
          },
        ]}
      >
        🧭
      </Animated.Text>
      <Text style={styles.message}>{displayMessage}</Text>
      <View style={styles.dots}>
        <Dot delay={0} />
        <Dot delay={200} />
        <Dot delay={400} />
      </View>
    </View>
  );

  if (!visible) return null;

  if (fullScreen) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        {content}
      </Modal>
    );
  }

  return content;
};

/**
 * Animated dot for loading indicator
 */
const Dot: React.FC<{ delay: number }> = ({ delay }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [delay, opacity]);

  return <Animated.View style={[styles.dot, { opacity }]} />;
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  compass: {
    fontSize: 64,
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: COLORS.gold,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold,
  },
});

