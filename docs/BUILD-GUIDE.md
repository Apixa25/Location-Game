# 🏴‍☠️ Black Bart's Gold - Complete Build Guide

This document provides a **step-by-step prompt guide** for building the entire Black Bart's Gold application. Follow these prompts sequentially to build out each feature.

---

## 📋 Table of Contents

1. [How to Use This Guide](#how-to-use-this-guide)
2. [Pre-Development Setup](#pre-development-setup)
3. [Phase 1: MVP](#phase-1-mvp)
   - [Sprint 1: Project Foundation](#sprint-1-project-foundation)
   - [Sprint 2: AR Prize Finder Core](#sprint-2-ar-prize-finder-core)
   - [Sprint 3: Location & GPS System](#sprint-3-location--gps-system)
   - [Sprint 4: Coin System](#sprint-4-coin-system)
   - [Sprint 5: User Authentication](#sprint-5-user-authentication)
   - [Sprint 6: Wallet & Economy](#sprint-6-wallet--economy)
   - [Sprint 7: Backend API](#sprint-7-backend-api)
   - [Sprint 8: Integration & Polish](#sprint-8-integration--polish)
4. [Phase 2: Enhanced Features](#phase-2-enhanced-features)
5. [Phase 3: Advanced Features](#phase-3-advanced-features)
6. [Reference Documents](#reference-documents)

---

## 🎯 How to Use This Guide

### For Each Sprint:

1. **Read the overview** to understand what we're building
2. **Copy the prompts** to Claude (one at a time)
3. **Follow the sequence** - prompts build on each other
4. **Test after each prompt** before moving on
5. **Commit code** after each working feature

### Prompt Format:

Each prompt includes:
- 🎯 **Goal**: What we're trying to accomplish
- 📁 **Files Involved**: What files will be created/modified
- 📋 **Acceptance Criteria**: How to know it's done
- 💬 **The Prompt**: What to paste to Claude

---

## 🛠️ Pre-Development Setup

### Before Starting ANY Code

**Prompt 0.1: Environment Verification**
```
Before we start coding Black Bart's Gold, let's verify my development environment is ready.

Please help me check:
1. Node.js version (need 18+)
2. React Native CLI is installed
3. Android Studio is configured (ANDROID_HOME set)
4. Xcode is installed (macOS only)
5. CocoaPods is installed (macOS only)

Run the necessary commands to verify each, and tell me what I need to fix.
```

**Prompt 0.2: Create Project**
```
Let's create the Black Bart's Gold React Native project using the ViroReact starter kit.

Please:
1. Clone the ViroReact starter kit
2. Rename the project to "BlackBartsGold"
3. Install all dependencies
4. Verify it builds and runs on a physical device

Follow the setup instructions from our tech-stack-setup-guide.md document.
```

**Prompt 0.3: Install All Dependencies**
```
Install all the dependencies we need for Black Bart's Gold:

Mobile App:
- @reactvision/react-viro (AR)
- @react-navigation/native + native-stack
- react-native-screens, react-native-safe-area-context
- zustand (state management)
- react-native-geolocation-service
- react-native-permissions
- react-native-haptic-feedback
- @react-native-async-storage/async-storage
- axios

Dev dependencies:
- TypeScript 5.x
- @types/react, @types/react-native
- eslint, prettier

Update package.json and install everything.
```

**Prompt 0.4: Project Structure Setup**
```
Set up the project folder structure for Black Bart's Gold:

src/
├── App.tsx
├── navigation/
├── screens/
├── ar/
├── components/
│   ├── ui/
│   └── shared/
├── store/
├── services/
├── hooks/
├── utils/
└── types/

assets/
├── models/
├── audio/
├── images/
└── fonts/

Create empty index.ts files in each folder and set up the basic App.tsx with navigation skeleton.
```

---

## 🚀 Phase 1: MVP

### Sprint 1: Project Foundation
**Goal**: Basic app shell with navigation between screens

---

**Prompt 1.1: Navigation Setup**

🎯 **Goal**: Set up React Navigation with all main screens

📁 **Files**: `src/navigation/AppNavigator.tsx`, `src/screens/*.tsx`

📋 **Acceptance Criteria**:
- App launches with Home screen
- Can navigate to: Home, PrizeFinder, Map, Wallet, Settings
- Bottom tab navigation works

💬 **Prompt**:
```
Set up React Navigation for Black Bart's Gold.

Create these screens as placeholder components:
1. HomeScreen - Main menu with "Start Hunting" button
2. PrizeFinderScreen - Will hold the AR view (placeholder for now)
3. MapScreen - Will show coin map (placeholder for now)
4. WalletScreen - Will show BBG balance (placeholder for now)
5. SettingsScreen - User settings (placeholder for now)

Use bottom tab navigation with icons for:
- Home (house icon)
- Prize Finder (camera/crosshairs icon)
- Map (map icon)
- Wallet (wallet icon)
- Settings (gear icon)

Each placeholder should show the screen name and have basic styling.

Reference the UI layout from docs/prize-finder-details.md for the Prize Finder screen structure.
```

---

**Prompt 1.2: TypeScript Types**

🎯 **Goal**: Define all TypeScript interfaces for the app

📁 **Files**: `src/types/*.ts`

📋 **Acceptance Criteria**:
- All core types defined
- No TypeScript errors

💬 **Prompt**:
```
Create TypeScript type definitions for Black Bart's Gold.

Based on our documentation, create these types:

src/types/coin.ts:
- Coin interface (id, coin_type, value, contribution, location, hider, hidden_at, logo_front, logo_back, hunt_type, multi_find, finds_remaining, current_tier, status)
- CoinType enum ('fixed' | 'pool')
- CoinStatus enum ('hidden' | 'visible' | 'collected' | 'confirmed')
- CoinTier enum ('gold' | 'silver' | 'bronze' | null)

src/types/user.ts:
- User interface (id, email, bbg_balance, gas_remaining, find_limit, created_at)
- UserStats interface (total_found, total_hidden, total_value_found, total_value_hidden)

src/types/location.ts:
- Coordinates interface (latitude, longitude)
- Grid interface (id, coordinates, coin_count, active_users)

src/types/wallet.ts:
- Transaction interface (id, type, amount, timestamp, coin_id, status)
- WalletBalance interface (total, gas_tank, parked, pending)

src/types/hunt.ts:
- HuntType enum and HuntConfig interface based on docs/treasure-hunt-types.md

Reference the coin metadata structure from docs/coins-and-collection.md
```

---

**Prompt 1.3: Zustand Store Setup**

🎯 **Goal**: Create state management stores

📁 **Files**: `src/store/*.ts`

📋 **Acceptance Criteria**:
- All stores created and typed
- Can get/set values from stores

💬 **Prompt**:
```
Create Zustand stores for Black Bart's Gold state management.

Create these stores:

src/store/useUserStore.ts:
- userId, email, isAuthenticated
- bbgBalance, gasRemaining, findLimit
- Actions: setUser, logout, updateBalance, updateGas, updateFindLimit

src/store/useLocationStore.ts:
- currentLocation (lat/lng)
- currentGrid
- isTracking
- Actions: setLocation, setGrid, startTracking, stopTracking

src/store/useCoinStore.ts:
- nearbyCoins array
- selectedCoinId
- Actions: setNearbyCoins, selectCoin, removeCoin, clearSelection

src/store/useAppStore.ts:
- arTrackingState ('UNAVAILABLE' | 'LIMITED' | 'NORMAL')
- isARActive
- Actions: setTrackingState, setARActive

Use TypeScript and make sure all stores are properly typed with the interfaces we created.
```

---

### Sprint 2: AR Prize Finder Core
**Goal**: Working AR camera view with ViroReact

---

**Prompt 2.1: Basic AR Scene**

🎯 **Goal**: Get ViroReact AR camera working

📁 **Files**: `src/ar/PrizeFinderScene.tsx`, `src/screens/PrizeFinderScreen.tsx`

📋 **Acceptance Criteria**:
- AR camera view displays
- Shows tracking state (NORMAL/LIMITED/UNAVAILABLE)
- No crashes

💬 **Prompt**:
```
Create the basic AR Prize Finder scene using ViroReact.

Create src/ar/PrizeFinderScene.tsx:
- Use ViroARScene as the container
- Add ViroAmbientLight for basic lighting
- Add ViroDirectionalLight with shadows
- Implement onTrackingUpdated to track AR state
- Show a simple ViroText that says "AR Ready!" when tracking is NORMAL

Create/update src/screens/PrizeFinderScreen.tsx:
- Use ViroARSceneNavigator as the entry point
- Pass the PrizeFinderScene as initialScene
- Enable autofocus, HDR, and bloom
- Show a loading indicator while AR initializes
- Show error message if AR is unavailable

Reference the AR implementation section from project-vision.md for the scene structure.
```

---

**Prompt 2.2: Animation Registry**

🎯 **Goal**: Register all coin animations

📁 **Files**: `src/ar/animations.ts`

📋 **Acceptance Criteria**:
- All animations registered
- Can reference animations by name

💬 **Prompt**:
```
Create the ViroReact animation registry for Black Bart's Gold.

Create src/ar/animations.ts with these animations:

Idle Animations (looping):
- spinCoin: Rotate Y 360 degrees over 2 seconds, linear easing
- bobUp: Move Y +0.03 over 600ms, ease in-out
- bobDown: Move Y -0.03 over 600ms, ease in-out
- coinFloat: Chain [bobUp, bobDown] sequential
- coinIdle: Run [spinCoin] and [coinFloat] in parallel

Collection Animations (one-shot):
- flyForward: Move Z +1.5, Y +0.3 over 400ms, ease in
- spinFast: Rotate Y 720 degrees over 400ms
- shrink: Scale to 0.05 over 300ms with 400ms delay
- fadeOut: Opacity to 0 over 200ms with 500ms delay
- coinCollect: Run [flyForward, spinFast] parallel, then [shrink], then [fadeOut]

Pulse Effect:
- pulseUp: Scale to 1.1 over 300ms
- pulseDown: Scale to 1.0 over 300ms
- coinPulse: Chain [pulseUp, pulseDown]

Reference the animation system documentation from tech-stack-setup-guide.md
```

---

**Prompt 2.3: Coin 3D Component**

🎯 **Goal**: Create reusable AR coin component

📁 **Files**: `src/ar/CoinObject.tsx`

📋 **Acceptance Criteria**:
- Coin renders in AR
- Coin spins with idle animation
- Coin responds to click events

💬 **Prompt**:
```
Create the AR Coin component for Black Bart's Gold.

Create src/ar/CoinObject.tsx:

Props:
- id: string
- position: [number, number, number]
- value: number
- coinType: 'fixed' | 'pool'
- onCollect: () => void
- onHover?: (isHovering: boolean) => void

Features:
- Use ViroNode as container to group elements
- Use Viro3DObject for the coin model (use ViroBox as placeholder until we have real model)
- Add ViroParticleEmitter for sparkle effects around coin
- Add ViroText above coin showing value (e.g., "$5.00") - hide for pool coins, show "?" instead
- Apply 'coinIdle' animation when not collecting
- Apply 'coinCollect' animation when clicked
- Support onClick and onHover events
- Different visual appearance for 'fixed' vs 'pool' coins (e.g., different colors)

The coin should:
1. Spin continuously when idle
2. Bob up and down gently
3. Have sparkle particles
4. Show value label that faces camera (billboard)
5. Trigger collection animation on click

Reference docs/coins-and-collection.md for coin visual design requirements.
```

---

**Prompt 2.4: Test Coins in AR**

🎯 **Goal**: Display test coins in AR scene

📁 **Files**: `src/ar/PrizeFinderScene.tsx`

📋 **Acceptance Criteria**:
- 3 test coins visible in AR
- Coins have idle animation
- Clicking coin triggers collection animation

💬 **Prompt**:
```
Add test coins to the Prize Finder AR scene.

Update src/ar/PrizeFinderScene.tsx:

1. Create a test array of 3 coins with hardcoded positions:
   - Coin 1: position [0, 0, -2] (directly in front), value $1.00, type 'fixed'
   - Coin 2: position [-1, 0, -3] (left side), value $5.00, type 'fixed'
   - Coin 3: position [1, 0.5, -2.5] (right side, higher), value unknown, type 'pool'

2. Map over coins and render CoinObject for each

3. Implement handleCoinCollect:
   - Log which coin was collected
   - Remove coin from the array
   - Play collection sound (placeholder console.log for now)

4. Track which coin is currently being hovered (for crosshair targeting later)

Test by:
- Opening Prize Finder
- Looking around to see coins
- Tapping coins to collect them
```

---

**Prompt 2.5: Prize Finder UI Overlay**

🎯 **Goal**: Add HUD elements over AR view

📁 **Files**: `src/components/ui/Compass.tsx`, `src/components/ui/GasMeter.tsx`, `src/components/ui/MiniMap.tsx`, `src/components/ui/Crosshairs.tsx`, `src/components/ui/FindLimit.tsx`

📋 **Acceptance Criteria**:
- All UI elements display over AR view
- Positioned according to layout spec
- Shows placeholder/mock data

💬 **Prompt**:
```
Create the Prize Finder HUD overlay components.

Reference the layout from docs/prize-finder-details.md:

┌─────────────────────────────────────────────┐
│ [🧭]                           [Find: $5]   │  ← Compass (top-left), Find Limit (top-right)
│                                             │
│                    ⊕                        │  ← Targeting Crosshairs (center)
│                                             │
│  ┌─────┐                            ║█████║ │  ← Mini-map (bottom-left), Gas Meter (right)
│  │ MAP │                            ║░░░░░║ │
│  └─────┘                                    │
└─────────────────────────────────────────────┘

Create these components:

1. src/components/ui/Compass.tsx
   - Small compass icon in top-left
   - Props: direction (degrees to target coin)
   - Shows arrow pointing to selected coin
   - Tap to expand (Phase 2)

2. src/components/ui/FindLimit.tsx
   - Top-right corner
   - Props: limit (number)
   - Shows "Find: $X.XX"

3. src/components/ui/Crosshairs.tsx
   - Center of screen
   - Simple crosshair graphic
   - Changes color when hovering over coin (green = can collect)

4. src/components/ui/MiniMap.tsx
   - Bottom-left corner
   - Props: coins array, playerPosition
   - Shows simple dot for player, dots for nearby coins
   - Tap to expand to full map (navigates to MapScreen)

5. src/components/ui/GasMeter.tsx
   - Right edge, vertical
   - Props: gasRemaining (0-30 days), maxGas (30)
   - Fills from bottom to top
   - Flashes when low (<15%)

6. Create src/components/ui/PrizeFinderHUD.tsx
   - Combines all UI elements
   - Uses absolute positioning over AR view
   - Gets data from Zustand stores

All components should use React Native View/Text (not ViroReact) since they're 2D overlays.
```

---

**Prompt 2.6: Integrate HUD with AR**

🎯 **Goal**: Display HUD over AR camera view

📁 **Files**: `src/screens/PrizeFinderScreen.tsx`

📋 **Acceptance Criteria**:
- HUD displays over AR view
- All elements visible and positioned correctly
- Mock data shows in each component

💬 **Prompt**:
```
Integrate the Prize Finder HUD with the AR view.

Update src/screens/PrizeFinderScreen.tsx:

1. Structure:
   - Container View (flex: 1)
     - ViroARSceneNavigator (absolute, full screen)
     - PrizeFinderHUD (absolute, full screen, pointerEvents='box-none')

2. Connect HUD to stores:
   - GasMeter: useUserStore gasRemaining
   - FindLimit: useUserStore findLimit
   - Compass: Calculate direction to selected coin from useCoinStore
   - MiniMap: useLocationStore currentLocation + useCoinStore nearbyCoins

3. Add mock data to stores for testing:
   - gasRemaining: 25 (days)
   - findLimit: 5.00
   - Add test coins to store

4. Handle MiniMap tap → navigate to MapScreen
5. Handle Compass tap → (placeholder for expanded view)

Test on device to verify all HUD elements render correctly over the AR camera.
```

---

### Sprint 3: Location & GPS System
**Goal**: Real GPS tracking with distance calculations

---

**Prompt 3.1: Location Service**

🎯 **Goal**: Create GPS tracking service

📁 **Files**: `src/services/location.ts`

📋 **Acceptance Criteria**:
- Can get current position
- Can watch position changes
- Handles permissions

💬 **Prompt**:
```
Create the location service for Black Bart's Gold.

Create src/services/location.ts:

Functions:

1. requestLocationPermission(): Promise<boolean>
   - Request Android/iOS location permissions
   - Return true if granted

2. getCurrentPosition(): Promise<Coordinates>
   - Get current location once
   - High accuracy mode
   - Timeout: 15 seconds
   - Return { latitude, longitude, accuracy }

3. watchPosition(onUpdate, onError): number
   - Start continuous tracking
   - Update every 5 meters of movement (distanceFilter)
   - Return watch ID for cleanup

4. stopWatching(watchId): void
   - Clear the position watch

5. calculateDistance(point1, point2): number
   - Haversine formula
   - Return distance in meters

6. calculateBearing(from, to): number
   - Calculate compass bearing between two points
   - Return degrees (0-360)

Use react-native-geolocation-service for GPS.
Reference the Location System section in project-vision.md.
```

---

**Prompt 3.2: Location Hook**

🎯 **Goal**: React hook for location tracking

📁 **Files**: `src/hooks/useLocation.ts`

📋 **Acceptance Criteria**:
- Hook tracks location automatically
- Updates store with position
- Cleans up on unmount

💬 **Prompt**:
```
Create a React hook for location tracking.

Create src/hooks/useLocation.ts:

The hook should:

1. On mount:
   - Request location permission
   - Get initial position
   - Start position watching
   - Update useLocationStore with position

2. Return:
   - location: { latitude, longitude } | null
   - accuracy: number | null
   - error: string | null
   - isTracking: boolean
   - refresh(): void - force refresh position

3. On unmount:
   - Stop position watching
   - Clean up

4. Calculate distance to selected coin:
   - Get selectedCoinId from useCoinStore
   - Find coin in nearbyCoins
   - Calculate distance using location service
   - Return distanceToSelectedCoin

The hook should be used in PrizeFinderScreen to power:
- Current position display
- Distance calculations
- Compass direction
```

---

**Prompt 3.3: Haptic Feedback Service**

🎯 **Goal**: Vibration patterns based on distance

📁 **Files**: `src/services/haptics.ts`

📋 **Acceptance Criteria**:
- Different vibration patterns work
- Distance-based vibration intensity

💬 **Prompt**:
```
Create the haptic feedback service for proximity alerts.

Create src/services/haptics.ts:

Reference the vibration patterns from docs/prize-finder-details.md:
| Distance | Vibration Pattern |
|----------|-------------------|
| Far | No vibration |
| Getting closer | Gentle pulses |
| Very close | Strong, rapid pulses |
| At collection range | Continuous buzz |

Functions:

1. triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success'): void
   - Single vibration of specified intensity

2. startProximityFeedback(distanceMeters: number): void
   - Calculate appropriate vibration pattern based on distance
   - Distance thresholds:
     - > 50m: No vibration
     - 30-50m: Light pulse every 2 seconds
     - 15-30m: Medium pulse every 1 second
     - 5-15m: Heavy pulse every 0.5 seconds
     - < 5m: Continuous buzz

3. stopProximityFeedback(): void
   - Stop any ongoing vibration pattern

4. triggerCollectionFeedback(): void
   - Special pattern for successful collection
   - Short-short-long pattern

Use react-native-haptic-feedback.
```

---

**Prompt 3.4: Connect Location to AR**

🎯 **Goal**: Position coins based on real GPS

📁 **Files**: `src/ar/PrizeFinderScene.tsx`, `src/utils/coordinates.ts`

📋 **Acceptance Criteria**:
- Coins positioned relative to player GPS
- Distance shown correctly
- Compass points to coins

💬 **Prompt**:
```
Connect real GPS location to AR coin positioning.

Create src/utils/coordinates.ts:
- gpsToARPosition(playerGPS, coinGPS): [x, y, z]
  - Convert GPS coordinates to AR scene coordinates
  - X = east/west offset in meters
  - Z = north/south offset in meters (negative = in front of player)
  - Y = elevation (default 0 for ground level, slight offset for visibility)
  - Scale appropriately for AR view

- arPositionToGPS(playerGPS, arPosition): { latitude, longitude }
  - Reverse conversion

Update src/ar/PrizeFinderScene.tsx:

1. Use useLocation hook to get current position
2. Convert nearby coins (from store) from GPS to AR positions
3. Update coin positions as player moves
4. Calculate distance to each coin
5. Update compass bearing to selected coin

The coins should appear in the correct real-world direction:
- A coin to the north should appear when facing north
- A coin to the east should appear when facing east
- etc.

This is the critical AR + GPS integration that makes the treasure hunt real!
```

---

### Sprint 4: Coin System
**Goal**: Coin collection, hiding, and state management

---

**Prompt 4.1: Coin Collection Logic**

🎯 **Goal**: Implement collection mechanics

📁 **Files**: `src/services/coinService.ts`

📋 **Acceptance Criteria**:
- Can check if coin is collectible
- Collection respects find limit
- Over-limit coins show message

💬 **Prompt**:
```
Create the coin collection service.

Create src/services/coinService.ts:

Based on docs/coins-and-collection.md collection requirements:
1. Be within GPS range (~10-30 feet / ~10 meters)
2. Have coin visible in AR view
3. Center crosshairs on coin
4. Press collect button
5. Be below your find limit OR coin is within your limit

Functions:

1. canCollectCoin(coin, playerPosition, playerFindLimit): { canCollect: boolean, reason?: string }
   - Check distance (< 10 meters)
   - Check find limit (coin.value <= playerFindLimit)
   - Return reason if can't collect:
     - "TOO_FAR" - Need to get closer
     - "OVER_LIMIT" - Coin is above your find limit
     - "ALREADY_COLLECTED" - Coin no longer available

2. getOverLimitMessage(coin, playerFindLimit): string
   - Reference docs/economy-and-currency.md finding limits section
   - Return: "This coin is above your $X limit. Hide $Y to unlock!"
   - Hint = coin value + $5

3. collectCoin(coinId, playerId): Promise<CollectionResult>
   - API call to backend (stub for now)
   - Return collected coin with value (for pool coins, value determined here)
   - Handle race conditions (someone else got it first)

4. calculatePoolCoinValue(finderId): number
   - Implement the slot machine logic from docs/dynamic-coin-distribution.md
   - Based on finder's recent history
   - Return calculated value
```

---

**Prompt 4.2: Coin Collection Animation & Sound**

🎯 **Goal**: Full collection experience

📁 **Files**: `src/ar/CoinObject.tsx`, `src/ar/PrizeFinderScene.tsx`

📋 **Acceptance Criteria**:
- Collection animation plays
- Sound plays
- Value displays
- Coin removed from scene

💬 **Prompt**:
```
Implement the full coin collection experience.

Reference the collection sequence from docs/coins-and-collection.md:
1. Player taps coin (crosshairs centered)
2. Coin flies toward camera
3. Coin spins rapidly showing both sides
4. Black Bart congratulation voice plays
5. Coin shrinks and fades
6. Value added to wallet with UI animation

Update src/ar/CoinObject.tsx:
- Add 'isCollecting' state
- When clicked:
  1. Check canCollectCoin() - show message if can't
  2. Set isCollecting = true
  3. Switch animation to 'coinCollect'
  4. Play collection sound (ViroSound)
  5. After animation completes, call onCollect()

Update src/ar/PrizeFinderScene.tsx:
- When coin collected:
  1. Show value popup animation (ViroText that appears and floats up)
  2. Update wallet balance in store
  3. Remove coin from scene
  4. Trigger haptic success feedback

Add sound file handling:
- Create placeholder for coin-collect.mp3
- Create placeholder for blackbart-congrats.mp3
```

---

**Prompt 4.3: Coin Hiding Flow**

🎯 **Goal**: Allow users to hide coins

📁 **Files**: `src/screens/HideCoinScreen.tsx`, `src/services/coinService.ts`

📋 **Acceptance Criteria**:
- User can select coin type (fixed/pool)
- User can set value
- User can place on map
- Coin created and visible to others

💬 **Prompt**:
```
Create the coin hiding flow.

Reference docs/coins-and-collection.md for hiding rules:
- No minimum distance between coins
- No placement on water
- Private property allowed
- User can add custom logo (Phase 2)

Create src/screens/HideCoinScreen.tsx:

Step 1 - Choose Type:
- Fixed Value: "Hide exact amount, finder gets this value"
- Pool Contribution: "Contribute to mystery pool, finder gets random value"

Step 2 - Set Value:
- Denomination buttons: 5¢, 10¢, 25¢, 50¢, $1, $5, $10, $25, $50, $100
- Show current BBG balance
- Show how this affects find limit: "This will unlock $X finds!"

Step 3 - Place Location:
- Map view centered on current location
- Tap to place coin marker
- Show coin at tapped location
- Option: "Place at my current location"

Step 4 - Confirm:
- Show summary: Type, Value, Location
- "Hide Coin" button
- Deducts from balance
- Updates find limit if applicable

Add to coinService.ts:
- hideCoin(type, value, location, hiderId): Promise<Coin>
- validateHideLocation(location): { valid: boolean, reason?: string }
```

---

**Prompt 4.4: Find Limit System**

🎯 **Goal**: Enforce and display find limits

📁 **Files**: `src/services/findLimitService.ts`, `src/components/ui/FindLimitPopup.tsx`

📋 **Acceptance Criteria**:
- Find limit enforced on collection
- Over-limit coins show locked appearance
- Hint message displayed

💬 **Prompt**:
```
Implement the find limit system.

Reference docs/economy-and-currency.md:
- Default limit: $1.00 (no coins hidden)
- Limit = highest single coin ever hidden
- Limits never decrease
- Over-limit coins glow but can't be collected

Create src/services/findLimitService.ts:

1. calculateFindLimit(user): number
   - Get user's highest hidden coin value
   - Return max of that or $1.00 default

2. updateFindLimitAfterHide(userId, hiddenValue): number
   - If hiddenValue > current limit, update
   - Return new limit

3. checkCoinAgainstLimit(coin, userLimit): LimitCheckResult
   - Result: { canCollect: boolean, coinValue: number, userLimit: number }

Create src/components/ui/FindLimitPopup.tsx:
- Modal that appears when tapping over-limit coin
- Shows: "This treasure is above your limit!"
- Shows: "Your limit: $X.XX"
- Shows: "Hide $Y.YY to unlock higher finds"
- Button: "Hide a Coin" → navigates to HideCoinScreen

Update CoinObject.tsx:
- Add 'locked' visual state for over-limit coins
- Different particle effect (red/locked glow)
- On tap → show FindLimitPopup instead of collecting
```

---

### Sprint 5: User Authentication
**Goal**: Account creation, login, and session management

---

**Prompt 5.1: Auth Service**

🎯 **Goal**: Authentication with email and Gmail

📁 **Files**: `src/services/authService.ts`

📋 **Acceptance Criteria**:
- Can register with email/password
- Can login with email/password
- Can login with Gmail OAuth

💬 **Prompt**:
```
Create the authentication service.

Reference docs/user-accounts-security.md:
- Email + Password registration
- Gmail OAuth login
- Age collection for future sponsor restrictions

Create src/services/authService.ts:

1. register(email, password, age): Promise<User>
   - Validate email format
   - Validate password strength (min 8 chars, etc.)
   - Create account (API call - stub for now)
   - Return user object

2. login(email, password): Promise<User>
   - Authenticate credentials
   - Return user object with token

3. loginWithGoogle(): Promise<User>
   - Trigger Google OAuth flow
   - Exchange token for user
   - Return user object

4. logout(): Promise<void>
   - Clear stored credentials
   - Clear user store

5. getCurrentUser(): Promise<User | null>
   - Check for stored session
   - Validate token
   - Return user if valid

6. storeSession(user, token): void
   - Store in AsyncStorage

7. clearSession(): void
   - Remove from AsyncStorage

For now, stub the API calls to return mock data.
We'll connect to real backend in Sprint 7.
```

---

**Prompt 5.2: Auth Screens**

🎯 **Goal**: Login and registration UI

📁 **Files**: `src/screens/auth/LoginScreen.tsx`, `src/screens/auth/RegisterScreen.tsx`, `src/screens/auth/OnboardingScreen.tsx`

📋 **Acceptance Criteria**:
- Clean login form
- Clean registration form
- Gmail button works
- Form validation shows errors

💬 **Prompt**:
```
Create authentication screens.

Reference the onboarding flow from docs/user-accounts-security.md:

Ideal Flow:
1. Download app
2. Create account
3. Tutorial hunt (free)
4. Pay $10 to activate
5. Full game unlocked

Create src/screens/auth/LoginScreen.tsx:
- Email input
- Password input
- "Login" button
- "Login with Google" button
- "Create Account" link → RegisterScreen
- Form validation with error messages

Create src/screens/auth/RegisterScreen.tsx:
- Email input
- Password input
- Confirm password input
- Age selector (dropdown or date picker)
- "Create Account" button
- "Already have account?" link → LoginScreen
- Terms of Service checkbox

Create src/screens/auth/OnboardingScreen.tsx:
- Welcome message with Black Bart branding
- Brief explanation of the game
- "Login" button
- "Create Account" button
- "How It Works" expandable section

Update AppNavigator to:
- Check auth state on launch
- Show OnboardingScreen if not logged in
- Show HomeScreen if logged in
```

---

**Prompt 5.3: Protected Routes & Session**

🎯 **Goal**: Require auth for app access

📁 **Files**: `src/navigation/AppNavigator.tsx`, `src/hooks/useAuth.ts`

📋 **Acceptance Criteria**:
- Unauthenticated users see login
- Authenticated users see main app
- Session persists across app restarts

💬 **Prompt**:
```
Implement protected routes and session management.

Create src/hooks/useAuth.ts:
- Check for existing session on mount
- Return: user, isLoading, isAuthenticated
- Handle auto-login from stored session

Update src/navigation/AppNavigator.tsx:

1. Use useAuth hook to check auth state
2. Show loading screen while checking session
3. If not authenticated: Show auth stack (Onboarding, Login, Register)
4. If authenticated: Show main app stack (Home, PrizeFinder, etc.)

Structure:
- RootNavigator
  - AuthStack (if !isAuthenticated)
    - OnboardingScreen
    - LoginScreen
    - RegisterScreen
  - MainStack (if isAuthenticated)
    - TabNavigator
      - HomeScreen
      - PrizeFinderScreen
      - MapScreen
      - WalletScreen
      - SettingsScreen
    - HideCoinScreen (modal)

Session should persist:
- On login success, store token
- On app launch, check stored token
- If valid, auto-login
- If invalid/expired, show login
```

---

### Sprint 6: Wallet & Economy
**Goal**: BBG balance, gas system, transactions

---

**Prompt 6.1: Wallet Service**

🎯 **Goal**: Balance and transaction management

📁 **Files**: `src/services/walletService.ts`

📋 **Acceptance Criteria**:
- Can get balance breakdown
- Can track transactions
- Handles pending vs confirmed

💬 **Prompt**:
```
Create the wallet service.

Reference docs/economy-and-currency.md:
- Purchased coins: Must use as gas, can't park
- Found coins: Can park OR use as gas
- Pending: 0-24 hours, can see but not use
- Confirmed: After 24 hours, fully usable

Create src/services/walletService.ts:

1. getBalance(userId): Promise<WalletBalance>
   - Return: { total, gasTank, parked, pending }

2. getTransactions(userId, limit?, offset?): Promise<Transaction[]>
   - Return recent transactions
   - Types: 'found', 'hidden', 'gas_consumed', 'purchased', 'transfer'

3. parkCoins(userId, amount): Promise<void>
   - Move found coins from gas tank to parked
   - Only found coins can be parked

4. unparkCoins(userId, amount): Promise<void>
   - Move parked coins to gas tank
   - Immediately charges 1 day's gas fee

5. consumeGas(userId): Promise<number>
   - Daily gas consumption (~$0.33)
   - Called at midnight
   - Returns remaining gas

6. canPlay(userId): Promise<boolean>
   - Check if user has gas remaining
   - Return false if gas is 0

7. confirmPendingCoins(userId): Promise<number>
   - Check pending coins older than 24h
   - Move to confirmed status
   - Return count confirmed
```

---

**Prompt 6.2: Wallet Screen**

🎯 **Goal**: Display balance and transactions

📁 **Files**: `src/screens/WalletScreen.tsx`

📋 **Acceptance Criteria**:
- Shows balance breakdown
- Shows transaction history
- Can park/unpark coins

💬 **Prompt**:
```
Create the Wallet screen.

Reference docs/economy-and-currency.md for wallet system:

Create src/screens/WalletScreen.tsx:

Header Section:
- Total BBG balance (large, prominent)
- Breakdown cards:
  - Gas Tank: $X.XX (with progress bar, days remaining)
  - Parked: $X.XX (protected)
  - Pending: $X.XX (with countdown to confirmation)

Action Buttons:
- "Add Gas" → Payment flow (Phase 2)
- "Park Coins" → Modal to move coins to parked
- "Unpark Coins" → Modal to move back to gas tank

Transaction History:
- Scrollable list
- Each item shows:
  - Icon based on type (found, hidden, gas, etc.)
  - Description ("Found coin near Main St")
  - Amount (+$5.00 green, -$0.33 red)
  - Timestamp
  - Status (pending/confirmed)

Pull to refresh for latest transactions.

Connect to walletService and useUserStore.
```

---

**Prompt 6.3: Gas System**

🎯 **Goal**: Implement gas consumption and warnings

📁 **Files**: `src/services/gasService.ts`, `src/components/ui/NoGasScreen.tsx`, `src/components/ui/LowGasWarning.tsx`

📋 **Acceptance Criteria**:
- Gas decrements daily
- Low gas warning shows
- No gas blocks Prize Finder

💬 **Prompt**:
```
Implement the gas system.

Reference docs/prize-finder-details.md gas meter section:
- 15% remaining: Meter flashes "LOW FUEL"
- 3 days remaining: Push notification
- 0 remaining: "Buy More Gas" screen, Prize Finder disabled

Create src/services/gasService.ts:

1. getGasStatus(userId): Promise<GasStatus>
   - Return: { remaining, daysLeft, isLow, isEmpty }

2. checkGasOnLaunch(userId): Promise<GasCheckResult>
   - If empty: return 'NO_GAS'
   - If low (< 15%): return 'LOW_GAS'
   - Otherwise: return 'OK'

3. scheduleGasNotification(daysRemaining): void
   - Schedule push notification when 3 days left

Create src/components/ui/NoGasScreen.tsx:
- Full screen overlay
- Pirate-themed "Out of Gas!" message
- "Your ship has run aground, matey!"
- "Buy More Gas" button → Payment flow
- Shows current parked balance (can unpark to continue)

Create src/components/ui/LowGasWarning.tsx:
- Banner that appears at top of screen
- "LOW FUEL" flashing text
- Days remaining: "3 days left"
- Tap to dismiss or go to wallet

Update PrizeFinderScreen:
- Check gas on mount
- If NO_GAS: Show NoGasScreen overlay
- If LOW_GAS: Show LowGasWarning banner
- Disable AR if no gas
```

---

### Sprint 7: Backend API
**Goal**: Server-side infrastructure

---

**Prompt 7.1: Backend Project Setup**

🎯 **Goal**: Initialize Node.js backend

📁 **Files**: `backend/` directory

📋 **Acceptance Criteria**:
- Express server runs
- PostgreSQL connection works
- Basic health check endpoint

💬 **Prompt**:
```
Set up the Black Bart's Gold backend server.

Create backend/ directory with:

Structure:
backend/
├── src/
│   ├── index.ts          # Entry point
│   ├── app.ts            # Express app setup
│   ├── routes/           # API routes
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── models/           # Prisma models
│   ├── middleware/       # Auth, validation, etc.
│   └── utils/            # Helpers
├── prisma/
│   └── schema.prisma     # Database schema
├── package.json
├── tsconfig.json
└── .env.example

Initialize:
1. npm init
2. Install: express, prisma, @prisma/client, cors, helmet, dotenv
3. Install dev: typescript, ts-node, @types/express, nodemon

Create basic Express app with:
- CORS enabled
- JSON body parsing
- Helmet security
- Health check endpoint: GET /health → { status: 'ok' }

Create .env.example with:
- DATABASE_URL
- JWT_SECRET
- PORT
```

---

**Prompt 7.2: Database Schema**

🎯 **Goal**: Define Prisma schema

📁 **Files**: `backend/prisma/schema.prisma`

📋 **Acceptance Criteria**:
- All tables defined
- Relationships correct
- Migrations run

💬 **Prompt**:
```
Create the Prisma database schema for Black Bart's Gold.

Based on our documentation, create these models:

User:
- id, email, password_hash, google_id
- age, created_at, updated_at
- is_banned, ban_reason
- device_ids (array)

UserStats:
- user_id (FK), find_limit
- total_found_count, total_found_value
- total_hidden_count, total_hidden_value
- highest_hidden_value

Wallet:
- user_id (FK)
- total_balance, gas_tank, parked, pending
- last_gas_charge

Transaction:
- id, user_id (FK), type, amount
- coin_id (FK nullable), status
- created_at

Coin:
- id, coin_type ('fixed' | 'pool')
- value (nullable for pool), contribution
- latitude, longitude
- hider_id (FK), hidden_at
- logo_front_url, logo_back_url
- hunt_type, multi_find
- finds_remaining, current_tier
- status ('hidden' | 'visible' | 'collected' | 'confirmed')

CoinFind:
- id, coin_id (FK), finder_id (FK)
- found_at, value_received, tier
- status ('pending' | 'confirmed')

Grid:
- id, latitude, longitude (grid center)
- active_users, coin_count
- last_activity

Use PostGIS for location columns (Point type).
Set up proper indexes on location columns for geospatial queries.
```

---

**Prompt 7.3: Core API Routes**

🎯 **Goal**: Implement main API endpoints

📁 **Files**: `backend/src/routes/*.ts`, `backend/src/controllers/*.ts`

📋 **Acceptance Criteria**:
- Auth endpoints work
- Coin endpoints work
- Wallet endpoints work

💬 **Prompt**:
```
Create the core API routes for Black Bart's Gold.

Auth Routes (backend/src/routes/auth.ts):
- POST /auth/register - Create account
- POST /auth/login - Login with email/password
- POST /auth/google - Login with Google token
- POST /auth/logout - Invalidate session
- GET /auth/me - Get current user

Coin Routes (backend/src/routes/coins.ts):
- GET /coins/nearby?lat=X&lng=Y&radius=Z - Get coins near location
- POST /coins/hide - Hide a new coin
- POST /coins/:id/collect - Collect a coin
- GET /coins/:id - Get coin details
- DELETE /coins/:id - Retrieve your own unfound coin

Wallet Routes (backend/src/routes/wallet.ts):
- GET /wallet - Get balance breakdown
- GET /wallet/transactions - Get transaction history
- POST /wallet/park - Park coins
- POST /wallet/unpark - Unpark coins

User Routes (backend/src/routes/users.ts):
- GET /users/stats - Get user statistics
- PUT /users/settings - Update settings

Implement controllers and services for each.
Use JWT for authentication middleware.
```

---

**Prompt 7.4: Geospatial Queries**

🎯 **Goal**: Location-based coin queries

📁 **Files**: `backend/src/services/coinService.ts`

📋 **Acceptance Criteria**:
- Can query coins within radius
- Efficient PostGIS queries
- Grid system working

💬 **Prompt**:
```
Implement geospatial queries for coin discovery.

Reference docs/dynamic-coin-distribution.md:
- 3 coins minimum per active grid
- Coins recycled from inactive grids after 24h

Create backend/src/services/coinService.ts:

1. getCoinsNearLocation(lat, lng, radiusMeters): Promise<Coin[]>
   - Use PostGIS ST_DWithin for efficient radius query
   - Return coins within radius
   - Filter by status = 'visible'

2. getGridForLocation(lat, lng): Promise<Grid>
   - Calculate which grid the location falls into
   - Grid size: approximately 3 miles

3. ensureGridHasCoins(gridId): Promise<void>
   - Check coin count in grid
   - If < 3 and has active users, seed from pool
   - This is the dynamic distribution system

4. recycleStaleCoins(): Promise<number>
   - Find coins in grids with no activity for 24h
   - Return to communal pool
   - Run as scheduled job

5. placeSystemCoin(gridId): Promise<Coin>
   - Place a pool-type coin in the grid
   - Random position within grid
   - Value determined at collection time

PostGIS query example:
SELECT * FROM coins
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
  radius_meters
)
AND status = 'visible';
```

---

**Prompt 7.5: Connect Mobile to Backend**

🎯 **Goal**: Wire up API calls

📁 **Files**: `src/services/api.ts`, update all services

📋 **Acceptance Criteria**:
- Mobile app connects to backend
- Real data flows through
- Error handling works

💬 **Prompt**:
```
Connect the mobile app to the backend API.

Create src/services/api.ts:

1. API client setup:
   - Base URL configuration (dev/prod)
   - Axios instance with interceptors
   - Auth token injection
   - Error handling

2. Auth interceptor:
   - Add JWT to all requests
   - Handle 401 responses (logout/refresh)

3. Error handler:
   - Network errors
   - Server errors
   - Validation errors

Update all service files to use real API calls:
- authService.ts → /auth/* endpoints
- coinService.ts → /coins/* endpoints
- walletService.ts → /wallet/* endpoints
- Update stores with real data

Add environment configuration:
- .env.development with local API URL
- .env.production with production URL

Test end-to-end:
1. Register new user
2. Login
3. Fetch nearby coins
4. Collect a coin
5. Check wallet updated
```

---

### Sprint 8: Integration & Polish
**Goal**: Connect all pieces, fix bugs, polish UX

---

**Prompt 8.1: End-to-End Testing**

🎯 **Goal**: Full gameplay loop works

📋 **Acceptance Criteria**:
- Can register/login
- Can see coins in AR
- Can collect coins
- Can hide coins
- Wallet updates correctly

💬 **Prompt**:
```
Let's test the complete gameplay loop.

Walk through these scenarios and fix any issues:

Scenario 1: New User
1. Open app, see onboarding
2. Create account
3. See home screen with $10 starter balance
4. Open Prize Finder
5. See 3 coins nearby (system placed)
6. Walk to a coin, collect it
7. Value added to wallet

Scenario 2: Collection
1. Login as existing user
2. Open Prize Finder
3. Navigate to a coin using compass
4. Vibration increases as you approach
5. Crosshairs turn green when over coin
6. Tap to collect
7. Animation plays
8. Black Bart voice plays
9. Wallet updates

Scenario 3: Find Limit
1. Find a $5 coin
2. See "above your limit" message
3. Go to Hide Coin screen
4. Hide a $5 coin
5. Return to the $5 coin
6. Now can collect it

Scenario 4: Gas System
1. Set gas to 1 day remaining
2. Open Prize Finder
3. See LOW FUEL warning
4. Set gas to 0
5. Prize Finder blocked
6. See "Buy More Gas" screen

Test on both Android and iOS physical devices.
Document and fix all issues found.
```

---

**Prompt 8.2: Error Handling & Edge Cases**

🎯 **Goal**: Handle all error states gracefully

📋 **Acceptance Criteria**:
- Network errors show message
- GPS unavailable handled
- AR tracking lost handled
- Empty states have UI

💬 **Prompt**:
```
Implement comprehensive error handling.

Network Errors:
- Show "No internet connection" banner
- Queue actions for retry when online
- Show cached data when available
- Retry button for failed requests

GPS Errors:
- Permission denied: Show settings prompt
- Location unavailable: Show "GPS signal weak"
- Timeout: Retry with loading indicator

AR Errors:
- Tracking UNAVAILABLE: Show error screen with tips
  - "Move to a well-lit area"
  - "Point camera at textured surfaces"
  - "Restart AR" button
- Tracking LIMITED: Show warning banner
  - AR still works but may be unstable

Empty States:
- No nearby coins: "No treasure here, try exploring!"
- No transactions: "Your adventures await!"
- No hidden coins: "Hide your first coin to unlock bigger finds!"

Form Errors:
- Validation messages under each field
- Disable submit until valid
- Show specific error from server

API Errors:
- 401: Redirect to login
- 403: Show "Access denied" message
- 404: Show "Not found" message
- 500: Show "Server error, try again"
- Custom error codes for game logic
```

---

**Prompt 8.3: Performance Optimization**

🎯 **Goal**: Smooth 60fps AR experience

📋 **Acceptance Criteria**:
- AR runs smoothly
- Battery usage reasonable
- Memory leaks fixed

💬 **Prompt**:
```
Optimize performance for Black Bart's Gold.

AR Performance:
- Limit number of coins rendered at once (max 10 visible)
- Use LOD (level of detail) for distant coins
- Reduce particle counts on low-end devices
- Disable shadows if performance drops

GPS Optimization:
- Use distanceFilter to reduce updates
- Batch location updates
- Don't track when app backgrounded

Memory:
- Properly dispose ViroReact objects
- Clear animation listeners on unmount
- Use FlatList for long lists
- Image caching for coin textures

Battery:
- Reduce GPS accuracy when not hunting
- Pause AR when app backgrounded
- Option for "battery saver" mode

Network:
- Cache nearby coins
- Debounce API requests
- Prefetch likely needed data
- Compress API responses

Test on low-end Android device to ensure playability.
Profile with React Native performance tools.
```

---

**Prompt 8.4: UI Polish & Branding**

🎯 **Goal**: Professional, pirate-themed look

📋 **Acceptance Criteria**:
- Consistent pirate theme
- Smooth animations
- Good typography
- Accessible colors

💬 **Prompt**:
```
Polish the UI with pirate branding.

Theme Colors:
- Primary: Gold (#FFD700)
- Secondary: Deep Sea Blue (#1A365D)
- Accent: Pirate Red (#8B0000)
- Background: Parchment (#F5E6D3)
- Text: Dark Brown (#3D2914)

Typography:
- Headers: Bold, pirate-style font
- Body: Clean, readable font
- Numbers: Monospace for values

Components to polish:
1. Buttons - Gold borders, raised effect
2. Cards - Parchment texture, torn edges
3. Headers - Pirate flag motif
4. Icons - Custom pirate-themed icons
5. Loading states - Compass spinning

Animations:
- Screen transitions: Slide with fade
- Button press: Scale + haptic
- Value changes: Count up animation
- Success states: Confetti/sparkle effect

Sounds (placeholders):
- Button tap
- Coin collect
- Black Bart voice
- Error/warning

Create a style guide document for consistency.
```

---

**Prompt 8.5: MVP Completion Checklist**

🎯 **Goal**: Verify MVP is complete

📋 **Acceptance Criteria**:
- All Phase 1 features work
- No critical bugs
- Ready for testing

💬 **Prompt**:
```
Let's verify MVP completion against the Phase 1 requirements from docs/project-scope.md:

Phase 1 - MVP Checklist:

[ ] Basic Prize Finder AR view
    - AR camera works
    - Coins visible in AR
    - Tracking state handling
    - HUD overlay (compass, gas, map, crosshairs)

[ ] Coin hiding and finding
    - Can see nearby coins
    - Can collect coins
    - Can hide coins
    - Collection animation works
    - Sound plays

[ ] Gas system
    - Gas meter displays
    - Gas depletes (mocked daily)
    - Low gas warning
    - No gas blocks play

[ ] User accounts
    - Email registration
    - Email login
    - Gmail OAuth
    - Session persistence
    - Logout

[ ] Admin dashboard (basic)
    - View all coins
    - Place system coins
    - View user stats

[ ] Single hunt type (direct navigation)
    - Compass points to coin
    - Distance shown
    - Map shows coins
    - Vibration feedback

For each incomplete item, create a task to finish it.
Fix any critical bugs found.
```

---

## 🚀 Phase 2: Enhanced Features

*(To be detailed after Phase 1 completion)*

### Overview

Based on docs/project-scope.md Phase 2:
- Multiple hunt types (radar, compass-only, timed release)
- Social features (friends, leaderboards)
- Sponsor hunt system
- Custom logos on coins
- Multiple Black Bart congratulation voice lines

### Sprints (High Level)

**Sprint 9: Multiple Hunt Types**
- Implement hunt type configurations
- Compass-only hunt
- Radar-only hunt
- Pure AR hunt
- Timed release hunts

**Sprint 10: Social Features**
- Friends list
- Leaderboards (global, regional, grid)
- See other hunters on same coin
- Activity feed

**Sprint 11: Sponsor System**
- Sponsor account type
- Custom coin logos
- Sponsor analytics dashboard
- Branded hunt creation

**Sprint 12: Content & Polish**
- Multiple Black Bart voice lines
- More coin denominations
- Achievement badges
- Push notifications

---

## 🎮 Phase 3: Advanced Features

*(To be detailed after Phase 2 completion)*

### Overview

Based on docs/project-scope.md Phase 3:
- Guilds and teams
- Advanced treasure hunt mechanics
- Gambling mechanics (hide for time, get bonus)
- Mythical coin hunts at famous locations

---

## 📚 Reference Documents

| Document | Use For |
|----------|---------|
| [project-vision.md](../project-vision.md) | Overall concept, tech stack, collaboration guide |
| [tech-stack-setup-guide.md](./tech-stack-setup-guide.md) | ViroReact reference, code examples, setup |
| [project-scope.md](./project-scope.md) | Features, phases, business model |
| [prize-finder-details.md](./prize-finder-details.md) | AR UI layout, compass, gas meter |
| [coins-and-collection.md](./coins-and-collection.md) | Coin design, collection mechanics |
| [economy-and-currency.md](./economy-and-currency.md) | BBG, gas system, find limits |
| [treasure-hunt-types.md](./treasure-hunt-types.md) | Hunt configurations |
| [user-accounts-security.md](./user-accounts-security.md) | Auth, anti-cheat |
| [social-features.md](./social-features.md) | Friends, leaderboards, guilds |
| [admin-dashboard.md](./admin-dashboard.md) | Admin tools |
| [dynamic-coin-distribution.md](./dynamic-coin-distribution.md) | Pool system, coin distribution |
| [safety-and-legal-research.md](./safety-and-legal-research.md) | Legal considerations |

---

## 🏴‍☠️ Final Notes

### Tips for Success

1. **Test on real devices** - AR doesn't work in simulators
2. **Commit often** - After each working feature
3. **Read the docs** - Reference documents have important details
4. **Ask questions** - If a prompt is unclear, ask for clarification
5. **One step at a time** - Don't skip ahead

### When You Get Stuck

1. Re-read the relevant documentation
2. Check the tech-stack-setup-guide.md for code examples
3. Search ViroReact docs: https://viro-community.readme.io
4. Break the problem into smaller pieces

### Version History

| Date | Changes |
|------|---------|
| Jan 2026 | Initial build guide created |

---

**Ready to build? Start with Prompt 0.1!** 🏴‍☠️
