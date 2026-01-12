// Hide Coin Screen for Black Bart's Gold
// Allows users to hide coins for other players to find
//
// Reference: docs/BUILD-GUIDE.md - Sprint 4.3: Coin Hiding Flow
// Reference: docs/coins-and-collection.md - Coin Placement
// Reference: docs/economy-and-currency.md - Finding Limits

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useUserStore, useLocationStore } from '../store';
import { hideCoin } from '../services/coinService';
import {
  calculateNewFindLimit,
  getTierForLimit,
  getLimitIncreaseMessage,
} from '../services/findLimitService';
import type { CoinType } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type RootStackParamList = {
  MainTabs: undefined;
  PrizeFinder: undefined;
  HideCoin: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type HideStep = 'type' | 'value' | 'location' | 'confirm';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  background: '#0F172A',
  cardBg: '#1A365D',
  gold: '#FFD700',
  pirateRed: '#8B0000',
  parchment: '#F5E6D3',
  success: '#4ADE80',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0AEC0',
  buttonDisabled: '#374151',
  fixed: '#3B82F6',
  pool: '#8B5CF6',
};

const DENOMINATIONS = [
  { value: 0.05, label: '5¢' },
  { value: 0.10, label: '10¢' },
  { value: 0.25, label: '25¢' },
  { value: 0.50, label: '50¢' },
  { value: 1.0, label: '$1' },
  { value: 5.0, label: '$5' },
  { value: 10.0, label: '$10' },
  { value: 25.0, label: '$25' },
  { value: 50.0, label: '$50' },
  { value: 100.0, label: '$100' },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const HideCoinScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // ─────────────────────────────────────────────────────────────────────────
  // STORE STATE
  // ─────────────────────────────────────────────────────────────────────────

  const userId = useUserStore((state) => state.userId);
  const bbgBalance = useUserStore((state) => state.bbgBalance);
  const findLimit = useUserStore((state) => state.findLimit);
  const updateBalance = useUserStore((state) => state.updateBalance);
  const setFindLimit = useUserStore((state) => state.setFindLimit);

  const currentLocation = useLocationStore((state) => state.currentLocation);

  // ─────────────────────────────────────────────────────────────────────────
  // LOCAL STATE
  // ─────────────────────────────────────────────────────────────────────────

  const [step, setStep] = useState<HideStep>('type');
  const [coinType, setCoinType] = useState<CoinType | null>(null);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [isHiding, setIsHiding] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  const newFindLimit = useMemo(() => {
    if (selectedValue === null) return findLimit;
    return calculateNewFindLimit(findLimit, selectedValue);
  }, [selectedValue, findLimit]);

  const willIncreaseFindLimit = newFindLimit > findLimit;

  const currentTier = getTierForLimit(findLimit);
  const newTier = getTierForLimit(newFindLimit);
  const willChangeTier = currentTier.id !== newTier.id;

  const canAfford = (value: number) => value <= bbgBalance;

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const handleSelectType = useCallback((type: CoinType) => {
    setCoinType(type);
    setStep('value');
  }, []);

  const handleSelectValue = useCallback((value: number) => {
    setSelectedValue(value);
    setStep('location');
  }, []);

  const handleConfirmLocation = useCallback(() => {
    if (!currentLocation) {
      Alert.alert(
        'Location Required',
        'Unable to determine your location. Please ensure GPS is enabled.',
        [{ text: 'OK' }]
      );
      return;
    }
    setStep('confirm');
  }, [currentLocation]);

  const handleHideCoin = useCallback(async () => {
    if (!coinType || selectedValue === null || !currentLocation || !userId) {
      return;
    }

    setIsHiding(true);

    try {
      // Hide the coin
      await hideCoin(coinType, selectedValue, currentLocation, userId);

      // Update balance
      updateBalance(-selectedValue);

      // Update find limit if applicable
      if (willIncreaseFindLimit) {
        setFindLimit(newFindLimit);
      }

      // Show success message
      Alert.alert(
        '🏴‍☠️ Coin Hidden!',
        willIncreaseFindLimit
          ? getLimitIncreaseMessage(findLimit, newFindLimit)
          : `Your $${selectedValue.toFixed(2)} coin is now hidden for other pirates to find!`,
        [
          {
            text: 'Arrr!',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to hide coin. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsHiding(false);
    }
  }, [
    coinType,
    selectedValue,
    currentLocation,
    userId,
    willIncreaseFindLimit,
    newFindLimit,
    findLimit,
    updateBalance,
    setFindLimit,
    navigation,
  ]);

  const handleBack = useCallback(() => {
    switch (step) {
      case 'value':
        setCoinType(null);
        setStep('type');
        break;
      case 'location':
        setSelectedValue(null);
        setStep('value');
        break;
      case 'confirm':
        setStep('location');
        break;
      default:
        navigation.goBack();
    }
  }, [step, navigation]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER STEP 1: CHOOSE TYPE
  // ─────────────────────────────────────────────────────────────────────────

  const renderTypeStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Coin Type</Text>
      <Text style={styles.stepSubtitle}>
        How do you want to hide your treasure?
      </Text>

      <TouchableOpacity
        style={[styles.typeCard, { borderColor: COLORS.fixed }]}
        onPress={() => handleSelectType('fixed')}
        activeOpacity={0.8}
      >
        <View style={[styles.typeIconContainer, { backgroundColor: COLORS.fixed }]}>
          <Text style={styles.typeIcon}>💰</Text>
        </View>
        <View style={styles.typeContent}>
          <Text style={styles.typeName}>Fixed Value</Text>
          <Text style={styles.typeDescription}>
            Hide exact amount. Finder gets this value. Creates races for known prizes!
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.typeCard, { borderColor: COLORS.pool }]}
        onPress={() => handleSelectType('pool')}
        activeOpacity={0.8}
      >
        <View style={[styles.typeIconContainer, { backgroundColor: COLORS.pool }]}>
          <Text style={styles.typeIcon}>🎰</Text>
        </View>
        <View style={styles.typeContent}>
          <Text style={styles.typeName}>Pool Contribution</Text>
          <Text style={styles.typeDescription}>
            Contribute to mystery pool. Finder gets random value - could be more or less!
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER STEP 2: SET VALUE
  // ─────────────────────────────────────────────────────────────────────────

  const renderValueStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        {coinType === 'fixed' ? 'Set Coin Value' : 'Set Contribution'}
      </Text>
      <Text style={styles.stepSubtitle}>
        {coinType === 'fixed'
          ? 'This exact amount will go to the finder'
          : 'Contribute to the mystery pool'}
      </Text>

      {/* Balance display */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Your Balance</Text>
        <Text style={styles.balanceValue}>${bbgBalance.toFixed(2)}</Text>
      </View>

      {/* Denomination grid */}
      <View style={styles.denomGrid}>
        {DENOMINATIONS.map((denom) => {
          const affordable = canAfford(denom.value);
          const selected = selectedValue === denom.value;
          return (
            <TouchableOpacity
              key={denom.value}
              style={[
                styles.denomButton,
                selected && styles.denomButtonSelected,
                !affordable && styles.denomButtonDisabled,
              ]}
              onPress={() => affordable && handleSelectValue(denom.value)}
              disabled={!affordable}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.denomText,
                  selected && styles.denomTextSelected,
                  !affordable && styles.denomTextDisabled,
                ]}
              >
                {denom.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Find limit preview */}
      {selectedValue && willIncreaseFindLimit && (
        <View style={styles.limitPreview}>
          <Text style={styles.limitPreviewIcon}>⬆️</Text>
          <Text style={styles.limitPreviewText}>
            This will unlock{' '}
            <Text style={styles.limitPreviewAmount}>
              ${newFindLimit.toFixed(2)}
            </Text>{' '}
            finds!
          </Text>
          {willChangeTier && (
            <Text style={styles.tierChange}>
              {newTier.icon} Reaching {newTier.name}!
            </Text>
          )}
        </View>
      )}
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER STEP 3: LOCATION
  // ─────────────────────────────────────────────────────────────────────────

  const renderLocationStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Location</Text>
      <Text style={styles.stepSubtitle}>
        Where will you hide this treasure?
      </Text>

      {/* Current location option */}
      <TouchableOpacity
        style={styles.locationCard}
        onPress={handleConfirmLocation}
        activeOpacity={0.8}
      >
        <View style={styles.locationIconContainer}>
          <Text style={styles.locationIcon}>📍</Text>
        </View>
        <View style={styles.locationContent}>
          <Text style={styles.locationTitle}>My Current Location</Text>
          {currentLocation ? (
            <Text style={styles.locationCoords}>
              {currentLocation.latitude.toFixed(6)},{' '}
              {currentLocation.longitude.toFixed(6)}
            </Text>
          ) : (
            <Text style={styles.locationError}>
              Waiting for GPS...
            </Text>
          )}
        </View>
        <Text style={styles.locationArrow}>→</Text>
      </TouchableOpacity>

      {/* Map placeholder - would be interactive map in production */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderIcon}>🗺️</Text>
        <Text style={styles.mapPlaceholderText}>
          Map view coming in Sprint 3!
        </Text>
        <Text style={styles.mapPlaceholderSubtext}>
          For now, use your current location
        </Text>
      </View>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER STEP 4: CONFIRM
  // ─────────────────────────────────────────────────────────────────────────

  const renderConfirmStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Confirm Hide</Text>
      <Text style={styles.stepSubtitle}>
        Review your treasure before hiding
      </Text>

      <View style={styles.summaryCard}>
        {/* Type */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Type</Text>
          <View style={styles.summaryValueContainer}>
            <Text style={styles.summaryIcon}>
              {coinType === 'fixed' ? '💰' : '🎰'}
            </Text>
            <Text style={styles.summaryValue}>
              {coinType === 'fixed' ? 'Fixed Value' : 'Pool Contribution'}
            </Text>
          </View>
        </View>

        {/* Value */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            {coinType === 'fixed' ? 'Value' : 'Contribution'}
          </Text>
          <Text style={[styles.summaryValue, styles.summaryValueGold]}>
            ${selectedValue?.toFixed(2)}
          </Text>
        </View>

        {/* Location */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Location</Text>
          <Text style={styles.summaryValue}>
            📍 Current Position
          </Text>
        </View>

        {/* Find limit effect */}
        {willIncreaseFindLimit && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Find Limit</Text>
            <Text style={[styles.summaryValue, styles.summaryValueSuccess]}>
              ${findLimit.toFixed(2)} → ${newFindLimit.toFixed(2)} ⬆️
            </Text>
          </View>
        )}

        {/* Balance after */}
        <View style={[styles.summaryRow, styles.summaryRowLast]}>
          <Text style={styles.summaryLabel}>Balance After</Text>
          <Text style={styles.summaryValue}>
            ${(bbgBalance - (selectedValue || 0)).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Hide button */}
      <TouchableOpacity
        style={[styles.hideButton, isHiding && styles.hideButtonDisabled]}
        onPress={handleHideCoin}
        disabled={isHiding}
        activeOpacity={0.8}
      >
        <Text style={styles.hideButtonText}>
          {isHiding ? 'Hiding...' : '🏴‍☠️ Hide Coin!'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hide Treasure</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {['type', 'value', 'location', 'confirm'].map((s, index) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              step === s && styles.progressDotActive,
              ['type', 'value', 'location', 'confirm'].indexOf(step) > index &&
                styles.progressDotComplete,
            ]}
          />
        ))}
      </View>

      {/* Step content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 'type' && renderTypeStep()}
        {step === 'value' && renderValueStep()}
        {step === 'location' && renderLocationStep()}
        {step === 'confirm' && renderConfirmStep()}
      </ScrollView>
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: COLORS.gold,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSpacer: {
    width: 60,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressDotActive: {
    backgroundColor: COLORS.gold,
    width: 24,
  },
  progressDotComplete: {
    backgroundColor: COLORS.success,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },

  // Type selection
  typeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  typeIcon: {
    fontSize: 28,
  },
  typeContent: {
    flex: 1,
  },
  typeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Value selection
  balanceContainer: {
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  denomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  denomButton: {
    width: (SCREEN_WIDTH - 32 - 48) / 5,
    aspectRatio: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  denomButtonSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  denomButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
    opacity: 0.5,
  },
  denomText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  denomTextSelected: {
    color: COLORS.gold,
  },
  denomTextDisabled: {
    color: COLORS.textSecondary,
  },
  limitPreview: {
    marginTop: 24,
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  limitPreviewIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  limitPreviewText: {
    fontSize: 16,
    color: COLORS.parchment,
    textAlign: 'center',
  },
  limitPreviewAmount: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  tierChange: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: '600',
  },

  // Location
  locationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
    marginBottom: 16,
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  locationIcon: {
    fontSize: 24,
  },
  locationContent: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  locationError: {
    fontSize: 12,
    color: COLORS.pirateRed,
  },
  locationArrow: {
    fontSize: 20,
    color: COLORS.gold,
  },
  mapPlaceholder: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  mapPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    opacity: 0.7,
  },

  // Confirm
  summaryCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryIcon: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  summaryValueGold: {
    color: COLORS.gold,
  },
  summaryValueSuccess: {
    color: COLORS.success,
  },
  hideButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  hideButtonDisabled: {
    opacity: 0.6,
  },
  hideButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A365D',
  },
});

export default HideCoinScreen;

