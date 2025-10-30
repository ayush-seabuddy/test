import {
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Platform,
  Keyboard,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl, getApiLevel } from "../Api";
import Ionicons from "react-native-vector-icons/Ionicons";
import ProfileSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import { useFocusEffect } from "@react-navigation/native";
import Loader from "../component/Loader";
import { ImagesAssets } from "../assets/ImagesAssets";
import Colors from "../colors/Colors";
import Toast from "react-native-toast-message";
import { Modal } from "react-native-paper";

const { width } = Dimensions.get("window");

const CommentSection = ({ route, navigation }) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [commentText, setCommentText] = useState("");
  const [showComment, setShowComment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myUserId, setMyUserId] = useState(null);
  const [editTo, setEditTo] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeletingReply, setIsDeletingReply] = useState(false);
  const [parentCommentId, setParentCommentId] = useState(null); // State for parentCommentId (used for edit and delete replies)

  const { data } = route.params;
  const textInputRef = useRef(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const user = await AsyncStorage.getItem("userDetails");
      if (user) {
        const parsed = JSON.parse(user);
        setMyUserId(parsed?.id);
      }
    };
    fetchUserId();
  }, []);

  useFocusEffect(
    useCallback(() => {
      textInputRef.current?.focus();
    }, [])
  );

  const ITEMS_PER_PAGE = 20;

  const getComment = async (page = 1) => {
    if (loading || (!hasMore && page !== 1)) return;

    setLoading(true);
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) return;

      const queryParams = new URLSearchParams({
        hangoutId: data.id,
        page,
        limit: ITEMS_PER_PAGE,
      }).toString();

      const url = `${apiServerUrl}/user/getAllHangoutPostComments?${queryParams}`;
      console.log("Get Comments Request:", { url, method: "GET" });

      const response = await apiCallWithToken(url, "GET", null, authToken);

      const newComments = response?.result?.comments || [];
      const commentsWithId = newComments.map((comment, index) => ({
        ...comment,
        id: comment.commentId || `api-${page}-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        isEdited: comment.isEdited || false,
        reply: comment.reply?.map((rep, repIndex) => ({
          ...rep,
          id: rep.replyCommentId || `reply-${page}-${index}-${repIndex}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          isEdited: rep.isEdited || false,
          commentedAt: rep.commentedAt || new Date().toISOString(),
        })) || [],
      }));

      setShowComment((prev) => (page === 1 ? commentsWithId : [...prev, ...commentsWithId]));
      setHasMore(newComments.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching comments:", error);
      Toast.show({
        type: "error",
        text1: "Failed to load comments",
        position: "bottom",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getComment(pageNumber);
  }, [pageNumber]);

  const handleEndReached = () => {
    if (!loading && hasMore && !refreshing) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPageNumber(1);
    setHasMore(true);
    getComment(1);
  };

  const handleCardPress = (userId) => {
    navigation.navigate("CrewProfile", { id: userId });
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;

    const authToken = await AsyncStorage.getItem("authToken");
    const body = {
      likeComments: [
        {
          hangoutId: data.id,
          comment: commentText,
          ...(replyTo && {
            commentId: replyTo.id,
            type: "REPLY",
            replyTo: replyTo.userName,
            userId: replyTo.userId,
          }),
          ...(editingCommentId && {
            [isEditingReply ? "replyCommentId" : "commentId"]: editingCommentId,
            ...(isEditingReply && parentCommentId ? { commentId: parentCommentId } : {}),
            type: isEditingReply ? "EDITREPLY" : "UPDATE",
          }),
        },
      ],
    };

    setPostingComment(true);
    try {
      console.log(
        "Post/Edit/Reply Comment Request:",
        JSON.stringify({
          url: `${apiServerUrl}/user/likeCommentHangoutPost`,
          method: "PUT",
          body,
        })
      );

      const response = await apiCallWithToken(
        `${apiServerUrl}/user/likeCommentHangoutPost`,
        "PUT",
        body,
        authToken
      );

      console.log("Post/Edit/Reply Comment Response:", JSON.stringify(response));

      const userData = await AsyncStorage.getItem("userDetails");
      const user = userData ? JSON.parse(userData) : {};

      if (editingCommentId) {
        console.log(`Comment edited for commentId: ${editingCommentId}`);
        setShowComment((prev) =>
          prev.map((comment) => ({
            ...comment,
            ...(comment.id === editingCommentId && {
              comment: commentText,
              isEdited: true,
            }),
            reply: comment.reply.map((rep) =>
              rep.id === editingCommentId
                ? { ...rep, comment: commentText, isEdited: true }
                : rep
            ),
          }))
        );
        Toast.show({
          type: "success",
          text1: "Comment Edited Successfully",
          position: "bottom",
        });
      } else {
        const newComment = {
          id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          comment: commentText,
          commentedAt: new Date().toISOString(),
          commentUser: {
            id: user.id,
            fullName: user.fullName || "Anonymous",
            profileUrl: user.profileUrl || ImagesAssets.defaultProfile,
          },
          ...(replyTo && {
            commentId: replyTo.id,
            replyTo: replyTo.userName,
            userId: replyTo.userId,
          }),
          isEdited: false,
          reply: [],
        };

        if (replyTo) {
          setShowComment((prev) =>
            prev.map((comment) =>
              comment.id === replyTo.id
                ? {
                    ...comment,
                    reply: [
                      ...comment.reply,
                      {
                        ...newComment,
                        commentUser: {
                          id: user.id,
                          fullName: user.fullName || "Anonymous",
                          profileUrl: user.profileUrl || ImagesAssets.defaultProfile,
                        },
                      },
                    ],
                  }
                : comment
            )
          );
          Toast.show({
            type: "success",
            text1: "Reply Posted Successfully",
            position: "bottom",
          });
        } else {
          setShowComment((prev) => [newComment, ...prev]);
          Toast.show({
            type: "success",
            text1: "Comment Posted Successfully",
            position: "bottom",
          });
        }
      }

      setCommentText("");
      setReplyTo(null);
      setEditTo(null);
      setEditingCommentId(null);
      setIsEditingReply(false);
      setParentCommentId(null); // Reset parentCommentId after posting
    } catch (error) {
      console.error("Error posting/editing/replying comment:", error);
      Toast.show({
        type: "error",
        text1: "Error posting/editing/replying comment",
        position: "bottom",
      });
    } finally {
      setPostingComment(false);
    }
  };

  const handleEditComment = (comment, commentId, isReply = false) => {
    console.log(`Prefilled comment with commentId: ${commentId}`);
    setCommentText(comment);
    setEditTo({ id: commentId, comment });
    setEditingCommentId(commentId);
    setIsEditingReply(isReply);
    setReplyTo(null);
    setDeleteModalVisible(false);

    if (isReply) {
      // Find the parent comment that contains this reply
      const parentComment = showComment.find((comment) =>
        comment.reply.some((rep) => rep.id === commentId)
      );
      if (parentComment) {
        setParentCommentId(parentComment.id);
      } else {
        Toast.show({
          type: "error",
          text1: "Cannot edit reply: Parent comment not found",
          position: "bottom",
        });
        return;
      }
    } else {
      setParentCommentId(null);
    }

    textInputRef.current?.focus();
  };

  const cancelEditOrReply = () => {
    setReplyTo(null);
    setEditTo(null);
    setEditingCommentId(null);
    setIsEditingReply(false);
    setCommentText("");
    setDeleteModalVisible(false);
    setParentCommentId(null); // Reset parentCommentId on cancel
    textInputRef.current?.focus();
  };

  const showDeleteConfirmation = (commentId, isReply = false) => {
    setCommentToDelete(commentId);
    setIsDeletingReply(isReply);
    setReplyTo(null);
    setEditTo(null);
    setEditingCommentId(null);
    setCommentText("");

    if (isReply) {
      // Find the parent comment that contains this reply
      const parentComment = showComment.find((comment) =>
        comment.reply.some((rep) => rep.id === commentId)
      );
      if (parentComment) {
        setParentCommentId(parentComment.id);
      } else {
        Toast.show({
          type: "error",
          text1: "Cannot delete reply: Parent comment not found",
          position: "bottom",
        });
        return;
      }
    } else {
      setParentCommentId(null);
    }

    setDeleteModalVisible(true);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    setLoading(true);
    setDeleteModalVisible(false);

    try {
      const authToken = await AsyncStorage.getItem("authToken");
      const body = {
        likeComments: [
          {
            hangoutId: data.id,
            comment: "true",
            [isDeletingReply ? "replyCommentId" : "commentId"]: commentToDelete,
            ...(isDeletingReply && parentCommentId ? { commentId: parentCommentId } : {}),
            type: isDeletingReply ? "DELETEREPLY" : "DELETE",
          },
        ],
      };

      console.log(
        "Delete Comment Request:",
        JSON.stringify({
          url: `${apiServerUrl}/user/likeCommentHangoutPost`,
          method: "PUT",
          body,
        })
      );

      const response = await apiCallWithToken(
        `${apiServerUrl}/user/likeCommentHangoutPost`,
        "PUT",
        body,
        authToken
      );

      console.log("Delete Comment Response:", JSON.stringify(response));

      setShowComment((prev) =>
        prev
          .map((comment) => ({
            ...comment,
            reply: comment.reply.filter((rep) => rep.id !== commentToDelete),
          }))
          .filter((comment) => comment.id !== commentToDelete)
      );
      Toast.show({
        type: "success",
        text1: "Comment Deleted Successfully",
        position: "bottom",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      Toast.show({
        type: "error",
        text1: "Error deleting comment",
        position: "bottom",
      });
    } finally {
      setLoading(false);
      setCommentToDelete(null);
      setIsDeletingReply(false);
      setParentCommentId(null); // Reset parentCommentId
    }
  };

  const handleReply = (commentId, userName, userId,item) => {
    console.log("item: ", item);
    setReplyTo({ id: commentId, userName, userId });
    setEditTo(null);
    setEditingCommentId(null);
    setIsEditingReply(false);
    setCommentText("");
    setDeleteModalVisible(false);
    setParentCommentId(null); // Reset parentCommentId
    textInputRef.current?.focus();
  };

  const ShowCommentList = ({ item, isReply = false }) => {
    
    const isMyComment = item?.commentUser?.id === myUserId;
    const timeDisplay = getRelativeTime(item.commentedAt);

    return (
      <View style={[styles.commentContainer, isReply && styles.replyContainer]}>
        <TouchableOpacity onPress={() => handleCardPress(item?.commentUser?.id)}>
          <Image
            source={{ uri: item?.commentUser?.profileUrl || ImagesAssets.defaultProfile }}
            style={[styles.commentImage, isReply && styles.replyImage]}
          />
        </TouchableOpacity>
        <View style={[styles.commentContent, isReply && styles.replyContent]}>
          <View style={styles.commentHeader}>
            <Text style={styles.userName}>{item?.commentUser?.fullName}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.timeText}>{timeDisplay}</Text>
              {item.isEdited && <Text style={styles.editText}> (Edited)</Text>}
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.commentText}>
              {item.replyTo && isReply ? (
                <>
                  <Text style={[styles.replyToText,{color:"green"}]}>@{item.replyTo} </Text>
                  {item.comment}
                </>
              ) : (
                item.comment
              )}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: isMyComment ? "flex-end" : "flex-end", marginTop: 5, gap: 10 }}>
            {isMyComment && (
              <>
                <TouchableOpacity onPress={() => handleEditComment(item.comment, item.id, isReply)}>
                  <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
                    <Image source={ImagesAssets.edit} style={{ height: 12, width: 12 }} />
                    <Text style={{ fontSize: 14 }}>Edit</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => showDeleteConfirmation(item.id, isReply)}>
                  <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
                    <Image source={ImagesAssets.delete} style={{ height: 12, width: 12 }} />
                    <Text style={{ fontSize: 14 }}>Delete</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
            {!isMyComment && (
              <TouchableOpacity onPress={() => handleReply(item.commentId || item.id, item.commentUser.fullName, item.commentUser.id,item)}>
                <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
                  <Image source={ImagesAssets.reply} style={{ height: 12, width: 12 }} />
                  <Text style={styles.replyText}>Reply</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
          {item.reply?.length > 0 && (
            <View style={styles.replyList}>
              {item.reply.map((data, index) => (
                <ShowCommentList key={data.id} item={data} isReply={true} />
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diff = Math.floor((now - commentDate) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return commentDate.toDateString();
  };

  return (
    <>
      <ProfileSettingHeader navigation={navigation} title="Comments" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}

        behavior={Platform.OS === "ios" || getApiLevel() > 34 ? "padding" : undefined}
                keyboardVerticalOffset={getApiLevel() > '34' ? 30 : 0}
      >
        <View style={{ flex: 1 }}>
          {loading && <Loader />}
          <FlatList
            data={showComment}
            renderItem={({ item }) => <ShowCommentList item={item} />}
            keyExtractor={(item) => item.id}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 80 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            ListEmptyComponent={<Text style={styles.emptyText}>No comments yet</Text>}
            initialNumToRender={10}
            windowSize={5}
          />
          <Modal
            visible={isDeleteModalVisible}
            onDismiss={() => setDeleteModalVisible(false)}
            contentContainerStyle={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Delete Comment</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this comment?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteComment}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.inputContainer}>
              {editTo && (
                <View style={styles.editHeader}>
                  <Text style={styles.editToText}>
                    Editing {editTo.comment.length > 20 ? `${editTo.comment.slice(0, 20)}...` : editTo.comment}
                  </Text>
                  <TouchableOpacity onPress={cancelEditOrReply}>
                    <Ionicons name="close" size={20} color="#888" />
                  </TouchableOpacity>
                </View>
              )}
              {replyTo && !editTo && (
                <View style={styles.replyHeader}>
                  <Text style={styles.replyToText}>Replying to {replyTo.userName}</Text>
                  <TouchableOpacity onPress={cancelEditOrReply}>
                    <Ionicons name="close" size={20} color="#888" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.inputWrapper}>
                <TextInput
                  ref={textInputRef}
                  placeholder={
                    editTo
                      ? `Editing ${editTo.comment.length > 20 ? `${editTo.comment.slice(0, 20)}...` : editTo.comment}`
                      : replyTo
                        ? "Write a reply..."
                        : "Write your comment"
                  }
                  style={styles.textInput}
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  editable={!postingComment}
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handlePostComment}
                  disabled={!commentText.trim() || postingComment}
                >
                  {postingComment ? (
                    <ActivityIndicator size="small" color="#007bff" />
                  ) : (
                    <Ionicons
                      name="send-outline"
                      size={30}
                      color={commentText.trim() ? "#007bff" : "#888"}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: "row",
    padding: 10,
    paddingVertical: 12,
    backgroundColor: "#e9e9e9",
    marginBottom: 10,
  },
  replyContainer: {
    marginLeft: 20, // Indentation for replies
    borderRadius: 10,
    backgroundColor: "#f5f5f5", // Slightly different background for replies
  },
  commentImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  replyImage: {
    width: 32,
    height: 32,
    borderRadius: 16, // Smaller image for replies
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  replyContent: {
    marginLeft: 8, // Smaller margin for replies
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontWeight: "600",
    fontSize: 15,
  },
  timeText: {
    color: "#666",
    fontSize: 12,
  },
  editText: {
    color: "#666",
    fontSize: 12,
    marginLeft: 5,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  replyToText: {
    color: "#007bff",
    fontWeight: "600",
  },
  replyText: {
    fontSize: 14,
  },
  replyList: {
    marginTop: 16,
  },
  inputContainer: {
    padding: 10,
    backgroundColor: "#ededed",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  editHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  replyToText: {
    fontSize: 14,
    color: "#555",
  },
  editToText: {
    fontSize: 14,
    color: "#555",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    padding: 5,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
    fontSize: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default CommentSection;