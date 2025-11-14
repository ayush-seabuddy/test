import Colors from "@/src/utils/Colors";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { StatusBar, StyleSheet, Text } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import KeyboardWrapper from "../src/components/KeyboardWrapper";
import { initI18n } from "@/src/localization/i18n";
import i18n from "i18next";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

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
    async function prepare() {
      await initI18n();
      setAppReady(true);
      SplashScreen.hideAsync();
    }

    if (fontsLoaded) prepare();
  }, [fontsLoaded]);

  if (!appReady) return null;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" backgroundColor="#000" />
          <PaperProvider>
            <I18nextProvider i18n={i18n}>
              <Slot />
            </I18nextProvider>
          </PaperProvider>
        <Toast />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors?.white || "#fff",
  },
});
