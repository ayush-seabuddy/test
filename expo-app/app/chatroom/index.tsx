// src/screens/chat/ChatRoom.tsx
import { getReactionsOnMessage, uploadfile } from '@/src/apis/apiService';
import KeyboardAvoidingWrapper from '@/src/components/KeyboardAvoidingWrapper';
import MediaPreviewModal from '@/src/components/Modals/MediaPreviewModal';
import { saveMessage } from '@/src/database/chatMessageService';
import { RootState } from '@/src/redux/store';
import { ChatMessage, ChatRoom } from '@/src/screens/chat/types/chatRoom'; // <-- your type
import ChatRoomHeader from '@/src/screens/chatroom/ChatRoomHeader';
import Chats from '@/src/screens/chatroom/components/ChatDataList';
import Colors from '@/src/utils/Colors';
import socketService from '@/src/utils/socketService';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from 'expo-router';
import { Camera, Check, Edit, Paperclip, Reply, SendHorizonal, Trash2, X } from 'lucide-react-native';
import moment from 'moment-timezone';
import { useCallback, useRef, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { ActivityIndicator, TextInput, } from 'react-native-paper';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useDispatch, useSelector } from 'react-redux';
// import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

type ChatRoomScreenParams = {
  chatRoomDetails: ChatRoom
}
type ChatRoomRouteProp = RouteProp<{ ChatRoom: ChatRoomScreenParams }, 'ChatRoom'>
const { width , height } = Dimensions.get("screen");
const ChatRoomScreen = () => {
  const route = useRoute<ChatRoomRouteProp>()
  const chatRoomDetails = typeof route.params?.chatRoomDetails === 'string' ? JSON.parse(route.params?.chatRoomDetails) : route.params?.chatRoomDetails
  const chatRoomId = chatRoomDetails.id;
  const headerPops = {
    navigation: () => router.back(),
    data: chatRoomDetails,
    participant: chatRoomDetails?.participants?.length,
    GroupName: chatRoomDetails?.groupName,
    setSearchValue: () => { },
    participantIds: chatRoomDetails?.participantIds
  }


  const dispatch = useDispatch();
  // const { chatList, typingStatus } = useSelector(selectChat);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const [content, setContent] = useState("");
  const [contentImage, setContentImage] = useState("");
  const [chatListState, setChatList] = useState<ChatMessage[]>([]);
  const [newMessages, setNewMessages] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [participant, setParticipants] = useState("");
  const [participantIds, setParticipantIds] = useState([]);
  const [recording, setRecording] = useState(false);
  // const [audioRecorderPlayer] = useState(new AudioRecorderPlayer());
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
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; isVideo: boolean }>({ uri: "", isVideo: false });
  const [imageLoading, setImageLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ChatMessage|null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string>("");
  const [inputHeight, setInputHeight] = useState(55);
  const [editModal, setEditModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage|null>(null);
  const [myReaction, setMyReaction] = useState('');
  const textInputRef = useRef(null);
  const PAGE_SIZE = 50;
  const bottomSheetRef = useRef<typeof RBSheet | null>(null);
  const [reactionCountList, setReactionCountList] = useState<ReactionData[]>([]);
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState("");

  const emojis = ["👍", "😊", "❤️", "😂", "😮", "😢"];

  const { id: senderId, shipId } = useSelector((state: RootState) => state.userDetails)

 interface ReactionData {
  createdAt: string;
  id: string;
  messageId: string;
  reactUsers: any; // you can replace `any` with a proper type if you know the shape
  reaction: string; // e.g. "❤️"
  updatedAt: string;
  userId: string;
}



  const handleEditMessage = (message: { id: string; content: string; messageType: string; }) => {
    console.log("message: ", message);
    if (!message.id) {
      return;
    }
    if (message.messageType === "IMAGE") {
      return;
    }
    setContent(message.content);
    setEditingMessageId(message.id);
    if (textInputRef.current) {
      textInputRef?.current?.focus();
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
      setInputHeight(55);
    } catch (error) {
      console.log("Error sending/editing message:", error);
    }
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

    const fetchChatReactions = async (id:string) => {
      try {
        const response = await getReactionsOnMessage({messageId:id});
        if (response.data && response.data.length > 0) {
            let myReaction:ReactionData = response.data.find((reaction:ReactionData) => String(reaction.userId) == senderId);
            let reactionWithoutMy = response.data.filter((reaction:ReactionData) => String(reaction.userId) != senderId);
            if (myReaction) {
              setReactionCountList([myReaction, ...reactionWithoutMy]);
            } else {
              setReactionCountList(response.data);
            }
             bottomSheetRef?.current?.open()
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching data:", error.message);
        } else {
          console.error("Error fetching data:", error);
        }
      }
    };

    const handleReceiveChatReaction = (data:ReactionData) => {
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
      }
 
    useFocusEffect(
    useCallback(() => {



      // socketService.on("userPreviousMessages", handleUserChatInitiated);
      // socketService.on("receiveUserMessage", handleReceiveUserMessage);
      // socketService.on("typingStatusUpdated", f1);
      socketService.on("receiveUserEditMessage", handleUserEditMessage);
      socketService.on("getUserEditMessage", handleUserEditMessage);
      // socketService.on("receiveUserReactMessage", handleUserReactMessage);
      // socketService.on("getUserMessage", handleGetUserMessage);
      socketService.on("receiveChatReaction",handleReceiveChatReaction);
      // socketService.on("getChatReaction", f3);

      return () => {
        // socketService.off("userPreviousMessages", handleUserChatInitiated);
        // socketService.off("receiveUserMessage", handleReceiveUserMessage);
        // socketService.off("typingStatusUpdated");
        socketService.off("receiveUserEditMessage", handleUserEditMessage);
        socketService.off("getUserEditMessage", handleUserEditMessage);
        // socketService.off("receiveUserReactMessage", handleUserReactMessage);
        // socketService.off("getUserMessage", handleGetUserMessage);
        // socketService.off("receiveChatReaction");
        // socketService.off("getChatReaction");
      };
    }, [])
  );



  useFocusEffect(
    useCallback(() => {

      const payload = {
        userId: senderId,
        chatRoomId: chatRoomDetails.id,
        page: 1,
        limit: 50,
      };

      socketService.emit("joinChatRoom", payload);
      console.log("payload: ", payload);
      socketService.on("userPreviousMessages", (data) => {
        console.log("data: ", JSON.stringify(data.previousMessages));
        setChatList(data.previousMessages);
        saveMessage(data.previousMessages)

      });


    }, [])
  );



  const sendMessageImageUrl = async (contentImage: string) => {
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
    } catch (error) {
      console.log("Error sending image message:", error);
    }
  };


  const uploadImage = async (photo: string) => {
    if (!photo) return;
    setLoading(true);
    try {
      const apiResponse = await uploadfile({ file: photo });
      if (apiResponse.success && apiResponse.status == 200) {
        setContentImage(apiResponse.data);
        await sendMessageImageUrl(apiResponse.data);

      } else {
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };
  const selectImageFromCamera = async (type: "camera" | "library" = "camera") => {

    try {
      setLoading(true);

      const result = type === "camera"
        ? await ImagePicker.launchCameraAsync({
          allowsEditing: true,
        })
        : await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
        });

      if (result.canceled) return;

      const uri = result.assets?.[0]?.uri;
      if (!uri) return;
      console.log("uri: ", uri);
      setMediaModalVisible(true);
      setSelectedMedia({ uri: uri, isVideo: false, imageUri: uri });
      setLoading(false);
    } catch (error) {

    }
  };


  // const selectImage = async (type: "camera" | "library") => {
  //   const hasPermission = await requestPermissions(type);
  //   if (!hasPermission) return;


  //   const { loadPage } = useLoadPreviousMessages(chatRoomDetails.id, 30);


  // const [messages, setMessages] = useState<ChatMessage[]>([]);
  // const [page, setPage] = useState(1);
  // const [hasMore, setHasMore] = useState(true);

  // // Load page 1 (newest)
  // useEffect(() => {
  //   loadPage(1).then(msgs => {
  //     setMessages(msgs);
  //     setHasMore(msgs.length === 30);
  //   });
  // }, [loadPage]);

  const getGroupedChatList = () => {
    const groupedMessages: (ChatMessage | { type: string; date: Date; id: string })[] = [];
    let currentDateKey: string | null = null;
    let buffer: Array<ChatMessage & { type: string }> = [];

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

  const renderMessageContent = (content: string, senderId: string, item: ChatMessage, isSearchResult = false, searchQuery = ""): React.ReactNode => {
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

 
  return (
    <KeyboardAvoidingWrapper
      style={{ flex: 1 }}
    >

    <View style={styles.container}>
      <ChatRoomHeader  {...headerPops} />
      <FlatList
        ref={flatListRef}
        data={getGroupedChatList()}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({ item,index }) =>
        <Chats 
        item={item} 
        index={index}
        handleReplyMessage={handleReplyMessage}
        imageLoading={imageLoading}
        renderMessageContent={renderMessageContent}
        senderId={senderId}
        searchQuery={searchQuery}
        searchResults={searchResults}
        setEditModal={setEditModal}
        setEditingMessage={setEditingMessage}
        setImageLoading={setImageLoading}
        setSelectedMedia={setSelectedMedia}
        setLoading={setLoading}
        setMediaModalVisible={setMediaModalVisible}
        setMyReaction={setMyReaction}
        fetchChatReactions={fetchChatReactions}
        styles={styles}
        />
        }
        keyExtractor={(item, index) => item.id + index.toString()}
        inverted
        // onEndReached={handleLoadMore}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.2}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={Colors.darkGreen} /> : null}
      />

      {replyingTo && (
        <View style={styles.replyContainer}>
          <Text style={styles.replyText}>
            Replying to {replyingTo.messageUser?.fullName || "Unknown"}
          </Text>
          <TouchableOpacity
            onPress={() => setReplyingTo(null)}
            style={styles.replyCloseButton}
          >
            <X size={20} color="black" />
          </TouchableOpacity>
        </View>
      )}
      <View style={[styles.inputContainer]}>
        <View style={styles.inputInnerContainer}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => selectImageFromCamera("camera")}
          >
            <Camera size={26} color="grey" style={styles.icon} />
          </TouchableOpacity>
      
            <View style={{ flex: 1, flexDirection: "row" }}>

              <TextInput
                // style={[styles.textInput, { maxHeight: 180 }]}
                style={{
                  flex: 1,
                  paddingHorizontal: 10,
                  color: "black",
                  backgroundColor: "rgba(0, 0, 0, 0)",
                  minHeight: 45
                }}
                activeUnderlineColor="transparent"
                underlineColor="transparent"
                contentStyle={{
                  color: "black",
                }}
                placeholder={editingMessageId ? "Edit your message..." : "Type something..."}
                placeholderTextColor="gray"
                value={content}
                ref={textInputRef}
                multiline={true}
                numberOfLines={4}
                scrollEnabled={true}
                onChangeText={(value) => {
                  setContent(value);
                }}
                onSubmitEditing={() => {
                  sendMessage();
                }}
              />

              {editingMessageId && (
                <TouchableOpacity
                  onPress={() => {
                    setEditingMessageId(null);
                    setContent("");
                    setEditModal(false);
                    setInputHeight(55);
                    if (textInputRef.current) {
                      textInputRef.current.blur();
                    }
                  }}
                  style={styles.clearButton}
                >
                  <X size={18} color="#808080" />
                </TouchableOpacity>
              )}
            </View>
       
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => selectImageFromCamera("library")}
          >
            <Paperclip size={24} color="grey" style={styles.icon} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => {
            sendMessage();
          }}
          style={styles.microphoneButton}
        >
          {editingMessageId ?
            <Check size={25} color="#fff" />
            : <SendHorizonal size={25} color="#fff" />}
        </TouchableOpacity>
      </View>

 <RBSheet
        ref={bottomSheetRef}
        // closeOnDragDown={true}
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
                      {/* <Image
                        source={require("../assets/images/AnotherImage/Man.png")}
                        style={[styles.userImage, { position: "absolute" }]}
                      /> */}
                      <Image
                        style={styles.userImage}
                        source={user?.reactUsers?.profileUrl ? { uri: user?.reactUsers?.profileUrl } : null}
                        resizeMode="cover"
                        onTouchEnd={() => {
                          if (user?.userId !== senderId) {
                            // closeSheet();
                            router.push({
                              pathname: "/crewProfile",
                              params: {
                                crewId: user?.userId,
                              },
                            })
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
                            // closeSheet();
                            router.push({
                              pathname: "/crewProfile",
                              params: {
                                crewId: user?.userId,
                              },
                            })
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

      {selectedMedia && (
        <MediaPreviewModal
          visible={mediaModalVisible}
          onClose={() => setMediaModalVisible(false)}
          uri={selectedMedia.uri}
          type={selectedMedia.isVideo ? "video" : "image"}
          canSend={!!selectedMedia.imageUri}
          uploadImageToCloudinary={() => {
            console.log("selectedMedia: ", selectedMedia);
            if (selectedMedia.imageUri) {
              setLoading(true);
              setMediaModalVisible(false);
              uploadImage(selectedMedia.imageUri);
              // uploadImageToCloudinary(selectedMedia.imageUri);
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
                  <Edit size={20} color="#82934b" style={styles.modalIcon} />
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
                  <Trash2 size={20} color="#FF4D4D" style={styles.modalIcon} />
                  <Text style={[styles.modalOptionTextForEdit, { color: "#FF4D4D" }]}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.modalOptionForEdit}
                onPress={() => {
                  handleReplyMessage(editingMessage);
                }}
              >
                <Reply size={20} color="#82934b" style={styles.modalIcon} />
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
                <X size={20} color="#808080" style={styles.modalIcon} />
                <Text style={[styles.modalOptionTextForEdit, { color: "#808080" }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
     </KeyboardAvoidingWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    // paddingBottom: 10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 20,
    minHeight: 45,
  },
  inputInnerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 30,
    backgroundColor: "rgba(230, 230, 230, 0.5)",
    flex: 1,
  },
  iconContainer: {
    margin: 10,
    marginBottom: 18
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
    height: 45,
    width: 45,
    justifyContent: "center",
    alignItems: "center",
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

export default ChatRoomScreen