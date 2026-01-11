import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MapScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🗺️</Text>
      <Text style={styles.title}>Treasure Map</Text>
      <Text style={styles.description}>
        Nearby coins will appear here
      </Text>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Map coming in Sprint 3
        </Text>
        <View style={styles.mockMap}>
          <Text style={[styles.coinDot, { top: 50, left: 80 }]}>🪙</Text>
          <Text style={[styles.coinDot, { top: 150, right: 60 }]}>🪙</Text>
          <Text style={styles.playerDot}>📍</Text>
          <Text style={[styles.coinDot, { bottom: 70, left: 100 }]}>🪙</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>Coins Nearby</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>~500m</Text>
          <Text style={styles.statLabel}>Closest Coin</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1A365D',
    padding: 20,
  },
  icon: {
    fontSize: 60,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    color: '#8B9DC3',
    marginTop: 5,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 30,
  },
  placeholderText: {
    fontSize: 16,
    color: '#8B9DC3',
    marginBottom: 20,
  },
  mockMap: {
    width: 250,
    height: 250,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 125,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  coinDot: {
    position: 'absolute',
    fontSize: 24,
  },
  playerDot: {
    fontSize: 30,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 30,
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 11,
    color: '#8B9DC3',
    marginTop: 3,
  },
});
