import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  RefreshControl,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Pressable,
  ScrollView,
  Platform,
  useColorScheme,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import TimeAgo from 'javascript-time-ago';
import ReactTimeAgo from 'react-time-ago';
import en from 'javascript-time-ago/locale/en';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pencil, Trash, Reply, AlertTriangle, MoreVertical, SendHorizonal } from 'lucide-react-native';
import { apiCallWithToken, apiServerUrl, checkConnected, formatShipName, getApiLevel } from "../Api";
import LinearGradient from "react-native-linear-gradient";
import { ImagesAssets } from "../assets/ImagesAssets";
import { Eye, Heart, MessageCircle, TrendingUp } from "lucide-react-native";
import Orientation from "react-native-orientation-locker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ActivityIndicator, Menu, Modal } from "react-native-paper";
import Colors from "../colors/Colors";
import SimpleToast from "react-native-simple-toast";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import { downloadAnnouncementImages, downloadImages } from "../CommonApi";
import Loader from "../component/Loader";
import RealmService from "../Realm/Realm";
import axios from "axios";
import ReportModal from "../component/Modals/ReasonModal";
import DeleteModal from "../component/Modals/DeleteModal";
import Video from "react-native-video";
import RBSheet from "react-native-raw-bottom-sheet";
import FastImage from "react-native-fast-image";
import MediaPreviewModalForPosts from "../component/Modals/MediaPreviewModalForPosts";
import ProfleSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";

TimeAgo.addDefaultLocale(en);

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Unified toast function
const showToast = (message, type = 'success') => {
  const duration = type === 'success' ? SimpleToast.LONG : SimpleToast.SHORT;
  const position = SimpleToast.TOP;

  SimpleToast.show(
    message,
    duration,
    position,
    1,
    50,
    type === 'error' ? SimpleToast.BACKGROUND_COLOR : SimpleToast.DEFAULT_BACKGROUND_COLOR
  );
};

const { width, height } = Dimensions.get("screen");
const DEFAULT_IMAGE_PROFILE = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";

// Theme configuration
const getTheme = (colorScheme) => ({
  background: colorScheme === 'dark' ? '#FFFFFF' : '#FFFFFF',
  cardBackground: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF',
  border: colorScheme === 'dark' ? '#333333' : '#E5E7EB',
  shadow: colorScheme === 'dark' ? '#000000' : '#000',
  textPrimary: colorScheme === 'dark' ? '#F9FAFB' : '#1F2937',
  textSecondary: colorScheme === 'dark' ? '#D1D5DB' : '#374151',
  textTertiary: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280',
  avatarBg: colorScheme === 'dark' ? '#333333' : '#D1D5DB',
  menuButtonBg: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
  menuContentBg: colorScheme === 'dark' ? '#1F2937' : '#FFFFFF',
  tagBg: '#FBCF21',
  tagSecondaryBg: colorScheme === 'dark' ? '#4B5563' : Colors.secondary,
  tagText: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
  iconColor: colorScheme === 'dark' ? '#E5E7EB' : '#4B5563',
  additionalUsersBg: colorScheme === 'dark' ? '#333333' : '#D1D5DB',
  contentTextColor: colorScheme === 'dark' ? '#FFFFFF' : '#374151',
  inputBg: colorScheme === 'dark' ? '#2D2D2D' : '#F3F4F6',
  inputBorder: colorScheme === 'dark' ? '#404040' : '#ddd',
  inputText: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
  sheetBg: colorScheme === 'dark' ? '#1A1A1A' : '#ededed',
  commentBg: colorScheme === 'dark' ? '#2D2D2D' : '#f3f3f3',
  likeColor: '#8DAF02',
  deleteColor: '#EF4444',
});

// Memoized helper function
const isVideo = (uri) => uri?.match(/\.(mp4|mov|avi)$/i);

