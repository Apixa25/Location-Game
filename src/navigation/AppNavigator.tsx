import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  HomeScreen,
  PrizeFinderScreen,
  MapScreen,
  WalletScreen,
  SettingsScreen,
} from '../screens';

export type RootStackParamList = {
  Home: undefined;
  PrizeFinder: undefined;
  Map: undefined;
  Wallet: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1A365D',
          },
          headerTintColor: '#FFD700',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Black Bart's Gold" }}
        />
        <Stack.Screen
          name="PrizeFinder"
          component={PrizeFinderScreen}
          options={{ title: 'Prize Finder', headerShown: false }}
        />
        <Stack.Screen
          name="Map"
          component={MapScreen}
          options={{ title: 'Treasure Map' }}
        />
        <Stack.Screen
          name="Wallet"
          component={WalletScreen}
          options={{ title: 'Treasure Chest' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Captain's Quarters" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
