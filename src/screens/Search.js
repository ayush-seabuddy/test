import React, { useEffect, useMemo, useCallback, useRef, useState } from "react";
import {
  View,
  Image,
  Text,
  ScrollView,
  Platform,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Pressable,
  Dimensions,
  KeyboardAvoidingView,
  Animated,
  RefreshControl,
  Keyboard,
  TextInput,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { ImagesAssets } from "../assets/ImagesAssets";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import SearchComponent from "../component/headers/SearchComponent";
import { useSelector } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import { Divider, Menu, Modal } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl, checkConnected, formatShipName, getApiLevel } from "../Api";
import Orientation from "react-native-orientation-locker";
import { Heart, MessageCircle, Eye, MoreVertical, Edit2, Trash2, Reply, Send, X, AlertTriangle, TrendingUp, SendHorizonal } from "lucide-react-native";
import axios from "axios";
import ReportModal from "../component/Modals/ReasonModal";
import DeleteModal from "../component/Modals/DeleteModal";
import Video from "react-native-video";
import RBSheet from "react-native-raw-bottom-sheet";
import FastImage from "react-native-fast-image";
import MediaPreviewModalForPosts from "../component/Modals/MediaPreviewModalForPosts";
import TimeAgo from 'javascript-time-ago';
import ReactTimeAgo from 'react-time-ago';
import en from 'javascript-time-ago/locale/en';
import Loader from "../component/Loader";
import RealmService from "../Realm/Realm";
TimeAgo.addDefaultLocale(en);

const { height: screenHeight, width: screenWidth } = Dimensions.get("screen");
const { height, width } = Dimensions.get("window");

const sections = [
  { id: "users", title: "Users", dataKey: "users.usersList" },
  { id: "posts", title: "Posts", dataKey: "posts.hangoutsList" },
  { id: "bulletin", title: "Bulletin", dataKey: "announcements.allAnnouncements" },
  { id: "read", title: "Read", dataKey: "articles.allContents" },
  { id: "buddyup", title: "BuddyUp Events", dataKey: "groupActivities.groupActivityList" },
  { id: "listen", title: "Listen", dataKey: "musics.allContents" },
  { id: "watch", title: "Watch", dataKey: "videos.allContents" },
];

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const DEFAULT_IMAGE = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";
const isVideo = (uri) => uri?.match(/\.(mp4|mov|avi)$/i);

