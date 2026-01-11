import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Captain's Quarters</Text>
      <Text style={styles.placeholder}>Settings coming soon...</Text>
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
  placeholder: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
