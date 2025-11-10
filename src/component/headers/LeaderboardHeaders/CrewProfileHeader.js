import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { ImagesAssets } from "../../../assets/ImagesAssets";
import { useTranslation } from "react-i18next";

const CrewProfileHeader = ({ navigation, source = "" }) => {
  const { t } = useTranslation();

  const handleBackPress = () => {
    if (source === "hangout") {
      navigation.navigate("Home", {
        screen: "SeaBuddy",
        params: { name: "hangout" },
      });
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity onPress={handleBackPress} style={styles.headerButton}>
          <View style={styles.iconBackground}>
            <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>

        <Text style={styles.title}>{t("crewprofile")}</Text>
      </View>
    </View>
  );
};

export default memo(CrewProfileHeader);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
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
      android: { elevation: 5 },
    }),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "Poppins-Regular",
    color: "#262626",
  },
  headerButton: { marginLeft: 10 },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  iconBackground: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
});
