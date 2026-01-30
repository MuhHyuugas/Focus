const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Fix for lodash internal module resolution (required for react-native-calendars)
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [path.resolve(__dirname, "node_modules")],
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  inlineRem: 16,
});
