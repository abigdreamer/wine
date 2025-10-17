# WebRTC ICE Server Troubleshooting Guide

## Overview

The "could not establish pc connection" error in ElevenLabs voice chat is primarily caused by **ICE (Interactive Connectivity Establishment) server connectivity issues**. This document explains the problem and provides solutions.

## What are ICE/STUN/TURN Servers?

### STUN Servers
- **Purpose**: Help devices discover their public IP address
- **Ports**: Typically UDP 19302, 3478
- **Function**: Enable direct peer-to-peer connections
- **Examples**: `stun:stun.l.google.com:19302`

### TURN Servers
- **Purpose**: Relay traffic when direct connections fail
- **Usage**: Fallback when STUN fails
- **Cost**: More expensive due to bandwidth usage
- **Authentication**: Usually requires credentials

### ICE Protocol
- **Function**: Coordinates STUN/TURN to establish connections
- **Process**: Candidate gathering → connectivity checks → best path selection

## Common Network Restrictions

### Corporate Networks
```
❌ Block UDP ports 19302, 3478
❌ Restrict peer-to-peer protocols
❌ Deep packet inspection blocks WebRTC
❌ Firewall rules prevent ICE candidate gathering
```

### School Networks
```
❌ Similar restrictions to corporate
❌ Often block gaming/streaming protocols
❌ Limited outbound UDP connections
```

### VPN Services
```
❌ Interfere with ICE server discovery
❌ Change routing paths
❌ Block direct peer connections
❌ NAT traversal complications
```

### Mobile Carriers
```
❌ Some carriers block WebRTC
❌ Aggressive NAT configurations
❌ Limited UDP hole punching
```

## ElevenLabs ICE Server Configuration

### Automatic Configuration
ElevenLabs Conversational AI uses **LiveKit** which automatically provisions:
- STUN servers for NAT traversal
- TURN servers for restrictive networks
- Optimal ICE candidate gathering

### Current Limitations
The ElevenLabs React Native SDK doesn't expose direct ICE server configuration options:

```typescript
// ❌ Not supported in current SDK
await conversation.startSession({
  agentId,
  overrides: {
    rtcConfig: {
      iceServers: [/* custom servers */]
    }
  }
});
```

## Troubleshooting Steps

### 1. Network Diagnostics
Run the built-in troubleshooting function:
```typescript
// In VoiceChat component
<TouchableOpacity onPress={troubleshootConnection}>
  <Text>🔍 Troubleshoot Connection</Text>
</TouchableOpacity>
```

### 2. STUN Server Testing
The troubleshoot function tests connectivity to:
- `stun:stun.l.google.com:19302`
- `stun:stun.cloudflare.com:3478`
- `stun:stun.ekiga.net`

### 3. Network Switching
Try different networks in order:
1. **Mobile hotspot** (bypasses corporate firewalls)
2. **Home WiFi** (usually less restrictive)
3. **Different cellular carrier**
4. **Public WiFi** (varies by location)

### 4. VPN Testing
- Disable VPN temporarily
- Try different VPN servers
- Use VPN providers that support WebRTC

## Solutions by Network Type

### Corporate/Enterprise Networks
```bash
# Contact IT department with this request:
"Please whitelist WebRTC protocols and STUN servers:
- UDP ports 19302, 3478
- Domains: *.elevenlabs.io, *.livekit.cloud
- Protocol: WebRTC/ICE for business communication"
```

### Home Networks
```bash
# Router configuration:
- Enable UPnP (Universal Plug and Play)
- Open UDP ports 19302, 3478
- Disable SIP ALG if present
- Update router firmware
```

### Mobile Networks
```bash
# Carrier-specific solutions:
- Try airplane mode → cellular only
- Test different APN settings
- Contact carrier about WebRTC support
- Try different physical location
```

## Advanced Configuration (Future)

### Custom TURN Servers
For enterprise deployments, you might need custom TURN servers:

```typescript
// Future SDK enhancement (not currently supported)
const customICEServers = [
  { urls: 'stun:stun.company.com:3478' },
  { 
    urls: 'turn:turn.company.com:3478',
    username: 'username',
    credential: 'password'
  }
];
```

### LiveKit Integration
Since ElevenLabs uses LiveKit, you could potentially:
1. Set up custom LiveKit server
2. Configure ICE servers at LiveKit level
3. Point ElevenLabs to custom LiveKit instance

## Monitoring and Debugging

### Console Logging
The app includes comprehensive WebRTC logging:
```javascript
console.log('🌐 WebRTC connection attempt');
console.log('📡 ICE candidate gathering');
console.log('🔗 Peer connection established');
```

### Network Quality Indicators
- **Latency testing**: HTTP request timing
- **STUN reachability**: Multiple server testing
- **API connectivity**: ElevenLabs endpoint checks

## Known Issues and Workarounds

### Issue: All STUN servers unreachable
**Cause**: Corporate firewall blocking UDP
**Solution**: Use mobile hotspot or contact IT

### Issue: Intermittent connections
**Cause**: Unstable network or aggressive NAT
**Solution**: Switch to more stable network

### Issue: VPN interference
**Cause**: VPN blocking peer-to-peer connections
**Solution**: Disable VPN or use WebRTC-friendly VPN

## Testing Matrix

| Network Type | STUN Access | WebRTC Success | Recommended Action |
|--------------|-------------|----------------|-------------------|
| Home WiFi | ✅ | ✅ | Use normally |
| Corporate WiFi | ❌ | ❌ | Contact IT or use mobile |
| Mobile Hotspot | ✅ | ✅ | Primary fallback |
| School Network | ❌ | ❌ | Use mobile data |
| Public WiFi | ⚠️ | ⚠️ | Test case by case |
| VPN Active | ❌ | ❌ | Disable VPN |

## Alternative Solutions

### Text-Only Mode
When WebRTC fails completely:
```typescript
// Fallback to text-based conversation
import { useTextConversation } from '@elevenlabs/react-native';
```

### Different Voice AI Providers
- OpenAI Realtime API (different WebRTC implementation)
- Azure Cognitive Services (may use different ICE config)
- Google Cloud Speech (different network requirements)

## Conclusion

ICE server connectivity is the primary blocker for ElevenLabs voice chat. While the SDK doesn't currently expose ICE configuration, the built-in troubleshooting helps identify network-level issues. Most connection problems can be resolved by switching networks or working with IT departments to whitelist WebRTC protocols.

The app's comprehensive diagnostics help users understand whether the issue is:
1. **Network restrictions** (most common)
2. **API connectivity** (less common)
3. **Device limitations** (iOS simulator)
4. **Service outages** (rare)

This is **not a bug in the application** - it's a fundamental limitation of WebRTC in restricted network environments.
