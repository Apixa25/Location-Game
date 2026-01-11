import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const WalletScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Treasure Chest</Text>
      <Text style={styles.balance}>$0.00 BBG</Text>
      <Text style={styles.placeholder}>Wallet details coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A365D',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  balance: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
