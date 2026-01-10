# SeaBuddy Mobile App

Social maritime platform built with React Native and Expo SDK 54.

## Prerequisites

- **Node.js**: 20.19.4 or higher
- **npm**: 10.x or higher
- **Expo CLI**: Latest version
- **EAS CLI**: Latest version (for builds)
- **iOS**: macOS with Xcode 15+ (for iOS development)
- **Android**: Android Studio with SDK 34+ (for Android development)

## Installation

```bash
npm install
```

## Development

### Start Development Server

```bash
# Local environment
npm start

# Staging environment
npm run start:staging

# Production environment
npm run start:prod
```

### Run on Devices/Emulators

```bash
# iOS Simulator
npm run ios:local

# Android Emulator
npm run android:local

# Specific environments
npm run ios:staging
npm run android:prod
```

## Building & Deployment

### Preview Builds (Testing)

```bash
# iOS Simulator + Android APK
eas build --platform all --profile preview

# Single platform
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

### Production Builds (Store Submission)

```bash
# Build and auto-submit to TestFlight + Play Store
eas build --platform all --profile production --auto-submit

# Build only (manual submit later)
eas build --platform all --profile production
```

### Manual Submission

```bash
eas submit --platform ios --latest
eas submit --platform android --latest
```

## CI/CD

Automatic builds and submissions are configured for the `feature/expo-migration` branch:

- **On Push**: Triggers production build with auto-submit
- **iOS**: Submits to TestFlight
- **Android**: Submits to Play Store Internal Testing

Monitor builds: https://expo.dev/accounts/seabuddyco1/projects/SeaBuddy/builds

## Environment Configuration

Create environment files in the `expo-app` directory:

- `.env` - Local development
- `.env.staging` - Staging environment
- `.env.prod` - Production environment

Required variables:
```
API_URL=your_api_url
SOCKET_URL=your_socket_url
```

## Project Structure

```
expo-app/
├── app/              # Expo Router screens
├── src/
│   ├── apis/         # API services
│   ├── components/   # Reusable components
│   ├── redux/        # State management
│   ├── utils/        # Utility functions
│   └── localization/ # i18n support
├── assets/           # Images, fonts, translations
└── Context/          # React contexts
```

## Key Commands

```bash
# Development
npm start                    # Start Metro bundler
npm run lint                 # Run ESLint

# Building
eas build --profile preview  # Test build
eas build --profile production --auto-submit  # Production + submit

# Credentials
eas credentials -p ios       # Manage iOS credentials
eas credentials -p android   # Manage Android credentials

# Build Management
eas build:list              # List recent builds
eas build:view <build-id>   # View build details
```

## Troubleshooting

### Clear Cache
```bash
npx expo start --clear
```

### Reset Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### iOS Pods Issues
```bash
cd ios && pod install && cd ..
```

## Support

- **EAS Dashboard**: https://expo.dev/accounts/seabuddyco1/projects/SeaBuddy
- **App Store Connect**: https://appstoreconnect.apple.com
- **Play Console**: https://play.google.com/console

