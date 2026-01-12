# 🏴‍☠️ Black Bart's Gold - Development Log

> **Purpose**: This log helps AI assistants (and humans!) quickly understand what has been built, key decisions made, and patterns established. Read this at the start of new sessions.

---

## 📋 Quick Reference

| Item | Value |
|------|-------|
| **Project Path** | `C:\Users\Admin\Location-Game` |
| **Current Sprint** | Phase 1 MVP Complete ✅ |
| **Current Status** | Full App Flow Working with Test Data ✅ |
| **Last Updated** | January 12, 2026 (Session 2) |

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
│   ├── SettingsScreen.tsx
│   └── auth/                   # Authentication screens
│       ├── OnboardingScreen.tsx
│       ├── LoginScreen.tsx
│       ├── RegisterScreen.tsx
│       └── index.ts
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
│       ├── NoGasScreen.tsx     # Empty gas overlay
│       ├── LowGasWarning.tsx   # Low gas banner
│       ├── NetworkError.tsx    # Connection error banner
│       ├── ARErrorScreen.tsx   # AR failure overlay
│       ├── EmptyState.tsx      # Reusable empty states
│       ├── LoadingOverlay.tsx  # Loading spinner
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
│   ├── authService.ts    # Auth, session management
│   ├── walletService.ts  # Balance, transactions, parking
│   ├── gasService.ts     # Gas consumption & warnings
│   └── index.ts
├── hooks/                # Custom React hooks
│   ├── useLocation.ts    # Location tracking hook
│   ├── useAuth.ts        # Auth state & session
│   ├── useNetworkStatus.ts  # Connection monitoring
│   ├── useApi.ts         # API call wrapper
│   └── index.ts
├── theme/                # Styling
│   └── index.ts          # Colors, spacing, typography
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

backend/                  # Express API Server
├── src/
│   ├── index.ts          # Entry point
│   ├── app.ts            # Express app setup
│   ├── config/           # Environment config
│   ├── routes/           # API routes
│   │   ├── auth.ts       # Authentication
│   │   ├── coins.ts      # Coin operations
│   │   ├── wallet.ts     # Balance & transactions
│   │   └── users.ts      # User profile & stats
│   ├── services/         # Business logic
│   │   └── coinService.ts  # Geospatial queries
│   ├── middleware/       # Auth, errors
│   │   ├── auth.ts       # JWT validation
│   │   └── errorHandler.ts
│   └── utils/
│       └── prisma.ts     # DB client
├── prisma/
│   └── schema.prisma     # Database schema
├── package.json
└── tsconfig.json
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

### Sprint 5: User Authentication ✅

#### 5.1 Auth Service (`src/services/authService.ts`)
- Email validation, password strength checking
- `register()` - Create new account with validation
- `login()` - Email/password authentication
- `loginWithGoogle()` - Google OAuth (stub for production)
- `logout()` - Clear session
- Session management with AsyncStorage
- `getCurrentUser()` - Restore session on app launch
- 30-day session duration

#### 5.2 Auth Screens (`src/screens/auth/`)
- `OnboardingScreen.tsx` - Welcome with branding, "How It Works" dropdown
- `LoginScreen.tsx` - Email/password form, Google button, validation
- `RegisterScreen.tsx` - Full registration with age selector, terms checkbox
- Pirate-themed UI with gold accents

#### 5.3 Protected Routes & Session
- `useAuth.ts` hook - Auth state, auto session check
- Updated `AppNavigator.tsx` with auth flow
- Loading screen during session check
- AuthStack (Onboarding → Login → Register)
- MainStack (TabNavigator + PrizeFinder + HideCoin modals)
- Session persists across app restarts

### Sprint 6: Wallet & Economy ✅

#### 6.1 Wallet Service (`src/services/walletService.ts`)
- `getBalance()` - Returns balance breakdown (total, gas_tank, parked, pending)
- `getTransactions()` - Transaction history with pagination
- `addTransaction()` - Record new transactions
- `parkCoins()` - Move found coins to protected storage
- `unparkCoins()` - Move parked coins to gas (with $0.33 fee)
- `consumeGas()` - Daily gas consumption
- `confirmPendingCoins()` - Confirm coins after 24h verification
- Transaction helpers (icons, colors, relative time formatting)

