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
import { ImagesAssets } from "../../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../../statusbar/FocusAwareStatusBar";
import { Colors } from "react-native/Libraries/NewAppScreen";

const CompanyHeader = ({ navigation, title }) => {

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <TouchableOpacity
          onPress={() => {
            // if (navigation.canGoBack()) {
            // navigation.goBack();
            console.log("sdifjsdlkfjsdlkf");

            navigation.navigate("Home");
            // } else {
            //   Alert.alert("Please fill the form and submit");
            // }
          }}
          style={styles.headerButton}
        >
          <View style={styles.iconBackground}>
            <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>
        <Text style={styles.health}>
          {title?.length > 25 ? `${title?.slice(0, 25)}...` : title}
        </Text>
      </View>
      <View style={styles.headerButtonsContainer}>
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
    // zIndex: 1,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
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

export default CompanyHeader;