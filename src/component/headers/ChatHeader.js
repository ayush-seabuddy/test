import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from "react-native";
import Octicons from "react-native-vector-icons/Octicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "../../colors/Colors";
import { ImagesAssets } from "../../assets/ImagesAssets";
import { useFocusEffect } from "@react-navigation/native";
import { apiCallWithToken, apiServerUrl } from "../../Api";
import { Badge } from "react-native-paper";

const ChatHeader = ({ navigation }) => {
  const [profile, setProfile] = useState({});
  const [unreadNotification, setUnreadNotification] = useState(0);
  console.log("unreadNotification: ", unreadNotification);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const userData = await AsyncStorage.getItem("userDetails");
        if (userData) {
          setProfile(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    getUserDetails();
  }, []);

  const unReadNotification = async () => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    try {
      var response = await apiCallWithToken(
        apiServerUrl + "/user/getUnreadNotificationCount?",
        "GET",
        null,
        userDetails.authToken
      );
      setUnreadNotification(response.result.allNotifications);
    } catch (error) {
      console.log(error);
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
        <Text style={styles.chat}>Chat Room </Text>
      </Text>

      <View style={styles.headerButtonsContainer}>
        {/* {profile?.designation === "Captain" && (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate("CrewList")}
          >
            <Image source={ImagesAssets.userGrup} style={styles.headerIcon} />
          </TouchableOpacity>
        )} */}
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Image source={ImagesAssets.notification} style={styles.headerIcon} />
          {/* {unreadNotification > 0 ? (
              <Badge size={10}
                style={{
                  backgroundColor: Colors.secondary,
                  color: Colors.white,
                  borderRadius: 50,
                  position: "absolute",
                  top: 5,
                  right: 5,
                  paddingHorizontal: 0,
                  paddingVertical: 0,

                  fontSize: 1,
                }}
              > */}
          {/* {unreadNotification>99?`99+`:unreadNotification} */}
          {/* </Badge>
            ) : null} */}
          {unreadNotification > 0 ? (
            <View
              style={{
                backgroundColor: Colors.secondary,
                color: Colors.white,
                borderRadius: 50,
                position: "absolute",
                top: 5,
                right: 5,
                paddingHorizontal: 0,
                paddingVertical: 0,
                fontSize: 1,
                width: 10,
                height: 10,
              }}
            >
              {/* {unreadNotification > 99 ? `99+` : unreadNotification} */}
            </View>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate("PublicScreen")}
        >
          <Image source={ImagesAssets.jam_task} style={styles.headerIcon} />
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate("Search")}
        >
          <Image source={ImagesAssets.search} style={styles.headerIcon} />
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.replace("AppNav", { screen: "HelperLanding" })}
        >
          <Octicons name="home" size={21} color="#000" />
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
    backgroundColor: Colors.secondary,
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
  },
  chatroom: {
    fontSize: 24,
    lineHeight: 29,
    color: "#262626",
  },
});

export default ChatHeader;