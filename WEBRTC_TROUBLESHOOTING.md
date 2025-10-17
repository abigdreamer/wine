# ElevenLabs WebRTC Connection Troubleshooting Guide

## "Could not establish pc connection" Error Solutions

### Issue Description
This error indicates that the WebRTC (Web Real-Time Communication) peer connection to ElevenLabs servers is failing. This can happen even on physical devices due to various factors.

### Immediate Solutions to Try

#### 1. **Network-Related Fixes**
```bash
# On your physical device, try these:
```
- **Switch networks**: Try switching between WiFi and cellular data
- **Disable VPN**: If you're using a VPN, disable it temporarily
- **Check corporate firewall**: If on enterprise WiFi, WebRTC might be blocked
- **Router settings**: Some routers block WebRTC traffic
- **Try different location**: Test from a different network/location

#### 2. **App-Level Solutions**
- **Force close and restart** the app completely
- **Clear app cache** (on Android: Settings > Apps > Wine > Storage > Clear Cache)
- **Restart device** to clear any network state issues
- **Update the app** if there are pending updates

#### 3. **ElevenLabs Account Issues**
- **Check your ElevenLabs subscription**: Voice chat requires an active subscription
- **Verify API key permissions**: Ensure your key has conversational AI access
- **Check usage limits**: You might have hit your monthly limit
- **Account status**: Verify your ElevenLabs account is in good standing

#### 4. **Device-Specific Solutions**

**For iOS:**
- Go to Settings > Privacy & Security > Microphone > Enable for Wine app
- Settings > General > iPhone Storage > Wine > Offload App > Reinstall
- Disable Low Power Mode if enabled

**For Android:**
- Settings > Apps > Wine > Permissions > Allow Microphone
- Settings > Apps > Wine > Clear Data (will reset app)
- Check if Battery Optimization is affecting the app

### Technical Solutions (Developer Level)

#### 1. **Update ElevenLabs SDK**
```bash
npm update @elevenlabs/react-native
```

#### 2. **Alternative Connection Strategy**
Add this to your app for debugging:

```typescript
// Add network state checking
import NetInfo from '@react-native-community/netinfo';

const checkNetworkState = async () => {
  const state = await NetInfo.fetch();
  console.log('Network state:', state);
  return state.isConnected && state.isInternetReachable;
};
```

#### 3. **WebRTC Configuration**
Try adding ICE servers configuration:

```typescript
// In your ElevenLabs connection config
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];
```

### Fallback Options

#### 1. **Text-Only Mode**
Continue using the app in text-only mode while voice issues are resolved.

#### 2. **Alternative Voice Services**
Consider implementing Azure Speech Services or Google Speech-to-Text as a backup.

#### 3. **Native Recording**
Implement local recording with manual upload if real-time doesn't work.

### Testing on Different Environments

1. **Home WiFi**: Test on your home network
2. **Mobile Data**: Switch to cellular and test
3. **Public WiFi**: Try from a coffee shop or library
4. **Different Device**: Test on another iPhone/Android device

### ElevenLabs Service Status
- Check [ElevenLabs Status Page](https://status.elevenlabs.io)
- Monitor their Discord/Twitter for service announcements
- Test with their web interface to confirm service availability

### Debug Information to Collect

When reporting the issue, include:
```
Device: iPhone [model] iOS [version]
Network: [WiFi/Cellular] [ISP]
Location: [Country/Region]
ElevenLabs Plan: [Free/Starter/Creator/etc]
Error Time: [timestamp]
Console Logs: [from React Native debugger]
```

### Contact Support

If all solutions fail:
1. **ElevenLabs Support**: Contact them directly about WebRTC connection issues
2. **GitHub Issues**: Check react-native-webrtc issues on GitHub
3. **Stack Overflow**: Search for similar WebRTC connection problems

### Success Indicators

Connection should work when:
- ✅ ElevenLabs API key is valid and has credits
- ✅ Network allows WebRTC traffic (ports 3478, 19302)
- ✅ Device has microphone permissions
- ✅ No VPN or firewall blocking connections
- ✅ ElevenLabs service is operational

The issue is typically network-related rather than code-related, so focus on network troubleshooting first.
