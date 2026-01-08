import EmergencyModal from "@/src/components/Modals/EmergencyModal";
import Colors from "@/src/utils/Colors";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Home, Search } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const HealthHeader = () => {
  const { t } = useTranslation();
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <EmergencyModal
        visible={emergencyModalVisible}
        onClose={() => setEmergencyModalVisible(false)}
      />

      <Text style={styles.health}>{t("health")}</Text>

      <View style={styles.headerButtonsContainer}>
        {/* SOS Button */}
        <TouchableOpacity
          onPress={() => setEmergencyModalVisible((prev) => !prev)}
        >
          <View style={styles.iconBackground}>
            <Image
              source={ImagesAssets.sosimage}
              style={styles.headerIcon}
            />
          </View>
        </TouchableOpacity>

        {/* Search Button */}
        <TouchableOpacity
          onPress={() => router.replace('/globalSearch')}
        >
          <View style={styles.iconBackground}>
            <Search size={24} color={Colors.black} />
          </View>
        </TouchableOpacity>

        {/* Home Button */}
        <TouchableOpacity
          onPress={() => router.replace('/home')}
        >
          <View style={styles.homeIconBackground}>
            <Home size={21} color="#000" />
          </View>
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
    fontSize: 24,
    lineHeight: 29,
    marginLeft: 5,
    marginTop: 8,
    fontFamily: "WhyteInktrap-Medium",
    color: "#262626",
  },
  headerButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconBackground: {
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  homeIconBackground: {
    backgroundColor: "#B0DB0266",
    borderRadius: 10,
    padding: 6,
  },
  headerIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
});

export default HealthHeader;
