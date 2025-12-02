import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  useColorScheme,
  FlatList,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import {
  Heart,
  MessageCircle,
  TrendingUp,
  MoreVertical,
  Play,
  Trash,
  AlertTriangle,
  Pencil,
  X,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import ReactTimeAgo from 'react-time-ago';
import { VideoView, useVideoPlayer } from 'expo-video';
import Colors from '../utils/Colors';
import { useRouter } from 'expo-router';
import BottomSheet from './BottomSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Popover from 'react-native-popover-view';

const { width } = Dimensions.get('window');

const isVideo = (uri) => !!uri && /\.(mp4|mov|avi|m4v)$/i.test(uri);

const getTheme = (colorScheme) => ({
  background: '#FFFFFF',
  cardBackground: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF',
  border: colorScheme === 'dark' ? '#333333' : '#E5E7EB',
  shadow: colorScheme === 'dark' ? '#000000' : '#000',
  textPrimary: colorScheme === 'dark' ? '#F9FAFB' : '#1F2937',
  textSecondary: colorScheme === 'dark' ? '#D1D5DB' : '#374151',
  textTertiary: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280',
  avatarBg: colorScheme === 'dark' ? '#333333' : '#D1D5DB',
  menuButtonBg: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
  tagBg: '#FBCF21',
  tagSecondaryBg: colorScheme === 'dark' ? '#4B5563' : Colors.lightGreen,
  tagText: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
  iconColor: colorScheme === 'dark' ? '#E5E7EB' : '#4B5563',
  additionalUsersBg: colorScheme === 'dark' ? '#333333' : '#D1D5DB',
  contentTextColor: colorScheme === 'dark' ? '#FFFFFF' : '#374151',
  likeColor: '#8DAF02',
  deleteColor: '#EF4444',
});

const UserItem = React.memo(({ user, theme }) => (
  <View style={styles.userItemContainer}>
    <Image
      source={{ uri: user.profileUrl || undefined }}
      style={styles.userAvatar}
      contentFit="cover"
      placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdkI' }}
    />
    <View style={styles.userInfo}>
      <Text style={[styles.userName, { color: theme.textPrimary }]}>
        {user.fullName || 'Unknown User'}
      </Text>
    </View>
  </View>
));

const TaggedUsersRow = ({ users, theme, onPress }) => (
  <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
    <View style={themedStyles(theme).avatarRow}>
      {users.slice(0, 3).map((user, index) => (
        <Image
          key={user.id}
          source={{ uri: user.profileUrl || undefined }}
          style={[themedStyles(theme).avatar1, { marginLeft: index > 0 ? -15 : 0 }]}
          contentFit="cover"
          placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdkI' }}
        />
      ))}
      {users.length > 3 && (
        <View style={themedStyles(theme).additionalUsers}>
          <Text style={themedStyles(theme).additionalUsersText}>
            +{users.length - 3}
          </Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

const PostHeader = ({ theme, profileUrl, userName, designation, taggedUsers, onTaggedPress, children }) => (
  <View style={themedStyles(theme).header}>
    <TouchableOpacity>
      <Image
        source={{ uri: profileUrl || undefined }}
        style={themedStyles(theme).avatar}
        contentFit="cover"
        placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdkI' }}
      />
    </TouchableOpacity>
    <View style={themedStyles(theme).userInfo}>
      <TouchableOpacity>
        <Text style={themedStyles(theme).username}>
          {userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : ''}
        </Text>
      </TouchableOpacity>
      <Text style={themedStyles(theme).timestamp}>{designation}</Text>
      {taggedUsers?.length > 0 && (
        <View style={themedStyles(theme).taggedUsersContainer}>
          <TaggedUsersRow users={taggedUsers} theme={theme} onPress={onTaggedPress} />
        </View>
      )}
    </View>
    {children}
  </View>
);

const VideoItem = ({ uri, isActive, ratioValue, theme, muted, onPress }) => {
  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = true;
    p.muted = muted;
  });

  React.useEffect(() => {
    isActive ? player.play() : player.pause();
  }, [isActive, player]);

  return (
    <TouchableOpacity activeOpacity={0.95} onPress={onPress}>
      <View style={[themedStyles(theme).imageContainer, { height: (width - 66) * ratioValue }]}>
        <VideoView player={player} style={StyleSheet.absoluteFillObject} contentFit="cover" nativeControls={false} />
        <View style={themedStyles(theme).playIconOverlay}>
          <View style={themedStyles(theme).playIconCircle}>
            <Play size={24} color="#fff" fill="#fff" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MediaHashtagsOverlay = ({ theme, hashtagsDisplay }) => (
  <View style={themedStyles(theme).mediaHashtagsOverlay}>{hashtagsDisplay}</View>
);

const PostMedia = ({
  post,
  theme,
  images,
  currentIndex,
  handleMediaPress,
  imageLoading,
  setImageLoading,
  viewabilityConfigCallbackPairs,
  hashtagsDisplay,
}) => {
  const ratioValue = post?.ratioValue || 1;

  const renderItem = useCallback(
    ({ item, index }) => {
      const isActive = currentIndex === index;

      if (item.type === 'video') {
        return (
          <VideoItem
            uri={item.uri}
            isActive={isActive}
            ratioValue={ratioValue}
            theme={theme}
            muted={true}
            onPress={() => handleMediaPress(index)}
          />
        );
      }

      return (
        <TouchableOpacity onPress={() => handleMediaPress(index)}>
          <View style={[themedStyles(theme).imageContainer, { height: (width - 66) * ratioValue }]}>
            {imageLoading[item.uri] && (
              <ActivityIndicator style={StyleSheet.absoluteFill} size="small" color={Colors.lightGreen} />
            )}
            <Image
              style={{ width: '100%', height: '100%' }}
              source={{ uri: item.uri }}
              contentFit="cover"
              placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdkI' }}
              onLoadStart={() => setImageLoading((prev) => ({ ...prev, [item.uri]: true }))}
              onLoad={() => setImageLoading((prev) => ({ ...prev, [item.uri]: false }))}
            />
          </View>
        </TouchableOpacity>
      );
    },
    [currentIndex, theme, handleMediaPress, imageLoading, setImageLoading, ratioValue]
  );

  return (
    <View style={{ position: 'relative' }}>
      <FlashList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        estimatedItemSize={width}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
      />
      <MediaHashtagsOverlay theme={theme} hashtagsDisplay={hashtagsDisplay} />
    </View>
  );
};

const PostContent = ({
  theme,
  post,
  expandedIndex,
  index,
  toggleExpand,
  hashtagsDisplay,
  images,
  currentIndex,
  fullLines,
  setFullLines,
}) => {
  const { i18n } = useTranslation();
  const hasMedia = images.length > 0;
  const needsTruncation = hasMedia && fullLines > 1;
  const isExpanded = expandedIndex === index;

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
        <Text numberOfLines={hasMedia && !isExpanded && needsTruncation ? 1 : undefined} style={themedStyles(theme).content}>
          {post.caption}
        </Text>
        <Text
          style={{ position: 'absolute', opacity: 0, width: '100%' }}
          onTextLayout={(e) => setFullLines(e.nativeEvent.lines.length)}
        >
          {post.caption}
        </Text>
        {hasMedia && needsTruncation && (
          <TouchableOpacity onPress={() => toggleExpand(index)} style={themedStyles(theme).toggleButton}>
            <Text style={themedStyles(theme).toggleText}>{isExpanded ? 'See less' : 'See more'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {post.createdAt && (
        <Text style={themedStyles(theme).postTimestamp}>
          <ReactTimeAgo
            date={post.createdTime ? new Date(Number(post.createdTime)) : new Date(post.createdAt)}
            locale={i18n.language}
            component={Text}
            timeStyle="short"
          />
        </Text>
      )}
      {!hasMedia && hashtagsDisplay}
    </View>
  );
};

const PostFooter = ({
  theme,
  post,
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
        <TouchableOpacity onPress={openLikesSheet} style={{ marginLeft: 6 }}>
          <Text style={themedStyles(theme).buttonText}>{likesCount}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
    <TouchableOpacity style={themedStyles(theme).button} onPress={openCommentSheet}>
      <MessageCircle size={22} color={theme.iconColor} strokeWidth={1.7} />
      {post.totalComments > 0 && <Text style={themedStyles(theme).buttonText}>{post.totalComments}</Text>}
    </TouchableOpacity>
    <View style={themedStyles(theme).button}>
      <TrendingUp size={22} color={theme.iconColor} strokeWidth={1.7} />
      {post.viewCount > 0 && <Text style={themedStyles(theme).buttonText}>{post.viewCount}</Text>}
    </View>
  </View>
);

const MediaBasedPost = ({ post, index }) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { t } = useTranslation();
  const router = useRouter();
  const [showPopover, setShowPopover] = useState(false);

  const [yourActivity, setYourActivity] = useState(false);

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const stored = await AsyncStorage.getItem('userDetails');
        if (!stored) return setYourActivity(false);
        const currentUser = JSON.parse(stored);
        const postOwnerId = post.userDetails?.id;
        setYourActivity(postOwnerId && currentUser?.id === postOwnerId);
      } catch (err) {
        setYourActivity(false);
      }
    };
    checkOwnership();
  }, [post.userDetails?.id]);

  const [postState, setPostState] = useState({
    isLiked: post.isLiked || false,
    likesCount: post.totalLike || 0,
    currentIndex: 0,
    expandedIndex: null,
    imageLoading: {},
    isLikeLoading: false,
    fullLines: 0,
  });

  const [likesSheetVisible, setLikesSheetVisible] = useState(false);
  const [taggedSheetVisible, setTaggedSheetVisible] = useState(false);

  const images = useMemo(() => (post.imageUrls || []).map((uri) => ({ uri, type: isVideo(uri) ? 'video' : 'image' })), [post.imageUrls]);

  const hasMedia = images.length > 0;
  const shipName = post.userDetails?.ship?.shipName || post.userDetails?.associatedShip?.shipName;
  const isBuddyUpEvent = !!post.groupActivityId;
  const likedUsers = useMemo(() => post.likeUser || [], [post.likeUser]);
  const taggedUsers = useMemo(() => post.taggedUsers || [], [post.taggedUsers]);

  const handleMediaPress = useCallback((selectedIndex) => {
    router.push({
      pathname: '/fullscreenmediapreview',
      params: { media: JSON.stringify(images), index: selectedIndex },
    });
  }, [images]);

  const handleLikeToggle = useCallback(() => {
    if (postState.isLikeLoading) return;
    setPostState((prev) => ({
      ...prev,
      isLiked: !prev.isLiked,
      likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
      isLikeLoading: true,
    }));
    setTimeout(() => setPostState((prev) => ({ ...prev, isLikeLoading: false })), 500);
  }, [postState.isLikeLoading]);

  const toggleExpand = useCallback((i) => {
    setPostState((prev) => ({ ...prev, expandedIndex: prev.expandedIndex === i ? null : i }));
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setPostState((prev) => ({ ...prev, currentIndex: viewableItems[0].index || 0 }));
    }
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig: { viewAreaCoveragePercentThreshold: 50 }, onViewableItemsChanged },
  ]);

  const openLikesSheet = () => setLikesSheetVisible(true);
  const closeLikesSheet = () => setLikesSheetVisible(false);
  const openTaggedSheet = () => setTaggedSheetVisible(true);
  const closeTaggedSheet = () => setTaggedSheetVisible(false);

  const hashtagsDisplay = useMemo(
    () => (
      <View style={themedStyles(theme).hashtagsContainer}>
        {isBuddyUpEvent && (
          <View style={[themedStyles(theme).tag, { backgroundColor: theme.tagBg }]}>
            <Text style={[themedStyles(theme).tagText, { color: '#06361F' }]}>{t('buddyupevents')}</Text>
          </View>
        )}
        {shipName && (
          <View style={[themedStyles(theme).tag, { backgroundColor: theme.tagSecondaryBg }]}>
            <Text style={[themedStyles(theme).tagText, { color: theme.tagText }]}>{shipName}</Text>
          </View>
        )}
        {post.hashtags?.slice(0, 2).map((h, i) => (
          <View key={i} style={[themedStyles(theme).tag, { backgroundColor: theme.tagBg }]}>
            <Text style={[themedStyles(theme).tagText, { color: '#06361F' }]}>
              {h ? h.charAt(0).toUpperCase() + h.slice(1) : ''}
            </Text>
          </View>
        ))}
      </View>
    ),
    [isBuddyUpEvent, shipName, post.hashtags, theme, t]
  );

  return (
    <>
      <View style={themedStyles(theme).ListContainer}>
        <PostHeader
          theme={theme}
          profileUrl={post.userDetails.profileUrl}
          userName={post.userDetails.fullName}
          designation={post.userDetails.designation}
          taggedUsers={taggedUsers}
          onTaggedPress={openTaggedSheet}
        >
          <Popover
            isVisible={showPopover}
            onRequestClose={() => setShowPopover(false)}
            from={
              <TouchableOpacity onPress={() => setShowPopover(true)}>
                <View style={themedStyles(theme).menuButton}>
                  <MoreVertical size={20} color={theme.iconColor} strokeWidth={1.7} />
                </View>
              </TouchableOpacity>
            }
            popoverStyle={{
              backgroundColor: theme.cardBackground,
              borderRadius: 12,
              paddingVertical: 8,
              minWidth: 140,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 10,
            }}
            placement="bottom"
          >
            <View>
              {yourActivity ? (
                <>
                  <TouchableOpacity
                    style={themedStyles(theme).menuRow}
                    onPress={() => {
                      setShowPopover(false);
                      console.log('EDIT PRESSED - Post ID:', post.id);
                    }}
                  >
                    <Pencil size={20} color={theme.textPrimary} strokeWidth={1.5} />
                    <Text style={themedStyles(theme).menuText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={themedStyles(theme).menuRow}
                    onPress={() => {
                      setShowPopover(false);
                      console.log('DELETE PRESSED - Post ID:', post.id);
                    }}
                  >
                    <Trash size={18} color={theme.deleteColor} strokeWidth={1.7} />
                    <Text style={[themedStyles(theme).menuText, { color: theme.deleteColor }]}>Delete</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={themedStyles(theme).menuRow}
                  onPress={() => {
                    setShowPopover(false);
                    console.log('REPORT PRESSED - Post ID:', post.id);
                  }}
                >
                  <AlertTriangle size={20} color={theme.deleteColor} strokeWidth={1.7} />
                  <Text style={[themedStyles(theme).menuText, { color: theme.deleteColor }]}>Report</Text>
                </TouchableOpacity>
              )}
            </View>
          </Popover>
        </PostHeader>

        {hasMedia && (
          <PostMedia
            post={post}
            theme={theme}
            images={images}
            currentIndex={postState.currentIndex}
            handleMediaPress={handleMediaPress}
            imageLoading={postState.imageLoading}
            setImageLoading={(fn) =>
              setPostState((prev) => ({
                ...prev,
                imageLoading: typeof fn === 'function' ? fn(prev.imageLoading) : fn,
              }))
            }
            viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
            hashtagsDisplay={hashtagsDisplay}
          />
        )}

        <PostContent
          theme={theme}
          post={post}
          expandedIndex={postState.expandedIndex}
          index={index}
          toggleExpand={toggleExpand}
          hashtagsDisplay={hashtagsDisplay}
          images={images}
          currentIndex={postState.currentIndex}
          fullLines={postState.fullLines}
          setFullLines={(l) => setPostState((prev) => ({ ...prev, fullLines: l }))}
        />

        <PostFooter
          theme={theme}
          post={post}
          isLiked={postState.isLiked}
          likesCount={postState.likesCount}
          handleLikeToggle={handleLikeToggle}
          isLikeLoading={postState.isLikeLoading}
          openLikesSheet={openLikesSheet}
          openCommentSheet={() => console.log('Open comments')}
        />
      </View>

      <BottomSheet visible={likesSheetVisible} onClose={closeLikesSheet}>
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Likes</Text>
        </View>
        {likedUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No likes yet</Text>
          </View>
        ) : (
          <FlatList
            data={likedUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <UserItem user={item} theme={theme} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          />
        )}
      </BottomSheet>

      <BottomSheet visible={taggedSheetVisible} onClose={closeTaggedSheet}>
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Tagged Users</Text>
        </View>
        {taggedUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No tagged users</Text>
          </View>
        ) : (
          <FlatList
            data={taggedUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <UserItem user={item} theme={theme} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          />
        )}
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  sheetHeader: { borderBottomWidth: 1, borderBottomColor: '#f5f5f5', alignItems: 'center', marginBottom: 10 },
  sheetTitle: { padding: 16, fontSize: 15, fontFamily: 'Poppins-SemiBold' },
  userItemContainer: { width: '100%', flexDirection: 'row', alignItems: 'center', marginVertical: 5, padding: 5, borderRadius: 10, backgroundColor: '#f5f5f5' },
  userAvatar: { width: 40, height: 40, borderRadius: 28, backgroundColor: '#f5f5f5', marginHorizontal: 10 },
  userInfo: { flex: 1 },
  userName: { fontSize: 14, fontFamily: 'Poppins-Regular' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, fontFamily: 'Poppins-Regular' },
});

const themedStyles = (theme) =>
  StyleSheet.create({
    ListContainer: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      marginHorizontal: 10,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.border,
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.avatarBg, marginRight: 12 },
    userInfo: { flex: 1 },
    username: { fontSize: 14, fontWeight: '600', color: theme.textPrimary, fontFamily: 'Poppins-SemiBold' },
    timestamp: { fontSize: 12, color: theme.textTertiary, fontFamily: 'Poppins-Regular' },
    imageContainer: { overflow: 'hidden', borderRadius: 8, width: width - 66, borderWidth: 1, borderColor: theme.border },
    playIconOverlay: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -30 }, { translateY: -30 }], zIndex: 10 },
    playIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    contentContainer: { marginBottom: 2 },
    captionContainer: { marginBottom: 5 },
    content: { fontSize: 15, color: theme.contentTextColor, lineHeight: 22, fontFamily: 'Poppins-Regular', marginTop: 10 },
    toggleButton: { alignSelf: 'flex-start' },
    toggleText: { color: theme.likeColor, fontWeight: '600', fontSize: 15 },
    postTimestamp: { fontSize: 11, color: theme.textTertiary, marginBottom: 5 },
    hashtagsContainer: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginBottom: 5 },
    tag: { borderRadius: 50, paddingHorizontal: 12, paddingVertical: 5 },
    tagText: { fontSize: 9, textTransform: 'capitalize' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12, alignItems: 'center' },
    button: { flexDirection: 'row', alignItems: 'center' },
    buttonText: { fontSize: 14, color: theme.iconColor, marginLeft: 4 },
    menuButton: { backgroundColor: theme.menuButtonBg, height: 36, width: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
    taggedUsersContainer: { height: 30, marginTop: 3 },
    avatarRow: { flexDirection: 'row', alignItems: 'center' },
    avatar1: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: theme.border },
    additionalUsers: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.additionalUsersBg, justifyContent: 'center', alignItems: 'center', marginLeft: -15 },
    additionalUsersText: { fontSize: 12, color: theme.textSecondary, fontWeight: '600' },
    pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
    menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20 },
    menuText: { marginLeft: 10, fontSize: 12, fontFamily: 'Poppins-SemiBold', color: theme.textPrimary },
    mediaHashtagsOverlay: { position: 'absolute', bottom: 10, left: 10, right: 0, zIndex: 10, pointerEvents: 'none' },
  });

export default MediaBasedPost;