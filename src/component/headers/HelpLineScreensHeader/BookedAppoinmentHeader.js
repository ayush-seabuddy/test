// CustomHeader.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import Colors from "../../../colors/Colors";
import EmergencyModal from "../../Modals/EmergencyModal";

const BookedAppoinmentHeader = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={styles.container}>
      <EmergencyModal
        navigation={navigation}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <View style={styles.iconBackground}>
            <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>

        <Text style={styles.health}>Your Booked Appointment</Text>
      </View>
      <View style={styles.headerButtonsContainer}>
        <TouchableOpacity
          onPress={() => setModalVisible((prev) => !prev)}
          style={styles.headerButton}
        >
          <View style={[styles.iconBackground]}>
            <Image
              source={require("../../../assets/images/NewPostImage/sosimage.png")}
              style={styles.headerIcon2}
            />
          </View>
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={() => {
            navigation.navigate("BookedAppoinment");
          }}
          style={styles.headerButton}
        >
          <View style={[styles.iconBackground, styles.searchIconBackground]}>
            <Image
              tintColor="black"
              source={ImagesAssets.dots}
              style={styles.headerIcon}
            />
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
    zIndex: 1,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
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
    lineHeight: 29,
    fontFamily: "Poppins-Regular",
    color: "#262626",
  },
  headerButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  headerIcon2: {
    width: 30,
    height: 30,
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

export default BookedAppoinmentHeader;
