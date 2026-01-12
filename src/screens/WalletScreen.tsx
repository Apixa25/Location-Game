/**
 * WalletScreen - Treasure Chest
 *
 * Displays user's BBG balance, gas status, parked coins, pending coins,
 * and transaction history. Allows parking/unparking of found coins.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {
  getBalance,
  getTransactions,
  getGasStatus,
  parkCoins,
  unparkCoins,
  confirmPendingCoins,
  getTransactionIcon,
  formatTransactionAmount,
  getTransactionColor,
  formatRelativeTime,
  DAILY_GAS_RATE,
} from '../services/walletService';
import { getGasMeterColor, getGasMessage } from '../services/gasService';
import { useUserStore } from '../store';
import { WalletBalance, Transaction, GasStatus } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  deepSea: '#1A365D',
  gold: '#FFD700',
  mutedBlue: '#8B9DC3',
  white: '#FFFFFF',
  cardBg: 'rgba(255, 255, 255, 0.08)',
  pirateRed: '#8B0000',
  success: '#4ADE80',
  danger: '#EF4444',
  warning: '#F97316',
};

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gas progress bar component
 */
const GasProgressBar: React.FC<{ status: GasStatus }> = ({ status }) => {
  const percentage = Math.min(100, (status.remaining / 10) * 100); // Based on $10 monthly
  const color = getGasMeterColor(percentage);

  return (
    <View style={styles.gasProgressContainer}>
      <View style={styles.gasProgressBackground}>
        <Animated.View
          style={[
            styles.gasProgressFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.gasProgressText, { color }]}>
        {status.days_left} {status.days_left === 1 ? 'day' : 'days'} left
      </Text>
    </View>
  );
};

/**
 * Balance card for gas, parked, or pending
 */
const BalanceCard: React.FC<{
  icon: string;
  label: string;
  value: number;
  subtitle?: string;
  onPress?: () => void;
  highlight?: boolean;
}> = ({ icon, label, value, subtitle, onPress, highlight }) => (
  <TouchableOpacity
    style={[styles.balanceCard, highlight && styles.balanceCardHighlight]}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <Text style={styles.cardIcon}>{icon}</Text>
    <Text style={styles.cardValue}>${value.toFixed(2)}</Text>
    <Text style={styles.cardLabel}>{label}</Text>
    {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
  </TouchableOpacity>
);

/**
 * Transaction list item
 */
const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => (
  <View style={styles.transaction}>
    <View style={styles.txLeft}>
      <Text style={styles.txIcon}>{getTransactionIcon(transaction.type)}</Text>
      <View style={styles.txInfo}>
        <Text style={styles.txDescription} numberOfLines={1}>
          {transaction.description}
        </Text>
        <View style={styles.txMeta}>
          <Text style={styles.txTime}>{formatRelativeTime(transaction.timestamp)}</Text>
          {transaction.status === 'pending' && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>Pending</Text>
            </View>
          )}
        </View>
      </View>
    </View>
    <Text
      style={[styles.txAmount, { color: getTransactionColor(transaction.amount) }]}
    >
      {formatTransactionAmount(transaction.amount)}
    </Text>
  </View>
);

/**
 * Park/Unpark Modal
 */
