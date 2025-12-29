import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar, StyleSheet, useColorScheme, Platform, Linking } from "react-native";
import { Provider } from "react-redux";
import { PaperProvider } from "react-native-paper";
import { I18nextProvider } from "react-i18next";
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";

import Colors from "@/src/utils/Colors";
import { store } from "@/src/redux/store";
import { initI18n } from "@/src/localization/i18n";
import i18n from "i18next";
import socketService from "@/src/utils/socketService";
import { NotificationProvider } from "@/Context/NotificationContext";
import { showToast } from "@/src/components/GlobalToast";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList:true,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = "background-notification-task";

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Background notification task error:", error);
    return Promise.resolve();
  }
  console.log("Background notification received:", data);
  return Promise.resolve();
});

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch((err) => {
  console.warn("Task already registered or error:", err);
});

// ─────────────────────────────────────────────
// Extract Custom Data from Expo's Wrapped Payload
// ─────────────────────────────────────────────
const extractCustomData = (rawData: any): any | null => {
  if (!rawData) return null;

  console.log("Raw notification data:", JSON.stringify(rawData, null, 2));

  let customData = null;

  // Case 1: Expo tool wraps in "body" or "dataString" as stringified JSON
  if (rawData.body && typeof rawData.body === "string") {
    try {
      const parsed = JSON.parse(rawData.body);
      if (parsed.data && typeof parsed.data === "object") {
        customData = parsed.data;
      }
    } catch (e) {
      console.log("Failed to parse rawData.body");
    }
  }

  if (!customData && rawData.dataString && typeof rawData.dataString === "string") {
    try {
      const parsed = JSON.parse(rawData.dataString);
      if (parsed.data && typeof parsed.data === "object") {
        customData = parsed.data;
      }
    } catch (e) {
      console.log("Failed to parse rawData.dataString");
    }
  }

  // Case 2: Direct object (rare, but possible in production)
  if (!customData && rawData.data && typeof rawData.data === "object") {
    customData = rawData.data;
  }

  // Case 3: Nested data.data (sometimes happens)
  if (!customData && rawData.data?.data) {
    try {
      customData =
        typeof rawData.data.data === "string"
          ? JSON.parse(rawData.data.data)
          : rawData.data.data;
    } catch (e) {}
  }

  if (!customData) {
    console.warn("Could not extract custom notification data");
    return null;
  }

  console.log("Successfully extracted custom data:", customData);
  return customData;
};

// ─────────────────────────────────────────────
// Handle Navigation from Notification Tap
// ─────────────────────────────────────────────
const handleNotificationTap = async (rawData: any) => {
  const customData = extractCustomData(rawData);
  if (!customData) return;

  const { id, page, type, androidUrl, iosUrl } = customData;

  console.log("Navigating to page:", page, { id, type });

  // Handle App Update Redirect
  if (page === "UPDATE" && type === "UPDATE") {
    const url = Platform.OS === "ios" ? iosUrl : androidUrl;
    if (url) {
      try {
        await Linking.openURL(url);
        console.log("Opened store URL:", url);
      } catch (err) {
        showToast?.error("Error", "Failed to open app store");
      }
    } else {
      showToast?.error("Oops", "No update URL provided");
    }
    return;
  }

  // Handle In-App Deep Linking
  try {
    switch (page) {
      case "GROUP_ACTIVITY":
        if (id) {
          router.push({
            pathname: "/buddyupeventdescription",
            params: { eventId: id },
          });
        }
        break;

      case "CONTENT":
        if (id) {
          router.push({
            pathname: "/contentDetails/[contentId]",
            params: { contentId: id },
          });
        }
        break;

      case "HANGOUT":
        if (id) {
          router.push({
            pathname: "/singlepost",
            params: { postId: id },
          });
        }
        break;

      case "HAPPINESS":
        router.push("/monthlyhappinessindex");
        break;

      case "POMS":
        router.push("/monthlywellbeingpulse");
        break;

      default:
        console.warn("Unknown notification page:", page);
        showToast.success("Notification", "Opened from notification");
        break;
    }
  } catch (error) {
    console.error("Navigation failed:", error);
    showToast?.error("Oops", "Could not open screen");
  }
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const responseListener = useRef<any>(null);

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
    if (!fontsLoaded) return;

    async function prepare() {
      try {
        await initI18n();
        socketService.initializeSocket();
      } catch (e) {
        console.warn("App init error:", e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [fontsLoaded]);

  // ─────────────────────────────────────────────
  // Listen for Notification Taps (All States)
  // ─────────────────────────────────────────────
  useEffect(() => {
    // User taps notification (foreground or background)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        handleNotificationTap(data);
      }
    );

    // App opened from killed state via notification
    const checkInitialNotification = async () => {
      try {
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastResponse) {
          console.log("App opened from killed state via notification");
          const data = lastResponse.notification.request.content.data;
          // Small delay to ensure router is ready
          setTimeout(() => handleNotificationTap(data), 1200);
        }
      } catch (error) {
        console.error("Error checking initial notification:", error);
      }
    };

    checkInitialNotification();

    return () => {
      responseListener.current?.remove();
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <NotificationProvider>
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