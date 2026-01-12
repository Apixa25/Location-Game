# 🏴‍☠️ Black Bart's Gold - Development Log

> **Purpose**: This log helps AI assistants (and humans!) quickly understand what has been built, key decisions made, and patterns established. Read this at the start of new sessions.

---

## 📋 Quick Reference

| Item | Value |
|------|-------|
| **Project Path** | `C:\Users\Admin\Location-Game` |
| **Current Sprint** | Sprint 4 Complete ✅ |
| **Next Sprint** | Sprint 5: User Authentication |
| **Last Updated** | January 11, 2026 |

---

## 🎯 Project Overview

**Black Bart's Gold** is an AR treasure hunting mobile app where players discover virtual coins with real Bitcoin value hidden in real-world locations.

### Core Mechanics
- **Gas System**: $10 = 30 days of play (~$0.33/day consumed)
- **Find Limits**: Can only find coins ≤ your limit; hide bigger coins to unlock bigger finds
- **Default Limit**: $1.00 (hide $5 coin → unlock $5 finds)

### Key Files to Read First
1. `project-vision.md` - Full project philosophy and tech decisions
2. `docs/BUILD-GUIDE.md` - Step-by-step sprint prompts
3. This file - Current progress and patterns

---

## 🛠️ Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | React Native | 0.81.4 |
| AR Library | @reactvision/react-viro | 2.50.1 |
| Language | TypeScript | 5.7+ |
| State | Zustand | 5.0.9 |
| Navigation | React Navigation | 7.x |
| GPS | react-native-geolocation-service | 5.3.1 |
| Haptics | react-native-haptic-feedback | 2.3.3 |

---

## 📁 Project Structure

```
src/
├── screens/              # App screens
│   ├── HomeScreen.tsx
│   ├── PrizeFinderScreen.tsx   # Main AR hunting screen
│   ├── HideCoinScreen.tsx      # Coin hiding wizard
│   ├── MapScreen.tsx
│   ├── WalletScreen.tsx
│   └── SettingsScreen.tsx
├── ar/                   # ViroReact AR components
│   ├── animations.ts     # All registered animations
│   ├── CoinObject.tsx    # 3D coin component
│   ├── PrizeFinderScene.tsx  # Main AR scene
│   └── index.ts
├── components/
│   └── ui/               # HUD overlay components
│       ├── Compass.tsx
│       ├── Crosshairs.tsx
│       ├── FindLimit.tsx
│       ├── FindLimitPopup.tsx  # Locked coin modal
│       ├── MiniMap.tsx
│       ├── GasMeter.tsx
│       ├── PrizeFinderHUD.tsx
│       └── index.ts
├── store/                # Zustand state stores
│   ├── useUserStore.ts   # Auth, balance, gas, find limit
│   ├── useLocationStore.ts  # GPS position, grid
│   ├── useCoinStore.ts   # Nearby coins, selection
│   ├── useAppStore.ts    # AR state, settings
│   └── index.ts
├── services/             # Business logic
│   ├── location.ts       # GPS tracking, distance/bearing
│   ├── haptics.ts        # Proximity vibration feedback
│   ├── coinService.ts    # Collection & hiding logic
│   ├── findLimitService.ts  # Find limit tiers & messaging
│   └── index.ts
├── hooks/                # Custom React hooks
│   ├── useLocation.ts    # Location tracking hook
│   └── index.ts
├── utils/                # Utility functions
│   ├── coordinates.ts    # GPS to AR conversion
│   └── index.ts
├── types/                # TypeScript interfaces
│   ├── coin.ts
│   ├── user.ts
│   ├── location.ts
│   ├── wallet.ts
│   ├── hunt.ts
│   └── index.ts
└── navigation/
    └── AppNavigator.tsx  # Tab + Stack navigation
```

---

## 🎨 Design System

### Colors (Pirate Theme)
```typescript
const COLORS = {
  gold: '#FFD700',        // Primary - buttons, highlights
  deepSeaBlue: '#1A365D', // Background
  pirateRed: '#8B0000',   // Accents, warnings
  parchment: '#F5E6D3',   // Light backgrounds
  darkBrown: '#3D2914',   // Text
  silver: '#C0C0C0',      // Pool coins
  bronze: '#CD7F32',      // Third-tier
  success: '#4ADE80',     // Green - collectible
  warning: '#FBBF24',     // Yellow - low gas
  error: '#EF4444',       // Red - locked/empty
};
```

### Animation Names
```typescript
// Idle (looping)
ANIMATIONS.COIN_IDLE      // Spin + bob
ANIMATIONS.COIN_LOCKED_IDLE  // Slower pulse for locked

// Collection (one-shot)
ANIMATIONS.COIN_COLLECT   // Fly + spin + shrink + fade

// Effects
ANIMATIONS.COIN_PULSE     // Scale up/down on hover
ANIMATIONS.COIN_APPEAR    // Pop into existence
ANIMATIONS.VALUE_POPUP    // +$5.00 floating text
```

