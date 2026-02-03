export default ({ config }) => {
  const env = process.env.APP_ENV ?? 'local';
  const isProduction = env === 'production';
  const isStaging = env === 'staging';

  return {
    ...config,

    splash: {
      ...config.splash,
      backgroundColor: '#ffffff',
    },

    updates: {
      enabled: isProduction || isStaging,
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/130f7684-8e60-49eb-8e4c-746ee8b1ff0b',
    },
    ios: {
      ...config.ios,
      infoPlist: {
        ...config.ios?.infoPlist,
        NSCameraUsageDescription:
          'SeaBuddy needs access to your camera to upload photos and videos.',
        NSPhotoLibraryUsageDescription:
          'SeaBuddy needs access to your photo library to share photos.',
        NSMicrophoneUsageDescription:
          'SeaBuddy needs access to your microphone to record audio and videos.',
        NSLocationWhenInUseUsageDescription:
          'SeaBuddy uses your location to enhance your experience.',
      },
    },

    plugins: [
      '@react-native-community/datetimepicker',
      'expo-asset',
      'expo-router',
      'expo-localization',
      'expo-font',

      [
        'expo-video',
        {
          supportsBackgroundPlayback: true,
          supportsPictureInPicture: true,
        },
      ],

      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          defaultChannel: 'default',
          enableBackgroundRemoteNotifications: false,
        },
      ],

      [
        'expo-screen-orientation',
        {
          supportedOrientations: ['portrait', 'landscape'],
        },
      ],

      [
        'expo-build-properties',
        {
          android: {
            minSdkVersion: 26,
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            enableMinifyInReleaseBuilds: true,
          },
          ios: {
            deploymentTarget: '15.1',
            useFrameworks: 'static',
            flipper: false,
          },
        },
      ],
      [
        'expo-navigation-bar',
        {
          backgroundColor: '#000000',
          barStyle: 'light',
          borderColor: '#1f2937',
          visibility: 'visible',
          behavior: 'inset-swipe',
          position: 'relative',
        },
      ],
      [
        'expo-sqlite',
        {
          enableFTS: true,
          useSQLCipher: true,
        },
      ],

      [
        '@sentry/react-native/expo',
        {
          organization: process.env.EXPO_PUBLIC_SENTRY_ORG,
          project: process.env.EXPO_PUBLIC_SENTRY_PROJECT,
        },
      ],
    ],

    extra: {
      ...config.extra,
      env,
    },
  };
};
