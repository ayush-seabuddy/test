import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import * as Updates from 'expo-updates';

type Props = {
  children: ReactNode;
};

export default function OTAUpdatePopup({ children }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusText, setStatusText] = useState('Checking for updates…');

  const progress = useRef(new Animated.Value(0)).current;
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (__DEV__) {
      console.log('[OTA] Skipped (development mode)');
      return;
    }

    if (!Updates.isEnabled) {
      console.log('[OTA] Skipped (updates disabled)');
      return;
    }

    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    checkForOTA();
  }, []);

  const animateProgress = (toValue: number, duration: number) => {
    Animated.timing(progress, {
      toValue,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const checkForOTA = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (!update.isAvailable) {
        console.log('[OTA] No update available');
        return;
      }

      console.log('[OTA] Update available');

      setIsUpdating(true);
      setStatusText('Updating app…');

      // Fake progress → 90%
      animateProgress(90, 4000);

      await Updates.fetchUpdateAsync();

      setStatusText('Finalizing update…');

      // Complete progress → 100%
      animateProgress(100, 500);

      // Smooth UX delay before reload
      setTimeout(() => {
        Updates.reloadAsync();
      }, 300);
    } catch (error) {
      console.error('[OTA] Update failed:', error);
      setIsUpdating(false);
    }
  };

  const widthInterpolated = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <>
      {children}

      <Modal visible={isUpdating} transparent animationType='fade'>
        <View style={styles.overlay}>
          <Text style={styles.title}>Updating App</Text>
          <Text style={styles.subtitle}>
            Please wait while we improve your experience
          </Text>

          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: widthInterpolated }]}
            />
          </View>

          <Text style={styles.progressText}>{statusText}</Text>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 12,
  },
});
