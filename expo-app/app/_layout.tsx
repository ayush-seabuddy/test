import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, router, usePathname, useSegments } from "expo-router"; // ← added usePathname + useSegments
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import { Linking, Platform, StatusBar, StyleSheet, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";
import { NotificationProvider, useNotification } from "@/Context/NotificationContext";
import { showToast } from "@/src/components/GlobalToast";
import { initI18n } from "@/src/localization/i18n";
import { store } from "@/src/redux/store";
import Colors from "@/src/utils/Colors";
import socketService from "@/src/utils/socketService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as TaskManager from 'expo-task-manager';
import i18n from "i18next";
import { Appearance } from 'react-native';
import * as Clarity from '@microsoft/react-native-clarity';

Appearance.setColorScheme('light');

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = 'background-notification-task';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background notification error:', error);
    return;
  }
  console.log('Background notification received:', data);
});

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(() => { });

const NotificationHandler = () => {
  const { notification, expoPushToken, error } = useNotification();
  const { t } = useTranslation();
  const lastHandledId = useRef<string | null>(null);

  useEffect(() => {
    if (expoPushToken) {
      console.log('🔔 Expo Push Token:', expoPushToken);
      AsyncStorage.setItem('ExpoPushToken', expoPushToken).catch(console.error);
    }
  }, [expoPushToken]);

  const handleNotificationTap = useCallback(
    async (response: Notifications.NotificationResponse) => {
      const notificationId = response.notification.request.identifier;
      if (lastHandledId.current === notificationId) return;
      lastHandledId.current = notificationId;

      const data = response.notification.request.content.data;
      if (!data?.page) return;

      const { id, page, type, androidUrl, iosUrl } = data;

      try {
        if (page === 'UPDATE' && type === 'UPDATE') {
          const url = Platform.OS === 'ios' ? iosUrl : androidUrl;
          if (url && typeof url === 'string') await Linking.openURL(url);
          return;
        }

        const navigate = router.canGoBack() ? router.push.bind(router) : router.replace.bind(router);

        switch (page) {
          case 'CHAT':
            if (id && typeof id === 'string') {
              navigate({ pathname: '/chatroom/[chatRoomId]', params: { chatRoomId: id } });
            }
            break;

          case 'GROUP_ACTIVITY':
            if (id && typeof id === 'string') {
              navigate({ pathname: '/buddyupeventdescription', params: { eventId: id } });
            }
            break;

          case 'CONTENT':
            if (id && typeof id === 'string') {
              navigate({ pathname: '/contentDetails/[contentId]', params: { contentId: id } });
            }
            break;

          case 'HANGOUT':
            if (id && typeof id === 'string') {
              navigate({ pathname: '/singlepost', params: { postId: id } });
            }
            break;

          case 'HAPPINESS':
            navigate('/monthlyhappinessindex');
            break;

          case 'POMS':
            navigate('/monthlywellbeingpulse');
            break;
        }
      } catch (err) {
        console.error('Navigation error:', err);
        showToast.error('oops', t('somethingwentwrong'));
      }
    },
    [t]
  );

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationTap);
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) handleNotificationTap(response);
    });
    return () => subscription.remove();
  }, [handleNotificationTap]);

  return null;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Whyte-Inktrap-Regular": require("../assets/fonts/Whyte-Inktrap-Regular.otf"),
    "WhyteInktrap-Bold": require("../assets/fonts/WhyteInktrap-Bold.ttf"),
    "WhyteInktrap-Heavy": require("../assets/fonts/WhyteInktrap-Heavy.ttf"),
    "WhyteInktrap-Medium": require("../assets/fonts/WhyteInktrap-Medium.ttf"),
  });

  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    // Build a clean screen name (you can customize this format)
    let screenName = '/';

    if (segments.length > 0) {
      // For tab + nested routes → e.g. "(bottomtab)/profile/settings" → "Profile/Settings"
      screenName = segments
        .filter(s => !s.startsWith('('))           // remove group names
        .map(s => s.charAt(0).toUpperCase() + s.slice(1)) // capitalize
        .join(' / ') || 'Home';
    }

    if (pathname === '/') screenName = 'Home';

    try {
      Clarity.setCurrentScreenName(screenName);
      if (__DEV__) {
        console.log(`[Clarity] Screen changed → ${screenName}`);
      }
    } catch (err) {
      console.warn('[Clarity] setCurrentScreenName failed:', err);
    }
  }, [pathname, segments]);

  useEffect(() => {
    if (!fontsLoaded) return;

    const initApp = async () => {
      try {
        await initI18n();
        socketService.initializeSocket();
        Clarity.initialize('t9oq6u2hhw', {
          logLevel: __DEV__ ? Clarity.LogLevel.Verbose : Clarity.LogLevel.None,
        });
        if (__DEV__) {
          console.log('[Clarity] Initialized successfully');
        }
      } catch (e) {
        console.warn("Init error:", e);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    initApp();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <NotificationProvider>
      <NotificationHandler />
      <Provider store={store}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <StatusBar
              barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
              backgroundColor="#000"
            />
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
              <PaperProvider>
                <I18nextProvider i18n={i18n}>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="(bottomtab)" />
                    </Stack>
                    <Toast />
                  </GestureHandlerRootView>
                </I18nextProvider>
              </PaperProvider>
            </ThemeProvider>
          </SafeAreaView>
        </SafeAreaProvider>
      </Provider>
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white ?? "#fff",
  },
});