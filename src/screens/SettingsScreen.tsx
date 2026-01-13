import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useShallow } from 'zustand/react/shallow';
import { useAuth } from '../hooks/useAuth';
import { useUserStore } from '../store';

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Use useShallow to prevent getSnapshot warnings
  const { bbgBalance, gasRemaining, findLimit } = useUserStore(
    useShallow((state) => ({
      bbgBalance: state.bbgBalance,
      gasRemaining: state.gasRemaining,
      findLimit: state.findLimit,
    }))
  );
  
  const [hapticEnabled, setHapticEnabled] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out, Captain?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            // Navigate to onboarding/login
            // @ts-ignore
            navigation.reset({
              index: 0,
              routes: [{ name: 'Onboarding' }],
            });
          }
        },
      ]
    );
  };

  const handleSignIn = () => {
    // @ts-ignore
    navigation.navigate('Onboarding');
  };

  const SettingRow = ({
    icon,
    label,
    value,
    onPress,
    hasSwitch,
    switchValue,
    onSwitchChange,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress?: () => void;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
  }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#3D4A5C', true: '#FFD700' }}
          thumbColor={switchValue ? '#FFFFFF' : '#8B9DC3'}
        />
      ) : (
        <View style={styles.settingRight}>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          <Text style={styles.arrow}>›</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.profileCard}>
          <Text style={styles.avatar}>🏴‍☠️</Text>
          <View>
            <Text style={styles.username}>
              {isAuthenticated ? `Captain ${user?.email?.split('@')[0] || 'Pirate'}` : 'Captain Guest'}
            </Text>
            <Text style={styles.email}>
              {isAuthenticated ? user?.email : 'Not signed in'}
            </Text>
          </View>
        </View>
        {isAuthenticated ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
            <Text style={styles.signInButtonText}>Sign In / Register</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingRow
          icon="📳"
          label="Haptic Feedback"
          hasSwitch
          switchValue={hapticEnabled}
          onSwitchChange={setHapticEnabled}
        />
        <SettingRow
          icon="🔊"
          label="Sound Effects"
          hasSwitch
          switchValue={soundEnabled}
          onSwitchChange={setSoundEnabled}
        />
        <SettingRow icon="🌙" label="Display Mode" value="Auto" />
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        <SettingRow icon="🪙" label="Coins Found" value="0" />
        <SettingRow icon="📍" label="Coins Hidden" value="0" />
        <SettingRow icon="💰" label="BBG Balance" value={`$${bbgBalance.toFixed(2)}`} />
        <SettingRow icon="⛽" label="Gas Remaining" value={`${gasRemaining} days`} />
        <SettingRow icon="🎯" label="Find Limit" value={`$${(findLimit || 1).toFixed(2)}`} />
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <SettingRow icon="❓" label="How to Play" />
        <SettingRow icon="📧" label="Contact Us" />
        <SettingRow icon="📜" label="Terms of Service" />
        <SettingRow icon="🔒" label="Privacy Policy" />
      </View>

      <Text style={styles.version}>Version 0.0.1 (MVP)</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A365D',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.2)',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 10,
    gap: 15,
  },
  avatar: {
    fontSize: 40,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  email: {
    fontSize: 12,
    color: '#8B9DC3',
    marginTop: 2,
  },
  signInButton: {
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  signInButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A365D',
  },
  logoutButton: {
    backgroundColor: '#8B0000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    fontSize: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: '#8B9DC3',
  },
  arrow: {
    fontSize: 20,
    color: '#8B9DC3',
  },
  version: {
    fontSize: 12,
    color: '#8B9DC3',
    textAlign: 'center',
    padding: 20,
  },
});
