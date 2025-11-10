// CustomHeader.js

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FocusAwareStatusBar from "../../../statusbar/FocusAwareStatusBar";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import Colors from "../../../colors/Colors";

const HeaderForTest = ({ navigation, title, isRequired = false, screenName }) => {

  const handleBackPress = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) {
        Alert.alert("User data not found", "Please login again.");
        return;
      }

      let userDetails;
      try {
        userDetails = JSON.parse(dbResult);
      } catch (e) {
        console.error("JSON parse error:", e);
        Alert.alert("Invalid user data", "Please re-login to continue.");
        return;
      }

      if (!isRequired) {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {

          navigation.navigate("AppNav", { screen: "HelperLanding" });
        }
      } else {
        Alert.alert("Please fill the form and submit");
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      Alert.alert("An error occurred", "Please try again later.");
    }
  };


  const truncateText = (text, maxLength = 25) =>
    text?.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <View style={[styles.rowContainer, { paddingVertical: screenName === "HAPPINESSINDEX" ? 0 : 8 }]}>
        {!isRequired && <TouchableOpacity onPress={handleBackPress} style={styles.headerButton}>
          <View style={styles.iconBackground}>
            <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>}
        <Text style={styles.titleText}>{truncateText(title)}</Text>
      </View>
      {screenName === 'HAPPINESSINDEX' && (<Text style={{
        fontSize: 11,
        marginLeft: !isRequired ? 40 : 5,
        fontFamily: "Poppins-Regular",
        color: "#262626",
        marginBottom: 10,
      }}>Based on the industry-standard Seafarers’ Happiness Index</Text>)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: "#fff",
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
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,

  },
  titleText: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    marginLeft: 5,
    fontFamily: "Poppins-Regular",
    color: "#262626",
  },
  headerButtonsContainer: {
    flexDirection: "row",
    marginRight: 10,
    padding: 5,
  },
  headerButton: {
    marginTop: 10,
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

export default HeaderForTest;
