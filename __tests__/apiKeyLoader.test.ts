/**
 * @format
 */

import { getElevenLabsApiKey } from '../src/utils/apiKeyLoader';

describe('API Key Loader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns API key when valid key is provided', () => {
    const apiKey = getElevenLabsApiKey();
    // The test should verify that we get a valid API key 
    expect(apiKey).toBeTruthy();
    expect(typeof apiKey).toBe('string');
    expect(apiKey?.startsWith('sk_')).toBe(true);
  });

  it('validates API key format', () => {
    const apiKey = getElevenLabsApiKey();
    expect(apiKey).toMatch(/^sk_/);
    expect(apiKey?.length).toBeGreaterThan(20);
  });
});