---

## ✅ Completed Sprints

### Pre-Development Setup ✅
- [x] React Native project with ViroReact starter kit
- [x] All dependencies installed
- [x] Project folder structure created
- [x] TypeScript configured

### Sprint 1: Project Foundation ✅

#### 1.1 Navigation Setup
- Tab Navigator: Home, Map, Wallet, Settings
- Stack Navigator: PrizeFinder as fullscreen modal
- Pirate-themed styling (gold/blue)

#### 1.2 TypeScript Types
- `src/types/coin.ts` - Coin, CoinType, CoinStatus, ARCoin, CollectionResult
- `src/types/user.ts` - User, UserStats, UserSettings, AuthSession
- `src/types/location.ts` - Coordinates, LocationData, Grid, ARTrackingState
- `src/types/wallet.ts` - Transaction, WalletBalance, GasStatus
- `src/types/hunt.ts` - HuntConfig, HUNT_CONFIGS with all 7 hunt types

#### 1.3 Zustand Store Setup
- `useUserStore` - Auth, balance, gas, find limit (persists to AsyncStorage)
- `useLocationStore` - GPS position, grid tracking
- `useCoinStore` - Nearby coins, selection, collection state
- `useAppStore` - AR state, settings, modals (settings persist)

### Sprint 2: AR Prize Finder Core ✅

#### 2.1 Basic AR Scene
- ViroARSceneNavigator with autofocus
- Tracking state handling (NORMAL/LIMITED/UNAVAILABLE)
- Basic lighting setup

#### 2.2 Animation Registry (`src/ar/animations.ts`)
- Idle: spinCoin, bobUp/Down, coinFloat, coinIdle
- Collection: flyForward, spinFast, shrink, fadeOut, coinCollect
- Effects: pulseUp/Down, coinPulse, lockedPulse
- Appear: scaleUp, fadeIn, coinAppear
- Value popup: floatUp, valueFadeOut, valuePopup

#### 2.3 Coin 3D Component (`src/ar/CoinObject.tsx`)
- ViroBox placeholder (will be .obj model)
- Materials: goldCoin, silverCoin, bronzeCoin, lockedCoin
- ViroText value label with billboard
- ViroParticleEmitter sparkles
- Animation states: idle, collecting, locked, appearing
- Props: id, position, value, coinType, tier, isLocked, isInRange, callbacks

#### 2.4 Test Coins in AR (`src/ar/PrizeFinderScene.tsx`)
- 3 test coins at hardcoded positions
- Collection flow: click → animate → remove → show value popup
- Hover tracking for crosshairs
- Integration with stores

#### 2.5/2.6 Prize Finder HUD (`src/components/ui/`)
- `Compass.tsx` - Direction arrow, cardinal labels, distance
- `Crosshairs.tsx` - Custom design, color states, pulse animation
- `FindLimit.tsx` - Tiered styling, compact mode
- `MiniMap.tsx` - Radar style, coin dots, player position
- `GasMeter.tsx` - Vertical gauge, color coding, flash animation
- `PrizeFinderHUD.tsx` - Combines all, connects to stores

---

### Sprint 3: Location & GPS System ✅

#### 3.1 Location Service (`src/services/location.ts`)
- Permission handling for iOS and Android
- `getCurrentPosition()` - Single GPS reading
- `watchPosition()` - Continuous tracking with callbacks
- `stopWatching()` / `stopAllWatching()` - Cleanup
- Haversine formula for distance calculation
- Bearing calculation with cardinal directions
- `isWithinRadius()` helper

#### 3.2 Location Hook (`src/hooks/useLocation.ts`)
- Auto-start tracking on mount
- Background pause/resume (AppState listener)
- Distance/bearing to selected coin
- Automatic store updates
- Proper cleanup on unmount
- Options: autoStart, distanceFilter, enableHighAccuracy, pauseInBackground

#### 3.3 Haptics Service (`src/services/haptics.ts`)
- Proximity zones: far, approaching, close, veryClose, collectible
- Distance thresholds: 50m, 30m, 15m, 5m
- `startProximityFeedback()` - Auto-adjusting vibration patterns
- `triggerCollectionFeedback()` - Success pattern
- `triggerLockedFeedback()` - Error pattern
- Respects user settings (hapticEnabled)

#### 3.4 Coordinates Utility (`src/utils/coordinates.ts`)
- `gpsToARPosition()` - GPS coords → AR [x, y, z]
- `arPositionToGPS()` - Reverse conversion
- `getARDistance()` / `getARBearing()` - AR position helpers
- `convertCoinsToAR()` - Batch conversion with distances
- `filterCoinsInARRange()` / `sortCoinsByDistance()`

