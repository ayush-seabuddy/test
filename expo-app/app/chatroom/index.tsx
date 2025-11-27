// src/screens/chat/ChatRoom.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRoute, RouteProp } from '@react-navigation/native'
import { ChatMessage, ChatRoom } from '@/src/screens/chat/types/chatRoom' // <-- your type
import ChatRoomHeader from '@/src/screens/chatroom/ChatRoomHeader'
import { router, useFocusEffect } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment-timezone'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RootState } from '@/src/redux/store'
import socketService from '@/src/utils/socketService'
import { saveMessage } from '@/src/database/chatMessageService'
import { useLoadPreviousMessages } from '@/src/hooks/usePrevMessage'
import { FlatList } from 'react-native-gesture-handler'
import { Image } from 'expo-image'
import { ActivityIndicator, TextInput } from 'react-native-paper'
import Colors from '@/src/utils/Colors'
import { formatChatTime, formatDateSeparator } from '@/src/utils/helperFunctions'
import { Camera, Paperclip, SendHorizontal } from 'lucide-react-native'

type ChatRoomScreenParams = {
  chatRoomDetails: ChatRoom
}
type ChatRoomRouteProp = RouteProp<{ ChatRoom: ChatRoomScreenParams }, 'ChatRoom'>

const ChatRoomScreen = () => {
  const route = useRoute<ChatRoomRouteProp>()
  const chatRoomDetails = typeof route.params?.chatRoomDetails === 'string' ? JSON.parse(route.params?.chatRoomDetails) : route.params?.chatRoomDetails

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
  const [chatRoomId, setChatRoomID] = useState("");
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



  const { id: senderId, shipId } = useSelector((state: RootState) => state.userDetails)





  //  useFocusEffect(
  //   useCallback(() => {



  //     socketService.on("userPreviousMessages", handleUserChatInitiated);
  //     socketService.on("receiveUserMessage", handleReceiveUserMessage);
  //     socketService.on("typingStatusUpdated", f1);
  //     socketService.on("receiveUserEditMessage", handleUserEditMessage);
  //     socketService.on("getUserEditMessage", handleUserEditMessage);
  //     socketService.on("receiveUserReactMessage", handleUserReactMessage);
  //     socketService.on("getUserMessage", handleGetUserMessage);
  //     socketService.on("receiveChatReaction",f2);
  //     socketService.on("getChatReaction", f3);

  //     return () => {
  //       socketService.off("userPreviousMessages", handleUserChatInitiated);
  //       socketService.off("receiveUserMessage", handleReceiveUserMessage);
  //       socketService.off("typingStatusUpdated");
  //       socketService.off("receiveUserEditMessage", handleUserEditMessage);
  //       socketService.off("getUserEditMessage", handleUserEditMessage);
  //       socketService.off("receiveUserReactMessage", handleUserReactMessage);
  //       socketService.off("getUserMessage", handleGetUserMessage);
  //       socketService.off("receiveChatReaction");
  //       socketService.off("getChatReaction");
  //     };
  //   }, [])
  // );



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
    let currentDateKey: string|null = null;
    let buffer:Array<ChatMessage & { type: string }> = [];

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

  const ChatDataList = ({ item, index }: { item: any, index: number }) => {
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
                onPress={() => router.push({
                  pathname: "/crewProfile",
                  params: { crewId: item?.messageUser?.crewId }
                })}
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
                              color={Colors.darkGreen}
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
                            <Image
                              source={{ uri: item?.parentMessage?.content }}
                              style={{ height: 60, width: 60, borderRadius: 10 }}
                              onLoadStart={() => setImageLoading(true)}
                              onLoadEnd={() => setImageLoading(false)}
                              contentFit="cover"
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
                          color={Colors.darkGreen}
                        />
                      )}

                      <Image
                        source={{ uri: item?.content }}
                        style={{ height: "100%", width: "100%", borderRadius: 10 }}
                        onLoadStart={() => setImageLoading(true)}
                        onLoadEnd={() => setImageLoading(false)}
                        contentFit="cover"
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
              // fetchChatReactions(item.id);
              setLoading(true);
              // setTimeout(() => {
              //   bottomSheetRef.current.open();
              //   setLoading(false);
              // }, 2000);
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
  return (
    <View style={styles.container}>
      <ChatRoomHeader  {...headerPops} />


      <FlatList
        ref={flatListRef}
        data={getGroupedChatList()}
        renderItem={ChatDataList}
        keyExtractor={(item, index) => item.id + index.toString()}
        inverted
        // onEndReached={handleLoadMore}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.2}
        ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={Colors.darkGreen} /> : null}
      />
      <View style={{flexDirection:"row" , display:"flex" , alignItems:"center" ,gap:5 , paddingHorizontal:10}}>
        <Camera size={25} color={Colors.black} />
        <Paperclip size={25} color={Colors.black} />

<View style={{flex:1}}>
   <TextInput
  multiline
  numberOfLines={4}
  scrollEnabled={true}
  style={{
    backgroundColor: "white",
    color: "black",
  }}
  contentStyle={{
    color: "black",
  }}
  theme={{ roundness: 4 }}
  mode="outlined"
  outlineColor="black"
  activeOutlineColor="black"
/>
      </View>
      <SendHorizontal size={25} color={Colors.black} />
      </View>
   
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingBottom:10
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

export default ChatRoomScreen