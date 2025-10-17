# TextDecoder Polyfill Fix for React Native

## Problem
The ElevenLabs React Native SDK with LiveKit was throwing a runtime error:
```
ReferenceError: Property 'TextDecoder' doesn't exist
```

This occurs because React Native doesn't provide the `TextDecoder` and `TextEncoder` Web APIs that are required by LiveKit WebRTC libraries.

## Solution
Added comprehensive polyfills to provide these missing Web APIs:

### 1. Polyfill Package Installation
```bash
npm install text-encoding --save --legacy-peer-deps
npm install buffer --save --legacy-peer-deps
```

### 2. Polyfill Implementation (`src/polyfills.ts`)
- **TextEncoder/TextDecoder**: Multiple fallback approaches
  - Primary: `text-encoding-polyfill` package
  - Secondary: `text-encoding` package  
  - Fallback: Basic custom implementation
- **Buffer**: Node.js Buffer API for React Native
- **Performance**: Basic performance timing API

### 3. Early Loading (`index.js`)
```javascript
// Import polyfills first before any other modules
import './src/polyfills';
```

This ensures polyfills are loaded before React Native initializes and before any libraries that depend on these APIs.

### 4. Debug Logging
The polyfill provides comprehensive logging to verify successful loading:
```
🔧 Loading React Native polyfills...
✅ text-encoding-polyfill loaded
✅ TextEncoder polyfill applied
✅ TextDecoder polyfill applied
✅ Buffer polyfill applied
✅ Performance API polyfill applied
```

## Root Cause
LiveKit (used by ElevenLabs) expects Web APIs that are standard in browsers but not available in React Native:
- `TextEncoder` - Converts strings to UTF-8 byte arrays
- `TextDecoder` - Converts UTF-8 byte arrays to strings
- `Buffer` - Node.js binary data handling
- `performance.now()` - High-resolution timing

## Verification
After applying the polyfill:
1. App should start without TextDecoder errors
2. Console should show polyfill loading messages
3. ElevenLabs voice chat should initialize properly
4. LiveKit debug logs should work correctly

## Technical Notes
- **Legacy Peer Deps**: Required due to LiveKit version conflicts
- **Load Order**: Critical that polyfills load before React Native initialization
- **Multiple Fallbacks**: Ensures compatibility across different React Native versions
- **Development Only**: Some polyfills only log in `__DEV__` mode

This fix resolves the fundamental compatibility issue between React Native and WebRTC libraries, enabling proper LiveKit functionality for ElevenLabs voice chat.