### Sprint 4: Coin System ✅

#### 4.1 Coin Service (`src/services/coinService.ts`)
- `canCollectCoin()` - Validate collection (range, limit, gas)
- `getOverLimitMessage()` / `getOverLimitHint()` - User messaging
- `isCoinLocked()` - Check if above find limit
- `calculatePoolCoinValue()` - Slot machine algorithm for pool coins
- `collectCoin()` / `collectPoolCoin()` - API stubs
- `hideCoin()` / `validateHideLocation()` - Coin hiding

#### 4.2 Find Limit Service (`src/services/findLimitService.ts`)
- `calculateNewFindLimit()` - Based on highest contribution
- `checkFindLimit()` - Returns locked status with messaging
- `getTierForLimit()` - 5 tiers: Cabin Boy, Deck Hand, Treasure Hunter, Captain, Pirate Legend
- `getTierName()` / `getTierColor()` / `getTierProgress()`
- Pirate-themed messaging functions

#### 4.3 Hide Coin Screen (`src/screens/HideCoinScreen.tsx`)
- 4-step wizard: Type → Value → Location → Confirm
- Fixed Value or Pool Contribution selection
- Denomination picker: 5¢ to $100
- Find limit preview (shows what will be unlocked)
- GPS location integration

#### 4.4 Find Limit Popup (`src/components/ui/FindLimitPopup.tsx`)
- Modal shown when tapping locked coins
- Animated shake on lock icon
- Shows coin value, player limit, current tier
- Hint to hide coins for higher limit
- "Hide Coin" button navigation

#### 4.5 CoinObject Sound Support
- ViroSound integration for collection/locked sounds
- Sound enabled flag (for development without audio files)
- Particle effects commented out (needs texture asset)

---

## 🔜 Upcoming Sprints

### Sprint 5: User Authentication (NEXT)
- [ ] Auth service
- [ ] Login/Register screens
- [ ] Protected routes

### Sprint 6: Wallet & Economy
- [ ] Wallet service
- [ ] Gas system
- [ ] Transaction history

### Sprint 7: Backend API
- [ ] Express/Node backend
- [ ] PostgreSQL + PostGIS
- [ ] Core API endpoints

### Sprint 8: Integration & Polish
- [ ] End-to-end testing
- [ ] Error handling
- [ ] Performance optimization
- [ ] UI polish

---

## 📌 Key Patterns & Conventions

### File Naming
- Components: `PascalCase.tsx`
- Services/Utils: `camelCase.ts`
- Stores: `useStoreName.ts`

### Component Structure
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Constants
// 4. Component
// 5. Styles
export const ComponentName: React.FC<Props> = (props) => {
  // State
  // Computed values (useMemo)
  // Callbacks (useCallback)
  // Effects
  // Render
};
```

### Store Pattern
```typescript
// Zustand with persist middleware for user/app stores
// No persist for location/coin stores (should be fresh)
export const useStoreName = create<State & Actions>()(
  persist(
    (set, get) => ({
      // State
      // Actions
    }),
    { name: 'storage-key', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

### User Preferences (from project-vision.md)
- ✅ Include file paths in code blocks
- ✅ Long, clear explanations
- ✅ Use emojis for engagement 🎯
- ✅ Additive code (don't break existing work)
- ✅ Reference project-vision.md
- ✅ Verify code context before suggesting changes

---

## 🐛 Known Issues / TODOs

1. **ViroARSceneNavigator type** - Using type assertion `as () => React.JSX.Element` as workaround
2. **Sound effects** - Placeholders, need actual audio files in `assets/audio/`
3. **3D coin model** - Using ViroBox placeholder, need .obj file in `assets/models/`
4. **GPS integration** - Using mock positions, Sprint 3 will add real GPS

---

## 📝 Important Decisions Made

| Decision | Reason |
|----------|--------|
| React Native + ViroReact over Flutter | Flutter AR plugin abandoned (2022), ViroReact actively maintained |
| Zustand over Redux | Lightweight, simpler, perfect for this app size |
| Separate HUD components | Reusability, cleaner code, easier testing |
| AsyncStorage for persistence | User data and settings survive app restart |
| Grid system for coins | Dynamic distribution, ensures coins in active areas |

---

## 🔄 How to Use This Log

### Starting a New Session
1. Ask the AI to read `project-vision.md` and this file
2. Mention which sprint you want to work on
3. Reference specific files if needed

### After Completing Work
1. Ask the AI to update this log with what was built
2. Ask the AI to update memories if major decisions were made

---

*Last updated by Claude on January 11, 2026*