const ShowCommentList = React.memo(({
  item: commentItem,
  isReply = false,
  myUserId,
  handleCardPress,
  handleEditComment,
  showDeleteConfirmation,
  handleReply
}) => {
  const isMyComment = commentItem?.commentUser?.id === myUserId;
  const timeDisplay = useMemo(() => {
    const now = new Date();
    const commentDate = new Date(commentItem.commentedAt);
    const diff = Math.floor((now - commentDate) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return commentDate.toDateString();
  }, [commentItem.commentedAt]);

  const handleUserPress = useCallback(() => {
    handleCardPress(commentItem?.commentUser);
  }, [commentItem?.commentUser, handleCardPress]);

  const handleEdit = useCallback(() => {
    handleEditComment(commentItem.comment, commentItem.id, isReply);
  }, [commentItem.comment, commentItem.id, isReply, handleEditComment]);

  const handleDelete = useCallback(() => {
    showDeleteConfirmation(commentItem.id, isReply);
  }, [commentItem.id, isReply, showDeleteConfirmation]);

  const handleReplyPress = useCallback(() => {
    handleReply(
      commentItem.commentId || commentItem.id,
      commentItem.commentUser.fullName,
      commentItem.commentUser.id
    );
  }, [commentItem, handleReply]);

  return (
    <View style={[styles.commentContainer, isReply && styles.replyContainer]}>
      <TouchableOpacity onPress={handleUserPress}>
        <View style={{ position: "relative" }}>
          <Image
            source={require("../assets/images/AnotherImage/Man.png")}
            style={[styles.commentImage, isReply && styles.replyImage, { position: "absolute" }]}
          />
          <FastImage
            source={
              commentItem?.commentUser?.profileUrl
                ? { uri: commentItem?.commentUser?.profileUrl, priority: FastImage.priority.normal }
                : null
            }
            style={[styles.commentImage, isReply && styles.replyImage]}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
      </TouchableOpacity>
      <View style={[styles.commentContent, isReply && styles.replyContent]}>
        <View style={styles.commentHeader}>
          <Text style={styles.userName}>{commentItem?.commentUser?.fullName}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.timeText}>{timeDisplay}</Text>
            {commentItem.isEdited && <Text style={styles.editText}> (Edited)</Text>}
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.commentText}>
            {commentItem.replyTo && isReply ? (
              <>
                <Text style={[styles.replyToText, { color: Colors.secondary }]}>@{commentItem.replyTo} </Text>
                {commentItem.comment}
              </>
            ) : (
              commentItem.comment
            )}
          </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 5, gap: 10 }}>
          {isMyComment ? (
            <>
              <TouchableOpacity onPress={handleEdit}>
                <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
                  <Edit2 size={16} color="#4B5563" />
                  <Text style={{ fontSize: 12, fontFamily: "Poppins-Regular" }}>Edit</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
                  <Trash2 size={16} color="#4B5563" />
                  <Text style={{ fontSize: 12, fontFamily: "Poppins-Regular" }}>Delete</Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={handleReplyPress}>
              <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
                <Reply size={16} color="#4B5563" />
                <Text style={styles.replyText}>Reply</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        {commentItem.reply?.length > 0 && (
          <View style={styles.replyList}>
            {commentItem.reply.map((data) => (
              <ShowCommentList
                key={data.id}
                item={data}
                isReply={true}
                myUserId={myUserId}
                handleCardPress={handleCardPress}
                handleEditComment={handleEditComment}
                showDeleteConfirmation={showDeleteConfirmation}
                handleReply={handleReply}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
});

const RenderPosts = React.memo(({ item, index, setHandOut, updatePost }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [operationLoading, setOperationLoading] = useState(false);
  const [showMoreMap, setShowMoreMap] = useState({});
  const [isLiked, setIsLiked] = useState(item?.isLiked || false);
  const [likesCount, setLikesCount] = useState(item?.likeUser?.length || 0);
  const [isOnline, setIsOnline] = useState(true);
  const [visible1, setVisible1] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [yourActivity, setYourActivity] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [sheetContent, setSheetContent] = useState({ type: null, data: [] });
  const [commentSheetVisible, setCommentSheetVisible] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [commentText, setCommentText] = useState("");
  const [showComment, setShowComment] = useState([]);
  const [postingComment, setPostingComment] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myUserId, setMyUserId] = useState(null);
  const [myUserDetails, setMyUserDetails] = useState(null);
  const [editTo, setEditTo] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeletingReply, setIsDeletingReply] = useState(false);
  const [parentCommentId, setParentCommentId] = useState(null);
  const [imageLoading, setImageLoading] = useState({});
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const bottomSheetRef = useRef(null);
  const commentSheetRef = useRef(null);
  const textInputRef = useRef(null);

  // Memoized calculations
  const PostUri = useMemo(() => item?.imageUrls ?? [], [item?.imageUrls]);
  const downloadedPostUri = useMemo(() =>
    item?.downloadedImageUrls
      ? item.downloadedImageUrls.map((url) => `file://${url}`)
      : [], [item?.downloadedImageUrls]
  );
  const hasMedia = useMemo(() => {
    return (isOnline && PostUri.length > 0) || (!isOnline && downloadedPostUri.length > 0);
  }, [isOnline, PostUri, downloadedPostUri]);
  const images = useMemo(() => {
    if (!hasMedia) return [];
    const uris = isOnline && PostUri.length > 0 ? PostUri : downloadedPostUri;
    return uris.map((uri) => ({
      uri,
      type: isVideo(uri) ? "video" : "image",
      caption: item.caption,
    }));
  }, [isOnline, PostUri, downloadedPostUri, item.caption, hasMedia]);
  const finalUri = useMemo(() => {
    const profileUri = item?.userDetails?.profileUrl;
    const downloadedUri = item?.downloadedProfileUrl
      ? `file://${item.downloadedProfileUrl}`
      : null;
    return isOnline && profileUri?.trim()
      ? profileUri
      : downloadedUri?.trim()
        ? downloadedUri
        : DEFAULT_IMAGE;
  }, [item?.userDetails?.profileUrl, item?.downloadedProfileUrl, isOnline]);

  // Network effect
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // User details effect
  useEffect(() => {
    const fetchUserId = async () => {
      const user = await AsyncStorage.getItem("userDetails");
      if (user) {
        const parsed = JSON.parse(user);
        setMyUserId(parsed?.id);
        setMyUserDetails(parsed);
      }
    };
    fetchUserId();
  }, []);

  // Orientation effect
  useEffect(() => {
    Orientation.lockToPortrait();
  }, []);

  // Preload images effect - limited to first 3 images
  useEffect(() => {
    if (hasMedia) {
      const preloadImages = async () => {
        const imagePromises = images
          .filter((item) => item.type === "image")
          .slice(0, 3)
          .map((item) =>
            FastImage.preload([{ uri: item.uri, priority: FastImage.priority.high }])
          );
        await Promise.all(imagePromises);
      };
      preloadImages();
    }
  }, [images, hasMedia]);

  // Activity check effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbResult = await AsyncStorage.getItem("userDetails");
        const userDetails = JSON.parse(dbResult);
        if (userDetails.id === item.userDetails.id) {
          setYourActivity(true);
        }
      } catch (error) {
        console.error("Error fetching data from AsyncStorage:", error);
      }
    };
    fetchData();
  }, [item.userDetails.id]);

  // Handlers
  const handleTextLayout = useCallback((e, index) => {
    const lineCount = e.nativeEvent.lines.length;
    if (lineCount > 1) {
      setShowMoreMap((prev) => ({ ...prev, [index]: true }));
    }
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setSheetContent({ type: null, data: [] });
  }, []);

  const openSheet = useCallback((type, data) => {
    try {
      setSheetContent({ type, data });
      if (bottomSheetRef.current) {
        bottomSheetRef.current.open();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to open sheet",
          position: "bottom",
        });
      }
    } catch (error) {
      console.error("Error opening bottom sheet:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to open sheet",
        position: "bottom",
      });
    }
  }, []);

  const openLikesSheet = useCallback(() => {
    openSheet('likes', item?.likeUser || []);
  }, [item?.likeUser, openSheet]);

  const openTaggedUsersSheet = useCallback(() => {
    openSheet('taggedUsers', item?.taggedUsers || []);
  }, [item?.taggedUsers, openSheet]);

  const getComment = useCallback(async (page = 1) => {
    if (loading || (!hasMore && page !== 1)) return;
    setLoading(true);
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) {
        console.error("No auth token found");
        return;
      }
      const queryParams = new URLSearchParams({
        hangoutId: item.id,
        page,
        limit: 20,
      }).toString();
      const url = `${apiServerUrl}/user/getAllHangoutPostComments?${queryParams}`;
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
      setHasMore(newComments.length === 20);
    } catch (error) {
      console.error("Error fetching comments:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load comments",
        position: "bottom",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading, hasMore, item.id]);

  const openCommentSheet = useCallback(() => {
    // Reset the state first to ensure clean opening
    if (commentSheetRef.current) {
      setCommentSheetVisible(true);
      setPageNumber(1);
      setHasMore(true);
      setShowComment([]); // Clear previous comments

      // Open the sheet
      commentSheetRef.current.open();

      // Focus and fetch comments after a short delay
      setTimeout(() => {
        textInputRef.current?.focus();
        getComment(1);
      }, 100);
    } else {
      showToast("Something went wrong, please try again", 'error');
    }
  }, [getComment]);

  const closeCommentSheet = useCallback(() => {
    // Close the sheet first
    if (commentSheetRef.current) {
      commentSheetRef.current.close();
    }

    // Reset all states after closing
    setTimeout(() => {
      setCommentSheetVisible(false);
      setCommentText("");
      setReplyTo(null);
      setEditTo(null);
      setEditingCommentId(null);
      setIsEditingReply(false);
      setDeleteModalVisible(false);
      setParentCommentId(null);
      setShowComment([]);
    }, 100);
  }, []);

  const handleCommentEndReached = useCallback(() => {
    if (!loading && hasMore && !refreshing) {
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      getComment(nextPage);
    }
  }, [loading, hasMore, refreshing, pageNumber, getComment]);

  const handleCommentRefresh = useCallback(() => {
    setRefreshing(true);
    setPageNumber(1);
    setHasMore(true);
    getComment(1);
  }, [getComment]);

  const handlePostComment = useCallback(async () => {
    if (!commentText.trim()) return;
    const authToken = await AsyncStorage.getItem("authToken");
    const body = {
      likeComments: [
        {
          hangoutId: item.id,
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
        }
      ],
    };
    setPostingComment(true);
    let previousComments = [...showComment];
    try {
      const userData = await AsyncStorage.getItem("userDetails");
      const user = userData ? JSON.parse(userData) : {};
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      const newComment = {
        id: tempId,
        comment: commentText,
        commentedAt: new Date().toISOString(),
        commentUser: {
          id: user.id,
          fullName: user.fullName || "Anonymous",
          profileUrl: user.profileUrl || DEFAULT_IMAGE,
        },
        ...(replyTo && {
          commentId: replyTo.id,
          replyTo: replyTo.userName,
          userId: replyTo.userId,
        }),
        isEdited: false,
        reply: [],
      };
      if (editingCommentId) {
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
      } else if (replyTo) {
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
                      profileUrl: user.profileUrl || DEFAULT_IMAGE,
                    },
                  },
                ],
              }
              : comment
          )
        );
      } else {
        setShowComment((prev) => [newComment, ...prev]);
      }
      setCommentText("");
      const response = await apiCallWithToken(
        `${apiServerUrl}/user/likeCommentHangoutPost`,
        "PUT",
        body,
        authToken
      );
      setShowComment((prev) =>
        prev.map((comment) =>
          comment.id === tempId ? { ...comment, id: response.result?.commentId || tempId } : comment
        )
      );
      if (updatePost && !replyTo && !editingCommentId) {
        const newCommentCount = (item.comments?.length || 0) + 1;
        updatePost(item.id, { comments: { ...item.comments, length: newCommentCount } });
      }
      Toast.show({
        type: "success",
        text1: editingCommentId ? "Comment Edited Successfully" : replyTo ? "Reply Posted Successfully" : "Comment Posted Successfully",
        position: "bottom",
      });
    } catch (error) {
      console.error("Error posting/editing/replying comment:", error);
      setShowComment(previousComments);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to post/edit/reply comment",
        position: "bottom",
      });
    } finally {
      setPostingComment(false);
      setCommentText("");
      setReplyTo(null);
      setEditTo(null);
      setEditingCommentId(null);
      setIsEditingReply(false);
      setParentCommentId(null);
    }
  }, [commentText, item.id, replyTo, editingCommentId, isEditingReply, parentCommentId, showComment, updatePost, item.comments]);

  const handleEditComment = useCallback((comment, commentId, isReply = false) => {
    setCommentText(comment);
    setEditTo({ id: commentId, comment });
    setEditingCommentId(commentId);
    setIsEditingReply(isReply);
    setReplyTo(null);
    setDeleteModalVisible(false);
    if (isReply) {
      const parentComment = showComment.find((comment) =>
        comment.reply.some((rep) => rep.id === commentId)
      );
      if (parentComment) {
        setParentCommentId(parentComment.id);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Cannot edit reply: Parent comment not found",
          position: "bottom",
        });
        return;
      }
    } else {
      setParentCommentId(null);
    }
    textInputRef.current?.focus();
  }, [showComment]);

  const cancelEditOrReply = useCallback(() => {
    setReplyTo(null);
    setEditTo(null);
    setEditingCommentId(null);
    setIsEditingReply(false);
    setCommentText("");
    setDeleteModalVisible(false);
    setParentCommentId(null);
    textInputRef.current?.focus();
  }, []);

  const showDeleteConfirmation = useCallback((commentId, isReply = false) => {
    setCommentToDelete(commentId);
    setIsDeletingReply(isReply);
    setReplyTo(null);
    setEditTo(null);
    setEditingCommentId(null);
    setCommentText("");
    if (isReply) {
      const parentComment = showComment.find((comment) =>
        comment.reply.some((rep) => rep.id === commentId)
      );
      if (parentComment) {
        setParentCommentId(parentComment.id);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Cannot delete reply: Parent comment not found",
          position: "bottom",
        });
        return;
      }
    } else {
      setParentCommentId(null);
    }
    setDeleteModalVisible(true);
  }, [showComment]);

  const handleDeleteComment = useCallback(async () => {
    if (!commentToDelete) return;
    setLoading(true);
    setDeleteModalVisible(false);
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      const body = {
        likeComments: [
          {
            hangoutId: item.id,
            comment: "true",
            [isDeletingReply ? "replyCommentId" : "commentId"]: commentToDelete,
            ...(isDeletingReply && parentCommentId ? { commentId: parentCommentId } : {}),
            type: isDeletingReply ? "DELETEREPLY" : "DELETE",
          },
        ],
      };
      await apiCallWithToken(
        `${apiServerUrl}/user/likeCommentHangoutPost`,
        "PUT",
        body,
        authToken
      );
      setShowComment((prev) =>
        prev
          .map((comment) => ({
            ...comment,
            reply: comment.reply.filter((rep) => rep.id !== commentToDelete),
          }))
          .filter((comment) => comment.id !== commentToDelete)
      );
      if (updatePost && !isDeletingReply) {
        const newCommentCount = Math.max((item.comments?.length || 0) - 1, 0);
        updatePost(item.id, { comments: { ...item.comments, length: newCommentCount } });
      }
      Toast.show({
        type: "success",
        text1: "Comment Deleted Successfully",
        position: "bottom",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete comment",
        position: "bottom",
      });
    } finally {
      setLoading(false);
      setCommentToDelete(null);
      setIsDeletingReply(false);
      setParentCommentId(null);
    }
  }, [commentToDelete, item.id, isDeletingReply, parentCommentId, updatePost, item.comments]);

  const handleReply = useCallback((commentId, userName, userId) => {
    setReplyTo({ id: commentId, userName, userId });
    setEditTo(null);
    setEditingCommentId(null);
    setIsEditingReply(false);
    setCommentText("");
    setDeleteModalVisible(false);
    setParentCommentId(commentId);
    textInputRef.current?.focus();
  }, []);

  const handleLikeApi = useCallback(async (likeState) => {
    const previousLiked = isLiked;
    const previousCount = likesCount;
    const previousLikeUser = [...(item.likeUser || [])];
    setIsLiked(likeState);
    setLikesCount(likeState ? previousCount + 1 : Math.max(previousCount - 1, 0));
    let updatedLikeUser = [...previousLikeUser];
    const currentUser = {
      id: myUserId,
      fullName: myUserDetails?.fullName || 'You',
      profileUrl: myUserDetails?.profileUrl || '',
    };
    if (likeState) {
      if (!updatedLikeUser.some(u => u.id === myUserId)) {
        updatedLikeUser.push(currentUser);
      }
    } else {
      updatedLikeUser = updatedLikeUser.filter(u => u.id !== myUserId);
    }
    if (updatePost) {
      updatePost(item.id, {
        isLiked: likeState,
        likeUser: updatedLikeUser
      });
    }
    setIsLikeLoading(true);
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      if (await checkConnected()) {
        if (!authToken) {
          throw new Error("No auth token found");
        }
        const body = {
          likeComments: [{ hangoutId: item.id, isLiked: likeState }],
        };
        const response = await axios({
          method: "PUT",
          url: apiServerUrl + "/user/likeCommentHangoutPost",
          data: body,
          headers: { authToken },
        });
        if (response.data.responseCode !== 200) {
          throw new Error(`Unexpected response code: ${response.data.responseCode}`);
        }
      } else {
        const body = {
          likeComments: [{ hangoutId: item.id, isLiked: likeState }],
        };
        const DataItem = [];
        const allData = RealmService.getAllData("hangOutData", "UserDatabase.realm");
        allData.forEach((element) => {
          let myData = JSON.parse(element.item);
          if (myData.id === item.id) {
            myData.isLiked = likeState;
            myData.likeUser = updatedLikeUser;
          }
          DataItem.push(myData);
        });
        const allDataLikeData = RealmService.getAllData("HangOutLike", "UserDatabase.realm");
        const existingData = allDataLikeData.find((data) => {
          const parsedData = JSON.parse(data.item);
          return parsedData.likeComments[0]?.hangoutId === item.id;
        });
        if (existingData) {
          RealmService.deleteData("HangOutLike", existingData.id, "UserDatabase.realm");
          const updatedData = {
            ...JSON.parse(existingData.item),
            likeComments: [{ hangoutId: item.id, isLiked: likeState }],
          };
          RealmService.addOrUpdateData("HangOutLike", updatedData, "UserDatabase.realm");
        } else {
          RealmService.addOrUpdateData("HangOutLike", body, "UserDatabase.realm");
        }
        RealmService.addOrUpdateData("hangOutData", DataItem, "UserDatabase.realm");
      }
    } catch (error) {
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      if (updatePost) {
        updatePost(item.id, {
          isLiked: previousLiked,
          likeUser: previousLikeUser
        });
      }
      console.error("Error toggling like:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to process like. Please try again.",
        position: "bottom",
      });
    } finally {
      setIsLikeLoading(false);
    }
  }, [isLiked, likesCount, item.likeUser, item.id, myUserId, myUserDetails, updatePost]);

  const handleLikeToggle = useCallback(() => {
    if (isLikeLoading) return;
    handleLikeApi(!isLiked);
  }, [isLikeLoading, isLiked, handleLikeApi]);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig: { viewAreaCoveragePercentThreshold: 50 }, onViewableItemsChanged },
  ]);

  const handleDelete = useCallback(async () => {
    setModalVisible(false);
    await handleDeleteGroup();
  }, []);

  const handleDeleteGroup = useCallback(async () => {
    setOperationLoading(true);
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      setHandOut((prev) => prev.filter((post) => post.id !== item.id));
      const res = await axios({
        method: "PUT",
        url: `${apiServerUrl}/user/updateHangoutPost`,
        data: { hangouts: [{ hangoutId: item.id, status: "DELETE" }] },
        headers: { authToken: userDetails.authToken },
      });
      if (res?.data?.responseCode === 200) {
        setVisible1(false);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Post deleted successfully",
          position: "bottom",
        });
      } else {
        setHandOut((prev) => [...prev, item]);
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      console.log("Error in deleting group activity", error.response?.data);
      setHandOut((prev) => [...prev, item]);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete post. Please try again.",
        position: "bottom",
      });
    } finally {
      setOperationLoading(false);
    }
  }, [item, setHandOut]);

  const handleReportGroup = useCallback(async (reasonString) => {
    setOperationLoading(true);
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      setHandOut((prev) => prev.filter((post) => post.id !== item.id));
      const res = await axios({
        method: "PUT",
        url: `${apiServerUrl}/user/updateHangoutPost`,
        data: {
          hangouts: [{ hangoutId: item.id, reason: reasonString, status: "REPORTED" }],
        },
        headers: { authToken: userDetails.authToken },
      });
      if (res?.data?.responseCode === 200) {
        setVisible1(false);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Post reported successfully",
          position: "bottom",
        });
      } else {
        setHandOut((prev) => [...prev, item]);
        throw new Error("Failed to report post");
      }
    } catch (error) {
      console.log("Error in reporting group activity", error?.response?.data);
      setHandOut((prev) => [...prev, item]);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to report post. Please try again.",
        position: "bottom",
      });
    } finally {
      setOperationLoading(false);
    }
  }, [item, setHandOut]);

  const handleReportSubmit = useCallback(async (reason) => {
    setReportModalVisible(false);
    await handleReportGroup(reason);
  }, [handleReportGroup]);

  const handleMediaPress = useCallback((uri, index) => {
    setSelectedMedia({ mediaItems: images, initialIndex: index });
    setMediaModalVisible(true);
  }, [images]);

  const handleCardPress = useCallback((user) => {
    navigation.navigate("CrewProfile", { item: user, source: "hangout" });
  }, [navigation]);

  const openMenu = useCallback(() => setVisible1(true), []);
  const closeMenu = useCallback(() => setVisible1(false), []);

  const toggleExpand = useCallback((index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  }, [expandedIndex]);

  // Render functions aligned with HomeHangout
  const renderItem = useCallback(({ item: imageItem, index }) => (
    <TouchableOpacity onPress={() => handleMediaPress(imageItem.uri, index)}>
      <View style={searchStyles.imageContainer}>
        {isVideo(imageItem.uri) ? (
          <>
            <Video
              source={{
                uri: imageItem.uri,
                bufferConfig: {
                  minBufferMs: 1000,
                  maxBufferMs: 5000,
                  bufferForPlaybackMs: 500,
                },
              }}
              style={searchStyles.imageStyle}
              resizeMode="contain"
              muted
              repeat
              cache
              paused={currentIndex !== index}
            />
            <View style={searchStyles.playIconContainer}>
              <Image
                source={ImagesAssets.vedioPlaybutton}
                style={searchStyles.playIcon}
                resizeMode="contain"
              />
            </View>
          </>
        ) : (
          <View>
            {imageLoading[imageItem.uri] && (
              <ActivityIndicator style={StyleSheet.absoluteFill} size="small" color={Colors.secondary} />
            )}
            <FastImage
              style={searchStyles.imageStyle}
              source={{
                uri: imageItem.uri,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }}
              resizeMode={FastImage.resizeMode.contain}
              onLoadStart={() => setImageLoading((prev) => ({ ...prev, [imageItem.uri]: true }))}
              onLoadEnd={() => setImageLoading((prev) => ({ ...prev, [imageItem.uri]: false }))}
              onError={() => {
                setImageLoading((prev) => ({ ...prev, [imageItem.uri]: false }));
                console.log(`Failed to load image: ${imageItem.uri}`);
              }}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), [handleMediaPress, imageLoading, setImageLoading, currentIndex]);

  const taggedUsersDisplay = useMemo(() => (
    <TouchableOpacity onPress={openTaggedUsersSheet}>
      <View style={searchStyles.avatarRow}>
        {item?.taggedUsers.slice(0, 3).map((user, index) => (
          <FastImage
            key={user.id}
            style={[searchStyles.avatar1, { marginLeft: index > 0 ? -15 : 0 }]}
            source={{
              uri: user?.profileUrl || DEFAULT_IMAGE,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ))}
        {item?.taggedUsers?.length > 3 && (
          <View style={searchStyles.additionalUsers}>
            <Text style={searchStyles.additionalUsersText}>
              +{item?.taggedUsers?.length - 3}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), [item?.taggedUsers, openTaggedUsersSheet]);

  const hashtagsDisplay = useMemo(() => (
    <View style={searchStyles.hashtagsContainer}>
      {(item.groupActivityId) && (
        <View style={[searchStyles.tag, { backgroundColor: '#FBCF21' }]}>
          <Text style={[searchStyles.tagText, { color: '#06361F' }]}>
            BuddyUp Events
          </Text>
        </View>
      )}
      {(formatShipName(item?.userDetails?.ship?.shipName || item?.userDetails?.associatedShip?.shipName)) && (
        <View style={[searchStyles.tag, { backgroundColor: Colors.secondary }]}>
          <Text style={[searchStyles.tagText, { color: '#000000' }]}>
            {formatShipName(item?.userDetails?.ship?.shipName || item?.userDetails?.associatedShip?.shipName || '')}
          </Text>
        </View>
      )}
      {item.hashtags.slice(0, 2).map((hashtag, index) => (
        <View key={index} style={[searchStyles.tag, { backgroundColor: '#FBCF21' }]}>
          <Text style={[searchStyles.tagText, { color: '#06361F' }]}>
            {hashtag ? hashtag.charAt(0).toUpperCase() + hashtag.slice(1) : ""}
          </Text>
        </View>
      ))}
    </View>
  ), [item.groupActivityId, item?.userDetails?.ship, item?.userDetails?.associatedShip, item.hashtags]);

  return (
    <View style={searchStyles.ListContainer}>
      {operationLoading && (
        <View style={searchStyles.operationLoadingOverlay}>
          <ActivityIndicator size="small" color={Colors.secondary} />
        </View>
      )}
      {/* Header */}
      <View style={searchStyles.header}>
        <TouchableOpacity onPress={() => handleCardPress(item?.userDetails)}>
          <FastImage
            style={searchStyles.avatar}
            source={{ uri: finalUri, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
        <View style={searchStyles.userInfo}>
          <TouchableOpacity onPress={() => handleCardPress(item?.userDetails)}>
            <Text style={searchStyles.username}>
              {item?.userDetails?.fullName
                ? item.userDetails.fullName.charAt(0).toUpperCase() +
                item.userDetails.fullName.slice(1)
                : ""}
            </Text>
          </TouchableOpacity>
          <Text style={searchStyles.timestamp}>{item?.userDetails?.designation}</Text>
          {item?.taggedUsers?.length > 0 && (
            <View style={searchStyles.taggedUsersContainer}>
              {taggedUsersDisplay}
            </View>
          )}
        </View>
        <TouchableOpacity style={searchStyles.menuButton} onPress={openMenu}>
          <Menu
            visible={visible1}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity
                style={searchStyles.baseIconsWrapper}
                onPress={openMenu}
              >
                <MoreVertical size={20} color="#4B5563" />
              </TouchableOpacity>
            }
            contentStyle={searchStyles.menuContent}
            {...(Platform.OS === 'android' ? {
              anchorPosition: 'bottom',
              style: visible1 ? { paddingTop: 15 } : {}
            } : {})}
          >
            {yourActivity ? (
              <View style={searchStyles.menuItems}>
                <Menu.Item
                  style={searchStyles.menuItem}
                  onPress={() => {
                    closeMenu();
                    navigation.navigate("NewPost", {
                      mediaFiles: item.imageUrls,
                      caption: item.caption,
                      taggedUsers: item.taggedUsers,
                      hashtags: item.hashtags,
                      postId: item.id,
                    });
                  }}
                  title="Edit"
                  titleStyle={searchStyles.menuItemText}
                  leadingIcon={() => (
                    <Edit2 size={20} color="#4B5563" />
                  )}
                />
                <Menu.Item
                  style={searchStyles.menuItem}
                  onPress={() => setModalVisible(true)}
                  title="Delete"
                  titleStyle={[searchStyles.menuItemText, { color: '#EF4444' }]}
                  leadingIcon={() => (
                    <Trash2 size={20} color="#EF4444" />
                  )}
                />
              </View>
            ) : (
              <Menu.Item
                style={searchStyles.menuItem}
                onPress={() => setReportModalVisible(true)}
                title="Report"
                titleStyle={[searchStyles.menuItemText, { color: '#EF4444' }]}
                leadingIcon={() => <AlertTriangle size={20} color="#EF4444" />}
              />
            )}
          </Menu>
        </TouchableOpacity>
      </View>
      {/* Media */}
      {hasMedia && (
        <View>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
            nestedScrollEnabled={true}
          />
        </View>
      )}
      <Loader isLoading={loading} />
      {/* Content */}
      <View style={searchStyles.contentContainer}>
        {hasMedia && images.length > 1 && (
          <View style={searchStyles.pagination}>
            {images.map((_, idx) => (
              <View
                key={idx}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: currentIndex === idx ? Colors.secondary : '#6B7280',
                  marginHorizontal: 4,
                }}
              />
            ))}
          </View>
        )}
        <View style={searchStyles.contentRow}>
          <Text
            numberOfLines={hasMedia ? (expandedIndex === index ? undefined : 1) : undefined}
            ellipsizeMode={hasMedia ? "tail" : undefined}
            onTextLayout={(e) => handleTextLayout(e, index)}
            style={searchStyles.content}
          >
            {item.caption}
            {hasMedia && expandedIndex === index && showMoreMap[index] && (
              <Text
                onPress={() => toggleExpand(index)}
                style={{ color: Colors.secondary, fontFamily: 'Poppins-SemiBold', fontSize: 15 }}
              >
                {' See less'}
              </Text>
            )}
          </Text>
          {hasMedia && expandedIndex !== index && showMoreMap[index] && (
            <TouchableOpacity onPress={() => toggleExpand(index)}>
              <Text style={{ color: Colors.secondary, fontFamily: 'Poppins-SemiBold', fontSize: 15, marginLeft: 5 }}>
                See more
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {item.createdAt && (
          <Text style={searchStyles.postTimestamp}>
            <ReactTimeAgo
              date={item?.createdTime ? new Date(Number(item.createdTime)) : item.createdAt ? new Date(item.createdAt) : null}
              locale="en-US"
              component={({ date, verboseDate, tooltip, children, ...rest }) => <Text {...rest}>{children}</Text>}
              timeStyle="short"
            />
          </Text>
        )}
        {hashtagsDisplay}
      </View>
      {/* Footer */}
      <View style={searchStyles.footer}>
        <TouchableOpacity
          style={searchStyles.button}
          onPress={handleLikeToggle}
          disabled={isLikeLoading}
        >
          <Heart
            size={24}
            color={isLiked ? Colors.secondary : '#4B5563'}
            fill={isLiked ? Colors.secondary : 'none'}
          />
          {likesCount > 0 && (
            <TouchableOpacity onPress={openLikesSheet}>
              <Text style={searchStyles.buttonText}>{likesCount}</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={searchStyles.button}
          onPress={openCommentSheet}
        >
          <MessageCircle size={24} color="#4B5563" />
          {item?.totalComments > 0 && (
            <Text style={searchStyles.buttonText}>{item.totalComments}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={searchStyles.button}>
          <TrendingUp size={24} color="#4B5563" />
          {item?.viewCount > 0 && (
            <Text style={searchStyles.buttonText}>{item.viewCount}</Text>
          )}
        </TouchableOpacity>
      </View>
      {/* Modals */}
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={handleReportSubmit}
      />
      <DeleteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onDelete={handleDelete}
      />
      {selectedMedia && (
        <MediaPreviewModalForPosts
          visible={mediaModalVisible}
          onClose={() => setMediaModalVisible(false)}
          mediaItems={selectedMedia.mediaItems}
          initialIndex={selectedMedia.initialIndex}
          canSend={false}
          uploadImageToCloudinary={() => { }}
        />
      )}
      {/* Bottom Sheets */}
      <RBSheet
        ref={bottomSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={screenHeight * 0.5}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: '#ededed',
          },
          draggableIcon: {
            display: "none",
          },
        }}
      >
        <View style={searchStyles.sheetContent}>
          <Text style={searchStyles.sheetTitle}>
            {sheetContent.type === 'likes' ? 'Likes' : 'Tagged Users'}
          </Text>
          <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
            {sheetContent.data.length > 0 ? (
              sheetContent.data.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  onPress={() => {
                    closeSheet();
                    navigation.navigate("CrewProfile", { item: user, source: "hangout" });
                  }}
                >
                  <View style={searchStyles.userItemContainer}>
                    <View style={{ position: "relative" }}>
                      <Image
                        source={require("../assets/images/AnotherImage/Man.png")}
                        style={[searchStyles.userImage, { position: "absolute" }]}
                      />
                      <FastImage
                        style={searchStyles.userImage}
                        source={user.profileUrl ? { uri: user.profileUrl } : null}
                        resizeMode={FastImage.resizeMode.cover}
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
                      <Text style={searchStyles.userItem}>{user.fullName}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          closeSheet();
                          navigation.navigate("CrewProfile", { item: user, source: "hangout" });
                        }}
                      >
                        <Eye size={20} color="#4B5563" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={searchStyles.noLikesText}>
                {sheetContent.type === 'likes' ? 'No likes yet' : 'No tagged users'}
              </Text>
            )}
          </ScrollView>
        </View>
      </RBSheet>
      <RBSheet
        ref={commentSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        closeOnPressBack={true}
        draggable={true}
        height={height * 0.6}
        onClose={() => {
          // Reset state when sheet closes (via swipe or back button)
          setCommentSheetVisible(false);
          setCommentText("");
          setReplyTo(null);
          setEditTo(null);
          setEditingCommentId(null);
          setIsEditingReply(false);
          setDeleteModalVisible(false);
          setParentCommentId(null);
          setShowComment([]);
        }}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: "#ededed",
            paddingBottom: 20,
          },
          draggableIcon: {
            backgroundColor: "#6B7280",
            width: 40,
            height: 2,
            borderRadius: 2.5,
            marginVertical: 10,
          },
        }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" || getApiLevel() > 34 ? "padding" : "padding"}
          keyboardVerticalOffset={getApiLevel() > 34 ? 60 : 30}
        >
          <View style={{ flex: 1 }}>
            <View style={searchStyles.commentSheetHeader}>
              <Text style={searchStyles.sheetTitle}>Comments</Text>
            </View>
            <FlatList
              data={showComment}
              renderItem={({ item }) => (
                <ShowCommentList
                  item={item}
                  myUserId={myUserId}
                  handleCardPress={handleCardPress}
                  handleEditComment={handleEditComment}
                  showDeleteConfirmation={showDeleteConfirmation}
                  handleReply={handleReply}
                />
              )}
              keyExtractor={(item) => item.id}
              onEndReached={handleCommentEndReached}
              onEndReachedThreshold={0.5}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 80 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleCommentRefresh} />}
              ListEmptyComponent={<Text style={searchStyles.emptyText}>No comments yet</Text>}
              initialNumToRender={10}
              windowSize={5}
              nestedScrollEnabled={true}
            />
            <Modal
              visible={isDeleteModalVisible}
              onDismiss={() => setDeleteModalVisible(false)}
              contentContainerStyle={searchStyles.modalContent}
            >
              <Text style={searchStyles.modalTitle}>Delete Comment</Text>
              <Text style={searchStyles.modalText}>
                Are you sure you want to delete this comment?
              </Text>
              <View style={searchStyles.modalButtons}>
                <TouchableOpacity
                  style={[searchStyles.modalButton, searchStyles.cancelButton]}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={searchStyles.buttonTextModal}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[searchStyles.modalButton, searchStyles.deleteButton]}
                  onPress={handleDeleteComment}
                >
                  <Text style={[searchStyles.buttonTextModal, { color: "#fff" }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Modal>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={searchStyles.inputContainer}>
                {editTo && (
                  <View style={searchStyles.editHeader}>
                    <Text style={searchStyles.editToText}>
                      Editing {editTo.comment.length > 20 ? `${editTo.comment.slice(0, 20)}...` : editTo.comment}
                    </Text>
                    <TouchableOpacity onPress={cancelEditOrReply}>
                      <X size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                )}
                {replyTo && !editTo && (
                  <View style={searchStyles.replyHeader}>
                    <Text style={searchStyles.replyToTextInput}>Replying to {replyTo.userName}</Text>
                    <TouchableOpacity onPress={cancelEditOrReply}>
                      <X size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                )}
                <View style={searchStyles.inputWrapper}>
                  <TextInput
                    ref={textInputRef}
                    placeholder={
                      editTo
                        ? `Editing ${editTo.comment.length > 20 ? `${editTo.comment.slice(0, 20)}...` : editTo.comment}`
                        : replyTo
                          ? "Write a reply..."
                          : "Write your comment"
                    }
                    placeholderTextColor="#6B7280"
                    style={searchStyles.textInput}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    editable={!postingComment}
                  />
                  <TouchableOpacity
                    style={searchStyles.sendButton}
                    onPress={handlePostComment}
                    disabled={!commentText.trim() || postingComment}
                  >
                    <SendHorizonal
                      size={24}
                      strokeWidth={1.5}
                      color={Colors.white}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </KeyboardAvoidingView>
      </RBSheet>
    </View>
  );
});

const Search = ({ navigation }) => {
  const searchData = useSelector((state) => state.search.searchData);
  const [activeSection, setActiveSection] = useState("users");
  const [postsData, setPostsData] = useState([]);

  useEffect(() => {
    if (activeSection === 'posts') {
      setPostsData(currentData);
    }
  }, [activeSection, currentData]);

  const updatePost = useCallback((postId, updates) => {
    setPostsData(prev => prev.map(post => post.id === postId ? { ...post, ...updates } : post));
  }, []);

  const RenderAnnouncement = ({ item }) => (
    <View style={styles.scrollView}>
      <TouchableOpacity style={[styles.frameParent, styles.parentFlexBox]}>
        <LinearGradient
          style={styles.wrapperLayout}
          locations={[0, 1]}
          colors={["rgba(0, 0, 0, 0)", "#000"]}
          useAngle
          angle={140.38}
        >
          <ImageBackground
            style={[styles.icon, styles.iconLayout]}
            resizeMode="cover"
            source={{ uri: item.thumbnail }}
          >
            <Text style={[styles.weeklyMeetingDeckContainer, styles.pointForCompletingTypo]}>
              <Text style={styles.deck}>
                {item?.title?.length > 25 ? `${item.title.slice(0, 25)}...` : item.title || ""}
              </Text>
            </Text>
            <Image
              style={styles.layer1Icon}
              resizeMode="cover"
              source={ImagesAssets.Layer_2}
            />
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={[styles.weeklyMeeting, styles.pointForCompletingTypo]}
            >
              {item?.description || ""}
            </Text>
          </ImageBackground>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const RenderArticle = ({ item }) => (
    <Pressable
      style={[styles.cardContainer, { width: (width - 45) / 2 }]}
      onPress={() => navigation.replace("ArticlesDetails", { dataItem: item })}
    >
      <View style={styles.cardContent}>
        <ImageBackground
          style={styles.imageBackground}
          resizeMode="cover"
          source={{
            uri: item?.thumbnail || ImagesAssets.health_card_image,
          }}
        />
        <View style={styles.textContainer}>
          <Text
            style={[styles.titleText, styles.textColor]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item?.contentTitle?.length > 22
              ? `${item.contentTitle.slice(0, 22)}...`
              : item.contentTitle || ""}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const RenderGroupActivities = ({ item }) => (
    <Pressable
      style={[styles.cardContainer, { width: (width - 45) / 2 }]}
      onPress={() => navigation.navigate("WorkoutBuddies", { activity: { id: item.id } })}
    >
      <View style={styles.cardContent}>
        <ImageBackground
          style={[styles.imageBackground]}
          resizeMode="cover"
          source={
            item.imageUrls?.length > 0
              ? { uri: item.imageUrls[0] }
              : ImagesAssets.health_card_image
          }
        />
        <View style={styles.textContainer}>
          <Text style={[styles.titleText, styles.textColor]}>
            {item?.eventName?.length > 22
              ? `${item.eventName.slice(0, 22)}...`
              : item.eventName || ""}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const RenderMusics = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainerMusic}
      onPress={() => navigation.navigate("MusicPlayer", { dataItem: item })}
    >
      <View style={styles.cardContentMusic}>
        <Image
          style={styles.imageBackgroundMusic}
          resizeMode="cover"
          source={{ uri: item.thumbnail }}
        />
        <View style={styles.textContainerMusic}>
          <Text
            style={[styles.titleTextMusic, styles.textColor]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.contentTitle?.length > 42
              ? `${item.contentTitle.slice(0, 42)}...`
              : item.contentTitle || ""}
          </Text>
          <View style={styles.playButton}>
            <Image
              style={styles.frameItemMusic}
              resizeMode="cover"
              source={ImagesAssets.baseicon2}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const RenderUsers = ({ item }) => (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.replace("CrewProfile", { item })}
    >
      <Image
        source={{
          uri:
            item.profileUrl ||
            "https://as1.ftcdn.net/v2/jpg/03/46/83/96/1000_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg",
        }}
        style={styles.image}
      />
      <View>
        <Text style={styles.name}>
          {item.fullName?.length > 22
            ? `${item.fullName.slice(0, 22)}...`
            : item.fullName || ""}
        </Text>
        <Text style={styles.designation}>{item.designation}</Text>
      </View>
    </TouchableOpacity>
  );

  const RenderVideos = ({ item }) => (
    <Pressable
      style={[styles.cardContainer, { width: (width - 45) / 2 }]}
      onPress={() => navigation.replace("VideosDetails", { dataItem: item })}
    >
      <View style={styles.cardContent}>
        <ImageBackground
          style={styles.imageBackground}
          resizeMode="cover"
          source={{ uri: item.thumbnail }}
        />
        <View style={styles.textContainer}>
          <Text
            style={[styles.titleText, styles.textColor]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.contentTitle?.length > 22
              ? `${item.contentTitle.slice(0, 22)}...`
              : item.contentTitle || ""}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const renderItemComponents = {
    bulletin: RenderAnnouncement,
    read: RenderArticle,
    buddyup: RenderGroupActivities,
    listen: RenderMusics,
    users: RenderUsers,
    watch: RenderVideos,
    posts: (props) => <RenderPosts {...props} setHandOut={setPostsData} updatePost={updatePost} />,
  };

  const hasData = (key) => {
    try {
      const keys = key.split(".");
      let data = searchData;
      for (const k of keys) {
        data = data?.[k];
        if (!data) return false;
      }
      return Array.isArray(data) ? data.length > 0 : !!data;
    } catch {
      return false;
    }
  };

  const visibleSections = useMemo(
    () => sections.filter((section) => hasData(section.dataKey)),
    [searchData]
  );

  useEffect(() => {
    if (visibleSections.length > 0) {
      const usersSection = visibleSections.find(s => s.id === "users");
      setActiveSection(usersSection ? "users" : visibleSections[0].id);
    }
  }, [visibleSections]);

  const activeIndex = visibleSections.findIndex((s) => s.id === activeSection);
  const currentSection = activeIndex !== -1 ? visibleSections[activeIndex] : visibleSections[0];
  const currentData = useMemo(() => {
    if (!currentSection) return [];
    try {
      const keys = currentSection.dataKey.split(".");
      let data = searchData;
      for (const k of keys) {
        data = data?.[k];
      }
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, [searchData, currentSection]);

  const ListEmptyComponent = ({ message }) => (
    <View style={[styles.emptyContainer, { width }]}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  const RenderCurrentContent = useMemo(() => {
    if (!currentSection) return null;
    const RenderComponent = renderItemComponents[currentSection.id];
    if (!RenderComponent) return null;
    return ({ item, index }) => <RenderComponent item={item} index={index} />;
  }, [currentSection]);

  if (!searchData) {
    return (
      <KeyboardAvoidingView
        style={styles.rootContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
      >
        <SearchComponent navigation={navigation} />
        <View style={[styles.emptyContainer, { flex: 1, justifyContent: "center" }]}>
          <Text style={styles.emptyText}>
            Search across crew members, BuddyUp events, articles, audios, and videos.
          </Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (visibleSections.length === 0) {
    return (
      <KeyboardAvoidingView
        style={styles.rootContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
      >
        <SearchComponent navigation={navigation} />
        <View style={[styles.emptyContainer, { flex: 1, justifyContent: "center" }]}>
          <Text style={styles.emptyText}>
            No records found for your search. Please try with different keywords.
          </Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  const isGrid = ["read", "buddyup", "watch"].includes(currentSection.id);
  const isHorizontal = currentSection.id === "bulletin";
  const flatListData = activeSection === 'posts' ? postsData : currentData;

  return (
    <KeyboardAvoidingView
      style={styles.rootContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
    >
      <SearchComponent navigation={navigation} />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <FocusAwareStatusBar
            barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
            backgroundColor={Colors.white}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContentContainer}
          >
            {visibleSections.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={[styles.tab, activeSection === section.id && styles.activeTab]}
                onPress={() => setActiveSection(section.id)}
              >
                <Text
                  style={[styles.tabText, activeSection === section.id && styles.activeTabText]}
                >
                  {section.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.HeaderTitle}>{currentSection.title}</Text>
          <FlatList
            horizontal={isHorizontal}
            numColumns={isGrid ? 2 : 1}
            showsHorizontalScrollIndicator={false}
            data={flatListData}
            renderItem={RenderCurrentContent}
            ListEmptyComponent={<ListEmptyComponent message={`No ${currentSection.title}`} />}
            keyExtractor={(item, index) => `${currentSection.id}-${item.id || index}`}
            columnWrapperStyle={isGrid ? styles.columnWrapper : null}
            key={`${currentSection.id}-${isGrid ? 'grid' : 'list'}`}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Search;

const styles = StyleSheet.create({
  rootContainer: {
    backgroundColor: "white",
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tabsContainer: {
    marginVertical: 10,
  },
  tabsContentContainer: {
    flexDirection: "row",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  activeTab: {
    backgroundColor: Colors.secondary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
  activeTabText: {
    color: "white",
    fontFamily: "Poppins-Medium",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  HeaderTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#06361F",
  },
  cardContainer: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    borderRadius: 10,
    padding: 8,
    marginVertical: 6,
    marginRight: 4,
    marginLeft: 4,
  },
  cardContent: {
    overflow: "hidden",
    borderRadius: 10,
  },
  imageBackground: {
    height: 80,
    borderRadius: 10,
    justifyContent: "flex-end",
    padding: 8,
  },
  textContainer: {
    paddingVertical: 5,
  },
  titleText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#161616",
  },
  textColor: {
    color: "#161616",
  },
  cardContainerMusic: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  cardContentMusic: {
    flexDirection: "row",
  },
  imageBackgroundMusic: {
    borderRadius: 10,
    width: 65,
  },
  textContainerMusic: {
    flexDirection: "row",
    padding: 12,
    justifyContent: "space-between",
    flex: 1,
  },
  titleTextMusic: {
    marginTop: 4,
    width: "70%",
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#161616",
  },
  playButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    height: 28,
    width: 28,
  },
  frameItemMusic: {
    width: 14,
    height: 14,
  },
  parentFlexBox: {
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 16,
  },
  scrollView: {
    marginTop: 15,
    marginHorizontal: 4,
    marginBottom: 5,
  },
  iconLayout: {
    height: 144,
    width: 355,
    borderRadius: 16,
    overflow: "hidden",
  },
  pointForCompletingTypo: {
    textAlign: "left",
    color: "#fff",
    lineHeight: 17,
    fontSize: 14,
  },
  layer1Icon: {
    width: 38,
    height: 38,
    position: "absolute",
    right: 20,
    top: 10,
  },
  weeklyMeeting: {
    fontFamily: "Poppins-Regular",
    color: "#fff",
  },
  deck: {
    fontFamily: "Poppins-SemiBold",
    fontWeight: "600",
  },
  weeklyMeetingDeckContainer: {
    alignSelf: "stretch",
  },
  icon: {
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 25,
    height: "100%",
    width: "100%",
  },
  wrapperLayout: {
    height: 144,
    width: 355,
    borderRadius: 16,
    overflow: "hidden",
  },
  frameParent: {
    flex: 1,
  },
  container: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#E8E8E8",
    backgroundColor: "#ededed",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 0,
    gap: 10,
    alignItems: "center",
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 10,
  },
  name: {
    color: "#636363",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  designation: {
    color: "#636363",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  columnWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  commentContainer: {
    flexDirection: "row",
    padding: 10,
    paddingVertical: 12,
    marginBottom: 10,
  },
  commentImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  replyImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  replyContent: {
    marginLeft: 8,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userName: {
    fontWeight: "600",
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
  },
  timeText: {
    color: "#666",
    fontSize: 10,
    fontFamily: 'Poppins-Regular'
  },
  editText: {
    color: "#666",
    fontSize: 10,
    marginLeft: 5,
    fontFamily: 'Poppins-Regular'
  },
  commentText: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular'
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
  caption: {
    lineHeight: 20,
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
  },
  timestamp: {
    fontSize: 10,
    lineHeight: 15,
    color: "#FFFFFF",
    fontFamily: "Poppins-Regular",
  },
  interactionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
    width: width - 60,
  },
  iconButton: {
    marginRight: 10,
  },
  iconLike: {
    width: 25,
    height: 25,
  },
  avatarRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#FFFFFF66",
  },
  avatar1: {
    width: 32,
    height: 32,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  additionalUsers: {
    height: 32,
    width: 32,
    borderRadius: 20,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -15,
  },
  additionalUsersText: {
    color: "#fff",
    fontWeight: "bold",
  },
  baseIcons: {
    width: 20,
    height: 20,
  },
  baseIconsWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  crewParentFlexBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    marginRight: 10,
    position: "absolute",
    right: 0,
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
  sheetContent: {
    paddingVertical: 20,
    zIndex: 1001,
  },
  sheetTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "black",
    marginVertical: 10,
    textAlign: "center",
  },
  likesCountText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: "center",
  },
  commentSheetHeader: {
    alignItems: "center",
    justifyContent: 'center',
  },
  replyContainer: {
    marginLeft: 20,
    marginTop: 5,
  },
  operationLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
const searchStyles = StyleSheet.create({
  ListContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1D5DB',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    marginBottom: 5,
  },
  imageContainer: {
    overflow: "hidden",
    borderRadius: 8,
    width: width - 66,
    height: 250,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imageStyle: {
    width: width - 66,
    height: 250,
  },
  playIconContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  playIcon: {
    width: 40,
    height: 40,
    tintColor: "#fff",
  },
  contentContainer: {
    marginBottom: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 5,
    maxWidth: '100%',
  },
  content: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
    flex: 1,
    lineHeight: 22,
  },
  postTimestamp: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 10,
    fontFamily: 'Poppins-Regular',
  },
  hashtagsContainer: {
    flexDirection: 'row',
    gap: 5,
    borderRadius: 10,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  tag: {
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  tagText: {
    fontSize: 9,
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 4,
    marginTop: Platform.OS === 'android' ? 3 : 0,
    fontFamily: 'Poppins-Regular',
  },
  menuButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  baseIconsWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseIcons: {
    width: 20,
    height: 20,
  },
  menuContent: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
  },
  menuItems: {
    flexDirection: 'column',
    gap: 10,
  },
  menuItem: {
    height: 35,
    marginRight: -30,
  },
  menuItemText: {
    color: '#1F2937',
  },
  taggedUsersContainer: {
    height: 30,
    marginTop: 3,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar1: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  additionalUsers: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -15,
  },
  additionalUsersText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconLike: {
    width: 25,
    height: 25,
  },
  userItemContainer: {
    borderColor: '#E5E7EB',
    backgroundColor: '#f3f3f3',
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 5,
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  userItem: {
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: '#1F2937',
  },
  userImage: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 20,
  },
  noLikesText: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: "center",
    paddingVertical: 20,
    fontFamily: 'Poppins-Regular',
  },
  sheetContent: {
    paddingVertical: 20,
    zIndex: 1001,
  },
  sheetTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: '#1F2937',
    textAlign: "center",
  },
  commentSheetHeader: {
    justifyContent: 'center',
  },
  inputContainer: {
    padding: 10,
    backgroundColor: "#ededed",
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
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
  replyToTextInput: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
  },
  editToText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Poppins-Regular',
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
    backgroundColor: '#F3F4F6',
    color: '#000000',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#82934b",
    padding: 8,
    borderRadius: 50,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: '#6B7280',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  modalText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    textAlign: "center",
    fontFamily: 'Poppins-Regular',
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
    backgroundColor: '#E5E7EB',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  buttonTextModal: {
    fontSize: 16,
    fontWeight: "600",
    color: '#1F2937',
    fontFamily: 'Poppins-SemiBold',
  },
  operationLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
