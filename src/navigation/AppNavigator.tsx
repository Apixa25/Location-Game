// App Navigator for Black Bart's Gold
// Handles auth flow and main app navigation
//
// Reference: docs/BUILD-GUIDE.md - Sprint 5.3: Protected Routes & Session

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import {
  HomeScreen,
  PrizeFinderScreen,
  MapScreen,
  WalletScreen,
  SettingsScreen,
  HideCoinScreen,
  OnboardingScreen,
  LoginScreen,
  RegisterScreen,
} from '../screens';
import { useAuth } from '../hooks';

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  PrizeFinder: undefined;
  HideCoin: undefined;
};

export type TabParamList = {
  Home: undefined;
  Map: undefined;
  Wallet: undefined;
  Settings: undefined;
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATORS
// ═══════════════════════════════════════════════════════════════════════════

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ═══════════════════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  background: '#0F172A',
  deepSeaBlue: '#1A365D',
  gold: '#FFD700',
  tabInactive: '#8B9DC3',
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tab icon component using emoji
 */
const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
);

/**
 * Loading screen shown while checking auth
 */
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingIcon}>🏴‍☠️</Text>
    <Text style={styles.loadingTitle}>Black Bart's Gold</Text>
    <ActivityIndicator size="large" color={COLORS.gold} style={styles.spinner} />
    <Text style={styles.loadingText}>Checking your treasure map...</Text>
  </View>
);

/**
 * Auth Stack - Shown when user is not authenticated
 */
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </AuthStack.Navigator>
  );
};

/**
 * Bottom Tab Navigator - Main app tabs
 */
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.deepSeaBlue,
        },
        headerTintColor: COLORS.gold,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: COLORS.deepSeaBlue,
          borderTopColor: COLORS.gold,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.tabInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Black Bart's Gold",
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Treasure Map',
          tabBarLabel: 'Map',
          tabBarIcon: ({ focused }) => <TabIcon icon="🗺️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          title: 'Treasure Chest',
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ focused }) => <TabIcon icon="💰" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Captain's Quarters",
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Main Stack Navigator - Full app with modals
 */
const MainNavigator = () => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen name="MainTabs" component={TabNavigator} />
      <RootStack.Screen
        name="PrizeFinder"
        component={PrizeFinderScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
      <RootStack.Screen
        name="HideCoin"
        component={HideCoinScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </RootStack.Navigator>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ROOT NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AppNavigator - Root navigation component
 *
 * Handles:
 * - Auth state checking on app launch
 * - Showing loading screen during auth check
 * - Routing to auth stack or main app based on auth state
 */
export const AppNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading screen while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: 32,
    textAlign: 'center',
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
  },
});

export default AppNavigator;
