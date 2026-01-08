import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as TaskManager from "expo-task-manager";
import { useCallback, useEffect, useRef } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import { Linking, Platform, StatusBar, StyleSheet, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";

import { NotificationProvider } from "@/Context/NotificationContext";
import { showToast } from "@/src/components/GlobalToast";
import { initI18n } from "@/src/localization/i18n";
import { store } from "@/src/redux/store";
import Colors from "@/src/utils/Colors";
import socketService from "@/src/utils/socketService";
import i18n from "i18next";
import { Appearance } from 'react-native';

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

const BACKGROUND_NOTIFICATION_TASK = "background-notification-task";

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Background notification error:", error);
    return;
  }
  console.log("Background notification received:", data);
});

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(() => { });

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const responseListener = useRef<Notifications.Subscription | null>(null);
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

  const handleNotificationTap = useCallback(
    async (data: any) => {
      if (!data?.page) return;

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
            id && router.push({ pathname: "/buddyupeventdescription", params: { eventId: id } });
            break;

          case "CONTENT":
            id && router.push({ pathname: "/contentDetails/[contentId]", params: { contentId: id } });
            break;

          case "HANGOUT":
            id && router.push({ pathname: "/singlepost", params: { postId: id } });
            break;

          case "HAPPINESS":
            router.push("/monthlyhappinessindex");
            break;

          case "POMS":
            router.push("/monthlywellbeingpulse");
            break;
        }
      } catch (err) {
        console.error("Navigation error:", err);
        showToast.error("oops", t("somethingwentwrong"));
      }
    },
    [t]
  );

  useEffect(() => {
    if (!fontsLoaded) return;

    const initApp = async () => {
      try {
        await initI18n();
        socketService.initializeSocket();
      } catch (e) {
        console.warn("Init error:", e);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    initApp();
  }, [fontsLoaded]);

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