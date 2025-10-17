/**
 * @format
 */

import ElevenLabsService from '../src/services/elevenlabs';

// Mock fetch
const mockFetch = jest.fn();
Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true,
});

describe('ElevenLabs Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('validateApiKey', () => {
    it('returns true for valid API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await ElevenLabsService.validateApiKey();
      expect(result).toBe(true);
    });

    it('returns false for invalid API key', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await ElevenLabsService.validateApiKey();
      expect(result).toBe(false);
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await ElevenLabsService.validateApiKey();
      expect(result).toBe(false);
    });
  });

  describe('listAgents', () => {
    it('returns list of agents', async () => {
      const mockAgents = [
        {
          agent_id: 'agent1',
          name: 'Test Agent 1',
          description: 'Description 1',
        },
        {
          agent_id: 'agent2',
          name: 'Test Agent 2',
          description: 'Description 2',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ agents: mockAgents }),
      });

      const result = await ElevenLabsService.listAgents();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('agent_id', 'agent1');
      expect(result[1]).toHaveProperty('name', 'Test Agent 2');
    });

    it('handles API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      await expect(ElevenLabsService.listAgents()).rejects.toThrow();
    });
  });

  describe('createAgent', () => {
    it('creates a new agent successfully', async () => {
      const mockAgent = {
        agent_id: 'new-agent-id',
        name: 'New Agent',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAgent),
      });

      const config = {
        name: 'New Agent',
        prompt: 'Test prompt',
        voice_id: 'voice123',
      };

      const result = await ElevenLabsService.createAgent(config);
      expect(result).toHaveProperty('agent_id', 'new-agent-id');
      expect(result).toHaveProperty('name', 'New Agent');
    });

    it('handles creation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: () => Promise.resolve('Invalid request'),
      });

      const config = {
        name: 'Invalid Agent',
        prompt: 'Test prompt',
      };

      await expect(ElevenLabsService.createAgent(config)).rejects.toThrow();
    });
  });

  describe('createConversationToken', () => {
    it('creates conversation token successfully', async () => {
      const mockToken = {
        token: 'test-token-123',
        expires_at: '2025-12-31T23:59:59Z',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockToken),
      });

      const result = await ElevenLabsService.createConversationToken('agent123');
      expect(result).toHaveProperty('token', 'test-token-123');
      expect(result).toHaveProperty('expires_at', '2025-12-31T23:59:59Z');
    });

    it('handles token creation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Agent not found'),
      });

      await expect(ElevenLabsService.createConversationToken('invalid-agent')).rejects.toThrow();
    });
  });

  describe('getSignedUrl', () => {
    it('gets signed URL successfully', async () => {
      const mockUrl = 'wss://api.elevenlabs.io/v1/convai/conversation/signed-url-123';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ signed_url: mockUrl }),
      });

      const result = await ElevenLabsService.getSignedUrl('agent123');
      expect(result).toBe(mockUrl);
    });

    it('handles signed URL errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: () => Promise.resolve('Forbidden'),
      });

      await expect(ElevenLabsService.getSignedUrl('agent123')).rejects.toThrow();
    });
  });

  describe('deleteAgent', () => {
    it('deletes agent successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const result = await ElevenLabsService.deleteAgent('agent123');
      expect(result).toBe(true);
    });

    it('handles deletion errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await ElevenLabsService.deleteAgent('nonexistent-agent');
      expect(result).toBe(false);
    });

    it('handles network errors during deletion', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await ElevenLabsService.deleteAgent('agent123');
      expect(result).toBe(false);
    });
  });
});
