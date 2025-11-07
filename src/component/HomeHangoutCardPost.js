// components/HomeHangoutCardPost.js
import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    Platform,
    useColorScheme,
    ScrollView,
} from "react-native";
import TimeAgo from 'javascript-time-ago';
import ReactTimeAgo from 'react-time-ago';
import en from 'javascript-time-ago/locale/en';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl, checkConnected, formatShipName } from "../Api";
import { Pencil, Trash, Reply, AlertTriangle, MoreVertical, SendHorizonal } from 'lucide-react-native';
import { ImagesAssets } from "../assets/ImagesAssets";
import { Heart, MessageCircle, TrendingUp } from "lucide-react-native";
import Orientation from "react-native-orientation-locker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ActivityIndicator, Menu, Modal } from "react-native-paper";
import Colors from "../colors/Colors";
import SimpleToast from "react-native-simple-toast";
import { useNavigation } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import { downloadImages } from "../CommonApi";
import Loader from "../component/Loader";
import axios from "axios";
import ReportModal from "../component/Modals/ReasonModal";
import DeleteModal from "../component/Modals/DeleteModal";
import Video from "react-native-video";
import RBSheet from "react-native-raw-bottom-sheet";
import FastImage from "react-native-fast-image";
import MediaPreviewModalForPosts from "../component/Modals/MediaPreviewModalForPosts";``

TimeAgo.addDefaultLocale(en);

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
    menuContentBg: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF',
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

// Unified toast function
const showToast = (message, type = 'success') => {
    const duration = type === 'success' ? SimpleToast.LONG : SimpleToast.SHORT;
    SimpleToast.show(message, duration, SimpleToast.TOP);
};

// Memoized helper function
const isVideo = (uri) => uri?.match(/\.(mp4|mov|avi)$/i);

// Memoized sub-components (unchanged from original)
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
        <View style={[isReply ? themedStyles(theme).replyContainer : themedStyles(theme).commentContainer]}>
            <TouchableOpacity onPress={handleUserPress}>
                <View style={{ position: 'relative' }}>
                    <Image
                        source={require('../assets/images/AnotherImage/Man.png')}
                        style={[isReply ? themedStyles(theme).replyImage : themedStyles(theme).commentImage, { position: 'absolute' }]}
                    />
                    <FastImage
                        source={commentItem?.commentUser?.profileUrl ? { uri: commentItem?.commentUser?.profileUrl, priority: FastImage.priority.normal } : null}
                        style={isReply ? themedStyles(theme).replyImage : themedStyles(theme).commentImage}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                </View>
            </TouchableOpacity>
            <View style={[isReply ? themedStyles(theme).replyContent : themedStyles(theme).commentContent]}>
                <View style={themedStyles(theme).commentHeader}>
                    <Text style={themedStyles(theme).userName}>{commentItem?.commentUser?.fullName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {commentItem.isEdited && <Text style={themedStyles(theme).editText}> (Edited)</Text>}
                    </View>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                    {commentItem.replyTo && isReply ? (
                        <>
                            <TouchableOpacity onPress={() => { if (typeof closeCommentSheet === 'function') closeCommentSheet(); handleCardPress(commentItem?.replyUser); }}>
                                <Text style={[themedStyles(theme).replyToText, { color: 'green' }]}>@{commentItem.replyTo} </Text>
                            </TouchableOpacity>
                            <Text style={themedStyles(theme).commentText}>{commentItem.comment}</Text>
                        </>
                    ) : (
                        <Text style={themedStyles(theme).commentText}>{commentItem.comment}</Text>
                    )}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5, gap: 10 }}>
                    {isMyComment ? (
                        <>
                            <TouchableOpacity onPress={handleEdit}>
                                <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                    <Pencil size={12} color={theme.iconColor} strokeWidth={1.7} />
                                    <Text style={themedStyles(theme).actionText}>Edit</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDelete}>
                                <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                    <Trash size={12} color={theme.iconColor} strokeWidth={1.7} />
                                    <Text style={themedStyles(theme).actionText}>Delete</Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity onPress={handleReplyPress}>
                            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                <Reply size={12} color={theme.iconColor} strokeWidth={1.7} />
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
                    {item?.userDetails?.fullName ? item.userDetails.fullName.charAt(0).toUpperCase() + item.userDetails.fullName.slice(1) : ""}
                </Text>
            </TouchableOpacity>
            <Text style={themedStyles(theme).timestamp}>{item?.userDetails?.designation}</Text>
            {item?.taggedUsers?.length > 0 && (
                <View style={themedStyles(theme).taggedUsersContainer}>{taggedUsersDisplay}</View>
            )}
        </View>
        <TouchableOpacity style={themedStyles(theme).menuButton} onPress={openMenu}>
            <Menu
                visible={visible1}
                onDismiss={closeMenu}
                anchor={
                    <TouchableOpacity style={themedStyles(theme).baseIconsWrapper} onPress={openMenu}>
                        <MoreVertical size={20} color={theme.background === '#FFFFFF' ? '#FFFFFF' : theme.iconColor} strokeWidth={1.7} />
                    </TouchableOpacity>
                }
                contentStyle={themedStyles(theme).menuContent}
                {...(Platform.OS === 'android' ? { anchorPosition: 'bottom', style: visible1 ? { paddingTop: 15 } : {} } : {})}
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
                            leadingIcon={() => <Pencil size={20} color={theme.iconColor} strokeWidth={1.7} />}
                        />
                        <Menu.Item
                            style={themedStyles(theme).menuItem}
                            onPress={() => setModalVisible(true)}
                            title="Delete"
                            titleStyle={[themedStyles(theme).menuItemText, { color: theme.deleteColor }]}
                            leadingIcon={() => <Trash size={22} color={theme.deleteColor} strokeWidth={1.7} />}
                        />
                    </View>
                ) : (
                    <Menu.Item
                        style={themedStyles(theme).menuItem}
                        onPress={() => setReportModalVisible(true)}
                        title="Report"
                        titleStyle={[themedStyles(theme).menuItemText, { color: theme.deleteColor }]}
                        leadingIcon={() => <AlertTriangle size={22} color={theme.deleteColor} strokeWidth={1.7} />}
                    />
                )}
            </Menu>
        </TouchableOpacity>
    </View>
));

