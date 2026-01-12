// Register Screen for Black Bart's Gold
// New account registration with validation
//
// Reference: docs/BUILD-GUIDE.md - Sprint 5.2: Auth Screens
// Reference: docs/user-accounts-security.md

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  register,
  isValidEmail,
  validatePassword,
  isValidAge,
} from '../../services/authService';
import { useUserStore } from '../../store';

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

const COLORS = {
  background: '#0F172A',
  cardBg: '#1A365D',
  gold: '#FFD700',
  pirateRed: '#8B0000',
  parchment: '#F5E6D3',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0AEC0',
  inputBg: '#0F172A',
  inputBorder: '#334155',
  inputFocus: '#FFD700',
  error: '#EF4444',
  success: '#4ADE80',
};

const AGE_OPTIONS = Array.from({ length: 108 }, (_, i) => i + 13); // 13-120

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const setUser = useUserStore((state) => state.setUser);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [ageError, setAgeError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  const passwordValidation = useMemo(
    () => validatePassword(password),
    [password]
  );

  const passwordsMatch = password === confirmPassword && password.length > 0;

  // ─────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ─────────────────────────────────────────────────────────────────────────

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setAgeError('');
    setTermsError('');
    setGeneralError('');

    // Email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    // Password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.errors[0]);
      isValid = false;
    }

    // Confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    // Age
    if (age === null) {
      setAgeError('Please select your age');
      isValid = false;
    } else if (!isValidAge(age)) {
      setAgeError('You must be at least 13 years old');
      isValid = false;
    }

    // Terms
    if (!acceptedTerms) {
      setTermsError('You must accept the Terms of Service');
      isValid = false;
    }

    return isValid;
  }, [email, password, confirmPassword, age, acceptedTerms, passwordValidation]);

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

  const handleRegister = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setGeneralError('');

    try {
      const result = await register({
        email,
        password,
        confirmPassword,
        age: age!,
        acceptedTerms,
      });

      if (result.success && result.user) {
        // Update user store
        setUser(result.user);
        // Navigation will happen automatically via AppNavigator auth state
      } else {
        setGeneralError(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setGeneralError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, email, password, confirmPassword, age, acceptedTerms, setUser]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Join the Crew! 🏴‍☠️</Text>
            <Text style={styles.subtitle}>
              Create your account to start hunting treasure
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* General Error */}
            {generalError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {generalError}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View
                style={[styles.inputContainer, emailError && styles.inputError]}
              >
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={COLORS.textSecondary}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  passwordError && styles.inputError,
                ]}
              >
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create a strong password"
                  placeholderTextColor={COLORS.textSecondary}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.showPasswordButton}
                >
                  <Text style={styles.showPasswordText}>
                    {showPassword ? '🙈' : '👁️'}
                  </Text>
                </TouchableOpacity>
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
              {/* Password strength indicators */}
              {password.length > 0 && (
                <View style={styles.passwordStrength}>
                  <View
                    style={[
                      styles.strengthDot,
                      password.length >= 8 && styles.strengthDotActive,
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthDot,
                      /[A-Z]/.test(password) && styles.strengthDotActive,
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthDot,
                      /[a-z]/.test(password) && styles.strengthDotActive,
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthDot,
                      /\d/.test(password) && styles.strengthDotActive,
                    ]}
                  />
                  <Text style={styles.strengthText}>
                    {passwordValidation.isValid ? '✓ Strong' : '8+ chars, upper, lower, number'}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  confirmPasswordError && styles.inputError,
                  passwordsMatch && styles.inputSuccess,
                ]}
              >
                <Text style={styles.inputIcon}>🔐</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor={COLORS.textSecondary}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                {passwordsMatch && (
                  <Text style={styles.matchIcon}>✓</Text>
                )}
              </View>
              {confirmPasswordError ? (
                <Text style={styles.errorText}>{confirmPasswordError}</Text>
              ) : null}
            </View>

            {/* Age Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age</Text>
              <TouchableOpacity
                style={[styles.inputContainer, ageError && styles.inputError]}
                onPress={() => setShowAgeDropdown(!showAgeDropdown)}
                disabled={isLoading}
              >
                <Text style={styles.inputIcon}>🎂</Text>
                <Text
                  style={[
                    styles.dropdownText,
                    !age && styles.dropdownPlaceholder,
                  ]}
                >
                  {age ? `${age} years old` : 'Select your age'}
                </Text>
                <Text style={styles.dropdownArrow}>
                  {showAgeDropdown ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              {ageError ? (
                <Text style={styles.errorText}>{ageError}</Text>
              ) : null}
              {showAgeDropdown && (
                <View style={styles.ageDropdown}>
                  <ScrollView
                    style={styles.ageDropdownScroll}
                    nestedScrollEnabled
                  >
                    {AGE_OPTIONS.map((ageOption) => (
                      <TouchableOpacity
                        key={ageOption}
                        style={[
                          styles.ageOption,
                          age === ageOption && styles.ageOptionSelected,
                        ]}
                        onPress={() => {
                          setAge(ageOption);
                          setAgeError('');
                          setShowAgeDropdown(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.ageOptionText,
                            age === ageOption && styles.ageOptionTextSelected,
                          ]}
                        >
                          {ageOption}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => {
                setAcceptedTerms(!acceptedTerms);
                setTermsError('');
              }}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxChecked,
                  termsError && styles.checkboxError,
                ]}
              >
                {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' and '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {termsError ? (
              <Text style={[styles.errorText, { marginTop: 4 }]}>
                {termsError}
              </Text>
            ) : null}

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#1A365D" />
              ) : (
                <Text style={styles.registerButtonText}>
                  ⚓ Join the Crew!
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  // Header
  header: {
    paddingTop: 8,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backButtonText: {
    color: COLORS.gold,
    fontSize: 16,
  },

  // Title Section
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  // Form
  form: {
    marginBottom: 24,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorBannerText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputSuccess: {
    borderColor: COLORS.success,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  showPasswordButton: {
    padding: 8,
  },
  showPasswordText: {
    fontSize: 18,
  },
  matchIcon: {
    fontSize: 18,
    color: COLORS.success,
    marginLeft: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  strengthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.inputBorder,
  },
  strengthDotActive: {
    backgroundColor: COLORS.success,
  },
  strengthText: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Age Dropdown
  dropdownText: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  dropdownPlaceholder: {
    color: COLORS.textSecondary,
  },
  dropdownArrow: {
    fontSize: 12,
    color: COLORS.gold,
  },
  ageDropdown: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  ageDropdownScroll: {
    padding: 8,
  },
  ageOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  ageOptionSelected: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  ageOptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  ageOptionTextSelected: {
    color: COLORS.gold,
    fontWeight: '600',
  },

  // Terms
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  checkboxError: {
    borderColor: COLORS.error,
  },
  checkmark: {
    fontSize: 14,
    color: '#1A365D',
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.gold,
    textDecorationLine: 'underline',
  },

  // Register Button
  registerButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A365D',
  },

  // Login Section
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 16,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;

