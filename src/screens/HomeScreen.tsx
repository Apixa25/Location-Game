import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useUserStore } from '../store';

export const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // Get real values from the store! 🎯
  const bbgBalance = useUserStore((state) => state.bbgBalance);
  const gasRemaining = useUserStore((state) => state.gasRemaining);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🏴‍☠️</Text>
      <Text style={styles.title}>Black Bart's Gold</Text>
      <Text style={styles.subtitle}>Treasure awaits, matey!</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>${bbgBalance.toFixed(2)}</Text>
          <Text style={styles.statLabel}>BBG Balance</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{gasRemaining}</Text>
          <Text style={styles.statLabel}>Days of Gas</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('PrizeFinder')}
      >
        <Text style={styles.buttonText}>🎯 Start Hunting</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>
        Find hidden treasure in the real world!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A365D',
    padding: 20,
  },
  logo: {
    fontSize: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 20,
  },
  statBox: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    minWidth: 120,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 12,
    color: '#8B9DC3',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 25,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A365D',
  },
  hint: {
    fontSize: 14,
    color: '#8B9DC3',
    marginTop: 30,
    textAlign: 'center',
  },
});
