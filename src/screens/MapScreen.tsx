// ═══════════════════════════════════════════════════════════════════════════
// MAP SCREEN - Black Bart's Gold
// ═══════════════════════════════════════════════════════════════════════════
// Shows nearby coins on a radar-style map view
// Uses location and coin stores to display real data

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLocationStore, useCurrentLocation, useIsTracking } from '../store/useLocationStore';
import { useCoinStore, useNearbyCoinCount, useClosestCoin } from '../store/useCoinStore';
import { useUserStore } from '../store/useUserStore';
import { useLocation } from '../hooks/useLocation';
import { colors as COLORS, spacing as SPACING } from '../theme';
import type { RootStackParamList } from '../navigation/AppNavigator';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface CoinListItemProps {
  coin: {
    id: string;
    value: number | null;
    coinType: 'fixed' | 'pool';
    distance_meters: number;
    bearing: number;
    is_over_limit: boolean;
  };
  findLimit: number;
  onPress: (coinId: string, isLocked: boolean) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const getDirectionFromBearing = (bearing: number): string => {
  if (bearing >= 337.5 || bearing < 22.5) return 'N';
  if (bearing >= 22.5 && bearing < 67.5) return 'NE';
  if (bearing >= 67.5 && bearing < 112.5) return 'E';
  if (bearing >= 112.5 && bearing < 157.5) return 'SE';
  if (bearing >= 157.5 && bearing < 202.5) return 'S';
  if (bearing >= 202.5 && bearing < 247.5) return 'SW';
  if (bearing >= 247.5 && bearing < 292.5) return 'W';
  return 'NW';
};

const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

// ═══════════════════════════════════════════════════════════════════════════
// COIN LIST ITEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const CoinListItem: React.FC<CoinListItemProps> = ({ coin, findLimit, onPress }) => {
  const isLocked = coin.is_over_limit || (coin.value !== null && coin.value > findLimit);
  const isPool = coin.coinType === 'pool';
  
  return (
    <TouchableOpacity 
      style={[styles.coinItem, isLocked && styles.coinItemLocked]}
      onPress={() => onPress(coin.id, isLocked)}
      activeOpacity={0.7}
    >
      <View style={styles.coinIcon}>
        <Text style={styles.coinEmoji}>{isLocked ? '🔒' : '🪙'}</Text>
      </View>
      
      <View style={styles.coinInfo}>
        <Text style={[styles.coinValue, isLocked && styles.coinValueLocked]}>
          {isPool ? 'Pool Coin 🎰' : coin.value !== null ? `$${coin.value.toFixed(2)}` : '???'}
        </Text>
        <Text style={styles.coinDistance}>
          {formatDistance(coin.distance_meters)} • {getDirectionFromBearing(coin.bearing)}
        </Text>
      </View>
      
      <View style={styles.coinStatus}>
        {isLocked ? (
          <Text style={styles.lockedText}>Above Limit</Text>
        ) : coin.distance_meters < 30 ? (
          <Text style={styles.collectibleText}>In Range! ✨</Text>
        ) : (
          <Text style={styles.distantText}>Walk Closer</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// RADAR VIEW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface RadarViewProps {
  coins: Array<{
    id: string;
    distance_meters: number;
    bearing: number;
    value: number | null;
    is_over_limit: boolean;
  }>;
}

const RadarView: React.FC<RadarViewProps> = ({ coins }) => {
  const RADAR_SIZE = 250;
  const RADAR_RADIUS = RADAR_SIZE / 2 - 20;
  const MAX_RANGE = 1000; // 1km max display range
  
  // Calculate coin positions on radar
  const getCoinPosition = (distance: number, bearing: number) => {
    // Scale distance to radar (cap at MAX_RANGE)
    const scaledDistance = Math.min(distance, MAX_RANGE) / MAX_RANGE * RADAR_RADIUS;
    // Convert bearing to radians (0 = North = up)
    const radians = (bearing - 90) * Math.PI / 180;
    const x = RADAR_SIZE / 2 + scaledDistance * Math.cos(radians);
    const y = RADAR_SIZE / 2 + scaledDistance * Math.sin(radians);
    return { x, y };
  };
  
  return (
    <View style={[styles.radar, { width: RADAR_SIZE, height: RADAR_SIZE }]}>
      {/* Radar rings */}
      <View style={[styles.radarRing, styles.radarRing1]} />
      <View style={[styles.radarRing, styles.radarRing2]} />
      <View style={[styles.radarRing, styles.radarRing3]} />
      
      {/* Direction labels */}
      <Text style={[styles.directionLabel, styles.dirLabelN]}>N</Text>
      <Text style={[styles.directionLabel, styles.dirLabelE]}>E</Text>
      <Text style={[styles.directionLabel, styles.dirLabelS]}>S</Text>
      <Text style={[styles.directionLabel, styles.dirLabelW]}>W</Text>
      
      {/* Player position (center) */}
      <View style={styles.playerMarker}>
        <Text style={styles.playerIcon}>📍</Text>
      </View>
      
      {/* Coin markers */}
      {coins.map((coin) => {
        const pos = getCoinPosition(coin.distance_meters, coin.bearing);
        return (
          <View
            key={coin.id}
            style={[
              styles.coinMarker,
              {
                left: pos.x - 12,
                top: pos.y - 12,
              },
            ]}
          >
            <Text style={styles.coinMarkerIcon}>
              {coin.is_over_limit ? '🔒' : '🪙'}
            </Text>
          </View>
        );
      })}
      
      {/* Range labels */}
      <Text style={styles.rangeLabel}>1km</Text>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN MAP SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const MapScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  
  // Location tracking
  const { startTracking, hasPermission } = useLocation({ autoStart: true });
  const locationLoading = hasPermission === null; // Loading until permission resolved
  const currentLocation = useCurrentLocation();
  const isTracking = useIsTracking();
  
  // Coins
  const { nearbyCoins, isLoadingCoins, setNearbyCoins, selectCoin } = useCoinStore();
  const coinCount = useNearbyCoinCount();
  const closestCoin = useClosestCoin();
  
  // User - use individual selectors to prevent getSnapshot warnings
  const findLimit = useUserStore((state) => state.findLimit);
  const gasRemaining = useUserStore((state) => state.gasRemaining);
  
  // Handle coin tap
  const handleCoinPress = useCallback((coinId: string, isLocked: boolean) => {
    if (isLocked) {
      Alert.alert(
        '🔒 Coin Locked',
        'This coin is above your find limit. Keep hunting to increase your limit!',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (gasRemaining <= 0) {
      Alert.alert(
        '⛽ No Gas',
        "You're out of gas, Captain! Add more gas to start hunting.",
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Select this coin and navigate to AR view
    selectCoin(coinId);
    navigation.navigate('PrizeFinder');
  }, [selectCoin, navigation, gasRemaining]);
  
  // Simulate fetching coins (in production, would call API)
  const fetchNearbyCoins = useCallback(async () => {
    if (!currentLocation) return;
    
    // TODO: Replace with actual API call
    // const coins = await api.get(`/coins/nearby?lat=${currentLocation.latitude}&lng=${currentLocation.longitude}`);
    
    // For now, generate mock coins based on location
    const mockCoins = [
      {
        id: '1',
        value: 0.50,
        coinType: 'fixed' as const,
        latitude: currentLocation.latitude + 0.0003,
        longitude: currentLocation.longitude + 0.0002,
        distance_meters: 38,
        bearing: 33,
        is_over_limit: false,
        is_collectible: true,
        ar_position: [0, 0, -5] as [number, number, number],
      },
      {
        id: '2',
        value: 2.50,
        coinType: 'fixed' as const,
        latitude: currentLocation.latitude + 0.002,
        longitude: currentLocation.longitude - 0.001,
        distance_meters: 239,
        bearing: 120,
        is_over_limit: false,
        is_collectible: false,
        ar_position: [3, 0, -8] as [number, number, number],
      },
      {
        id: '3',
        value: null,
        coinType: 'pool' as const,
        latitude: currentLocation.latitude - 0.003,
        longitude: currentLocation.longitude - 0.002,
        distance_meters: 377,
        bearing: 210,
        is_over_limit: false,
        is_collectible: false,
        ar_position: [-5, 0, -10] as [number, number, number],
      },
      {
        id: '4',
        value: 25.00,
        coinType: 'fixed' as const,
        latitude: currentLocation.latitude + 0.001,
        longitude: currentLocation.longitude - 0.0005,
        distance_meters: 120,
        bearing: 290,
        is_over_limit: true,
        is_collectible: false,
        ar_position: [-2, 0, -6] as [number, number, number],
      },
      {
        id: '5',
        value: 5.00,
        coinType: 'fixed' as const,
        latitude: currentLocation.latitude + 0.005,
        longitude: currentLocation.longitude + 0.004,
        distance_meters: 658,
        bearing: 45,
        is_over_limit: false,
        is_collectible: false,
        ar_position: [8, 0, -15] as [number, number, number],
      },
    ];
    
    setNearbyCoins(mockCoins);
  }, [currentLocation, setNearbyCoins]);
  
  // Fetch coins when location changes
  useEffect(() => {
    if (currentLocation) {
      fetchNearbyCoins();
    }
  }, [currentLocation, fetchNearbyCoins]);
  
  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNearbyCoins();
    setRefreshing(false);
  }, [fetchNearbyCoins]);
  
  // Sort coins by distance
  const sortedCoins = [...nearbyCoins].sort((a, b) => a.distance_meters - b.distance_meters);
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🗺️</Text>
        <Text style={styles.headerTitle}>Treasure Map</Text>
        {isTracking && (
          <View style={styles.trackingIndicator}>
            <View style={styles.trackingDot} />
            <Text style={styles.trackingText}>GPS Active</Text>
          </View>
        )}
      </View>
      
      {/* Radar View */}
      <View style={styles.radarContainer}>
        {locationLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Acquiring GPS...</Text>
          </View>
        ) : (
          <RadarView coins={sortedCoins} />
        )}
      </View>
      
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{coinCount}</Text>
          <Text style={styles.statLabel}>Coins Nearby</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {closestCoin ? formatDistance(closestCoin.distance_meters) : '--'}
          </Text>
          <Text style={styles.statLabel}>Closest Coin</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>${findLimit.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Find Limit</Text>
        </View>
      </View>
      
      {/* Coin List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Nearby Treasure</Text>
        <ScrollView
          style={styles.coinList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.gold}
            />
          }
        >
          {sortedCoins.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔭</Text>
              <Text style={styles.emptyTitle}>No Treasure Nearby</Text>
              <Text style={styles.emptyText}>
                Keep exploring! Coins appear within 1km of your location.
              </Text>
            </View>
          ) : (
            sortedCoins.map((coin) => (
              <CoinListItem
                key={coin.id}
                coin={coin}
                findLimit={findLimit}
                onPress={handleCoinPress}
              />
            ))
          )}
        </ScrollView>
      </View>
      
      {/* Location Info */}
      {currentLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            📍 {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
          </Text>
        </View>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepSeaBlue,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerIcon: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gold,
    flex: 1,
  },
  trackingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  trackingText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  
  // Radar
  radarContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  loadingContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.silver,
    marginTop: SPACING.sm,
  },
  radar: {
    borderRadius: 125,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderWidth: 2,
    borderColor: COLORS.gold,
    position: 'relative',
  },
  radarRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 999,
  },
  radarRing1: {
    width: '33%',
    height: '33%',
    top: '33.5%',
    left: '33.5%',
  },
  radarRing2: {
    width: '66%',
    height: '66%',
    top: '17%',
    left: '17%',
  },
  radarRing3: {
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  directionLabel: {
    position: 'absolute',
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: 'bold',
  },
  dirLabelN: { top: 5, left: '50%', marginLeft: -4 },
  dirLabelS: { bottom: 5, left: '50%', marginLeft: -4 },
  dirLabelE: { right: 5, top: '50%', marginTop: -8 },
  dirLabelW: { left: 8, top: '50%', marginTop: -8 },
  playerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -15,
    marginLeft: -15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerIcon: {
    fontSize: 24,
  },
  coinMarker: {
    position: 'absolute',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinMarkerIcon: {
    fontSize: 20,
  },
  rangeLabel: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    color: 'rgba(255, 215, 0, 0.5)',
    fontSize: 10,
  },
  
  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  stat: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    minWidth: 90,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.silver,
    marginTop: 2,
  },
  
  // Coin List
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gold,
    marginBottom: SPACING.sm,
  },
  coinList: {
    flex: 1,
  },
  coinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  coinItemLocked: {
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
    borderColor: 'rgba(139, 0, 0, 0.3)',
  },
  coinIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 20,
  },
  coinEmoji: {
    fontSize: 22,
  },
  coinInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  coinValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  coinValueLocked: {
    color: COLORS.pirateRed,
  },
  coinDistance: {
    fontSize: 12,
    color: COLORS.silver,
    marginTop: 2,
  },
  coinStatus: {
    paddingHorizontal: SPACING.sm,
  },
  collectibleText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
  },
  lockedText: {
    fontSize: 11,
    color: COLORS.pirateRed,
    fontWeight: '600',
  },
  distantText: {
    fontSize: 11,
    color: COLORS.silver,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.silver,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  
  // Location Info
  locationInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.1)',
  },
  locationText: {
    fontSize: 11,
    color: 'rgba(255, 215, 0, 0.5)',
  },
});
