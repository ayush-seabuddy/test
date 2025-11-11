import { useEffect } from "react";
import { StatusBar, Platform, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { I18nextProvider } from "react-i18next";
import { useRouter } from "expo-router";
import i18next from "i18next";

import AppContainer from "@/src/components/AppContainer";
import Splash from "@/src/screens/Splash";
import Colors from "@/src/utils/Colors";
import { initI18n } from "@/src/localization/i18n";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      await initI18n();

      setTimeout(() => {
        router.replace("/auth/Signup");
      }, 2500);
    };

    init();
  }, []);

  return (
    <I18nextProvider i18n={i18next}>
      <AppContainer>
        <StatusBar
          barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
          backgroundColor={Colors.white}
        />

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
  container: { flex: 1 },
  splashOverlay: { position: "absolute", zIndex: 5, top: 0 },
});

