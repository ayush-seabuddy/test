// CustomHeader.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import Colors from "@/src/utils/Colors";
import { House } from "lucide-react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { getUserDetails } from "../utils/helperFunctions";

const ShipLifeScreenHeader = () => {
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const user = await getUserDetails();
      setUserDetails(user);
    };

    init();
  }, []);

  const isCaptain = userDetails?.designation === "Captain";

  return (
    <View style={styles.container}>
      <Text style={styles.shiplifetext}>{t("ship_life")}</Text>

      <View style={styles.iconGroup}>
        {/* Leaderboard */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/leaderboard")}
        >
          <View style={styles.iconWrapper}>
            <Image
              source={ImagesAssets.LeaderboardIcon}
              style={styles.iconImage}
            />
          </View>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/notification")}
        >
          <View style={styles.iconWrapper}>
            <Image
              source={ImagesAssets.notificationBell}
              style={styles.iconImage}
            />

            {notifications.length > 0 && (
              <View style={styles.badgeWrapper}>
                <Text style={styles.badgeText}>
                  {notifications.length}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Crew Listing / Search */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/crewlisting")}
        >
          <View style={styles.iconWrapper}>
            <Image
              source={
                isCaptain
                  ? ImagesAssets.crewListLogo
                  : ImagesAssets.searchLogo
              }
              style={styles.iconImage}
            />
          </View>
        </TouchableOpacity>

        {/* Home */}
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("/home")}
        >
          <House size={22} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ShipLifeScreenHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 10,
    backgroundColor: Colors.white,
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

  shiplifetext: {
    fontSize: 22,
    lineHeight: 25,
    marginLeft: 10,
    color: "#262626",
    fontWeight: "500",
    fontFamily: "WhyteInktrap-Medium",
  },

  iconGroup: {
    flexDirection: "row",
    marginRight: 10,
  },

  iconButton: {
    marginLeft: 10,
  },

  iconWrapper: {
    borderRadius: 8,
    padding: 4,
    position: "relative",
  },

  iconImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    tintColor: "#000",
  },

  badgeWrapper: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: Colors.lightGreen,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 0.5,
    borderColor: Colors.white,
  },

  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },

  homeButton: {
    backgroundColor: "#B0DB0266",
    borderRadius: 10,
    padding: 6,
    marginLeft: 10,
  },
});
