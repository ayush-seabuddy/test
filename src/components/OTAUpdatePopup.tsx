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
import { Logger } from '../utils/logger';

type Props = {
  children: ReactNode;
};

export default function OTAUpdatePopup({ children }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusText, setStatusText] = useState('Checking for updates…');

  const progress = useRef(new Animated.Value(0)).current;
  const hasCheckedRef = useRef(false);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    checkForOTA();
  }, []);

  const animateTo = (toValue: number, duration: number) => {
    return Animated.timing(progress, {
      toValue,
      duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    });
  };

  const checkForOTA = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (!update.isAvailable) return;

      startTimeRef.current = Date.now();
      setIsUpdating(true);
      setStatusText('Downloading update…');

      // Stage 1: slow start
      Animated.sequence([
        animateTo(60, 3500),
        animateTo(90, 3000),
      ]).start();

      await Updates.fetchUpdateAsync();

      setStatusText('Finalizing update…');

      // Ensure loader shows at least 6 seconds
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 6000 - elapsed);

      setTimeout(() => {
        Animated.timing(progress, {
          toValue: 100,
          duration: 1200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start(() => {
          setTimeout(() => Updates.reloadAsync(), 400);
        });
      }, remaining);
    } catch (error) {
      Logger.error('[OTA] Update failed:', {Error:String(error)});
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

      <Modal visible={isUpdating} animationType="fade">
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
