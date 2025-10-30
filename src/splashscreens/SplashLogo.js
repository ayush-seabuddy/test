import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import AppContainer from "../container/AppContainer";
import Colors from "../colors/Colors";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import { ImagesAssets } from "../assets/ImagesAssets";
import Splash from "./Splash";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import VersionCheck from "react-native-version-check";
import { apiCallWithToken, apiServerUrl } from "../Api";
import axios from "axios";
import { getFcmToken } from "../PushNotification/NotificationListner";

const SplashLogo = (props) => {
  const navigation = useNavigation(); // Access the navigation prop

  const getAsyncData = async () => {
    const value = await AsyncStorage.getItem("completedOnboarding");
    return value;
  };

  // Function to check the value and navigate based on the result
  const checkIfVisited = async () => {
    const isVisitedTutorialScreen = await getAsyncData();


    // Check the value and navigate accordingly
    if (isVisitedTutorialScreen === "true") {
      // navigation.replace("UploadPhoto");  // Navigate to HomeScreen if the user has completed the tutorial
      props.navigation.replace("AppNav", { screen: "UploadPhoto" });
    } else {
      props.navigation.replace("AppNav", { screen: "IntroScreen1" }); // Otherwise, navigate to TutorialScreen
    }
  };

  const [profiledetails, setProfiledetails] = useState(null);

  // const ViewProfiledetails = async () => {
  //   try {
  //     const dbResult = await AsyncStorage.getItem("userDetails");
  //     if (!dbResult) return null;

  //     const userDetails = JSON.parse(dbResult);
  //     console.log("Retrieved user details:", userDetails);

  //     const response = await apiCallWithToken(
  //       `${apiServerUrl}/user/viewUserProfile`,
  //       "GET",
  //       null,
  //       userDetails.authToken
  //     );

  //     console.log("API Response:", response);

  //     if (response.responseCode === 200) {
  //       setProfiledetails(response.result);
  //       return response.result; // Return the profile details
  //     }

  //     return null;
  //   } catch (error) {
  //     console.error("Error fetching profile details:", error);
  //     return null;
  //   }
  // };
  // const [isBoarded,setIsBoarded] = useState(false);
  const ViewProfiledetails = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) return null;

      const userDetails = JSON.parse(dbResult);

      const fetchWithTimeout = (url, method, body, token, timeout = 3000) => {
        return Promise.race([
          apiCallWithToken(url, method, body, token), // API Call
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), timeout)
          ),
        ]);
      };

      const currentVersion = await VersionCheck.getCurrentVersion();

      const requestUrl = `${apiServerUrl}/user/viewUserProfile?version=${currentVersion}&os=${Platform.OS}`;
      console.log("Request URL:", requestUrl);

      const response = await fetchWithTimeout(
        requestUrl,
        "GET",
        null,
        userDetails.authToken,
        3000
      );

      if (response.responseCode === 200) {
        await AsyncStorage.setItem("lastDate", response?.result?.personalityRequired);
        console.log('response?.result?.personalityRequire: ', (response?.result?.personalityRequired));


        setProfiledetails(response.result);
        if (response?.result?.deviceToken) {
          try {
            let checkToken = await AsyncStorage.getItem("fmcToken");
            // console.log("checkToken: ", checkToken);
            if (!checkToken) {
              await getFcmToken();
              checkToken = await AsyncStorage.getItem("fmcToken");
            }

            axios.put(`${apiServerUrl}/user/updateDeviceToken`, { deviceToken: checkToken }, {
              headers: {
                authToken: userDetails.authToken,
                "Content-Type": "application/json",
              },
            });

          } catch (error) {

          }

        }



        return response.result;
      }

      return null;
    } catch (error) {
      console.error("Error fetching profile details:", error);
      return null;
    }
  };

  const ViewUserTest = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) return null;
      console.log("dbResult: ", dbResult);

      const userDetails = JSON.parse(dbResult);

      const fetchWithTimeout = (url, method, body, token, timeout = 3000) => {
        return Promise.race([
          apiCallWithToken(url, method, body, token), // API Call
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), timeout)
          ),
        ]);
      };

      const requestUrl = `${apiServerUrl}/user/viewUserTest`;
      console.log("requestUrl: ", requestUrl);

      const response = await fetchWithTimeout(
        requestUrl,
        "GET",
        null,
        userDetails.authToken,
        3000
      );

      console.log("response: ", response);
      if (response.responseCode === 200) {
        return response.result;
      }

      return null;
    } catch (error) {
      console.error("Error fetching profile details:", error);
      return null;
    }
  };

  useEffect(() => {
    const getTokenAndProfileStatus = async () => {
      // Fetch the stored user data from AsyncStorage
      const dbResult = await AsyncStorage.getItem("userDetails");

      if (dbResult) {
        const userDetails = JSON.parse(dbResult);
        const isProfileCompleted = userDetails.isProfileCompleted;
        const isPersonalityTestCompleted =
          userDetails.isPersonalityTestCompleted;
        const token = userDetails.authToken;

        // If Token exists and profile is completed, navigate to MBTI
        if (token) {
          const profileData = await ViewProfiledetails();
          const testArray = await ViewUserTest()
          let isBoarded = false
          if (isProfileCompleted !== true) {
            props.navigation.replace("AppNav", { screen: "IntroScreen1" });
          }
          if (testArray && testArray[0] && testArray[0].open && testArray[0].isSplash) {
            props.navigation.replace("AppNav", {
              screen: "HappinessIndex",
              params: { showPopup: testArray[0].isRequires },
            });
            return
          }
          if (testArray && testArray[1] && testArray[1].open && testArray[1].isSplash) {
            props.navigation.replace("AppNav", {
              screen: "POMSTest",
              params: { showPopup: testArray[1].isRequires },
            });
            return
          }else if (testArray && testArray[2] && testArray[2].open && testArray[2].isSplash) {
            props.navigation.replace("AppNav", {
              screen: "Mbti_Start_Test",
              params: { showPopup: testArray[2].isRequires },
            });
            return
          }else{
            props.navigation.replace("AppNav", { screen: "HelperLanding" });
            return
          }      
         props.navigation.replace("AppNav", { screen: "HelperLanding" });

        } else {
          navigation.replace("AppNav", { screen: "HelperLanding" });
          return
        }
      } else {
        // If no user data, navigate to AuthNav
        navigation.replace("AuthNav");
        return
      }
    };

    // Call the function to get token and profile status
    const timer = setTimeout(() => {
      getTokenAndProfileStatus();
    }, 2000);

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [navigation, profiledetails]);

  return (
    <AppContainer>
      <FocusAwareStatusBar
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
        <View style={styles.logoView}>
          <Image source={ImagesAssets.applogo} style={styles.logoImage} />
          <Image source={ImagesAssets.apptitle} style={styles.title} />
        </View>
      </LinearGradient>
    </AppContainer>
  );
};

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

export default SplashLogo;