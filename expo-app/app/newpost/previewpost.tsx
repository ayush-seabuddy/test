import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import GlobalHeader from '@/src/components/GlobalHeader';
import Video from 'react-native-video';
import { router, useLocalSearchParams } from 'expo-router';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { showToast } from '@/src/components/GlobalToast';
import { createpost, updatepostbyid } from '@/src/apis/apiService';
import CommonLoader from '@/src/components/CommonLoader';

const { width } = Dimensions.get('window');

type MediaItem =
    | string
    | {
        uri: string;
        type?: 'image' | 'video';
    };

type TaggedUser = {
    id: string | number;
    fullName: string;
    profileUrl?: string;
};

type FrameOption = {
    id: number;
    label: string;
    ratio: number;
};

const frameOptions: FrameOption[] = [
    { id: 1, label: 'Landscape', ratio: 0.75 },
    { id: 2, label: 'Square', ratio: 1 },
    { id: 3, label: 'Portrait', ratio: 1.25 },
    { id: 4, label: 'Full', ratio: 1.5 },
];

const PreviewPostScreen: React.FC = () => {
    const { t } = useTranslation();
    const params = useLocalSearchParams<{
        mediaFiles?: string;
        caption?: string;
        hashtags?: string;
        taggedUsers?: string;
        isEditMode?: string;
        postId?: string;
    }>();

    const isEditMode = params.isEditMode === 'true';
    const postId = params.postId ?? '';

    const extractMediaUrls = (media: MediaItem[]): string[] => {
        return media.map(item =>
            typeof item === 'string' ? item : item.uri
        );
    };

    const mediaFiles = useMemo<MediaItem[]>(() => {
        if (!params.mediaFiles) return [];
        try {
            return JSON.parse(params.mediaFiles);
        } catch {
            return [];
        }
    }, [params.mediaFiles]);

    const caption: string = params.caption ?? '';

    const hashtags = useMemo<string[]>(() => {
        if (!params.hashtags) return [];
        try {
            return JSON.parse(params.hashtags);
        } catch {
            return [];
        }
    }, [params.hashtags]);

    const taggedUsers = useMemo<TaggedUser[]>(() => {
        if (!params.taggedUsers) return [];
        try {
            return JSON.parse(params.taggedUsers);
        } catch {
            return [];
        }
    }, [params.taggedUsers]);

    const [frame, setFrame] = useState<FrameOption>(frameOptions[1]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(e.nativeEvent.contentOffset.x / width);
        setActiveIndex(index);
    };

    const renderMedia = ({ item }: { item: MediaItem }) => {
        const height = width * frame.ratio;
        const uri = typeof item === 'string' ? item : item.uri;
        const isVideo = typeof item !== 'string' && item.type === 'video';

        return (
            <View style={[styles.mediaWrapper, { height }]}>
                {isVideo ? (
                    <Video
                        source={{ uri }}
                        style={styles.media}
                        resizeMode="cover"
                        repeat
                        muted
                        paused={false} // Ensure it plays
                    />
                ) : (
                    <Image
                        source={{ uri }}
                        style={styles.media}
                        contentFit="cover"
                    />
                )}
            </View>
        );
    };

    const createPost = async () => {
        if (loading) return;
        try {
            setLoading(true);

            const payload = {
                hangouts: [
                    {
                        imageUrls: extractMediaUrls(mediaFiles),
                        caption: caption.trim(),
                        tags: taggedUsers.map(u => String(u.id)),
                        hashtags,
                        ratioValue: frame.ratio,
                        imageresizeMode: 'cover',
                        createdAt: new Date().toISOString(),
                    },
                ],
            };

            const apiResponse = await createpost(payload);

            if (apiResponse.success && apiResponse.status === 200) {
                showToast.success(t('success'), t('postcreatedsuccessfully'));
                router.push('/(bottomtab)/(community)/social');
            } else {
                showToast.error(t('oops'), apiResponse.message);
            }
        } catch (error) {
            console.log('Error creating post:', error);
            showToast.error(t('oops'), t('somethingwentwrong'));
        } finally {
            setLoading(false);
        }
    };

    const updatePost = async () => {
        if (loading || !postId) return;
        try {
            setLoading(true);

            const payload = {
                id: postId,
                imageUrls: extractMediaUrls(mediaFiles),
                caption: caption.trim(),
                tags: taggedUsers.map(u => String(u.id)),
                hashtags,
                ratioValue: frame.ratio,
                imageresizeMode: 'cover',
            };

            const apiResponse = await updatepostbyid(payload);

            if (apiResponse.success && apiResponse.status === 200) {
                showToast.success(t('success'), t('postupdatedsuccessfully'));
                router.push('/(bottomtab)/(community)/social');
            } else {
                showToast.error(t('oops'), apiResponse.message);
            }
        } catch (error) {
            console.log('Error updating post:', error);
            showToast.error(t('oops'), t('somethingwentwrong'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        if (isEditMode) {
            updatePost();
        } else {
            createPost();
        }
    };

    return (
        <View style={styles.container}>
            <GlobalHeader
                title={t('previewpost')}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                {mediaFiles.length > 0 ? (
                    <FlatList
                        data={mediaFiles}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={renderMedia}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                    />
                ) : (
                    <View style={styles.noMediaContainer}>
                        <Text style={styles.noMediaText}>{t('no_media_preview')}</Text>
                    </View>
                )}

                {mediaFiles.length > 1 && (
                    <View style={styles.counterContainer}>
                        <Text style={styles.counterText}>
                            {activeIndex + 1}/{mediaFiles.length}
                        </Text>
                    </View>
                )}

                <View style={styles.frameContainer}>
                    {frameOptions.map((item: FrameOption) => (
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

                {caption.length > 0 && (
                    <View style={styles.captionContainer}>
                        <Text style={styles.captionText}>{caption}</Text>
                    </View>
                )}

                {taggedUsers.length > 0 && (
                    <View style={styles.taggedContainer}>
                        <Text style={styles.sectionLabel}>{t('with')}:</Text>
                        <View style={styles.taggedRow}>
                            {taggedUsers.map((user: TaggedUser) => (
                                <View key={user.id} style={styles.taggedUser}>
                                    <Image
                                        source={
                                            user.profileUrl
                                                ? { uri: user.profileUrl }
                                                : ImagesAssets.userIcon
                                        }
                                        style={styles.taggedAvatar}
                                        contentFit="cover"
                                    />

                                    <Text style={styles.taggedName}>{user.fullName}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {hashtags.length > 0 && (
                    <View style={styles.hashtagContainer}>
                        {hashtags.map((tag: string, i: number) => (
                            <Text key={i} style={styles.hashtag}>
                                {tag}
                            </Text>
                        ))}
                    </View>
                )}
            </ScrollView>

            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                    style={[
                        styles.shareButton,
                        loading && styles.disabledButton,
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <CommonLoader color="#fff" />
                    ) : (
                        <Text style={styles.shareButtonText}>
                            {isEditMode ? t('update') : t('share')}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PreviewPostScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    noMediaContainer: {
        height: width * frameOptions[1].ratio, // Default square
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    noMediaText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Poppins-Regular',
    },
    mediaWrapper: { width, backgroundColor: '#000' },
    media: { width: '100%', height: '100%' },
    counterContainer: {
        position: 'absolute',
        top: 15,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    counterText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    bottomButtonContainer: {
        padding: 15,
        backgroundColor: "#fff",
        borderTopWidth: 0.5,
        borderColor: "#ddd",
    },
    shareButton: {
        backgroundColor: "#02130B",
        padding: 15,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: "center",
    },
    disabledButton: {
        backgroundColor: "#888",
    },
    shareButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
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
    activeFrame: { backgroundColor: '#02130B' },
    frameText: {
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
        color: '#666',
        fontWeight: '600',
    },
    activeText: { color: '#fff' },
    captionContainer: { padding: 16 },
    captionText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        lineHeight: 20,
        color: '#333',
    },
    taggedContainer: { paddingHorizontal: 16, paddingBottom: 10 },
    sectionLabel: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        color: '#666',
        fontWeight: '600',
        marginBottom: 8,
    },
    taggedRow: { flexDirection: 'row', flexWrap: 'wrap' },
    taggedUser: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 6,
        paddingRight: 16,
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
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
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
        fontFamily: 'Poppins-Regular',
    },
});