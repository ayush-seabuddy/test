import React, { useCallback, useEffect, useRef, useState } from "react";
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
  FlatList,
  PermissionsAndroid,
  Keyboard,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  Linking,
} from "react-native";
import ChatRoomHeader from "../component/headers/ChatRoomHeader";
import Colors from "../colors/Colors";
import { ImagesAssets } from "../assets/ImagesAssets";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import { AvoidSoftInput } from "react-native-avoid-softinput";
import socketService from "../Socket/Socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import axios from "axios";
import AudioRecorderPlayer from "react-native-audio-recorder-player";
import RNFS from "react-native-fs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { selectChat, setTypingStatus } from "../Redux/Socket/Chat";
import { apiCallWithToken, apiServerUrl, getApiLevel } from "../Api";
import Loader from "../component/Loader";
import moment from "moment";
import MediaPreviewModal from "../component/Modals/MediaPreviewModal";
import FastImage from "react-native-fast-image";
import { useFocusEffect } from "@react-navigation/native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import RBSheet from "react-native-raw-bottom-sheet";
import { Camera, Check, Paperclip, Send, SendHorizonal } from "lucide-react-native";

const ChatRoom = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { chatList, typingStatus } = useSelector(selectChat);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [chatRoomId, setChatRoomID] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const [content, setContent] = useState("");
  const [senderId, setSenderId] = useState("");
  const [shipId, setShipId] = useState("");
  const [contentImage, setContentImage] = useState("");
  const [chatListState, setChatList] = useState([]);
  const [newMessages, setNewMessages] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [participant, setParticipants] = useState("");
  const [participantIds, setParticipantIds] = useState([]);
  const [recording, setRecording] = useState(false);
  const [audioRecorderPlayer] = useState(new AudioRecorderPlayer());
  const [audioPath, setAudioPath] = useState(null);
  const flatListRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPageDataWaiting, setLastPageDataWaiting] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [totalPage, setTotalPage] = useState(1);
  const [keyboardPadding, setKeyboardPadding] = useState(0);
  const [chatItemPadding, setChatItemPadding] = useState(0);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [inputHeight, setInputHeight] = useState(40);
  const [editModal, setEditModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [myReaction, setMyReaction] = useState('');
  const textInputRef = useRef(null);
  const PAGE_SIZE = 50;
  const bottomSheetRef = useRef(null);
  const [reactionCountList, setReactionCountList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");

  const closeSheet = () => {
    console.log("Closing BottomSheet");
    bottomSheetRef.current?.close();
    setReactionCountList([]);
  };

  const fetchChatReactions = async (id) => {
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) {
        console.error("No auth token found");
        return;
      }
      const response = await apiCallWithToken(
        `${apiServerUrl}/user/getReactionsOnMessage?messageId=${id}`,
        "GET",
        null,
        authToken
      );
      if (response.responseCode) {
        if (response.result && response.result.length > 0) {
          let myReaction = response.result.find(reaction => String(reaction.userId) == senderId);
          let reactionWithoutMy = response.result.filter(reaction => String(reaction.userId) != senderId);
          if (myReaction) {
            setReactionCountList([myReaction, ...reactionWithoutMy]);
          } else {
            setReactionCountList(response.result);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const { width, height } = Dimensions.get("screen");

  let { data } = route.params;

  if (typeof data == "string") JSON.parse(data);
  if (!data && route.params.item) {
    data = route.params.item;
  }

  data = typeof data === "string" ? JSON.parse(data) : data;

  const emojis = ["👍", "😊", "❤️", "😂", "😮", "😢"];

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardPadding(70);
      setChatItemPadding(50);
    });

    const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardPadding(0);
      setChatItemPadding(0);
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const requestPermissions = async () => {
    try {
      if (Platform.OS === "android" && Platform.Version >= 30) {
        const isGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE
        );
        if (!isGranted) {
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE
          );
          if (result !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Manage Storage Permission denied");
            return false;
          }
        }
      }

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
      console.warn("Permission request error:", err);
      return false;
    }
  };
  const renderMessageContent = (content, senderId, item, isSearchResult = false, searchQuery = "") => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);

    if (isSearchResult && searchQuery) {
      const regex = new RegExp(`(${searchQuery})`, "gi");
      return content.split(regex).map((part, index) =>
        regex.test(part.toLowerCase()) ? (
          <Text key={index} style={{ backgroundColor: item.senderId === senderId ? Colors.secondary : Colors.secondary, color: senderId === item.senderId ? "#fff" : "#000" }}>
            {part}
          </Text>
        ) : (
          <Text key={index}>{part}</Text>
        )
      );
    }

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <Text
            key={index}
            style={{
              color: item.senderId === senderId ? "#fff" : Colors.secondary,
              textDecorationLine: "underline",
            }}
            onPress={() => Linking.openURL(part)}
          >
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const startRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.log("Permissions not granted!");
      return;
    }

    const path = `${RNFS.DocumentDirectoryPath}/audioMessage.mp4`;
    setAudioPath(path);
    await audioRecorderPlayer.startRecorder(path);
    setRecording(true);
  };

  const stopRecording = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    setRecording(false);
    console.log("Recorded Audio Path:", result);
  };

  const selectImage = async () => {
    const options = {
      mediaType: "photo",
      quality: 1,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("Image picker error:", response.error);
      } else {
        try {
          const imageUri = response.assets[0];
          setMediaModalVisible(true);
          setSelectedMedia({ uri: imageUri.uri, isVideo: false, imageUri });
        } catch (error) {
          console.log("Image selection error:", error);
        }
      }
    });
  };

  const selectImageFromCamera = async () => {
    const options = {
      mediaType: "photo",
      quality: 1,
    };
    setLoading(true);

    launchCamera(options, async (response) => {
      if (response.didCancel) {
        console.log("User cancelled camera");
        setLoading(false);
      } else if (response.error) {
        console.log("Camera error:", response.error);
        setLoading(false);
      } else {
        try {
          const imageUri = response.assets[0];
          setMediaModalVisible(true);
          setSelectedMedia({ uri: imageUri.uri, isVideo: false, imageUri });
          setLoading(false);
        } catch (error) {
          console.log("Camera image error:", error);
          setLoading(false);
        }
      }
    });
  };

  const uploadImageToCloudinary = async (image) => {
    setLoading(true);
    try {
      const userDetailsString = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(userDetailsString);

      const data = new FormData();
      data.append("file", {
        uri: image.uri,
        name: image.name || "image.jpg",
        type: image.type || "image/jpeg",
      });

      const res = await axios({
        method: "POST",
        url: `${apiServerUrl}/user/uploadFile`,
        data: data,
        headers: {
          authToken: userDetails.authToken,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res?.data?.responseCode === 200) {
        setContentImage(res.data.result);
        await sendMessageImageUrl(res.data.result);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
      setMediaModalVisible(false);
      setSelectedMedia(null);
    }
  };

  const sendMessageImageUrl = async (contentImage) => {
    if (!contentImage || contentImage.trim() === "") return;

    try {
      const createdAt = new Date().toISOString();
      const createdAtId = Date.now();
      const chat_payload = {
        senderId,
        chatRoomId,
        content: contentImage,
        createdAt,
        messageType: "IMAGE",
        createdAtId: Number(createdAtId),
        replyTo: replyingTo ? replyingTo.id : null,
      };

      socketService.emit("userSendMessage", chat_payload);
      setChatList((prevMessageList) => [chat_payload, ...prevMessageList]);
      setContentImage("");
      setReplyingTo(null);
      handleTyping(false);
    } catch (error) {
      console.log("Error sending image message:", error);
    }
  };

  const sendMessage = async () => {
    if (content.trim() === "") return;

    try {
      if (editingMessageId) {
        const editPayload = {
          senderId,
          chatRoomId,
          content,
          ChatId: editingMessageId,
          type: "UPDATE",
        };
        socketService.emit("userEditMessage", editPayload);
        setEditingMessageId(null);
      } else {
        const createdAt = new Date().toUTCString();
        const createdAtId = Date.now();
        const chat_payload = {
          senderId,
          chatRoomId,
          content,
          createdAt,
          createdAtId: Number(createdAtId),
          replyTo: replyingTo ? replyingTo.id : null,
        };
        socketService.emit("userSendMessage", chat_payload);
        chat_payload.parentMessage = replyingTo;
        setChatList((prevMessageList) => [chat_payload, ...prevMessageList]);
      }
      setContent("");
      setReplyingTo(null);
      handleTyping(false);
      setInputHeight(55);
    } catch (error) {
      console.log("Error sending/editing message:", error);
    }
  };

  const handleEditMessage = (message) => {
    if (!message.id) {
      return;
    }
    if (message.messageType === "IMAGE") {
      return;
    }
    setContent(message.content);
    setEditingMessageId(message.id);
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  const handleDeleteMessage = (message) => {
    socketService.emit("userEditMessage", {
      senderId,
      ChatId: message.id,
      type: "DELETE",
    });
  };

  const handleReplyMessage = (message) => {
    setReplyingTo(message);
    setEditModal(false);
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  const handleEmojiReaction = (message, emoji) => {
    socketService.emit("userReactMessage", {
      senderId,
      chatRoomId,
      ChatId: message.id,
      reaction: emoji,
    });

    setChatList((prevMessageList) => {
      return prevMessageList.map((msg) => {
        if (msg.id === message.id) {
          let chatReactionDetails = msg?.chatReactionDetails || [];
          let alreadyReacted = msg?.chatReactionDetails?.find((item) => item.userId === senderId);
          if (alreadyReacted) {
            if (alreadyReacted.reaction == emoji) {
              chatReactionDetails = chatReactionDetails?.filter((item) => item.userId !== senderId);
            } else {
              chatReactionDetails = chatReactionDetails?.filter((item) => item.userId !== senderId);
              chatReactionDetails?.push({ messageId: message.id, reaction: emoji, userId: senderId });
            }
          } else {
            chatReactionDetails?.push({ messageId: message.id, reaction: emoji, userId: senderId });
          }
          return { ...msg, chatReactionDetails: chatReactionDetails };
        }
        return msg;
      });
    });
    setEditModal(false);
  };

  const handleDelteReaction = (messageId, emoji) => {
    const message = chatListState.find((msg) => String(msg.id) === String(messageId));
    if (!message) return;
    socketService.emit("userReactMessage", {
      senderId,
      chatRoomId,
      ChatId: message.id,
      reaction: emoji,
    });

    setChatList((prevMessageList) => {
      return prevMessageList.map((msg) => {
        if (msg.id === message.id) {
          let chatReactionDetails = msg?.chatReactionDetails || [];
          let alreadyReacted = msg?.chatReactionDetails?.find((item) => item.userId === senderId);
          if (alreadyReacted) {
            if (alreadyReacted.reaction == emoji) {
              chatReactionDetails = chatReactionDetails?.filter((item) => item.userId !== senderId);
            } else {
              chatReactionDetails = chatReactionDetails?.filter((item) => item.userId !== senderId);
              chatReactionDetails?.push({ messageId: message.id, reaction: emoji, userId: senderId });
            }
          } else {
            chatReactionDetails?.push({ messageId: message.id, reaction: emoji, userId: senderId });
          }
          return { ...msg, chatReactionDetails: chatReactionDetails };
        }
        return msg;
      });
    });
    setEditModal(false);
  };

  const handleSaveEdit = () => {
    if (!editingMessage || editedContent.trim() === "") return;
    socketService.emit("userEditMessage", {
      senderId,
      chatRoomId,
      content: editedContent,
      ChatId: editingMessage.id,
      type: "UPDATE",
    });
  };

  const initializeChat = async (currentPage) => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      if (!userDetails) return;
      const response = await axios({
        method: "GET",
        url: `${apiServerUrl}/user/viewUserProfile`,
        headers: {
          authToken: userDetails.authToken,
        },
        params: {
          userId: userDetails.id,
        },
      });
      if (response.data.responseCode === 200) {
        const { id, shipId } = response.data.result;
        setSenderId(id);
        setShipId(shipId);

        if (id && data?.id) {
          const payload = {
            userId: id,
            chatRoomId: data.id,
            page: currentPage,
            limit: PAGE_SIZE,
          };
          if (socketService.isConnected) {
            socketService.emit("joinChatRoom", payload);
          } else {
            setTimeout(() => {
              socketService.emit("joinChatRoom", payload);
            }, 2000);
          }

          if (currentPage == 1) {
            setChatList([]);
          }

          socketService.emit("userReadMessage", {
            userId: id,
            chatRoomId: data.id,
          });
        }
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      initializeChat(currentPage);
    }, [currentPage, data?.id])
  );

  useFocusEffect(
    useCallback(() => {
      const handleUserChatInitiated = (response) => {
        setParticipants(response.totalParticipants);
        setParticipantIds(response.participantIds);
        setGroupName(response.groupName);
        setChatRoomID(response.chatRoomId);
        setChatLoading(false);
        if (response?.previousMessages?.length > 0) {
          setLastPageDataWaiting(response.currentPage);
          setTotalPage(response.totalPages);
          setChatList((prev) => [...prev, ...response.previousMessages]);
        } else {
          setHasMoreMessages(false);
        }
        setLoadingMore(false);
      };

      const handleReceiveUserMessage = (datas) => {
        if (datas.chatRoomId == data.id) {
          setChatList((prevMessageList) => [datas, ...prevMessageList]);
          const payload = {
            userId: senderId,
            chatRoomId: datas.chatRoomId,
          };
          socketService.emit("userReadMessage", payload);
        }
        setChatLoading(false);
      };

      const handleUserEditMessage = (data) => {
        setChatList((prevMessageList) =>
          prevMessageList.map((msg) =>
            msg.id === data.id
              ? { ...msg, content: data.content || msg.content, status: data.status }
              : msg
          )
        );
      };

      const handleUserReactMessage = (data) => {
        setChatList((prevMessageList) =>
          prevMessageList.map((msg) =>
            msg.id === data.ChatId
              ? { ...msg, reaction: data.reaction }
              : msg
          )
        );
      };

      const handleGetUserMessage = (data) => {
        setChatList((prevMessageList) =>
          prevMessageList.map((msg) =>
            String(msg.createdAtId) === String(data.createdAtId) ? { ...data, id: data.id } : msg
          )
        );
      };

      socketService.on("userPreviousMessages", handleUserChatInitiated);
      socketService.on("receiveUserMessage", handleReceiveUserMessage);
      socketService.on("typingStatusUpdated", (data) => {
        dispatch(setTypingStatus(data));
      });
      socketService.on("receiveUserEditMessage", handleUserEditMessage);
      socketService.on("getUserEditMessage", handleUserEditMessage);
      socketService.on("receiveUserReactMessage", handleUserReactMessage);
      socketService.on("getUserMessage", handleGetUserMessage);
      socketService.on("receiveChatReaction", (data) => {
        if (data.messageId) {
          setChatList((prevMessageList) => {
            return prevMessageList.map((msg) => {
              if (String(msg.id) == String(data.messageId)) {
                let chatReactionDetails = msg.chatReactionDetails || [];
                let alreadyReacted = msg?.chatReactionDetails?.find((item) => item.userId === data.userId);
                if (alreadyReacted) {
                  if (alreadyReacted.reaction == data.reaction) {
                    chatReactionDetails = chatReactionDetails?.filter((item) => item.userId !== data.userId);
                  } else {
                    chatReactionDetails = chatReactionDetails?.filter((item) => item.userId !== data.userId);
                    chatReactionDetails?.push(data);
                  }
                } else {
                  chatReactionDetails.push(data);
                }
                return { ...msg, chatReactionDetails: chatReactionDetails };
              }
              return msg;
            });
          });
        }
      });
      socketService.on("getChatReaction", (data) => {
        console.log("getChatReaction: ", data);
      });

      return () => {
        socketService.off("userPreviousMessages", handleUserChatInitiated);
        socketService.off("receiveUserMessage", handleReceiveUserMessage);
        socketService.off("typingStatusUpdated");
        socketService.off("receiveUserEditMessage", handleUserEditMessage);
        socketService.off("getUserEditMessage", handleUserEditMessage);
        socketService.off("receiveUserReactMessage", handleUserReactMessage);
        socketService.off("getUserMessage", handleGetUserMessage);
        socketService.off("receiveChatReaction");
        socketService.off("getChatReaction");
      };
    }, [])
  );

  const formatChatTime = (timestamp) => {
    const messageDate = moment(timestamp);
    return messageDate.format("h:mm a");
  };

  const onSearch = (searchValue) => {
    setSearchQuery(searchValue);
    if (!searchValue || !chatListState || chatListState.length === 0) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const filtered = chatListState
      .map((item, index) => ({ ...item, originalIndex: index }))
      .filter((item) => item.content.toLowerCase().includes(searchValue.toLowerCase()));

    setSearchResults(filtered);
    setCurrentSearchIndex(filtered.length > 0 ? 0 : -1);

    if (filtered.length > 0) {
      flatListRef.current.scrollToIndex({ index: filtered[0].originalIndex, animated: true });
    }
  };

  const navigateSearch = (direction) => {
    if (searchResults.length === 0) return;

    let newIndex = currentSearchIndex;
    if (direction === "up") {
      newIndex = currentSearchIndex > 0 ? currentSearchIndex - 1 : searchResults.length - 1;
    } else if (direction === "down") {
      newIndex = currentSearchIndex < searchResults.length - 1 ? currentSearchIndex + 1 : 0;
    }

    setCurrentSearchIndex(newIndex);
    const targetIndex = searchResults[newIndex].originalIndex;
    flatListRef.current.scrollToIndex({ index: targetIndex, animated: true });
  };

  const ChatDataList = ({ item, index }) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateSeparatorContainer}>
          <View style={styles.dateSeparatorText}>
            <Text>{formatDateSeparator(item.date)}</Text>
          </View>
        </View>
      );
    }

    const handleMediaPress = (uri) => {
      setSelectedMedia({ uri, isVideo: false });
      setMediaModalVisible(true);
    };

    const handleLongPress = (item) => {
      let reaction = item?.chatReactionDetails?.find(item => String(item.userId) == String(senderId))?.reaction || "";
      setMyReaction(reaction);
      setEditingMessage(item);
      setEditModal(true);
    };

    const isSearchResult = searchResults.some((result) => result.id === item.id);

    return (
      <View style={{ flexDirection: 'column' }}>
        <TouchableOpacity
          onLongPress={() => handleLongPress(item)}
          disabled={item.status === "DELETE"}
        >
          <View
            style={{
              alignItems: senderId === item.senderId ? "flex-end" : "flex-start",
              marginHorizontal: 10,
              marginVertical: 5,
              justifyContent: senderId === item.senderId ? "flex-end" : "flex-start",
            }}
          >
            <View style={{ flexDirection: "row" }}>
              {senderId !== item.senderId && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("CrewProfile", { item: item.messageUser })}
                >
                  <Image
                    source={{ uri: item?.messageUser?.profileUrl }}
                    style={{
                      height: 40,
                      width: 40,
                      borderRadius: 20,
                      marginRight: 5,
                    }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              <View
                style={{
                  backgroundColor:
                    senderId === item.senderId ? "#82934b" : "#E6E6E680",
                  maxWidth: "80%",
                  padding: 10,
                  paddingTop: 5,
                  borderRadius: 15,
                  borderBottomRightRadius: senderId === item.senderId ? 0 : 15,
                  borderBottomLeftRadius: senderId === item.senderId ? 15 : 0,
                }}
              >
                {senderId !== item.senderId && (
                  <>
                    <Text style={{ fontSize: 12, color: "black", marginBottom: 5 }}>
                      {item?.messageUser?.fullName} ({item?.messageUser?.designation})
                    </Text>
                    {item?.messageUser?.department !== "Shore_Staff" && (
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: item?.messageUser?.ship?.crewMembers?.find(
                              (member) => member.userId === item?.messageUser?.id
                            )?.isBoarded
                              ? "#66FF66"
                              : "#FF6666",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 5,
                          }}
                        >
                          <View
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: item?.messageUser?.ship?.crewMembers?.find(
                                (member) => member.userId === item?.messageUser?.id
                              )?.isBoarded
                                ? "#00CC00"
                                : "#CC0000",
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 9,
                            color: item?.messageUser?.ship?.crewMembers?.find(
                              (member) => member.userId === item?.messageUser?.id
                            )?.isBoarded
                              ? "green"
                              : "#f43d3d",
                          }}
                        >
                          (
                          {item?.messageUser?.ship?.crewMembers?.find(
                            (member) => member.userId === item?.messageUser?.id
                          )?.isBoarded
                            ? "Onboard"
                            : "Onleave"}
                          )
                        </Text>
                      </View>
                    )}
                  </>
                )}
                {item.parentMessage && item.status !== "DELETE" && (
                  <View style={{ backgroundColor: senderId === item?.senderId ? 'rgb(185, 206, 100)' : "rgb(189, 186, 186)", padding: 5, borderRadius: 5, marginBottom: 5 }}>
                    <Text style={{ fontSize: 12, color: senderId === item?.senderId ? '#444' : "rgb(81, 99, 10)", fontStyle: "italic" }}>
                      {item.parentMessage?.messageUser?.fullName || "Unknown"}
                    </Text>
                    {item?.parentMessage?.messageType === "IMAGE" && item?.parentMessage?.status !== "DELETE" ? (
                      <TouchableOpacity onPress={() => handleMediaPress(item?.parentMessage?.content)}>
                        <View style={{ height: 60, width: 200 }}>
                          {imageLoading && (
                            <ActivityIndicator
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: [{ translateX: -15 }, { translateY: -15 }],
                              }}
                              size="large"
                              color={Colors.green}
                            />
                          )}
                          <View
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}>
                            <Text>Photo</Text>
                            <FastImage
                              style={{ height: 60, width: 60, borderRadius: 10 }}
                              source={{ uri: item?.parentMessage?.content }}
                              onLoadStart={() => setImageLoading(true)}
                              onLoadEnd={() => setImageLoading(false)}
                              resizeMode="cover"
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                        {item?.parentMessage?.status === "DELETE" ? (
                          <Text
                            style={{
                              color: senderId === item?.parentMessage?.senderId ? "#d9d4d4" : "#666565",
                              fontSize: 14,
                              fontStyle: "italic",
                            }}
                          >
                            This message has been deleted
                          </Text>
                        ) : (
                          <Text
                                style={{
                              color: "#000",
                              fontSize: 16,
                            }}
                          >
                                {renderMessageContent(item?.parentMessage?.content, senderId, item?.parentMessage, isSearchResult, searchQuery)}
                          </Text>
                          )}
                      </View>
                    )}
                  </View>
                )}
                {item.messageType === "IMAGE" && item.status !== "DELETE" ? (
                  <TouchableOpacity onPress={() => handleMediaPress(item.content)}>
                    <View style={{ height: 200, width: 200 }}>
                      {imageLoading || !item?.id && (
                        <ActivityIndicator
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: [{ translateX: -15 }, { translateY: -15 }],
                          }}
                          size="large"
                          color={Colors.green}
                        />
                      )}
                      <FastImage
                        style={{ height: "100%", width: "100%", borderRadius: 10 }}
                        source={{ uri: item?.content }}
                        onLoadStart={() => setImageLoading(true)}
                        onLoadEnd={() => setImageLoading(false)}
                        resizeMode="cover"
                      />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
                    {item.status === "DELETE" ? (
                      <Text
                        style={{
                          color: senderId === item.senderId ? "#d9d4d4" : "#666565",
                          fontSize: 14,
                          fontStyle: "italic",
                        }}
                      >
                        This message has been deleted
                      </Text>
                    ) : (
                      <Text
                        style={{
                          color: senderId === item.senderId ? "#fff" : "#000",
                          fontSize: 16,
                        }}
                      >
                            {renderMessageContent(item.content || "", senderId, item, isSearchResult, searchQuery)}
                          </Text>
                    )}
                    {item.reaction && (
                      <Text style={{ fontSize: 16, marginLeft: 5 }}>{item.reaction}</Text>
                    )}
                  </View>
                )}
                {item.status !== "DELETE" && (
                  <View>
                    {item.status === "EDIT" && item.messageType !== "IMAGE" && (
                      <Text
                        style={{
                          color: senderId === item.senderId ? "#ddd" : "#666",
                          fontSize: 12,
                          marginLeft: 5,
                          textAlign: "right",
                        }}
                      >
                        (Edited)
                      </Text>
                    )}
                    <Text
                      style={{
                        fontSize: 12,
                        color: senderId === item.senderId ? "black" : "#808080",
                        textAlign: "right",
                        marginTop: 5,
                        marginLeft: 45,
                      }}
                    >
                      {item.createdAt && formatChatTime(item.createdAt)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {item.status !== "DELETE" && item?.chatReactionDetails?.length > 0 && (
          <TouchableOpacity
            style={{
              flexDirection:
                item.chatReactionDetails.length === 1 ? "column" : "row",
              alignSelf: senderId === item.senderId ? "flex-end" : "flex-start",
              marginTop: -12,
              marginLeft: senderId === item.senderId ? 0 : 55,
              marginBottom: 10,
              marginRight: senderId === item.senderId ? 9 : 0,
              backgroundColor: "#ededed",
              borderRadius:
                item.chatReactionDetails.length === 1 ? 30 : 15, // rounder for single
              paddingHorizontal:
                item.chatReactionDetails.length === 1 ? 6 : 5,
              paddingVertical:
                item.chatReactionDetails.length === 1 ? 6 : 3,
              borderWidth: 0.2,
              borderColor: "#3b3934",
              alignItems: "center",
              justifyContent: "center",
              minWidth: item.chatReactionDetails.length === 1 ? 28 : undefined,
              minHeight: item.chatReactionDetails.length === 1 ? 28 : undefined,
            }}
            onPress={() => {
              fetchChatReactions(item.id);
              setLoading(true);
              setTimeout(() => {
                bottomSheetRef.current.open();
                setLoading(false);
              }, 2000);
            }}
          >
            <Text style={{ fontSize: 14, color: "black" }}>
              {item.chatReactionDetails[0]?.reaction}
            </Text>
            {item.chatReactionDetails.length > 1 && (
              <Text
                style={{
                  fontSize: 12,
                  color: "black",
                  fontWeight: "600",
                  marginLeft: 4,
                }}
              >
                {item.chatReactionDetails.length}
              </Text>
            )}
          </TouchableOpacity>
        )}

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

  const formatDateSeparator = (date) => {
    const messageDate = moment(date).local().startOf("day");
    const today = moment().local().startOf("day");
    const yesterday = moment().local().subtract(1, "days").startOf("day");

    if (messageDate.isSame(today, "day")) {
      return "Today";
    } else if (messageDate.isSame(yesterday, "day")) {
      return "Yesterday";
    } else {
      return messageDate.format("DD/MM/YYYY");
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && currentPage < totalPage && currentPage == lastPageDataWaiting) {
      setLoadingMore(true);
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const getGroupedChatList = () => {
    const groupedMessages = [];
    let currentDateKey = null;
    let buffer = [];

    chatListState.forEach((message, index) => {
      const messageDate = moment(message.createdAt).local().startOf("day");
      const dateKey = messageDate.format("YYYY-MM-DD");

      if (currentDateKey === null) {
        currentDateKey = dateKey;
      }

      if (dateKey !== currentDateKey) {
        groupedMessages.push(...buffer);
        buffer = [];
        groupedMessages.push({
          type: "date",
          date: moment(currentDateKey).toDate(),
          id: `date-${currentDateKey}`,
        });
        currentDateKey = dateKey;
      }

      buffer.push({
        type: "message",
        ...message,
      });

      if (index === chatListState.length - 1) {
        groupedMessages.push(...buffer);
        groupedMessages.push({
          type: "date",
          date: moment(dateKey).toDate(),
          id: `date-${dateKey}`,
        });
      }
    });

    return groupedMessages;
  };

  const handleContentSizeChange = (event) => {
    const { height } = event.nativeEvent.contentSize;
    const lineHeight = 20;
    const lines = Math.min(Math.floor(height / lineHeight), 6);
    const newHeight = Math.max(55, lines * lineHeight + 35);
    setInputHeight(newHeight);
  };

  return (
    <View style={styles.container}>
      <Loader isLoading={loading} />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <ChatRoomHeader
        GroupName={data.groupName || groupName}
        participant={participant}
        navigation={navigation}
        data={data}
        participantIds={participantIds}
        setSearchValue={onSearch}
      />
      {chatLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.green} />
        </View>
      ) : (
          <>
            {searchResults.length > 0 && (
              <View style={styles.searchNavContainer}>
                <Text style={styles.searchCount}>
                  {currentSearchIndex + 1} of {searchResults.length}
                </Text>
                <View style={styles.searchNavButtons}>
                  <TouchableOpacity onPress={() => navigateSearch("down")}>
                    <Ionicons name="arrow-up" size={24} color="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigateSearch("up")}>
                    <Ionicons name="arrow-down" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <FlatList
              ref={flatListRef}
              data={getGroupedChatList()}
              renderItem={ChatDataList}
              keyExtractor={(item, index) => item.id + index.toString()}
              inverted
              onEndReached={handleLoadMore}
              showsVerticalScrollIndicator={false}
              onEndReachedThreshold={0.2}
              ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={Colors.green} /> : null}
            />
          </>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" || getApiLevel() > 34 ? "padding" : undefined}
        style={getApiLevel() > 34 ? { marginBottom: keyboardPadding } : {}}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : getApiLevel() > 34 ? 30 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {replyingTo && (
            <View style={styles.replyContainer}>
              <Text style={styles.replyText}>
                Replying to {replyingTo.messageUser?.fullName || "Unknown"}
              </Text>
              <TouchableOpacity
                onPress={() => setReplyingTo(null)}
                style={styles.replyCloseButton}
              >
                <Ionicons name="close-outline" size={20} color="#808080" />
              </TouchableOpacity>
            </View>
          )}
          <View style={[styles.inputContainer, { height: inputHeight + (replyingTo ? 30 : 0) }]}>
            <View style={styles.inputInnerContainer}>
              <TouchableOpacity onPress={selectImageFromCamera}>
                <Camera size={20} color="grey" style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={selectImage}>
                <Paperclip size={17} color="grey" style={styles.icon} />
              </TouchableOpacity>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <TextInput
                  style={[styles.textInput, { maxHeight: 180 }]}
                  placeholder={editingMessageId ? "Edit your message..." : "Type something..."}
                  placeholderTextColor="gray"
                  value={content}
                  ref={textInputRef}
                  multiline={true}
                  onChangeText={(value) => {
                    setContent(value);
                    handleTyping(true);
                    if (typingTimeout) clearTimeout(typingTimeout);
                    setTypingTimeout(
                      setTimeout(() => {
                        handleTyping(false);
                      }, 1000)
                    );
                  }}
                  onContentSizeChange={handleContentSizeChange}
                  onSubmitEditing={() => {
                    sendMessage();
                    handleTyping(false);
                  }}
                  onBlur={() => handleTyping(false)}
                />
                {editingMessageId && (
                  <TouchableOpacity
                    onPress={() => {
                      setEditingMessageId(null);
                      setContent("");
                      handleTyping(false);
                      setEditModal(false);
                      setInputHeight(55);
                      if (textInputRef.current) {
                        textInputRef.current.blur();
                      }
                    }}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-outline" size={20} color="#808080" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                sendMessage();
                handleTyping(false);
              }}
              style={styles.microphoneButton}
            >
              {editingMessageId ?
                <Check size={18} color="#fff" />
                : <SendHorizonal size={18} color="#fff" />}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {selectedMedia && (
        <MediaPreviewModal
          visible={mediaModalVisible}
          onClose={() => setMediaModalVisible(false)}
          uri={selectedMedia.uri}
          type={selectedMedia.isVideo ? "video" : "image"}
          canSend={!!selectedMedia.imageUri}
          uploadImageToCloudinary={() => {
            if (selectedMedia.imageUri) {
              setLoading(true);
              setMediaModalVisible(false);
              uploadImageToCloudinary(selectedMedia.imageUri);
            }
          }}
        />
      )}
      {editModal && (
        <Modal
          transparent={true}
          animationType="fade"
          onRequestClose={() => setEditModal(false)}
        >
          <View style={styles.modalContainerForEdit}>
            <View style={styles.modalContentForEdit}>
              <Text style={styles.modalMessage}>This action is for your chat message</Text>
              {senderId === editingMessage?.senderId && editingMessage?.messageType !== "IMAGE" && (
                <TouchableOpacity
                  style={styles.modalOptionForEdit}
                  onPress={() => {
                    handleEditMessage(editingMessage);
                    setEditModal(false);
                  }}
                >
                  <Ionicons name="pencil-outline" size={20} color="#82934b" style={styles.modalIcon} />
                  <Text style={[styles.modalOptionTextForEdit, { color: "#82934b" }]}>Edit</Text>
                </TouchableOpacity>
              )}
              {senderId === editingMessage?.senderId && (
                <TouchableOpacity
                  style={styles.modalOptionForEdit}
                  onPress={() => {
                    handleDeleteMessage(editingMessage);
                    setContent("");
                    setEditingMessageId(null);
                    setEditModal(false);
                    setInputHeight(55);
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF4D4D" style={styles.modalIcon} />
                  <Text style={[styles.modalOptionTextForEdit, { color: "#FF4D4D" }]}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.modalOptionForEdit}
                onPress={() => {
                  handleReplyMessage(editingMessage);
                }}
              >
                <Ionicons name="return-up-back-outline" size={20} color="#82934b" style={styles.modalIcon} />
                <Text style={[styles.modalOptionTextForEdit, { color: "#82934b" }]}>Reply</Text>
              </TouchableOpacity>
              <FlatList
                data={emojis}
                renderItem={({ item: emoji }) => (
                  <TouchableOpacity
                    style={[styles.emojiOption, {
                      ...myReaction == emoji ?
                        {
                          backgroundColor: "rgba(192, 190, 190, 0.5)",
                          borderRadius: 30,
                        }
                        : {}
                    }]}
                    onPress={() => handleEmojiReaction(editingMessage, emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
              />
              <TouchableOpacity
                style={styles.modalOptionForEdit}
                onPress={() => {
                  setEditModal(false);
                  setInputHeight(55);
                }}
              >
                <Ionicons name="close-outline" size={20} color="#808080" style={styles.modalIcon} />
                <Text style={[styles.modalOptionTextForEdit, { color: "#808080" }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      <RBSheet
        ref={bottomSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={height * 0.5}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: "white",
          },
          draggableIcon: {
            display: "none",
          },
        }}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>
            {reactionCountList?.length} Reactions
          </Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
            {reactionCountList.length > 0 ? (
              reactionCountList.map((user) => (
                <View key={user.id}>
                  <View style={styles.userItemContainer}>
                    <View style={{ position: "relative" }}>
                      <Image
                        source={require("../assets/images/AnotherImage/Man.png")}
                        style={[styles.userImage, { position: "absolute" }]}
                      />
                      <FastImage
                        style={styles.userImage}
                        source={user?.reactUsers?.profileUrl ? { uri: user?.reactUsers?.profileUrl } : null}
                        resizeMode={FastImage.resizeMode.cover}
                        onTouchEnd={() => {
                          if (user?.userId !== senderId) {
                            closeSheet();
                            navigation.navigate("CrewProfile", { item: user?.reactUsers });
                          }
                        }}
                      />
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      {user?.userId == senderId ? (
                        <TouchableOpacity
                          style={{}}
                          onPress={() => {
                            handleDelteReaction(user.messageId, user.reaction);
                            setReactionCountList(prev => prev.filter(item => String(item.userId) != senderId));
                          }}
                        >
                          <Text style={[styles.userItem, { paddingVertical: 2 }]}>
                            You
                          </Text>
                          <Text style={{ fontSize: 12, color: "gray" }}>
                            Tap to remove
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text
                          style={styles.userItem}
                          onPress={() => {
                            closeSheet();
                              navigation.navigate("CrewProfile", { item: user?.reactUsers });
                            }}
                          >
                            {user?.reactUsers?.fullName}
                          </Text>
                      )}
                      <Text style={{ fontSize: 18 }}>{user?.reaction}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noLikesText}>
                {'No Reaction found'}
              </Text>
            )}
          </ScrollView>
        </View>
      </RBSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "rgba(230, 230, 230, 0.5)",
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: Platform.OS === "ios" ? 20 : 10,
    minHeight: 55,
  },
  inputInnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    width: 23,
    height: 23,
    marginHorizontal: 5,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    alignItems: "center",
    marginBottom: 8,
    color: "black",
    fontSize: 16,
  },
  microphoneButton: {
    backgroundColor: "#82934b",
    padding: 8,
    borderRadius: 50,
    marginLeft: 10,
  },
  dateSeparatorContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  dateSeparatorText: {
    backgroundColor: "#E6E6E6",
    color: "#333",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    fontSize: 12,
    fontWeight: "bold",
  },
  modalContainerForEdit: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContentForEdit: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "flex-end",
  },
  modalMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    width: "100%",
  },
  modalOptionForEdit: {
    flexDirection: "row",
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  modalIcon: {
    marginRight: 10,
  },
  modalOptionTextForEdit: {
    fontSize: 16,
    fontWeight: "500",
  },
  emojiOption: {
    padding: 10,
    marginHorizontal: 5,
  },
  emojiText: {
    fontSize: 24,
    color: "white",
  },
  clearButton: {
    padding: 5,
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  replyContainer: {
    flexDirection: "row",
    marginHorizontal: 10,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 5,
    borderRadius: 10,
    marginBottom: 5,
  },
  replyText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  replyCloseButton: {
    padding: 5,
  },
  sheetContent: {
    paddingVertical: 20,
    zIndex: 1001,
  },
  sheetTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "black",
    marginVertical: 10,
    textAlign: "center",
    fontWeight: "700",
  },
  userItemContainer: {
    borderColor: "gray",
    backgroundColor: "#f3f3f3",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  userItem: {
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "black",
  },
  userImage: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 20,
  },
  noLikesText: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    paddingVertical: 20,
  },
  searchNavContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginHorizontal: 10,
    marginTop: 5,
  },
  searchCount: {
    fontSize: 14,
    color: "#000",
  },
  searchNavButtons: {
    flexDirection: "row",
    gap: 10,
  },
});

export default ChatRoom;