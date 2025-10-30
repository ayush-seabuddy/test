import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import socketService from "../Socket/Socket";
import moment from "moment";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import axios from "axios";
import { apiServerUrl } from "../Api";
import { FontFamily } from "../GlobalStyle";
import api from "../CustomAxios";
import Colors from "../colors/Colors";
import { ImagesAssets } from "../assets/ImagesAssets";

const { width } = Dimensions.get("screen");

const VesselChat = ({ route, refreshing }) => {
  const [ChatGroup, setChatGroup] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const navigation = useNavigation();

  const getProfileDetails = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) throw new Error("No user details found");
      const userDetails = JSON.parse(dbResult);

      const response = await api.get(`${apiServerUrl}/user/viewUserProfile`, {
        headers: { authToken: userDetails.authToken },
        params: { userId: userDetails.id },
      });

      if (response.data.responseCode === 200) {
        return response.data.result.shipId;
      } else {
        console.error("Error fetching profile data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching profile details:", error);
    }
  };

  const getChatRoom = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("userDetails");
      const user = JSON.parse(storedUser);
      setUserDetails(user);

      const shipId = await getProfileDetails();
      if (!shipId) return;

      const payload = { userId: user.id, shipId };

      socketService.emit("getAllGroupChatRooms", payload);
      socketService.on("groupChatRooms", (data) => {
        setChatGroup(data.groupChatRooms);
        setIsLoading(false);
      });
    } catch (error) {
      console.log(error, "error");
    }
  };

  useFocusEffect(
    useCallback(() => {
      const updateChatCount = async (data) => {
        const dbResult = await AsyncStorage.getItem("userDetails");
        const userDetails = JSON.parse(dbResult);
        setChatGroup((prevChatGroup) =>
          prevChatGroup.map((item) =>
            item.id === data.chatRoomId
              ? {
                ...item,
                isUnReadMessage: true,
                unReadMessages: data?.participants?.find(
                  (p) => p.userId === userDetails.id
                )?.unReadMessages,
              }
              : item
          )
        );
      };

      getChatRoom();
      socketService.on("newMessage", updateChatCount);
      return () => {
        socketService.off("newMessage", updateChatCount);
      };
    }, [])
  );

  const formatChatTime = (timestamp) => {
    const messageDate = moment(timestamp);
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "days").startOf("day");

    if (messageDate.isSame(today, "day")) {
      return messageDate.format("hh:mm A");
    } else if (messageDate.isSame(yesterday, "day")) {
      return "Yesterday";
    } else {
      return messageDate.format("DD/MM/YY");
    }
  };

  const groupNameMap = {
    Deck: "Deck Hub",
    General: "Galley Chatter",
    Engine: "Engine Connect",
    "Chief engineers": "Engineer’s Hub",
    Captains: "Master’s Circle",
  };

  const RenderChatList = ({ item }) => {
    const timeString = formatChatTime(item?.lastMessage?.createdAt);
    const groupName = groupNameMap[item.groupName] || item.groupName;
    let chatroomItem = { ...item, groupName };

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("ChatRoom", { data: chatroomItem })}
        style={styles.chatRow}
      >
        {/* Avatar */}
        {/* <FastImage
          style={styles.avatar}
          resizeMode="cover"
          source={
            item.groupName === "Chief engineers"
              ? {
                  uri: "https://seabuddy.s3.amazonaws.com/1746796283232_engHub.jpeg",
                }
              : item.groupName === "General"
              ? {
                  uri: "https://seabuddy.s3.amazonaws.com/1746797636558_md.jpeg",
                }
              : item.groupName === "Captains"
              ? {
                  uri: "https://seabuddy.s3.amazonaws.com/1746796480258_ms.jpeg",
                }
              : ImagesAssets.health_card_image
          }
        /> */}

        {/* Middle Section */}
        <View style={styles.chatMiddle}>
         <Text style={item?.isUnReadMessage ? styles.chatTitle : {
                     fontSize: 16,
                     lineHeight: 20,
                     fontFamily: FontFamily.whyteInktrapRegular,
                     color: "#052B19",
                     marginBottom: 4
                   }}
                     numberOfLines={1}>
                     {groupName}
                   </Text>
          <Text
            style={[
              item?.isUnReadMessage
                ? { fontWeight: "600", color: "#052B19", fontFamily: "Poppins-SemiBold" }
                : styles.chatMessage,
            ]}
            numberOfLines={1}
          >
            {item?.lastMessage?.messageUser?.fullName
              ? item?.lastMessage?.messageUser?.fullName.split(" ")[0] + ": "
              : ""}
            {item?.lastMessage?.messageType !== "MESSAGE"
              ? item?.lastMessage?.messageType
              : (item?.lastMessage?.content || "")
                .replace(/\n/g, " ")
                .trim()
                .slice(0, 30) +
              ((item?.lastMessage?.content || "")
                .replace(/\n/g, " ")
                .trim().length > 30
                ? "..."
                : "")}
          </Text>
        </View>

        {/* Right Section */}
        <View style={styles.chatRight}>
          <Text
            style={[
              styles.chatTime,
              item?.isUnReadMessage && { color: Colors.secondary },
            ]}
          >
            {timeString}
          </Text>
          {item?.isUnReadMessage && item?.unReadMessages && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {Number(item?.unReadMessages) > 9
                  ? "9+"
                  : item?.unReadMessages || 0}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {userDetails?.department !== "Shore_Staff" ? (
        !isLoading && ChatGroup?.length === 0 ? (
          <Text style={styles.noGroupFindText}>
            You’re not part of any ship yet!
          </Text>
        ) : (
          <FlatList data={ChatGroup} renderItem={RenderChatList} />
        )
      ) : (
        <Text style={[styles.noGroupFindText, { color: "gray" }]}>
          This section is applicable only to ship staff.
        </Text>
      )}
    </View>
  );
};

export default VesselChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatMiddle: {
    flex: 1,
    justifyContent: "center",
  },
  chatTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: FontFamily.whyteInktrap,
    color: "#052B19",
    marginBottom: 4,
  },
  chatMessage: {
    fontSize: 13,
    color: "#555",
    fontFamily: "Poppins-Regular",
  },
  chatRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginLeft: 8,
  },
  chatTime: {
    fontSize: 11,
    color: "#999",
    marginBottom: 6,
    fontFamily: "Poppins-Regular",
  },
  unreadBadge: {
    backgroundColor: Colors.secondary,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  unreadText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
  },
  noGroupFindText: {
    margin: 20,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    color: "red",
  },
});
