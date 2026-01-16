import { Image } from 'expo-image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { getallposts } from '../apis/apiService';
import Colors from '../utils/Colors';
import CommonLoader from './CommonLoader';
import { showToast } from './GlobalToast';
import PostScreen from './PostScreen';
import EmptyComponent from './EmptyComponent';
import { useNetwork } from '../hooks/useNetworkStatusHook';

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

interface PostsProps {
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

const Posts: React.FC<PostsProps> = ({ ListHeaderComponent }) => {
  const { t } = useTranslation();
  const isOnline = useNetwork();

  const [posts, setPosts] = useState<Post[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isFetchingMore = useRef(false);
  const limit = 10;

  const handlePostDeleted = useCallback((deletedId: string | number) => {
    setPosts(prev => prev.filter(p => p.id !== deletedId));
  }, []);

  const handlePostReported = useCallback((deletedId: string | number) => {
    setPosts(prev => prev.filter(p => p.id !== deletedId));
  }, []);

  const fetchPosts = useCallback(
    async (pageNum = 1, isRefresh = false) => {
      // 🚫 DO NOT CALL API WHEN OFFLINE
      if (!isOnline) {
        setInitialLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        return;
      }

      if (isFetchingMore.current && !isRefresh) return;
      if (!hasMore && !isRefresh) return;

      isFetchingMore.current = true;

      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setInitialLoading(true);
      } else {
        setLoadingMore(true);
      }

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
          showToast.error(t('oops'), response.message || t('somethingwentwrong'));
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        showToast.error(t('oops'), t('somethingwentwrong'));
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        isFetchingMore.current = false;
      }
    },
    [hasMore, isOnline, limit, t]
  );

  useEffect(() => {
    fetchPosts(1);
  }, [isOnline]);

  const onRefresh = useCallback(() => {
    if (!isOnline) return;
    setHasMore(true);
    setPage(1);
    fetchPosts(1, true);
  }, [fetchPosts, isOnline]);

  const loadMore = useCallback(() => {
    if (!isOnline) return;
    if (loadingMore || initialLoading || !hasMore || isFetchingMore.current)
      return;
    fetchPosts(page + 1);
  }, [loadingMore, initialLoading, hasMore, page, fetchPosts, isOnline]);

  const renderItem = useCallback(
    ({ item, index }: { item: Post; index: number }) => {
      const normalizedPost: Post = {
        ...item,
        imageUrls: item.imageUrls || item.images || [],
      };

      return (
        <PostScreen
          post={normalizedPost}
          index={index}
          onPostDeleted={handlePostDeleted}
          onPostReported={handlePostReported}
        />
      );
    },
    [handlePostDeleted, handlePostReported]
  );

  const ListFooter = () => {
    if (!loadingMore) return <View style={{ marginBottom: 120 }} />;
    return (
      <View style={styles.footerLoader}>
        <CommonLoader />
        <View style={{ marginBottom: 120 }} />
      </View>
    );
  };

  const ListEmpty = () => {
    if (initialLoading) return null;

    return (
      <View style={styles.emptyState}>
        <EmptyComponent
          text={
            !isOnline
              ? t('nointernetconnection')
              : t('youarenotpostedanything')
          }
        />
      </View>
    );
  };

  if (initialLoading && posts.length === 0 && isOnline) {
    return (
      <View style={styles.centerLoader}>
        <CommonLoader fullScreen />
      </View>
    );
  }

  return (
    <FlatList
      ListHeaderComponent={ListHeaderComponent}
      data={posts}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      onEndReached={loadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={ListFooter}
      ListEmptyComponent={ListEmpty}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          enabled={isOnline}
          colors={[Colors.darkGreen]}
          tintColor={Colors.darkGreen}
        />
      }
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      windowSize={3}
      initialNumToRender={2}
      maxToRenderPerBatch={2}
      updateCellsBatchingPeriod={50}
      contentContainerStyle={
        posts.length === 0 ? styles.emptyContainer : undefined
      }
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 100,
    gap: 20,
  },
});

export default React.memo(Posts);
