import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Heart,
  MessageCircle,
  TrendingUp,
  EllipsisVertical,
  Play,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import ReactTimeAgo from 'react-time-ago';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import { VideoView, useVideoPlayer } from 'expo-video';
import Colors from '../utils/Colors';

const { width } = Dimensions.get('window');

// Helper function to check if URI is a video
const isVideo = (uri: string) => uri?.match(/\.(mp4|mov|avi|m4v)$/i);

// Custom Time component wrapper for ReactTimeAgo
interface TimeProps {
  date?: Date | number | string;
  verboseDate?: boolean;
  tooltip?: boolean;
  children?: React.ReactNode;
  [key: string]: any;
}

const Time: React.FC<TimeProps> = ({ date, verboseDate, tooltip, children, ...rest }) => {
  return <Text {...rest}>{children}</Text>;
};

interface TaggedUser {
  id: string;
  fullName: string;
  profileUrl: string;
}

interface HangoutPost {
  id: string;
  imageUrls: string[];
  caption: string;
  hashtags: string[];
  totalLike: number;
  totalComments: number;
  viewCount: number;
  createdAt: string | number | Date;
  createdTime?: string | number;
  userDetails: {
    fullName: string;
    designation: string;
    profileUrl: string;
    ship?: { shipName: string };
    associatedShip?: { shipName: string };
  };
  taggedUsers: TaggedUser[];
  isLiked: boolean;
  groupActivityId?: string | null;
}

const TaggedUsersRow: React.FC<{ users: TaggedUser[] }> = ({ users }) => (
  <View style={styles.taggedRow}>
    {users.slice(0, 3).map((user, i) => (
      <Image
        key={user.id}
        source={{ uri: user.profileUrl }}
        style={[styles.taggedAvatar, i > 0 && styles.overlap]}
        placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdkI' }}
      />
    ))}
    {users.length > 3 && (
      <View style={[styles.moreTagged, styles.overlap]}>
        <Text style={styles.moreText}>+{users.length - 3}</Text>
      </View>
    )}
  </View>
);

const PostHeader: React.FC<{
  profileUrl: string;
  userName: string;
  designation: string;
  taggedUsers: TaggedUser[];
}> = ({ profileUrl, userName, designation, taggedUsers }) => {
  return (
    <View style={styles.headerOverlay}>
      <View style={styles.headerLeft}>
        <Image
          source={{ uri: profileUrl }}
          style={styles.profileImage}
          placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdkI' }}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userDesignation}>{designation}</Text>
          {taggedUsers.length > 0 && <TaggedUsersRow users={taggedUsers} />}
        </View>
      </View>
      <TouchableOpacity style={styles.menuBtn}>
        <EllipsisVertical size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const TagsRow: React.FC<{
  isBuddyUpEvent?: boolean;
  shipName?: string;
  hashtags?: string[];
}> = ({ isBuddyUpEvent, shipName, hashtags = [] }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.tagsRow}>
      {isBuddyUpEvent && (
        <View style={[styles.tagChip, { backgroundColor: '#FBCF21' }]}>
          <Text style={styles.tagText}>{t('buddyupevents')}</Text>
        </View>
      )}
      {shipName && (
        <View style={[styles.tagChip, { backgroundColor: Colors.lightGreen }]}>
          <Text style={styles.tagText}>{shipName}</Text>
        </View>
      )}
      {hashtags.map((tag, i) => (
        <View key={i} style={[styles.tagChip, { backgroundColor: '#FBCF21' }]}>
          <Text style={[styles.tagText, { color: '#06361F' }]}>{tag}</Text>
        </View>
      ))}
    </View>
  );
};

// Video Item Component - separated to use hooks properly
const VideoItem: React.FC<{ 
  uri: string; 
  isActive: boolean; 
  onLoadStart: () => void; 
  onLoad: () => void;
  isLoading: boolean;
}> = ({ uri, isActive, onLoadStart, onLoad, isLoading }) => {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = true;
  });

  React.useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  return (
    <View style={styles.mediaContainer}>
      <VideoView
        player={player}
        style={styles.postImage}
        contentFit="cover"
        nativeControls={false}
      />
      
      {/* Loading indicator for video */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
      
      {/* Play icon overlay */}
      <View style={styles.playIconOverlay}>
        <View style={styles.playIconCircle}>
          <Play size={24} color="#fff" fill="#fff" />
        </View>
      </View>
    </View>
  );
};

