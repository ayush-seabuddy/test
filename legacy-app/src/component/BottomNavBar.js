import React, { useCallback, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet, Text, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import FastImage from "react-native-fast-image";

import Home from "../screens/Home";
import Health from "../screens/Health";
import Ai from "../screens/Ai";
import Huddle from "../screens/Huddle";
import Profile from "../screens/Profile";
import { ImagesAssets } from "../assets/ImagesAssets";
import Colors from "../colors/Colors";
import { apiServerUrl, checkConnected } from "../Api";

const Tab = createBottomTabNavigator();

const BottomNavBar = () => {
  const [profile, setProfile] = useState({});
  const [isOffline, setIsOffline] = useState(false);

  const GetDetails = async () => {
    try {
      const connected = await checkConnected();
      if (!connected) {
        setIsOffline(true);
        const cachedProfile = await AsyncStorage.getItem("cachedProfile");
        if (cachedProfile) {
          setProfile(JSON.parse(cachedProfile));
        }
        return;
      }

      setIsOffline(false);
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);

      const response = await axios({
        method: "GET",
        url: `${apiServerUrl}/user/viewUserProfile`,
        headers: {
          authToken: userDetails.authToken,
        },
        params: { userId: userDetails?.id },
      });

      if (response.data.responseCode === 200) {
        const userData = response.data.result;
        setProfile(userData);

        // Update AsyncStorage with new profile and cached image
        const updatedUser = {
          ...userDetails,
          companyLogo: userData.companyLogo || userDetails.companyLogo,
          companyName: userData.companyName || userDetails.companyName,
          companyDescription: userData.companyDescription || userDetails.companyDescription,
        };

        await AsyncStorage.setItem("userDetails", JSON.stringify(updatedUser));
        await AsyncStorage.setItem("cachedProfile", JSON.stringify(userData));
      }
    } catch (error) {
      console.log("Profile Fetch Error:", error);
      const cachedProfile = await AsyncStorage.getItem("cachedProfile");
      if (cachedProfile) {
        setProfile(JSON.parse(cachedProfile));
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      GetDetails();
    }, [])
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconSource;

          if (route.name === "SeaBuddy") {
            iconSource = focused
              ? ImagesAssets.bottom_tabhome_icon
              : ImagesAssets.seaBuddyUnselected;
          } else if (route.name === "Health") {
            iconSource = focused
              ? ImagesAssets.healthSelected
              : ImagesAssets.bottom_hugeicons_health_icon;
          } else if (route.name === "Ai") {
            iconSource = focused
              ? ImagesAssets.aiIconSelected
              : ImagesAssets.ai_icon;
          } else if (route.name === "Huddle") {
            iconSource = focused
              ? ImagesAssets.chatIconSelected
              : ImagesAssets.bottom_chat_icon;
          } else if (route.name === "Profile") {
            iconSource = profile?.profileUrl
              ? { uri: profile?.profileUrl }
              : { uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png" };
          }

          return (
            <View
              style={[
                styles.iconContainer,
                focused
                  ? styles.iconFocusedBackground
                  : styles.iconDefaultBackground,
              ]}
            >
              <FastImage
                source={iconSource}
                style={[
                  styles.tabIcon,
                  route.name === "Profile"
                    ? focused
                      ? { borderColor: Colors.secondary, borderWidth: 1 }
                      : null
                    : { tintColor: focused ? Colors.secondary : "white" },
                ]}
              />
            </View>
          );
        },
        tabBarStyle: styles.bottomNavbar,
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen
        name="SeaBuddy"
        component={Home}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Health" component={Health} options={{ headerShown: false }} />
      <Tab.Screen
        name="Ai"
        component={Ai}
        options={{ headerShown: false }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("Ai", { mode: "both" });
          },
        })}
      />
      <Tab.Screen name="Huddle" component={Huddle} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  bottomNavbar: {
    position: "absolute",
    height: "7%",
    borderRadius: 25,
    backgroundColor: "rgba(84, 97, 94, 0.80)",
    marginVertical: 20,
    marginHorizontal: 10,
    paddingTop: Platform.OS === "ios" ? 30 : 0,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  tabIcon: {
    borderRadius: 13,
    width: 26,
    height: 26,
    resizeMode: "cover",
  },
  iconContainer: {
    borderRadius: 50,
    height: 65,
    width: 65,
    alignItems: "center",
    justifyContent: "center",
  },
  iconDefaultBackground: { backgroundColor: "transparent" },
  iconFocusedBackground: {
    backgroundColor: "#262626",
    borderWidth: 4,
    borderColor: "rgba(54, 75, 56, 0.6)",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 0,
  },
});

export default BottomNavBar;
