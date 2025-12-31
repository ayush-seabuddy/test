import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useEffect, useRef, useCallback, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  Platform,
} from "react-native";
import { Provider } from "react-redux";
import { PaperProvider } from "react-native-paper";
import { I18nextProvider } from "react-i18next";
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as Application from "expo-application";

import Colors from "@/src/utils/Colors";
import { store } from "@/src/redux/store";
import { initI18n } from "@/src/localization/i18n";
import i18n from "i18next";
import socketService from "@/src/utils/socketService";
import { NotificationProvider } from "@/Context/NotificationContext";
import { showToast } from "@/src/components/GlobalToast";
import { getapplastversion } from "@/src/apis/apiService";
import VersionCheckModal from "@/src/components/Modals/VersionCheckModal";

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

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK).catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const [isVersionModalVisible, setIsVersionModalVisible] = useState(false);
  const [versionInfo, setVersionInfo] = useState<any>(null);

  const compareVersions = (current: string, latest: string): boolean => {
    const normalize = (v: string) => v.split(".").map(Number);
    const currentParts = normalize(current);
    const latestParts = normalize(latest);

    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const c = currentParts[i] ?? 0;
      const l = latestParts[i] ?? 0;
      if (c < l) return true;
      if (c > l) return false;
    }
    return false;
  };

  const checkAppVersion = async () => {
    try {
      const currentVersion = Application.nativeApplicationVersion || "1.0.0";
      console.log("Current App Version:", currentVersion);

      const apiResponse = await getapplastversion();
      if (apiResponse.success && apiResponse.status === 200) {
        const platformKey = Platform.OS === "ios" ? "ios" : "android";
        const platformData = apiResponse.data?.[platformKey];

        if (!platformData) return;
        const { lastVersion, isPopUp, isRequired, responseMessage, url } = platformData;

        console.log("Latest Version:", lastVersion);

        if (isPopUp && compareVersions(currentVersion, lastVersion)) {
          setVersionInfo({
            isRequired,
            responseMessage: responseMessage || "A new version is available!",
            url:
              url ||
              (Platform.OS === "ios"
                ? "https://apps.apple.com/in/app/seabuddy/id6744636314"
                : "https://play.google.com/store/apps/details?id=co.seabuddy.platform"),
          });
          setIsVersionModalVisible(true);
        }
      }
    } catch (error) {
      console.error("Error checking app version:", error);
    }
  };

  useEffect(() => {
    checkAppVersion();
  }, []);

  const handleUpdate = () => {
    setIsVersionModalVisible(false);
  };

  const handleCloseVersionModal = () => {
    if (!versionInfo?.isRequired) {
      setIsVersionModalVisible(false);
    }
  };

  const handleNotificationTap = useCallback(async (data: any) => {
    // ... (your existing notification handling logic remains unchanged)
  }, []);

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
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        handleNotificationTap(response.notification.request.content.data);
      }
    );

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

            <VersionCheckModal
              visible={isVersionModalVisible}
              versionInfo={versionInfo}
              onUpdate={handleUpdate}
              onClose={handleCloseVersionModal}
            />
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