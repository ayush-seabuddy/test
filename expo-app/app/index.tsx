import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';

import { useNotification } from '@/Context/NotificationContext';
import AppContainer from '@/src/components/AppContainer';
import CustomStatusBar from '@/src/components/CustomStatusBar';
import { showToast } from '@/src/components/GlobalToast';
import { createTables } from '@/src/database/chatSchema';
import { initI18n } from '@/src/localization/i18n';
import { I18nProvider } from '@/src/localization/I18nProvider';
import Colors from '@/src/utils/Colors';
import { useTranslation } from 'react-i18next';
import Splash from './onboarding/Splash';

import { setIsNotification, setPage, setParams } from '@/src/redux/notificationSlice';
import * as Notifications from 'expo-notifications';
import { useDispatch } from 'react-redux';

export default function Index() {
  const { notification, expoPushToken, error } = useNotification();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const handleNotificationTap = useCallback(
    async (data: any) => {
      if (!data?.page) return;
      dispatch(setIsNotification(true));

      const { id, page, type, androidUrl, iosUrl } = data;

      if (page === "UPDATE" && type === "UPDATE") {
        const url = Platform.OS === "ios" ? iosUrl : androidUrl;
        if (!url) return;

        try {
          await Linking.openURL(url);
        } catch {
          showToast.error("oops", t("somethingwentwrong"));
        }
        return;
      }

      try {
        switch (page) {
          case "GROUP_ACTIVITY":
            dispatch(setPage("/buddyupeventdescription"));
            dispatch(setParams({ eventId: id }));
            break;

          case "CONTENT":
            dispatch(setPage("/contentDetails/[contentId]"));
            dispatch(setParams({ contentId: id }));
            break;

          case "HANGOUT":
            dispatch(setPage("/singlepost"));
            dispatch(setParams({ postId: id }));
            break;

          case "HAPPINESS":
            dispatch(setPage("/monthlyhappinessindex"));
            break;

          case "POMS":
            dispatch(setPage("/monthlywellbeingpulse"));
            break;

          default:
            break;
        }
      } catch (err) {
        console.error("Navigation error:", err);
        showToast.error("oops", t("somethingwentwrong"));
      }
    },
    [t, dispatch]
  );

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

  // Notification tap and initial notification handler
  useEffect(() => {
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        handleNotificationTap(response.notification.request.content.data);
      });

    const checkInitialNotification = async () => {
      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastResponse) {
        setTimeout(() => {
          handleNotificationTap(lastResponse.notification.request.content.data);
        }, 1200);
      }
    };

    checkInitialNotification();

    return () => {
      responseListener.current?.remove();
    };
  }, [handleNotificationTap]);

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