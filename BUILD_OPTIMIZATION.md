# Build Optimization Guide

## Changes Made

### 1. Gradle Performance Improvements
- Increased JVM heap from 2GB to 4GB
- Enabled Gradle build cache
- Enabled parallel execution with 4 workers
- Enabled configuration cache

### 2. Architecture Optimization
- **Development builds**: Only arm64-v8a (90% of modern devices)
- **Production builds**: All architectures (armeabi-v7a, arm64-v8a, x86, x86_64)

This reduces CMake compilation from 4 architectures to 1 for dev builds.

### 3. Disabled Expensive Operations
- PNG crunching disabled for dev builds
- Lint checks disabled for faster iteration
- Unit test resources disabled during assembly

## Expected Build Time Improvements

| Build Type | Before | After | Improvement |
|------------|--------|-------|-------------|
| Development | ~15-20 min | ~5-8 min | 60-70% faster |
| Preview | ~15-20 min | ~8-12 min | 40-50% faster |
| Production | ~20-25 min | ~18-22 min | 10-15% faster |

## Usage

### Fast Development Builds
```bash
npm run android:development
# or
eas build --platform android --profile development --local
```

### Production Builds (All Architectures)
Override architecture setting:
```bash
cd android
./gradlew assembleRelease -PreactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
```

### Clean Build (if issues occur)
```bash
npm run android:clean
cd android && ./gradlew clean
```

## Additional Recommendations

### 1. Dependency Audit
Consider removing or replacing heavy dependencies:
- `posthog-react-native-session-replay` (very heavy)
- `react-native-video` (consider lighter alternatives)
- `react-native-pdf` (load on-demand)
- Multiple chart libraries (consolidate to one)

### 2. Code Splitting
Use dynamic imports for heavy features:
```typescript
const PDFViewer = lazy(() => import('./components/PDFViewer'));
const VideoPlayer = lazy(() => import('./components/VideoPlayer'));
```

### 3. Disable React Compiler for Dev
In `app.config.ts`, conditionally enable:
```typescript
experiments: {
  typedRoutes: true,
  reactCompiler: isProduction, // Only in production
}
```

### 4. CI/CD Optimization
- Cache `node_modules` and `android/.gradle`
- Skip quality checks for draft PRs
- Use matrix builds for parallel iOS/Android

## Troubleshooting

### Build fails with "Out of Memory"
Increase heap size in `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx6144m -XX:MaxMetaspaceSize=1536m
```

### Missing architecture for device
Build with specific architecture:
```bash
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

### Lint errors blocking build
Temporarily disable in `android/app/build.gradle`:
```gradle
lintOptions {
    abortOnError false
}
```
