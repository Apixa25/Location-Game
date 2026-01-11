import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroText,
  ViroTrackingReason,
  ViroTrackingStateConstants,
} from '@reactvision/react-viro';

const PrizeFinderScene = () => {
  const [trackingStatus, setTrackingStatus] = useState('Initializing AR...');

  const onTrackingUpdated = (state: number, reason: ViroTrackingReason) => {
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setTrackingStatus('AR Ready - Prize Finder Active!');
    } else if (state === ViroTrackingStateConstants.TRACKING_LIMITED) {
      setTrackingStatus('AR Limited - Move to better area');
    } else {
      setTrackingStatus('AR Unavailable');
    }
  };

  return (
    <ViroARScene onTrackingUpdated={onTrackingUpdated}>
      <ViroText
        text={trackingStatus}
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0, -1]}
        style={styles.arText}
      />
    </ViroARScene>
  );
};

export const PrizeFinderScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: PrizeFinderScene,
        }}
        style={styles.arView}
      />

      {/* HUD Overlay */}
      <SafeAreaView style={styles.hudOverlay} pointerEvents="box-none">
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.findLimit}>
            <Text style={styles.findLimitText}>Find: $5.00</Text>
          </View>
        </View>

        {/* Center Crosshairs */}
        <View style={styles.crosshairsContainer}>
          <Text style={styles.crosshairs}>⊕</Text>
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.compass}>
            <Text style={styles.compassIcon}>🧭</Text>
            <Text style={styles.compassText}>N</Text>
          </View>

          <View style={styles.gasMeter}>
            <Text style={styles.gasMeterLabel}>Gas</Text>
            <View style={styles.gasMeterBar}>
              <View style={[styles.gasMeterFill, { height: '80%' }]} />
            </View>
            <Text style={styles.gasMeterValue}>24d</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  arView: {
    flex: 1,
  },
  arText: {
    fontFamily: 'Arial',
    fontSize: 20,
    color: '#FFD700',
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  hudOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  findLimit: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  findLimitText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  crosshairsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairs: {
    fontSize: 60,
    color: '#FFD700',
    opacity: 0.8,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  compass: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassIcon: {
    fontSize: 24,
  },
  compassText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  gasMeter: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 10,
  },
  gasMeterLabel: {
    fontSize: 10,
    color: '#8B9DC3',
    marginBottom: 4,
  },
  gasMeterBar: {
    width: 20,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  gasMeterFill: {
    width: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 10,
  },
  gasMeterValue: {
    fontSize: 10,
    color: '#FFFFFF',
    marginTop: 4,
    fontWeight: 'bold',
  },
});
