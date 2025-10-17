import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../../types/message';

export interface ConversationSession {
  id: string;
  agentId: string;
  startTime: number;
  endTime?: number;
  messages: Message[];
  mode: 'text' | 'voice' | 'mixed';
  userId?: string;
}

const CONVERSATION_STORAGE_KEY = 'elevenlabs_conversations';

class ConversationHistoryManager {
  private static instance: ConversationHistoryManager;

  private constructor() { }

  public static getInstance(): ConversationHistoryManager {
    if (!ConversationHistoryManager.instance) {
      ConversationHistoryManager.instance = new ConversationHistoryManager();
    }
    return ConversationHistoryManager.instance;
  }

  /**
   * Get storage key for user-specific conversations
   */
  private async getUserStorageKey(): Promise<string> {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (!userJson) return CONVERSATION_STORAGE_KEY;

      const userData = JSON.parse(userJson);
      return `${CONVERSATION_STORAGE_KEY}_${userData.id || 'default'}`;
    } catch (error) {
      console.error('Error getting user storage key:', error);
      return CONVERSATION_STORAGE_KEY;
    }
  }

  /**
   * Save a conversation session
   */
  async saveConversation(session: ConversationSession): Promise<void> {
    try {
      const storageKey = await this.getUserStorageKey();
      const existingConversations = await this.getAllConversations();

      // Update existing conversation or add new one
      const updatedConversations = existingConversations.filter(c => c.id !== session.id);
      updatedConversations.push(session);

      // Keep only the latest 50 conversations
      const limitedConversations = updatedConversations
        .sort((a, b) => b.startTime - a.startTime)
        .slice(0, 50);

      await AsyncStorage.setItem(storageKey, JSON.stringify(limitedConversations));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  /**
   * Get all conversation sessions for the current user
   */
  async getAllConversations(): Promise<ConversationSession[]> {
    try {
      const storageKey = await this.getUserStorageKey();
      const conversationsJson = await AsyncStorage.getItem(storageKey);

      if (!conversationsJson) return [];

      const conversations = JSON.parse(conversationsJson);
      return Array.isArray(conversations) ? conversations : [];
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation(id: string): Promise<ConversationSession | null> {
    try {
      const conversations = await this.getAllConversations();
      return conversations.find(c => c.id === id) || null;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string): Promise<void> {
    try {
      const storageKey = await this.getUserStorageKey();
      const conversations = await this.getAllConversations();
      const updatedConversations = conversations.filter(c => c.id !== id);

      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedConversations));
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }

  /**
   * Create a new conversation session
   */
  async createConversationSession(
    agentId: string,
    mode: 'text' | 'voice' | 'mixed' = 'mixed',
    userId?: string
  ): Promise<ConversationSession> {

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=agent_4301k71swfhnehdt1jv0s2gyzbxd`,
      {
        headers: {
          // Requesting a conversation token requires your ElevenLabs API key
          // Do NOT expose your API key to the client!
          'xi-api-key': "sk_2c9694d9810c1659c1745e4e54559a2a53c82d933b9a2717",
        }
      }
    );
    return {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      startTime: Date.now(),
      messages: [],
      mode,
      userId,
    };
  }

  /**
   * Add message to conversation
   */
  async addMessageToConversation(
    conversationId: string,
    message: Message
  ): Promise<void> {
    try {
      const conversation = await this.getConversation(conversationId);
      if (conversation) {
        conversation.messages.push(message);
        await this.saveConversation(conversation);
      }
    } catch (error) {
      console.error('Error adding message to conversation:', error);
    }
  }

  /**
   * End a conversation session
   */
  async endConversation(conversationId: string): Promise<void> {
    try {
      const conversation = await this.getConversation(conversationId);
      if (conversation) {
        conversation.endTime = Date.now();
        await this.saveConversation(conversation);
      }
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(): Promise<{
    totalConversations: number;
    totalMessages: number;
    voiceConversations: number;
    textConversations: number;
    averageConversationLength: number;
  }> {
    try {
      const conversations = await this.getAllConversations();

      const stats = {
        totalConversations: conversations.length,
        totalMessages: conversations.reduce((sum, conv) => sum + conv.messages.length, 0),
        voiceConversations: conversations.filter(c => c.mode === 'voice' || c.mode === 'mixed').length,
        textConversations: conversations.filter(c => c.mode === 'text').length,
        averageConversationLength: 0,
      };

      if (conversations.length > 0) {
        const totalDuration = conversations
          .filter(c => c.endTime)
          .reduce((sum, conv) => sum + (conv.endTime! - conv.startTime), 0);

        const completedConversations = conversations.filter(c => c.endTime).length;
        stats.averageConversationLength = completedConversations > 0
          ? totalDuration / completedConversations
          : 0;
      }

      return stats;
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      return {
        totalConversations: 0,
        totalMessages: 0,
        voiceConversations: 0,
        textConversations: 0,
        averageConversationLength: 0,
      };
    }
  }

  /**
   * Clear all conversations for the current user
   */
  async clearAllConversations(): Promise<void> {
    try {
      const storageKey = await this.getUserStorageKey();
      await AsyncStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing conversations:', error);
    }
  }
}

export default ConversationHistoryManager.getInstance();
