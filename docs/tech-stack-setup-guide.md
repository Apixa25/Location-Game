# 🛠️ Tech Stack & Project Setup Guide

This document captures all research and decisions about the technology stack for **Black Bart's Gold**. Use this as a reference when starting development or resuming after a break.

---

## 📋 Table of Contents

1. [Tech Stack Decision Summary](#tech-stack-decision-summary)
2. [Why React Native + ViroReact](#why-react-native--viroreact)
3. [ViroReact Capabilities Deep Dive](#viroreact-capabilities-deep-dive)
4. [Complete Package List](#complete-package-list)
5. [Project Structure](#project-structure)
6. [Setup Instructions](#setup-instructions)
7. [ViroReact Component Reference](#viroreact-component-reference)
8. [Code Examples for Black Bart's Gold](#code-examples-for-black-barts-gold)
9. [Development Workflow](#development-workflow)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Tech Stack Decision Summary

### Research Date: January 2026

### Final Decision: React Native + ViroReact

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Mobile Framework** | React Native | 0.73+ | Cross-platform iOS/Android |
| **AR Library** | @reactvision/react-viro | 2.50+ | AR camera, 3D objects, animations |
| **Language** | TypeScript | 5.x | Type safety, better DX |
| **State Management** | Zustand | 4.x | Simple, lightweight state |
| **Navigation** | React Navigation | 6.x | Screen navigation |
| **GPS/Location** | react-native-geolocation-service | 5.x | High-accuracy location |
| **Permissions** | react-native-permissions | 4.x | Camera/location permissions |
| **Haptics** | react-native-haptic-feedback | 2.x | Vibration feedback |
| **Local Storage** | @react-native-async-storage/async-storage | 1.x | Offline data |
| **HTTP Client** | Axios | 1.x | API communication |

### Backend (Future Implementation)

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Node.js 20 LTS | Server runtime |
| **Framework** | Express.js or Fastify | REST API |
| **Database** | PostgreSQL + PostGIS | Geospatial coin storage |
| **ORM** | Prisma | Type-safe DB queries |
| **Auth** | Firebase Auth | Gmail/email login |
| **Bitcoin** | Strike API or OpenNode | BTC integration |
| **Cloud** | AWS or Vercel | Hosting |

---

## 🤔 Why React Native + ViroReact

### Alternatives Considered

#### Flutter + AR Plugins
**Rejected because:**
- Main AR plugin (ar_flutter_plugin) last updated November 2022 - **3 years stale**
- arcore_flutter_plugin last updated 2+ years ago
- Flutter doesn't have native AR support - relies on unmaintained third-party plugins
- Would require learning Dart (new language)
- Risk of plugin breaking with no maintenance

#### ViroReact
**Selected because:**
- **Actively maintained** - v2.50.1 released December 24, 2025
- **Corporate backing** - Morrow acquired ReactVision in 2025, now has full-time team
- **Purpose-built for AR** - Not a wrapper, native AR integration
- **JavaScript/TypeScript** - Familiar language, huge ecosystem
- **React Native integration** - Single codebase for iOS + Android
- **60+ components** - Comprehensive AR toolkit
- **Good documentation** - viro-community.readme.io

### Community Health (January 2026)

| Metric | ViroReact | Flutter AR |
|--------|-----------|------------|
| Last Update | Dec 2025 | Nov 2022 |
| GitHub Stars | 1.7k | ~360 likes |
| Maintenance | Full-time team | Abandoned |
| Open Issues | 25 (being addressed) | Unknown |

---

## 🎮 ViroReact Capabilities Deep Dive

### Scene Management

#### ViroARSceneNavigator
The entry point for all AR apps. Manages scene stack and navigation.

```typescript
<ViroARSceneNavigator
  initialScene={{ scene: PrizeFinderScene }}
  autofocus={true}
  hdrEnabled={true}
  bloomEnabled={true}
/>
```

**Key Features:**
- `push()` - Add new scene to stack
- `pop()` - Return to previous scene
- `jump()` - Switch between scenes
- `replace()` - Swap current scene
- `resetARSession()` - Realign tracking (iOS)
- Video recording and screenshot capture

#### ViroARScene
Container for all AR content. Handles tracking and real-world interaction.

```typescript
<ViroARScene
  onTrackingUpdated={this.handleTracking}
  onCameraARHitTest={this.handleCrosshairTarget}
  onAmbientLightUpdate={this.handleLighting}
  anchorDetectionTypes={["PlanesHorizontal"]}
>
  {/* 3D content goes here */}
</ViroARScene>
```

**Key Props:**
- `anchorDetectionTypes` - "PlanesHorizontal", "PlanesVertical"
- `displayPointCloud` - Visualize AR tracking points
- `postProcessEffects` - Visual filters (grayscale, sepia, etc.)
- `physicsWorld` - Global physics settings
- `soundRoom` - Acoustic properties

**Key Events:**
- `onTrackingUpdated` - Tracking state changes (UNAVAILABLE, LIMITED, NORMAL)
- `onCameraARHitTest` - Hit test results for crosshair targeting
- `onARPointCloudUpdate` - Point cloud data
- `onAmbientLightUpdate` - Real-world lighting info
- `onAnchorFound/Updated/Removed` - Anchor lifecycle

**Key Methods:**
- `performARHitTestWithPoint()` - Test ray intersection
- `getCameraOrientationAsync()` - Get camera transform
- `findCollisionsWithRayAsync()` - Physics ray casting

---

### 3D Objects

#### Viro3DObject (For Coins!)
Loads and displays 3D models.

```typescript
<Viro3DObject
  source={require('./assets/coin.obj')}
  resources={[require('./assets/coin.mtl')]}
  type="OBJ"
  position={[0, 0, -2]}
  scale={[0.1, 0.1, 0.1]}
  rotation={[0, 0, 0]}
  animation={{
    name: "spinCoin",
    run: true,
    loop: true
  }}
  onClick={this.handleCoinCollect}
  onHover={this.handleCrosshairHover}
/>
```

**Supported Formats:**
- `.OBJ` - Standard 3D format (recommended)
- `.VRX` - Viro's format (convert from FBX)
- `.GLB/.GLTF` - May need conversion

**Key Props:**
- `source` - 3D model file
- `resources` - MTL files, textures
- `type` - "OBJ" or "VRX"
- `position` - [x, y, z] in meters
- `rotation` - [x, y, z] in degrees
- `scale` - [x, y, z] multipliers
- `materials` - Custom materials
- `animation` - Animation config
- `physicsBody` - Physics properties
- `opacity` - Transparency (0-1)

**Events:**
- `onClick` - Tap/click
- `onHover` - Crosshair enters/exits
- `onDrag` - Drag gesture
- `onPinch` - Pinch to scale
- `onRotate` - Two-finger rotate

#### ViroNode (Grouping)
Groups objects together. Transforms cascade to children.

```typescript
<ViroNode position={[0, 0, -3]} rotation={[0, 45, 0]}>
  <Viro3DObject source={require('./coin.obj')} />
  <ViroParticleEmitter /* sparkles */ />
  <ViroText text="$5.00" />
</ViroNode>
```

#### Primitive Shapes
- `ViroBox` - Cubes/rectangles
- `ViroSphere` - Spheres
- `ViroQuad` - Flat surfaces
- `ViroPolygon` - Custom shapes
- `ViroPolyline` - 3D lines

---

### Animation System

#### Registering Animations

```typescript
import { ViroAnimations } from '@reactvision/react-viro';

ViroAnimations.registerAnimations({
  // Simple spin (for idle coins)
  spinCoin: {
    properties: { rotateY: "+=360" },
    duration: 2000,
    easing: "Linear"
  },

  // Bob up and down
  bobUp: {
    properties: { positionY: "+=0.05" },
    duration: 500,
    easing: "EaseInEaseOut"
  },
  bobDown: {
    properties: { positionY: "-=0.05" },
    duration: 500,
    easing: "EaseInEaseOut"
  },

  // Glow pulse (scale up/down)
  pulseUp: {
    properties: { scaleX: 1.1, scaleY: 1.1, scaleZ: 1.1 },
    duration: 300,
    easing: "EaseOut"
  },
  pulseDown: {
    properties: { scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0 },
    duration: 300,
    easing: "EaseIn"
  },

  // Fly to camera on collect
  flyToCamera: {
    properties: {
      positionZ: "+=2",
      scaleX: 0.3,
      scaleY: 0.3,
      scaleZ: 0.3
    },
    duration: 500,
    easing: "EaseIn"
  },

  // Fade out
  fadeOut: {
    properties: { opacity: 0 },
    duration: 300
  },

  // Chain: bob continuously
  coinFloat: [["bobUp", "bobDown"]],  // Sequential

  // Chain: idle animation (spin + float simultaneously)
  coinIdle: [["spinCoin"], ["coinFloat"]],  // Parallel

  // Chain: collection animation
  coinCollect: [["flyToCamera", "fadeOut"]]  // Parallel
});
```

**Animation Properties:**
- `positionX`, `positionY`, `positionZ`
- `rotateX`, `rotateY`, `rotateZ` (degrees)
- `scaleX`, `scaleY`, `scaleZ`
- `opacity` (0-1)
- Material properties

**Operators:**
- `+=` - Add to current value
- `-=` - Subtract from current
- `*=` - Multiply current
- `/=` - Divide current

**Easing Options:**
- `Linear`
- `EaseIn`
- `EaseOut`
- `EaseInEaseOut`
- `Bounce`

---

### Lighting System

```typescript
<ViroARScene>
  {/* Global ambient light */}
  <ViroAmbientLight color="#FFFFFF" intensity={200} />

  {/* Directional light (sun-like) */}
  <ViroDirectionalLight
    color="#FFFFFF"
    direction={[0, -1, -0.5]}
    castsShadow={true}
    shadowOpacity={0.5}
  />

  {/* Spot light for coin highlight */}
  <ViroSpotLight
    position={[0, 2, 0]}
    direction={[0, -1, 0]}
    attenuationStartDistance={2}
    attenuationEndDistance={5}
    innerAngle={5}
    outerAngle={20}
    castsShadow={true}
  />
</ViroARScene>
```

**Light Types:**
- `ViroAmbientLight` - Global, no direction
- `ViroDirectionalLight` - Sun-like, parallel rays
- `ViroSpotLight` - Cone of light
- `ViroOmniLight` - Point light, radiates all directions

---

### Audio System (Black Bart Voice!)

```typescript
// Sound effects
<ViroSound
  source={require('./assets/audio/coin-collect.mp3')}
  paused={!this.state.playSound}
  volume={1.0}
  loop={false}
  onFinish={this.handleSoundComplete}
/>

// Black Bart congratulations
<ViroSound
  source={require('./assets/audio/blackbart-congrats-01.mp3')}
  paused={!this.state.showCongrats}
  volume={1.0}
/>

// Spatial audio (sound from coin location)
<ViroSpatialSound
  source={require('./assets/audio/coin-sparkle.mp3')}
  position={coinPosition}
  paused={false}
  loop={true}
  volume={0.5}
  minDistance={1}
  maxDistance={10}
/>
```

**Audio Components:**
- `ViroSound` - Basic mono/stereo (.mp3, .wav)
- `ViroSpatialSound` - 3D positional audio
- `ViroSoundField` - Ambient soundscapes

**Key Methods:**
- `seekToTime(seconds)` - Jump to position
- `ViroSound.preloadSounds()` - Preload for performance

---

### Particle Effects (Coin Sparkles!)

```typescript
<ViroParticleEmitter
  position={[0, 0, 0]}
  duration={2000}
  visible={true}
  run={true}
  loop={true}
  fixedToEmitter={true}

  image={{
    source: require('./assets/sparkle.png'),
    height: 0.02,
    width: 0.02,
    bloomThreshold: 0.5
  }}

  spawnBehavior={{
    particleLifetime: [1000, 2000],
    emissionRatePerSecond: [20, 30],
    maxParticles: 50
  }}

  particleAppearance={{
    opacity: {
      initialRange: [0.8, 1.0],
      interpolation: [
        { endValue: 0.0, interval: [800, 1000] }
      ]
    },
    scale: {
      initialRange: [[0.5, 0.5, 0.5], [1.0, 1.0, 1.0]],
      interpolation: [
        { endValue: [0, 0, 0], interval: [800, 1000] }
      ]
    }
  }}

  particlePhysics={{
    velocity: {
      initialRange: [[-0.5, 0.5, -0.5], [0.5, 1.0, 0.5]]
    }
  }}
/>
```

**Spawn Behavior:**
- `particleLifetime` - How long particles live
- `emissionRatePerSecond` - Particles per second
- `emissionBurst` - Burst of particles
- `maxParticles` - Pool size

**Appearance:**
- `opacity` - Fade over lifetime
- `scale` - Size changes
- `rotation` - Spin
- `color` - Color changes

**Physics:**
- `velocity` - Initial movement
- `acceleration` - Gravity/forces

---

### Physics Engine

```typescript
<ViroARScene physicsWorld={{ gravity: [0, -9.8, 0] }}>
  <Viro3DObject
    source={require('./coin.obj')}
    physicsBody={{
      type: 'dynamic',      // 'static', 'kinematic', 'dynamic'
      mass: 1,
      restitution: 0.8,     // Bounciness (0-1)
      friction: 0.5,
      shape: { type: 'Sphere', params: [0.1] },
      velocity: [0, 0, 0],
      enabled: true
    }}
    onCollision={this.handleCollision}
  />
</ViroARScene>
```

**Body Types:**
- `dynamic` - Moves under physics, responds to forces
- `kinematic` - Moves under code control, affects others
- `static` - Cannot move (floors, walls)

**Methods:**
- `applyImpulse([x, y, z])` - One-time force
- `applyTorqueImpulse([x, y, z])` - Rotational force
- `setVelocity([x, y, z])` - Direct velocity

---

### 3D Text (Value Labels)

```typescript
<ViroText
  text="$5.00"
  position={[0, 0.2, 0]}
  scale={[0.5, 0.5, 0.5]}
  style={{
    fontFamily: 'Arial',
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFD700',  // Gold
    textAlignVertical: 'center',
    textAlign: 'center'
  }}
  extrusionDepth={2}  // 3D depth
  materials={["goldText"]}
  outerStroke={{
    type: "Outline",
    width: 2,
    color: "#000000"
  }}
  transformBehaviors={["billboard"]}  // Always face camera
/>
```

---

## 📦 Complete Package List

### package.json Dependencies

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.x",

    "@reactvision/react-viro": "^2.50.0",

    "@react-navigation/native": "^6.x",
    "@react-navigation/native-stack": "^6.x",
    "react-native-screens": "^3.x",
    "react-native-safe-area-context": "^4.x",

    "zustand": "^4.x",

    "react-native-geolocation-service": "^5.x",
    "react-native-permissions": "^4.x",
    "react-native-haptic-feedback": "^2.x",

    "@react-native-async-storage/async-storage": "^1.x",
    "axios": "^1.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/react": "^18.x",
    "@types/react-native": "^0.73.x",
    "eslint": "^8.x",
    "prettier": "^3.x",
    "jest": "^29.x"
  }
}
```

### iOS Requirements (Podfile)
- iOS 12.0+ minimum
- ARKit support
- Camera permission
- Location permission

### Android Requirements (build.gradle)
- minSdkVersion 24 (Android 7.0+)
- ARCore support
- Camera permission
- Fine location permission

---

## 📁 Project Structure

```
BlackBartsGold/
├── src/
│   ├── App.tsx                 # Entry point
│   ├── navigation/
│   │   └── AppNavigator.tsx    # React Navigation setup
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx      # Main menu
│   │   ├── PrizeFinderScreen.tsx   # AR camera view
│   │   ├── MapScreen.tsx       # Grid/coin map
│   │   ├── WalletScreen.tsx    # BBG balance
│   │   └── SettingsScreen.tsx  # User settings
│   │
│   ├── ar/
│   │   ├── PrizeFinderScene.tsx    # ViroARScene
│   │   ├── CoinObject.tsx      # Reusable coin component
│   │   ├── animations.ts       # ViroAnimations registry
│   │   └── materials.ts        # ViroMaterials registry
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Compass.tsx
│   │   │   ├── GasMeter.tsx
│   │   │   ├── MiniMap.tsx
│   │   │   └── Crosshairs.tsx
│   │   └── shared/
│   │       ├── Button.tsx
│   │       └── Card.tsx
│   │
│   ├── store/
│   │   ├── useAppStore.ts      # Zustand store
│   │   ├── useLocationStore.ts
│   │   └── useWalletStore.ts
│   │
│   ├── services/
│   │   ├── api.ts              # Backend API calls
│   │   ├── location.ts         # GPS wrapper
│   │   └── haptics.ts          # Vibration wrapper
│   │
│   ├── hooks/
│   │   ├── useLocation.ts
│   │   ├── useCoins.ts
│   │   └── useARTracking.ts
│   │
│   ├── utils/
│   │   ├── coordinates.ts      # GPS math
│   │   ├── distance.ts         # Haversine formula
│   │   └── constants.ts
│   │
│   └── types/
│       ├── coin.ts
│       ├── user.ts
│       └── navigation.ts
│
├── assets/
│   ├── models/
│   │   ├── coin.obj
│   │   ├── coin.mtl
│   │   └── coin_texture.png
│   ├── audio/
│   │   ├── coin-collect.mp3
│   │   ├── blackbart-congrats-01.mp3
│   │   └── sparkle-loop.mp3
│   ├── images/
│   │   ├── sparkle.png
│   │   └── compass-arrow.png
│   └── fonts/
│       └── PirateFont.ttf
│
├── ios/
├── android/
├── __tests__/
├── docs/
├── package.json
├── tsconfig.json
├── babel.config.js
└── metro.config.js
```

---

## 🚀 Setup Instructions

### Prerequisites

1. **Node.js 18+** - JavaScript runtime
2. **Watchman** (macOS) - File watcher
3. **Xcode 15+** (macOS) - iOS builds
4. **Android Studio** - Android builds + emulator
5. **CocoaPods** - iOS dependencies
6. **Physical Device** - AR requires real device (no simulator!)

### Step 1: Create Project

Option A - Use ViroReact Starter Kit (Recommended):
```bash
git clone https://github.com/ViroCommunity/starter-kit.git BlackBartsGold
cd BlackBartsGold
npm install
```

Option B - Fresh React Native + Add Viro:
```bash
npx react-native init BlackBartsGold --template react-native-template-typescript
cd BlackBartsGold
npm install @reactvision/react-viro
```

### Step 2: Install Dependencies

```bash
# Core dependencies
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context

# State management
npm install zustand

# Location & permissions
npm install react-native-geolocation-service
npm install react-native-permissions

# Haptics & storage
npm install react-native-haptic-feedback
npm install @react-native-async-storage/async-storage

# HTTP client
npm install axios
```

### Step 3: iOS Setup

```bash
cd ios
pod install
cd ..
```

Update `ios/BlackBartsGold/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>Black Bart's Gold needs camera access to show virtual coins in the real world</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Black Bart's Gold needs your location to place coins near you</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Black Bart's Gold needs your location to notify you of nearby coins</string>

<key>UIRequiredDeviceCapabilities</key>
<array>
  <string>arkit</string>
</array>
```

### Step 4: Android Setup

Update `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<uses-feature android:name="android.hardware.camera.ar" android:required="true" />

<application>
  <meta-data android:name="com.google.ar.core" android:value="required" />
</application>
```

Update `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        minSdkVersion 24
    }
}
```

### Step 5: Run on Device

```bash
# iOS (must use physical device)
npx react-native run-ios --device

# Android (must use physical device)
npx react-native run-android
```

---

## 💻 Code Examples for Black Bart's Gold

### Basic AR Scene Setup

```typescript
// src/ar/PrizeFinderScene.tsx
import React, { useState, useEffect } from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroARSceneNavigator,
} from '@reactvision/react-viro';
import { CoinObject } from './CoinObject';
import { useLocationStore } from '../store/useLocationStore';

interface Coin {
  id: string;
  position: [number, number, number];
  value: number;
}

const PrizeFinderScene = () => {
  const [trackingState, setTrackingState] = useState('UNAVAILABLE');
  const [nearbyCoins, setNearbyCoins] = useState<Coin[]>([]);

  const handleTrackingUpdated = (state: number, reason: number) => {
    const states = ['UNAVAILABLE', 'LIMITED', 'NORMAL'];
    setTrackingState(states[state] || 'UNAVAILABLE');
  };

  const handleCoinCollect = (coinId: string) => {
    // Remove coin from scene
    setNearbyCoins(coins => coins.filter(c => c.id !== coinId));
    // Play collection animation + sound
    // Update wallet
  };

  return (
    <ViroARScene onTrackingUpdated={handleTrackingUpdated}>
      {/* Lighting */}
      <ViroAmbientLight color="#FFFFFF" intensity={200} />
      <ViroDirectionalLight
        color="#FFFFFF"
        direction={[0, -1, -0.5]}
        castsShadow={true}
      />

      {/* Render coins */}
      {nearbyCoins.map(coin => (
        <CoinObject
          key={coin.id}
          id={coin.id}
          position={coin.position}
          value={coin.value}
          onCollect={() => handleCoinCollect(coin.id)}
        />
      ))}
    </ViroARScene>
  );
};

// Navigator wrapper
export const PrizeFinder = () => (
  <ViroARSceneNavigator
    initialScene={{ scene: PrizeFinderScene }}
    autofocus={true}
    hdrEnabled={true}
    bloomEnabled={true}
  />
);
```

### Coin Component

```typescript
// src/ar/CoinObject.tsx
import React, { useState } from 'react';
import {
  ViroNode,
  Viro3DObject,
  ViroParticleEmitter,
  ViroText,
  ViroSound,
} from '@reactvision/react-viro';

interface CoinObjectProps {
  id: string;
  position: [number, number, number];
  value: number;
  onCollect: () => void;
}

export const CoinObject: React.FC<CoinObjectProps> = ({
  id,
  position,
  value,
  onCollect,
}) => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [playSound, setPlaySound] = useState(false);

  const handleClick = () => {
    if (isCollecting) return;

    setIsCollecting(true);
    setPlaySound(true);

    // Delay removal for animation
    setTimeout(() => {
      onCollect();
    }, 800);
  };

  return (
    <ViroNode position={position}>
      {/* The coin model */}
      <Viro3DObject
        source={require('../../assets/models/coin.obj')}
        resources={[require('../../assets/models/coin.mtl')]}
        type="OBJ"
        scale={[0.1, 0.1, 0.1]}
        animation={{
          name: isCollecting ? "coinCollect" : "coinIdle",
          run: true,
          loop: !isCollecting,
        }}
        onClick={handleClick}
      />

      {/* Sparkle particles */}
      <ViroParticleEmitter
        position={[0, 0, 0]}
        duration={-1}
        run={!isCollecting}
        loop={true}
        image={{
          source: require('../../assets/images/sparkle.png'),
          height: 0.02,
          width: 0.02,
        }}
        spawnBehavior={{
          particleLifetime: [1000, 1500],
          emissionRatePerSecond: [10, 15],
          maxParticles: 20,
        }}
        particleAppearance={{
          opacity: {
            initialRange: [0.8, 1.0],
            interpolation: [{ endValue: 0, interval: [800, 1000] }],
          },
        }}
        particlePhysics={{
          velocity: {
            initialRange: [[-0.2, 0.3, -0.2], [0.2, 0.5, 0.2]],
          },
        }}
      />

      {/* Value label */}
      <ViroText
        text={`$${value.toFixed(2)}`}
        position={[0, 0.15, 0]}
        scale={[0.3, 0.3, 0.3]}
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: '#FFD700',
          textAlign: 'center',
        }}
        transformBehaviors={["billboard"]}
      />

      {/* Collection sound */}
      <ViroSound
        source={require('../../assets/audio/coin-collect.mp3')}
        paused={!playSound}
        volume={1.0}
        onFinish={() => setPlaySound(false)}
      />
    </ViroNode>
  );
};
```

### Animation Registry

```typescript
// src/ar/animations.ts
import { ViroAnimations } from '@reactvision/react-viro';

ViroAnimations.registerAnimations({
  // Continuous spin
  spinCoin: {
    properties: { rotateY: "+=360" },
    duration: 2000,
    easing: "Linear",
  },

  // Floating bob
  bobUp: {
    properties: { positionY: "+=0.03" },
    duration: 600,
    easing: "EaseInEaseOut",
  },
  bobDown: {
    properties: { positionY: "-=0.03" },
    duration: 600,
    easing: "EaseInEaseOut",
  },
  coinFloat: [["bobUp", "bobDown"]],

  // Idle = spin + float
  coinIdle: [["spinCoin"], ["coinFloat"]],

  // Collection animation
  flyForward: {
    properties: { positionZ: "+=1.5", positionY: "+=0.3" },
    duration: 400,
    easing: "EaseIn",
  },
  spinFast: {
    properties: { rotateY: "+=720" },
    duration: 400,
  },
  shrink: {
    properties: { scaleX: 0.05, scaleY: 0.05, scaleZ: 0.05 },
    duration: 300,
    delay: 400,
  },
  fadeOut: {
    properties: { opacity: 0 },
    duration: 200,
    delay: 500,
  },
  coinCollect: [["flyForward", "spinFast"], ["shrink"], ["fadeOut"]],
});
```

### Location Service

```typescript
// src/services/location.ts
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Black Bart's Gold Location Permission",
        message: "We need your location to show coins near you",
        buttonPositive: "Allow",
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true; // iOS handles via Info.plist
};

