// CustomHeader.js
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  TextInput,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import Colors from "../../colors/Colors";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../../Api";
import Octicons from 'react-native-vector-icons/Octicons'
import { Badge } from "react-native-paper";

const HomeHeader = () => {
  const navigation = useNavigation();

  const [Notification, setNotification] = useState([]);
  const [unreadNotification, setUnreadNotification] = useState(0)
  // console.log("unreadNotification: ", unreadNotification);


  const GetAllNotification = async () => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    try {
      const queryParams = new URLSearchParams({
        page: 1,
        limit: 100,
      }).toString();
      var response = await apiCallWithToken(
        apiServerUrl + "/user/getAllNotifications?" + queryParams,
        "GET",
        null,
        userDetails.authToken
      );


      setNotification(response.result.notificationsList);
    } catch (error) {
      console.log(error);
    }
  };

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
      GetAllNotification();
      unReadNotification();
      return () => {
      };
    }, [])
  );

  return (
    <View style={styles.container}>
      <Image
        source={ImagesAssets.apptitle}
        style={{ height: 22, width: 115 }}
      />
      <View style={styles.headerButtonsContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Notifications");
          }}
          style={styles.headerButton}
        >
          <View style={{ position: "relative" }}>
            <View
              style={{
                borderRadius: 8,
                paddingHorizontal: 3,
                paddingVertical: 3,
              }}
            >
              <Image
                source={ImagesAssets.notification}
                style={styles.headerIcon}
              />
            </View>
            {/* <View
              style={{
                backgroundColor: Colors.secondary,
                color: Colors.white,
                borderRadius: 50,
                position: "absolute",
                top: -7,
                right: -4,
                paddingHorizontal: 2,
                paddingVertical: 1,
              }}
            >
              <Text style={{ color: Colors.white, fontSize: 12 }}>
                {Notification.length}
              </Text>
            </View> */}
            {unreadNotification > 0 ? (
              <View
                style={{
                  backgroundColor: Colors.secondary,
                  color: Colors.white,
                  borderRadius: 50,
                  position: "absolute",
                  top: 1,
                  right: 1,
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
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("PublicScreen");
          }}
          style={styles.headerButton}
        >
          <View
            style={{
              borderRadius: 8,
              paddingHorizontal: 3,
              paddingVertical: 3,
            }}
          >
            <Image source={ImagesAssets.jam_task} style={styles.headerIcon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Search");
          }}
          style={styles.headerButton}
        >
          <View
            style={{
              // backgroundColor: "#B0DB0266",
              borderRadius: 8,
              padding: 4,
            }}
          >
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
    flexDirection: "row", // Arrange buttons in a row
    marginRight: 10, // Margin to the right of the buttons
  },
  headerButton: {
    marginLeft: 10, // Space between buttons
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },

  badgeContainer: {
    backgroundColor: Colors.secondary,
    borderRadius: 50,
    position: "absolute",
    top: -7,
    right: -4,
    paddingHorizontal: 5,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
  },
});

export default HomeHeader;