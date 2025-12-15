import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import Video from 'react-native-video';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { showToast } from '@/src/components/GlobalToast';

const { width } = Dimensions.get('window');

interface FrameOption {
  id: number;
  label: string;
  ratio: number;
}

const frameOptions: FrameOption[] = [
  { id: 1, label: 'Landscape', ratio: 0.75 },
  { id: 2, label: 'Square', ratio: 1 },
  { id: 3, label: 'Portrait', ratio: 1.25 },
  { id: 4, label: 'Full', ratio: 1.5 },
];

interface MediaItem {
  uri?: string;
  url?: string;
  type?: string;
}

interface TaggedUser {
  id: number | string;
  fullName: string;
  profileUrl?: string;
}

interface RouteParams {
  mediaFiles?: (string | MediaItem)[];
  caption?: string;
  taggedUsers?: TaggedUser[];
  hashtags?: string[];
  postId?: string | number;
}

const PreviewPostScreen: React.FC = () => {
  const route = useRoute<any>(); // For stricter typing, define a proper route prop type if possible
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [frame, setFrame] = useState<FrameOption>(frameOptions[1]);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const {
    mediaFiles = [],
    caption = '',
    taggedUsers = [],
    hashtags = [],
    postId,
  }: RouteParams = route.params || {};


//   const handleShare = async () => {
//     if (loading) return;
//     setLoading(true);

//     try {
//       const userDataStr = await AsyncStorage.getItem('userDetails');
//       if (!userDataStr) throw new Error('No user data');
//       const userData = JSON.parse(userDataStr);
//       const authToken = userData.authToken;

//       const finalMediaUrls: string[] = mediaFiles.map((item: string | MediaItem) =>
//         typeof item === 'string' ? item : item.url || item.uri || ''
//       );

//       const payload = postId
//         ? {
//             id: postId,
//             imageUrls: finalMediaUrls,
//             caption: caption.trim(),
//             tags: taggedUsers.map((u: TaggedUser) => u.id),
//             hashtags,
//             ratioValue: frame.ratio,
//             imageresizeMode: 'cover',
//           }
//         : {
//             hangouts: [
//               {
//                 imageUrls: finalMediaUrls,
//                 caption: caption.trim(),
//                 tags: taggedUsers.map((u: TaggedUser) => u.id),
//                 hashtags,
//                 ratioValue: frame.ratio,
//                 imageresizeMode: 'cover',
//                 createdAt: new Date().toISOString(),
//               },
//             ],
//           };

//       console.log(JSON.stringify(payload));

//       const res = await fetch(
//         postId
//           ? `${apiServerUrl}/user/updateHangoutPostById`
//           : `${apiServerUrl}/user/createHangoutPost`,
//         {
//           method: postId ? 'PUT' : 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             authToken,
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       const json = await res.json();
//       console.log(json);

//       if (json.responseCode === 200) {
//         showToast.success(postId ? t('postupdatedsuccessfully') : t('postcreatedsuccessfully'));
//         setTimeout(() => {
//           navigation.navigate('Home', {
//             screen: 'SeaBuddy',
//             params: { name: 'hangout', refresh: true },
//           });
//         }, 1000);
//       } else {
//         throw new Error(json.message || 'Failed');
//       }
//     } catch (err) {
//       console.error('Post error:', err);
//       showToast.error(t('postFailed'));
//     } finally {
//       setLoading(false);
//     }
//   };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== activeIndex) setActiveIndex(index);
  };

  const renderMedia = ({ item }: { item: string | MediaItem }) => {
    const height = width * frame.ratio;
    const isVideo =
      typeof item === 'string'
        ? !!item.match(/\.(mp4|mov|avi)$/i)
        : item.type === 'video';
    const uri = typeof item === 'string' ? item : item.uri || '';

    return (
      <View style={{ width, height, backgroundColor: '#000' }}>
        {isVideo ? (
          <Video
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            repeat={true}
            muted={true}
          />
        ) : (
          <Image
            source={{ uri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {mediaFiles.length > 0 && (
          <>
            <FlatList
              data={mediaFiles}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={renderMedia}
              keyExtractor={(item, i) =>
                typeof item === 'string'
                  ? `${item}-${i}`
                  : `${(item as MediaItem).uri}-${i}`
              }
              onScroll={onScroll}
              scrollEventThrottle={16}
            />

            <View style={styles.counterContainer}>
              <Text style={styles.counterText}>
                {activeIndex + 1}/{mediaFiles.length}
              </Text>
            </View>

            {mediaFiles.length > 1 && (
              <View style={styles.dotsContainer}>
                {mediaFiles.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          i === activeIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        )}

        <View style={styles.frameContainer}>
          {frameOptions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.frameButton,
                frame.id === item.id && styles.activeFrame,
              ]}
              onPress={() => setFrame(item)}
            >
              <Text
                style={[
                  styles.frameText,
                  frame.id === item.id && styles.activeText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {caption ? (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{caption}</Text>
          </View>
        ) : null}

        {taggedUsers.length > 0 && (
          <View style={styles.taggedContainer}>
            <Text style={styles.sectionLabel}>{t('with') || 'With'}:</Text>
            <View style={styles.taggedRow}>
              {taggedUsers.map((u, i) => (
                <View key={i} style={styles.taggedUser}>
                  <Image
                    source={{
                      uri:
                        u.profileUrl ||
                        'https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg',
                    }}
                    style={styles.taggedAvatar}
                  />
                  <Text style={styles.taggedName}>{u.fullName}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {hashtags.length > 0 && (
          <View style={styles.hashtagContainer}>
            {hashtags.map((tag, i) => (
              <Text key={i} style={styles.hashtag}>
                {tag}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.shareButton}
        //   onPress={handleShare}
          disabled={loading}
        >
          <Text style={styles.shareButtonText}>
            {postId ? t('update') || 'Update Post' : t('share') || 'Share Post'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    elevation: 5,
  },
  headerTitle: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  counterContainer: {
    position: 'absolute',
    top: 15,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  frameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  frameButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  activeFrame: {
    backgroundColor: '#02130B',
  },
  frameText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  activeText: {
    color: '#fff',
  },
  captionContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  captionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  taggedContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  taggedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taggedUser: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  taggedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  taggedName: {
    fontSize: 13,
    color: '#333',
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  hashtag: {
    color: '#1DA1F2',
    marginRight: 10,
    fontSize: 14,
  },
  bottomButtonContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderColor: '#ddd',
  },
  shareButton: {
    backgroundColor: '#02130B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PreviewPostScreen;