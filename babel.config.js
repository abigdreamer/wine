module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      blacklist: null,
      whitelist: ['OPENROUTER_KEY'],
      safe: false,
      allowUndefined: true
    }]
  ]
};
