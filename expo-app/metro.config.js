const { getDefaultConfig } = require('expo/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push('wasm');

const sentryConfig = getSentryExpoConfig(__dirname);

module.exports = {
  ...defaultConfig,
  ...sentryConfig,
  resolver: {
    ...defaultConfig.resolver,
    ...sentryConfig.resolver,
    assetExts: defaultConfig.resolver.assetExts.concat(
      sentryConfig.resolver.assetExts ?? [],
    ),
    sourceExts: defaultConfig.resolver.sourceExts.concat(
      sentryConfig.resolver.sourceExts ?? [],
    ),
  },
};