const ParkModal: React.FC<{
  visible: boolean;
  mode: 'park' | 'unpark';
  maxAmount: number;
  onConfirm: (amount: number) => void;
  onClose: () => void;
}> = ({ visible, mode, maxAmount, onConfirm, onClose }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
    if (numAmount > maxAmount) {
      Alert.alert('Insufficient Funds', `Maximum amount is $${maxAmount.toFixed(2)}.`);
      return;
    }

    setIsLoading(true);
    await onConfirm(numAmount);
    setIsLoading(false);
    setAmount('');
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  const isPark = mode === 'park';
  const title = isPark ? 'Park Coins' : 'Unpark Coins';
  const description = isPark
    ? 'Move coins from your gas tank to protected storage. Parked coins are safe from daily gas consumption.'
    : `Move coins back to your gas tank. Note: A $${DAILY_GAS_RATE.toFixed(2)} fee is charged immediately.`;
  const buttonText = isPark ? '🅿️ Park Coins' : '🚀 Unpark Coins';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalDescription}>{description}</Text>

          <View style={styles.modalInputRow}>
            <Text style={styles.modalCurrency}>$</Text>
            <TextInput
              style={styles.modalInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={COLORS.mutedBlue}
            />
          </View>

          <Text style={styles.modalMax}>
            Available: ${maxAmount.toFixed(2)}{' '}
            <Text
              style={styles.modalMaxButton}
              onPress={() => setAmount(maxAmount.toFixed(2))}
            >
              (Max)
            </Text>
          </Text>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={handleClose}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalConfirmButton}
              onPress={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.gold} />
              ) : (
                <Text style={styles.modalConfirmText}>{buttonText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const WalletScreen: React.FC = () => {
  const userId = useUserStore((state) => state.userId) || 'default';

  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [gasStatus, setGasStatus] = useState<GasStatus | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [parkModalVisible, setParkModalVisible] = useState(false);
  const [parkMode, setParkMode] = useState<'park' | 'unpark'>('park');

  // ─────────────────────────────────────────────────────────────────────────
  // DATA LOADING
  // ─────────────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      const [balanceData, gasData, txData] = await Promise.all([
        getBalance(userId),
        getGasStatus(userId),
        getTransactions(userId, 50, 0),
      ]);

      // Also confirm any pending coins
      await confirmPendingCoins(userId);

      setBalance(balanceData);
      setGasStatus(gasData);
      setTransactions(txData);
    } catch (error) {
      console.error('[WalletScreen] Error loading data:', error);
      Alert.alert('Error', 'Failed to load wallet data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PARK/UNPARK HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const handleOpenParkModal = (mode: 'park' | 'unpark') => {
    setParkMode(mode);
    setParkModalVisible(true);
  };

  const handleParkConfirm = async (amount: number) => {
    try {
      if (parkMode === 'park') {
        await parkCoins(userId, amount);
        Alert.alert('Success!', `$${amount.toFixed(2)} has been parked safely.`);
      } else {
        await unparkCoins(userId, amount);
        Alert.alert(
          'Success!',
          `$${amount.toFixed(2)} moved to gas tank (less $${DAILY_GAS_RATE.toFixed(2)} fee).`
        );
      }
      setParkModalVisible(false);
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process request.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>Loading yer treasure...</Text>
      </View>
    );
  }

  const total = balance?.total || 0;
  const gasTank = balance?.gas_tank || 0;
  const parked = balance?.parked || 0;
  const pending = balance?.pending || 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.gold}
            colors={[COLORS.gold]}
          />
        }
      >
        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TOTAL BALANCE HEADER */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceValue}>${total.toFixed(2)}</Text>
          <Text style={styles.balanceSubtext}>Black Bart's Gold</Text>
        </View>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* GAS STATUS BAR */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {gasStatus && (
          <View style={styles.gasSection}>
            <View style={styles.gasSectionHeader}>
              <Text style={styles.gasSectionTitle}>⛽ Gas Tank</Text>
              <Text style={styles.gasValue}>${gasTank.toFixed(2)}</Text>
            </View>
            <GasProgressBar status={gasStatus} />
            <Text style={styles.gasMessage}>{getGasMessage((gasTank / 10) * 100)}</Text>
          </View>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* BALANCE BREAKDOWN CARDS */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.cardsRow}>
          <BalanceCard
            icon="🅿️"
            label="Parked"
            value={parked}
            subtitle="Protected"
            onPress={() => handleOpenParkModal('unpark')}
            highlight={parked > 0}
          />
          <BalanceCard
            icon="⏳"
            label="Pending"
            value={pending}
            subtitle="< 24 hours"
          />
        </View>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* ACTION BUTTONS */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleOpenParkModal('park')}
            disabled={gasTank <= 0}
          >
            <Text style={styles.actionButtonIcon}>🅿️</Text>
            <Text style={styles.actionButtonText}>Park Coins</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => Alert.alert('Coming Soon', 'Gas purchases will be available in a future update!')}
          >
            <Text style={styles.actionButtonIcon}>💳</Text>
            <Text style={styles.actionButtonTextPrimary}>Add Gas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleOpenParkModal('unpark')}
            disabled={parked <= 0}
          >
            <Text style={styles.actionButtonIcon}>🚀</Text>
            <Text style={styles.actionButtonText}>Unpark</Text>
          </TouchableOpacity>
        </View>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TRANSACTION HISTORY */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Recent Activity</Text>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📜</Text>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start hunting to fill yer treasure log!
              </Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))
          )}
        </View>
      </ScrollView>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* PARK/UNPARK MODAL */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <ParkModal
        visible={parkModalVisible}
        mode={parkMode}
        maxAmount={parkMode === 'park' ? gasTank : parked}
        onConfirm={handleParkConfirm}
        onClose={() => setParkModalVisible(false)}
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
    backgroundColor: COLORS.deepSea,
  },
  scrollContent: {
    paddingBottom: 30,
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
  },

  // Balance Header
  balanceHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.mutedBlue,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceValue: {
    fontSize: 52,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginVertical: 5,
  },
  balanceSubtext: {
    fontSize: 12,
    color: COLORS.mutedBlue,
  },

  // Gas Section
  gasSection: {
    margin: 15,
    padding: 15,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  gasSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  gasSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  gasValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  gasProgressContainer: {
    marginBottom: 8,
  },
  gasProgressBackground: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  gasProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  gasProgressText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
    textAlign: 'right',
  },
  gasMessage: {
    fontSize: 13,
    color: COLORS.mutedBlue,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Balance Cards
  cardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  balanceCardHighlight: {
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.mutedBlue,
    marginTop: 4,
  },
  cardSubtitle: {
    fontSize: 10,
    color: COLORS.mutedBlue,
    opacity: 0.7,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.pirateRed,
    borderColor: COLORS.pirateRed,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionButtonText: {
    fontSize: 11,
    color: COLORS.mutedBlue,
    fontWeight: '600',
  },
  actionButtonTextPrimary: {
    fontSize: 11,
    color: COLORS.gold,
    fontWeight: '600',
  },

  // Transaction History
  historySection: {
    paddingHorizontal: 15,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: 15,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  txIcon: {
    fontSize: 24,
  },
  txInfo: {
    flex: 1,
  },
  txDescription: {
    fontSize: 14,
    color: COLORS.white,
  },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: 8,
  },
  txTime: {
    fontSize: 11,
    color: COLORS.mutedBlue,
  },
  pendingBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingBadgeText: {
    fontSize: 9,
    color: COLORS.warning,
    fontWeight: '600',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.white,
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: COLORS.mutedBlue,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#2A4B7C',
    borderRadius: 20,
    padding: 25,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.mutedBlue,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.deepSea,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  modalCurrency: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginRight: 5,
  },
  modalInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    paddingVertical: 15,
  },
  modalMax: {
    fontSize: 13,
    color: COLORS.mutedBlue,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalMaxButton: {
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  modalCancelText: {
    color: COLORS.mutedBlue,
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.pirateRed,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
