import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ELEVENLABS_API_KEY } from '@env';

const EnvTest: React.FC = () => {
  useEffect(() => {
    console.log('=== ENV TEST COMPONENT ===');
    console.log('ELEVENLABS_API_KEY:', ELEVENLABS_API_KEY);
    console.log('Type:', typeof ELEVENLABS_API_KEY);
    console.log('Exists:', !!ELEVENLABS_API_KEY);
    console.log('Length:', ELEVENLABS_API_KEY?.length || 0);
    console.log('Preview:', ELEVENLABS_API_KEY ? `${ELEVENLABS_API_KEY.substring(0, 10)}...` : 'UNDEFINED');
    console.log('=== END ENV TEST ===');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Environment Variable Test</Text>
      <Text style={styles.text}>
        API Key Loaded: {ELEVENLABS_API_KEY ? 'YES' : 'NO'}
      </Text>
      <Text style={styles.text}>
        Length: {ELEVENLABS_API_KEY?.length || 0}
      </Text>
      <Text style={styles.text}>
        Preview: {ELEVENLABS_API_KEY ? `${ELEVENLABS_API_KEY.substring(0, 10)}...` : 'UNDEFINED'}
      </Text>
      <Text style={styles.text}>
        Format Valid: {ELEVENLABS_API_KEY?.startsWith('sk_') ? 'YES' : 'NO'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    margin: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default EnvTest;
