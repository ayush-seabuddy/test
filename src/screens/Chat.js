import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
  Platform,
  FlatList,
} from "react-native";
import ChatHeader from "../component/headers/ChatHeader";
import { ImagesAssets } from "../assets/ImagesAssets";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import io from "socket.io-client";
import {
  apiCallWithToken,
  apiServerUrl,
  listAllUsers,
  socket,
  SOCKET_URL,
} from "../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import socketService from "../Socket/Socket";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  selectChatList,
  clearChatList,
} from "../Redux/Socket/Socket";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Badge } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";

const Chat = () => {
  const bottomSheetRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [UserList, setUserList] = useState([]);

  const handleSheetChanges = useCallback((index) => {
    // Depending on your configuration, you can set isOpen accordingly.
    // For example, if index >= 0, consider it open.
    setIsOpen(index >= 0);
  }, []);

  // Function to toggle the bottom sheet on button press
  const toggleBottomSheet = () => {
    if (isOpen) {
      // Close the bottom sheet if it's open
      bottomSheetRef.current.close();
    } else {
      // Expand (open) the bottom sheet if it's closed
      bottomSheetRef.current.expand();
      GetAllUser();
    }
  };
  // callbacks

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const chatList = useSelector(selectChatList);

  const GetAllUser = async () => {
    const userDetails = await AsyncStorage.getItem("userDetails");
    const getData = JSON.parse(userDetails);

    try {
      const response = await apiCallWithToken(
        apiServerUrl + "/user/listAllUsers?shipId=" + getData.shipId,
        "GET",
        null,
        getData.authToken
      );
      setUserList(response.result.usersList);
    } catch (error) { }
  };

  useFocusEffect(
    useCallback(() => {
      socketService.initilizeSocket();
      dispatch(fetchUsers());

      return () => {
        socketService.removeListener("usersChatList");
        dispatch(clearChatList());

        socketService.on("userDisconnected", (data) => {
        });
      };
    }, [dispatch])
  );

  const handlerChat = (item) => {
    navigation.navigate("ChatRoom", { data: item });
    bottomSheetRef.current.close();
  };

  const RenderChatList = ({ item }) => {

    return (
      <View style={[styles.cardContainer1]}>
        <TouchableOpacity
          style={styles.frameParent}
          onPress={() => {
            navigation.navigate("ChatRoom", { data: item });
          }}
        >
          <Image
            style={styles.ellipseWrapper}
            resizeMode="cover"
            source={{ uri: item?.profileUrl }}
          />
          {item?.isOnline ? (
            <Image
              style={styles.frameChild}
              resizeMode="cover"
              source={ImagesAssets.Active_image}
            />
          ) : null}
          <View style={styles.frameGroup}>
            <View style={styles.captParentFlexBox}>
              <Text style={styles.captBarbousa1}>{item?.fullName}</Text>

              {item?.lastMessage != null ? (
                <Text style={styles.pm}>
                  {moment(item?.lastMessage?.createdAt).format("MM:ss a")}
                </Text>
              ) : null}
            </View>
            {/* <View style={styles.captGotItThanksParent}>
              <Text style={styles.captGotItContainer}>
                {item?.lastMessage != null ? (
                  <Text style={styles.gotItThanks}>
                    {(item?.lastMessage?.messageType === "MESSAGE" &&
                      item?.lastMessage?.content) ||
                      ""}
                    {(item?.lastMessage?.messageType === "IMAGE" &&
                      (
                        <Ionicons
                          name={"image"}
                          size={20}
                          color="#000"
                          style={styles.microphoneIcon}
                        />
                      ) + " Image") ||
                      ""}
                  </Text>
                ) : null}
              </Text>
             <View style={styles.wrapper}>
                <Text style={styles.text}>14</Text>
              </View>
            </View> */}
            <View style={styles.captGotItContainer}>
              {item?.lastMessage != null ? (
                item?.lastMessage?.messageType === "MESSAGE" ? (
                  <Text style={styles.gotItThanks}>
                    {item?.lastMessage?.content}
                  </Text>
                ) : item?.lastMessage?.messageType === "IMAGE" ? (
                  <View style={styles.imageMessageContainer}>
                    <Ionicons
                      name="image"
                      size={20}
                      color="#000"
                      style={styles.imageIcon}
                    />
                    <Text style={styles.imageLabel}> Image</Text>
                  </View>
                ) : null
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const RenderUserList = ({ item }) => {

    return (
      <View style={[styles.cardContainer1]}>
        <TouchableOpacity
          style={styles.frameParent}
          onPress={() => handlerChat(item)}
        >
          <Image
            style={styles.ellipseWrapper}
            resizeMode="cover"
            source={{
              uri:
                item?.profileUrl ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
            }}
          />

          <View style={styles.frameGroup}>
            <View style={styles.captParentFlexBox}>
              <Text style={styles.captBarbousa1}>{item?.fullName}</Text>
            </View>
            <View style={styles.captGotItThanksParent}>
              <Text style={[styles.gotItThanks, { marginTop: 5 }]}>
                {item?.designation || ""}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      {/* <ChatHeader navigation={navigation} /> */}

      <View style={{ marginTop: "20%" }}>
        <FlatList
          renderItem={RenderChatList}
          data={chatList}
          style={{ marginBottom: "20%" }}
        />
      </View>

      <TouchableOpacity style={styles.stickyButton} onPress={toggleBottomSheet}>
        <Image
          style={{ width: 18, height: 18 }}
          source={ImagesAssets.plus}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        snapPoints={["100%"]}
        index={-1}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Badge
            style={{
              backgroundColor: "#f8f8f8",
              marginVertical: 10,
              height: 30,
              paddingHorizontal: 10,
            }}
            onPress={toggleBottomSheet}
          >
            <Text
              style={{
                color: "#000",
                fontFamily: "Poppins-SemiBold",
                fontSize: 11,
              }}
            >
              Close
            </Text>
          </Badge>

          <FlatList
            data={UserList}
            renderItem={RenderUserList}
            style={{ paddingBottom: "40%" }}
          />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 12,
    // backgroundColor: '#FFFFFF',
  },
  scrollViewContent: {
    paddingBottom: 100, // Extra space for bottom padding
  },
  cardContainer: {
    backgroundColor: "#f4f4f4", // Gray background for each card
    marginVertical: 3, // Spacing between each card
    borderRadius: 8, // Rounded corners
    padding: 10, // Padding inside the card
  },
  cardContainer1: {
    backgroundColor: "#F7FBE6", // Gray background for each card
    marginVertical: 3, // Spacing between each card
    borderRadius: 8, // Rounded corners
    padding: 10, // Padding inside the card
  },
  stickyButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "rgba(84, 97, 94, 0.80)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  frameParent: {
    flexDirection: "row",
    alignItems: "center",
  },
  frameChild: {
    position: "absolute",
    top: 32,
    left: 32,
    width: 8,
    height: 8,
  },
  ellipseWrapper: {
    borderRadius: 26,
    width: 44,
    height: 44,
    alignItems: "center",
  },
  captBarbousa: {
    fontSize: 14,
    lineHeight: 21,
    color: "#161616",
    fontFamily: "Poppins-Medium",
  },
  captBarbousa1: {
    // fontWeight: "600",
    fontSize: 16,
    lineHeight: 21,
    color: "#052B19",
    fontFamily: "Poppins-SemiBold",
  },
  pm: {
    fontSize: 12,
    lineHeight: 14,
    color: "#454545",
    fontFamily: "Poppins-Regular",
  },
  capt: {
    fontSize: 12,
    lineHeight: 14,
    color: "#454545",
    fontFamily: "Poppins-Regular",
  },
  gotItThanks: {
    fontSize: 12,
    lineHeight: 14,
    color: "#949494",
    fontFamily: "Poppins-Regular",
  },
  captGotItContainer: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Poppins-Regular",
    color: "#454545",
  },
  wrapper: {
    borderRadius: 20,
    backgroundColor: "#b0db02",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 5,
    alignItems: "center",
  },
  text: {
    fontSize: 8,
    lineHeight: 10,
    color: "#fff",
    fontFamily: "Poppins-Medium",
  },
  captParentFlexBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "stretch",
  },
  captGotItThanksParent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  frameGroup: {
    flex: 1,
    marginLeft: 10,
  },
  contentContainer: {},
  imageMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  imageIcon: {
    marginRight: 5,
  },
  imageLabel: {
    fontSize: 14,
    color: "#000",
  },
  imageStyle: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
});

export default Chat;
