import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import AppContainer from "../components/AppContainer";
import Splash from "../screens/Splash";
import Colors from "../utils/Colors";


export default function Index() {
  const router = useRouter()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    splashOverlay: {
      position: "absolute",
      zIndex: 5,
      top: 0,
    },
    logoView: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
    },
    logoImage: {
      width: 55,
      height: 55,
      resizeMode: "contain",
    },
    title: {
      width: 200,
      height: 100,
      resizeMode: "contain",
    },
  });

  // useEffect(()=>{
  //   setTimeout(()=>{
  //     router.push("/auth/Login")
  //   },3000)

  // })


  return (
    <AppContainer>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <LinearGradient
        colors={[Colors.white, "#06361F"]} // White and yellow colors
        style={styles.container}
        locations={[0.65, 1]} // 65% white, 35% yellow
      >
        <View style={styles.splashOverlay}>
          <Splash />
        </View>

      </LinearGradient>
    </AppContainer>
  );
}