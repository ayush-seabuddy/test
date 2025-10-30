// CustomHeader.js
import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  BackHandler,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";

const WorkoutBuddiesHeader = ({ navigation, headername }) => {

  // Hardware back button handler
  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // Ensure navigation stays inside AppNav to preserve bottom tabs
        navigation.navigate("AppNav", { screen: "Home" });
      }
      return true; // Prevent default behavior (app exit)
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove(); // Cleanup on unmount
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              // Ensure header back button also stays inside AppNav
              navigation.navigate("Home", { screen: "Huddle" });
            }
          }}
          style={styles.headerButton}
        >
          <View style={styles.iconBackground}>
            <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>
        <Text style={styles.health}>{headername || "Workout Buddies"}</Text>
      </View>
      <View style={styles.headerButtonsContainer}>
        {/* Uncomment for additional header buttons, e.g., search */}
        {/* <TouchableOpacity onPress={() => {  }} style={styles.headerButton}>
          <View style={[styles.iconBackground, styles.searchIconBackground]}>
            <Image tintColor="black" source={ImagesAssets.search} style={styles.headerIcon} />
          </View>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  health: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "Poppins-Regular",
    color: "#262626",
  },
  headerButtonsContainer: {
    flexDirection: "row",
    marginRight: 10,
    padding: 5,
  },
  headerButton: {
    marginLeft: 10,
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  iconBackground: {
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 3,
  },
  searchIconBackground: {
    backgroundColor: "#B0DB0266",
    borderRadius: 8,
  },
});

export default WorkoutBuddiesHeader;