const PostMedia = React.memo(({
    item,
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

    const imageResizeMode = item?.imageresizeMode || 'contain';
    const videoResizeMode = item?.videoresizeMode || 'contain';

    const renderItem = useCallback(({ item: imageItem, index }) => (
        <TouchableOpacity onPress={() => handleMediaPress(imageItem.uri, index)}>
            <View style={themedStyles(theme).imageContainer}>
                {isVideo(imageItem.uri) ? (
                    <>
                        <Video
                            source={{ uri: imageItem.uri }}
                            style={themedStyles(theme).imageStyle}
                            resizeMode={videoResizeMode === 'contain' ? 'contain' : 'cover'}
                            muted
                            repeat
                            paused={currentIndex !== index}
                            playInBackground={false}
                            playWhenInactive={false}
                            ignoreSilentSwitch="obey"
                            onLoadStart={() => console.log('Video loading started')}
                            onLoad={() => console.log('Video loaded')}
                            onError={(e) => console.warn('Video error', e)}
                            onReadyForDisplay={() => console.log('Video ready')}
                            controls={false}
                            poster={imageItem.thumbnailUri || undefined}
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
                            source={{ uri: imageItem.uri, priority: FastImage.priority.high, cache: FastImage.cacheControl.immutable }}
                            resizeMode={imageResizeMode === 'contain' ? FastImage.resizeMode.contain : FastImage.resizeMode.cover}
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
    ), [theme, handleMediaPress, imageLoading, setImageLoading, currentIndex, imageResizeMode, videoResizeMode]);

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
                nestedScrollEnabled
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
    hashtagsDisplay,
    images,
    hasMedia,
    currentIndex,
    fullLines,
    setFullLines,
}) => {
    const needsTruncation = hasMedia && fullLines > 1;
    const isExpanded = expandedIndex === index;
    const effectiveNumberOfLines = hasMedia ? (isExpanded ? undefined : needsTruncation ? 1 : undefined) : undefined;
    const effectiveEllipsizeMode = hasMedia && !isExpanded && needsTruncation ? "tail" : undefined;

    return (
        <View style={themedStyles(theme).contentContainer}>
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
            <View style={themedStyles(theme).captionContainer}>
                <Text
                    numberOfLines={effectiveNumberOfLines}
                    ellipsizeMode={effectiveEllipsizeMode}
                    style={themedStyles(theme).content}
                >
                    {item.caption}
                </Text>
                <Text
                    style={[themedStyles(theme).content, { position: 'absolute', opacity: 0, width: '100%' }]}
                    onTextLayout={(e) => setFullLines(e.nativeEvent.lines.length)}
                >
                    {item.caption}
                </Text>
                {hasMedia && needsTruncation && (
                    <TouchableOpacity onPress={() => toggleExpand(index)} style={themedStyles(theme).toggleButton}>
                        <Text style={themedStyles(theme).toggleText}>{isExpanded ? 'See less' : 'See more'}</Text>
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
    );
});

const PostFooter = React.memo(({
    theme,
    item,
    isLiked,
    likesCount,
    handleLikeToggle,
    isLikeLoading,
    openLikesSheet,
    openCommentSheet,
}) => (
    <View style={themedStyles(theme).footer}>
        <TouchableOpacity style={themedStyles(theme).button} onPress={handleLikeToggle} disabled={isLikeLoading}>
            <Heart size={24} color={isLiked ? theme.likeColor : theme.iconColor} fill={isLiked ? theme.likeColor : 'none'} strokeWidth={1.7} />
            {likesCount > 0 && (
                <TouchableOpacity onPress={openLikesSheet} style={{ width: 30, marginLeft: 3 }}>
                    <Text style={themedStyles(theme).buttonText}>{likesCount}</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
        <TouchableOpacity style={themedStyles(theme).button} onPress={() => openCommentSheet(item)}>
            <MessageCircle size={22} color={theme.iconColor} strokeWidth={1.7} />
            {item?.totalComments > 0 && <Text style={themedStyles(theme).buttonText}>{item?.totalComments}</Text>}
        </TouchableOpacity>
        <View style={themedStyles(theme).button}>
            <TrendingUp size={22} color={theme.iconColor} strokeWidth={1.7} />
            {item?.viewCount > 0 && <Text style={themedStyles(theme).buttonText}>{item.viewCount}</Text>}
        </View>
    </View>
));

const HomeHangoutCardPost = React.memo(({ item, index, setHandOut, refreshPost, updatePost, setDisplayedPosts }) => {
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const theme = getTheme(colorScheme);

    const [postState, setPostState] = useState({
        loading: false,
        operationLoading: false,
        isLiked: item?.isLiked || false,
        likesCount: item?.likeUser?.length || 0,
        isOnline: true,
        visible1: false,
        reportModalVisible: false,
        yourActivity: false,
        modalVisible: false,
        currentIndex: 0,
        expandedIndex: null,
        commentSheetVisible: false,
        pageNumber: 1,
        commentText: "",
        showComment: [],
        postingComment: false,
        hasMore: true,
        refreshing: false,
        myUserId: null,
        myUserDetails: null,
        editTo: null,
        replyTo: null,
        editingCommentId: null,
        isEditingReply: false,
        isDeleteModalVisible: false,
        commentToDelete: null,
        isDeletingReply: false,
        parentCommentId: null,
        imageLoading: {},
        isLikeLoading: false,
        mediaModalVisible: false,
        selectedMedia: null,
        fullLines: 0,
        sheetContent: { type: null, data: [] }, // Added sheetContent to postState
    });

    const scrollX = useRef(new Animated.Value(0)).current;
    const bottomSheetRef = useRef(null);
    const commentSheetRef = useRef(null);
    const textInputRef = useRef(null);

    // Memoized calculations
    const PostUri = useMemo(() => item?.imageUrls ?? [], [item?.imageUrls]);
    const downloadedPostUri = useMemo(() =>
        item?.downloadedImageUrls ? item.downloadedImageUrls.map((url) => `file://${url}`) : [], [item?.downloadedImageUrls]
    );
    const hasMedia = useMemo(() => (PostUri.length > 0) || (downloadedPostUri.length > 0), [PostUri, downloadedPostUri]);
    const images = useMemo(() => {
        if (!hasMedia) return [];
        const uris = PostUri.length > 0 ? PostUri : downloadedPostUri;
        return uris.map((uri) => ({ uri, type: isVideo(uri) ? "video" : "image", caption: item.caption }));
    }, [PostUri, downloadedPostUri, item.caption, hasMedia]);
    const finalUri = useMemo(() => {
        const profileUri = item?.userDetails?.profileUrl;
        const downloadedUri = item?.downloadedProfileUrl ? `file://${item.downloadedProfileUrl}` : null;
        return profileUri?.trim() ? profileUri : downloadedUri?.trim() ? downloadedUri : DEFAULT_IMAGE_PROFILE;
    }, [item?.userDetails?.profileUrl, item?.downloadedProfileUrl]);

    // Network effect
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => setPostState((prev) => ({ ...prev, isOnline: state.isConnected })));
        return () => unsubscribe();
    }, []);

    // User details effect
    useEffect(() => {
        const fetchUserId = async () => {
            const user = await AsyncStorage.getItem("userDetails");
            if (user) {
                const parsed = JSON.parse(user);
                setPostState((prev) => ({ ...prev, myUserId: parsed?.id, myUserDetails: parsed }));
            }
        };
        fetchUserId();
    }, []);

    // Orientation effect
    useEffect(() => {
        Orientation.lockToPortrait();
    }, []);

    // Preload images effect
    useEffect(() => {
        if (hasMedia) {
            const preloadImages = async () => {
                const imagePromises = images
                    .filter((item) => item.type === "image")
                    .slice(0, 3)
                    .map((item) => FastImage.preload([{ uri: item.uri, priority: FastImage.priority.high }]));
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
                    setPostState((prev) => ({ ...prev, yourActivity: true }));
                }
            } catch (error) {
                console.error("Error fetching data from AsyncStorage:", error);
            }
        };
        fetchData();
    }, [item.userDetails.id]);

    // Handlers
    const closeSheet = useCallback(() => {
        bottomSheetRef.current?.close();
        setPostState((prev) => ({ ...prev, sheetContent: { type: null, data: [] } }));
    }, []);

    const openSheet = useCallback((type, data) => {
        try {
            setPostState((prev) => ({ ...prev, sheetContent: { type, data } }));
            bottomSheetRef.current?.open();
        } catch (error) {
            console.error("Error opening bottom sheet:", error);
            showToast("Something went wrong, please try again", 'error');
        }
    }, []);

    const openLikesSheet = useCallback(() => openSheet('likes', item?.likeUser || []), [item?.likeUser, openSheet]);
    const openTaggedUsersSheet = useCallback(() => openSheet('taggedUsers', item?.taggedUsers || []), [item?.taggedUsers, openSheet]);

    const getComment = useCallback(async (page = 1) => {
        if (postState.loading || (!postState.hasMore && page !== 1)) return;

        setPostState((prev) => ({ ...prev, loading: true }));
        try {
            const authToken = await AsyncStorage.getItem("authToken");
            if (!authToken) throw new Error("No auth token found");

            const queryParams = new URLSearchParams({ hangoutId: item.id, page, limit: 20 }).toString();
            const response = await apiCallWithToken(`${apiServerUrl}/user/getAllHangoutPostComments?${queryParams}`, "GET", null, authToken);
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

            setPostState((prev) => ({
                ...prev,
                showComment: page === 1 ? commentsWithId : [...prev.showComment, ...commentsWithId],
                hasMore: newComments.length === 20,
            }));
        } catch (error) {
            console.error("Error fetching comments:", error);
            showToast("Something went wrong, please try again", 'error');
        } finally {
            setPostState((prev) => ({ ...prev, loading: false, refreshing: false }));
        }
    }, [item.id, postState.loading, postState.hasMore]);

    const openCommentSheet = useCallback(() => {
        setPostState((prev) => ({
            ...prev,
            commentSheetVisible: true,
            pageNumber: 1,
            hasMore: true,
            showComment: [],
        }));
        commentSheetRef.current?.open();
        setTimeout(() => getComment(1), 100);
    }, [getComment]);

    const closeCommentSheet = useCallback(() => {
        setTimeout(() => {
            setPostState((prev) => ({
                ...prev,
                commentSheetVisible: false,
                commentText: "",
                replyTo: null,
                editTo: null,
                editingCommentId: null,
                isEditingReply: false,
                isDeleteModalVisible: false,
                parentCommentId: null,
                showComment: [],
            }));
        }, 300);
    }, []);

    const handleCommentEndReached = useCallback(() => {
        if (!postState.loading && postState.hasMore && !postState.refreshing) {
            const nextPage = postState.pageNumber + 1;
            setPostState((prev) => ({ ...prev, pageNumber: nextPage }));
            getComment(nextPage);
        }
    }, [postState.loading, postState.hasMore, postState.refreshing, postState.pageNumber, getComment]);

    const handleCommentRefresh = useCallback(() => {
        setPostState((prev) => ({ ...prev, refreshing: true, pageNumber: 1, hasMore: true }));
        getComment(1);
    }, [getComment]);

    const handlePostComment = useCallback(async () => {
        if (!postState.commentText.trim()) return;

        const authToken = await AsyncStorage.getItem("authToken");
        const body = {
            likeComments: [
                {
                    hangoutId: item.id,
                    comment: postState.commentText,
                    ...(postState.replyTo && {
                        commentId: postState.replyTo.id,
                        type: "REPLY",
                        replyTo: postState.replyTo.userName,
                        userId: postState.replyTo.userId,
                    }),
                    ...(postState.editingCommentId && {
                        [postState.isEditingReply ? "replyCommentId" : "commentId"]: postState.editingCommentId,
                        ...(postState.isEditingReply && postState.parentCommentId ? { commentId: postState.parentCommentId } : {}),
                        type: postState.isEditingReply ? "EDITREPLY" : "UPDATE",
                    }),
                },
            ],
        };

        setPostState((prev) => ({ ...prev, postingComment: true }));
        const previousComments = [...postState.showComment];

        try {
            const userData = await AsyncStorage.getItem("userDetails");
            const user = userData ? JSON.parse(userData) : {};
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
            const newComment = {
                id: tempId,
                comment: postState.commentText,
                commentedAt: new Date().toISOString(),
                commentUser: {
                    id: user.id,
                    fullName: user.fullName || "Anonymous",
                    profileUrl: user.profileUrl || ImagesAssets.defaultProfile,
                },
                ...(postState.replyTo && {
                    commentId: postState.replyTo.id,
                    replyTo: postState.replyTo.userName,
                    userId: postState.replyTo.userId,
                }),
                isEdited: false,
                reply: [],
            };

            setPostState((prev) => ({
                ...prev,
                showComment: postState.editingCommentId
                    ? prev.showComment.map((comment) => ({
                        ...comment,
                        ...(comment.id === postState.editingCommentId && { comment: postState.commentText, isEdited: true }),
                        reply: comment.reply.map((rep) =>
                            rep.id === postState.editingCommentId ? { ...rep, comment: postState.commentText, isEdited: true } : rep
                        ),
                    }))
                    : postState.replyTo
                        ? prev.showComment.map((comment) =>
                            comment.id === postState.replyTo.id
                                ? { ...comment, reply: [...comment.reply, { ...newComment, commentUser: { id: user.id, fullName: user.fullName || "Anonymous", profileUrl: user.profileUrl || ImagesAssets.defaultProfile } }] }
                                : comment
                        )
                        : [newComment, ...prev.showComment],
                commentText: "",
            }));

            const response = await apiCallWithToken(`${apiServerUrl}/user/likeCommentHangoutPost`, "PUT", body, authToken);
            setPostState((prev) => ({
                ...prev,
                showComment: prev.showComment.map((comment) =>
                    comment.id === tempId ? { ...comment, id: response.result?.commentId || tempId } : comment
                ),
            }));

            if (updatePost && !postState.replyTo && !postState.editingCommentId) {
                const newCommentCount = (item.comments?.length || 0) + 1;
                updatePost(item.id, { comments: { ...item.comments, length: newCommentCount }, totalComments: (item.totalComments || 0) + 1 });
            }

            showToast(
                postState.editingCommentId ? "Comment updated successfully" : postState.replyTo ? "Reply posted successfully" : "Comment posted successfully",
                'success'
            );
        } catch (error) {
            console.error("Error posting/editing/replying comment:", error);
            setPostState((prev) => ({ ...prev, showComment: previousComments }));
            showToast("Something went wrong, please try again", 'error');
        } finally {
            setPostState((prev) => ({
                ...prev,
                postingComment: false,
                commentText: "",
                replyTo: null,
                editTo: null,
                editingCommentId: null,
                isEditingReply: false,
                parentCommentId: null,
            }));
        }
    }, [postState.commentText, item.id, postState.replyTo, postState.editingCommentId, postState.isEditingReply, postState.parentCommentId, postState.showComment, updatePost, item.comments]);

    const handleEditComment = useCallback((comment, commentId, isReply = false) => {
        setPostState((prev) => ({
            ...prev,
            commentText: comment,
            editTo: { id: commentId, comment },
            editingCommentId: commentId,
            isEditingReply: isReply,
            replyTo: null,
            isDeleteModalVisible: false,
            parentCommentId: isReply ? prev.showComment.find((c) => c.reply.some((r) => r.id === commentId))?.id || null : null,
        }));
        textInputRef.current?.focus();
    }, [postState.showComment]);

    const cancelEditOrReply = useCallback(() => {
        setPostState((prev) => ({
            ...prev,
            replyTo: null,
            editTo: null,
            editingCommentId: null,
            isEditingReply: false,
            commentText: "",
            isDeleteModalVisible: false,
            parentCommentId: null,
        }));
        textInputRef.current?.focus();
    }, []);

    const showDeleteConfirmation = useCallback((commentId, isReply = false) => {
        setPostState((prev) => ({
            ...prev,
            commentToDelete: commentId,
            isDeletingReply: isReply,
            replyTo: null,
            editTo: null,
            editingCommentId: null,
            commentText: "",
            isDeleteModalVisible: true,
            parentCommentId: isReply ? prev.showComment.find((c) => c.reply.some((r) => r.id === commentId))?.id || null : null,
        }));
    }, [postState.showComment]);

    const handleDeleteComment = useCallback(async () => {
        if (!postState.commentToDelete) return;

        setPostState((prev) => ({ ...prev, loading: true, isDeleteModalVisible: false }));
        try {
            const authToken = await AsyncStorage.getItem("authToken");
            const body = {
                likeComments: [
                    {
                        hangoutId: item.id,
                        comment: "true",
                        [postState.isDeletingReply ? "replyCommentId" : "commentId"]: postState.commentToDelete,
                        ...(postState.isDeletingReply && postState.parentCommentId ? { commentId: postState.parentCommentId } : {}),
                        type: postState.isDeletingReply ? "DELETEREPLY" : "DELETE",
                    },
                ],
            };

            await apiCallWithToken(`${apiServerUrl}/user/likeCommentHangoutPost`, "PUT", body, authToken);
            setPostState((prev) => ({
                ...prev,
                showComment: prev.showComment
                    .map((comment) => ({
                        ...comment,
                        reply: comment.reply.filter((rep) => rep.id !== postState.commentToDelete),
                    }))
                    .filter((comment) => comment.id !== postState.commentToDelete),
            }));

            if (updatePost && !postState.isDeletingReply) {
                const newCommentCount = Math.max((item.comments?.length || 0) - 1, 0);
                updatePost(item.id, { comments: { ...item.comments, length: newCommentCount }, totalComments: (item.totalComments || 0) - 1 });
            }

            showToast("Comment deleted successfully", 'success');
        } catch (error) {
            console.error("Error deleting comment:", error);
            showToast("Something went wrong, please try again", 'error');
        } finally {
            setPostState((prev) => ({
                ...prev,
                loading: false,
                commentToDelete: null,
                isDeletingReply: false,
                parentCommentId: null,
            }));
        }
    }, [postState.commentToDelete, item.id, postState.isDeletingReply, postState.parentCommentId, updatePost, item.comments]);

    const handleReply = useCallback((commentId, userName, userId) => {
        setPostState((prev) => ({
            ...prev,
            replyTo: { id: commentId, userName, userId },
            editTo: null,
            editingCommentId: null,
            isEditingReply: false,
            commentText: "",
            isDeleteModalVisible: false,
            parentCommentId: commentId,
        }));
        textInputRef.current?.focus();
    }, []);

    const handleLikeApi = useCallback(async (likeState) => {
        const previousLiked = postState.isLiked;
        const previousCount = postState.likesCount;
        const previousLikeUser = [...(item.likeUser || [])];

        setPostState((prev) => ({
            ...prev,
            isLiked: likeState,
            likesCount: likeState ? previousCount + 1 : Math.max(previousCount - 1, 0),
            isLikeLoading: true,
        }));

        let updatedLikeUser = [...previousLikeUser];
        const currentUser = {
            id: postState.myUserId,
            fullName: postState.myUserDetails?.fullName || 'You',
            profileUrl: postState.myUserDetails?.profileUrl || '',
        };

        if (likeState) {
            if (!updatedLikeUser.some((u) => u.id === postState.myUserId)) {
                updatedLikeUser.push(currentUser);
            }
        } else {
            updatedLikeUser = updatedLikeUser.filter((u) => u.id !== postState.myUserId);
        }

        if (updatePost) {
            updatePost(item.id, { isLiked: likeState, likeUser: updatedLikeUser });
        }

        try {
            const authToken = await AsyncStorage.getItem("authToken");
            // if (await checkConnected()) {
                if (!authToken) throw new Error("No auth token found");
                const body = { likeComments: [{ hangoutId: item.id, isLiked: likeState }] };
                const response = await axios({
                    method: "PUT",
                    url: apiServerUrl + "/user/likeCommentHangoutPost",
                    data: body,
                    headers: { authToken },
                });
                if (response.data.responseCode !== 200) {
                    throw new Error(`Unexpected response code: ${response.data.responseCode}`);
                }
            // } else {
            //     throw new Error("No internet connection");
            // }
        } catch (error) {
            setPostState((prev) => ({ ...prev, isLiked: previousLiked, likesCount: previousCount }));
            if (updatePost) {
                updatePost(item.id, { isLiked: previousLiked, likeUser: previousLikeUser });
            }
            console.error("Error toggling like:", error);
            showToast("Something went wrong, please try again", 'error');
        } finally {
            setPostState((prev) => ({ ...prev, isLikeLoading: false }));
        }
    }, [postState.isLiked, postState.likesCount, item.likeUser, item.id, postState.myUserId, postState.myUserDetails, updatePost]);

    const handleLikeToggle = useCallback(() => {
        if (postState.isLikeLoading) return;
        handleLikeApi(!postState.isLiked);
    }, [postState.isLikeLoading, postState.isLiked, handleLikeApi]);

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            setPostState((prev) => ({ ...prev, currentIndex: viewableItems[0].index || 0 }));
        }
    }, []);

    const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig: { viewAreaCoveragePercentThreshold: 50 }, onViewableItemsChanged }]);

    const handleDelete = useCallback(async () => {
        setPostState((prev) => ({ ...prev, modalVisible: false }));
        await handleDeleteGroup();
    }, []);

    const handleDeleteGroup = useCallback(async () => {
        setPostState((prev) => ({ ...prev, operationLoading: true }));
        try {
            const dbResult = await AsyncStorage.getItem("userDetails");
            const userDetails = JSON.parse(dbResult);

            setHandOut((prev) => prev.filter((post) => post.id !== item.id));
            setDisplayedPosts((prev) => prev.filter((post) => post.id !== item.id));

            const res = await axios({
                method: "PUT",
                url: `${apiServerUrl}/user/updateHangoutPost`,
                data: { hangouts: [{ hangoutId: item.id, status: "DELETE" }] },
                headers: { authToken: userDetails.authToken },
            });

            if (res?.data?.responseCode === 200) {
                setPostState((prev) => ({ ...prev, visible1: false }));
                showToast("Post deleted successfully", 'success');
            } else {
                setHandOut((prev) => [...prev, item]);
                setDisplayedPosts((prev) => [...prev, item]);
                throw new Error("Failed to delete post");
            }
        } catch (error) {
            console.log("Error in deleting group activity", error.response?.data);
            setHandOut((prev) => [...prev, item]);
            setDisplayedPosts((prev) => [...prev, item]);
            showToast("Something went wrong, please try again", 'error');
        } finally {
            setPostState((prev) => ({ ...prev, operationLoading: false }));
        }
    }, [item, setHandOut, setDisplayedPosts]);

    const handleReportGroup = useCallback(async (reasonString) => {
        setPostState((prev) => ({ ...prev, operationLoading: true }));
        try {
            const dbResult = await AsyncStorage.getItem("userDetails");
            const userDetails = JSON.parse(dbResult);

            setHandOut((prev) => prev.filter((post) => post.id !== item.id));
            setDisplayedPosts((prev) => prev.filter((post) => post.id !== item.id));

            const res = await axios({
                method: "PUT",
                url: `${apiServerUrl}/user/updateHangoutPost`,
                data: { hangouts: [{ hangoutId: item.id, reason: reasonString, status: "REPORTED" }] },
                headers: { authToken: userDetails.authToken },
            });

            if (res?.data?.responseCode === 200) {
                setPostState((prev) => ({ ...prev, visible1: false }));
                showToast("Post reported successfully", 'success');
            } else {
                setHandOut((prev) => [...prev, item]);
                setDisplayedPosts((prev) => [...prev, item]);
                throw new Error("Failed to report post");
            }
        } catch (error) {
            console.log("Error in reporting group activity", error?.response?.data);
            setHandOut((prev) => [...prev, item]);
            setDisplayedPosts((prev) => [...prev, item]);
            showToast("Something went wrong, please try again", 'error');
        } finally {
            setPostState((prev) => ({ ...prev, operationLoading: false }));
        }
    }, [item, setHandOut, setDisplayedPosts]);

    const handleReportSubmit = useCallback(async (reason) => {
        setPostState((prev) => ({ ...prev, reportModalVisible: false }));
        await handleReportGroup(reason);
    }, [handleReportGroup]);

    const handleMediaPress = useCallback((uri, index) => {
        setPostState((prev) => ({ ...prev, selectedMedia: { mediaItems: images, initialIndex: index }, mediaModalVisible: true }));
    }, [images]);

    const handleCardPress = useCallback((user) => {
        navigation.navigate("CrewProfile", { item: user, source: "hangout" });
    }, [navigation]);

    const openMenu = useCallback(() => setPostState((prev) => ({ ...prev, visible1: true })), []);
    const closeMenu = useCallback(() => setPostState((prev) => ({ ...prev, visible1: false })), []);

    const toggleExpand = useCallback((index) => {
        setPostState((prev) => ({ ...prev, expandedIndex: prev.expandedIndex === index ? null : index }));
    }, []);

    const hashtagsDisplay = useMemo(() => (
        <View style={themedStyles(theme).hashtagsContainer}>
            {item.groupActivityId && (
                <View style={[themedStyles(theme).tag, { backgroundColor: theme.tagBg }]}>
                    <Text style={[themedStyles(theme).tagText, { color: '#06361F' }]}>buddyUp Events</Text>
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
                        source={{ uri: user?.profileUrl || DEFAULT_IMAGE_PROFILE, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                ))}
                {item?.taggedUsers?.length > 3 && (
                    <View style={themedStyles(theme).additionalUsers}>
                        <Text style={themedStyles(theme).additionalUsersText}>+{item?.taggedUsers?.length - 3}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    ), [item?.taggedUsers, openTaggedUsersSheet, theme]);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={themedStyles(theme).ListContainer}>
                {postState.operationLoading && (
                    <View style={themedStyles(theme).operationLoadingOverlay}>
                        <ActivityIndicator size="small" color={Colors.secondary} />
                    </View>
                )}
                <PostHeader
                    theme={theme}
                    item={item}
                    finalUri={finalUri}
                    handleCardPress={handleCardPress}
                    yourActivity={postState.yourActivity}
                    visible1={postState.visible1}
                    openMenu={openMenu}
                    closeMenu={closeMenu}
                    navigation={navigation}
                    setModalVisible={() => setPostState((prev) => ({ ...prev, modalVisible: true }))}
                    setReportModalVisible={() => setPostState((prev) => ({ ...prev, reportModalVisible: true }))}
                    taggedUsersDisplay={taggedUsersDisplay}
                />
                <PostMedia
                    item={item}
                    theme={theme}
                    images={images}
                    hasMedia={hasMedia}
                    currentIndex={postState.currentIndex}
                    handleMediaPress={handleMediaPress}
                    imageLoading={postState.imageLoading}
                    setImageLoading={(fn) => setPostState((prev) => ({ ...prev, imageLoading: typeof fn === 'function' ? fn(prev.imageLoading) : fn }))}
                    viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
                />
                <Loader isLoading={postState.loading} />
                <PostContent
                    theme={theme}
                    item={item}
                    expandedIndex={postState.expandedIndex}
                    index={index}
                    toggleExpand={toggleExpand}
                    hashtagsDisplay={hashtagsDisplay}
                    images={images}
                    hasMedia={hasMedia}
                    currentIndex={postState.currentIndex}
                    fullLines={postState.fullLines}
                    setFullLines={(lines) => setPostState((prev) => ({ ...prev, fullLines: lines }))}
                />
                <PostFooter
                    theme={theme}
                    item={item}
                    isLiked={postState.isLiked}
                    likesCount={postState.likesCount}
                    handleLikeToggle={handleLikeToggle}
                    isLikeLoading={postState.isLikeLoading}
                    openLikesSheet={openLikesSheet}
                    openCommentSheet={openCommentSheet}
                />
                <ReportModal
                    visible={postState.reportModalVisible}
                    onClose={() => setPostState((prev) => ({ ...prev, reportModalVisible: false }))}
                    onSubmit={handleReportSubmit}
                />
                <DeleteModal
                    visible={postState.modalVisible}
                    onClose={() => setPostState((prev) => ({ ...prev, modalVisible: false }))}
                    onDelete={handleDelete}
                />
                {postState.selectedMedia && (
                    <MediaPreviewModalForPosts
                        visible={postState.mediaModalVisible}
                        onClose={() => setPostState((prev) => ({ ...prev, mediaModalVisible: false }))}
                        mediaItems={postState.selectedMedia.mediaItems}
                        initialIndex={postState.selectedMedia.initialIndex}
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
                        container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: theme.sheetBg },
                        draggableIcon: { display: "none" },
                    }}
                >
                    <View style={themedStyles(theme).sheetContent}>
                        <Text style={themedStyles(theme).sheetTitle}>
                            {postState.sheetContent.type === 'likes' ? 'Likes' : 'Tagged Users'}
                        </Text>
                        <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
                            {postState.sheetContent.data.length > 0 ? (
                                postState.sheetContent.data.map((user) => (
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
                                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", flex: 1 }}>
                                                <Text style={themedStyles(theme).userItem}>{user.fullName}</Text>
                                                <TouchableOpacity onPress={() => { closeSheet(); navigation.navigate("CrewProfile", { item: user, source: "hangout" }); }}>
                                                    <Image style={themedStyles(theme).baseIcons} source={ImagesAssets.eye_icon} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={themedStyles(theme).noLikesText}>
                                    {postState.sheetContent.type === 'likes' ? 'No likes yet' : 'No tagged users'}
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
                    height={height * 0.6}
                    onClose={closeCommentSheet}
                    customStyles={{
                        container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: theme.sheetBg, paddingBottom: 20 },
                        draggableIcon: { backgroundColor: theme.textTertiary, width: 40, height: 2, borderRadius: 2.5, marginVertical: 10 },
                    }}
                >
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 30}
                    >
                        <View style={{ flex: 1 }}>
                            <View style={themedStyles(theme).commentSheetHeader}>
                                <Text style={themedStyles(theme).sheetTitle}>Comments</Text>
                            </View>
                            <FlatList
                                data={postState.showComment}
                                renderItem={({ item }) => (
                                    <ShowCommentList
                                        item={item}
                                        myUserId={postState.myUserId}
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
                                ListEmptyComponent={<Text style={themedStyles(theme).emptyText}>No comments yet</Text>}
                                initialNumToRender={10}
                                windowSize={5}
                                nestedScrollEnabled={true}
                            />
                            <Modal
                                visible={postState.isDeleteModalVisible}
                                onDismiss={() => setPostState((prev) => ({ ...prev, isDeleteModalVisible: false }))}
                                contentContainerStyle={themedStyles(theme).modalContent}
                            >
                                <Text style={themedStyles(theme).modalTitle}>Delete Comment</Text>
                                <Text style={themedStyles(theme).modalText}>Are you sure you want to delete this comment?</Text>
                                <View style={themedStyles(theme).modalButtons}>
                                    <TouchableOpacity
                                        style={[themedStyles(theme).modalButton, themedStyles(theme).cancelButton]}
                                        onPress={() => setPostState((prev) => ({ ...prev, isDeleteModalVisible: false }))}
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
                                    {postState.editTo && (
                                        <View style={themedStyles(theme).editHeader}>
                                            <Text style={themedStyles(theme).editToText}>
                                                Editing {postState.editTo.comment.length > 20 ? `${postState.editTo.comment.slice(0, 20)}...` : postState.editTo.comment}
                                            </Text>
                                            <TouchableOpacity onPress={cancelEditOrReply}>
                                                <Ionicons name="close" size={20} color={theme.textTertiary} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {postState.replyTo && !postState.editTo && (
                                        <View style={themedStyles(theme).replyHeader}>
                                            <Text style={themedStyles(theme).replyToTextInput}>Replying to {postState.replyTo.userName}</Text>
                                            <TouchableOpacity onPress={cancelEditOrReply}>
                                                <Ionicons name="close" size={20} color={theme.textTertiary} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    <View style={themedStyles(theme).inputWrapper}>
                                        <TextInput
                                            ref={textInputRef}
                                            placeholder={
                                                postState.editTo
                                                    ? `Editing ${postState.editTo.comment.length > 20 ? `${postState.editTo.comment.slice(0, 20)}...` : postState.editTo.comment}`
                                                    : postState.replyTo
                                                        ? "Write a reply..."
                                                        : "Write your comment"
                                            }
                                            placeholderTextColor={theme.textTertiary}
                                            style={themedStyles(theme).textInput}
                                            value={postState.commentText}
                                            onChangeText={(text) => setPostState((prev) => ({ ...prev, commentText: text }))}
                                            multiline
                                            editable={!postState.postingComment}
                                        />
                                        <TouchableOpacity
                                            style={themedStyles(theme).sendButton}
                                            onPress={handlePostComment}
                                            disabled={!postState.commentText.trim() || postState.postingComment}
                                        >
                                            <SendHorizonal size={20} strokeWidth={1.5} color={Colors.white} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </KeyboardAvoidingView>
                </RBSheet>
            </View>
        </TouchableWithoutFeedback>
    );
});

export default HomeHangoutCardPost;

// Themed styles (unchanged from original)
const themedStyles = (theme) => StyleSheet.create({
    ListContainer: {
        backgroundColor: theme.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
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
        marginBottom: 5,
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
    captionContainer: {
        marginBottom: 5,
    },
    content: {
        fontSize: 15,
        fontFamily: 'Poppins-Regular',
        color: theme.contentTextColor,
        lineHeight: 22,
    },
    toggleButton: {
        alignSelf: 'flex-start',
    },
    toggleText: {
        color: theme.likeColor,
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
    },
    postTimestamp: {
        fontSize: 11,
        color: theme.textTertiary,
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
        marginTop: 10,
        backgroundColor: theme.commentBg,
        borderRadius: 8,
        marginHorizontal: 10,
    },
    commentImage: {
        width: 40,
        height: 40,
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
        fontSize: 12,
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
        fontFamily: 'Poppins-Regular',
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
        paddingVertical: Platform.OS === 'ios' ? 10 : 8,
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
        marginTop: 10,
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
        marginTop: 20,
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