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
        <TouchableOpacity
          onPress={() => setEmergencyModalVisible((prev) => !prev)}
          style={styles.headerButton}
        >
          <View style={styles.iconBackground}>
            <Image
              source={ImagesAssets.sosimage}
              style={styles.headerIcon1}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerButton} onPress={()=> router.replace('/globalSearch')}>
          <View style={styles.iconBackground}>
            <Search size={20} color={Colors.black} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/home')}>
          <Home size={21} color="#000" />
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
  headerIcon1: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
  iconBackground: {
    borderRadius: 8,
    padding: 3,
  },
  homeButton: {
    backgroundColor: "#B0DB0266",
    borderRadius: 10,
    padding: 6,
    right: -10,
  },
});

export default HealthHeader;
