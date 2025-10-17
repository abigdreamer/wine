# ElevenLabs Voice Chat Testing Checklist

## 🧪 Pre-Testing Setup

### 1. Environment Configuration
- [ ] Add your ElevenLabs API key to `.env`:
  ```
  ELEVENLABS_API_KEY=your_actual_api_key_here
  ```
- [ ] Restart the React Native bundler after adding API key
- [ ] Ensure you have ElevenLabs credits in your account

### 2. Device Permissions
- [ ] **iOS**: Microphone permission will be requested automatically
- [ ] **Android**: Grant microphone permission when prompted
- [ ] Test on both iOS and Android if possible

## 🎯 Testing Scenarios

### Scenario 1: Home Screen Voice Chat Quick Action
1. [ ] Open the app
2. [ ] Navigate to Home screen
3. [ ] Locate "Voice Chat" quick action (green microphone icon)
4. [ ] Tap "Voice Chat" 
5. [ ] **Expected**: Navigate to LiveSession with voice chat panel visible
6. [ ] **Expected**: Shows "Setting up voice chat..." initially

### Scenario 2: Manual Voice Chat in LiveSession
1. [ ] Navigate to any LiveSession (existing or new)
2. [ ] Look for microphone button in header (next to TTS toggle)
3. [ ] Tap the microphone button
4. [ ] **Expected**: Voice chat panel slides in below header
5. [ ] **Expected**: Shows initialization status

### Scenario 3: Starting Voice Conversation
1. [ ] In voice chat panel, wait for "Start Voice Chat" button
2. [ ] Tap "Start Voice Chat"
3. [ ] **Expected**: Permission request for microphone (first time)
4. [ ] **Expected**: Button changes to "Connecting..."
5. [ ] **Expected**: Status shows "Connecting..." then "Connected"
6. [ ] **Expected**: Shows microphone and volume controls

### Scenario 4: Voice Conversation
1. [ ] With voice chat connected, speak a question:
   - "Hello, tell me about your wine tours"
   - "What tastings do you offer?"
   - "I'd like to book a visit"
2. [ ] **Expected**: Status shows "Listening..." while you speak
3. [ ] **Expected**: Your speech appears as text message
4. [ ] **Expected**: AI responds with voice and text
5. [ ] **Expected**: Status shows "AI Speaking..." during response

### Scenario 5: Voice Controls
1. [ ] Test microphone mute/unmute button
2. [ ] **Expected**: Microphone icon changes between Mic/MicOff
3. [ ] **Expected**: Muted state prevents voice input
4. [ ] Test volume control button (future enhancement)
5. [ ] Test end conversation button (red phone icon)
6. [ ] **Expected**: Ends voice session, returns to text-only mode

### Scenario 6: Mixed Conversation
1. [ ] Start voice conversation
2. [ ] Ask a question using voice
3. [ ] Type a follow-up question using text input
4. [ ] **Expected**: Both voice and text messages appear in conversation
5. [ ] **Expected**: AI responds appropriately to both input types

### Scenario 7: Conversation History
1. [ ] Complete a voice conversation
2. [ ] Navigate to History screen
3. [ ] **Expected**: Voice conversation appears in history
4. [ ] **Expected**: Shows both voice and text messages
5. [ ] Return to same LiveSession
6. [ ] **Expected**: Previous conversation is restored

### Scenario 8: Error Handling
1. [ ] Test with invalid/missing API key
2. [ ] **Expected**: Shows setup error message
3. [ ] Test with no internet connection
4. [ ] **Expected**: Shows connection error
5. [ ] Test denying microphone permission
6. [ ] **Expected**: Shows permission error message

## 🔍 What to Look For

### ✅ Success Indicators:
- [ ] Voice chat panel appears when requested
- [ ] Status updates show connection progress
- [ ] Spoken words convert to text messages
- [ ] AI responds with both voice and text
- [ ] Controls work (mute, end conversation)
- [ ] Messages save to conversation history
- [ ] No crashes or error screens

### ❌ Potential Issues:
- [ ] "Setup Error" - Check API key configuration
- [ ] "Permission Denied" - Grant microphone access
- [ ] "Connection Error" - Check internet/ElevenLabs service
- [ ] No voice response - Check device volume
- [ ] Crashes - Check React Native logs

## 🐛 Debugging

### Console Logs to Monitor:
```
// Look for these in React Native logs:
"ElevenLabs conversation connected"
"Voice chat connected"
"Created new agent: Wine Concierge AI"
"Using existing agent: [agent name]"
```

### Common Error Messages:
- `API key invalid` → Check `.env` file
- `Agent not found` → Will auto-create on first run
- `WebRTC connection failed` → Check network/permissions
- `Microphone permission denied` → Grant in device settings

### Log Commands:
```bash
# iOS
npx react-native log-ios

# Android  
npx react-native log-android
```

## 📊 Success Metrics

### Basic Functionality:
- [ ] Voice chat starts successfully
- [ ] Speech-to-text works accurately
- [ ] AI responses are relevant and voice-enabled
- [ ] Conversation flow feels natural
- [ ] No major crashes or errors

### User Experience:
- [ ] Easy to find and start voice chat
- [ ] Clear visual feedback on status
- [ ] Intuitive controls
- [ ] Good audio quality
- [ ] Reasonable response times

### Integration:
- [ ] Works alongside existing text chat
- [ ] Conversation history saves properly
- [ ] User configuration respected (personality, language)
- [ ] Navigation flow makes sense

## 🚀 Performance Notes

### Expected Response Times:
- **Connection**: 2-5 seconds
- **Speech Recognition**: Near real-time
- **AI Response**: 3-7 seconds
- **Voice Synthesis**: 1-2 seconds

### Resource Usage:
- **Data**: Moderate (voice streaming)
- **Battery**: Higher during voice sessions
- **Memory**: Stable with proper cleanup

## 🎉 Ready to Test!

1. **Start with Home screen Voice Chat** - Easiest entry point
2. **Test basic conversation flow** - Speak a simple question
3. **Try different topics** - Wine tours, tastings, reservations
4. **Test error scenarios** - Helps ensure robustness
5. **Check conversation history** - Verify data persistence

**Happy Testing!** Your wine concierge app now has premium voice AI capabilities! 🍷🎤
