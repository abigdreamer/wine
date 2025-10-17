// Mock environment variables before any modules are loaded
jest.doMock('@env', () => ({
  ELEVENLABS_API_KEY: 'sk_test_elevenlabs_api_key',
  OPENROUTER_KEY: 'sk-or-v1-test_openrouter_key',
  LOCIZE_PROJECT_ID: 'test_locize_project_id',
  LOCIZE_API_KEY: 'test_locize_api_key',
}));
