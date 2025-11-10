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
import { ImagesAssets } from "../../assets/ImagesAssets";
import Colors from "../../colors/Colors";
import Octicons from 'react-native-vector-icons/Octicons'
import EmergencyModal from "../Modals/EmergencyModal";
import { useTranslation } from "react-i18next";

const HealthHeader = ({ navigation }) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View style={styles.container}>
      <EmergencyModal
        navigation={navigation}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
      <Text style={styles.health}>{t('health')}</Text>
      <View style={styles.headerButtonsContainer}>
        <TouchableOpacity
          onPress={() => setModalVisible((prev) => !prev)}
          style={styles.headerButton}
        >
          <View style={styles.iconBackground}>
            <Image
              source={require("../../assets/images/NewPostImage/sosimage.png")}
              style={styles.headerIcon1}
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          // onPress={() => navigation.navigate("Analytics")}
          // onPress={() => navigation.navigate("HealthDataScreen")}
          style={styles.headerButton}
        >
          {/* <View style={styles.iconBackground}>
            <Image
              source={ImagesAssets.tabler_icon}
              style={styles.headerIcon}
            />
          </View> */}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Search");
          }}
          style={styles.headerButton}
        >
          <View style={[styles.iconBackground, styles.searchIconBackground]}>
            <Image source={ImagesAssets.search} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "#B0DB0266",
            borderRadius: 10,
            padding: 6,
            right: -10,
            top: 0,
          }}
          onPress={() => navigation.replace("AppNav", { screen: "HelperLanding" })}
        >
          {/* Use Octicons icon */}
          <Octicons name="home" size={21} color="#000" />

          {/* Or, alternatively, use a custom home icon image instead of Octicons */}
          {/* 
          <Image
            style={{ height: 20, width: 20 }}
            source={ImagesAssets.homeIcon}
          />
          */}
        </TouchableOpacity>
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
    fontSize: 24,
    lineHeight: 29,
    marginLeft: 9,
    marginTop: 8,
    fontFamily: "WhyteInktrap-Medium",
    color: "#262626",
  },
  headerButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    paddingVertical: 5,
  },
  headerButton: {
    marginLeft: 5,
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  headerIcon1: {
    width: 28,
    height: 28,
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

export default HealthHeader;
