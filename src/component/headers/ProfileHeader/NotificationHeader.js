// CustomHeader.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../../statusbar/FocusAwareStatusBar";
import { Colors } from "react-native/Libraries/NewAppScreen";

const NotificationHeader = ({
  navigation,
  title,
  modalVisible,
  setModalVisible,
  markAllAsReadModalVisible, // new
  setMarkAllAsReadModalVisible, // new
  Notification,
}) => {
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
            navigation.goBack();
          }}
          style={styles.headerButton}
        >
          <View style={styles.iconBackground}>
            <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>
        <Text style={styles.health}>{title}</Text>
      </View>

      <View style={styles.headerButtonsContainer}>
        {Notification.length > 0 ? (
          <>
            {/* Delete All */}
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.headerButton}
            >
              <View style={[styles.iconBackground, styles.searchIconBackground]}>
                <Image
                  source={require("../../../assets/images/AnotherImage/crossTick.png")}
                  style={styles.headerIcon}
                />
              </View>
            </TouchableOpacity>

            {/* Mark All as Read */}
            <TouchableOpacity
              onPress={() => setMarkAllAsReadModalVisible(true)}
              style={styles.headerButton}
            >
              <View style={[styles.iconBackground, styles.searchIconBackground]}>
                <Image
                  source={require("../../../assets/images/AnotherImage/tickCircle.png")}
                  style={styles.headerIcon}
                />
              </View>
            </TouchableOpacity>
          </>
        ) : null}
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
    // backgroundColor: "#B0DB0266",
    borderRadius: 8,
  },
});

export default NotificationHeader;
