// src/components/TextBasedPost.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  useColorScheme,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Heart,
  MessageCircle,
  TrendingUp,
  MoreVertical,
  Trash,
  AlertTriangle,
  Pencil,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import ReactTimeAgo from 'react-time-ago';
import Colors from '../utils/Colors';
import { useRouter } from 'expo-router';
import BottomSheet from './BottomSheet';           // ← your custom BottomSheet
import Popover from 'react-native-popover-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

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

const TextBasedPost = ({ post, index = 0 }) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { t } = useTranslation();
  const router = useRouter();

  const [showPopover, setShowPopover] = useState(false);
  const [yourActivity, setYourActivity] = useState(false);
  const [likesSheetVisible, setLikesSheetVisible] = useState(false);
  const [taggedSheetVisible, setTaggedSheetVisible] = useState(false);

  const [postState, setPostState] = useState({
    isLiked: post.isLiked || false,
    likesCount: post.totalLike || 0,
    isLikeLoading: false,
  });

  // Check if current user owns the post
  useEffect(() => {
    const checkOwnership = async () => {
      try {
        const stored = await AsyncStorage.getItem('userDetails');
        if (!stored) return setYourActivity(false);
        const currentUser = JSON.parse(stored);
        const postOwnerId = post.userDetails?.id;
        setYourActivity(postOwnerId && currentUser?.id === postOwnerId);
      } catch {
        setYourActivity(false);
      }
    };
    checkOwnership();
  }, [post.userDetails?.id]);

  const shipName = post.userDetails?.ship?.shipName || post.userDetails?.associatedShip?.shipName;
  const isBuddyUpEvent = !!post.groupActivityId;
  const likedUsers = useMemo(() => post.likeUser || [], [post.likeUser]);
  const taggedUsers = useMemo(() => post.taggedUsers || [], [post.taggedUsers]);

  const handleLikeToggle = useCallback(() => {
    if (postState.isLikeLoading) return;
    setPostState(prev => ({
      ...prev,
      isLiked: !prev.isLiked,
      likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
      isLikeLoading: true,
    }));
    setTimeout(() => setPostState(prev => ({ ...prev, isLikeLoading: false })), 600);
  }, [postState.isLikeLoading]);

  const hashtagsDisplay = useMemo(
    () => (
      <View style={themedStyles(theme).hashtagsContainer}>
        {isBuddyUpEvent && (
          <View style={[themedStyles(theme).tag, { backgroundColor: theme.tagBg }]}>
            <Text style={[themedStyles(theme).tagText, { color: '#06361F' }]}>
              {t('buddyupevents')}
            </Text>
          </View>
        )}
        {shipName && (
          <View style={[themedStyles(theme).tag, { backgroundColor: theme.tagSecondaryBg }]}>
            <Text style={[themedStyles(theme).tagText, { color: theme.tagText }]}>
              {shipName}
            </Text>
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
        {/* HEADER + POPOVER */}
        <View style={themedStyles(theme).header}>
          <TouchableOpacity>
            <Image
              source={{ uri: post.userDetails.profileUrl }}
              style={themedStyles(theme).avatar}
              contentFit="cover"
              placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdkI' }}
            />
          </TouchableOpacity>

          <View style={themedStyles(theme).userInfo}>
            <TouchableOpacity>
              <Text style={themedStyles(theme).username}>
                {post.userDetails.fullName
                  ? post.userDetails.fullName.charAt(0).toUpperCase() + post.userDetails.fullName.slice(1)
                  : ''}
              </Text>
            </TouchableOpacity>
            <Text style={themedStyles(theme).timestamp}>{post.userDetails.designation}</Text>

            {taggedUsers.length > 0 && (
              <View style={themedStyles(theme).taggedUsersContainer}>
                <TouchableOpacity onPress={() => setTaggedSheetVisible(true)}>
                  <View style={themedStyles(theme).avatarRow}>
                    {taggedUsers.slice(0, 3).map((u, i) => (
                      <Image
                        key={u.id}
                        source={{ uri: u.profileUrl }}
                        style={[themedStyles(theme).avatar1, { marginLeft: i > 0 ? -15 : 0 }]}
                        contentFit="cover"
                        placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdkI' }}
                      />
                    ))}
                    {taggedUsers.length > 3 && (
                      <View style={themedStyles(theme).additionalUsers}>
                        <Text style={themedStyles(theme).additionalUsersText}>
                          +{taggedUsers.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Three-dot Popover */}
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
                      console.log('EDIT TEXT POST →', post.id);
                      // router.push(`/edit-post/${post.id}`);
                    }}
                  >
                    <Pencil size={20} color={theme.textPrimary} strokeWidth={1.5} />
                    <Text style={themedStyles(theme).menuText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={themedStyles(theme).menuRow}
                    onPress={() => {
                      setShowPopover(false);
                      console.log('DELETE TEXT POST →', post.id);
                      // show delete confirmation modal etc.
                    }}
                  >
                    <Trash size={18} color={theme.deleteColor} strokeWidth={1.7} />
                    <Text style={[themedStyles(theme).menuText, { color: theme.deleteColor }]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={themedStyles(theme).menuRow}
                  onPress={() => {
                    setShowPopover(false);
                    console.log('REPORT TEXT POST →', post.id);
                    // open report modal
                  }}
                >
                  <AlertTriangle size={20} color={theme.deleteColor} strokeWidth={1.7} />
                  <Text style={[themedStyles(theme).menuText, { color: theme.deleteColor }]}>
                    Report
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Popover>
        </View>

        {/* CONTENT */}
        <View style={themedStyles(theme).contentContainer}>
          <Text style={themedStyles(theme).content}>{post.caption}</Text>

          {post.createdAt && (
            <Text style={themedStyles(theme).postTimestamp}>
              <ReactTimeAgo
                date={post.createdTime ? new Date(Number(post.createdTime)) : new Date(post.createdAt)}
                locale={'en'}
                component={Text}
                timeStyle="short"
              />
            </Text>
          )}

          {hashtagsDisplay}
        </View>

        {/* FOOTER */}
        <View style={themedStyles(theme).footer}>
          <TouchableOpacity
            style={themedStyles(theme).button}
            onPress={handleLikeToggle}
            disabled={postState.isLikeLoading}
          >
            <Heart
              size={24}
              color={postState.isLiked ? theme.likeColor : theme.iconColor}
              fill={postState.isLiked ? theme.likeColor : 'none'}
              strokeWidth={1.7}
            />
            {postState.likesCount > 0 && (
              <TouchableOpacity onPress={() => setLikesSheetVisible(true)} style={{ marginLeft: 6 }}>
                <Text style={themedStyles(theme).buttonText}>{postState.likesCount}</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={themedStyles(theme).button}
            onPress={() => console.log('Open comments')}
          >
            <MessageCircle size={22} color={theme.iconColor} strokeWidth={1.7} />
            {post.totalComments > 0 && (
              <Text style={themedStyles(theme).buttonText}>{post.totalComments}</Text>
            )}
          </TouchableOpacity>

          <View style={themedStyles(theme).button}>
            <TrendingUp size={22} color={theme.iconColor} strokeWidth={1.7} />
            {post.viewCount > 0 && (
              <Text style={themedStyles(theme).buttonText}>{post.viewCount}</Text>
            )}
          </View>
        </View>
      </View>

      {/* LIKES BOTTOM SHEET */}
      <BottomSheet visible={likesSheetVisible} onClose={() => setLikesSheetVisible(false)}>
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
            keyExtractor={item => item.id}
            renderItem={({ item }) => <UserItem user={item} theme={theme} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          />
        )}
      </BottomSheet>

      {/* TAGGED USERS BOTTOM SHEET */}
      <BottomSheet visible={taggedSheetVisible} onClose={() => setTaggedSheetVisible(false)}>
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
            keyExtractor={item => item.id}
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
  userItemContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, marginVertical: 4, backgroundColor: "#f5f5f5", borderRadius: 12 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontSize: 14, fontFamily: 'Poppins-Regular' },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, fontFamily: 'Poppins-Regular' },
});

const themedStyles = (theme) => StyleSheet.create({
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
  contentContainer: { marginBottom: 10 },
  content: { fontSize: 15, color: theme.contentTextColor, lineHeight: 22, fontFamily: 'Poppins-Regular' },
  postTimestamp: { fontSize: 11, color: theme.textTertiary, marginTop: 8, marginBottom: 8 },
  hashtagsContainer: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 8 },
  tag: { borderRadius: 50, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { fontSize: 9, textTransform: 'capitalize' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 12,
    alignItems: 'center',
  },
  button: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { fontSize: 14, color: theme.iconColor, marginLeft: 6 },
  menuButton: { backgroundColor: theme.menuButtonBg, height: 36, width: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  taggedUsersContainer: { height: 34, marginTop: 4 },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatar1: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: theme.border },
  additionalUsers: { width: 30, height: 30, borderRadius: 15, backgroundColor: theme.additionalUsersBg, justifyContent: 'center', alignItems: 'center', marginLeft: -15 },
  additionalUsersText: { fontSize: 12, color: theme.textSecondary, fontWeight: '600' },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
  menuText: { marginLeft: 12, fontSize: 14, fontFamily: 'Poppins-SemiBold', color: theme.textPrimary },
});

export default TextBasedPost;