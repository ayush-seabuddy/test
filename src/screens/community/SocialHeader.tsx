import { getUnreadNotificationCount } from "@/src/apis/apiService";
import Colors from "@/src/utils/Colors";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { Logger } from "@/src/utils/logger";
import { useFocusEffect , router } from "expo-router";
import { House } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

type AppRoutes =
  | "/notification"
  | "/company-library"
  | "/globalSearch"
  | "/home";

const SocialHeader = () => {
  const [unreadNotification, setUnreadNotification] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadNotificationCount();
      setUnreadNotification(response.data.allNotifications ?? 0);
    } catch (error) {
      Logger.error("Error fetching unread notifications:", {Error:String(error)});
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [fetchUnreadCount])
  );

  const navigateTo = (route: AppRoutes) => {
    router.push(route);
  };

  const goHome = () => {
    router.replace("/home");
  };

  return (
    <View style={styles.container}>
      <Image source={ImagesAssets.appTitleLogo} style={styles.titleLogo} />

      <View style={styles.iconGroup}>
        {/* Notification */}
        <TouchableOpacity style={styles.iconButton} onPress={() => navigateTo("/notification")}>
          <View style={styles.iconWrapper}>
            <Image source={ImagesAssets.notificationBell} style={styles.icon} />
            {unreadNotification > 0 && <View style={styles.badgeDot} />}
          </View>
        </TouchableOpacity>

        {/* Company Library */}
        <TouchableOpacity style={styles.iconButton} onPress={() => navigateTo("/company-library")}>
          <Image source={ImagesAssets.companyLibraryLogo} style={styles.icon} />
        </TouchableOpacity>

        {/* Search */}
        <TouchableOpacity style={styles.iconButton} onPress={() => navigateTo("/globalSearch")}>
          <Image source={ImagesAssets.searchLogo} style={styles.icon} />
        </TouchableOpacity>

        {/* Home */}
        <TouchableOpacity style={styles.homeButton} onPress={goHome}>
          <House size={22} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SocialHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  titleLogo: {
    height: 22,
    width: 115,
    resizeMode: "contain",
  },

  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconButton: {
    marginLeft: 14,
  },

  iconWrapper: {
    position: "relative",
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
    marginLeft: 13,
  },
});