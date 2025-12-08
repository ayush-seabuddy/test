import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, ActivityIndicator, RefreshControl, View, StyleSheet } from 'react-native';
import { getallposts } from '../apis/apiService';
import { showToast } from './GlobalToast';
import TextBasedPost from './TextBasedPost';
import MediaBasedPost from './MediaBasedPost';
import { useTranslation } from 'react-i18next';
import Colors from '../utils/Colors';

const Posts: React.FC = () => {
    const { t } = useTranslation();
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
                // Remove duplicates based on ID
                setPosts(prev => {
                    if (isRefresh || pageNum === 1) {
                        return newPosts;
                    }

                    // Filter out duplicates when appending
                    const existingIds = new Set(prev.map((p: any) => p.id));
                    const uniqueNewPosts = newPosts.filter((post: any) => !existingIds.has(post.id));
                    return [...prev, ...uniqueNewPosts];
                });

                setHasMore(newPosts.length === limit);
                setPage(pageNum);
            } else {
                showToast.error(t('oops'), response.message);
            }
        } catch (error) {
            console.error('❌ Error fetching posts:', error);
            showToast.error(t('oops'), t('somethingwentwrong'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [hasMore]);

    useEffect(() => {
        fetchPosts(1, true);
    }, []);

    const onRefresh = useCallback(() => {
        setHasMore(true);
        fetchPosts(1, true);
    }, [fetchPosts]);

    const onEndReached = useCallback(() => {
        if (!loading && hasMore) {
            fetchPosts(page + 1);
        }
    }, [loading, hasMore, page, fetchPosts]);

    const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
        const imageUrls = item.imageUrls || item.images || [];
        const hasMedia = Array.isArray(imageUrls) && imageUrls.length > 0;
        if (hasMedia) {
            const normalizedPost = {
                ...item,
                imageUrls: imageUrls
            };
            return <MediaBasedPost post={normalizedPost} index={index} />;
        } else {
            return <TextBasedPost post={item} index={index} />;
        }
    }, []);

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
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderItem}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#8DAF02']}
                    tintColor="#8DAF02"
                />
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.7}
            ListFooterComponent={
                loading && posts.length > 0 ? (
                    <View style={styles.footerLoader}>
                        <ActivityIndicator size="small" color={Colors.lightGreen} />
                    </View>
                ) : null
            }
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={8}
            windowSize={21}
            initialNumToRender={5}
            contentContainerStyle={posts.length === 0 ? styles.emptyContainer : undefined}
        />
    );
};

const styles = StyleSheet.create({
    centerLoader: {
        flex: 1,
        marginTop:50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Posts;