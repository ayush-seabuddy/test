import { config } from 'dotenv';
import { resolve } from 'path';

export default ({ config: appConfig }) => {
  const env = process.env.APP_ENV ?? 'local';
  const isProduction = env === 'production';
  const isStaging = env === 'staging';

  // Load environment-specific .env file BEFORE accessing any variables
  if (isProduction) {
    config({ path: resolve(__dirname, '.env.prod'), override: true });
  } else if (isStaging) {
    config({ path: resolve(__dirname, '.env.staging'), override: true });
  } else {
    config({ path: resolve(__dirname, '.env'), override: true });
  }

  // Read env variables after loading specific file
  const API_URL = process.env.API_URL;
  const SOCKET_URL = process.env.SOCKET_URL;

  return {
    ...appConfig,
    extra: {
      ...appConfig.extra,
      env,
      API_URL,
      SOCKET_URL,
      eas: appConfig.extra?.eas,
    },
    // Override splash screen based on environment
    splash: {
      ...appConfig.splash,
      backgroundColor: isProduction ? '#ffffff' : isStaging ? '#FFF3E0' : '#E3F2FD',
    },
    // Optimize updates based on environment
    updates: {
      ...appConfig.updates,
      enabled: isProduction || isStaging,
      checkAutomatically: isProduction ? 'ON_LOAD' : 'ON_ERROR_RECOVERY',
    },
    // Environment-specific iOS configuration
    ios: {
      ...appConfig.ios,
      // Only increment build number in production/staging
      ...(isProduction || isStaging ? { buildNumber: String(Date.now()) } : {}),
    },
    // Environment-specific Android configuration
    android: {
      ...appConfig.android,
      // Only increment version code in production/staging
      ...(isProduction || isStaging ? { versionCode: parseInt(Date.now().toString().slice(-8)) } : {}),
    },
  };
};
