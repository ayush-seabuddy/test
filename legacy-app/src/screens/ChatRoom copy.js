import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  FlatList,
  PermissionsAndroid,
  Alert,
} from "react-native";
import ChatRoomHeader from "../component/headers/ChatRoomHeader";
import Colors from "../colors/Colors";
import { ImagesAssets } from "../assets/ImagesAssets";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import { AvoidSoftInput } from "react-native-avoid-softinput";
import socketService from "../Socket/Socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { launchImageLibrary } from "react-native-image-picker";
import axios from "axios";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import RNFS from "react-native-fs";
import Ionicons from "react-native-vector-icons/Ionicons";

import { selectChat, setTypingStatus } from "../Redux/Socket/Chat";
import { apiServerUrl } from "../Api";
import Loader from "../component/Loader";
import moment from "moment";
const ChatRoom = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { chatList, typingStatus } = useSelector(selectChat);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [chatRoomId, setChatRoomID] = useState("");
  const [loading, setLoading] = useState(false);

  const [content, setcontent] = useState("");
  const [senderId, setsenderId] = useState("");
  const [shipId, setshipId] = useState("");
  const [contentImage, setcontentImage] = useState("");
  const [ChatList, setChatList] = useState([]);
  const [Status, setStatus] = useState();

  const [recording, setRecording] = useState(false);
  const [audioRecorderPlayer] = useState(new AudioRecorderPlayer());
  const [audioPath, setAudioPath] = useState(null);
  const flatListRef = useRef(null);

  const requestPermissions = async () => {
    try {
      requestManageStoragePermission();
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      return (
        granted["android.permission.RECORD_AUDIO"] === "granted" &&
        granted["android.permission.WRITE_EXTERNAL_STORAGE"] === "granted" &&
        granted["android.permission.READ_EXTERNAL_STORAGE"] === "granted"
      );
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const requestManageStoragePermission = async () => {
    if (Platform.OS === "android" && Platform.Version >= 30) {
      try {
        const isGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE
        );
        if (!isGranted) {
          const isRequestGranted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE
          );
          if (isRequestGranted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Manage Storage Permission granted");
          } else {
            console.log("Manage Storage Permission denied");
          }
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const checkPermissions = async () => {
    const recordAudioPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    const writeStoragePermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );
    const readStoragePermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );

    console.log("Record Audio Permission:", recordAudioPermission);
    console.log("Write Storage Permission:", writeStoragePermission);
    console.log("Read Storage Permission:", readStoragePermission);
  };

  const startRecording = async () => {
    checkPermissions();
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log("Permissions not granted!");
      return;
    }

    const path = `${RNFS.DocumentDirectoryPath}/audioMessage.mp4`;
    // setAudioPath(path);

    await audioRecorderPlayer.startRecorder(path);
    setRecording(true);
  };

  const stopRecording = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    setRecording(false);
    console.log("Recorded Audio Path:", result);
    // sendAudioMessage(result);
  };

  const { data } = route.params;

  AvoidSoftInput.setAdjustResize(true);

  const selectImage = async () => {
    const options = {
      mediaType: "photo",
      quality: 1,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("Image picker error: ", response.error);
      } else {
        console.log("Image picker error: success", response);
        try {
          const imageUri = response.assets[0];
          uploadImageToCloudinary(imageUri);
        } catch (error) {
          console.log("ajghasjghagahjagahsgajsd", error);
        }
      }
    });
  };

  const uploadImageToCloudinary = async (image) => {
    setLoading(true);

    try {
      const data = new FormData();
      const userDetailsString = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(userDetailsString);
      console.log("weiurpwuerowuepouwejlsdjgl", userDetails);
      data.append("file", {
        uri: image.uri,
        name: image.name || "image.jpg",
        type: image.type || "image/jpeg",
      });
      const res = await axios({
        method: "POST",
        url: apiServerUrl + "/user/uploadFile",
        data: data,
        headers: {
          authToken: userDetails.authToken,
          "Content-Type": "multipart/form-data", // You already have this in the `fetch` setup
        },
      });
      console.log("res-------> ", res?.data);
      if (res?.data?.responseCode === 200) {
        setcontentImage(res.data.result);
        await sendMessageImageUrl(res.data.result);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };
  const GetAllUser = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const Data = JSON.parse(dbResult);
      console.log(Data.id, Data.shipId, Data, "sfjagfhasghfasfjasghagshf");
      // senderId = Data.id;
      setsenderId(Data.id);
      // shipId = Data.shipId;
      setshipId(Data.shipId);
    } catch (error) {
      console.log(error);
    }
  };
  const sendMessageImageUrl = async (contentImage) => {
    try {
      console.log(contentImage, "asfkahfjkashfjkashfksahjks");

      if (contentImage.trim() === "") return; // Avoid sending empty messages

      const createdAt = new Date().toISOString();
      // const messageType = "IMAGE";
      const chat_payload = {
        senderId,
        chatRoomId,
        content: contentImage,
        createdAt,
        messageType: "IMAGE",
      };

      console.log("Image is sending----------------------->", chat_payload);

      socketService.emit("userSendMessage", chat_payload);
      setChatList((prevMessageList) => [...prevMessageList, chat_payload]);

      // setcontent("");
      // setcontentImage("");
      handleTyping(false);
      socketService.on("typingStatusUpdated", (data) => {
        console.log(data, "typs");
        dispatch(setTypingStatus(data));
      });
    } catch (error) {
      console.log("Error in sending the image ", error);
    }
  };
  const sendMessage = async () => {
    try {
      if (content.trim() === "") return; // Avoid sending empty messages

      const createdAt = new Date().toUTCString();
      const chat_payload = { senderId, chatRoomId, content, createdAt };

      socketService.emit("userSendMessage", chat_payload);
      setChatList((prevMessageList) => [...prevMessageList, chat_payload]);

      setcontent("");
      handleTyping(false);
      socketService.on("typingStatusUpdated", (data) => {
        console.log(data, "typs");
        dispatch(setTypingStatus(data));
      });
    } catch (error) { }
  };

  useEffect(() => {
    // Call GetAllUser to fetch user data
    GetAllUser();
  }, []); // Run only once, on mount

  useEffect(() => {
    // Trigger the socket logic only after senderId and shipId are available
    if (senderId && shipId) {
      const receiverId = data.id;
      const payload = { senderId, receiverId, shipId, page: 1, limit: 100 };
      console.log("Initiate User Chat Payload:", payload);

      socketService.emit("initiateUserChat", payload);

      const handleUserChatInitiated = (data) => {
        console.log("User Chat Initiated:", JSON.stringify(data, null, 2));
        setChatRoomID(data.chatRoomId);
        setChatList(data.previousMessages);
      };

      const handleReceiveUserMessage = (data) => {
        setChatList((prevMessageList) => [...prevMessageList, data]);
      };

      socketService.on("userChatInitiated", handleUserChatInitiated);
      socketService.on("receiveUserMessage", handleReceiveUserMessage);

      return () => {
        socketService.removeListener(
          "userChatInitiated",
          handleUserChatInitiated
        );
        socketService.removeListener(
          "receiveUserMessage",
          handleReceiveUserMessage
        );
      };
    }
  }, [senderId, shipId]); // Trigger when senderId or shipId change

  const formatChatTime = (timestamp) => {
    const messageDate = moment(timestamp);
    const today = moment().startOf("day");
    const yesterday = moment().subtract(1, "days").startOf("day");

    if (messageDate.isSame(today, "day")) {
      return `Today, ${messageDate.format("h:mm a")}`; // Example: Today, 8:12am
    } else if (messageDate.isSame(yesterday, "day")) {
      return "Yesterday";
    } else {
      return messageDate.format("DD/MM/YYYY"); // Example: 25/02/2025
    }
  };

  const ChatDataList = ({ item }) => {
    console.log(item, "jkhkhk");
    return (
      <View>
        <View
          style={{
            alignItems: senderId === item.senderId ? "flex-end" : "flex-start", // Right for sender, left for receiver
            marginHorizontal: 10,
            marginVertical: 5,
            justifyContent:
              senderId === item.senderId ? "flex-end" : "flex-start",
          }}
        >
          <View
            style={{
              backgroundColor:
                senderId === item.senderId ? "#84A402" : "#E6E6E680", // Green for sender, gray for receiver
              maxWidth: "80%", // Limit width for readability
              padding: 10,
              borderRadius: 15,
              borderBottomRightRadius: senderId === item.senderId ? 0 : 15,
              borderBottomLeftRadius: senderId === item.senderId ? 15 : 0,
            }}
          >
            {item.messageType === "IMAGE" ? (
              <View style={{ height: 100, width: 100 }}>
                <Image
                  style={{ height: "100%", width: "100%", borderRadius: 10 }}
                  src={item?.content}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <Text
                style={{
                  color: senderId === item.senderId ? "#fff" : "#000",
                  fontSize: 16,
                }}
              >
                {item.content}
              </Text>
            )}
            <View></View>
          </View>
          <Text
            style={{
              fontSize: 12,
              color: "#808080",
              textAlign: "right",
              marginTop: 5,
            }}
          >
            {item.createdAt && formatChatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const handleTyping = (typingStatus) => {
    socketService.emit("userTypingStatus", {
      chatRoomId,
      userId: senderId,
      typingStatus,
    });
  };

  useEffect(() => {
    // Cleanup typing status when component unmounts
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [typingTimeout]);

  return (
    <View style={styles.container}>
      <Loader isLoading={loading} />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <ChatRoomHeader navigation={navigation} data={data} />

      <FlatList
        ref={flatListRef}
        data={ChatList}
        renderItem={ChatDataList}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Container */}
      <View style={styles.inputContainer}>
        <View style={styles.inputInnerContainer}>
          <TouchableOpacity>
            <Image
              style={styles.icon}
              source={ImagesAssets.emojibtnimg}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={selectImage}>
            <Image
              style={styles.icon}
              source={ImagesAssets.attechment}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type something.."
            placeholderTextColor="gray"
            value={content}
            // onChangeText={(value) => setcontent(value);emitTypingStatus(value.trim() !== "")}
            onChangeText={(value) => {
              setcontent(value);
              handleTyping(true);
              if (typingTimeout) clearTimeout(typingTimeout); // Clear previous timeout

              setTypingTimeout(
                setTimeout(() => {
                  handleTyping(false); // Stop typing status after delay (e.g., 1 second)
                }, 1000)
              );
            }}
            // onSubmitEditing={sendMessage}
            onSubmitEditing={() => {
              sendMessage();
              handleTyping(false); // Stop typing status when message is sent
            }}
            onBlur={() => handleTyping(false)}
          />
        </View>
        {/* <TouchableOpacity
          // onPressIn={startRecording}
          // onPressOut={stopRecording}
          onPress={() => {
            sendMessage();
            handleTyping(false);
          }}
          style={styles.microphoneButton}
        >
          <Image
            style={styles.microphoneIcon}
            source={ImagesAssets.microphone}
            resizeMode="cover"
          />
        </TouchableOpacity> */}
        <TouchableOpacity
          // onPressIn={startRecording}
          // onPressOut={stopRecording}
          onPress={() => {
            sendMessage();
            handleTyping(false);
          }}
          style={styles.microphoneButton}
        >
          <Ionicons
            name={"send-outline"}
            size={20}
            color="#fff"
            style={styles.microphoneIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  chatContainer: {
    flexGrow: 1,
    padding: 20,
  },
  messageContainer: {
    maxWidth: "80%",
    borderRadius: 25,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  receivedMessage: {
    backgroundColor: "rgba(230, 230, 230, 0.5)",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  sentMessage: {
    backgroundColor: "#84A402",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  messageText: {
    color: "white",
  },
  timeText: {
    fontSize: 10,
    color: "gray",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "rgba(230, 230, 230, 0.5)",
    borderRadius: 25,
    marginHorizontal: 10,
    marginBottom: 10,
    height: 55,
  },
  inputInnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    width: 20,
    height: 20,
    marginHorizontal: 5,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    alignItems: "center",
    color: "black",
    paddingTop: 5,
  },
  microphoneButton: {
    backgroundColor: "#84A402",
    padding: 8,
    borderRadius: 50,
    marginLeft: 10,
  },
  microphoneIcon: {
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatRoom;
