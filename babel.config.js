module.exports = {
  presets: [
    'module:@react-native/babel-preset',
    //'module:metro-react-native-babel-preset',
    // …other presets
  ],
  plugins: [
    // …other plugins
    'react-native-reanimated/plugin', // ← must be last
  ],
};
