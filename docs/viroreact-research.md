# 🔬 ViroReact Research & Capabilities

Complete research on ViroReact for Black Bart's Gold AR development.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Why We Chose ViroReact](#why-we-chose-viroreact)
- [Supported Platforms](#supported-platforms)
- [Core Components](#core-components)
- [3D Object Support](#3d-object-support)
- [Animations](#animations)
- [Input & Gestures](#input--gestures)
- [GPS & Location-Based AR](#gps--location-based-ar)
- [Lighting & Materials](#lighting--materials)
- [Audio](#audio)
- [Known Limitations](#known-limitations)
- [What We CAN Build](#what-we-can-build-for-black-barts-gold)
- [What We CANNOT Build](#what-we-cannot-build-or-need-workarounds)
- [Resources & Links](#resources--links)
- [Code Examples](#code-examples)

---

## Overview

**ViroReact** is the leading library for building AR and VR experiences using React Native and Expo. It provides a high-performance native 3D rendering engine with a React-based declarative framework.

### Current Status (2025)
- **Owner**: Morrow (acquired ReactVision in 2025)
- **Latest Version**: 2.50.1 (as of January 2025)
- **License**: MIT (100% open source)
- **Maintenance**: Full-time dedicated development team
- **Package**: `@reactvision/react-viro`

### Key Stats
- 80+ components for AR/VR development
- Supports ARKit (iOS) and ARCore (Android)
- Single codebase for all platforms
- Active Discord community

---

## Why We Chose ViroReact

| Factor | ViroReact | Flutter AR |
|--------|-----------|------------|
| **Purpose-Built** | ✅ Designed for AR/VR | ❌ Third-party plugins |
| **Maintenance** | ✅ Full-time team | ❌ Abandoned since 2022 |
| **Corporate Backing** | ✅ Morrow | ❌ None for AR |
| **Documentation** | ✅ Comprehensive | ❌ Fragmented |
| **GPS + AR** | ✅ Supported | ⚠️ Limited |

---

## Supported Platforms

### AR Platforms
| Platform | Support |
|----------|---------|
| iOS ARKit | ✅ Full support |
| Android ARCore | ✅ Full support |

### VR Platforms (Future Use)
| Platform | Support |
|----------|---------|
| Google Cardboard | ✅ iOS + Android |
| Samsung Gear VR | ✅ Supported |
| Google Daydream | ✅ Supported |

### Device Requirements
- **iOS**: A9 chip or later, iOS 11+
- **Android**: ARCore compatible device, Android 7.0+

---

## Core Components

### Scene Components
| Component | Purpose |
|-----------|---------|
| `ViroARSceneNavigator` | Entry point for AR apps, manages scene navigation |
| `ViroARScene` | Container for all AR content (like React Native's View) |
| `ViroARPlane` | Attach content to detected planes |
| `ViroARPlaneSelector` | Let users select which plane to use |
| `ViroNode` | Grouping container for 3D objects |
| `ViroPortal` | Create portal effects into other scenes |

### 3D Objects
| Component | Purpose |
|-----------|---------|
| `Viro3DObject` | Load and display 3D models |
| `ViroBox` | Basic box geometry |
| `ViroSphere` | Basic sphere geometry |
| `ViroQuad` | 2D plane in 3D space |
| `ViroPolygon` | Custom polygon shapes |
| `ViroPolyline` | 3D lines |

### UI Components
| Component | Purpose |
|-----------|---------|
| `ViroText` | 3D text in AR space |
| `ViroImage` | 2D images in 3D space |
| `ViroAnimatedImage` | Animated GIFs/images |
| `ViroButton` | Interactive buttons |
| `ViroFlexView` | Flexbox-style layouts in 3D |
| `ViroSpinner` | Loading indicators |

### Media Components
| Component | Purpose |
|-----------|---------|
| `ViroVideo` | Video playback in AR |
| `Viro360Video` | 360° video |
| `Viro360Image` | 360° images |
| `ViroSound` | Audio playback |
| `ViroSpatialSound` | 3D positional audio |
| `ViroSoundField` | Ambient audio fields |

### Lighting
| Component | Purpose |
|-----------|---------|
| `ViroAmbientLight` | Overall scene lighting |
| `ViroDirectionalLight` | Sun-like directional light |
| `ViroSpotLight` | Focused spotlight |
| `ViroOmniLight` | Point light source |

### Effects
| Component | Purpose |
|-----------|---------|
| `ViroParticleEmitter` | Particle effects (sparks, smoke, etc.) |
| `ViroSkyBox` | Background environment |

---

## 3D Object Support

### Supported Formats
| Format | Support | Notes |
|--------|---------|-------|
| **OBJ** | ✅ Direct loading | Most compatible, no conversion needed |
| **glTF/GLB** | ✅ Supported | glTF 2.0, some limitations |
| **FBX** | ⚠️ Requires conversion | Must convert to VRX format (Mac only) |

### glTF 2.0 Limitations
Currently **NOT supported** in glTF:
- Emissive maps
- Sparse accessor data
- Non-indexed mesh rendering
- Double-sided rendering
- Baked cameras
- Morph targets
- Animations (static models only for glTF)

### Loading 3D Objects
```javascript
<Viro3DObject
  source={require('./models/coin.obj')}
  resources={[
    require('./models/coin.mtl'),
    require('./models/coin_diffuse.png'),
  ]}
  position={[0, 0, -2]}
  scale={[0.1, 0.1, 0.1]}
  rotation={[0, 45, 0]}
  type="OBJ"
  onLoadStart={() => console.log('Loading...')}
  onLoadEnd={() => console.log('Loaded!')}
  onError={(error) => console.log('Error:', error)}
/>
```

### Best Practices
- Use **OBJ format** for static objects (coins)
- Use **FBX → VRX** for animated objects
- Add `ViroAmbientLight` if models appear black
- Keep polygon counts reasonable for mobile performance
- Include all textures in `resources` array

---

## Animations

### ViroAnimations System
Register animations globally, then apply to any component:

```javascript
import { ViroAnimations } from '@reactvision/react-viro';

ViroAnimations.registerAnimations({
  rotate: {
    properties: { rotateY: "+=360" },
    duration: 2000,
  },
  bounce: {
    properties: { positionY: "+=0.2" },
    duration: 500,
    easing: "EaseInEaseOut",
  },
  spinAndBounce: [["rotate", "bounce"]],
});
```

### Applying Animations
```javascript
<Viro3DObject
  source={require('./coin.obj')}
  animation={{
    name: "rotate",
    run: true,
    loop: true,
  }}
/>
```

### Skeletal Animations (FBX)
FBX models can include skeletal animations:
```javascript
<Viro3DObject
  source={require('./character.vrx')}
  animation={{
    name: "walk",  // Name from FBX file
    run: true,
    loop: true,
  }}
/>
```

### Animation Properties
| Property | Animatable |
|----------|------------|
| `position` | ✅ Yes |
| `rotation` | ✅ Yes |
| `scale` | ✅ Yes |
| `opacity` | ✅ Yes |
| `color` | ✅ Yes |

---

## Input & Gestures

### Event Handlers
| Event | Trigger | Use Case |
|-------|---------|----------|
| `onClick` | User taps on object | **Collect coin** |
| `onClickState` | Click down/up/clicked states | Button feedback |
| `onHover` | Object in center of screen | Highlight coin |
| `onDrag` | User drags object | Move objects |
| `onPinch` | Two-finger pinch | Zoom |
| `onRotate` | Two-finger rotate | Rotate objects |
| `onScroll` | Touch pad scroll | Scroll UI |
| `onSwipe` | Swipe gesture | Navigation |
| `onFuse` | Hover for X milliseconds | Auto-select |

### Example: Clickable Coin
```javascript
<Viro3DObject
  source={require('./coin.obj')}
  onClick={(position, source) => {
    console.log('Coin collected at:', position);
    this.collectCoin();
  }}
  onHover={(isHovering) => {
    this.setState({ coinHighlighted: isHovering });
  }}
/>
```

### Drag to Move
```javascript
<Viro3DObject
  source={require('./coin.obj')}
  onDrag={(dragToPos, source) => {
    // dragToPos = [x, y, z] new position
  }}
  dragType="FixedToWorld"  // or "FixedDistance", "FixedDistanceOrigin"
/>
```

---

## GPS & Location-Based AR

### The Challenge
ViroReact's AR coordinate system is **local** (relative to camera start position), not **geographic**. GPS coordinates must be converted using **Web Mercator Projection**.

### Coordinate System
- Camera starts at `[0, 0, 0]`
- Forward vector: `[0, 0, -1]` (negative Z = north/forward)
- Up vector: `[0, 1, 0]`
- Right-handed coordinate system
- **X-axis** = East/West (longitude)
- **Z-axis** = North/South (latitude)
- **Y-axis** = Up/Down (altitude)

---

### ✅ THE SOLUTION: Web Mercator Projection

This is how developers are actually doing GPS-based AR with ViroReact:

#### Step 1: latLongToMerc Function
Converts GPS coordinates (degrees) to meters using Earth's radius:

```javascript
// Convert lat/long degrees to meters using Web Mercator projection
function latLongToMerc(lat_deg, lon_deg) {
  const sm_a = 6378137.0; // Earth's radius in meters

  const lon_rad = (lon_deg / 180.0) * Math.PI;
  const lat_rad = (lat_deg / 180.0) * Math.PI;

  const xmeters = sm_a * lon_rad;
  const ymeters = sm_a * Math.log((Math.sin(lat_rad) + 1) / Math.cos(lat_rad));

  return { x: xmeters, y: ymeters };
}
```

#### Step 2: transformPointToAR Function
Calculates the AR position relative to the device:

```javascript
// Transform GPS point to AR coordinates relative to device position
function transformPointToAR(targetLat, targetLon, deviceLat, deviceLon) {
  const objPoint = latLongToMerc(targetLat, targetLon);
  const devicePoint = latLongToMerc(deviceLat, deviceLon);

  // Calculate relative position in meters
  // Longitude (E/W) → X-axis
  // Latitude (N/S) → Z-axis (negated: negative Z = north/forward)
  const objFinalPosX = objPoint.x - devicePoint.x;
  const objFinalPosZ = -(objPoint.y - devicePoint.y); // Negate for AR coord system

  return { x: objFinalPosX, y: 0, z: objFinalPosZ };
}
```

#### Step 3: Apply Compass Rotation (Android)
iOS with `worldAlignment="GravityAndHeading"` handles this automatically.
Android requires manual rotation:

```javascript
// Rotate AR coordinates by device heading (Android only)
function rotateByHeading(x, z, headingDegrees) {
  const angle = headingDegrees * Math.PI / 180;

  const newX = x * Math.cos(angle) - z * Math.sin(angle);
  const newZ = z * Math.cos(angle) + x * Math.sin(angle);

  return { x: newX, z: newZ };
}
```

#### Complete Implementation Example

```javascript
import React, { useState, useEffect } from 'react';
import { ViroARScene, Viro3DObject, ViroAmbientLight } from '@reactvision/react-viro';
import Geolocation from 'react-native-geolocation-service';
import CompassHeading from 'react-native-compass-heading';
import { Platform } from 'react-native';

// Mercator projection
const latLongToMerc = (lat_deg, lon_deg) => {
  const sm_a = 6378137.0;
  const lon_rad = (lon_deg / 180.0) * Math.PI;
  const lat_rad = (lat_deg / 180.0) * Math.PI;
  const xmeters = sm_a * lon_rad;
  const ymeters = sm_a * Math.log((Math.sin(lat_rad) + 1) / Math.cos(lat_rad));
  return { x: xmeters, y: ymeters };
};

// Transform to AR coordinates
const transformPointToAR = (targetLat, targetLon, deviceLat, deviceLon, heading) => {
  const objPoint = latLongToMerc(targetLat, targetLon);
  const devicePoint = latLongToMerc(deviceLat, deviceLon);

  let x = objPoint.x - devicePoint.x;
  let z = -(objPoint.y - devicePoint.y);

  // Apply heading rotation on Android
  if (Platform.OS === 'android' && heading !== null) {
    const angle = heading * Math.PI / 180;
    const rotatedX = x * Math.cos(angle) - z * Math.sin(angle);
    const rotatedZ = z * Math.cos(angle) + x * Math.sin(angle);
    x = rotatedX;
    z = rotatedZ;
  }

  return [x, 0, z]; // [x, y, z] - y=0 for ground level
};

const CoinScene = ({ coinLat, coinLon }) => {
  const [deviceLocation, setDeviceLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const [coinPosition, setCoinPosition] = useState([0, 0, -5]);

  useEffect(() => {
    // Watch device location
    const watchId = Geolocation.watchPosition(
      (position) => {
        setDeviceLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, distanceFilter: 1 }
    );

    // Watch compass heading
    CompassHeading.start(3, (result) => {
      setHeading(result.heading);
    });

    return () => {
      Geolocation.clearWatch(watchId);
      CompassHeading.stop();
    };
  }, []);

  useEffect(() => {
    if (deviceLocation) {
      const arPos = transformPointToAR(
        coinLat, coinLon,
        deviceLocation.lat, deviceLocation.lon,
        heading
      );
      setCoinPosition(arPos);
    }
  }, [deviceLocation, heading, coinLat, coinLon]);

  return (
    <ViroARScene worldAlignment={Platform.OS === 'ios' ? 'GravityAndHeading' : 'Gravity'}>
      <ViroAmbientLight color="#ffffff" />
      <Viro3DObject
        source={require('./models/coin.obj')}
        position={coinPosition}
        scale={[0.5, 0.5, 0.5]}
        type="OBJ"
        onClick={() => console.log('Coin collected!')}
      />
    </ViroARScene>
  );
};

export default CoinScene;
```

---

### worldAlignment Settings

| Platform | Setting | Behavior |
|----------|---------|----------|
| **iOS** | `GravityAndHeading` | Automatic compass alignment, -Z = magnetic north |
| **iOS** | `Gravity` | Y-axis = gravity only, no compass |
| **Android** | `Gravity` | Must manually rotate by compass heading |

**Best Practice**: Use `GravityAndHeading` on iOS, manual rotation on Android.

---

### Known GPS/AR Challenges

| Challenge | Impact | Mitigation |
|-----------|--------|------------|
| **GPS Accuracy** | 3-10 meter error | Use AR for final targeting |
| **Compass Drift** | Objects shift over time | Re-calibrate periodically |
| **AR Drift** | Tracking degrades over long distances | Keep AR sessions localized |
| **Indoor** | GPS doesn't work | Use AR-only mode indoors |
| **Magnetic Interference** | Compass unreliable near metal | Warn users, use position deltas |

### Accuracy Expectations
From real-world implementations:
> "Objects show up where they are supposed to about 50% of the time at distance, but accuracy improves significantly the closer you get."

---

### Recommended Approach for Black Bart's Gold

Based on research, here's the **hybrid approach** (what Pokémon GO does):

```
1. MAP VIEW (Far Away)
   └── Show coin on 2D map
   └── User navigates using map
   └── GPS distance displayed

2. TRANSITION ZONE (~100 meters)
   └── "Coin nearby!" notification
   └── Switch to compass mode
   └── Vibration feedback begins

3. AR VIEW (Close Range ~30 meters)
   └── AR view activates
   └── Coin rendered at GPS-calculated position
   └── User sees coin in camera
   └── Accuracy is good at this range

4. COLLECTION ZONE (~10 meters)
   └── Coin is clearly visible
   └── User centers crosshairs
   └── Tap to collect
```

**Why this works:**
- Long distances: Map is more reliable than AR
- Short distances: GPS error is acceptable, AR is accurate
- Avoids the worst of both worlds (AR drift + GPS error)

---

### Position Delta Calibration (Advanced)

For better accuracy than compass, use **position delta** method:

```javascript
// Instead of trusting compass, calculate heading from movement
let lastPosition = null;

function calculateHeadingFromMovement(currentLat, currentLon) {
  if (lastPosition) {
    const deltaLat = currentLat - lastPosition.lat;
    const deltaLon = currentLon - lastPosition.lon;

    // Calculate bearing from movement direction
    const heading = Math.atan2(deltaLon, deltaLat) * 180 / Math.PI;
    return (heading + 360) % 360; // Normalize to 0-360
  }
  lastPosition = { lat: currentLat, lon: currentLon };
  return null;
}
```

This is more accurate than compass but requires user to be moving.

---

### Required Libraries for GPS+AR

```bash
npm install react-native-geolocation-service
npm install react-native-compass-heading
# or
npm install react-native-simple-compass
```

---

### ARCore Geospatial API (Advanced Future Option)

For more precise outdoor positioning, ARCore Geospatial API offers:
- WGS84 anchors (absolute GPS positioning)
- Terrain anchors (relative to ground)
- Rooftop anchors (relative to buildings)
- Visual Positioning System (VPS) for sub-meter accuracy

**Note**: This is native ARCore, would need custom bridging to ViroReact. Consider for Phase 3+.

---

## Lighting & Materials

### ViroMaterials
Define materials globally:
```javascript
import { ViroMaterials } from '@reactvision/react-viro';

ViroMaterials.createMaterials({
  gold: {
    diffuseColor: '#FFD700',
    lightingModel: 'Blinn',
    shininess: 0.8,
  },
  coinTexture: {
    diffuseTexture: require('./textures/coin_diffuse.png'),
    normalTexture: require('./textures/coin_normal.png'),
    specularTexture: require('./textures/coin_specular.png'),
    lightingModel: 'PBR',
  },
});
```

### Lighting Models
| Model | Use Case |
|-------|----------|
| `Constant` | Unlit, flat shading |
| `Lambert` | Diffuse only, no specular |
| `Blinn` | Standard shiny materials |
| `PBR` | Physically-based rendering (most realistic) |

### Basic Lighting Setup
```javascript
<ViroARScene>
  <ViroAmbientLight color="#ffffff" intensity={200} />
  <ViroDirectionalLight
    color="#ffffff"
    direction={[0, -1, -0.5]}
    castsShadow={true}
  />
  {/* Your content here */}
</ViroARScene>
```

---

## Audio

### Sound Types
| Component | Use Case |
|-----------|----------|
| `ViroSound` | 2D audio (UI sounds, music) |
| `ViroSpatialSound` | 3D positional audio (sounds from objects) |
| `ViroSoundField` | Ambient environmental audio |

### Black Bart Voice Lines
```javascript
<ViroSound
  source={require('./audio/blackbart_congrats.mp3')}
  paused={!this.state.playingCongrats}
  volume={1.0}
  onFinish={() => this.setState({ playingCongrats: false })}
/>
```

### Spatial Audio for Coins
```javascript
<ViroSpatialSound
  source={require('./audio/coin_shimmer.mp3')}
  position={coinPosition}
  rolloffModel="Linear"
  minDistance={1}
  maxDistance={10}
  loop={true}
/>
```

---

## Known Limitations

### Performance
| Issue | Details |
|-------|---------|
| JavaScript Thread | Complex apps may experience lag due to React Native JS thread |
| Polygon Count | High-poly models will slow down rendering |
| Multiple Objects | Too many 3D objects can impact framerate |

### Technical Constraints
| Limitation | Workaround |
|------------|------------|
| glTF animations not supported | Use FBX → VRX for animations |
| FBX conversion Mac-only | Pre-convert assets or use OBJ |
| GPS drift outdoors | Use GPS for proximity, AR for final targeting |
| Indoor GPS doesn't work | Use AR-only mode for indoor hunts |
| Debugging difficult | Use logging extensively, test on device |

### Device Limitations
| Issue | Details |
|-------|---------|
| Old devices | ARKit/ARCore have minimum device requirements |
| Battery drain | AR is power-intensive |
| Heat | Extended AR sessions cause device heating |

### Documentation Gaps
- Some docs are outdated (reference old Viro Media site)
- New Architecture (Fabric) migration still in progress
- Some edge cases not well documented

---

## What We CAN Build for Black Bart's Gold

### ✅ Fully Supported Features

| Feature | ViroReact Component | Notes |
|---------|---------------------|-------|
| **AR Camera View** | `ViroARScene` | Core Prize Finder view |
| **3D Spinning Coins** | `Viro3DObject` + `ViroAnimations` | OBJ format recommended |
| **Coin Collection** | `onClick` event | Tap to collect |
| **Coin Fly Animation** | `ViroAnimations` | Animate position to camera |
| **Targeting Crosshairs** | `ViroImage` or `ViroNode` | Overlay in center |
| **Coin Glow Effect** | `ViroParticleEmitter` or materials | Shimmer/glow |
| **Black Bart Voice** | `ViroSound` | Play on collection |
| **Coin Size Scaling** | Distance calculation + scale | Grow as approaching |
| **Vibration Feedback** | React Native Vibration API | Not ViroReact, but works |
| **Multiple Coin Types** | Different materials/textures | Gold/Silver/Bronze |
| **Custom Logos on Coins** | Texture swapping | User/sponsor logos |
| **Compass Overlay** | `ViroImage` + device heading | UI layer |
| **Mini-map Overlay** | Standard React Native View | Overlay on AR |

### ✅ Possible with Some Work

| Feature | Approach |
|---------|----------|
| **GPS-based coin placement** | Convert GPS to AR coords, show when in range |
| **Distance to coin** | Calculate from GPS, display in UI |
| **Hot/cold vibration** | GPS distance → vibration intensity |
| **Indoor AR hunts** | Pure AR mode, no GPS |
| **Coin highlighting on hover** | `onHover` + material change |

---

## What We CANNOT Build (Or Need Workarounds)

### ❌ Not Directly Supported

| Feature | Issue | Workaround |
|---------|-------|------------|
| **Precise GPS-to-AR alignment** | AR and GPS don't natively integrate | Use GPS for proximity only |
| **World-scale outdoor AR** | Drift over long distances | Keep AR experiences localized |
| **Occlusion (coins behind objects)** | Basic ARKit/ARCore only | Accept visual imperfection |
| **Shared AR multiplayer** | Not built-in | Would need custom server sync |
| **Persistent AR anchors** | Session-only by default | Use GPS as source of truth |

### ⚠️ Requires Native Code

| Feature | Approach |
|---------|----------|
| **ARCore Geospatial API** | Custom native module bridge |
| **Advanced device sensors** | Native modules |
| **Background location** | React Native background geolocation |

---

## Resources & Links

### Official Documentation
- [ViroReact Community Docs](https://viro-community.readme.io/docs/overview)
- [ViroReact GitHub (ReactVision)](https://github.com/ReactVision/viro)
- [npm Package](https://www.npmjs.com/package/@reactvision/react-viro)

### Legacy Docs (Still Useful)
- [Original Viro Media Docs](https://docs.viromedia.com/docs/viroarscene)
- [AR Overview](https://docs.viromedia.com/docs/augmented-reality-ar)
- [Input Events](https://docs.viromedia.com/docs/events)
- [3D Objects](https://docs.viromedia.com/docs/3d-objects)
- [Materials](https://docs.viromedia.com/docs/materials)
- [Image Recognition](https://docs.viromedia.com/docs/ar-image-recognition)
- [Tracking & Anchors](https://docs.viromedia.com/docs/ar-tracking-and-anchors)

### Tutorials
- [LogRocket: Build AR/VR with ViroReact](https://blog.logrocket.com/how-to-build-ar-vr-app-viroreact/)
- [DEV.to: Viro-React AR Made Easy](https://dev.to/jadejdoucet/viro-react-ar-made-easy-1ije)
- [Ordina: Indoor Navigation with ViroReact](https://blog.ordina-jworks.io/iot/2019/12/20/ar-signpost.html)
- [Somethings Blog: Build Immersive AR/VR](https://www.somethingsblog.com/2024/10/20/build-immersive-ar-vr-apps-with-viroreact/)

### GitHub Resources
- [ViroReact Releases](https://github.com/ReactVision/viro/releases)
- [GPS Positioning Issue #95](https://github.com/viromedia/viro/issues/95) - POI positioning discussion
- [GPS Coordinates Issue #131](https://github.com/viromedia/viro/issues/131) - latLongToMerc conversion code
- [ViroCore GPS Issue #182](https://github.com/viromedia/virocore/issues/182) - Complete Java implementation
- [Rotation Issue #538](https://github.com/viromedia/viro/issues/538)
- [Mapbox AR (Archived)](https://github.com/mapbox/react-native-mapbox-ar) - Location-based AR reference

### GPS + AR Tutorials
- [Ordina: Indoor Navigation with ViroReact](https://blog.ordina-jworks.io/iot/2019/12/20/ar-signpost.html) - Web Mercator projection explained
- [Instructables: AR Objects at GPS Coordinates](https://www.instructables.com/Placing-AR-Objects-at-GPS-Coordinates-in-Augmented/) - Position delta calibration

### Morrow (Current Owners)
- [Morrow AR/VR](https://www.themorrow.digital/augmented-reality)
- [Morrow Acquires ReactVision](https://www.themorrow.digital/blog/morrow-acquires-reactvision-and-viroreact-library)

### Community
- Discord (link in GitHub README)
- Stack Overflow tag: `viroreact`

### Related Technologies
- [ARCore Geospatial API](https://developers.google.com/ar/develop/geospatial) - For advanced GPS+AR
- [Mapbox](https://www.mapbox.com/) - For map integration
- [React Native Geolocation](https://github.com/react-native-geolocation/react-native-geolocation) - GPS tracking

---

## Code Examples

### Basic AR Scene
```javascript
import {
  ViroARScene,
  ViroARSceneNavigator,
  Viro3DObject,
  ViroAmbientLight,
  ViroAnimations,
} from '@reactvision/react-viro';

ViroAnimations.registerAnimations({
  spin: {
    properties: { rotateY: "+=360" },
    duration: 2000,
  },
});

const CoinScene = () => {
  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" />
      <Viro3DObject
        source={require('./models/coin.obj')}
        position={[0, 0, -2]}
        scale={[0.1, 0.1, 0.1]}
        type="OBJ"
        animation={{ name: "spin", run: true, loop: true }}
        onClick={() => console.log('Coin collected!')}
      />
    </ViroARScene>
  );
};

export default () => {
  return (
    <ViroARSceneNavigator
      initialScene={{ scene: CoinScene }}
    />
  );
};
```

### Coin Collection Animation
```javascript
ViroAnimations.registerAnimations({
  flyToCamera: {
    properties: {
      positionX: 0,
      positionY: 0,
      positionZ: -0.5,
      scaleX: 2,
      scaleY: 2,
      scaleZ: 2,
    },
    duration: 500,
    easing: "EaseInEaseOut",
  },
  spinFast: {
    properties: { rotateY: "+=720" },
    duration: 500,
  },
  collectSequence: [["flyToCamera", "spinFast"]],
});
```

### GPS Distance Check
```javascript
import Geolocation from 'react-native-geolocation-service';

const checkCoinProximity = (coinLat, coinLon, callback) => {
  Geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const distance = getDistanceFromLatLonInMeters(
        latitude, longitude, coinLat, coinLon
      );
      callback(distance);
    },
    (error) => console.log(error),
    { enableHighAccuracy: true }
  );
};

const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
```

---

## Next Steps for Black Bart's Gold

### Phase 1: Basic AR Prototype
1. [ ] Set up React Native + ViroReact project
2. [ ] Create basic AR scene with test coin
3. [ ] Implement coin spin animation
4. [ ] Add onClick collection
5. [ ] Add collection animation (fly to camera)
6. [ ] Add Black Bart sound effect

### Phase 2: GPS Integration
1. [ ] Add GPS tracking
2. [ ] Calculate distance to coins
3. [ ] Show coins only when in range
4. [ ] Implement vibration feedback
5. [ ] Add compass direction indicator

### Phase 3: Full Prize Finder
1. [ ] Build UI overlay (gas meter, mini-map, compass)
2. [ ] Multiple coin types with different materials
3. [ ] Custom logos on coins
4. [ ] Collection value display
5. [ ] Full animation sequence

---

*Last Updated: January 2025*
*ViroReact Version: 2.50.1*
