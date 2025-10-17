module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      blacklist: null,
      whitelist: ['OPENROUTER_KEY', 'ELEVENLABS_API_KEY', 'LOCIZE_PROJECT_ID', 'LOCIZE_API_KEY'],
      safe: false,
      allowUndefined: true
    }]
  ]
};
