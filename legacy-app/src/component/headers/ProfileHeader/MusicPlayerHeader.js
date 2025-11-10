import React, { useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  BackHandler,
} from "react-native";
import TrackPlayer from "react-native-track-player";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../../statusbar/FocusAwareStatusBar";
import Colors from "../../../colors/Colors";

const MusicPlayerHeader = ({ navigation, title = "", fromHome = false, fromNotification = false }) => {
  const handleBackPress = async () => {
    try {
      // Stop and reset TrackPlayer to ensure music stops
      await TrackPlayer.stop();
      await TrackPlayer.reset();
      console.log("[MusicPlayerHeader] Stopped and reset TrackPlayer on back press");
    } catch (error) {
      console.error("[MusicPlayerHeader] Error stopping TrackPlayer:", error);
    }

    if (fromNotification) {
      navigation.navigate("Home");
    } else if (fromHome) {
      navigation.navigate("PublicScreen");
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  };

  useEffect(() => {
    const backAction = () => {
      handleBackPress();
      return true; // Prevent default behavior (exit app)
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [navigation, fromHome, fromNotification]);

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <TouchableOpacity
        onPress={handleBackPress}
        style={styles.headerButton}
      >
        <View style={styles.iconBackground}>
          <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
        </View>
      </TouchableOpacity>
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
    backgroundColor: Colors.white,
  },
  headerButton: {
    marginLeft: 10,
  },
  headerIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  iconBackground: {
    borderRadius: 100,
    padding: 8,
    backgroundColor: "#ededed",
  },
});

export default MusicPlayerHeader;