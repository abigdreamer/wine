import { ELEVENLABS_API_KEY } from '@env';
import { getElevenLabsApiKey } from '../utils/apiKeyLoader';

export interface ElevenLabsAgent {
  agent_id: string;
  name: string;
  description?: string;
  voice_id?: string;
  language?: string;
}

export interface ConversationToken {
  token: string;
  expires_at: string;
}

/**
 * Service for managing ElevenLabs Conversational AI agents
 */
export class ElevenLabsService {
  private static instance: ElevenLabsService;
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  private constructor() {
    // Use the robust API key loader
    this.apiKey = getElevenLabsApiKey() || ELEVENLABS_API_KEY || '';
    
    // Validate API key without exposing sensitive data
    console.log('=== ElevenLabs Service Constructor ===');
    console.log('API key exists:', !!this.apiKey);
    console.log('API key format valid:', this.apiKey?.startsWith('sk_') || false);
    console.log('=== End Constructor Debug ===');
  }

  public static getInstance(): ElevenLabsService {
    if (!ElevenLabsService.instance) {
      ElevenLabsService.instance = new ElevenLabsService();
    }
    return ElevenLabsService.instance;
  }

  /**
   * Create a conversation token for secure agent access
   */
  async createConversationToken(agentId: string): Promise<ConversationToken> {
    try {
      console.log('Creating conversation token for agent:', agentId);
      
      // Try the token endpoint first
      const response = await fetch(
        `${this.baseUrl}/convai/conversation/token?agent_id=${agentId}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Token response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token creation failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Token created successfully');
      
      return {
        token: data.token,
        expires_at: data.expires_at,
      };
    } catch (error) {
      console.error('Error creating conversation token:', error);
      throw error;
    }
  }

  /**
   * Get signed URL for WebSocket connection (alternative to token)
   */
  async getSignedUrl(agentId: string): Promise<string> {
    try {
      console.log('Getting signed URL for agent:', agentId);
      
      const response = await fetch(
        `${this.baseUrl}/convai/conversation/get-signed-url?agent_id=${agentId}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Signed URL response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Signed URL failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Signed URL created successfully');
      
      return data.signed_url;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  }

  /**
   * Create a new agent for conversational AI
   */
  async createAgent(config: {
    name: string;
    prompt: string;
    first_message?: string;
    voice_id?: string;
    language?: string;
  }): Promise<ElevenLabsAgent> {
    try {
      console.log('Creating ElevenLabs agent with config:', {
        name: config.name,
        voice_id: config.voice_id,
        language: config.language
      });

      const response = await fetch(`${this.baseUrl}/convai/agents/create`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: config.name,
          conversation_config: {
            agent: {
              prompt: {
                prompt: config.prompt,
              },
              first_message: config.first_message || 'Hello! How can I help you today?',
              language: config.language || 'en',
            },
            voice: {
              voice_id: config.voice_id || '21m00Tcm4TlvDq8ikWAM', // Default Rachel voice
            },
            asr: {
              quality: 'high',
              user_input_audio_format: 'pcm_16000',
            },
            tts: {
              voice_id: config.voice_id || '21m00Tcm4TlvDq8ikWAM',
              model_id: 'eleven_turbo_v2_5', // Use newer model instead of deprecated v1
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 600,
            },
          },
        }),
      });

      console.log('Agent creation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Agent creation failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Agent created successfully:', data);
      
      return {
        agent_id: data.agent_id,
        name: config.name,
        description: config.prompt,
        voice_id: config.voice_id,
        language: config.language,
      };
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error;
    }
  }

  /**
   * List all agents
   */
  async listAgents(): Promise<ElevenLabsAgent[]> {
    try {
      console.log('Fetching agents list...');
      const response = await fetch(`${this.baseUrl}/convai/agents`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('List agents failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('Agents list response:', data);
      
      return data.agents.map((agent: any) => ({
        agent_id: agent.agent_id,
        name: agent.name,
        description: agent.description || '',
        voice_id: agent.voice_id,
        language: agent.language,
      }));
    } catch (error) {
      console.error('Error listing agents:', error);
      throw error;
    }
  }

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/convai/agents/${agentId}`, {
        method: 'DELETE',
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting agent:', error);
      return false;
    }
  }

  /**
   * Validate API key
   */
  async validateApiKey(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        console.error('ElevenLabs API key is not set');
        return false;
      }

      if (!this.apiKey.startsWith('sk_')) {
        console.error('ElevenLabs API key format is invalid (should start with sk_)');
        return false;
      }

      console.log('Validating ElevenLabs API key with user endpoint...');
      const response = await fetch(`${this.baseUrl}/user`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (response.ok) {
        console.log('ElevenLabs API key validation successful');
        return true;
      } else {
        console.error('ElevenLabs API key validation failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      return false;
    }
  }
}

export default ElevenLabsService.getInstance();
