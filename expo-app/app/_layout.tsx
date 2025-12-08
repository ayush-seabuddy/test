import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { Platform, StatusBar, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Provider } from "react-redux";

import { initI18n } from "@/src/localization/i18n";
import { store } from "@/src/redux/store";
import Colors from "@/src/utils/Colors";
import socketService from "@/src/utils/socketService";
import i18n from "i18next";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
      try {
        await initI18n();                    // ← only initializes i18n
        socketService.initializeSocket();    // ← connect socket
      } catch (e) {
        console.warn("Init failed:", e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    if (fontsLoaded) {
      prepare();
    }
  }, [fontsLoaded]);

  // While loading → show native splash screen
  if (!fontsLoaded) return null;

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
          <StatusBar barStyle="dark-content" backgroundColor="#000" />
          <KeyboardAwareScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 20,
            }}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            extraHeight={20}
            extraScrollHeight={Platform.OS === "android" ? 20 : 0}
            keyboardOpeningTime={250}
            showsVerticalScrollIndicator={false}
          >
            <PaperProvider>
              <I18nextProvider i18n={i18n}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <Slot />
                  <Toast />
                </GestureHandlerRootView>
              </I18nextProvider>
            </PaperProvider>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white ?? "#fff",
  },
});