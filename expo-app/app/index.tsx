// Index.tsx (updated)
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppContainer from '@/src/components/AppContainer';
import CustomStatusBar from '@/src/components/CustomStatusBar';
import Splash from './onboarding/Splash';
import { createTables } from '@/src/database/chatSchema';
import { initI18n } from '@/src/localization/i18n';
import Colors from '@/src/utils/Colors';
import { useNotification } from '@/Context/NotificationContext';
import { showToast } from '@/src/components/GlobalToast';
import { useTranslation } from 'react-i18next';
import { I18nProvider } from '@/src/localization/I18nProvider';

export default function Index() {
  const { notification, expoPushToken, error } = useNotification();
  const { t } = useTranslation();

  useEffect(() => {
    const initialize = async () => {
      await initI18n();
      createTables();
    };

    initialize();
  }, []);

  useEffect(() => {
    if (expoPushToken) {
      console.log('🔔 Expo Push Token :', expoPushToken);
      AsyncStorage.setItem('ExpoPushToken', expoPushToken).catch((err) =>
        console.error('Failed to save Expo Push Token:', err)
      );
    }

    if (notification) {
      console.log('🔔 Notification received:', notification);
    }

    if (error) {
      showToast.error(t('enable_notifications'), t('enable_notifications_description'));
      console.error('❌ Notification Error:', error);
    }
  }, [expoPushToken, notification, error, t]);

  return (
    <I18nProvider>
      <AppContainer>
        <CustomStatusBar />
        <LinearGradient
          colors={[Colors.white, '#06361F']}
          locations={[0.65, 1]}
          style={styles.container}
        >
          <View style={styles.splashOverlay}>
            <Splash />
          </View>
        </LinearGradient>
      </AppContainer>
    </I18nProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
});