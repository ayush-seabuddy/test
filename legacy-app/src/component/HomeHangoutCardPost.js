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
} from "react-native";
import React, { useCallback, useEffect, useRef, useState, useMemo, useTransition } from "react";
import ReactTimeAgo from 'react-time-ago';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import zh from 'javascript-time-ago/locale/zh.json'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl, checkConnected, formatShipName, getApiLevel } from "../Api";
import { ImagesAssets } from "../assets/ImagesAssets";
import { Heart, MessageCircle, Pencil, Reply, SendHorizonal, Trash, TrendingUp } from "lucide-react-native";
import Orientation from "react-native-orientation-locker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ActivityIndicator, Menu, Modal } from "react-native-paper";
import Colors from "../colors/Colors";
import SimpleToast from "react-native-simple-toast";
import { useNavigation } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import Loader from "../component/Loader";
import axios from "axios";
import ReportModal from "../component/Modals/ReasonModal";
import DeleteModal from "../component/Modals/DeleteModal";
import Video from "react-native-video";
import RBSheet from "react-native-raw-bottom-sheet";
import FastImage from "react-native-fast-image";
import MediaPreviewModalForPosts from "../component/Modals/MediaPreviewModalForPosts";
import { useTranslation } from "react-i18next";
import { t } from "i18next";

// Register locales
TimeAgo.addDefaultLocale(en)
TimeAgo.addLocale(zh)

const { width, height } = Dimensions.get("screen");
const DEFAULT_IMAGE_PROFILE = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";
const DEFAULT_IMAGE = "https://raw.githubusercontent.com/Prince26lmp/assets/main/placeholderseabuddy.png";
const isVideo = (uri) => uri?.match(/\.(mp4|mov|avi)$/i);

const Time = ({ date, verboseDate, tooltip, children, ...rest }) => {
    return <Text {...rest}>{children}</Text>;
};

