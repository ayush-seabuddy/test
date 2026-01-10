import SwipeBox from "@/src/components/SwipeBox";
import { UserDetails } from "@/src/types/userTypes";
import Colors from "@/src/utils/Colors";
import { formatChatTime, formatDateSeparator } from "@/src/utils/helperFunctions";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { ChatMessage } from "../../chat/types/chatRoom";
import CommonLoader from "@/src/components/CommonLoader";


type ChatsProps = {
  item: any;
  index: number;
  senderId: string;
  styles: any;
  searchResults: any[];
  searchQuery: string;
  setSelectedMedia: (value: { uri: string; isVideo: boolean }) => void;
  setMediaModalVisible: (value: boolean) => void;
  setMyReaction: (reaction: string) => void;
  setEditingMessage: (msg: any) => void;
  setEditModal: (value: boolean) => void;
  handleReplyMessage: (msg: any) => void;
  imageLoading: boolean;
  imageUploading: boolean;
  setImageLoading: (state: boolean) => void;
  renderMessageContent: (content: string, senderId: string, item: ChatMessage, isSearchResult: boolean, searchQuery: string) => React.ReactNode;
  setLoading: (state: boolean) => void;
  fetchChatReactions: (id: string) => void;
};
const Chats = ({
  item,
  index,
  senderId,
  styles,
  searchResults,
  searchQuery,
  setSelectedMedia,
  setMediaModalVisible,
  setMyReaction,
  setEditingMessage,
  setEditModal,
  handleReplyMessage,
  imageLoading,
  imageUploading,
  setImageLoading,
  renderMessageContent,
  setLoading,
  fetchChatReactions,

}: ChatsProps) => {
  if (item.type === "date") {
    return (
      <View style={styles.dateSeparatorContainer}>
        <View style={styles.dateSeparatorText}>
          <Text>{formatDateSeparator(item.date)}</Text>
        </View>
      </View>
    );
  }

  const handleMediaPress = (uri: string) => {
    setSelectedMedia({ uri, isVideo: false });
    setMediaModalVisible(true);
  };

  const handleLongPress = (item: ChatMessage) => {
    let reaction = item?.chatReactionDetails?.find(item => String(item.userId) == String(senderId))?.reaction || "";
    setMyReaction(reaction);
    setEditingMessage(item);
    setEditModal(true);
  };

  const isSearchResult = searchResults.some((result: ChatMessage) => result.id === item.id);

  return (
    <View style={{ flexDirection: 'column' }}>
      <SwipeBox
        onSwipeLeft={() => handleReplyMessage(item)}
        onSwipeRight={() => handleReplyMessage(item)}
        disableLeft={true}
        disableRight={false}
        width="100%"
      >
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
                    params: { crewId: item.senderId }
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
                              (member: UserDetails) => member.userId === item?.messageUser?.id
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
                                (member: UserDetails) => member.userId === item?.messageUser?.id
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
                              (member: UserDetails) => member.userId === item?.messageUser?.id
                            )?.isBoarded
                              ? "green"
                              : "#f43d3d",
                          }}
                        >
                          (
                          {item?.messageUser?.ship?.crewMembers?.find(
                            (member: UserDetails) => member.userId === item?.messageUser?.id
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
                            <CommonLoader fullScreen containerStyle={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: [{ translateX: -15 }, { translateY: -15 }],
                            }} />
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
                      {/* Image */}
                      <Image
                        source={{ uri: item?.content }}
                        style={{ height: "100%", width: "100%", borderRadius: 10 }}
                        onLoadStart={() => setImageLoading(true)}
                        onLoadEnd={() => setImageLoading(false)}
                        contentFit="cover"
                      />

                      {/* Loader Overlay */}
                      {(imageUploading && !item?.id) && (
                        <View
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0,0,0,0.3)",
                            borderRadius: 10,
                          }}
                        >
                          <CommonLoader fullScreen/>
                        </View>
                      )}
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
      </SwipeBox>

      {item.status !== "DELETE" && item?.chatReactionDetails?.length > 0 && (
        <TouchableOpacity
          style={{
            zIndex: 100,
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

export default Chats;