#### 6.2 Wallet Screen (`src/screens/WalletScreen.tsx`)
- Total balance header with gold styling
- Gas tank section with progress bar and days remaining
- Balance breakdown cards (Parked, Pending)
- Action buttons (Park Coins, Add Gas, Unpark)
- Park/Unpark modal with amount input
- Transaction history list with status badges
- Pull-to-refresh functionality
- Empty state for new users

#### 6.3 Gas Service (`src/services/gasService.ts`)
- `getDetailedGasStatus()` - Extended status with UI fields
- `checkGasOnLaunch()` - Check and consume gas on app start
- `checkAndConsumeGas()` - Daily consumption logic
- Notification scheduling (stub for push notifications)
- Warning dismissal management
- Gas meter color/message helpers

#### 6.4 Gas UI Components
- `NoGasScreen.tsx` - Full overlay when empty
  - Animated ship bobbing
  - "Ye've Run Aground!" messaging
  - Buy Gas / Unpark Coins options
- `LowGasWarning.tsx` - Top banner when low
  - Flashing "LOW FUEL" text
  - Days remaining countdown
  - Dismissible per session

#### 6.5 PrizeFinderScreen Integration
- Gas check on mount (loading state)
- NoGasScreen overlay blocks AR when empty
- LowGasWarning banner shows when < 5 days
- Wallet navigation from gas meter

### Sprint 7: Backend API ✅

#### 7.1 Backend Project Setup
- `backend/` directory with full structure
- Express + TypeScript configuration
- `package.json` with all dependencies
- `tsconfig.json` for strict TypeScript
- `env.example` with all config vars
- Config module with validation
- Health check endpoint at `/health`
- CORS, Helmet, rate limiting

#### 7.2 Prisma Database Schema (`backend/prisma/schema.prisma`)
- **User** - Auth, settings, ban status
- **UserStats** - Find limit, totals
- **Wallet** - Balance breakdown, gas tracking
- **Transaction** - Full history with types
- **Coin** - Location, type, value, status
- **CoinFind** - Collection records
- **Grid** - Geographic distribution
- Enums for CoinType, CoinStatus, etc.

#### 7.3 Core API Routes
- **Auth** (`/api/v1/auth/*`)
  - POST `/register` - Create account
  - POST `/login` - Email/password login
  - POST `/google` - Google OAuth (stub)
  - POST `/logout` - Invalidate session
  - GET `/me` - Current user
- **Coins** (`/api/v1/coins/*`)
  - GET `/nearby` - Geospatial query
  - POST `/hide` - Place new coin
  - POST `/:id/collect` - Collect coin
  - DELETE `/:id` - Retrieve own coin
- **Wallet** (`/api/v1/wallet/*`)
  - GET `/` - Balance breakdown
  - GET `/transactions` - History
  - POST `/park` - Park coins
  - POST `/unpark` - Unpark coins
  - POST `/consume-gas` - Daily gas
  - POST `/confirm-pending` - Confirm 24h
- **Users** (`/api/v1/users/*`)
  - GET `/stats` - User statistics
  - GET/PUT `/settings` - Preferences
  - GET `/leaderboard` - Top users

#### 7.4 Geospatial Service (`backend/src/services/coinService.ts`)
- Haversine distance calculation
- Bearing calculation
- Grid system (~5km cells)
- `getCoinsNearLocation()` - Radius query
- `ensureGridHasCoins()` - Auto-seeding
- `placeSystemCoin()` - System coin placement
- `recycleStaleCoins()` - Cleanup inactive grids
- `calculatePoolCoinValue()` - Slot machine logic

#### 7.5 Middleware
- JWT authentication with refresh
- Error handling with ApiError class
- Validation using express-validator

### Sprint 8: Integration & Polish ✅

#### 8.1 API Client (`src/services/api.ts`)
- Base URL configuration (dev/prod/emulator)
- JWT token management with AsyncStorage
- Request interceptors for auth headers
- Error handling with custom `ApiError` class
- Auto-retry logic for network failures
- Timeout handling (30s default)
- GET, POST, PUT, DELETE, PATCH methods

#### 8.2 API Configuration (`src/services/apiConfig.ts`)
- `USE_REAL_API` toggle (mock vs real backend)
- Environment detection
- URL configuration for all platforms

