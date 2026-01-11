import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const MapScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Treasure Map</Text>
      <Text style={styles.placeholder}>Map view coming soon...</Text>
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
