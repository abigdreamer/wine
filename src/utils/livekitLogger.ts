import { setLogLevel, LogLevel } from 'livekit-client';

/**
 * LiveKit Logging Utility for WebRTC Debugging
 * 
 * This utility enables comprehensive LiveKit logging to help debug
 * WebRTC connection issues, ICE candidate gathering, and peer connection states.
 * 
 * Note: Requires polyfills (TextEncoder/TextDecoder) to be loaded first.
 */
export class LiveKitLogger {
  private static isEnabled = false;
  
  /**
   * Enable LiveKit debug logging
   * @param level - Log level (debug, info, warn, error, silent)
   */
  static enable(level: LogLevel = LogLevel.debug) {
    if (this.isEnabled) return;
    
    // Check if required polyfills are available
    const hasTextEncoder = typeof (globalThis as any).TextEncoder !== 'undefined';
    const hasTextDecoder = typeof (globalThis as any).TextDecoder !== 'undefined';
    
    if (!hasTextEncoder || !hasTextDecoder) {
      console.warn('⚠️ LiveKit logging may fail - TextEncoder/TextDecoder polyfills not detected');
      console.warn('  • TextEncoder:', hasTextEncoder ? '✅' : '❌');
      console.warn('  • TextDecoder:', hasTextDecoder ? '✅' : '❌');
      console.warn('  • Make sure polyfills are loaded before enabling LiveKit logging');
    }
    
    try {
      console.log('🔧 Enabling LiveKit debug logging...');
      setLogLevel(level);
      this.isEnabled = true;
      
      // Log current configuration
      console.log('📦 LiveKit Debug Configuration:');
      console.log(`  • Log Level: ${LogLevel[level]}`);
      console.log(`  • Environment: ${__DEV__ ? 'Development' : 'Production'}`);
      console.log(`  • Platform: ${require('react-native').Platform.OS}`);
      console.log(`  • Polyfills: ${hasTextEncoder && hasTextDecoder ? '✅ Ready' : '⚠️ Missing'}`);
      
      // Log what to expect in the logs
      console.log('🔍 Expected Log Categories:');
      console.log('  • [livekit] Room connection events');
      console.log('  • [livekit] ICE candidate gathering');
      console.log('  • [livekit] STUN/TURN server connectivity');
      console.log('  • [livekit] Peer connection state changes');
      console.log('  • [livekit] Media track events');
      console.log('  • [livekit] WebRTC errors and warnings');
      
      try {
        const livekitVersion = require('livekit-client/package.json').version;
        console.log(`  • LiveKit Client Version: ${livekitVersion}`);
      } catch {
        console.log('  • LiveKit Client Version: Unknown');
      }
    } catch (error) {
      console.error('❌ Failed to enable LiveKit logging:', error);
      console.error('This may be due to missing polyfills or LiveKit initialization issues');
    }
  }
  
  /**
   * Disable LiveKit logging
   */
  static disable() {
    console.log('🔇 Disabling LiveKit debug logging...');
    setLogLevel(LogLevel.silent);
    this.isEnabled = false;
  }
  
  /**
   * Get current logging status
   */
  static get status() {
    return {
      enabled: this.isEnabled,
      level: this.isEnabled ? 'debug' : 'silent'
    };
  }
  
  /**
   * Log WebRTC connection attempt with context
   */
  static logConnectionAttempt(context: {
    agentId?: string;
    userId?: string;
    platform?: string;
    timestamp?: string;
  }) {
    console.log('🚀 Starting WebRTC connection attempt...');
    console.log('📋 Connection Context:', {
      agentId: context.agentId || 'Unknown',
      userId: context.userId || 'Anonymous',
      platform: context.platform || require('react-native').Platform.OS,
      timestamp: context.timestamp || new Date().toISOString(),
      livekitLogging: this.isEnabled ? 'Enabled' : 'Disabled'
    });
    
    if (this.isEnabled) {
      console.log('🔍 Watch for LiveKit logs prefixed with [livekit] for detailed WebRTC debugging');
    } else {
      console.log('⚠️ LiveKit logging disabled - enable for detailed WebRTC debugging');
    }
  }
  