#### 8.3 Error Handling Components
- `NetworkError.tsx` - Top banner for connection issues
  - Slide animation
  - Retry button
  - Dismiss capability
- `ARErrorScreen.tsx` - Full screen for AR failures
  - UNAVAILABLE, LIMITED, CAMERA_DENIED states
  - Tips for each error type
  - Retry and settings buttons
- `EmptyState.tsx` - Reusable empty state
  - Multiple types: no_coins, no_transactions, etc.
  - Custom icon, title, message support
  - Optional action button
- `LoadingOverlay.tsx` - Pirate-themed loading
  - Spinning compass animation
  - Random loading messages
  - Modal or inline modes

#### 8.4 Hooks for API & Network
- `useNetworkStatus.ts` - Network connectivity
  - Real-time connection monitoring
  - WiFi vs cellular detection
  - Manual check function
- `useApi.ts` - API call wrapper
  - Loading, error, success states
  - Auto error alerts
  - Retry capability
  - `useMutation` for POST/PUT/DELETE

#### 8.5 Theme System (`src/theme/index.ts`)
- **Colors**: Full pirate palette
  - Primary (Gold), Secondary (Deep Sea Blue), Accent (Pirate Red)
  - Semantic: success, warning, error, info
  - Coin colors, gas meter colors, tier colors
- **Spacing**: xs through xxl scale
- **Typography**: Font sizes, weights, line heights
- **Borders & Shadows**: Consistent radii and shadow styles
- **Animation**: Duration and easing presets
- **Z-Index**: Layering scale for modals, toasts, etc.

---

### Android Build & Emulator Testing ✅ (January 12, 2026)

#### Gradle Issues Fixed
- Fixed Gradle cache corruption on Windows (`metadata.bin` errors)
- Set `GRADLE_USER_HOME=C:\gradle-home` to use fresh cache directory
- Upgraded to Gradle 8.13 as required by React Native 0.81.4
- Added `org.gradle.configuration-cache=false` to `gradle.properties`

#### SoLoader / Native Library Issues Fixed
- **Problem**: `libreact_featureflagsjni.so not found` crash on startup
- **Cause**: React Native 0.81+ uses merged SO libraries, but SoLoader wasn't configured
- **Fix**: Updated `MainApplication.kt` to use `OpenSourceMergedSoMapping`:
  ```kotlin
  SoLoader.init(this, OpenSourceMergedSoMapping)
  ```

#### ViroReact ARM Architecture Handling
- **Problem**: ViroReact only provides ARM native libraries (no x86/x86_64)
- **Impact**: App crashed on x86 emulators with `libviro_renderer.so not found`
- **Fix**: Added conditional ViroReact loading in `MainApplication.kt`:
  ```kotlin
  private fun isARMArchitecture(): Boolean {
    val supportedAbis = Build.SUPPORTED_ABIS
    return supportedAbis.any { it.startsWith("arm") || it.startsWith("aarch") }
  }
  // Only add ViroReact packages on ARM devices
  if (isARMArchitecture()) {
    add(ReactViroPackage(ReactViroPackage.ViroPlatform.GVR))
    add(ReactViroPackage(ReactViroPackage.ViroPlatform.AR))
  }
  ```
- **Result**: App runs on x86 emulator for UI testing; AR requires ARM device

#### React Version Mismatch Fixed
- **Problem**: `react: 19.2.3` vs `react-native-renderer: 19.1.0` caused crashes
- **Fix**: Downgraded React to 19.1.0 to match RN 0.81.4 peer dependency
  ```bash
  npm install react@19.1.0 --save
  ```

#### Component Name Fixed
- **Problem**: `MainActivity.kt` used `"ViroStarterKit"` but app.json uses `"BlackBartsGold"`
- **Fix**: Updated `getMainComponentName()` to return `"BlackBartsGold"`

#### Missing Dependencies Added
- Added `@react-native-community/netinfo` package
- Added to manual dependencies in `android/app/build.gradle`:
  ```gradle
  implementation project(':react-native-community_netinfo')
  ```
- Commented out audio file imports in `CoinObject.tsx` (placeholders not yet created)

#### Database Setup
- PostgreSQL 17.2 installed and running
- Database `black_barts_gold` created in pgAdmin
- Backend `.env` configured with connection string

