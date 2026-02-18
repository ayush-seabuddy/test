import { getUnreadNotificationCount } from "@/src/apis/apiService";
import Colors from "@/src/utils/Colors";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { Logger } from "@/src/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { House } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ChatHeader = ({ }) => {
  const [profile, setProfile] = useState({});
  const [unreadNotification, setUnreadNotification] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const userData = await AsyncStorage.getItem("userDetails");
        if (userData) {
          setProfile(JSON.parse(userData));
        }
      } catch (error) {
        Logger.error("Error fetching user details:", {Error:String(error)});
      }
    };
    getUserDetails();
  }, []);

  const unReadNotification = async () => {
    try {
      let response = await getUnreadNotificationCount();
      setUnreadNotification(response.data.allNotifications);
    } catch (error) {
      Logger.error(String(error));
    }
  };

  useFocusEffect(
    useCallback(() => {
      unReadNotification();
      return () => {
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.chatroom}>
        <Text style={styles.chat}>{t('chatRoom')}</Text>
      </Text>
      <View style={styles.headerButtonsContainer}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push('/notification')}
        >
          <Image source={ImagesAssets.notificationBell} style={styles.headerIcon} />
          {unreadNotification > 0 ? (
            <View
              style={{
                backgroundColor: Colors.lightGreen,
                borderRadius: 50,
                position: "absolute",
                top: 8,
                right: 10,
                paddingHorizontal: 0,
                paddingVertical: 0,
                width: 7,
                height: 7,
              }}
            >
            </View>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push('/company-library')}
        >
          <Image source={ImagesAssets.companyLibraryLogo} style={styles.headerIcon} />
        </TouchableOpacity>

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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    paddingHorizontal: 10,
    // borderBottomWidth: 0.5,
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
  headerButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
  },
  homeButton: {
    backgroundColor: "#B0DB0266",
    borderRadius: 10,
    padding: 6,
    marginLeft: 5, // Reduced from 10
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  badge: {
    backgroundColor: Colors.lightGreen,
    borderRadius: 50,
    position: "absolute",
    top: -4,
    right: -4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    textAlign: "center",
  },
  chat: {
    fontFamily: "WhyteInktrap-Medium",
  },
  room: {
    fontFamily: "WhyteInktrap-Bold",
    lineHeight:20,
  },
  chatroom: {
    fontSize: 24,
    lineHeight: 29,
    color: "#262626",
  },
});

export default ChatHeader;