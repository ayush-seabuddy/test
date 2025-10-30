import {
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Pressable,
  TextInput,
  Keyboard,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ActivityIndicator, Menu, Modal } from "react-native-paper";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import NetInfo from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";
import Loader from "../Loader";
import RealmService from "../../Realm/Realm";
import ReportModal from "../Modals/ReasonModal";
import DeleteModal from "../Modals/DeleteModal";
import { apiCallWithToken, apiServerUrl, checkConnected, getApiLevel } from "../../Api";
import { ImagesAssets } from "../../assets/ImagesAssets";
import { downloadImages, downloadAnnouncementImages } from "../../CommonApi";
import Video from "react-native-video";
import MediaPreviewModal from "../Modals/MediaPreviewModal";
import RBSheet from "react-native-raw-bottom-sheet";
import FastImage from "react-native-fast-image";
import axios from "axios";
import ReactTimeAgo from "react-time-ago";
import MediaPreviewModalForPostsForPosts from "../Modals/MediaPreviewModalForPosts";
import { Pencil, Trash, Reply, AlertTriangle, MoreVertical, Heart, MessageCircle, TrendingUp, SendHorizonal } from 'lucide-react-native';
import Colors from "../../colors/Colors";

const { width, height } = Dimensions.get("screen");

TimeAgo.addDefaultLocale(en);

const DEFAULT_IMAGE_PROFILE = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";
const DEFAULT_IMAGE = "https://raw.githubusercontent.com/Prince26lmp/assets/main/placeholderseabuddy.png";

