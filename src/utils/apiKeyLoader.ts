// Environment variable loader for ElevenLabs API key

// Import from environment variables
import { ELEVENLABS_API_KEY as EnvApiKey } from '@env';

const getElevenLabsApiKey = (): string | undefined => {
  console.log('=== API Key Loader ===');
  console.log('Loading API key from environment variables...');
  
  // Only use environment variable - no hardcoded fallbacks
  if (EnvApiKey && typeof EnvApiKey === 'string' && EnvApiKey.startsWith('sk_') && EnvApiKey.length > 20) {
    console.log('✅ Found valid API key from environment variables');
    return EnvApiKey;
  }
  
  console.log('❌ No valid API key found in environment variables');
  console.log('Make sure ELEVENLABS_API_KEY is set in .env file');
  return undefined;
};

export { getElevenLabsApiKey };
export default getElevenLabsApiKey;
