import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import i18next from "i18next";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { StyleSheet, View } from "react-native";

import AppContainer from "@/src/components/AppContainer";
import CustomStatusBar from "@/src/components/CustomStatusBar";
import { initI18n } from "@/src/localization/i18n";
import Colors from "@/src/utils/Colors";
import Splash from "./onboarding/Splash";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "@/src/apis/apiService";
import { createTables } from "@/src/database/chatSchema";

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    const init = async () => {
      await initI18n();

      setTimeout(() => {
        router.replace("/(bottomtab)/community/social");
      }, 2500);
      //    setTimeout(async()=>{
      //   // console.log("hello");
      // let data  =await login({email:"rishabhmaurya186@gmail.com",password:"Seekware@123"})
      // AsyncStorage.setItem("userDetails", JSON.stringify(data?.data));
      // await AsyncStorage.setItem("authToken", data?.data.authToken);

      //   router.replace("/home");
      // },3000)
    };

    init();
  }, []);

  useEffect(() => {
    createTables();
  })

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
  container: { flex: 1 },
  splashOverlay: { position: "absolute", zIndex: 5, top: 0 },
});

