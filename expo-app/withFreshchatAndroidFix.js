// withFreshchatAndroidFix.js
const { withProjectBuildGradle, withAppBuildGradle } = require('@expo/prebuild-config');

// 1. Force the dependency at the project level (ensures every module sees it)
const withProjectFix = config =>
  withProjectBuildGradle(config, async config => {
    const buildGradle = config.modResults.contents;

    if (!buildGradle.includes('androidx.localbroadcastmanager:localbroadcastmanager')) {
      config.modResults.contents = buildGradle.replace(
        'dependencies {',
        `dependencies {
     classpath 'androidx.localbroadcastmanager:localbroadcastmanager:1.1.0' // not needed but harmless
 `
      ) + `\n    // Force LocalBroadcastManager for broken third-party libs\n    configurations.all {\n        resolutionStrategy {\n            force 'androidx.localbroadcastmanager:localbroadcastmanager:1.1.0'\n        }\n    }\n`;
    }
    return config;
  });

// 2. Also add it directly to the Freshchat module (belt-and-suspenders approach)
const withFreshchatDep = config =>
  withAppBuildGradle(config, async config => {
    // This runs after autolinking, so the Freshchat module exists
    const contents = config.modResults.contents;
    if (contents.includes('react-native-freshchat-sdk')) {
      config.modResults.contents = contents.replace(
        /dependencies\s*{/,
        `dependencies {
 implementation("androidx.localbroadcastmanager:localbroadcastmanager:1.1.0") // Freshchat fix`
      );
    }
    return config;
  });

module.exports = config => withFreshchatDep(withProjectFix(config));