export const getCurrentPosition = (): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
}> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
};

export const watchPosition = (
  onUpdate: (position: { latitude: number; longitude: number }) => void
): number => {
  return Geolocation.watchPosition(
    (position) => {
      onUpdate({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => console.error(error),
    {
      enableHighAccuracy: true,
      distanceFilter: 5, // Update every 5 meters
      interval: 5000,    // Check every 5 seconds
      fastestInterval: 2000,
    }
  );
};
```

### Zustand Store

```typescript
// src/store/useAppStore.ts
import { create } from 'zustand';

interface Coin {
  id: string;
  latitude: number;
  longitude: number;
  value: number;
  hidden_by: string;
}

interface AppState {
  // User
  userId: string | null;
  bbgBalance: number;
  findLimit: number;
  gasRemaining: number;

  // Coins
  nearbyCoins: Coin[];
  selectedCoinId: string | null;

  // Actions
  setUser: (id: string) => void;
  addBBG: (amount: number) => void;
  subtractGas: (amount: number) => void;
  setNearbyCoins: (coins: Coin[]) => void;
  selectCoin: (id: string) => void;
  removeCoin: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  userId: null,
  bbgBalance: 0,
  findLimit: 1.00,
  gasRemaining: 30,
  nearbyCoins: [],
  selectedCoinId: null,

  // Actions
  setUser: (id) => set({ userId: id }),

  addBBG: (amount) => set((state) => ({
    bbgBalance: state.bbgBalance + amount,
  })),

  subtractGas: (amount) => set((state) => ({
    gasRemaining: Math.max(0, state.gasRemaining - amount),
  })),

  setNearbyCoins: (coins) => set({ nearbyCoins: coins }),

  selectCoin: (id) => set({ selectedCoinId: id }),

  removeCoin: (id) => set((state) => ({
    nearbyCoins: state.nearbyCoins.filter((c) => c.id !== id),
  })),
}));
```

---

## 🔧 Development Workflow

### Daily Development

1. **Start Metro bundler:**
   ```bash
   npm start
   ```

2. **Run on device:**
   ```bash
   # iOS
   npx react-native run-ios --device

   # Android
   npx react-native run-android
   ```

3. **Hot reload:** Shake device or press `R` in terminal

### Testing AR

- **Must use physical device** - simulators don't support AR
- Test in well-lit environments
- Move around to improve tracking
- Point camera at textured surfaces (not blank walls)

### Debugging

- React Native Debugger
- Flipper
- `console.log` in Metro terminal
- ViroReact `displayPointCloud` prop for AR debugging

---

## 🔥 Troubleshooting

### Common Issues

**"AR Session Failed"**
- Check camera permissions
- Ensure device supports ARKit/ARCore
- Try in better lighting

**"Tracking Limited"**
- Move to area with more visual features
- Avoid blank walls, move to textured surfaces
- Ensure adequate lighting

**"3D Object Not Visible"**
- Check position (might be behind camera)
- Check scale (might be too small/large)
- Verify file path is correct

**iOS Build Fails**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Android Build Fails**
```bash
cd android
./gradlew clean
cd ..
```

---

## 📚 Resources

- **ViroReact Docs:** https://viro-community.readme.io/docs
- **ViroReact GitHub:** https://github.com/ViroCommunity/viro
- **React Native Docs:** https://reactnative.dev
- **React Navigation:** https://reactnavigation.org
- **Zustand:** https://github.com/pmndrs/zustand
- **ARKit:** https://developer.apple.com/arkit/
- **ARCore:** https://developers.google.com/ar

---

## 📝 Version History

| Date | Changes |
|------|---------|
| Jan 2026 | Initial research - ViroReact v2.50.1 confirmed as actively maintained |
| Jan 2026 | Tech stack finalized: React Native + ViroReact + TypeScript |
| Jan 2026 | Flutter AR rejected due to abandoned plugins |
