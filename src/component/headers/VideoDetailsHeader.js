// VideoDetailsHeader.js
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import Colors from "../../colors/Colors";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";

const VideoDetailsHeader = ({ navigation, data, fromHome }) => {
  const handleBackPress = () => {
    if (fromHome) {
      navigation.navigate("PublicScreen");
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace("Home", { name: "hangout" });
    }
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar
        barStyle="light-content"
        backgroundColor={Colors.white}
        hidden={false}
      />
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={handleBackPress} style={styles.headerButton}>
          <View style={styles.iconBackground}>
            <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.headerButtonsContainer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 10,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1500,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerButton: {
    marginLeft: 10,
  },
  iconBackground: {
    borderRadius: 100,
    padding: 8,
    backgroundColor: "#ededed",
  },
  headerIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  headerButtonsContainer: {
    flexDirection: "row",
    marginRight: 10,
    padding: 5,
  },
});

export default VideoDetailsHeader;
