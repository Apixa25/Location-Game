// Onboarding Screen for Black Bart's Gold
// Welcome screen with branding and auth options
//
// Reference: docs/BUILD-GUIDE.md - Sprint 5.2: Auth Screens
// Reference: docs/user-accounts-security.md - Onboarding Flow

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  background: '#0F172A',
  cardBg: '#1A365D',
  gold: '#FFD700',
  pirateRed: '#8B0000',
  parchment: '#F5E6D3',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0AEC0',
  deepSea: '#0C2D48',
};

const HOW_IT_WORKS = [
  {
    icon: '🗺️',
    title: 'Explore',
    description: 'Walk around your neighborhood with the Prize Finder',
  },
  {
    icon: '🪙',
    title: 'Discover',
    description: 'Find virtual coins hidden in real-world locations',
  },
  {
    icon: '💰',
    title: 'Collect',
    description: 'Collect coins with real value in your wallet',
  },
  {
    icon: '🏴‍☠️',
    title: 'Hide',
    description: 'Hide your own treasure for others to find',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* HERO SECTION */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.heroSection}>
          {/* Logo / Brand Mark */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🏴‍☠️</Text>
            <Text style={styles.logoText}>Black Bart's</Text>
            <Text style={styles.logoGold}>GOLD</Text>
          </View>

          {/* Tagline */}
          <Text style={styles.tagline}>
            Hunt for real treasure in the real world
          </Text>

          {/* Coin decoration */}
          <View style={styles.coinRow}>
            <Text style={styles.coinEmoji}>🪙</Text>
            <Text style={styles.coinEmoji}>🪙</Text>
            <Text style={styles.coinEmoji}>🪙</Text>
          </View>
        </View>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* AUTH BUTTONS */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.authSection}>
          {/* Create Account - Primary CTA */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>⚓ Create Account</Text>
          </TouchableOpacity>

          {/* Login - Secondary */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Login</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => {
              // TODO: Implement Google OAuth
              console.log('[Onboarding] Google sign in pressed');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* HOW IT WORKS */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.howItWorksSection}>
          <TouchableOpacity
            style={styles.howItWorksHeader}
            onPress={() => setShowHowItWorks(!showHowItWorks)}
            activeOpacity={0.7}
          >
            <Text style={styles.howItWorksTitle}>How It Works</Text>
            <Text style={styles.howItWorksArrow}>
              {showHowItWorks ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showHowItWorks && (
            <View style={styles.howItWorksContent}>
              {HOW_IT_WORKS.map((item, index) => (
                <View key={index} style={styles.howItWorksItem}>
                  <View style={styles.howItWorksIconContainer}>
                    <Text style={styles.howItWorksIcon}>{item.icon}</Text>
                  </View>
                  <View style={styles.howItWorksTextContainer}>
                    <Text style={styles.howItWorksItemTitle}>{item.title}</Text>
                    <Text style={styles.howItWorksItemDesc}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Subscription note */}
              <View style={styles.subscriptionNote}>
                <Text style={styles.subscriptionIcon}>💎</Text>
                <Text style={styles.subscriptionText}>
                  $10/month unlocks the Prize Finder and lets you hunt for real
                  treasure with real value!
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* FOOTER */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text>
            {' and '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingTop: SCREEN_HEIGHT * 0.08,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '300',
    color: COLORS.parchment,
    letterSpacing: 2,
  },
  logoGold: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.gold,
    letterSpacing: 8,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  coinRow: {
    flexDirection: 'row',
    gap: 16,
  },
  coinEmoji: {
    fontSize: 32,
  },

  // Auth Section
  authSection: {
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A365D',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.textPrimary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  // How It Works
  howItWorksSection: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  howItWorksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  howItWorksArrow: {
    fontSize: 14,
    color: COLORS.gold,
  },
  howItWorksContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  howItWorksItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  howItWorksIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  howItWorksIcon: {
    fontSize: 24,
  },
  howItWorksTextContainer: {
    flex: 1,
  },
  howItWorksItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  howItWorksItemDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  subscriptionNote: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'flex-start',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  subscriptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  subscriptionText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.parchment,
    lineHeight: 18,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: COLORS.gold,
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;

