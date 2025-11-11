import AppContainer from '@/src/components/AppContainer';
import Splash from '@/src/screens/Splash';
import Colors from '@/src/utils/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useEffect } from 'react';
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { login } from './apis/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';


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

  useEffect(()=>{
    setTimeout(async()=>{
      // console.log("hello");
    let data  =await login("rishabhmaurya186@gmail.com","Seekware@123")
    AsyncStorage.setItem("userDetails", JSON.stringify(data?.data?.result));
    await AsyncStorage.setItem("authToken", data?.data?.result.authToken);
      
      router.replace("/home")
    },3000)

  })


  return (
    <AppContainer>
      <StatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "dark-content"}
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



// app/index.tsx or any screen
// import React, { useState, useCallback } from 'react';
// import { View, Text, Platform, TouchableOpacity } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import { useNavigation } from '@react-navigation/native';
// import ExitAppModal from '@/src/components/ExitAppModal';
// import { BackHandler } from 'react-native';

// export default function HomeScreen() {
//   const [exitModalVisible, setExitModalVisible] = useState(false);
//   const navigation = useNavigation();

//   const handleExit = () => {
//     setExitModalVisible(false);
//     if (Platform.OS === 'android') {
//       BackHandler.exitApp();
//     }
//   };

//   // Override the back button in header
//   useFocusEffect(
//     useCallback(() => {
//       const canGoBack = navigation.canGoBack();

//       navigation.setOptions({
//         headerLeft: canGoBack
//           ? undefined // Let default back button work
//           : () => (
//               <TouchableOpacity
//                 style={{ marginLeft: 16 }}
//                 onPress={() => setExitModalVisible(true)}
//               >
//                 <Text style={{ color: '#007AFF', fontSize: 17 }}>Exit</Text>
//               </TouchableOpacity>
//             ),
//       });

//       // Optional: Also handle hardware back
//       if (!canGoBack) {
//         const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
//           setExitModalVisible(true);
//           return true;
//         });
//         return () => backHandler.remove();
//       }
//     }, [navigation])
//   );

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text style={{ fontSize: 24, marginBottom: 20 }}>Home Screen</Text>
//       <Text>Press back in header to exit</Text>

//       <ExitAppModal
//         exitModalVisible={exitModalVisible}
//         setExitModalVisible={setExitModalVisible}
//         onExit={handleExit}
//       />
//     </View>
//   );
// }