const ExpandableCaption = ({ caption, isExpanded, onToggle, maxLines = 1 }) => {
    const [fullLines, setFullLines] = useState(0);
    const needsTruncation = fullLines > maxLines;
    return (
        <View style={[styles.captionContainer, { marginBottom: 0 }]}>
            <Text
                numberOfLines={isExpanded ? undefined : maxLines}
                style={styles.caption}
            >
                {caption}
            </Text>
            <Text
                style={[styles.caption, { position: 'absolute', opacity: 0, width: '100%' }]}
                onTextLayout={(e) => setFullLines(e.nativeEvent.lines.length)}
            >
                {caption}
            </Text>
            {needsTruncation && (
                <TouchableOpacity onPress={onToggle}>
                    <Text style={styles.seeMoreText}>
                        {isExpanded ? t('seeless') : t('seemore')}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

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
        <View style={[isReply ? styles.replyContainer : styles.commentContainer]}>
            <TouchableOpacity onPress={handleUserPress}>
                <View style={{ position: 'relative' }}>
                    <Image
                        source={require('../assets/images/AnotherImage/Man.png')}
                        style={[isReply ? styles.replyImage : styles.commentImage, { position: 'absolute' }]}
                    />
                    <FastImage
                        source={commentItem?.commentUser?.profileUrl ? { uri: commentItem?.commentUser?.profileUrl, priority: FastImage.priority.normal } : null}
                        style={isReply ? styles.replyImage : styles.commentImage}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                </View>
            </TouchableOpacity>
            <View style={[isReply ? styles.replyContent : styles.commentContent]}>
                <View style={styles.commentHeader}>
                    <Text style={styles.userName}>{commentItem?.commentUser?.fullName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {commentItem.isEdited && <Text style={styles.editText}>{t('edited')}</Text>}
                    </View>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                    {commentItem.replyTo && isReply ? (
                        <>
                            <TouchableOpacity
                                onPress={() => { if (typeof closeCommentSheet === 'function') closeCommentSheet(); handleCardPress(commentItem?.replyUser); }}>
                                <Text style={[styles.replyToText, { color: 'green', marginBottom: 5 }]}>@{commentItem.replyTo} </Text>
                            </TouchableOpacity>
                            <Text style={styles.commentText}>{commentItem.comment}</Text>
                        </>
                    ) : (
                        <Text style={styles.commentText}>{commentItem.comment}</Text>
                    )}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5, gap: 10 }}>
                    {isMyComment ? (
                        <>
                            <TouchableOpacity onPress={handleEdit}>
                                <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                    <Pencil size={12} color='black' strokeWidth={1.7} />
                                    <Text style={styles.actionText}>{t('edit')}</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDelete}>
                                <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                    <Trash size={11} color='black' strokeWidth={1.7} />
                                    <Text style={styles.actionText}>{t('delete')}</Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity onPress={handleReplyPress}>
                            <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                <Reply size={12} color='black' strokeWidth={1.7} />
                                <Text style={styles.replyText}>{t('reply')}</Text>
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
    item,
    handleCardPress,
    finalUri,
    taggedUsersDisplay,
    openMenu,
    visible1,
    closeMenu,
    yourActivity,
    setModalVisible,
    setReportModalVisible,
    navigation,
    isMediaPost = false
}) => {
    return (
        <Pressable style={[styles.postHeaderContainer, isMediaPost && styles.mediaPostHeader]}>
            <Pressable style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center", gap: 10 }}>
                <TouchableOpacity onPress={() => handleCardPress(item?.userDetails)}>
                    <FastImage
                        style={[styles.avatar, isMediaPost && styles.mediaAvatar]}
                        source={{ uri: finalUri, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                </TouchableOpacity>
                <View style={{ flexDirection: "column", width: '65%' }}>
                    <TouchableOpacity onPress={() => handleCardPress(item?.userDetails)}>
                        <Text style={[styles.userName, isMediaPost && styles.mediaUserName]}>
                            {item?.userDetails?.fullName
                                ? item.userDetails.fullName.charAt(0).toUpperCase() + item.userDetails.fullName.slice(1)
                                : ""}
                        </Text>
                    </TouchableOpacity>
                    <Text style={[styles.userDesignation, isMediaPost && styles.mediaUserDesignation]}>
                        {item?.userDetails?.designation}
                    </Text>
                    {taggedUsersDisplay}
                </View>
            </Pressable>
            <TouchableOpacity style={[styles.menuButton, isMediaPost && styles.mediaMenuButton]} onPress={openMenu}>
                <Menu
                    visible={visible1}
                    onDismiss={closeMenu}
                    anchor={
                        <TouchableOpacity style={[styles.baseIconsWrapper, styles.crewParentFlexBox]} onPress={openMenu}>
                            <Image style={[styles.baseIcons, isMediaPost && { tintColor: '#fff' }]} source={ImagesAssets.dots} />
                        </TouchableOpacity>
                    }
                    style={[Platform.OS === 'android' && visible1 ? { paddingTop: 15 } : {}]}
                    contentStyle={{ backgroundColor: '#fff' }}
                    {...(Platform.OS === 'android' ? { anchorPosition: 'bottom' } : {})}
                >
                    {yourActivity ? (
                        <View style={{ flexDirection: "column", gap: 10 }}>
                            <Menu.Item
                                style={{ height: 35, width: 40 }}
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
                                title={t('edit')}
                                titleStyle={{ color: "black" }}
                                leadingIcon={() => <Ionicons name="create-outline" size={20} color="black" />}
                            />
                            <Menu.Item
                                style={{ height: 35, marginRight: -30 }}
                                onPress={() => setModalVisible(true)}
                                title={t('delete')}
                                titleStyle={{ color: "red" }}
                                leadingIcon={() => <Ionicons name="trash-outline" size={22} color="red" />}
                            />
                        </View>
                    ) : (
                        <Menu.Item
                            style={{ height: 35, marginRight: -30 }}
                            onPress={() => setReportModalVisible(true)}
                            title={t('report')}
                            titleStyle={{ color: "red", fontSize: 16 }}
                            leadingIcon={() => <Ionicons name="warning-outline" size={22} color="red" />}
                        />
                    )}
                </Menu>
            </TouchableOpacity>
        </Pressable>
    );
});

const HomeHangoutCardPost = React.memo(({ item, index, setHandOut, refreshPost, updatePost, setDisplayedPosts, locale }) => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [operationLoading, setOperationLoading] = useState(false);
    const [isLiked, setIsLiked] = useState(item?.isLiked || false);
    const [likesCount, setLikesCount] = useState(item?.likeUser?.length || 0);
    const [isOnline, setIsOnline] = useState(true);
    const [visible1, setVisible1] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [yourActivity, setYourActivity] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
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
    const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
    const { t } = useTranslation();
    const bottomSheetRef = useRef(null);
    const commentSheetRef = useRef(null);
    const textInputRef = useRef(null);
    const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);

    const showToast = (message, type = 'success') => {
        const duration = type === 'success' ? SimpleToast.LONG : SimpleToast.SHORT;
        SimpleToast.show(message, duration, SimpleToast.TOP, 1, 50, type === 'error' ? SimpleToast.BACKGROUND_COLOR : SimpleToast.DEFAULT_BACKGROUND_COLOR);
    };

    const PostUri = useMemo(() => item?.imageUrls ?? [], [item?.imageUrls]);
    const downloadedPostUri = useMemo(() =>
        item?.downloadedImageUrls ? item.downloadedImageUrls.map(url => `file://${url}`) : [], [item?.downloadedImageUrls]
    );
    const hasImages = useMemo(() => (PostUri.length > 0) || downloadedPostUri.length > 0, [PostUri, downloadedPostUri]);
    const images = useMemo(() => {
        if (!hasImages) return [];
        const uris = PostUri.length > 0 ? PostUri : downloadedPostUri.length > 0 ? downloadedPostUri : [DEFAULT_IMAGE];
        return uris.map(uri => ({ uri, type: isVideo(uri) ? "video" : "image", caption: item.caption }));
    }, [hasImages, PostUri, downloadedPostUri, item.caption]);

    const finalUri = useMemo(() => {
        const profileUri = item?.userDetails?.profileUrl;
        const downloadedUri = item?.downloadedProfileUrl ? `file://${item.downloadedProfileUrl}` : null;
        return profileUri?.trim() ? profileUri : downloadedUri?.trim() ? downloadedUri : DEFAULT_IMAGE_PROFILE;
    }, [item?.userDetails?.profileUrl, item?.downloadedProfileUrl]);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => setIsOnline({isOnline:state.isConnected}));
        return () => unsubscribe();
    }, []);

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

    useEffect(() => { Orientation.lockToPortrait(); }, []);

    useEffect(() => {
        if (hasImages) {
            const preloadImages = async () => {
                const imagePromises = images.filter(i => i.type === "image").map(i => FastImage.preloaded([{ uri: i.uri, priority: FastImage.priority.high }]));
                await Promise.all(imagePromises);
            };
            preloadImages();
        }
    }, [images, hasImages]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dbResult = await AsyncStorage.getItem("userDetails");
                const userDetails = JSON.parse(dbResult);
                if (userDetails.id === item.userDetails.id) setYourActivity(true);
            } catch (error) { console.error("Error fetching data:", error); }
        };
        fetchData();
    }, [item.userDetails.id]);

    const openSheet = useCallback((type, data) => {
        setSheetContent({ type, data });
        bottomSheetRef.current?.open();
    }, []);

    const closeSheet = useCallback(() => {
        bottomSheetRef.current?.close();
        setSheetContent({ type: null, data: [] });
    }, []);

    const openLikesSheet = useCallback(() => openSheet('likes', item?.likeUser || []), [item?.likeUser, openSheet]);
    const openTaggedUsersSheet = useCallback(() => openSheet('taggedUsers', item?.taggedUsers || []), [item?.taggedUsers, openSheet]);

    const getComment = useCallback(async (page = 1) => {
        if (loading || (!hasMore && page !== 1)) return;
        setLoading(true);
        try {
            const authToken = await AsyncStorage.getItem("authToken");
            const queryParams = new URLSearchParams({ hangoutId: item.id, page, limit: 20 }).toString();
            const url = `${apiServerUrl}/user/getAllHangoutPostComments?${queryParams}`;
            const response = await apiCallWithToken(url, "GET", null, authToken);
            const newComments = response?.result?.comments || [];
            const commentsWithId = newComments.map((c, i) => ({
                ...c,
                id: c.commentId || `api-${page}-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                isEdited: c.isEdited || false,
                reply: c.reply?.map((r, ri) => ({
                    ...r,
                    id: r.replyCommentId || `reply-${page}-${i}-${ri}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
                    isEdited: r.isEdited || false,
                    commentedAt: r.commentedAt || new Date().toISOString(),
                })) || [],
            }));
            setShowComment(page === 1 ? commentsWithId : prev => [...prev, ...commentsWithId]);
            setHasMore(newComments.length === 20);
        } catch (error) {
            showToast(t('failedtoloadcomments'), 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [loading, hasMore, item.id]);

    const openCommentSheet = useCallback(() => {
        if (isCommentSheetOpen) return;
        setCommentSheetVisible(true);
        setIsCommentSheetOpen(true);
        setTimeout(() => {
            commentSheetRef.current?.open();
        }, 50);
        getComment(1);
    }, [isCommentSheetOpen, getComment]);

    const closeCommentSheet = useCallback(() => {
        setCommentSheetVisible(false);
        setIsCommentSheetOpen(false);
        commentSheetRef.current?.close();
        setCommentText("");
        setReplyTo(null);
        setEditTo(null);
        setEditingCommentId(null);
        setIsEditingReply(false);
        setDeleteModalVisible(false);
        setParentCommentId(null);
        Keyboard.dismiss();
    }, []);

    const handleCommentSheetOpen = useCallback(() => {
        setIsCommentSheetOpen(true);
        setCommentSheetVisible(true);
    }, []);

    const handleCommentSheetClose = useCallback(() => {
        setIsCommentSheetOpen(false);
        setCommentSheetVisible(false);
        setCommentText("");
        setReplyTo(null);
        setEditTo(null);
        setEditingCommentId(null);
        setIsEditingReply(false);
        setParentCommentId(null);
    }, []);

    const handleCommentEndReached = useCallback(() => {
        if (!loading && hasMore && !refreshing) setPageNumber(prev => prev + 1);
    }, [loading, hasMore, refreshing]);

    const handleCommentRefresh = useCallback(() => {
        setRefreshing(true);
        setPageNumber(1);
        setHasMore(true);
        getComment(1);
    }, [getComment]);

    // PATCHED: Always update totalComments on new comment/reply
    const handlePostComment = useCallback(async () => {
        if (!commentText.trim()) return;
        const authToken = await AsyncStorage.getItem("authToken");
        const body = {
            likeComments: [{
                hangoutId: item.id,
                comment: commentText,
                ...(replyTo && { commentId: replyTo.id, type: "REPLY", replyTo: replyTo.userName, userId: replyTo.userId }),
                ...(editingCommentId && {
                    [isEditingReply ? "replyCommentId" : "commentId"]: editingCommentId,
                    ...(isEditingReply && parentCommentId ? { commentId: parentCommentId } : {}),
                    type: isEditingReply ? "EDITREPLY" : "UPDATE",
                }),
            }],
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
                commentUser: { id: user.id, fullName: user.fullName || "Anonymous", profileUrl: user.profileUrl || ImagesAssets.defaultProfile },
                ...(replyTo && { commentId: replyTo.id, replyTo: replyTo.userName, userId: replyTo.userId }),
                isEdited: false,
                reply: [],
            };

            if (editingCommentId) {
                setShowComment(prev => prev.map(c => ({
                    ...c,
                    ...(c.id === editingCommentId && { comment: commentText, isEdited: true }),
                    reply: c.reply.map(r => r.id === editingCommentId ? { ...r, comment: commentText, isEdited: true } : r)
                })));
            } else if (replyTo) {
                setShowComment(prev => prev.map(c => c.id === replyTo.id ? { ...c, reply: [...c.reply, newComment] } : c));
            } else {
                setShowComment(prev => [newComment, ...prev]);
            }

            setCommentText("");
            const response = await apiCallWithToken(`${apiServerUrl}/user/likeCommentHangoutPost`, "PUT", body, authToken);
            setShowComment(prev => prev.map(c => c.id === tempId ? { ...c, id: response.result?.commentId || tempId } : c));

            // PATCHED: Always increment totalComments for new comment/reply
            if (updatePost && !editingCommentId) {
                updatePost(item.id, {
                    totalComments: (item.totalComments || 0) + 1,
                });
            }

            showToast(editingCommentId ? t('commentUpdated') : replyTo ? t('replyoncomment') : t('commentadded'), 'success');
        } catch (error) {
            setShowComment(previousComments);
            showToast("Failed", 'error');
        } finally {
            setPostingComment(false);
            setCommentText("");
            setReplyTo(null);
            setEditTo(null);
            setEditingCommentId(null);
            setIsEditingReply(false);
            setParentCommentId(null);
        }
    }, [commentText, item.id, replyTo, editingCommentId, isEditingReply, parentCommentId, showComment, updatePost, item.totalComments]);

    const handleDeleteComment = useCallback(async () => {
        if (!commentToDelete) return;
        setLoading(true);
        setDeleteModalVisible(false);
        try {
            const authToken = await AsyncStorage.getItem("authToken");
            const body = {
                likeComments: [{
                    hangoutId: item.id,
                    comment: "true",
                    [isDeletingReply ? "replyCommentId" : "commentId"]: commentToDelete,
                    ...(isDeletingReply && parentCommentId ? { commentId: parentCommentId } : {}),
                    type: isDeletingReply ? "DELETEREPLY" : "DELETE",
                }],
            };
            await apiCallWithToken(`${apiServerUrl}/user/likeCommentHangoutPost`, "PUT", body, authToken);
            setShowComment(prev => prev
                .map(c => ({ ...c, reply: c.reply.filter(r => r.id !== commentToDelete) }))
                .filter(c => c.id !== commentToDelete)
            );

            // PATCHED: Decrement totalComments
            if (updatePost) {
                updatePost(item.id, {
                    totalComments: Math.max((item.totalComments || 0) - 1, 0),
                });
            }

            showToast(t('commentdeleted'), 'success');
        } catch (error) {
            showToast("Failed", 'error');
        } finally {
            setLoading(false);
            setCommentToDelete(null);
            setIsDeletingReply(false);
            setParentCommentId(null);
        }
    }, [commentToDelete, item.id, isDeletingReply, parentCommentId, updatePost, item.totalComments]);

    const handleEditComment = useCallback((comment, commentId, isReply = false) => {
        setCommentText(comment);
        setEditTo({ id: commentId, comment });
        setEditingCommentId(commentId);
        setIsEditingReply(isReply);
        setReplyTo(null);
        if (isReply) {
            const parent = showComment.find(c => c.reply.some(r => r.id === commentId));
            setParentCommentId(parent?.id || null);
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
            const parent = showComment.find(c => c.reply.some(r => r.id === commentId));
            setParentCommentId(parent?.id || null);
        } else {
            setParentCommentId(null);
        }
        setDeleteModalVisible(true);
    }, [showComment]);

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
        const currentUser = { id: myUserId, fullName: myUserDetails?.fullName || 'You', profileUrl: myUserDetails?.profileUrl || '' };
        if (likeState) {
            if (!updatedLikeUser.some(u => u.id === myUserId)) updatedLikeUser.push(currentUser);
        } else {
            updatedLikeUser = updatedLikeUser.filter(u => u.id !== myUserId);
        }
        if (updatePost) updatePost(item.id, { isLiked: likeState, likeUser: updatedLikeUser });
        setIsLikeLoading(true);
        try {
            const authToken = await AsyncStorage.getItem("authToken");
            if (await checkConnected()) {
                const body = { likeComments: [{ hangoutId: item.id, isLiked: likeState }] };
                const response = await axios({ method: "PUT", url: apiServerUrl + "/user/likeCommentHangoutPost", data: body, headers: { authToken } });
                if (response.data.responseCode !== 200) throw new Error("Failed");
            } else throw new Error("No internet");
        } catch (error) {
            setIsLiked(previousLiked);
            setLikesCount(previousCount);
            if (updatePost) updatePost(item.id, { isLiked: previousLiked, likeUser: previousLikeUser });
            showToast("Failed", 'error');
        } finally {
            setIsLikeLoading(false);
        }
    }, [isLiked, likesCount, item.likeUser, item.id, myUserId, myUserDetails, updatePost]);

    const handleLikeToggle = useCallback(() => {
        if (isLikeLoading) return;
        handleLikeApi(!isLiked);
    }, [isLikeLoading, isLiked, handleLikeApi]);

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index || 0);
    }, []);

    const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig: { viewAreaCoveragePercentThreshold: 50 }, onViewableItemsChanged }]);

    const handleDeleteGroup = useCallback(async () => {
        setOperationLoading(true);
        try {
            const dbResult = await AsyncStorage.getItem("userDetails");
            const userDetails = JSON.parse(dbResult);
            setHandOut(prev => prev.filter(p => p.id !== item.id));
            setDisplayedPosts(prev => prev.filter(p => p.id !== item.id));
            const res = await axios({
                method: "PUT",
                url: `${apiServerUrl}/user/updateHangoutPost`,
                data: { hangouts: [{ hangoutId: item.id, status: "DELETE" }] },
                headers: { authToken: userDetails.authToken },
            });
            if (res?.data?.responseCode === 200) {
                setVisible1(false);
                showToast(t('postdeleted'), 'success');
            } else throw new Error("Failed");
        } catch (error) {
            setHandOut(prev => [...prev, item]);
            setDisplayedPosts(prev => [...prev, item]);
            showToast("Failed", 'error');
        } finally {
            setOperationLoading(false);
        }
    }, [item.id, setHandOut, setDisplayedPosts]);

    const handleReportGroup = useCallback(async (reasonString) => {
        setOperationLoading(true);
        try {
            const dbResult = await AsyncStorage.getItem("userDetails");
            const userDetails = JSON.parse(dbResult);
            setHandOut(prev => prev.filter(p => p.id !== item.id));
            setDisplayedPosts(prev => prev.filter(p => p.id !== item.id));
            const res = await axios({
                method: "PUT",
                url: `${apiServerUrl}/user/updateHangoutPost`,
                data: { hangouts: [{ hangoutId: item.id, reason: reasonString, status: "REPORTED" }] },
                headers: { authToken: userDetails.authToken },
            });
            if (res?.data?.responseCode === 200) {
                setVisible1(false);
                showToast(t('reportsubmitted'), 'success');
            } else throw new Error("Failed");
        } catch (error) {
            setHandOut(prev => [...prev, item]);
            setDisplayedPosts(prev => [...prev, item]);
            showToast("Failed", 'error');
        } finally {
            setOperationLoading(false);
        }
    }, [item.id, setHandOut, setDisplayedPosts]);

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

    const hashtagsDisplay = useMemo(() => (
        <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap' }}>
            {(item.groupActivityId) && (
                <View style={{ backgroundColor: "#FBCF21", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5, alignSelf: "flex-start" }}>
                    <Text style={{ color: "black", fontSize: 9, textTransform: "capitalize" }}>{t('buddyupevents')}</Text>
                </View>
            )}
            {(formatShipName(item?.userDetails?.ship?.shipName || item?.userDetails?.associatedShip?.shipName)) && (
                <View style={{ backgroundColor: Colors.secondary, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5, alignSelf: "flex-start" }}>
                    <Text style={{ color: "black", fontSize: 9 }}>
                        {formatShipName(item?.userDetails?.ship?.shipName || item?.userDetails?.associatedShip?.shipName || '')}
                    </Text>
                </View>
            )}
            {item.hashtags.slice(0, 2).map((hashtag, index) => (
                <View key={index} style={{ backgroundColor: "#FBCF21", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 5, alignSelf: "flex-start" }}>
                    <Text style={{ color: "#06361F", fontSize: 9 }}>
                        {hashtag ? hashtag.charAt(0).toUpperCase() + hashtag.slice(1) : ""}
                    </Text>
                </View>
            ))}
        </View>
    ), [item.groupActivityId, item?.userDetails?.ship, item?.userDetails?.associatedShip, item.hashtags]);

    const taggedUsersDisplay = useMemo(() => (
        <TouchableOpacity onPress={openTaggedUsersSheet}>
            <View style={styles.avatarRow}>
                {item?.taggedUsers.slice(0, 3).map((user, index) => (
                    <FastImage
                        key={user.id}
                        style={[styles.avatar1, { marginLeft: index > 0 ? -15 : 0 }]}
                        source={{ uri: user?.profileUrl || DEFAULT_IMAGE_PROFILE, priority: FastImage.priority.normal, cache: FastImage.cacheControl.immutable }}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                ))}
                {item?.taggedUsers?.length > 3 && (
                    <View style={styles.additionalUsers}>
                        <Text style={styles.additionalUsersText}>+{item?.taggedUsers?.length - 3}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    ), [item?.taggedUsers, openTaggedUsersSheet]);

    const renderCaption = useCallback(() => {
        return (
            <ExpandableCaption
                caption={item.caption}
                isExpanded={isCaptionExpanded}
                onToggle={() => setIsCaptionExpanded(!isCaptionExpanded)}
                maxLines={1}
            />
        );
    }, [item.caption, isCaptionExpanded]);

    const renderItem = useCallback(({ item: imageItem, index }) => (
        <TouchableOpacity onPress={() => handleMediaPress(imageItem.uri, index)}>
            <View style={styles.imageContainer}>
                {isVideo(imageItem.uri) ? (
                    <>
                        <Video
                            source={{ uri: imageItem.uri }}
                            style={styles.imageStyle}
                            resizeMode='cover'
                            muted
                            repeat
                            paused={currentIndex !== index}
                            playInBackground={false}
                            playWhenInactive={false}
                            ignoreSilentSwitch="obey"
                            controls={false}
                        />
                        <View style={styles.playIconContainer}>
                            <Image source={ImagesAssets.vedioPlaybutton} style={styles.playIcon} resizeMode="contain" />
                        </View>
                    </>
                ) : (
                    <View>
                        {imageLoading[imageItem.uri] && <ActivityIndicator style={StyleSheet.absoluteFill} size="small" color={Colors.secondary} />}
                        <FastImage
                            style={styles.imageStyle}
                            source={{ uri: imageItem.uri || DEFAULT_IMAGE, priority: FastImage.priority.high, cache: FastImage.cacheControl.immutable }}
                            resizeMode={FastImage.resizeMode.cover}
                            onLoadStart={() => setImageLoading(prev => ({ ...prev, [imageItem.uri]: true }))}
                            onLoadEnd={() => setImageLoading(prev => ({ ...prev, [imageItem.uri]: false }))}
                        />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    ), [handleMediaPress, imageLoading, currentIndex]);

    const renderPostContent = () => {
        const showImages = hasImages;
        const isTextPost = !showImages;
        return (
            <>
                <PostHeader
                    item={item}
                    handleCardPress={handleCardPress}
                    finalUri={finalUri}
                    taggedUsersDisplay={taggedUsersDisplay}
                    openMenu={openMenu}
                    visible1={visible1}
                    closeMenu={closeMenu}
                    yourActivity={yourActivity}
                    setModalVisible={setModalVisible}
                    setReportModalVisible={setReportModalVisible}
                    navigation={navigation}
                    isMediaPost={showImages}
                />
                {showImages && (
                    <FlatList
                        data={images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderItem}
                        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
                    />
                )}
                <View style={[
                    styles.bottomContent,
                    showImages ? styles.mediaBottomContent : styles.textPostContainer
                ]}>
                    {isTextPost ? (
                        <>
                            <View style={styles.captionContainer}>
                                <Text style={styles.caption}>{item.caption}</Text>
                            </View>
                            <View style={styles.metaContainer}>
                                {hashtagsDisplay}
                            </View>
                            {item.createdAt && (
                                <Text style={styles.timestamp}>
                                    <ReactTimeAgo
                                        date={item?.createdTime ? new Date(Number(item.createdTime)) : new Date(item.createdAt)}
                                        locale={locale}
                                        component={Time}
                                        timeStyle="short"
                                    />
                                </Text>
                            )}
                        </>
                    ) : (
                        <>
                            <View style={styles.metaContainer}>
                                {hasImages && images.length > 1 && (
                                    <View style={styles.pagination}>
                                        {images.map((_, i) => (
                                            <View key={i} style={{
                                                width: 8, height: 8, borderRadius: 4,
                                                backgroundColor: currentIndex === i ? '#8DAF02' : '#bbb',
                                                marginHorizontal: 4,
                                            }} />
                                        ))}
                                    </View>
                                )}
                                {item.createdAt && (
                                    <Text style={styles.timestamp}>
                                        <ReactTimeAgo
                                            date={item?.createdTime ? new Date(Number(item.createdTime)) : new Date(item.createdAt)}
                                            locale={locale}
                                            component={Time}
                                            timeStyle="short"
                                        />
                                    </Text>
                                )}
                                {hashtagsDisplay}
                            </View>
                            {renderCaption()}
                        </>
                    )}
                    <View style={styles.interactionButtons}>
                        <View style={styles.iconRow}>
                            <TouchableOpacity style={styles.iconButton} onPress={handleLikeToggle} disabled={isLikeLoading}>
                                <Heart size={24} color={isLiked ? '#8DAF02' : 'black'} fill={isLiked ? '#8DAF02' : 'none'} strokeWidth={1.7} />
                                {likesCount > 0 && (
                                    <TouchableOpacity onPress={openLikesSheet} style={{ width: 30, marginLeft: 5 }}>
                                        <Text style={styles.likesCountText}>{likesCount}</Text>
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton} onPress={openCommentSheet}>
                                <View style={styles.iconContainer}>
                                    <MessageCircle size={22} color="black" strokeWidth={1.7} />
                                    {/* PATCHED: Use item.totalComments */}
                                    {item?.totalComments > 0 && <Text style={styles.likesCountText}>{item.totalComments}</Text>}
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <View style={styles.iconContainer}>
                                    <TrendingUp size={22} color="black" strokeWidth={1.7} />
                                    {item?.viewCount > 0 && <Text style={styles.likesCountText}>{item.viewCount}</Text>}
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </>
        );
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={[
                styles.ListContainer,
                !hasImages && styles.textPostOuterContainer
            ]}>
                {operationLoading && (
                    <View style={styles.operationLoadingOverlay}>
                        <ActivityIndicator size="small" color={Colors.secondary} />
                    </View>
                )}
                {renderPostContent()}
                <Loader isLoading={loading} />
                <ReportModal visible={reportModalVisible} onClose={() => setReportModalVisible(false)} onSubmit={handleReportSubmit} />
                <DeleteModal visible={modalVisible} onClose={() => setModalVisible(false)} onDelete={handleDeleteGroup} />
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
                <RBSheet ref={bottomSheetRef} closeOnDragDown closeOnPressMask height={height * 0.5}
                    customStyles={{ container: { borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: "white" }, draggableIcon: { display: "none" } }}>
                    <View style={styles.sheetContent}>
                        <Text style={[styles.sheetTitle, { marginBottom: 10 }]}>{sheetContent.type === 'likes' ? t('likedUsers') : t('taggedUsers')}</Text>
                        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                            {sheetContent.data.length > 0 ? sheetContent.data.map(user => (
                                <TouchableOpacity key={user.id} onPress={() => { closeSheet(); navigation.navigate("CrewProfile", { item: user, source: "hangout" }); }}>
                                    <View style={styles.userItemContainer}>
                                        <View style={{ position: "relative" }}>
                                            <Image source={require("../assets/images/AnotherImage/Man.png")} style={[styles.userImage, { position: "absolute" }]} />
                                            <FastImage style={styles.userImage} source={user.profileUrl ? { uri: user.profileUrl } : null} resizeMode={FastImage.resizeMode.cover} />
                                        </View>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", flex: 1 }}>
                                            <Text style={styles.userItem}>{user.fullName}</Text>
                                            <TouchableOpacity onPress={() => { closeSheet(); navigation.navigate("CrewProfile", { item: user, source: "hangout" }); }}>
                                                <Image style={[styles.baseIcons, { color: 'black' }]} source={ImagesAssets.eye_icon} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )) : (
                                <Text style={styles.noLikesText}>{sheetContent.type === 'likes' ? t('nolikesyet') : t('notaggedusers')}</Text>
                            )}
                        </ScrollView>
                    </View>
                </RBSheet>
                <RBSheet
                    ref={commentSheetRef}
                    closeOnDragDown
                    closeOnPressMask
                    closeOnPressBack
                    draggable
                    height={height * 0.6}
                    onOpen={handleCommentSheetOpen}
                    onClose={handleCommentSheetClose}
                    customStyles={{
                        container: {
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            backgroundColor: "#ededed",
                            paddingBottom: 20
                        },
                        draggableIcon: {
                            backgroundColor: "#888",
                            width: 40,
                            height: 2,
                            borderRadius: 2.5,
                            marginVertical: 10
                        },
                    }}>
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === "ios" || getApiLevel() > 34 ? "padding" : "padding"}
                        keyboardVerticalOffset={getApiLevel() > 34 ? 60 : 30}>
                        <View style={{ flex: 1 }}>
                            <View style={styles.commentSheetHeader}>
                                <Text style={styles.sheetTitle}>{t('comments')}</Text>
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
                                keyExtractor={item => item.id}
                                onEndReached={handleCommentEndReached}
                                onEndReachedThreshold={0.5}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={{ paddingBottom: 80 }}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={handleCommentRefresh}
                                    />
                                }
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>{t('nocommentsyet')}</Text>
                                }
                                initialNumToRender={10}
                                windowSize={5}
                            />
                            <Modal
                                visible={isDeleteModalVisible}
                                onDismiss={() => setDeleteModalVisible(false)}
                                contentContainerStyle={styles.modalContent}>
                                <Text style={styles.modalTitle}>{t('deletecomment')}</Text>
                                <Text style={styles.modalText}>{t('areyousure')}</Text>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.cancelButton]}
                                        onPress={() => setDeleteModalVisible(false)}>
                                        <Text style={styles.buttonText}>{t('cancel')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalButton, styles.deleteButton]}
                                        onPress={handleDeleteComment}>
                                        <Text style={[styles.buttonText, { color: "#fff" }]}>{t('delete')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </Modal>
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View style={styles.inputContainer}>
                                    {editTo && (
                                        <View style={styles.editHeader}>
                                            <Text style={styles.editToText}>{t('editing')}</Text>
                                            <TouchableOpacity onPress={cancelEditOrReply}>
                                                <Ionicons name="close" size={20} color="#888" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {replyTo && !editTo && (
                                        <View style={styles.replyHeader}>
                                            <Text style={styles.replyToText}>{t('replyingTo')} {replyTo.userName}</Text>
                                            <TouchableOpacity onPress={cancelEditOrReply}>
                                                <Ionicons name="close" size={20} color="#888" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            ref={textInputRef}
                                            placeholder={editTo ? "Editing..." : replyTo ? t('writearreply') : t('writeyourcomment')}
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

const styles = StyleSheet.create({
    ListContainer: {
        flex: 1,
        marginVertical: 10,
        marginHorizontal: 14,
        overflow: 'hidden',
        borderRadius: 10,
        position: 'relative',
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    textPostOuterContainer: {
        borderRadius: 10,
    },
    postHeaderContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        alignItems: 'center',
        backgroundColor: "white",
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    mediaPostHeader: {
        position: "absolute",
        width: "100%",
        top: 0,
        left: 0,
        backgroundColor: 'transparent',
        right: 0,
        zIndex: 2,
        alignItems: 'center',
    },
    avatar: { height: 40, width: 40, borderRadius: 100, borderWidth: 2, borderColor: "#FFFFFF66" },
    mediaAvatar: { borderColor: "rgba(255, 255, 255, 0.6)" },
    userName: { lineHeight: 20, fontSize: 14, fontWeight: "bold", color: "#000", fontFamily: "Poppins-SemiBold" },
    mediaUserName: { color: "#FFFFFF" },
    userDesignation: { fontSize: 12, lineHeight: 15, color: "#666", marginTop: 3, fontFamily: "Poppins-Regular" },
    mediaUserDesignation: { color: "#FFFFFF" },
    menuButton: { backgroundColor: "rgba(0, 0, 0, 0.2)", height: 32, width: 32, alignItems: "center", justifyContent: "center", borderRadius: 10 },
    mediaMenuButton: { backgroundColor: "rgba(0, 0, 0, 0.2)" },
    imageContainer: { overflow: "hidden", borderTopLeftRadius: 10, borderTopRightRadius: 10, height: 400, width: width - 28 },
    imageStyle: { width: width - 28, height: 400 },
    playIconContainer: { position: "absolute", top: "50%", left: "50%", transform: [{ translateX: -30 }, { translateY: -30 }], justifyContent: "center", alignItems: "center", zIndex: 1 },
    playIcon: { width: 40, height: 40, tintColor: "#fff" },
    bottomContent: { padding: 16, paddingTop: 10, backgroundColor: 'white' },
    mediaBottomContent: { borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
    textPostContainer: { borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },
    metaContainer: { marginBottom: 10 },
    timestamp: { fontSize: 10, lineHeight: 15, color: "#666", fontFamily: "Poppins-Regular", marginBottom: 5 },
    captionContainer: { marginBottom: 10 },
    caption: { fontSize: 14, lineHeight: 18, fontFamily: 'Poppins-Regular', color: 'black' },
    seeMoreText: {
        fontSize: 14,
        color: '#8DAF02',
        fontFamily: 'Poppins-SemiBold',
        marginTop: 4,
    },
    interactionButtons: { flexDirection: "column", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    iconRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
    iconContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    iconButton: { flexDirection: 'row', alignItems: 'center' },
    likesCountText: { color: "black", fontSize: 16, lineHeight: 25, marginTop: 3, textAlignVertical: 'center', fontFamily: "Poppins-Regular", marginLeft: 5 },
    commentContainer: { flexDirection: "row", padding: 10, paddingVertical: 12, marginBottom: 7, backgroundColor: 'white', marginHorizontal: 10, borderRadius: 10 },
    commentImage: { width: 50, height: 50, borderRadius: 50 },
    replyImage: { width: 40, height: 40, borderRadius: 50 },
    commentContent: { flex: 1, marginLeft: 12 },
    replyContent: { marginLeft: 8, width: '84%' },
    commentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    timeText: { color: "#666", fontSize: 10, fontFamily: 'Poppins-Regular' },
    editText: { color: "#666", fontSize: 10, marginLeft: 5, fontFamily: 'Poppins-Regular' },
    commentText: { fontSize: 12, lineHeight: 20, fontFamily: 'Poppins-Regular' },
    replyToText: { color: "black", fontWeight: "500", fontSize: 12 },
    replyText: { fontSize: 12, fontFamily: 'Poppins-Regular', color: 'black' },
    actionText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: 'black',
    },
    replyList: { marginTop: 16 },
    inputContainer: { padding: 10, backgroundColor: "#ededed", borderTopWidth: 1, borderColor: "#eee" },
    replyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10, paddingBottom: 5 },
    editHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 10, paddingBottom: 5 },
    inputWrapper: { flexDirection: "row", alignItems: "center" },
    textInput: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, fontSize: 15, maxHeight: 100 },
    sendButton: { marginLeft: 10, padding: 8, backgroundColor: '#82934b', borderRadius: 50 },
    emptyText: { textAlign: "center", marginTop: 20, color: "#666", fontSize: 16 },
    modalContent: { backgroundColor: "#fff", padding: 20, marginHorizontal: 20, borderRadius: 10, alignItems: "center" },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
    modalText: { fontSize: 16, color: "#333", marginBottom: 20, textAlign: "center" },
    modalButtons: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
    modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, minWidth: 100, alignItems: "center" },
    cancelButton: { backgroundColor: "#f0f0f0" },
    deleteButton: { backgroundColor: "#ff4d4d" },
    buttonText: { fontSize: 16, fontWeight: "600", color: "#333" },
    avatarRow: { marginTop: 3, flexDirection: "row", alignItems: "center" },
    avatar1: { width: 32, height: 32, borderRadius: 35, borderWidth: 2, borderColor: "rgba(255, 255, 255, 0.4)" },
    additionalUsers: { height: 32, width: 32, borderRadius: 20, backgroundColor: "#000", justifyContent: "center", alignItems: "center", marginLeft: -15 },
    additionalUsersText: { color: "#fff", fontWeight: "bold" },
    baseIcons: { width: 20, height: 20 },
    baseIconsWrapper: { alignItems: "center", justifyContent: "center" },
    crewParentFlexBox: { alignItems: "center", justifyContent: "center" },
    pagination: { flexDirection: "row", alignItems: 'center', justifyContent: "center" },
    userItemContainer: { borderColor: "gray", backgroundColor: "#f3f3f3", flexDirection: "row", paddingHorizontal: 20, paddingVertical: 5, alignItems: "center", marginBottom: 10 },
    userItem: { paddingVertical: 8, fontSize: 14, fontFamily: "Poppins-Regular", color: "black" },
    userImage: { height: 40, width: 40, borderRadius: 20, marginRight: 20 },
    noLikesText: { fontSize: 16, color: "black", textAlign: "center", paddingVertical: 20 },
    sheetContent: { paddingVertical: 20, zIndex: 1001 },
    sheetTitle: { fontSize: 14, fontFamily: "Poppins-Regular", color: "black", textAlign: "center" },
    commentSheetHeader: { alignItems: "center", justifyContent: 'center', marginBottom: 10 },
    replyContainer: { marginTop: 5, flexDirection: 'row' },
    operationLoadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
});

export default HomeHangoutCardPost;