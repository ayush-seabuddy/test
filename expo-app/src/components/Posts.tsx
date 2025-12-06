import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  View,
  StyleSheet,
  Text,
  FlatList,
} from 'react-native';
import { getallposts } from '../apis/apiService';
import { showToast } from './GlobalToast';
import { useTranslation } from 'react-i18next';
import Colors from '../utils/Colors';
import PostScreen from './PostScreen';
import { Image } from 'expo-image';
import { ImagesAssets } from '../utils/ImageAssets';

export interface Post {
  id: string | number;
  caption?: string;
  imageUrls?: string[];
  images?: string[];
  userDetails: {
    id: string | number;
    fullName?: string;
    profileUrl?: string;
    designation?: string;
    ship?: { shipName?: string };
    associatedShip?: { shipName?: string };
  };
  totalLike?: number;
  isLiked?: boolean;
  totalComments?: number;
  viewCount?: number;
  createdTime?: string | number;
  createdAt?: string;
  likeUser?: any[];
  taggedUsers?: any[];
  hashtags?: string[];
  groupActivityId?: string | number;
  ratioValue?: number;
  [key: string]: any;
}

const Posts: React.FC = () => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingMore = useRef(false);

  const limit = 10;

  const handlePostDeleted = useCallback((deletedId: string | number) => {
    setPosts(prev => prev.filter(p => p.id !== deletedId));
  }, []);

  const fetchPosts = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (isFetchingMore.current && !isRefresh) return;
    if (!hasMore && !isRefresh) return;

    isFetchingMore.current = true;

    if (!isRefresh) setLoading(pageNum === 1);
    else setRefreshing(true);

    try {
      const response = await getallposts({ page: pageNum, limit });
      if (response.success) {
        const newPosts: Post[] = response.data.hangoutsList || [];

        setPosts(prev => {
          if (isRefresh || pageNum === 1) return newPosts;

          const existingIds = new Set(prev.map(p => p.id));
          const filtered = newPosts.filter(p => !existingIds.has(p.id));
          return [...prev, ...filtered];
        });

        setHasMore(newPosts.length === limit);
        setPage(pageNum);
      } else {
        showToast.error(t('oops'), response.message);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      showToast.error(t('oops'), t('somethingwentwrong'));
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingMore.current = false;
    }
  }, [hasMore, limit, t]);

  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  const onRefresh = useCallback(() => {
    setHasMore(true);
    setPage(1);
    fetchPosts(1, true);
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore || isFetchingMore.current) return;
    fetchPosts(page + 1);
  }, [loading, hasMore, page, fetchPosts]);

  const renderItem = useCallback(
    ({ item, index }: { item: Post; index: number }) => {
      const normalizedPost: Post = {
        ...item,
        imageUrls: item.imageUrls || item.images || [],
      };
      return <PostScreen post={normalizedPost} index={index} onPostDeleted={handlePostDeleted} />;
    },
    [handlePostDeleted]
  );

  const keyExtractor = useCallback((item: Post) => item.id.toString(), []);

  const ListFooter = () => {
    if (!loading || posts.length === 0) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.lightGreen} />
      </View>
    );
  };

  const ListEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <Image source={ImagesAssets.nodatafound} style={styles.nodatafoundImage} />
        <Text style={styles.emptyText}>{t('nopostfound') || 'No posts yet'}</Text>
      </View>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="small" color={Colors.lightGreen} />
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={loadMore}
      onEndReachedThreshold={0.8} 
      ListFooterComponent={ListFooter}
      ListEmptyComponent={ListEmpty}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#8DAF02']}
          tintColor={Colors.lightGreen}
        />
      }
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={21}
      initialNumToRender={10}
      contentContainerStyle={posts.length === 0 ? styles.emptyContainer : undefined}
    />
  );
};

const styles = StyleSheet.create({
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  footerLoader: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
    gap: 20,
  },
  nodatafoundImage: {
    width: 150,
    height: 150,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
});

export default React.memo(Posts);