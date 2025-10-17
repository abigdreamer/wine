import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Platform } from 'react-native';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Loader
} from 'lucide-react-native';

import { useTheme } from '../../theme/theme-context';
import { useConversation } from '@elevenlabs/react-native';
import ElevenLabsService from '../services/elevenlabs';
import ConversationHistoryManager, { ConversationSession } from '../utils/conversationHistory';
import { Message } from '../../types/message';
import LiveKitLogger from '../utils/livekitLogger';
import RNFS from 'react-native-fs';
import { useAuth } from '../../store/auth-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ELEVENLABS_API_KEY } from '@env';

// Detect iOS Simulator for WebRTC warnings
const isSimulatorLikely = Platform.OS === 'ios' && __DEV__;

// LiveKit debug logging is automatically enabled by the LiveKitLogger utility

interface VoiceChatProps {
  onMessage?: (message: Message) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  userId?: string;
  systemPrompt?: string;
  isVisible?: boolean;
}

const VoiceChat: React.FC<VoiceChatProps> = ({
  userId,
  systemPrompt,
  isVisible = true,
}) => {
  const { colors } = useTheme();
  const [agentId, setAgentId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const currentSessionRef = useRef<ConversationSession | null>(null);
  const { user } = useAuth();

  // ElevenLabs conversation hook with WebRTC error handling
  // Note: ICE servers (STUN/TURN) are automatically configured by ElevenLabs/LiveKit
  // If connections fail, it's usually due to network firewalls blocking:
  // - UDP ports 19302, 3478 (STUN servers)
  // - Peer-to-peer WebRTC protocols
  // - Corporate/school network restrictions
  // LiveKit debug logs are enabled in development mode for troubleshooting
  // const ELEVEN_LABS_API_KEY = 'sk_2a4d0ced51eaf5441a5f968bf52718b77320f2b52ebbb3f9';
  const AGENT_ID = "agent_5701k76hf92dfv6s7hjkhnqwdzfd";


  const getUserStorageKey = (baseKey: string): string => {
    return user?.id ? `${baseKey}_${user.id}` : baseKey;
  };
  const fileContentKey = getUserStorageKey('userUploadedFileContent');

  async function getFileContent() {
    const content = await AsyncStorage.getItem(fileContentKey);
    setFileContent(content);
  }

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to conversation');
    },
    onDisconnect: () => {
      console.log('Disconnected from conversation');
    },
    onMessage: (message) => {
      console.log('Message received:', message);
    },
    onError: (error) => {
      console.error('Conversation error:', error);
    },
  });

  // Initialize or get existing agent
  useEffect(() => {
    const initializeAgent = async () => {
      if (agentId) return; // Already have an agent

      setIsInitializing(true);
      try {
        // Initialize ElevenLabs service
        console.log('=== Voice Chat Initialization ===');

        // Add a small delay to ensure environment variables are loaded
        await new Promise<void>(resolve => setTimeout(resolve, 100));

        // First, check if API key is valid
        console.log('Validating ElevenLabs API key...');
        const isValid = await ElevenLabsService.validateApiKey();
        console.log('API key validation result:', isValid);

        if (!isValid) {
          console.error('ElevenLabs API key validation failed');
          Alert.alert(
            'ElevenLabs API Key Invalid',
            'API key validation failed. Please verify your ElevenLabs API key is correct and has proper permissions.',
            [{ text: 'OK' }]
          );
          return;
        }
        console.log('✅ ElevenLabs API key validated successfully');

        // Try to get existing agents first
        console.log('Fetching existing agents...');
        const agents = await ElevenLabsService.listAgents();
        console.log('Agents fetched successfully:', agents, 'agents found');

        // Look for an existing wine concierge agent
        const existingAgent = agents.find(agent =>
          agent.name.toLowerCase().includes('wine') ||
          agent.name.toLowerCase().includes('concierge')
        );

        if (existingAgent) {
          console.log('✅ Using existing agent:', existingAgent.name, 'ID:', existingAgent.agent_id);
          setAgentId(existingAgent.agent_id);
          return;
        }

        // Create new agent if none exists
        console.log('No existing wine agent found, creating new agent...');
        const newAgent = await ElevenLabsService.createAgent({
          name: 'Wine Concierge AI',
          prompt: systemPrompt || `
            You are a friendly and knowledgeable wine concierge AI assistant. 
            You help guests at a winery with information about:
            - Wine tastings and tour schedules
            - Wine selections and recommendations
            - Food pairing suggestions
            - Booking and reservation information
            - General winery information
            
            Keep your responses conversational, helpful, and concise. 
            Always maintain a warm, professional tone that reflects excellent hospitality.
          `,
          first_message: 'Hello! Welcome to our winery. How can I assist you today?',
          voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
          language: 'en',
        });

        console.log('✅ Created new agent successfully:', newAgent.name, 'with ID:', newAgent.agent_id);
        setAgentId(newAgent.agent_id);
      } catch (error) {
        console.error('=== Voice Chat Initialization Error ===');
        console.error('Full error object:', error);
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

        // Check if it's an API key issue
        const errorMessage = error instanceof Error ? error.message : String(error);
        let userMessage = 'Failed to initialize voice chat. Please check your ElevenLabs API key and try again.';
        let alertTitle = 'Voice Chat Setup Error';

        if (errorMessage.includes('API key') || errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
          userMessage = 'Invalid ElevenLabs API key. Please check your .env file and ensure the API key is correct.';
          alertTitle = 'API Key Error';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          userMessage = 'Network error. Please check your internet connection and try again.';
          alertTitle = 'Network Error';
        } else if (errorMessage.includes('405')) {
          userMessage = 'ElevenLabs API endpoint error (405). The API may have changed. Please check the documentation.';
          alertTitle = 'API Endpoint Error';
        } else if (errorMessage.includes('403')) {
          userMessage = 'Access forbidden (403). Your API key may not have the required permissions for conversational AI.';
          alertTitle = 'Permission Error';
        } else if (errorMessage.includes('422')) {
          userMessage = 'Invalid request format (422). The agent configuration may be incorrect.';
          alertTitle = 'Configuration Error';
        }

        // Add the actual error message for debugging
        userMessage += `\n\nTechnical details: ${errorMessage}`;

        Alert.alert(
          alertTitle,
          userMessage,
          [{ text: 'OK' }]
        );
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAgent();
  }, [agentId, systemPrompt]);

  const handleStartVoiceChat = async (retryCount = 0) => {
    if (!agentId) {
      Alert.alert(
        'Not Ready',
        'Voice chat is still initializing. Please wait a moment.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      console.log(`🎤 Starting voice chat attempt ${retryCount + 1}/3`);
      console.log('📱 Device info:', {
        platform: Platform.OS,
        isDev: __DEV__,
        isSimulator: isSimulatorLikely,
        agentId: agentId
      });

      // Add network connectivity check
      console.log('🌐 Checking network connectivity...');

      // Test ElevenLabs API connectivity
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const connectivityTest = await fetch('https://api.elevenlabs.io/v1/user', {
          method: 'GET',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        console.log('🌐 ElevenLabs API reachable:', connectivityTest);
      } catch (connectivityError) {
        console.warn('⚠️ ElevenLabs API connectivity issue:', connectivityError);
      }

      console.log('🌐 Configuring WebRTC with custom ICE servers for firewall compatibility...');
      console.log('🔧 LiveKit debug logging enabled - check console for detailed WebRTC logs');

      // Log connection attempt with LiveKit logger
      LiveKitLogger.logConnectionAttempt({
        agentId,
        userId,
        platform: Platform.OS,
        timestamp: new Date().toISOString()
      });

      console.log('� Initiating conversation session with agent ID:', agentId);
      console.log("Converstation Status: ", conversation);
      // const conversationToken = ConversationHistoryManager.createConversationSession(
      //   agentId,
      //   'voice',
      //   userId
      // );

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${AGENT_ID}`,
        {
          headers: {
            // Requesting a conversation token requires your ElevenLabs API key
            // Do NOT expose your API key to the client!
            'xi-api-key': ELEVENLABS_API_KEY,
          }
        }
      );

      const conversationToken = await response.json();
      console.log('✅ Received conversation token:', conversationToken.token);

      currentSessionRef.current = conversationToken.token;
      ConversationHistoryManager.saveConversation(conversationToken.token);
      console.log('✅ Conversation session created and saved locally', fileContent);
      const conversation_response = await conversation.startSession({
        conversationToken: conversationToken.token,
        agentId: AGENT_ID,
        userId: userId,
        dynamicVariables: {
          system_prompt: fileContent || ""
        }
      });

      console.log('✅ Voice chat session started successfully:', conversation_response);
    } catch (error) {
      console.error('Error starting voice chat:', error);
      console.error('Error details:', {
        name: (error as any)?.name || 'Unknown',
        message: (error as any)?.message || String(error),
        stack: (error as any)?.stack || 'No stack trace',
        cause: (error as any)?.cause || 'No cause',
        type: typeof error,
      });

      const errorMessage = String(error);
      const maxRetries = 2;

      // Check if this is a retryable error
      const isRetryable = errorMessage.includes('timeout') ||
        errorMessage.includes('network') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('TIMEOUT') ||
        errorMessage.includes('NETWORK_ERROR');

      if (isRetryable && retryCount < maxRetries) {
        console.log(`🔄 Retrying voice chat connection (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          handleStartVoiceChat(retryCount + 1);
        }, 2000); // Wait 2 seconds before retry
        return;
      }

      // Show more specific error messages  
      let alertTitle = 'Connection Error';
      let alertMessage = 'Failed to start voice chat. Please try again.';

      if (errorMessage.includes('WebRTC') || errorMessage.includes('pc connection') || errorMessage.includes('ConnectionError') || errorMessage.includes('could not establish pc connection')) {
        if (isSimulatorLikely) {
          alertTitle = '📱 iOS Simulator Limitation';
          alertMessage = `Voice chat uses WebRTC which doesn't work in iOS Simulator.

🔧 Solutions:
• Use a physical iPhone device
• Test on Android device/emulator  
• Use Mac for iOS device testing

💡 Alternative: Continue with text-only chat for now`;
        } else {
          alertTitle = '🌐 WebRTC Peer Connection Failed';
          alertMessage = `WebRTC peer connection failed - likely due to STUN/TURN server access issues.

🔧 ICE Server Solutions:
• Switch networks (WiFi ↔ Cellular)
• Disable VPN (VPNs often block STUN servers)
• Try mobile hotspot (bypasses firewalls)
• Contact IT about WebRTC/STUN whitelist

📱 Common Network Blocks:
• Corporate firewalls block UDP ports (19302, 3478)
• School networks restrict peer-to-peer connections
• Some ISPs block WebRTC protocols
• VPNs interfere with ICE server discovery

� Technical Details:
STUN/TURN servers help establish peer connections.
When blocked, WebRTC cannot connect (common ElevenLabs issue).

💡 Use 'Troubleshoot Connection' for detailed diagnostics.

Technical: ICE candidate gathering failed / peer connection establishment timeout`;
        }
      } else if (errorMessage.includes('permission')) {
        alertTitle = 'Permission Required';
        alertMessage = 'Microphone permission is required. Please enable microphone access in Settings.';
      } else if (errorMessage.includes('network')) {
        alertTitle = 'Network Error';
        alertMessage = 'Please check your internet connection and try again.';
      }

      Alert.alert(alertTitle, alertMessage, [{ text: 'OK' }]);
    }
  };

  const onStartVoiceChatPress = () => {
    console.log('🎯 USER ACTION: Start Voice Chat button pressed');
    console.log('📊 Current state before starting:', {
      agentId,
      isInitializing,
      conversationStatus: conversation.status,
      timestamp: new Date().toISOString()
    });

    // Log LiveKit configuration status
    console.log('🔧 LiveKit Debug Status:');
    console.log(`  • Debug logging: ${LiveKitLogger.status.enabled ? 'ENABLED' : 'DISABLED'}`);
    console.log('  • Platform:', Platform.OS);
    console.log('  • Environment:', __DEV__ ? 'Development' : 'Production');
    console.log('  • Expected logs: ICE candidates, STUN/TURN servers, peer connection states');

    handleStartVoiceChat(0);
  };

  const handleEndVoiceChat = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error('Error ending voice chat:', error);
    }
  };

  const toggleMic = () => {
    const newMutedState = !micMuted;
    setMicMuted(newMutedState);
    (conversation as any).setMicMuted(newMutedState);
  };

  useEffect(() => {
    // Bridge check: Log every status change for LiveKit/ElevenLabs
    console.log("🔄 Conversation status changed:", conversation.status);

    // Optionally, log more details if available
    if (conversation.status === 'connected') {
      console.log('🔗 Bridge Check: LiveKit and ElevenLabs are connected.');
    }
    if (conversation.status === 'disconnected') {
      console.log('🔗 Bridge Check: LiveKit and/or ElevenLabs disconnected.');
    }
  }, [conversation.status]);


  useEffect(() => {
    getFileContent();
  }, []);

  if (!isVisible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>

      <View style={styles.controls}>
        {isInitializing ? (
          <View style={styles.initializingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.initializingText, { color: colors.textSecondary }]}>
              Setting up voice chat...
            </Text>
          </View>
        ) : (
          <>
            {conversation.status !== 'connected' ? (
              <>
                <TouchableOpacity
                  style={[styles.startButton, { backgroundColor: colors.primary }]}
                  onPress={onStartVoiceChatPress}
                  disabled={conversation.status === 'connecting' || !agentId}
                >
                  {conversation.status === 'connecting' ? (
                    <Loader size={24} color={colors.white} />
                  ) : (
                    <Phone size={24} color={colors.white} />
                  )}
                  <Text style={[styles.startButtonText, { color: colors.white }]}>
                    {conversation.status === 'connecting' ? 'Connecting...' : 'Start Voice Chat'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.activeControls}>
                {/* <TouchableOpacity
                  style={[
                    styles.controlButton,
                    { backgroundColor: micMuted ? colors.error : colors.primary }
                  ]}
                  onPress={toggleMic}
                >
                  {micMuted ? (
                    <MicOff size={20} color={colors.white} />
                  ) : (
                    <Mic size={20} color={colors.white} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, { backgroundColor: colors.textSecondary }]}
                  onPress={() => {
                    console.log('Available conversation methods:', Object.keys(conversation));
                    Alert.alert(
                      'Audio Output',
                      'Select audio output device',
                      [
                        { text: 'Speaker', onPress: () => {
                          // Here we'll try to switch to speaker
                          console.log('Attempting to switch to speaker output...');
                        }},
                        { text: 'Earpiece', onPress: () => {
                          // Here we'll try to switch to earpiece
                          console.log('Attempting to switch to earpiece output...');
                        }},
                        { text: 'Cancel', style: 'cancel' }
                      ]
                    );
                  }}
                >
                  <Volume2 size={20} color={colors.white} />
                </TouchableOpacity> */}

                <TouchableOpacity
                  style={[styles.endButton, { backgroundColor: colors.error }]}
                  onPress={handleEndVoiceChat}
                >
                  <PhoneOff size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  simulatorWarning: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  simulatorWarningText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  header: {
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  controls: {
    alignItems: 'center',
  },
  initializingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  initializingText: {
    fontSize: 14,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationInfo: {
    marginTop: 12,
    alignItems: 'center',
  },
  conversationText: {
    fontSize: 12,
    marginBottom: 8,
  },
  feedbackContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  feedbackButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 16,
  },
  troubleshootButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  troubleshootButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
});

export default VoiceChat;
