/**
 * ARErrorScreen - Full screen overlay for AR tracking issues
 *
 * Displayed when AR tracking is unavailable or fails.
 * Provides tips and retry functionality.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ARErrorScreenProps {
  /** Type of error */
  errorType: 'UNAVAILABLE' | 'LIMITED' | 'CAMERA_DENIED';
  /** Callback to retry AR */
  onRetry?: () => void;
  /** Callback to go back */
  onGoBack?: () => void;
  /** Callback to open settings */
  onOpenSettings?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  deepSea: '#1A365D',
  gold: '#FFD700',
  mutedBlue: '#8B9DC3',
  white: '#FFFFFF',
  pirateRed: '#8B0000',
  warning: '#F97316',
};

const ERROR_CONTENT = {
  UNAVAILABLE: {
    icon: '🔭',
    title: 'AR Not Available',
    message: "The treasure map can't initialize on this device.",
    tips: [
      'Ensure your device supports ARKit/ARCore',
      'Restart the app and try again',
      'Check for system updates',
    ],
  },
  LIMITED: {
    icon: '⚠️',
    title: 'AR Tracking Limited',
    message: "The treasure hunt is having trouble finding its bearings.",
    tips: [
      'Move to a well-lit area',
      'Point camera at textured surfaces',
      'Avoid pointing at plain walls or sky',
      'Move slowly to help AR calibrate',
    ],
  },
  CAMERA_DENIED: {
    icon: '📷',
    title: 'Camera Access Needed',
    message: 'The treasure map needs camera access to show you the gold!',
    tips: [
      'Open Settings',
      'Find Black Bart\'s Gold',
      'Enable Camera permission',
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ARErrorScreen: React.FC<ARErrorScreenProps> = ({
  errorType,
  onRetry,
  onGoBack,
  onOpenSettings,
}) => {
  const content = ERROR_CONTENT[errorType];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <Text style={styles.icon}>{content.icon}</Text>

        {/* Title & Message */}
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.message}>{content.message}</Text>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Try the following:</Text>
          {content.tips.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttons}>
          {errorType === 'CAMERA_DENIED' && onOpenSettings && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onOpenSettings}
            >
              <Text style={styles.primaryButtonText}>Open Settings</Text>
            </TouchableOpacity>
          )}

          {errorType !== 'CAMERA_DENIED' && onRetry && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onRetry}
            >
              <Text style={styles.primaryButtonText}>🔄 Try Again</Text>
            </TouchableOpacity>
          )}

          {onGoBack && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onGoBack}
            >
              <Text style={styles.secondaryButtonText}>← Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.deepSea,
    zIndex: 1000,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.warning,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: COLORS.mutedBlue,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  tipsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: 15,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tipBullet: {
    color: COLORS.gold,
    fontSize: 16,
    marginRight: 10,
    width: 15,
  },
  tipText: {
    color: COLORS.white,
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.pirateRed,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  primaryButtonText: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.mutedBlue,
    fontSize: 16,
  },
});