const HomeHangoutCardPost = React.memo(({ item, index, handOut, setHandOut, getDataFromApi }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(item?.isLiked || false);
  const [likesCount, setLikesCount] = useState(item?.likeUser?.length || 0);
  const [isOnline, setIsOnline] = useState(true);
  const [visible, setVisible] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [yourActivity, setYourActivity] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [myUserId, setMyUserId] = useState(null);
  const [myUserDetails, setMyUserDetails] = useState(null);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showMoreMap, setShowMoreMap] = useState({});
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [parentCommentId, setParentCommentId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [showComment, setShowComment] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [editTo, setEditTo] = useState(null);
  const [commentSheetVisible, setCommentSheetVisible] = useState(false);
  const [sheetContent, setSheetContent] = useState({ type: null, data: [] });
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeletingReply, setIsDeletingReply] = useState(false);
  const [imageLoading, setImageLoading] = useState({});
  const commentSheetRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const textInputRef = useRef(null);

  const isVideo = (uri) => uri?.match(/\.(mp4|mov|avi)$/i);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state?.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbResult = await AsyncStorage.getItem("userDetails");
        const userDetails = JSON.parse(dbResult);
        setMyUserId(userDetails?.id);
        setMyUserDetails(userDetails);
        if (userDetails?.id === item?.userDetails?.id) {
          setYourActivity(true);
        }
      } catch (error) {
        console.error("Error fetching data from AsyncStorage:", error);
      }
    };
    fetchData();
  }, [item?.userDetails?.id]);

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
      caption: item?.caption,
    }));
  }, [isOnline, PostUri, downloadedPostUri, item?.caption, hasMedia]);
  const finalUri = useMemo(() => {
    const profileUri = item?.userDetails?.profileUrl;
    const downloadedUri = item?.downloadedProfileUrl
      ? `file://${item.downloadedProfileUrl}`
      : null;
    return isOnline && profileUri?.trim()
      ? profileUri
      : downloadedUri?.trim()
        ? downloadedUri
        : DEFAULT_IMAGE_PROFILE;
  }, [item?.userDetails?.profileUrl, item?.downloadedProfileUrl, isOnline]);

  // Preload images effect
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

  const handleLikeApi = useCallback(async (likeState) => {
    const previousLiked = isLiked;
    const previousCount = likesCount;
    const previousLikeUser = [...(item?.likeUser || [])];

  // Optimistic update
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

    setHandOut((prev) =>
      prev.map((post) =>
        post.id === item.id
          ? {
            ...post,
            isLiked: likeState,
            likeUser: updatedLikeUser,
            likeUserLength: updatedLikeUser.length,
          }
          : post
      )
    );

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
        // Offline: Save to Realm
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
      // Revert on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      setHandOut((prev) =>
        prev.map((post) =>
          post.id === item.id
            ? {
              ...post,
              isLiked: previousLiked,
              likeUser: previousLikeUser,
              likeUserLength: previousLikeUser.length,
            }
            : post
        )
      );
      console.error("Error toggling like:", error);
      Toast.show({
        type: "error",
        text1: "Error processing like",
        position: "bottom",
      });
    } finally {
      setIsLikeLoading(false);
    }
  }, [isLiked, likesCount, item?.likeUser, item?.id, myUserId, myUserDetails, setHandOut]);

  const handleLikeToggle = useCallback(() => {
    if (isLikeLoading) return;
    handleLikeApi(!isLiked);
  }, [isLikeLoading, isLiked, handleLikeApi]);

  const handleDeleteGroup = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      // Optimistic update: Remove post immediately
      setHandOut(handOut.filter((data) => data.id !== item.id));
      const res = await axios({
        method: "PUT",
        url: `${apiServerUrl}/user/updateHangoutPost`,
        data: { hangouts: [{ hangoutId: item.id, status: "DELETE" }] },
        headers: { authToken: userDetails.authToken },
      });
      if (res?.data?.responseCode === 200) {
        setVisible(false);
        Toast.show({
          type: "success",
          text1: "Post Deleted Successfully",
          position: "bottom",
        });
      } else {
        // Revert optimistic update on failure
        setHandOut((prev) => [...prev, item]);
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      console.log("Error in deleting the post", error.response?.data);
      // Revert optimistic update
      setHandOut((prev) => [...prev, item]);
      Toast.show({
        type: "error",
        text1: "Error deleting post",
        position: "bottom",
      });
    }
  };

  const handleReportGroup = async (reasonString) => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    try {
      // Optimistic update: Remove post immediately
      setHandOut(handOut.filter((data) => data.id !== item.id));
      const res = await axios({
        method: "PUT",
        url: `${apiServerUrl}/user/updateHangoutPost`,
        data: {
          hangouts: [{ hangoutId: item.id, reason: reasonString, status: "REPORTED" }],
        },
        headers: { authToken: userDetails.authToken },
      });
      if (res?.data?.responseCode === 200) {
        setVisible(false);
        getDataFromApi();
        Toast.show({
          type: "success",
          text1: "Post Reported Successfully",
          position: "bottom",
        });
      } else {
        // Revert optimistic update on failure
        setHandOut((prev) => [...prev, item]);
        throw new Error("Failed to report post");
      }
    } catch (error) {
      console.log("Error in reporting the post", error?.response?.data);
      // Revert optimistic update
      setHandOut((prev) => [...prev, item]);
      Toast.show({
        type: "error",
        text1: "Error reporting post",
        position: "bottom",
      });
    }
  };

  const handleReportSubmit = async (reason) => {
    setReportModalVisible(false);
    await handleReportGroup(reason);
  };

  const handleMediaPress = useCallback((uri, index) => {
    setSelectedMedia({ mediaItems: images, initialIndex: index });
    setMediaModalVisible(true);
  }, [images]);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { viewAreaCoveragePercentThreshold: 50 },
      onViewableItemsChanged,
    },
  ]).current;

  const handleTextLayout = useCallback((e, index) => {
    const lineCount = e.nativeEvent.lines.length;
    if (lineCount > 1) {
      setShowMoreMap((prev) => ({ ...prev, [index]: true }));
    }
  }, []);

  const toggleExpand = useCallback((index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  }, [expandedIndex]);

  const handleCardPress = useCallback((user) => {
    navigation.navigate("CrewProfile", { item: user, source: "hangout" });
  }, [navigation]);

  const openLikesSheet = useCallback(() => {
    setSheetContent({ type: 'likes', data: item?.likeUser || [] });
    bottomSheetRef.current?.open();
  }, [item?.likeUser]);

  const openTaggedUsersSheet = useCallback(() => {
    setSheetContent({ type: 'taggedUsers', data: item?.taggedUsers || [] });
    bottomSheetRef.current?.open();
  }, [item?.taggedUsers]);

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close();
    setSheetContent({ type: null, data: [] });
  }, []);

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diff = Math.floor((now - commentDate) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return commentDate.toDateString();
  };

  const ShowCommentList = React.memo(({
    item: commentItem,
    isReply = false,
    myUserId,
    handleCardPress,
    handleEditComment,
    showDeleteConfirmation,
    handleReply,
    closeCommentSheet,
  }) => {
    const isMyComment = commentItem?.commentUser?.id === myUserId;
    const timeDisplay = useMemo(() => getRelativeTime(commentItem?.commentedAt), [commentItem?.commentedAt]);

    const handleUserPress = useCallback(() => {
      if (typeof closeCommentSheet === 'function') {
        closeCommentSheet();
      }
      handleCardPress(commentItem?.commentUser);
    }, [commentItem?.commentUser, handleCardPress, closeCommentSheet]);

    const handleEdit = useCallback(() => {
      handleEditComment(commentItem.comment, commentItem.id, isReply);
    }, [commentItem.comment, commentItem.id, isReply, handleEditComment]);

    const handleDelete = useCallback(() => {
      showDeleteConfirmation(commentItem.id, isReply);
    }, [commentItem.id, isReply, showDeleteConfirmation]);

    const handleReplyPress = useCallback(() => {
      handleReply(
        commentItem.commentId || commentItem.id,
        commentItem.commentUser?.fullName,
        commentItem.commentUser?.id
      );
    }, [commentItem, handleReply]);

    return (
      <View style={[styles.commentContainer, isReply && styles.replyContainer]}>
        <TouchableOpacity onPress={handleUserPress}>
          <View style={{ position: 'relative' }}>
            <Image
              source={require('../../assets/images/AnotherImage/Man.png')}
              style={[isReply ? styles.replyImage : styles.commentImage, { position: 'absolute' }]}
            />
            <FastImage
              source={
                commentItem?.commentUser?.profileUrl
                  ? { uri: commentItem?.commentUser?.profileUrl, priority: FastImage.priority.normal }
                  : null
              }
              style={isReply ? styles.replyImage : styles.commentImage}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        </TouchableOpacity>
        <View style={[styles.commentContent, isReply && styles.replyContent]}>
          <View style={styles.commentHeader}>
            <Text style={styles.userName}>{commentItem?.commentUser?.fullName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.timeText}>{timeDisplay}</Text>
              {commentItem?.isEdited && <Text style={styles.editText}> (Edited)</Text>}
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={styles.commentText}>
              {commentItem?.replyTo && isReply ? (
                <>
                  <Text style={[styles.replyToText, { color: 'green' }]}>
                    @ {commentItem.replyTo}{' '}
                  </Text>
                  {commentItem.comment}
                </>
              ) : (
                commentItem.comment
              )}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5, gap: 10 }}>
            {isMyComment ? (
              <>
                <TouchableOpacity onPress={handleEdit}>
                  <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                    <Pencil size={12} color="#4B5563" strokeWidth={1.7} />
                    <Text style={styles.actionText}>Edit</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete}>
                  <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                    <Trash size={12} color="#4B5563" strokeWidth={1.7} />
                    <Text style={styles.actionText}>Delete</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={handleReplyPress}>
                <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                  <Reply size={12} color="#4B5563" strokeWidth={1.7} />
                  <Text style={styles.replyText}>Reply</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
          {commentItem?.reply?.length > 0 && (
            <View>
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
                  closeCommentSheet={closeCommentSheet}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    );
  });

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

  const openCommentSheet = useCallback(() => {
    if (commentSheetVisible) {
      return;
    }
    try {
      setCommentSheetVisible(true);
      setPageNumber(1);
      setHasMore(true);
      if (commentSheetRef.current) {
        commentSheetRef.current.open();
        setTimeout(() => {
          textInputRef.current?.focus();
        }, 300);
        getComment(1);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Comment sheet not initialized",
          position: "bottom",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to open comment sheet",
        position: "bottom",
      });
    }
  }, [getComment, commentSheetVisible]);

  const closeCommentSheet = useCallback(() => {
    if (!commentSheetVisible) return;
    setCommentSheetVisible(false);
    if (commentSheetRef.current) {
      commentSheetRef.current.close();
    }
    setCommentText("");
    setReplyTo(null);
    setEditTo(null);
    setEditingCommentId(null);
    setIsEditingReply(false);
    setDeleteModalVisible(false);
    setParentCommentId(null);
  }, [commentSheetVisible]);

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
                      profileUrl: user.profileUrl || ImagesAssets.defaultProfile,
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
      await getDataFromApi();
      Toast.show({
        type: "success",
        text1: editingCommentId ? "Comment updated successfully" : replyTo ? "Reply posted successfully" : "Comment posted successfully",
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
  }, [commentText, item.id, replyTo, editingCommentId, isEditingReply, parentCommentId, showComment, getDataFromApi]);

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
          text2: "Something went wrong",
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
          text2: "Something went wrong",
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
      await getDataFromApi();
      Toast.show({
        type: "success",
        text1: "Comment deleted successfully",
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
  }, [commentToDelete, item.id, isDeletingReply, parentCommentId, getDataFromApi]);

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

  const hashtagsDisplay = useMemo(() => (
    <View style={styles.hashtagsContainer}>
      {(item.groupActivityId) && (
        <View style={[styles.tag, { backgroundColor: '#FBCF21' }]}>
          <Text style={[styles.tagText, { color: '#06361F' }]}>
            buddyUp Events
          </Text>
        </View>
      )}
      {item?.hashtags?.slice(0, 2).map((hashtag, index) => (
        <View key={index} style={[styles.tag, { backgroundColor: '#FBCF21' }]}>
          <Text style={[styles.tagText, { color: '#06361F' }]}>
            {hashtag ? hashtag.charAt(0).toUpperCase() + hashtag.slice(1) : ""}
          </Text>
        </View>
      ))}
    </View>
  ), [item.groupActivityId, item?.hashtags]);

  const taggedUsersDisplay = useMemo(() => (
    <TouchableOpacity onPress={openTaggedUsersSheet}>
      <View style={styles.avatarRow}>
        {item?.taggedUsers?.slice(0, 3).map((user, index) => (
          <FastImage
            key={user.id}
            style={[styles.avatar1, { marginLeft: index > 0 ? -15 : 0 }]}
            source={{
              uri: user?.profileUrl || DEFAULT_IMAGE_PROFILE,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ))}
        {item?.taggedUsers?.length > 3 && (
          <View style={styles.additionalUsers}>
            <Text style={styles.additionalUsersText}>
              +{item?.taggedUsers?.length - 3}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), [item?.taggedUsers, openTaggedUsersSheet]);

  const renderMediaItem = useCallback(({ item: imageItem, index }) => (
    <TouchableOpacity onPress={() => handleMediaPress(imageItem.uri, index)}>
      <View style={styles.imageContainer}>
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
              style={styles.imageStyle}
              resizeMode="contain"
              muted
              repeat
              paused={currentIndex !== index}
            />
            <View style={styles.playIconContainer}>
              <Image
                source={ImagesAssets.vedioPlaybutton}
                style={styles.playIcon}
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
              style={styles.imageStyle}
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

  return (
    <View style={styles.ListContainer}>
      {/* Post Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handleCardPress(item?.userDetails)}>
          <FastImage
            style={styles.avatar}
            source={{ uri: finalUri, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={() => handleCardPress(item?.userDetails)}>
            <Text style={styles.username}>
              {item?.userDetails?.fullName
                ? item.userDetails.fullName.charAt(0).toUpperCase() +
                item.userDetails.fullName.slice(1)
                : ""}
            </Text>
          </TouchableOpacity>
          <Text style={styles.timestamp}>{item?.userDetails?.designation}</Text>
          {item?.taggedUsers?.length > 0 && (
            <View style={styles.taggedUsersContainer}>
              {taggedUsersDisplay}
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={() => setVisible(true)}>
          <Menu
            visible={visible}
            onDismiss={() => setVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.baseIconsWrapper}
                onPress={() => setVisible(true)}
              >
                <MoreVertical size={20} color="#4B5563" strokeWidth={1.7} />
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
            {yourActivity ? (
              <View style={styles.menuItems}>
                <Menu.Item
                  style={styles.menuItem}
                  onPress={() => {
                    setVisible(false);
                    navigation.navigate("NewPost", {
                      mediaFiles: item.imageUrls,
                      caption: item.caption,
                      taggedUsers: item.taggedUsers,
                      hashtags: item.hashtags,
                      postId: item.id,
                    });
                  }}
                  title="Edit"
                  titleStyle={styles.menuItemText}
                  leadingIcon={() => (
                    <Pencil size={20} color="#4B5563" strokeWidth={1.7} />
                  )}
                />
                <Menu.Item
                  style={styles.menuItem}
                  onPress={() => setModalVisible(true)}
                  title="Delete"
                  titleStyle={[styles.menuItemText, { color: '#EF4444' }]}
                  leadingIcon={() => (
                    <Trash size={22} color="#EF4444" strokeWidth={1.7} />
                  )}
                />
              </View>
            ) : (
              <Menu.Item
                  style={styles.menuItem}
                onPress={() => setReportModalVisible(true)}
                title="Report"
                  titleStyle={[styles.menuItemText, { color: '#EF4444' }]}
                  leadingIcon={() => (
                    <AlertTriangle size={22} color="#EF4444" strokeWidth={1.7} />
                  )}
              />
            )}
          </Menu>
        </TouchableOpacity>
      </View>

      {/* Post Media */}
      {hasMedia && (
        <View>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderMediaItem}
            viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
            nestedScrollEnabled={true}
          />
        </View>
      )}

      <Loader isLoading={loading} />

      {/* Post Content */}
      <View style={styles.contentContainer}>
        {/* Pagination */}
        {hasMedia && images.length > 1 && (
          <View style={styles.pagination}>
            {images.map((_, idx) => (
              <View
                key={idx}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: currentIndex === idx ? '#8DAF02' : '#9CA3AF',
                  marginHorizontal: 4,
                }}
              />
            ))}
          </View>
        )}
        <View style={styles.contentRow}>
          <Text
            numberOfLines={hasMedia ? (expandedIndex === index ? undefined : 1) : undefined}
            ellipsizeMode={hasMedia ? "tail" : undefined}
            onTextLayout={(e) => handleTextLayout(e, index)}
            style={styles.content}
          >
            {item.caption}
            {hasMedia && expandedIndex === index && showMoreMap[index] && (
              <Text
                onPress={() => toggleExpand(index)}
                style={{ color: '#8DAF02', fontFamily: 'Poppins-SemiBold', fontSize: 15 }}
              >
                {' See less'}
              </Text>
            )}
          </Text>
          {hasMedia && expandedIndex !== index && showMoreMap[index] && (
            <TouchableOpacity onPress={() => toggleExpand(index)}>
              <Text style={{ color: '#8DAF02', fontFamily: 'Poppins-SemiBold', fontSize: 15, marginLeft: 5 }}>
                See more
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {item.createdAt && (
          <Text style={styles.postTimestamp}>
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

      {/* Post Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLikeToggle}
          disabled={isLikeLoading}
        >
          <Heart
            size={24}
            color={isLiked ? '#8DAF02' : '#4B5563'}
            fill={isLiked ? '#8DAF02' : 'none'}
            strokeWidth={1.7}
          />
          {likesCount > 0 && (
            <TouchableOpacity onPress={openLikesSheet}>
              <Text style={styles.buttonText}>{likesCount}</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={openCommentSheet}
        >
          <MessageCircle size={22} color="#4B5563" strokeWidth={1.7} />
          {item?.totalComments > 0 && (
            <Text style={styles.buttonText}>{item.totalComments}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <TrendingUp size={22} color="#4B5563" strokeWidth={1.7} />
          {item?.viewCount > 0 && (
            <Text style={styles.buttonText}>{item.viewCount}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={handleReportSubmit}
      />
      <DeleteModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onDelete={handleDeleteGroup}
      />
      {selectedMedia && (
        <MediaPreviewModalForPostsForPosts
          visible={mediaModalVisible}
          onClose={() => setMediaModalVisible(false)}
          mediaItems={selectedMedia.mediaItems}
          initialIndex={selectedMedia.initialIndex}
          canSend={false}
          uploadImageToCloudinary={() => { }}
        />
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
            backgroundColor: '#ededed',
          },
          draggableIcon: {
            display: "none",
          },
        }}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>
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
                  <View style={styles.userItemContainer}>
                    <View style={{ position: "relative" }}>
                      <Image
                        source={require("../../assets/images/AnotherImage/Man.png")}
                        style={[styles.userImage, { position: "absolute" }]}
                      />
                      <FastImage
                        style={styles.userImage}
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
                      <Text style={styles.userItem}>{user.fullName}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          closeSheet();
                          navigation.navigate("CrewProfile", { item: user, source: "hangout" });
                        }}
                      >
                        <Image style={styles.baseIcons} source={ImagesAssets.eye_icon} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noLikesText}>
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
        onClose={closeCommentSheet}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: '#ededed',
            paddingBottom: 20,
          },
          draggableIcon: {
            backgroundColor: '#9CA3AF',
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
            <View style={styles.commentSheetHeader}>
              <Text style={styles.sheetTitle}>Comments</Text>
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
                  closeCommentSheet={closeCommentSheet}
                />
              )}
              keyExtractor={(item) => item.id}
              onEndReached={handleCommentEndReached}
              onEndReachedThreshold={0.5}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 80 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleCommentRefresh} />}
              ListEmptyComponent={<Text style={styles.emptyText}>No comments yet</Text>}
              initialNumToRender={10}
              windowSize={5}
              nestedScrollEnabled={true}
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
                  <Text style={styles.buttonTextModal}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={handleDeleteComment}
                >
                  <Text style={[styles.buttonTextModal, { color: "#fff" }]}>Delete</Text>
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
                      <Ionicons name="close" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                )}
                {replyTo && !editTo && (
                  <View style={styles.replyHeader}>
                    <Text style={styles.replyToTextInput}>Replying to {replyTo.userName}</Text>
                    <TouchableOpacity onPress={cancelEditOrReply}>
                      <Ionicons name="close" size={20} color="#9CA3AF" />
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
                    placeholderTextColor="#9CA3AF"
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
                   <SendHorizonal
                      size={20}
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

const HomeHangout = () => {
  const navigation = useNavigation();
  const [HandOut, setHandOut] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [Announcement, setAnnouncement] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;

  const getDataFromApi = useCallback(async (pageNumber) => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) {
        console.error("No auth token found");
        return;
      }
      const queryParams = new URLSearchParams({
        userId: userDetails?.id,
        page: pageNumber,
        limit: ITEMS_PER_PAGE,
      }).toString();
      if (await checkConnected()) {
        const response = await apiCallWithToken(
          `${apiServerUrl}/user/getAllHangoutPost?${queryParams}`,
          "GET",
          null,
          authToken
        );
        if (response.responseCode) {
          const newData = response?.result?.hangoutsList || [];
          const imagePaths = await downloadImages(newData);
          RealmService.deleteAllData("hangOutData", "UserDatabase.realm");
          RealmService.addOrUpdateData("hangOutData", imagePaths, "UserDatabase.realm");
          setHandOut((prev) => (pageNumber === 1 ? newData : [...prev, ...newData]));
          setHasMore(newData.length === ITEMS_PER_PAGE);
        }
      } else {
        const ALLDataitem = [];
        const allData = RealmService.getAllData("hangOutData", "UserDatabase.realm");
        allData.forEach((element) => {
          var myData = JSON.parse(element.item);
          ALLDataitem.push(myData);
        });
        setHandOut(ALLDataitem);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAnnouncement = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      if (await checkConnected()) {
        const result = await apiCallWithToken(
          `${apiServerUrl}/content/getAllContents`,
          "GET",
          null,
          userDetails.authToken
        );
        if (result.responseCode === 200) {
          const Announcement = result.result.allContents;
          setAnnouncement(Announcement);
          const processedData = await downloadAnnouncementImages(Announcement);
          RealmService.deleteAllData("AnnouncementGet", "UserDatabase.realm");
          RealmService.addOrUpdateData("AnnouncementGet", processedData, "UserDatabase.realm");
        }
      } else {
        const AllAnnouncementData = [];
        const allData = RealmService.getAllData("AnnouncementGet", "UserDatabase.realm");
        allData.forEach((element) => {
          var myData = JSON.parse(element.item);
          AllAnnouncementData.push(myData);
        });
        setAnnouncement(AllAnnouncementData);
      }
    } catch (error) {
      console.log(`API Error for `, error.response?.data || error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getDataFromApi(1);
      getAnnouncement();
      return () => { };
    }, [getDataFromApi])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    getDataFromApi(1);
    getAnnouncement();
    setRefreshing(false);
  }, [getDataFromApi]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      getDataFromApi(page + 1);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            height: height * 0.8,
          }}
        >
          <Loader isLoading={loading} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#8DAF02" />
          }
        >
          <FlatList
            nestedScrollEnabled={true}
            data={HandOut}
            renderItem={({ item, index }) => (
              <HomeHangoutCardPost
                index={index}
                item={item}
                setHandOut={setHandOut}
                handOut={HandOut}
                getDataFromApi={getDataFromApi}
              />
            )}
            keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListEmptyComponent={
              !loading && (
                <View
                  style={{
                    flex: 1,
                    width: width,
                    height: height * 0.4,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={{ height: 150, width: 150 }}
                    source={require("../../assets/images/AnotherImage/no-content.png")}
                  />
                  <Text
                    style={{
                      fontSize: 20,
                      color: "gray",
                      fontFamily: "Poppins-Regular",
                    }}
                  >
                    No post Found
                  </Text>
                </View>
              )
            }
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            style={{ paddingBottom: "20%" }}
            contentContainerStyle={HandOut.length === 0 && styles.emptyList}
          />
        </ScrollView>
      )}
    </View>
  );
};

export default HomeHangout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  ListContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
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
  commentContainer: {
    flexDirection: "row",
    padding: 10,
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    marginHorizontal: 10,
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
    marginLeft: 8,
  },
  replyContent: {
    marginLeft: 10,
    width: '100%',
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
    color: '#1F2937',
  },
  timeText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
  },
  editText: {
    color: '#9CA3AF',
    fontSize: 10,
    marginLeft: 5,
    fontFamily: 'Poppins-Regular',
  },
  commentText: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
  },
  replyToText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regualar',
  },
  replyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#374151',
  },
  replyListContainer: {
    marginTop: 16,
  },
  inputContainer: {
    padding: 10,
    backgroundColor: '#ededed',
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
    borderColor: '#ddd',
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
    color: '#9CA3AF',
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
  commentSheetHeader: {
    justifyContent: 'center',
  },
  replyContainer: {
    flexDirection: 'row',
    marginTop: 5,
    paddingVertical: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
});