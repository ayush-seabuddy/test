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

export default function Index() {
  const router = useRouter();
  useEffect(() => {
    const init = async () => {
      await initI18n();

      setTimeout(() => {
        router.replace("/auth/UpdateProfilePhoto");
      }, 2500);
    //    setTimeout(async()=>{
    //   // console.log("hello");
    // let data  =await login("rishabhmaurya186@gmail.com","Seekware@123")
    // AsyncStorage.setItem("userDetails", JSON.stringify(data?.data?.result));
    // await AsyncStorage.setItem("authToken", data?.data?.result.authToken);
      
    //   router.replace("/home");
    // },3000)
    };

    init();
  }, []);

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

