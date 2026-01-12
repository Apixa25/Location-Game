/**
 * EmptyState - Reusable empty state component
 *
 * Displays a friendly message when lists or views have no data.
 * Supports various pirate-themed empty states.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type EmptyStateType =
  | 'no_coins'
  | 'no_transactions'
  | 'no_hidden_coins'
  | 'no_results'
  | 'offline'
  | 'error'
  | 'custom';

export interface EmptyStateProps {
  /** Type of empty state (determines icon and default message) */
  type?: EmptyStateType;
  /** Custom icon (emoji) */
  icon?: string;
  /** Custom title */
  title?: string;
  /** Custom message */
  message?: string;
  /** Action button text */
  actionText?: string;
  /** Action button callback */
  onAction?: () => void;
  /** Compact mode (smaller padding) */
  compact?: boolean;
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
};

const EMPTY_STATE_CONTENT: Record<EmptyStateType, { icon: string; title: string; message: string }> = {
  no_coins: {
    icon: '🗺️',
    title: 'No Treasure Here',
    message: "There be no coins nearby. Try exploring new waters, matey!",
  },
  no_transactions: {
    icon: '📜',
    title: 'No Activity Yet',
    message: "Yer treasure log awaits! Start hunting to fill it up.",
  },
  no_hidden_coins: {
    icon: '🏴‍☠️',
    title: 'No Coins Hidden',
    message: "Hide yer first coin to unlock bigger treasure finds!",
  },
  no_results: {
    icon: '🔍',
    title: 'No Results Found',
    message: 'Try adjusting your search or explore different waters.',
  },
  offline: {
    icon: '📡',
    title: "Ye're Offline",
    message: "Check yer connection and try again, Captain.",
  },
  error: {
    icon: '⚠️',
    title: 'Something Went Wrong',
    message: "The ship hit rough waters. Try again in a moment.",
  },
  custom: {
    icon: '🏴‍☠️',
    title: '',
    message: '',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'custom',
  icon,
  title,
  message,
  actionText,
  onAction,
  compact = false,
}) => {
  const content = EMPTY_STATE_CONTENT[type];

  const displayIcon = icon || content.icon;
  const displayTitle = title || content.title;
  const displayMessage = message || content.message;

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <Text style={[styles.icon, compact && styles.iconCompact]}>{displayIcon}</Text>

      <Text style={[styles.title, compact && styles.titleCompact]}>{displayTitle}</Text>

      <Text style={[styles.message, compact && styles.messageCompact]}>{displayMessage}</Text>

      {actionText && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  containerCompact: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  iconCompact: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: 8,
  },
  titleCompact: {
    fontSize: 18,
    marginBottom: 6,
  },
  message: {
    fontSize: 15,
    color: COLORS.mutedBlue,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  messageCompact: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: COLORS.pirateRed,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  actionButtonText: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: '600',
  },
});