// Memoized component for comment display
const ShowCommentList = React.memo(({
  item: commentItem,
  isReply = false,
  myUserId,
  handleCardPress,
  handleEditComment,
  showDeleteConfirmation,
  handleReply,
  theme,
  closeCommentSheet,
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
      commentItem.commentUser.fullName,
      commentItem.commentUser.id
    );
  }, [commentItem, handleReply]);

  return (
    <View
      style={[
        isReply ? themedStyles(theme).replyContainer : themedStyles(theme).commentContainer,
      ]}
    >
      <TouchableOpacity onPress={handleUserPress}>
        <View style={{ position: 'relative' }}>
          <Image
            source={require('../assets/images/AnotherImage/Man.png')}
            style={[
              isReply ? themedStyles(theme).replyImage : themedStyles(theme).commentImage,
              { position: 'absolute' },
            ]}
          />
          <FastImage
            source={
              commentItem?.commentUser?.profileUrl
                ? { uri: commentItem?.commentUser?.profileUrl, priority: FastImage.priority.normal }
                : null
            }
            style={isReply ? themedStyles(theme).replyImage : themedStyles(theme).commentImage}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      </TouchableOpacity>
      <View
        style={[
          isReply ? themedStyles(theme).replyContent : themedStyles(theme).commentContent,
        ]}
      >
        <View style={themedStyles(theme).commentHeader}>
          <Text style={themedStyles(theme).userName}>{commentItem?.commentUser?.fullName}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={themedStyles(theme).timeText}>{timeDisplay}</Text>
            {commentItem.isEdited && <Text style={themedStyles(theme).editText}> (Edited)</Text>}
          </View>
        </View>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={themedStyles(theme).commentText}>
            {commentItem.replyTo && isReply ? (
              <>
                <Text style={[themedStyles(theme).replyToText, { color: 'green' }]}>
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
                  <Pencil
                    size={12}
                    color={theme.iconColor}
                    strokeWidth={1.7}
                  />
                  <Text style={themedStyles(theme).actionText}>Edit</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                  <Trash
                    size={12}
                    color={theme.iconColor}
                    strokeWidth={1.7}
                  />
                  <Text style={themedStyles(theme).actionText}>Delete</Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={handleReplyPress}>
              <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                <Reply
                  size={12}
                  color={theme.iconColor}
                  strokeWidth={1.7}
                />
                <Text style={themedStyles(theme).replyText}>Reply</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        {commentItem.reply?.length > 0 && (
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
                theme={theme}
                closeCommentSheet={closeCommentSheet}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
});


const PostHeader = React.memo(({
  theme,
  item,
  finalUri,
  handleCardPress,
  yourActivity,
  visible1,
  openMenu,
  closeMenu,
  navigation,
  setModalVisible,
  setReportModalVisible,
  taggedUsersDisplay,
}) => (
  <View style={themedStyles(theme).header}>
    <TouchableOpacity onPress={() => handleCardPress(item?.userDetails)}>
      <FastImage
        style={themedStyles(theme).avatar}
        source={{ uri: finalUri, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }}
        resizeMode={FastImage.resizeMode.cover}
      />
    </TouchableOpacity>
    <View style={themedStyles(theme).userInfo}>
      <TouchableOpacity onPress={() => handleCardPress(item?.userDetails)}>
        <Text style={themedStyles(theme).username}>
          {item?.userDetails?.fullName
            ? item.userDetails.fullName.charAt(0).toUpperCase() +
            item.userDetails.fullName.slice(1)
            : ""}
        </Text>
      </TouchableOpacity>
      <Text style={themedStyles(theme).timestamp}>{item?.userDetails?.designation}</Text>
      {item?.taggedUsers?.length > 0 && (
        <View style={themedStyles(theme).taggedUsersContainer}>
          {taggedUsersDisplay}
        </View>
      )}
    </View>
    <TouchableOpacity style={themedStyles(theme).menuButton} onPress={openMenu}>
      <Menu
        visible={visible1}
        onDismiss={closeMenu}
        anchor={
          <TouchableOpacity
            style={themedStyles(theme).baseIconsWrapper}
            onPress={openMenu}
          >
            <MoreVertical
              size={20}
              color={theme.iconColor}
              strokeWidth={1.7}
            />
          </TouchableOpacity>
        }
        contentStyle={themedStyles(theme).menuContent}
        {...(Platform.OS === 'android' ? {
          anchorPosition: 'bottom',
          style: visible1 ? { paddingTop: 15 } : {}
        } : {})}
      >
        {yourActivity ? (
          <View style={themedStyles(theme).menuItems}>
            <Menu.Item
              style={themedStyles(theme).menuItem}
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
              titleStyle={themedStyles(theme).menuItemText}
              leadingIcon={() => (
                <Pencil
                  size={20}
                  color={theme.iconColor}
                  strokeWidth={1.7}
                />
              )}
            />
            <Menu.Item
              style={themedStyles(theme).menuItem}
              onPress={() => setModalVisible(true)}
              title="Delete"
              titleStyle={[themedStyles(theme).menuItemText, { color: theme.deleteColor }]}
              leadingIcon={() => (
                <Trash
                  size={22}
                  color={theme.deleteColor}
                  strokeWidth={1.7}
                />
              )}
            />
          </View>
        ) : (
          <Menu.Item
            style={themedStyles(theme).menuItem}
            onPress={() => setReportModalVisible(true)}
            title="Report"
            titleStyle={[themedStyles(theme).menuItemText, { color: theme.deleteColor }]}
            leadingIcon={() => (
              <AlertTriangle
                size={22}
                color={theme.deleteColor}
                strokeWidth={1.7}
              />
            )}
          />
        )}
      </Menu>
    </TouchableOpacity>
  </View>
));


const PostMedia = React.memo(({
  theme,
  images,
  hasMedia,
  currentIndex,
  handleMediaPress,
  imageLoading,
  setImageLoading,
  viewabilityConfigCallbackPairs,
}) => {
  if (!hasMedia) return null;

  const renderItem = useCallback(({ item: imageItem, index }) => (
    <TouchableOpacity onPress={() => handleMediaPress(imageItem.uri, index)}>
      <View style={themedStyles(theme).imageContainer}>
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
              style={themedStyles(theme).imageStyle}
              resizeMode="contain"
              muted
              repeat
              cache
              paused={currentIndex !== index} // Pause if not visible
            />
            <View style={themedStyles(theme).playIconContainer}>
              <Image
                source={ImagesAssets.vedioPlaybutton}
                style={themedStyles(theme).playIcon}
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
              style={themedStyles(theme).imageStyle}
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
  ), [theme, handleMediaPress, imageLoading, setImageLoading, currentIndex]);

  return (
    <View>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        nestedScrollEnabled={true} // Added for better scrolling
      />
    </View>
  );
});

const PostContent = React.memo(({
  theme,
  item,
  expandedIndex,
  index,
  toggleExpand,
  showMoreMap,
  handleTextLayout,
  hashtagsDisplay,
  images,
  hasMedia,
  currentIndex,
}) => (
  <View style={themedStyles(theme).contentContainer}>
    {/* Pagination moved here */}
    {hasMedia && images.length > 1 && (
      <View style={themedStyles(theme).pagination}>
        {images.map((_, idx) => (
          <View
            key={idx}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: currentIndex === idx ? theme.likeColor : theme.textTertiary,
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>
    )}
    <View style={themedStyles(theme).contentRow}>
      <Text
        numberOfLines={hasMedia ? (expandedIndex === index ? undefined : 1) : undefined}
        ellipsizeMode={hasMedia ? "tail" : undefined}
        onTextLayout={(e) => handleTextLayout(e, index)}
        style={themedStyles(theme).content}
      >
        {item.caption}
        {hasMedia && expandedIndex === index && showMoreMap[index] && (
          <Text
            onPress={() => toggleExpand(index)}
            style={{ color: theme.likeColor, fontFamily: 'Poppins-SemiBold', fontSize: 15 }}
          >
            {' See less'}
          </Text>
        )}
      </Text>
      {hasMedia && expandedIndex !== index && showMoreMap[index] && (
        <TouchableOpacity onPress={() => toggleExpand(index)}>
          <Text style={{ color: theme.likeColor, fontFamily: 'Poppins-SemiBold', fontSize: 15, marginLeft: 5 }}>
            See more
          </Text>
        </TouchableOpacity>
      )}
    </View>
    {item.createdAt && (
      <Text style={themedStyles(theme).postTimestamp}>
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
));

const PostFooter = React.memo(({
  theme,
  item,
  isLiked,
  likesCount,
  handleLikeToggle,
  isLikeLoading,
  openLikesSheet,
  openCommentSheet,
}) => {
  return (
    <View style={themedStyles(theme).footer}>
      <TouchableOpacity
        style={themedStyles(theme).button}
        onPress={handleLikeToggle}
        disabled={isLikeLoading}
      >
        <Heart
          size={24}
          color={isLiked ? theme.likeColor : theme.iconColor}
          fill={isLiked ? theme.likeColor : 'none'}
          strokeWidth={1.7}
        />
        {likesCount > 0 && (
          <TouchableOpacity onPress={openLikesSheet}>
            <Text style={themedStyles(theme).buttonText}>{likesCount}</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={themedStyles(theme).button}
        onPress={() => {
          openCommentSheet(item);
        }}
      >
        <MessageCircle size={22} color={theme.iconColor} strokeWidth={1.7} />
        {item?.totalComments > 0 && (
          <Text style={themedStyles(theme).buttonText}>{item.totalComments}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={themedStyles(theme).button}>
        <TrendingUp size={22} color={theme.iconColor} strokeWidth={1.7} />
        {item?.viewCount > 0 && (
          <Text style={themedStyles(theme).buttonText}>{item.viewCount}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
});


const HomeHangoutCardPost = React.memo(({ item, index, setHandOut, updatePost }) => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);

  const [showComment, setShowComment] = useState([]);
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
        : DEFAULT_IMAGE_PROFILE;
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

  // Preload images effect - limited to first 3 images to reduce load
  useEffect(() => {
    if (hasMedia) {
      const preloadImages = async () => {
        const imagePromises = images
          .filter((item) => item.type === "image")
          .slice(0, 3) // Preload only first 3
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

  // Memoized handlers
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
        showToast("Something went wrong, please try again", 'error');
      }
    } catch (error) {
      console.error("Error opening bottom sheet:", error);
      showToast("Something went wrong, please try again", 'error');
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
      showToast("Something went wrong, please try again", 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loading, hasMore, item.id]);

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
        showToast("Something went wrong, please try again", 'error');
      }
    } catch (error) {
      showToast("Something went wrong, please try again", 'error');
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

      if (updatePost && !replyTo && !editingCommentId) {
        const newCommentCount = (item.comments?.length || 0) + 1;
        updatePost(item.id, { comments: { ...item.comments, length: newCommentCount } });
      }

      showToast(
        editingCommentId ? "Comment updated successfully" : replyTo ? "Reply posted successfully" : "Comment posted successfully",
        'success'
      );
    } catch (error) {
      console.error("Error posting/editing/replying comment:", error);
      setShowComment(previousComments);
      showToast("Something went wrong, please try again", 'error');
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
        showToast("Something went wrong, please try again", 'error');
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
        showToast("Something went wrong, please try again", 'error');
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

      showToast("Comment deleted successfully", 'success');
    } catch (error) {
      console.error("Error deleting comment:", error);
      showToast("Something went wrong, please try again", 'error');
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

    if (updatePost) {
      updatePost(item.id, {
        isLiked: likeState,
        likeUser: updatedLikeUser,
        likeUserLength: updatedLikeUser.length,
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
      if (updatePost) {
        updatePost(item.id, {
          isLiked: previousLiked,
          likeUser: previousLikeUser,
          likeUserLength: previousLikeUser.length,
        });
      }
      console.error("Error toggling like:", error);
      showToast("Something went wrong, please try again", 'error');
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

      // Optimistic update: Remove post immediately
      setHandOut((prev) => prev.filter((post) => post.id !== item.id));

      const res = await axios({
        method: "PUT",
        url: `${apiServerUrl}/user/updateHangoutPost`,
        data: { hangouts: [{ hangoutId: item.id, status: "DELETE" }] },
        headers: { authToken: userDetails.authToken },
      });

      if (res?.data?.responseCode === 200) {
        setVisible1(false);
        showToast("Post deleted successfully", 'success');
      } else {
        // Revert optimistic update on failure
        setHandOut((prev) => [...prev, item]);
        throw new Error("Failed to delete post");
      }
    } catch (error) {
      console.log("Error in deleting group activity", error.response?.data);
      // Revert optimistic update
      setHandOut((prev) => [...prev, item]);
      showToast("Something went wrong, please try again", 'error');
    } finally {
      setOperationLoading(false);
    }
  }, [item, setHandOut]);

  const handleReportGroup = useCallback(async (reasonString) => {
    setOperationLoading(true);
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);

      // Optimistic update: Remove post immediately
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
        showToast("Post reported successfully", 'success');
      } else {
        // Revert optimistic update on failure
        setHandOut((prev) => [...prev, item]);
        throw new Error("Failed to report post");
      }
    } catch (error) {
      console.log("Error in reporting group activity", error?.response?.data);
      // Revert optimistic update
      setHandOut((prev) => [...prev, item]);
      showToast("Something went wrong, please try again", 'error');
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

  // Memoized hashtags display
  const hashtagsDisplay = useMemo(() => (
    <View style={themedStyles(theme).hashtagsContainer}>
      {(item.groupActivityId) && (
        <View style={[themedStyles(theme).tag, { backgroundColor: theme.tagBg }]}>
          <Text style={[themedStyles(theme).tagText, { color: '#06361F' }]}>
            buddyUp Events
          </Text>
        </View>
      )}
      {(formatShipName(item?.userDetails?.ship?.shipName || item?.userDetails?.associatedShip?.shipName)) && (
        <View style={[themedStyles(theme).tag, { backgroundColor: theme.tagSecondaryBg }]}>
          <Text style={[themedStyles(theme).tagText, { color: theme.tagText }]}>
            {formatShipName(item?.userDetails?.ship?.shipName || item?.userDetails?.associatedShip?.shipName || '')}
          </Text>
        </View>
      )}
      {item.hashtags.slice(0, 2).map((hashtag, index) => (
        <View key={index} style={[themedStyles(theme).tag, { backgroundColor: theme.tagBg }]}>
          <Text style={[themedStyles(theme).tagText, { color: '#06361F' }]}>
            {hashtag ? hashtag.charAt(0).toUpperCase() + hashtag.slice(1) : ""}
          </Text>
        </View>
      ))}
    </View>
  ), [item.groupActivityId, item?.userDetails?.ship, item?.userDetails?.associatedShip, item.hashtags, theme]);

  const taggedUsersDisplay = useMemo(() => (
    <TouchableOpacity onPress={openTaggedUsersSheet}>
      <View style={themedStyles(theme).avatarRow}>
        {item?.taggedUsers.slice(0, 3).map((user, index) => (
          <FastImage
            key={user.id}
            style={[themedStyles(theme).avatar1, { marginLeft: index > 0 ? -15 : 0 }]}
            source={{
              uri: user?.profileUrl || DEFAULT_IMAGE_PROFILE,
              priority: FastImage.priority.normal,
              cache: FastImage.cacheControl.immutable,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        ))}
        {item?.taggedUsers?.length > 3 && (
          <View style={themedStyles(theme).additionalUsers}>
            <Text style={themedStyles(theme).additionalUsersText}>
              +{item?.taggedUsers?.length - 3}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  ), [item?.taggedUsers, openTaggedUsersSheet, theme]);

  return (
    <View style={themedStyles(theme).ListContainer}>
      {operationLoading && (
        <View style={themedStyles(theme).operationLoadingOverlay}>
          <ActivityIndicator size="small" color={Colors.secondary} />
        </View>
      )}

      <PostHeader
        theme={theme}
        item={item}
        finalUri={finalUri}
        handleCardPress={handleCardPress}
        yourActivity={yourActivity}
        visible1={visible1}
        openMenu={openMenu}
        closeMenu={closeMenu}
        navigation={navigation}
        setModalVisible={setModalVisible}
        setReportModalVisible={setReportModalVisible}
        taggedUsersDisplay={taggedUsersDisplay}
      />

      <PostMedia
        theme={theme}
        images={images}
        hasMedia={hasMedia}
        currentIndex={currentIndex}
        handleMediaPress={handleMediaPress}
        imageLoading={imageLoading}
        setImageLoading={setImageLoading}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
      />

      <Loader isLoading={loading} />

      <PostContent
        theme={theme}
        item={item}
        expandedIndex={expandedIndex}
        index={index}
        toggleExpand={toggleExpand}
        showMoreMap={showMoreMap}
        handleTextLayout={handleTextLayout}
        hashtagsDisplay={hashtagsDisplay}
        images={images}
        hasMedia={hasMedia}
        currentIndex={currentIndex}
      />

      <PostFooter
        theme={theme}
        item={item}
        isLiked={isLiked}
        likesCount={likesCount}
        handleLikeToggle={handleLikeToggle}
        isLikeLoading={isLikeLoading}
        openLikesSheet={openLikesSheet}
        openCommentSheet={openCommentSheet}
      />

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

      <RBSheet
        ref={bottomSheetRef}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={height * 0.5}
        customStyles={{
          container: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: theme.sheetBg,
          },
          draggableIcon: {
            display: "none",
          },
        }}
      >
        <View style={themedStyles(theme).sheetContent}>
          <Text style={themedStyles(theme).sheetTitle}>
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
                  <View style={themedStyles(theme).userItemContainer}>
                    <View style={{ position: "relative" }}>
                      <Image
                        source={require("../assets/images/AnotherImage/Man.png")}
                        style={[themedStyles(theme).userImage, { position: "absolute" }]}
                      />
                      <FastImage
                        style={themedStyles(theme).userImage}
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
                      <Text style={themedStyles(theme).userItem}>{user.fullName}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          closeSheet();
                          navigation.navigate("CrewProfile", { item: user, source: "hangout" });
                        }}
                      >
                        <Image style={themedStyles(theme).baseIcons} source={ImagesAssets.eye_icon} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={themedStyles(theme).noLikesText}>
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
            backgroundColor: theme.sheetBg,
            paddingBottom: 20,
          },
          draggableIcon: {
            backgroundColor: theme.textTertiary,
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
            <View style={themedStyles(theme).commentSheetHeader}>
              <Text style={themedStyles(theme).sheetTitle}>Comments</Text>
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
                  theme={theme}
                  closeCommentSheet={closeCommentSheet}
                />
              )}
              keyExtractor={(item) => item.id}
              onEndReached={handleCommentEndReached}
              onEndReachedThreshold={0.5}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 80 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleCommentRefresh} />}
              ListEmptyComponent={<Text style={themedStyles(theme).emptyText}>No comments yet</Text>}
              initialNumToRender={10}
              windowSize={5}
              nestedScrollEnabled={true}
            />
            <Modal
              visible={isDeleteModalVisible}
              onDismiss={() => setDeleteModalVisible(false)}
              contentContainerStyle={themedStyles(theme).modalContent}
            >
              <Text style={themedStyles(theme).modalTitle}>Delete Comment</Text>
              <Text style={themedStyles(theme).modalText}>
                Are you sure you want to delete this comment?
              </Text>
              <View style={themedStyles(theme).modalButtons}>
                <TouchableOpacity
                  style={[themedStyles(theme).modalButton, themedStyles(theme).cancelButton]}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={themedStyles(theme).buttonTextModal}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[themedStyles(theme).modalButton, themedStyles(theme).deleteButton]}
                  onPress={handleDeleteComment}
                >
                  <Text style={[themedStyles(theme).buttonTextModal, { color: "#fff" }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Modal>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={themedStyles(theme).inputContainer}>
                {editTo && (
                  <View style={themedStyles(theme).editHeader}>
                    <Text style={themedStyles(theme).editToText}>
                      Editing {editTo.comment.length > 20 ? `${editTo.comment.slice(0, 20)}...` : editTo.comment}
                    </Text>
                    <TouchableOpacity onPress={cancelEditOrReply}>
                      <Ionicons name="close" size={20} color={theme.textTertiary} />
                    </TouchableOpacity>
                  </View>
                )}
                {replyTo && !editTo && (
                  <View style={themedStyles(theme).replyHeader}>
                    <Text style={themedStyles(theme).replyToTextInput}>Replying to {replyTo.userName}</Text>
                    <TouchableOpacity onPress={cancelEditOrReply}>
                      <Ionicons name="close" size={20} color={theme.textTertiary} />
                    </TouchableOpacity>
                  </View>
                )}
                <View style={themedStyles(theme).inputWrapper}>
                  <TextInput
                    ref={textInputRef}
                    placeholder={
                      editTo
                        ? `Editing ${editTo.comment.length > 20 ? `${editTo.comment.slice(0, 20)}...` : editTo.comment}`
                        : replyTo
                          ? "Write a reply..."
                          : "Write your comment"
                    }
                    placeholderTextColor={theme.textTertiary}
                    style={themedStyles(theme).textInput}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    editable={!postingComment}
                  />
                  <TouchableOpacity
                    style={themedStyles(theme).sendButton}
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

// Themed styles function
const themedStyles = (theme) => StyleSheet.create({
  ListContainer: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.border,
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
    backgroundColor: theme.avatarBg,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    fontFamily: 'Poppins-SemiBold',
  },
  timestamp: {
    fontSize: 12,
    color: theme.textTertiary,
    fontFamily: 'Poppins-Regular',
  },
  imageContainer: {
    overflow: "hidden",
    borderRadius: 8,
    width: width - 66,
    height: 250,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
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
    maxWidth: '100%',
  },
  content: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
    color: theme.contentTextColor,
    flex: 1,
    lineHeight: 22,
  },
  postTimestamp: {
    fontSize: 11,
    color: theme.textTertiary,
    marginBottom: 5,
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
    borderTopColor: theme.border,
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
    color: theme.iconColor,
    marginLeft: 4,
    marginTop: Platform.OS === 'android' ? 3 : 0,
    fontFamily: 'Poppins-Regular',
  },
  menuButton: {
    backgroundColor: theme.menuButtonBg,
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
    backgroundColor: theme.menuContentBg,
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
    color: theme.textPrimary,
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
    borderColor: theme.border,
  },
  additionalUsers: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.additionalUsersBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -15,
  },
  additionalUsersText: {
    fontSize: 12,
    color: theme.textSecondary,
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
    backgroundColor: theme.commentBg,
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
    width: '85%',
    marginRight: 40,
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
    color: theme.textPrimary,
  },
  timeText: {
    color: theme.textTertiary,
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
  },
  editText: {
    color: theme.textTertiary,
    fontSize: 10,
    marginLeft: 5,
    fontFamily: 'Poppins-Regular',
  },
  commentText: {
    fontSize: 12,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
    color: theme.textSecondary,
  },
  replyToText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regualar',
  },
  replyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: theme.textSecondary,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: theme.textSecondary,
  },
  replyListContainer: {
    marginTop: 16,
  },
  inputContainer: {
    padding: 10,
    backgroundColor: theme.sheetBg,
    borderTopWidth: 1,
    borderColor: theme.border,
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
    color: theme.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  editToText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 15,
    maxHeight: 100,
    backgroundColor: theme.inputBg,
    color: theme.inputText,
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
    color: theme.textTertiary,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  modalContent: {
    backgroundColor: theme.cardBackground,
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
    color: theme.textPrimary,
    fontFamily: 'Poppins-SemiBold',
  },
  modalText: {
    fontSize: 16,
    color: theme.textSecondary,
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
    backgroundColor: theme.border,
  },
  deleteButton: {
    backgroundColor: theme.deleteColor,
  },
  buttonTextModal: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.textPrimary,
    fontFamily: 'Poppins-SemiBold',
  },
  sheetContent: {
    paddingVertical: 20,
    zIndex: 1001,
  },
  sheetTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: theme.textPrimary,
    textAlign: "center",
  },
  userItemContainer: {
    borderColor: theme.border,
    backgroundColor: theme.commentBg,
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
    color: theme.textPrimary,
  },
  userImage: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 20,
  },
  noLikesText: {
    fontSize: 16,
    color: theme.textPrimary,
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
  operationLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

const HomeHangout = ({ singlePostData, route }) => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);

  const [HandOut, setHandOut] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const updatePost = useCallback((postId, updates) => {
    setHandOut((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, ...updates } : post
      )
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchPostData = async () => {
        setLoading(true);
        try {
          // Handle postData from navigation params
          if (route.params?.params?.postData) {
            setHandOut([route.params.params.postData]);
            return;
          }

          // Handle postId from deep link or notification
          const postId = route.params?.postId || route.params?.params?.postId;
          if (postId) {
            const authToken = await AsyncStorage.getItem("authToken");
            if (!authToken) {
              SimpleToast.show("No auth token found, please log in", SimpleToast.LONG);
              navigation.navigate("Login"); // Redirect to login if no token
              return;
            }

            // Check network connectivity
            const netInfo = await NetInfo.fetch();
            if (!netInfo.isConnected) {
              SimpleToast.show("No internet connection", SimpleToast.LONG);
              setHandOut([]);
              return;
            }

            // Attempt API call with retry logic
            let attempts = 0;
            const maxAttempts = 3;
            let response;
            while (attempts < maxAttempts) {
              try {
                response = await apiCallWithToken(
                  `${apiServerUrl}/user/getAllHangoutPost?page=1&limit=1&postId=${postId}`,
                  "GET",
                  null,
                  authToken
                );
                break;
              } catch (error) {
                attempts++;
                if (attempts === maxAttempts) throw error;
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retry
              }
            }

            const hangouts = response?.result?.hangoutsList || [];
            if (hangouts.length > 0 && hangouts[0]?.id === postId) {
              setHandOut([hangouts[0]]);
            } else {
              SimpleToast.show("Post not found", SimpleToast.LONG);
              setHandOut([]);
            }
          } else {
            SimpleToast.show("No post data provided", SimpleToast.LONG);
            setHandOut([]);
          }
        } catch (error) {
          console.error("Error fetching post data:", error);
          SimpleToast.show("Failed to load post, please try again", SimpleToast.LONG);
          setHandOut([]);
        } finally {
          setLoading(false);
        }
      };

      fetchPostData();
    }, [route.params, navigation])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshing(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      // Implement load more if needed
    }
  }, [loading, hasMore]);

  const ViewProfileDetails = useCallback(async () => {
    try {
      const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
      const response = await axios.get(`${apiServerUrl}/user/viewUserProfile`, {
        headers: { authToken: userDetails.authToken },
        params: { userId: userDetails.id },
      });
      if (response.data.responseCode === 200) {
        const updatedDetails = {
          ...userDetails,
          companyLogo: response.data.result?.companyLogo,
          companyName: response.data.result?.companyName,
          companyDescription: response.data.result?.companyDescription,
        };
        await AsyncStorage.setItem("userDetails", JSON.stringify(updatedDetails));
      }
    } catch (error) { }
  }, []);

  useEffect(() => {
    ViewProfileDetails();
  }, [ViewProfileDetails]);

  const mainStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    contentContainer: {
      paddingTop: 10,
      paddingBottom: 80,
    },
    emptyList: {
      flexGrow: 1,
      justifyContent: "center",
    },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={mainStyles.container}>
          <ProfleSettingHeader navigation={navigation} title="Post" />
          <FlatList
            data={HandOut}
            keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
            renderItem={({ item, index }) => (
              <HomeHangoutCardPost
                index={index}
                item={item}
                setHandOut={setHandOut}
                updatePost={updatePost}
              />
            )}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#8DAF02" />
            }
            ListEmptyComponent={
              !loading && (
                <View
                  style={{
                    flex: 1,
                    width,
                    height: height * 0.4,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={{ height: 150, width: 150 }}
                    source={require("../assets/images/AnotherImage/no-content.png")}
                  />
                  <Text
                    style={{
                      fontSize: 20,
                      color: theme.textTertiary,
                      fontFamily: "Poppins-Regular",
                    }}
                  >
                    No post Found
                  </Text>
                </View>
              )
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              mainStyles.contentContainer,
              HandOut.length === 0 && !loading && mainStyles.emptyList,
            ]}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            nestedScrollEnabled={true}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default HomeHangout;