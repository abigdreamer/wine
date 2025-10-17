/**
 * React Native Polyfills
 * 
 * This file provides polyfills for web APIs that are not available
 * in React Native but are required by certain libraries like LiveKit.
 */

console.log('🔧 Loading React Native polyfills...');

// Try to import text encoding polyfill
try {
  require('text-encoding-polyfill');
  console.log('✅ text-encoding-polyfill loaded');
} catch (error) {
  console.warn('text-encoding-polyfill failed to load:', error);
}

// Fallback polyfill using text-encoding package
try {
  const { TextEncoder, TextDecoder } = require('text-encoding');
  
  // Add to global scope if not already present
  if (!(globalThis as any).TextEncoder) {
    (globalThis as any).TextEncoder = TextEncoder;
    console.log('✅ TextEncoder polyfill applied');
  }
  
  if (!(globalThis as any).TextDecoder) {
    (globalThis as any).TextDecoder = TextDecoder;
    console.log('✅ TextDecoder polyfill applied');
  }
} catch (error) {
  console.warn('text-encoding package polyfill failed:', error);
  
  // Last resort: basic TextEncoder/TextDecoder implementation
  if (!(globalThis as any).TextEncoder) {
    (globalThis as any).TextEncoder = class TextEncoder {
      encode(input: string = '') {
        const units = new Uint8Array(input.length);
        for (let i = 0; i < input.length; i++) {
          units[i] = input.charCodeAt(i);
        }
        return units;
      }
    };
    console.log('⚠️ Basic TextEncoder polyfill applied');
  }
  
  if (!(globalThis as any).TextDecoder) {
    (globalThis as any).TextDecoder = class TextDecoder {
      decode(input: Uint8Array) {
        let result = '';
        for (let i = 0; i < input.length; i++) {
          result += String.fromCharCode(input[i]);
        }
        return result;
      }
    };
    console.log('⚠️ Basic TextDecoder polyfill applied');
  }
}

// Buffer polyfill
try {
  if (!(globalThis as any).Buffer) {
    (globalThis as any).Buffer = require('buffer').Buffer;
    console.log('✅ Buffer polyfill applied');
  }
} catch (error) {
  console.warn('Buffer polyfill not available:', error);
}

// Performance API polyfill
if (!(globalThis as any).performance) {
  (globalThis as any).performance = {
    now: () => Date.now(),
    timeOrigin: Date.now(),
  };
  console.log('✅ Performance API polyfill applied');
}

// Final status check
if (__DEV__) {
  console.log('🔧 Polyfill Status Summary:');
  console.log('  • TextEncoder:', (globalThis as any).TextEncoder ? '✅ Available' : '❌ Missing');
  console.log('  • TextDecoder:', (globalThis as any).TextDecoder ? '✅ Available' : '❌ Missing');
  console.log('  • Buffer:', (globalThis as any).Buffer ? '✅ Available' : '❌ Missing');
  console.log('  • Performance:', (globalThis as any).performance ? '✅ Available' : '❌ Missing');
  console.log('🚀 Ready for LiveKit WebRTC operations');
}
