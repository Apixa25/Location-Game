import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: PrizeFinderScene,
        }}
        style={styles.arView}
      />
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
});
