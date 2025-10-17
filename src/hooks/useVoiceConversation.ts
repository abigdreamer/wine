import { useState, useCallback, useRef, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react-native';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ElevenLabsService from '../services/elevenlabs';
import { Message } from '../../types/message';

// Detect iOS Simulator - WebRTC doesn't work in iOS Simulator
const isSimulatorLikely = Platform.OS === 'ios' && __DEV__;

export interface VoiceConversationState {
  isConnected: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  status: 'disconnected' | 'connecting' | 'connected' | 'error' | 'disconnecting';
  error?: string;
  conversationId?: string;
}

export interface VoiceConversationConfig {
  agentId?: string;
  userId?: string;
  systemPrompt?: string;
  firstMessage?: string;
  onMessage?: (message: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export const useVoiceConversation = (config: VoiceConversationConfig = {}) => {
  const [state, setState] = useState<VoiceConversationState>({
    isConnected: false,
    isSpeaking: false,
    isListening: false,
    status: 'disconnected',
  });

  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const conversationTokenRef = useRef<string | null>(null);
  const currentAgentIdRef = useRef<string | null>(null);
  const connectionTimeoutRef = useRef<number | null>(null);
  const heartbeatTimeoutRef = useRef<number | null>(null);

  const conversation = useConversation({
    // Add configuration options based on official documentation
    onConnect: () => {
      console.log('✅ ElevenLabs conversation connected');
      
      // Clear any connection timeouts
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      // Set up heartbeat to detect connection loss
      heartbeatTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Voice conversation heartbeat timeout - connection may be lost');
        setState(prev => ({ 
          ...prev, 
          status: 'error', 
          error: 'Connection timeout. Please try again.',
          isConnected: false,
          isSpeaking: false,
          isListening: false
        }));
        config.onError?.('Connection timeout');
      }, 60000); // 60 second heartbeat
      
      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        status: 'connected',
        error: undefined 
      }));
      config.onConnect?.();
    },
    onDisconnect: (details?: unknown) => {
      console.log('🔌 ElevenLabs conversation disconnected');
      console.log('Disconnect details:', details);
      
      // Clear all timeouts
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = null;
      }
      
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        status: 'disconnected',
        isSpeaking: false,
        isListening: false
      }));
      config.onDisconnect?.();
    },
    onMessage: (message: unknown) => {
      console.log('📩 ElevenLabs message received:', {
        message: typeof message === 'object' && message !== null ? message : String(message),
        timestamp: new Date().toISOString()
      });
      
      // Reset heartbeat timeout when we receive messages
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = setTimeout(() => {
          console.log('⏰ Voice conversation heartbeat timeout - connection may be lost');
          setState(prev => ({ 
            ...prev, 
            status: 'error', 
            error: 'Connection timeout. Please try again.',
            isConnected: false,
            isSpeaking: false,
            isListening: false
          }));
          config.onError?.('Connection timeout');
        }, 60000); // Reset 60 second heartbeat
      }
      
      // Handle different message types based on the SDK message structure
      const msgObj = message as any;
      if (msgObj && typeof msgObj === 'object') {
        if (msgObj.source === 'user') {
          const userMessage: Message = {
            id: Date.now().toString(),
            text: msgObj.message || String(message),
            isUser: true,
            timestamp: Date.now(),
          };
          setConversationHistory(prev => [...prev, userMessage]);
        } else if (msgObj.source === 'ai') {
          const aiMessage: Message = {
            id: Date.now().toString(),
            text: msgObj.message || String(message),
            isUser: false,
            timestamp: Date.now(),
            confidence: 95, // ElevenLabs typically has high confidence
            sources: ['ElevenLabs AI'],
          };
          setConversationHistory(prev => [...prev, aiMessage]);
        }
      }
      
      config.onMessage?.(message);
    },
    onError: (error) => {
      console.error('❌ ElevenLabs conversation error:', {
        error,
        errorType: typeof error,
        errorString: String(error),
        timestamp: new Date().toISOString()
      });
      
      const errorMessage = typeof error === 'string' ? error : 'Connection lost. Please try again.';
      const errorStr = String(error);
      
      // Handle specific WebRTC errors based on IRELIA-AI project insights
      if (errorStr.includes('RTCDataChannel') || errorStr.includes('readyState is not \'open\'')) {
        console.log('🔍 Detected RTCDataChannel connection issue - attempting to normalize state');
        setState(prev => ({ 
          ...prev, 
          status: 'error', 
          error: 'Connection lost. The voice connection was interrupted.',
          isConnected: false,
          isSpeaking: false,
          isListening: false
        }));
        config.onError?.('RTCDataChannel connection lost');
        return;
      }
      
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: errorMessage,
        isConnected: false,
        isSpeaking: false,
        isListening: false
      }));
      config.onError?.(error);
    },
    onModeChange: (modeChange) => {
      console.log('🎤 ElevenLabs mode changed:', {
        mode: modeChange.mode,
        timestamp: new Date().toISOString()
      });
      setState(prev => ({
        ...prev,
        isSpeaking: modeChange.mode === 'speaking',
        isListening: modeChange.mode === 'listening',
      }));
    },
    onStatusChange: (statusChange) => {
      console.log('📊 ElevenLabs status changed:', {
        status: statusChange.status,
        timestamp: new Date().toISOString()
      });
      setState(prev => ({ ...prev, status: statusChange.status }));
    },
  });

  // Request microphone permissions
  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs microphone access to enable voice conversations with AI.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // iOS permissions are handled automatically
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  }, []);

  // Get or create conversation token
  const getConversationToken = useCallback(async (agentId: string): Promise<string> => {
    try {
      console.log('=== Getting Conversation Token ===');
      console.log('Agent ID for token:', agentId);
      
      // Check if we have a valid cached token
      const cachedToken = await AsyncStorage.getItem(`conversation_token_${agentId}`);
      const cachedExpiry = await AsyncStorage.getItem(`conversation_token_expiry_${agentId}`);
      
      console.log('Cached token exists:', !!cachedToken);
      console.log('Cached expiry exists:', !!cachedExpiry);
      
      if (cachedToken && cachedExpiry) {
        const expiryTime = parseInt(cachedExpiry, 10);
        const now = Date.now();
        
        console.log('Token expiry time:', new Date(expiryTime));
        console.log('Current time:', new Date(now));
        console.log('Time until expiry (minutes):', (expiryTime - now) / (60 * 1000));
        
        // If token expires in more than 5 minutes, use cached token
        if (expiryTime - now > 5 * 60 * 1000) {
          console.log('✅ Using cached token');
          return cachedToken;
        }
      }

      // Create new token
      console.log('Creating new conversation token...');
      const tokenResponse = await ElevenLabsService.createConversationToken(agentId);
      console.log('Token response received:', {
        hasToken: !!tokenResponse.token,
        expiresAt: tokenResponse.expires_at
      });
      
      // Cache the token
      await AsyncStorage.setItem(`conversation_token_${agentId}`, tokenResponse.token);
      await AsyncStorage.setItem(`conversation_token_expiry_${agentId}`, 
        new Date(tokenResponse.expires_at).getTime().toString());
      
      console.log('✅ Token cached successfully');
      return tokenResponse.token;
    } catch (error) {
      console.error('=== Token Creation Error ===');
      console.error('Error getting conversation token:', error);
      console.error('Agent ID:', agentId);
      throw error;
    }
  }, []);

  // Start voice conversation
  const startVoiceConversation = useCallback(async (agentId?: string) => {
    try {
      console.log('=== Starting Voice Conversation ===');
      console.log('Platform:', Platform.OS, 'DEV mode:', __DEV__, 'Likely Simulator:', isSimulatorLikely);
      
      // Warn about simulator limitations upfront
      if (isSimulatorLikely) {
        console.warn('⚠️ Running in iOS Simulator - WebRTC voice chat may not work properly');
        console.warn('💡 For voice chat testing, please use a physical iPhone device');
      }
      
      setState(prev => ({ ...prev, status: 'connecting', error: undefined }));
      
      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Connection timeout during startup');
        setState(prev => ({ 
          ...prev, 
          status: 'error', 
          error: 'Connection timeout. Please check your internet connection and try again.',
          isConnected: false,
          isSpeaking: false,
          isListening: false
        }));
      }, 30000); // 30 second connection timeout
      
      // Request microphone permission first
      console.log('Requesting microphone permission...');
      const hasPermission = await requestMicrophonePermission();
      console.log('Microphone permission granted:', hasPermission);
      
      if (!hasPermission) {
        throw new Error('Microphone permission is required for voice conversation');
      }

      const targetAgentId = agentId || config.agentId;
      console.log('Target agent ID:', targetAgentId);
      
      if (!targetAgentId) {
        throw new Error('Agent ID is required to start conversation');
      }

      currentAgentIdRef.current = targetAgentId;

      // Try multiple connection strategies
      let sessionResult;
      let conversationId;
      
      try {
        // Strategy 1: Try direct agent connection (recommended for public agents)
        console.log('Strategy 1: Attempting direct agent connection...');
        sessionResult = await conversation.startSession({
          agentId: targetAgentId,
          userId: config.userId,
        });
        console.log('Direct agent session result:', sessionResult);

        conversationId = conversation.getId() || 'unknown';
        console.log('✅ Voice conversation started with agent ID, ID:', conversationId);
        
      } catch (directAgentError) {
        console.log('❌ Direct agent strategy failed:', directAgentError);
        
        try {
          // Strategy 2: Try with conversation token (for private agents)
          console.log('Strategy 2: Attempting connection with conversation token...');
          const conversationToken = await getConversationToken(targetAgentId);
          console.log('Conversation token obtained:', conversationToken ? 'YES' : 'NO');
          conversationTokenRef.current = conversationToken;

          console.log('Starting session with token...');
          sessionResult = await conversation.startSession({
            conversationToken,
            userId: config.userId,
          });
          console.log('Token session result:', sessionResult);

          conversationId = conversation.getId() || 'token-session';
          console.log('✅ Voice conversation started with token, ID:', conversationId);
          
        } catch (tokenError) {
          console.log('❌ Token strategy failed:', tokenError);
          
          // Strategy 3: Try with minimal configuration as last resort
          console.log('Strategy 3: Attempting minimal configuration...');
          sessionResult = await conversation.startSession({
            agentId: targetAgentId,
          });
          console.log('Minimal config session result:', sessionResult);

          conversationId = conversation.getId() || 'minimal-session';
          console.log('✅ Voice conversation started with minimal config, ID:', conversationId);
        }
      }

      setState(prev => ({ 
        ...prev, 
        conversationId,
        status: 'connected'
      }));
    } catch (error) {
      console.error('=== Voice Conversation Start Error ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('Full error object:', error);
      console.error('Platform:', Platform.OS);
      console.error('Agent ID:', currentAgentIdRef.current);
      console.error('User ID:', config.userId);
      
      // Clear connection timeout on error
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      // Provide more specific error messages based on IRELIA-AI project insights
      let errorMessage = 'Failed to start conversation';
      const errorStr = String(error);
      
      if (errorStr.includes('pc connection') || errorStr.includes('ConnectionError') || errorStr.includes('LiveKit')) {
        if (isSimulatorLikely) {
          errorMessage = '⚠️ WebRTC Error in iOS Simulator\n\nVoice chat requires WebRTC which doesn\'t work in iOS Simulator.\n\n✅ Solution: Test on a physical iPhone device\n✅ Alternative: Use Android device/emulator\n✅ For now: Test other app features in simulator';
        } else {
          // Use insights from IRELIA-AI project for better guidance
          errorMessage = 'Unable to connect to voice service. This can happen due to network restrictions or browser compatibility.\n\n🔧 Solutions:\n• Try using Chrome on Android or Safari on iOS\n• Switch to a different network (WiFi ↔ cellular)\n• Disable VPN if active\n• Check firewall/corporate network restrictions\n• Restart the app and try again';
        }
      } else if (errorStr.includes('webrtc') || errorStr.toLowerCase().includes('peer connection')) {
        errorMessage = 'Voice connection failed. Please try using a different browser (Chrome on Android or Safari on iOS work best) or switch to a different network connection.';
      } else if (errorStr.includes('ice') || errorStr.toLowerCase().includes('stun')) {
        errorMessage = 'Network connection issue. Try switching from WiFi to mobile data (or vice versa) and try again.';
      } else if (errorStr.includes('RTCDataChannel') || errorStr.includes('readyState is not \'open\'')) {
        errorMessage = 'Connection lost. The voice connection was interrupted. Please try reconnecting.';
      } else if (errorStr.includes('permission')) {
        errorMessage = 'Microphone permission denied. Please enable microphone access in settings.';
      } else if (errorStr.includes('network') || errorStr.includes('fetch')) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (errorStr.includes('token') || errorStr.includes('auth')) {
        errorMessage = 'Authentication failed. Please check your API key configuration.';
      } else if (errorStr.includes('agent')) {
        errorMessage = 'Agent not found or unavailable. Please try again.';
      }
      
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: errorMessage
      }));
      
      // Re-throw the error so the VoiceChat component can handle it
      throw error;
    }
  }, [conversation, config.agentId, config.userId, requestMicrophonePermission, getConversationToken]);

  // End voice conversation
  const endVoiceConversation = useCallback(async () => {
    try {
      // Clear all timeouts
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = null;
      }
      
      await conversation.endSession();
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        status: 'disconnected',
        conversationId: undefined,
        isSpeaking: false,
        isListening: false,
        error: undefined
      }));
      conversationTokenRef.current = null;
      currentAgentIdRef.current = null;
      console.log('Voice conversation ended');
    } catch (error) {
      console.error('Error ending voice conversation:', error);
    }
  }, [conversation]);

  // Send text message during voice conversation
  const sendMessage = useCallback(async (text: string) => {
    try {
      if (!state.isConnected) {
        throw new Error('Not connected to voice conversation');
      }
      
      await conversation.sendUserMessage(text);
      
      // Add user message to history
      const userMessage: Message = {
        id: Date.now().toString(),
        text,
        isUser: true,
        timestamp: Date.now(),
      };
      setConversationHistory(prev => [...prev, userMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [conversation, state.isConnected]);

  // Send contextual update
  const sendContextualUpdate = useCallback(async (context: string) => {
    try {
      if (state.isConnected) {
        await conversation.sendContextualUpdate(context);
      }
    } catch (error) {
      console.error('Error sending contextual update:', error);
    }
  }, [conversation, state.isConnected]);

  // Mute/unmute microphone
  const setMicMuted = useCallback((muted: boolean) => {
    conversation.setMicMuted(muted);
  }, [conversation]);

  // Send feedback
  const sendFeedback = useCallback(async (positive: boolean) => {
    try {
      if (state.isConnected) {
        await conversation.sendFeedback(positive);
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  }, [conversation, state.isConnected]);

  // Get conversation ID
  const getConversationId = useCallback(() => {
    return conversation.getId();
  }, [conversation]);

  // Clear conversation history
  const clearHistory = useCallback(() => {
    setConversationHistory([]);
  }, []);

  return {
    // State
    ...state,
    conversationHistory,
    
    // Methods
    startVoiceConversation,
    endVoiceConversation,
    sendMessage,
    sendContextualUpdate,
    setMicMuted,
    sendFeedback,
    getConversationId,
    clearHistory,
    
    // Conversation properties
    canSendFeedback: conversation.canSendFeedback,
  };
};
