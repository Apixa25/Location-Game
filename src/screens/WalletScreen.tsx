import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const WalletScreen = () => {
  // Mock transaction data
  const transactions = [
    { id: 1, type: 'found', description: 'Coin found near Main St', amount: '+$5.00', time: '2 hours ago' },
    { id: 2, type: 'gas', description: 'Daily gas fee', amount: '-$0.33', time: '1 day ago' },
    { id: 3, type: 'hidden', description: 'Coin hidden at Park', amount: '-$10.00', time: '2 days ago' },
  ];

  return (
    <View style={styles.container}>
      {/* Balance Section */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceValue}>$25.00</Text>
        <Text style={styles.balanceSubtext}>BBG (Black Bart's Gold)</Text>
      </View>

      {/* Balance Breakdown */}
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownIcon}>⛽</Text>
          <Text style={styles.breakdownValue}>$15.00</Text>
          <Text style={styles.breakdownLabel}>Gas Tank</Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownIcon}>🅿️</Text>
          <Text style={styles.breakdownValue}>$10.00</Text>
          <Text style={styles.breakdownLabel}>Parked</Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownIcon}>⏳</Text>
          <Text style={styles.breakdownValue}>$0.00</Text>
          <Text style={styles.breakdownLabel}>Pending</Text>
        </View>
      </View>

      {/* Transaction History */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Recent Activity</Text>
        <ScrollView style={styles.transactionList}>
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.transaction}>
              <View style={styles.txLeft}>
                <Text style={styles.txIcon}>
                  {tx.type === 'found' ? '🪙' : tx.type === 'gas' ? '⛽' : '📍'}
                </Text>
                <View>
                  <Text style={styles.txDescription}>{tx.description}</Text>
                  <Text style={styles.txTime}>{tx.time}</Text>
                </View>
              </View>
              <Text style={[
                styles.txAmount,
                { color: tx.amount.startsWith('+') ? '#4ADE80' : '#F87171' }
              ]}>
                {tx.amount}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A365D',
  },
  balanceSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#8B9DC3',
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    marginVertical: 5,
  },
  balanceSubtext: {
    fontSize: 12,
    color: '#8B9DC3',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownIcon: {
    fontSize: 24,
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 5,
  },
  breakdownLabel: {
    fontSize: 11,
    color: '#8B9DC3',
    marginTop: 2,
  },
  historySection: {
    flex: 1,
    padding: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
  },
  transactionList: {
    flex: 1,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  txIcon: {
    fontSize: 24,
  },
  txDescription: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  txTime: {
    fontSize: 11,
    color: '#8B9DC3',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
