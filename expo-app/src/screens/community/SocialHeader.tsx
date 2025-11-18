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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import Colors from "@/src/utils/Colors";
import { House } from "lucide-react-native";
import { router } from "expo-router";

const SocialHeader = () => {
  const navigation = useNavigation();

  const [Notification, setNotification] = useState([]);
  const [unreadNotification, setUnreadNotification] = useState(0)


//   const GetAllNotification = async () => {
//     const dbResult = await AsyncStorage.getItem("userDetails");
//     const userDetails = JSON.parse(dbResult);
//     try {
//       const queryParams = new URLSearchParams({
//         page: 1,
//         limit: 100,
//       }).toString();
//       var response = await apiCallWithToken(
//         apiServerUrl + "/user/getAllNotifications?" + queryParams,
//         "GET",
//         null,
//         userDetails.authToken
//       );


//       setNotification(response.result.notificationsList);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const unReadNotification = async () => {
//     const dbResult = await AsyncStorage.getItem("userDetails");
//     const userDetails = JSON.parse(dbResult);
//     try {
//       var response = await apiCallWithToken(
//         apiServerUrl + "/user/getUnreadNotificationCount?",
//         "GET",
//         null,
//         userDetails.authToken
//       );
//       setUnreadNotification(response.result.allNotifications);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       GetAllNotification();
//       unReadNotification();
//       return () => {
//       };
//     }, [])
//   );

return (
    <View style={styles.container}>
      <Image source={ImagesAssets.appTitleLogo} style={styles.titleLogo} />

      <View style={styles.iconGroup}>
        {/* Notification Button */}
        <TouchableOpacity style={styles.iconButton}>
          <View style={styles.iconWrapper}>
            <Image source={ImagesAssets.notificationBell} style={styles.iconImage} />
            <View style={styles.badgeWrapper}>
              <Text style={styles.badgeText}>{Notification.length}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Company Library */}
        <TouchableOpacity style={styles.iconButton}>
          <View style={styles.iconWrapper}>
            <Image source={ImagesAssets.companyLibraryLogo} style={styles.iconImage} />
          </View>
        </TouchableOpacity>

        {/* Search */}
        <TouchableOpacity style={styles.iconButton}>
          <View style={styles.iconWrapper}>
            <Image source={ImagesAssets.searchLogo} style={styles.iconImage} />
          </View>
        </TouchableOpacity>

        {/* Home */}
        <TouchableOpacity style={styles.homeButton} onPress={() => router.push("/home")}>
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

  titleLogo: {
    height: 22,
    width: 115,
    resizeMode: "contain",
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