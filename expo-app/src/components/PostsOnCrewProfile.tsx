import { StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PostInterface } from '../screens/ContentDetails/type';
import { getallposts } from '../apis/apiService';
import { FlatList } from 'react-native-gesture-handler';
import CommonLoader from './CommonLoader';
import EmptyComponent from './EmptyComponent';
import FullScreenMediaModal from '@/app/fullscreenmediapreview';
import { Copy, Play } from 'lucide-react-native';
import { Image } from 'expo-image';
import { ImagesAssets } from '../utils/ImageAssets';

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 18;

type MediaItem = {
    uri: string;
    type: "image" | "video";
};

interface PostsOnCrewProfileProps {
    userId: string;
}

const PostsOnCrewProfile: React.FC<PostsOnCrewProfileProps> = ({ userId }) => {
    const { t } = useTranslation();

    const [posts, setPosts] = useState<PostInterface[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [mediaModalVisible, setMediaModalVisible] = useState(false);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [selectedPostMedia, setSelectedPostMedia] = useState<MediaItem[]>([]);

    const fetchPosts = async (page: number, isLoadMore = false) => {
        if (!userId || (isLoadMore && (loadingMore || !hasMore))) return;

        try {
            isLoadMore ? setLoadingMore(true) : setLoading(true);

            const response = await getallposts({
                userId,
                page,
                limit: ITEMS_PER_PAGE,
            });

            const newPosts = response?.data?.hangoutsList || [];
            const totalPages = response?.data?.totalPages || 0;

            setPosts(prev => isLoadMore ? [...prev, ...newPosts] : newPosts);
            setCurrentPage(page + 1);
            setHasMore(totalPages > page);
        } catch (error) {
            console.error('Error fetching posts:', error);
            if (!isLoadMore) setPosts([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (userId) {
            setPosts([]);
            setCurrentPage(1);
            setHasMore(true);
            fetchPosts(1);
        }
    }, [userId]); // Only re-fetch when userId changes

    const handlePostPress = (item: PostInterface, mediaIndex: number = 0) => {
        const mediaItems: MediaItem[] = item.imageUrls?.map((url) => ({
            uri: url,
            type: url.includes('.mp4') || url.includes('.mov') || url.includes('.heic')
                ? 'video'
                : 'image',
        })) || [];

        setSelectedPostMedia(mediaItems);
        setSelectedMediaIndex(mediaIndex);
        setMediaModalVisible(true);
    };

    const handleLoadMore = useCallback(() => {
        if (hasMore && !loadingMore && !loading) {
            fetchPosts(currentPage, true);
        }
    }, [currentPage, hasMore, loadingMore, loading]);

    const renderPost = ({ item }: { item: PostInterface }) => {
        const imageUrl = item.imageUrls?.[0] || '';
        const isVideo = imageUrl.includes('.mp4') || imageUrl.includes('.mov');
        const hasMultiple = item.imageUrls?.length > 1;

        return (
            <TouchableOpacity
                style={styles.postContainer}
                activeOpacity={0.9}
                onPress={() => handlePostPress(item, 0)}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.postImage}
                    contentFit="cover"
                    placeholder={ImagesAssets.PlaceholderImage}
                    placeholderContentFit='cover'
                />

                {(isVideo || hasMultiple) && (
                    <View style={styles.overlay}>
                        {isVideo && (
                            <View style={styles.videoIcon}>
                                <Play size={10} color="#fff" fill="#fff" />
                            </View>
                        )}
                        {hasMultiple && (
                            <View style={styles.videoIcon}>
                                <Copy color='white' size={12} />
                            </View>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderFooter = () => loadingMore ? <View style={styles.footerLoader}><CommonLoader /></View> : null;

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <EmptyComponent text={t('youarenotpostedanything')} />
        </View>
    );

    if (loading && posts.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <CommonLoader />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id}
                numColumns={3}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews
                initialNumToRender={12}
                maxToRenderPerBatch={12}
                windowSize={5}
                columnWrapperStyle={styles.row}
            />

            <FullScreenMediaModal
                visible={mediaModalVisible}
                media={selectedPostMedia}
                initialIndex={selectedMediaIndex}
                onClose={() => setMediaModalVisible(false)}
            />
        </View>
    );
};

export default PostsOnCrewProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 10,
    },
    row: {
        justifyContent: 'flex-start',
    },
    postContainer: {
        width: width / 2.4,
        height: 150,
        position: 'relative',
        borderWidth: 0.5,
        borderColor: '#fff',
    },
    postImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
    },
    footerLoader: {
        marginTop: 20,
    },
    overlay: {
        position: 'absolute',
        top: 10,
        right: 15,
        flexDirection: 'row',
        gap: 6,
        alignItems: 'center',
    },
    videoIcon: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
    },
});