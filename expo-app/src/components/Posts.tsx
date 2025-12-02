// Posts.tsx (Optimized & Clean)
import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, ActivityIndicator, RefreshControl, View, StyleSheet } from 'react-native';
import { getallposts } from '../apis/apiService';
import { showToast } from './GlobalToast';
import TextBasedPost from './TextBasedPost';   // ← New
import MediaBasedPost from './MediaBasedPost';

const Posts: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const limit = 10;

    const fetchPosts = useCallback(async (pageNum = 1, isRefresh = false) => {
        if (!hasMore && !isRefresh) return;
        if (!isRefresh) setLoading(pageNum === 1);
        else setRefreshing(true);

        try {
            const response = await getallposts({ page: pageNum, limit });
            if (response.success) {
                const newPosts = response.data.hangoutsList || [];
                setPosts(prev => (isRefresh || pageNum === 1 ? newPosts : [...prev, ...newPosts]));
                setHasMore(newPosts.length === limit);
                setPage(pageNum);
            } else {
                showToast.error('Error', response.message || 'Failed to load posts');
            }
        } catch {
            showToast.error('Error', 'Something went wrong');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [hasMore]);

    useEffect(() => {
        fetchPosts(1, true);
    }, []);

    const onRefresh = () => fetchPosts(1, true);
    const onEndReached = () => !loading && hasMore && fetchPosts(page + 1);

    const renderItem = ({ item }: { item: any }) => {
        const hasImages = item.imageUrls?.length > 0;
        return hasImages ? <MediaBasedPost post={item} /> : <TextBasedPost post={item} />;
    };

    if (loading && posts.length === 0) {
        return (
            <View style={styles.centerLoader}>
                <ActivityIndicator size="large" color="#8DAF02" />
            </View>
        );
    }

    return (
        <FlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.7}
            ListFooterComponent={
                loading && posts.length > 0 ? (
                    <View style={styles.footerLoader}>
                        <ActivityIndicator size="small" color="#8DAF02" />
                    </View>
                ) : null
            }
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={8}
            windowSize={21}
        />
    );
};

const styles = StyleSheet.create({
    centerLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    footerLoader: { paddingVertical: 20, alignItems: 'center' },
});

export default Posts;