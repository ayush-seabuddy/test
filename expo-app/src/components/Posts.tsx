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
import CommonLoader from './CommonLoader';

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

  const fetchPosts = useCallback(async (pageNum = 1, isRefresh = false) => {
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
  }, [hasMore, limit, t]);

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const onRefresh = useCallback(() => {
    setHasMore(true);
    setPage(1);
    fetchPosts(1, true);
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (loadingMore || initialLoading || !hasMore || isFetchingMore.current) return;
    fetchPosts(page + 1);
  }, [loadingMore, initialLoading, hasMore, page, fetchPosts]);

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

  const keyExtractor = useCallback((item: Post) => item.id.toString(), []);

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
        <Image source={ImagesAssets.nodatafound} style={styles.nodatafoundImage} />
        <Text style={styles.emptyText}>{t('nopostfound') || 'No posts yet'}</Text>
      </View>
    );
  };

  if (initialLoading && posts.length === 0) {
    return (
      <View style={styles.centerLoader}>
        <CommonLoader fullScreen/>
      </View>
    );
  }

  return (
    <FlatList
      ListHeaderComponent={ListHeaderComponent}
      data={posts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={ListFooter}
      ListEmptyComponent={ListEmpty}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.darkGreen]}
          tintColor={Colors.darkGreen}
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
    flexGrow: 1,
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