  /**
   * Log WebRTC error with additional context
   */
  static logWebRTCError(error: any, additionalContext?: Record<string, any>) {
    console.error('❌ WebRTC Error Detected:');
    console.error('🔍 Error Details:', {
      name: error?.name || 'Unknown',
      message: error?.message || String(error),
      code: error?.code || 'No code',
      stack: error?.stack || 'No stack trace',
      timestamp: new Date().toISOString(),
      livekitLogging: this.isEnabled ? 'Enabled' : 'Disabled',
      ...additionalContext
    });
    
    // Provide guidance based on error type
    const errorMessage = error?.message || String(error);
    
    if (errorMessage.includes('pc connection') || errorMessage.includes('could not establish pc connection')) {
      console.error('🌐 WebRTC Peer Connection Error - SPECIFIC ANALYSIS:');
      console.error('  • Error Type: Peer Connection Establishment Failure');
      console.error('  • Common Cause: ICE candidate gathering blocked by network');
      console.error('  • Network Issue: STUN/TURN servers unreachable');
      console.error('  • Solution Priority: 1. Mobile hotspot, 2. Different network, 3. VPN disable');
      console.error('  • Corporate Networks: Contact IT for WebRTC whitelist');
      
      if (this.isEnabled) {
        console.error('🔍 Check LiveKit logs above for ICE candidate details');
        console.error('🔍 Look for: [livekit] ICE gathering state, candidate types, connection states');
      } else {
        console.error('💡 Enable LiveKit logging for detailed ICE debugging');
      }
      
      console.error('📊 Quick Network Test Results:');
      console.error(`  • Platform: ${additionalContext?.platform || 'Unknown'}`);
      console.error(`  • Agent ID: ${additionalContext?.agentId || 'Unknown'}`);
      console.error(`  • Connection Status: ${additionalContext?.conversationStatus || 'Unknown'}`);
      
    } else if (errorMessage.includes('ConnectionError')) {
      console.error('🌐 WebRTC Connection Error - General:');
      console.error('  • This is typically a network-level restriction');
      console.error('  • Try switching networks or disabling VPN');
      console.error('  • Corporate/school networks often block WebRTC');
      
      if (this.isEnabled) {
        console.error('🔍 Check LiveKit logs above for connection attempt details');
      }
    }
    
    // Additional troubleshooting suggestions
    console.error('🔧 Immediate Troubleshooting Steps:');
    console.error('  1. Try mobile hotspot (most effective for corporate networks)');
    console.error('  2. Switch between WiFi and cellular');
    console.error('  3. Disable VPN temporarily');
    console.error('  4. Try from different physical location');
    console.error('  5. Contact network administrator about WebRTC support');
  }
  
  /**
   * Log successful connection with performance metrics
   */
  static logConnectionSuccess(metrics?: {
    connectionTime?: number;
    iceGatheringTime?: number;
    candidateCount?: number;
  }) {
    console.log('✅ WebRTC Connection Successful!');
    
    if (metrics) {
      console.log('📊 Connection Metrics:', {
        connectionTime: metrics.connectionTime ? `${metrics.connectionTime}ms` : 'Unknown',
        iceGatheringTime: metrics.iceGatheringTime ? `${metrics.iceGatheringTime}ms` : 'Unknown',
        candidateCount: metrics.candidateCount || 'Unknown',
        timestamp: new Date().toISOString()
      });
    }
    
    if (this.isEnabled) {
      console.log('🔍 Check LiveKit logs for detailed connection establishment process');
    }
  }
}

/**
 * Auto-enable LiveKit logging in development mode
 * This is done after polyfills are loaded
 */
if (__DEV__) {
  // Add a small delay to ensure polyfills are loaded first
  setTimeout(() => {
    LiveKitLogger.enable();
  }, 100);
}

export default LiveKitLogger;
