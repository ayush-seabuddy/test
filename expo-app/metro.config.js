const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// keep your wasm support
defaultConfig.resolver.assetExts.push('wasm');

module.exports = defaultConfig;
