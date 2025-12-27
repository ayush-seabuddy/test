import { Stack, router, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar, StyleSheet, useColorScheme } from "react-native";
import { Provider } from "react-redux";
import { PaperProvider } from "react-native-paper";
import { I18nextProvider } from "react-i18next";
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import Colors from "@/src/utils/Colors";
import { store } from "@/src/redux/store";
import { initI18n } from "@/src/localization/i18n";
import i18n from "i18next";
import socketService from "@/src/utils/socketService";
import { NotificationProvider } from "@/Context/NotificationContext";

SplashScreen.preventAutoHideAsync();

/* ─────────────── Types ─────────────── */
type NotificationData = {
  screen?: string;
};

/* ───────── Foreground notifications (NO nav) ───────── */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner:true,
    shouldShowList:true,
  }),
});

/* ───────── Background task (NO nav) ───────── */
const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async () => {});
Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(() => {});

/* ───────────── Root Layout ───────────── */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const rootNavigationState = useRootNavigationState();

  const hasHandledKilled = useRef(false);
  const hasNavigated = useRef(false);

  const [pendingScreen, setPendingScreen] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Whyte-Inktrap-Regular": require("../assets/fonts/Whyte-Inktrap-Regular.otf"),
    "WhyteInktrap-Bold": require("../assets/fonts/WhyteInktrap-Bold.ttf"),
    "WhyteInktrap-Heavy": require("../assets/fonts/WhyteInktrap-Heavy.ttf"),
    "WhyteInktrap-Medium": require("../assets/fonts/WhyteInktrap-Medium.ttf"),
  });

  /* ───────── App init ───────── */
  useEffect(() => {
    if (!fontsLoaded) return;

    (async () => {
      try {
        await initI18n();
        socketService.initializeSocket();
      } finally {
        await SplashScreen.hideAsync();
      }
    })();
  }, [fontsLoaded]);

  /* ───── Notification TAP (store intent only) ───── */
  useEffect(() => {
    const sub =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data =
          response.notification.request.content.data as NotificationData;

        if (typeof data?.screen === "string") {
          setPendingScreen(data.screen);
        }
      });

    if (!hasHandledKilled.current) {
      const response = Notifications.getLastNotificationResponse();
      if (response) {
        hasHandledKilled.current = true;

        const data =
          response.notification.request.content.data as NotificationData;

        if (typeof data?.screen === "string") {
          setPendingScreen(data.screen);
        }
      }
    }

    return () => sub.remove();
  }, []);

  /* ───── Navigate ONCE when router is ready ───── */
  useEffect(() => {
    if (!rootNavigationState?.key) return;
    if (!pendingScreen) return;
    if (hasNavigated.current) return;

    hasNavigated.current = true;   // 🔒 LOCK FIRST
    setPendingScreen(null);        // 🔒 CLEAR STATE FIRST

    if (pendingScreen === "monthlyhappinessindex") {
      router.replace("/monthlyhappinessindex");
    }
  }, [rootNavigationState, pendingScreen]);

  if (!fontsLoaded) return null;

  return (
    <NotificationProvider>
      <Provider store={store}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.container}>
            <StatusBar
              barStyle={
                colorScheme === "dark" ? "light-content" : "dark-content"
              }
            />
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
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
