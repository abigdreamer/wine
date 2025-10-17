# ElevenLabs Conversational AI Setup Guide

This guide will help you set up ElevenLabs Conversational AI in your Wine Concierge app.

## 1. Get ElevenLabs API Key

1. Go to [ElevenLabs.io](https://elevenlabs.io)
2. Sign up for an account or log in
3. Navigate to your profile settings
4. Generate an API key
5. Copy the API key (it should start with `sk-` or similar)

## 2. Configure Environment Variables

Update your `.env` file with your ElevenLabs API key:

```env
ELEVENLABS_API_KEY=your_actual_elevenlabs_api_key_here
```

Replace `your_actual_elevenlabs_api_key_here` with your real API key.

## 3. Create an Agent (Optional)

The app will automatically create a Wine Concierge agent for you, but you can also create one manually:

1. Go to [ElevenLabs Agents Platform](https://elevenlabs.io/app/agents)
2. Click "Create Agent"
3. Configure the agent with:
   - **Name**: Wine Concierge AI
   - **Voice**: Choose a suitable voice (Rachel is recommended)
   - **Language**: English (or your preferred language)
   - **System Prompt**: Use the prompt for wine concierge assistance

## 4. How to Use Voice Chat

1. **Open the App**: Navigate to any chat session in the Live Session screen
2. **Enable Voice Chat**: Tap the microphone button in the header
3. **Start Conversation**: Tap "Start Voice Chat" to begin
4. **Talk Naturally**: Speak your questions about wine, tours, tastings, etc.
5. **Listen to Responses**: The AI will respond with voice and you'll see the conversation
6. **End Session**: Tap the red phone button to end the voice conversation

## 5. Features

### Voice Conversation
- **Real-time speech-to-text**: Your voice is converted to text automatically
- **AI-powered responses**: The AI understands wine-related queries
- **Text-to-speech**: AI responses are spoken back to you
- **Mixed mode**: You can switch between voice and text in the same conversation

### Conversation History
- All voice conversations are saved locally
- Messages appear in the chat interface
- History is tied to your user account
- Conversations sync with the existing question store

### Permissions
- **iOS**: Microphone permission is automatically requested
- **Android**: Microphone and audio permissions are configured

## 6. Troubleshooting

### "Setup Error" or "API Key Invalid"
- Verify your ElevenLabs API key is correct in the `.env` file
- Make sure you have credits in your ElevenLabs account
- Check that your API key has the necessary permissions

### "Connection Error"
- Check your internet connection
- Verify ElevenLabs service status
- Try restarting the app

### "Microphone Permission Denied"
- Go to device Settings > Privacy > Microphone
- Enable microphone access for the Wine app
- Restart the app and try again

### No Voice Response
- Check your device volume settings
- Ensure the TTS toggle is enabled
- Try switching the voice in ElevenLabs dashboard

## 7. Customization

### Voice Selection
You can change the AI voice by:
1. Modifying the `voice_id` in `elevenlabs.ts`
2. Using different ElevenLabs voices
3. Creating custom voices in ElevenLabs dashboard

### Agent Personality
Customize the agent's personality by:
1. Updating the system prompt in the `generateSystemPrompt()` function
2. Modifying the agent configuration in ElevenLabs dashboard
3. Adjusting response styles and tone

### Language Support
To add different languages:
1. Set the language in user configuration
2. Update the agent language settings
3. Modify system prompts for different languages

## 8. Pricing & Limits

- ElevenLabs offers a free tier with limited usage
- Voice conversations consume credits based on:
  - Speech-to-text processing
  - AI response generation
  - Text-to-speech synthesis
- Monitor your usage in the ElevenLabs dashboard

## 9. Development Notes

### File Structure
```
src/
├── services/
│   └── elevenlabs.ts          # ElevenLabs API service
├── hooks/
│   └── useVoiceConversation.ts # Voice conversation hook
├── components/
│   └── VoiceChat.tsx          # Voice chat UI component
├── contexts/
│   └── ElevenLabsProvider.tsx # React context provider
└── utils/
    └── conversationHistory.ts # History management
```

### Key Functions
- `startVoiceConversation()`: Initiates voice chat
- `endVoiceConversation()`: Ends voice session
- `handleVoiceChatMessage()`: Processes voice messages
- `generateSystemPrompt()`: Creates AI personality prompt

### Integration Points
- Integrates with existing `LiveSession.tsx` screen
- Uses the same `Message` type as text chat
- Saves to the existing question store
- Respects user configuration (personality, language, etc.)

## 10. Next Steps

1. **Test the Implementation**: Try the voice chat feature
2. **Customize Prompts**: Adjust the AI personality for your winery
3. **Monitor Usage**: Keep track of ElevenLabs credit consumption
4. **User Feedback**: Collect feedback to improve the experience
5. **Analytics**: Use conversation history for insights

## Support

If you encounter issues:
1. Check the React Native logs for error messages
2. Verify ElevenLabs API responses in network logs
3. Test with different devices and network conditions
4. Consult ElevenLabs documentation for API updates

The voice chat feature is now fully integrated and ready to provide an enhanced conversational experience for your wine concierge app!