const MediaBasedPost: React.FC<{ post: HangoutPost }> = ({ post }) => {
  const { t, i18n } = useTranslation();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.totalLike);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsSeeMore, setNeedsSeeMore] = useState(false);
  const [videoLoading, setVideoLoading] = useState<{ [key: string]: boolean }>({});

  const shipName = post.userDetails.ship?.shipName || post.userDetails.associatedShip?.shipName;
  const isBuddyUpEvent = !!post.groupActivityId;

  const toggleLike = () => {
    setIsLiked(prev => !prev);
    setLikesCount(prev => (isLiked ? prev - 1 : prev + 1));
  };

  const measureCaptionLines = (e: any) => {
    const lines = e.nativeEvent.lines.length;
    if (lines > 1 && !needsSeeMore) {
      setNeedsSeeMore(true);
    }
  };

  const handleScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (width - 20));
    setCurrentImageIndex(index);
  };

  const renderMediaItem = ({ item, index }: { item: string; index: number }) => {
    const isVideoFile = isVideo(item);

    if (isVideoFile) {
      return (
        <VideoItem
          uri={item}
          isActive={currentImageIndex === index}
          onLoadStart={() => setVideoLoading(prev => ({ ...prev, [item]: true }))}
          onLoad={() => setVideoLoading(prev => ({ ...prev, [item]: false }))}
          isLoading={videoLoading[item] || false}
        />
      );
    }

    // Render image
    return (
      <Image
        source={{ uri: item }}
        style={styles.postImage}
        contentFit="cover"
        placeholder={{ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdkI' }}
        transition={300}
      />
    );
  };

  return (
    <View style={styles.cardContainer}>
      {/* Media */}
      <View style={styles.mediaWrapper}>
        <FlatList
          data={post.imageUrls}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          onMomentumScrollEnd={handleScroll}
          renderItem={renderMediaItem}
        />

        {/* Pagination Dots */}
        {post.imageUrls.length > 1 && (
          <View style={styles.pagination}>
            {post.imageUrls.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  { backgroundColor: i === currentImageIndex ? '#8DAF02' : '#ccc' },
                ]}
              />
            ))}
          </View>
        )}

        {/* Header Overlay */}
        <PostHeader
          profileUrl={post.userDetails.profileUrl}
          userName={post.userDetails.fullName}
          designation={post.userDetails.designation}
          taggedUsers={post.taggedUsers}
        />
      </View>

      {/* Content Below */}
      <View style={styles.contentContainer}>
        {/* Time Display - Same as HomeHangoutCardPost */}
        {post.createdAt && (
          <Text style={styles.timeText}>
            <ReactTimeAgo
              date={post?.createdTime ? new Date(Number(post.createdTime)) : new Date(post.createdAt)}
              locale={i18n.language}
              component={Time}
              timeStyle="short"
            />
          </Text>
        )}

        <TagsRow
          isBuddyUpEvent={isBuddyUpEvent}
          shipName={shipName}
          hashtags={post.hashtags}
        />

        {/* Caption with See More */}
        <View style={styles.captionWrapper}>
          <Text style={styles.caption} numberOfLines={isExpanded ? undefined : 1}>
            {post.caption}
          </Text>

          <Text
            style={[styles.caption, { position: 'absolute', opacity: 0, height: 0 }]}
            onTextLayout={measureCaptionLines}
          >
            {post.caption}
          </Text>

          {needsSeeMore && (
            <Text
              style={styles.seeMoreText}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? t('seeless') : t('seemore')}
            </Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={toggleLike}>
            <Heart
              size={24}
              color={isLiked ? '#8DAF02' : '#000'}
              fill={isLiked ? '#8DAF02' : 'none'}
              strokeWidth={1.7}
            />
            <Text style={styles.countText}>{likesCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <MessageCircle size={24} color="#000" strokeWidth={1.7} />
            <Text style={styles.countText}>{post.totalComments}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <TrendingUp size={24} color="#000" strokeWidth={1.7} />
            <Text style={styles.countText}>{post.viewCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    margin: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 4,
    marginBottom: 10,
  },
  mediaWrapper: { height: 420, position: 'relative' },
  mediaContainer: {
    width: width - 20,
    height: 420,
    position: 'relative',
  },
  postImage: { width: width - 20, height: 420 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playIconOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  headerOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  profileImage: {
    width: 46,
    height: 46,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  userInfo: { marginLeft: 12, flex: 1 },
  userName: { fontSize: 15, fontFamily: 'Poppins-SemiBold', color: '#fff' },
  userDesignation: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#fff' },
  taggedRow: { flexDirection: 'row', marginTop: 4 },
  taggedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  overlap: { marginLeft: -12 },
  moreTagged: {
    width: 32,
    height: 32,
    borderRadius: 50,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: { color: '#fff', fontSize: 12, fontFamily: 'Poppins-SemiBold' },
  menuBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 10 },
  contentContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  timeText: { fontSize: 10, color: '#666', fontFamily: 'Poppins-Regular' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  tagChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  tagText: { fontSize: 9, color: '#000', fontFamily: 'Poppins-Medium' },
  captionWrapper: { position: 'relative' },
  caption: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000',
    lineHeight: 20,
    marginTop: 4,
  },
  seeMoreText: {
    color: '#8DAF02',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    marginTop: 6,
  },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  countText: { fontSize: 15, color: '#000', fontFamily: 'Poppins-Medium' },
});

export default MediaBasedPost;