import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
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
  [key: string]: any;
}

interface PostsProps {
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

const LIMIT = 10;

const Posts: React.FC<PostsProps> = ({ ListHeaderComponent }) => {
  const { t } = useTranslation();
  const isOnline = useNetwork();

  const [posts, setPosts] = useState<Post[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isFetching = useRef(false);

  const handlePostDeleted = useCallback((id: string | number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  const handlePostReported = useCallback((id: string | number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  const fetchPosts = useCallback(
    async (pageNum = 1, isRefresh = false) => {
      if (!isOnline || isFetching.current) return;

      if (!hasMore && !isRefresh) return;

      isFetching.current = true;

      if (isRefresh) setRefreshing(true);
      else if (pageNum === 1) setInitialLoading(true);
      else setLoadingMore(true);

      try {
        const res = await getallposts({ page: pageNum, limit: LIMIT });

        if (res.success) {
          const newPosts: Post[] = res.data?.hangoutsList || [];

          setPosts(prev => {
            if (isRefresh || pageNum === 1) return newPosts;

            const ids = new Set(prev.map(p => p.id));
            return [...prev, ...newPosts.filter(p => !ids.has(p.id))];
          });

          setHasMore(newPosts.length === LIMIT);
          setPage(pageNum);
        } else {
          showToast.error(t('oops'), res.message);
        }
      } catch (e) {
        showToast.error(t('oops'), t('somethingwentwrong'));
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        isFetching.current = false;
      }
    },
    [hasMore, isOnline, t]
  );

  useEffect(() => {
    fetchPosts(1);
  }, [isOnline]);

  const onRefresh = useCallback(() => {
    if (!isOnline) return;
    setHasMore(true);
    fetchPosts(1, true);
  }, [fetchPosts, isOnline]);

  const loadMore = useCallback(() => {
    if (!isOnline || loadingMore || !hasMore) return;
    fetchPosts(page + 1);
  }, [fetchPosts, page, loadingMore, hasMore, isOnline]);

  const renderItem = useCallback(
    ({ item, index }: { item: Post; index: number }) => (
      <PostScreen
        post={{
          ...item,
          imageUrls: item.imageUrls || item.images || [],
        }}
        index={index}
        onPostDeleted={handlePostDeleted}
        onPostReported={handlePostReported}
      />
    ),
    [handlePostDeleted, handlePostReported]
  );

  const ListFooter = useCallback(() => {
    if (!loadingMore) return <View style={{ height: 120 }} />;
    return (
      <View style={styles.footerLoader}>
        <CommonLoader />
      </View>
    );
  }, [loadingMore]);

  const ListEmpty = useCallback(() => {
    if (initialLoading) return null;
    return (
      <EmptyComponent
        text={
          !isOnline
            ? t('nointernetconnection')
            : t('youarenotpostedanything')
        }
      />
    );
  }, [initialLoading, isOnline]);

  if (initialLoading && posts.length === 0 && isOnline) {
    return (
      <View style={styles.centerLoader}>
        <CommonLoader fullScreen />
      </View>
    );
  }

  return (
    <FlashList
      data={posts}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooter}
      ListEmptyComponent={ListEmpty}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
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
      contentContainerStyle={
        posts.length === 0 ? styles.emptyContainer : undefined
      }
    />
  );
};

export default React.memo(Posts);

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
});
