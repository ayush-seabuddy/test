import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { StyleSheet, View } from "react-native";

import AppContainer from "@/src/components/AppContainer";
import CustomStatusBar from "@/src/components/CustomStatusBar";
import { createTables } from "@/src/database/chatSchema";
import { initI18n } from "@/src/localization/i18n";
import Colors from "@/src/utils/Colors";
import i18next from "i18next";
import Splash from "./onboarding/Splash";

export default function Index() {
  /** ---------------- INIT ---------------- */
  useEffect(() => {
    const initialize = async () => {
      await initI18n();
      createTables();
    };
    initialize();
  }, []);

  /** ---------------- UI ---------------- */
  return (
    <I18nextProvider i18n={i18next}>
      <AppContainer>
        <CustomStatusBar />
        <LinearGradient
          colors={[Colors.white, "#06361F"]}
          locations={[0.65, 1]}
          style={styles.container}
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
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
});
