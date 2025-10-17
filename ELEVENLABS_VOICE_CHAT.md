# ElevenLabs Conversational AI Implementation

## Overview
This implementation adds ElevenLabs Conversational AI to the wine concierge app, allowing users to have voice conversations with an AI sommelier directly from the chat screen.

## Features
- 🎤 **Voice Chat Integration**: Click the microphone button on the LiveSession screen to start voice conversations
- 🤖 **AI Sommelier**: Intelligent wine expert powered by ElevenLabs Conversational AI
- 💬 **Conversation History**: All voice interactions are transcribed and saved alongside text chat
- 🔊 **Real-time Audio**: WebRTC-based real-time voice communication
- 📱 **Permission Handling**: Automatic microphone permission requests
- 🎯 **Auto-start**: Voice chat can be triggered automatically from other screens

## Implementation Details

### 🏗️ Architecture
```
App.tsx
├── ElevenLabsProvider (Context)
├── LiveSession.tsx
    ├── VoiceChat Component
    ├── useVoiceConversation Hook
    └── ElevenLabs Service Layer
```

### 📁 Files Modified/Created

#### Core Service Layer
- **`src/services/elevenlabs.ts`**: ElevenLabs API integration for agent management and conversation tokens
- **`src/hooks/useVoiceConversation.ts`**: React hook for managing voice conversation state and WebRTC connections

#### UI Components
- **`src/components/VoiceChat.tsx`**: Voice chat interface with controls and status display
- **`src/providers/ElevenLabsProvider.tsx`**: React context for ElevenLabs configuration

#### Screen Integration
- **`screens/LiveSession.tsx`**: Modified to include voice chat toggle and integration
- **`screens/Home.tsx`**: Added voice chat button to navigate to LiveSession with auto-start

#### Configuration
- **`babel.config.js`**: Updated to whitelist ELEVENLABS_API_KEY for react-native-dotenv
- **`types/env.d.ts`**: TypeScript declarations for environment variables

### 🔧 Configuration Required

#### 1. Environment Variables
Copy `.env.example` to `.env` and fill in your actual API keys:
```bash
cp .env.example .env
```

Then edit `.env` with your actual values:
```env
ELEVENLABS_API_KEY=sk_your_elevenlabs_api_key_here
```

**⚠️ Security Note**: The `.env` file is already in `.gitignore` to prevent accidental commits of sensitive data.

#### 2. Dependencies Installed
```bash
npm install @elevenlabs/react-native @livekit/react-native @livekit/react-native-webrtc
```

#### 3. iOS Permissions
Already configured in `ios/wine/Info.plist`:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs access to microphone for voice chat with AI sommelier</string>
```

### 🎯 Usage

#### From LiveSession Screen
1. Navigate to any chat/session screen
2. Click the microphone button in the top-right corner
3. Grant microphone permission when prompted
4. Start speaking - the AI will respond in real-time
5. Click the stop button to end the voice conversation
6. All conversation is automatically transcribed and saved

#### Auto-start from Home Screen
1. Click the "Voice Chat" button on the Home screen
2. Automatically navigates to LiveSession with voice chat enabled
3. Voice conversation starts immediately

### 🔊 Audio Flow
1. **Initialization**: Create ElevenLabs agent with wine sommelier persona
2. **Token Generation**: Generate conversation token for secure WebRTC connection
3. **WebRTC Setup**: Establish real-time audio connection via LiveKit
4. **Voice Processing**: 
   - User speech → ElevenLabs ASR (Automatic Speech Recognition)
   - AI Response → ElevenLabs TTS (Text-to-Speech)
   - Real-time audio streaming
5. **Transcription**: Save both user input and AI responses as text messages

### 🎨 AI Sommelier Persona
The AI is configured with a wine expert personality:
- **Name**: "Wine Concierge AI"
- **Expertise**: Wine recommendations, food pairings, tasting notes
- **Personality**: Friendly, knowledgeable, sophisticated but approachable
- **Language**: Natural, conversational wine expertise

### 🛠️ Technical Implementation

#### ElevenLabs Service (`src/services/elevenlabs.ts`)
```typescript
// Key functions:
- createAgent(): Creates wine sommelier AI agent
- createConversationToken(): Generates secure conversation tokens
- validateApiKey(): Validates ElevenLabs API configuration
```

#### Voice Conversation Hook (`src/hooks/useVoiceConversation.ts`)
```typescript
// State management:
- isConnected: WebRTC connection status
- isAgentSpeaking: AI speech status
- messages: Real-time message transcription
- startVoiceConversation(): Initiate voice chat
- endVoiceConversation(): End voice chat
```

#### Voice Chat Component (`src/components/VoiceChat.tsx`)
```typescript
// UI features:
- Connection status indicator
- Voice control buttons (start/stop)
- Real-time feedback
- Error handling and retry
```

### 🔍 Debugging

#### Common Issues
1. **"ELEVENLABS_API_KEY was not whitelisted"**
   - ✅ Fixed: Updated `babel.config.js` to include API key in whitelist
   
2. **Microphone permission denied**
   - Check iOS simulator settings or physical device permissions
   - Ensure Info.plist has NSMicrophoneUsageDescription
   
3. **WebRTC connection failed**
   - Verify ElevenLabs API key is valid
   - Check network connectivity
   - Review agent creation response

#### Debug Tools
```bash
# Restart Metro bundler with cache reset
npm start -- --reset-cache

# Run iOS with detailed logging
npx react-native run-ios --verbose

# Check Metro bundler logs
# Look for environment variable loading and compilation errors
```

### 🚀 Testing

#### Manual Testing Steps
1. ✅ **Build Success**: App builds without errors
2. ✅ **Environment Variables**: API key loads correctly
3. 🔲 **Voice Chat UI**: Microphone button appears on LiveSession
4. 🔲 **Permission Flow**: Microphone permission requested
5. 🔲 **Agent Creation**: ElevenLabs agent initializes
6. 🔲 **WebRTC Connection**: Audio connection establishes
7. 🔲 **Voice Interaction**: Speak and receive AI responses
8. 🔲 **Message Persistence**: Conversations saved to chat history

#### Test Voice Chat
1. Open the app in iOS simulator
2. Navigate to any chat screen (LiveSession)
3. Tap the microphone icon in the top-right
4. Grant microphone permission
5. Speak: "What wine pairs well with salmon?"
6. Verify AI responds with voice and text appears in chat

### 📋 Next Steps
1. Test voice chat functionality end-to-end
2. Verify conversation persistence works correctly
3. Test error handling (network issues, API failures)
4. Optimize audio quality settings
5. Add voice chat analytics/logging

### 🎉 Success Criteria
- ✅ Code compiles without errors
- ✅ Environment variables configured correctly  
- ✅ Dependencies installed successfully
- ✅ iOS permissions configured
- 🔲 Voice chat UI functional
- 🔲 Real-time conversation working
- 🔲 Message persistence operational

## Summary
The ElevenLabs Conversational AI has been successfully integrated into the wine concierge app. The implementation includes a complete service layer, React hooks, UI components, and proper configuration. The app is ready for testing the voice chat functionality.
