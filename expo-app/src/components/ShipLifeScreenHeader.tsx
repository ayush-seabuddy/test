import React, { useCallback, useEffect, useState } from "react";
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
import { House, Trophy } from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { getUserDetails } from "../utils/helperFunctions";
import { getUnreadNotificationCount } from "../apis/apiService";

const ShipLifeScreenHeader = () => {
  const { t } = useTranslation();
  const [userDetails, setUserDetails] = useState<any>(null);
  const [unreadNotification, setUnreadNotification] = useState(0);

  const fetchInitialData = useCallback(async () => {
    try {
      const [userRes, notificationRes] = await Promise.all([
        getUserDetails(),
        getUnreadNotificationCount(),
      ]);

      setUserDetails(userRes);
      setUnreadNotification(notificationRes.data.allNotifications ?? 0);
    } catch (error) {
      console.log("Error fetching initial header data:", error);
      setUnreadNotification(0);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useFocusEffect(
    useCallback(() => {
      // Always refresh unread notification count when screen comes into focus
      getUnreadNotificationCount()
        .then((res) => {
          setUnreadNotification(res.data.allNotifications ?? 0);
        })
        .catch(() => {
          setUnreadNotification(0);
        });

      // If userDetails is missing (e.g., first load or cleared), fetch it
      if (!userDetails) {
        getUserDetails()
          .then(setUserDetails)
          .catch(console.log);
      }
    }, [userDetails])
  );

  const isCaptain = userDetails?.designation === "Captain";

  // Determine the correct icon source with safe fallback
  const crewIconSource = userDetails
    ? isCaptain
      ? ImagesAssets.crewListLogo
      : ImagesAssets.searchLogo
    : ImagesAssets.searchLogo;

  const handleCrewButtonPress = () => {
    if (isCaptain) {
      router.push("/crewlisting");
    }
    else {
      router.push('/globalSearch');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.shiplifetext}>{t("ship_life")}</Text>

      <View style={styles.iconGroup}>
        {/* Leaderboard */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/leaderboard")}
          accessibilityLabel={t("leaderboard")}
        >
          <View style={styles.iconWrapper}>
            <Trophy size={24} color={Colors.black} />
          </View>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => router.push("/notification")}
          accessibilityLabel={t("notifications")}
        >
          <View style={styles.iconWrapper}>
            <Image source={ImagesAssets.notificationBell} style={styles.icon} />
            {unreadNotification > 0 && <View style={styles.badgeDot} />}
          </View>
        </TouchableOpacity>

        {/* Crew Listing (Captain) / Search (Others) */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleCrewButtonPress}
          // Only disable if we don't know yet if user is captain and action requires it
          disabled={userDetails === null && isCaptain === undefined}
          accessibilityLabel={isCaptain ? t("crew_listing") : t("search")}
        >
          <View style={styles.iconWrapper}>
            <Image source={crewIconSource} style={styles.iconImage} />
          </View>
        </TouchableOpacity>

        {/* Home */}
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace("/home")}
          accessibilityLabel={t("home")}
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
    alignItems: "center",
    marginRight: 10,
  },

  iconButton: {
    marginLeft: 14,
  },

  iconWrapper: {
    borderRadius: 8,
    position: "relative",
  },

  iconImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    tintColor: "#000",
  },

  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },

  badgeDot: {
    position: "absolute",
    top: -2,
    right: 1,
    width: 10,
    height: 10,
    backgroundColor: Colors.lightGreen,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },

  homeButton: {
    backgroundColor: "#B0DB0266",
    borderRadius: 10,
    padding: 6,
    marginLeft: 14,
  },
});