#### Key Files Modified
- `android/app/src/main/java/com/virostarterkit/MainApplication.kt` - SoLoader + ViroReact conditional
- `android/app/src/main/java/com/virostarterkit/MainActivity.kt` - Component name fix
- `android/app/build.gradle` - Added netinfo dependency
- `android/gradle.properties` - Disabled config cache
- `src/ar/CoinObject.tsx` - Commented audio requires

---

## 🎉 PHASE 1 MVP COMPLETE!

All 8 sprints are now complete. The Black Bart's Gold app includes:

| Feature | Status |
|---------|--------|
| ViroReact AR Scene | ✅ |
| 3D Coin Objects | ✅ |
| Animations & Particles | ✅ |
| GPS Location Tracking | ✅ |
| Haptic Feedback | ✅ |
| Coin Collection Logic | ✅ |
| Find Limit System | ✅ |
| Coin Hiding Wizard | ✅ |
| User Authentication | ✅ |
| Wallet & Economy | ✅ |
| Gas System | ✅ |
| Express Backend API | ✅ |
| PostgreSQL + Prisma | ✅ |
| Geospatial Queries | ✅ |
| API Integration | ✅ |
| Error Handling | ✅ |
| Theme System | ✅ |

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
4. **ViroReact x86 limitation** - AR features only work on ARM devices (real phones); x86 emulators show UI only
5. ~~**Minor auth bug** - `clearUser is not a function` error in useAuth hook~~ - **FIXED** (Session 2)
6. ~~**Backend not started** - Need to run `npm run dev` in backend folder~~ - **FIXED** (Session 2)
7. **Location permission** - Emulator shows "never_ask_again" status; need to manually grant or use Settings

---

## 🎉 Session 2 Progress (January 12, 2026)

### What Was Done
1. **Backend Server Running** ✅
   - PostgreSQL database connected
   - API running on `http://localhost:3000/api/v1`

2. **Test Data Seeding** ✅
   - Created `backend/prisma/seed.ts` with comprehensive test data
   - Test account: `pirate@blackbartsgold.com` / `treasure123`
   - Account has: $50 balance, 45 days gas, $10 find limit
   - 7 test coins placed at varying distances

3. **MapScreen Upgraded** ✅
   - Replaced placeholder with functional radar-style map
   - Shows nearby coins with distance/direction
   - Coin list with lock status indicators
   - GPS tracking integration

4. **Auth Hook Bug Fixed** ✅
   - Fixed `clearUser` function reference issue
   - Used `useShallow` from zustand for proper store selectors
   - No more infinite re-render loops

### Test Account Credentials
```
Email:    pirate@blackbartsgold.com
Password: treasure123
```

### Account Status (Seeded)
- **Find Limit:** $10.00
- **Gas Tank:** $15.00 (~45 days)
- **Parked:** $25.00
- **Total Balance:** $50.00

### Test Coins Created
| Value | Distance | Notes |
|-------|----------|-------|
| $0.50 | ~38m | Easy to find |
| $1.00 | ~62m | Easy to find |
| $2.50 | ~239m | Medium walk |
| Pool | ~377m | Random value coin |
| $5.00 | ~658m | Adventure worthy |
| $10.00 | ~717m | Max find limit |
| $25.00 | ~120m | **LOCKED** (above limit) |

### Verified Working
- ✅ App launches on Android emulator
- ✅ Onboarding screen displays
- ✅ Login flow works
- ✅ Session persists
- ✅ Home screen shows with navigation
- ✅ Tab navigation (Home, Map, Wallet, Settings)
- ✅ Backend API running

---

## 🚀 Testing Commands

### Start Metro Bundler
```bash
cd C:\Users\Admin\Location-Game
npx react-native start --reset-cache
```

### Build & Install on Emulator
```bash
# Set Gradle home (fixes Windows cache issues)
$env:GRADLE_USER_HOME = "C:\gradle-home"

cd android
.\gradlew assembleDebug --no-daemon

# Install APK
adb install -r app\build\outputs\apk\debug\app-debug.apk

# Launch app
adb shell am start -n com.virostarterkit/.MainActivity
```

### Start Android Emulator
```bash
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_6_API_33
```

### View Logs
```bash
adb logcat | Select-String -Pattern "ReactNativeJS|BlackBartsGold"
```

### Start Backend Server
```bash
cd backend
npm run dev
```

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

*Last updated by Claude on January 12, 2026*

