import EmergencyModal from "@/src/components/Modals/EmergencyModal";
import Colors from "@/src/utils/Colors";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { Image } from "expo-image";
import { router } from "expo-router";
import { t } from "i18next";
import { ChevronLeft, History } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Header = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <EmergencyModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <View style={styles.container}>
        {/* Left side - Back + Title */}
        <View style={styles.leftContainer}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <View style={styles.iconBackground}>
              <ChevronLeft size={20} color="black" />
            </View>
          </TouchableOpacity>

          <Text style={styles.title}>{t("Book_Appointment")}</Text>
        </View>

        {/* Right side - SOS + History */}
        <View style={styles.rightContainer}>
          <TouchableOpacity
            onPress={() => setModalVisible(prev => !prev)}
            style={styles.headerButton}
          >
            <View style={styles.iconBackground}>
              <Image
                source={ImagesAssets.sosimage}
                style={styles.sosIcon}
                contentFit="contain"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/appointmenthistory')}
            style={styles.headerButton}
          >
            <View style={styles.historyIconBackground}>
              <History size={15} color="black" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  title: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: Colors.textPrimary || "#000",
    lineHeight: 29,
  },

  headerButton: {
    marginLeft: 10
  },

  iconBackground: {
    borderRadius: 8,
    padding: 4,
  },

  sosIcon: {
    width: 27,
    height: 27,
  },

  historyIconBackground: {
    backgroundColor: "#B0DB0266",
    borderRadius: 8,
    padding: 7,
  },
});