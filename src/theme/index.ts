/**
 * Black Bart's Gold Theme
 *
 * Centralized theme configuration for consistent styling.
 * Reference: docs/BUILD-GUIDE.md - Sprint 8.4: UI Polish & Branding
 */

// ═══════════════════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════════════════

export const colors = {
  // Primary Palette
  primary: '#FFD700',       // Gold - main accent
  secondary: '#1A365D',     // Deep Sea Blue - backgrounds
  accent: '#8B0000',        // Pirate Red - buttons, alerts

  // UI Colors
  background: '#1A365D',
  backgroundLight: '#2A4B7C',
  backgroundDark: '#0F2440',
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceHover: 'rgba(255, 255, 255, 0.12)',

  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#8B9DC3',
  textMuted: 'rgba(139, 157, 195, 0.7)',
  textGold: '#FFD700',

  // Semantic Colors
  success: '#4ADE80',
  successDark: '#22C55E',
  warning: '#F97316',
  warningDark: '#C2410C',
  error: '#EF4444',
  errorDark: '#DC2626',
  info: '#3B82F6',

  // Coin Colors
  coinGold: '#FFD700',
  coinSilver: '#C0C0C0',
  coinBronze: '#CD7F32',
  coinLocked: '#8B4513',

  // Gas Meter Colors
  gasFull: '#22C55E',
  gasHigh: '#84CC16',
  gasMedium: '#EAB308',
  gasLow: '#F97316',
  gasEmpty: '#EF4444',

  // Tier Colors
  tierCabinBoy: '#8B9DC3',
  tierDeckHand: '#CD7F32',
  tierTreasureHunter: '#C0C0C0',
  tierCaptain: '#FFD700',
  tierPirateLegend: '#8A2BE2',

  // Transparency helpers
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// ═══════════════════════════════════════════════════════════════════════════
// SPACING
// ═══════════════════════════════════════════════════════════════════════════

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Specific uses
  screenPadding: 20,
  cardPadding: 16,
  inputPadding: 15,
  buttonPadding: 14,
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════════════════

export const typography = {
  // Font families (can be customized with custom fonts)
  fontFamily: {
    regular: 'System',
    bold: 'System',
    mono: 'Menlo',
  },

  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    display: 36,
    hero: 48,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// BORDERS & SHADOWS
// ═══════════════════════════════════════════════════════════════════════════

export const borders = {
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  width: {
    thin: 1,
    medium: 2,
    thick: 3,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gold: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION
// ═══════════════════════════════════════════════════════════════════════════

export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },

  easing: {
    // These are string values for use with Animated.timing
    default: 'ease-out',
    bounce: 'ease-in-out',
    spring: {
      friction: 7,
      tension: 40,
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Z-INDEX
// ═══════════════════════════════════════════════════════════════════════════

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  overlay: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
};

// ═══════════════════════════════════════════════════════════════════════════
// THEME OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export const theme = {
  colors,
  spacing,
  typography,
  borders,
  shadows,
  animation,
  zIndex,
};

export default theme;

