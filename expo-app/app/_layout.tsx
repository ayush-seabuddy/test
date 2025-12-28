import { Slot, Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect, useRef } from "react";
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

// ─────────────────────────────────────────────
// Notification handler (FOREGROUND)
// ─────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ─────────────────────────────────────────────
// Background notification task
// ─────────────────────────────────────────────
const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  async ({ data, error }) => {
    if (error) {
      console.error("❌ Background notification error:", error);
      return;
    }

    console.log("✅ Background notification received:", data);
  }
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(() => {
  // Avoid crash if already registered
});

// ─────────────────────────────────────────────
// Helper function to handle notification navigation
// ─────────────────────────────────────────────
const handleNotificationNavigation = (data: any) => {
  if (!data?.screen) return;

  console.log("🚀 Navigating to:", data.screen);

  switch (data.screen) {
    case 'monthlyhappinessindex':
      router.push('/monthlyhappinessindex');
      break;
    // Add more screens here as needed
    // case 'profile':
    //   router.push('/profile');
    //   break;
    // case 'settings':
    //   router.push('/settings');
    //   break;
    default:
      console.log("⚠️ Unknown screen:", data.screen);
  }
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Whyte-Inktrap-Regular": require("../assets/fonts/Whyte-Inktrap-Regular.otf"),
    "WhyteInktrap-Bold": require("../assets/fonts/WhyteInktrap-Bold.ttf"),
    "WhyteInktrap-Heavy": require("../assets/fonts/WhyteInktrap-Heavy.ttf"),
    "WhyteInktrap-Medium": require("../assets/fonts/WhyteInktrap-Medium.ttf"),
  });

  useEffect(() => {
    async function prepareApp() {
      try {
        await initI18n();
        socketService.initializeSocket();
      } catch (error) {
        console.warn("❌ App init failed:", error);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    if (fontsLoaded) {
      prepareApp();
    }
  }, [fontsLoaded]);

  // ─────────────────────────────────────────────
  // Setup notification listeners (ALL APP STATES)
  // ─────────────────────────────────────────────
  useEffect(() => {
    // 1. FOREGROUND: Notification received while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📩 Foreground notification:", notification);
        // Optionally handle auto-navigation or custom UI here
      }
    );

    // 2. FOREGROUND + BACKGROUND: User taps notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("👆 Notification tapped:", response);
        const data = response.notification.request.content.data;
        handleNotificationNavigation(data);
      }
    );

    // 3. KILLED STATE: App opened by tapping notification
    const checkLastNotification = async () => {
      try {
        const response = await Notifications.getLastNotificationResponseAsync();
        
        if (response) {
          console.log("📱 App opened from killed state");
          const data = response.notification.request.content.data;
          
          // Add delay to ensure app is fully initialized
          setTimeout(() => {
            handleNotificationNavigation(data);
          }, 1500);
        }
      } catch (error) {
        console.error("❌ Error checking last notification:", error);
      }
    };

    checkLastNotification();

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <NotificationProvider>
      <Provider store={store}>
        <SafeAreaProvider>
          <SafeAreaView
            style={styles.container}
            edges={["top", "left", "right"]}
          >
            <StatusBar
              barStyle={
                colorScheme === "dark" ? "light-content" : "dark-content"
              }
              backgroundColor="#000"
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