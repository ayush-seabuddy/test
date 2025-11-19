import Colors from '@/src/utils/Colors';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

const BottomTabbarLayout = () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let iconSource;

          if (route.name === "community") {
            iconSource = focused
              ? ImagesAssets.selectedHome
              : ImagesAssets.unselectedHome;
          } else if (route.name === "health") {
            iconSource = focused
              ? ImagesAssets.selectedHealth
              : ImagesAssets.unselectedHealth;
          } else if (route.name === "helpline") {
            iconSource = focused
              ? ImagesAssets.selectedHelpline
              : ImagesAssets.unselectedHelpline;
          } else if (route.name === "shiplife") {
            iconSource = focused
              ? ImagesAssets.selectedShiplife
              : ImagesAssets.unselectedShiplife;
          } else if (route.name === "profile") {
            iconSource =
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";
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
              <Image
                source={iconSource}
                style={[
                  styles.tabIcon,
                  route.name === "profile"
                    ? focused
                      ? { borderColor: Colors.lightGreen, borderWidth: 1 }
                      : null
                    : { tintColor: focused ? Colors.lightGreen : "white" },
                ]}
              />
            </View>
          );
        },
        tabBarStyle: styles.bottomNavbar,
        tabBarShowLabel: false,
      })}
    >
      {/* 👇 Replaced index with community */}
      <Tabs.Screen name="community" />
      <Tabs.Screen name="health" />
      <Tabs.Screen name="helpline" />
      <Tabs.Screen name="shiplife" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
};

export default BottomTabbarLayout;

const styles = StyleSheet.create({
  bottomNavbar: {
    position: "absolute",
    height: "7%",
    borderRadius: 25,
    backgroundColor: "rgba(84, 97, 94, 1)",
    marginVertical: 20,
    marginHorizontal: 10,
    paddingTop: Platform.OS === "ios" ? 30 : 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  iconContainer: {
    borderRadius: 50,
    height: 65,
    width: 65,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    borderRadius: 13,
    width: 26,
    height: 26,
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
