import { getallposts } from '@/src/apis/apiService';
import PostScreen from '@/src/components/PostScreen';
import { RootState } from '@/src/redux/store';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    View
} from 'react-native';
import { useSelector } from 'react-redux';
import { PostInterface } from '../ContentDetails/type';

const ITEMS_PER_PAGE = 10;

const UserPost = () => {
    const userDetails = useSelector((state: RootState) => state.userDetails);
    const [post, setPost] = useState<PostInterface[]>([]);
    const [page, setPage] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const fetchPosts = useCallback(
        async (isLoadMore: boolean = false, pageNumber = 1) => {
            if (loading || loadingMore || page >= pageNumber) return;
            try {
                if (isLoadMore) {
                    setLoadingMore(true);
                } else {
                    setLoading(true);
                }
                const response = await getallposts({
                    userId: userDetails?.id,
                    page: pageNumber,
                    limit: ITEMS_PER_PAGE,
                });

                if (response.data) {
                    const newPosts: PostInterface[] = response.data.hangoutsList || [];
                    const totalPages = response.data.totalPages || 0;


                    setPost((prev) => [...prev, ...newPosts]);
                    setPage((prev) => prev + 1);

                    setHasMore(totalPages > page + 1);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
                // You might want to show a toast/error message here
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [userDetails?.id, page, loading, loadingMore]
    );

    useEffect(() => {
        if (userDetails?.id) {
            fetchPosts(false);
        }
    }, [userDetails?.id]);

    const handleLoadMore = () => {
        if (hasMore && !loadingMore) {
            fetchPosts(true, page + 1);
        }
    };

    const renderFooter = () => {
        // if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
               {loadingMore && <ActivityIndicator size="large" color="#000" />}
            </View>
        );
    };

    if (loading && post.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={post}
                renderItem={({ item }) => (
                    <PostScreen
                        index={item.id}
                        post={item}
                        key={item.id}
                        onPostDeleted={() => {
                            // Optionally refetch or filter out deleted post
                            setPost((prev) => prev.filter((p) => p.id !== item.id));
                        }}
                        i18nIsDynamicList={false}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.8}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerLoader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 140,
        marginTop: 10,
    },
});

export default UserPost;