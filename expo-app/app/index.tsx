import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import i18next from "i18next";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { StyleSheet, View } from "react-native";

import AppContainer from "@/src/components/AppContainer";
import CustomStatusBar from "@/src/components/CustomStatusBar";
import { createTables } from "@/src/database/chatSchema";
import { initI18n } from "@/src/localization/i18n";
import Colors from "@/src/utils/Colors";
import Splash from "./onboarding/Splash";
import { useNotification } from "@/Context/NotificationContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();

  const { notification, expoPushToken, error } = useNotification();

  useEffect(() => {
    const init = async () => {
      await initI18n();

      setTimeout(() => {
        router.replace("/auth/Login");
      }, 2500);
    };

    init();
  }, []);

  useEffect(() => {
    createTables();
  }, []);

  useEffect(() => {
    console.log("📲 App Opened");
    console.log("🔑 Expo Push Token:", expoPushToken);

    if (expoPushToken) {
      const saveToken = async () => {
        try {
          await AsyncStorage.setItem("ExpoPushToken", expoPushToken);
          console.log("✅ Expo Push Token saved to AsyncStorage");
        } catch (err) {
          console.error("❌ Failed to save push token", err);
        }
      };

      saveToken();
    }

    if (notification) {
      console.log(
        "🔔 Last Notification:",
        JSON.stringify(notification, null, 2)
      );

      console.log(
        "📦 Notification Data:",
        JSON.stringify(notification.request.content.data, null, 2)
      );
    }

    if (error) {
      console.error("❌ Notification Error:", error);
    }
  }, [expoPushToken, notification, error]);

  return (
    <I18nextProvider i18n={i18next}>
      <AppContainer>
        <CustomStatusBar />
        <LinearGradient
          colors={[Colors.white, "#06361F"]}
          style={styles.container}
          locations={[0.65, 1]}
        >
          <View style={styles.splashOverlay}>
            <Splash />
          </View>
        </LinearGradient>
      </AppContainer>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashOverlay: {
    position: "absolute",
    zIndex: 5,
    top: 0,
  },
});
