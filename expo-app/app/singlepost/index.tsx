import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import GlobalHeader from '@/src/components/GlobalHeader';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import PostScreen from '@/src/components/PostScreen';
import { getallposts } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';

const SinglePostScreen = () => {
    const { t } = useTranslation();
    const { postId } = useLocalSearchParams<{ postId: string }>();

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchPost = useCallback(async () => {
        if (!postId) {
            showToast.error(t('oops'), t('no_post_id'));
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const apiResponse = await getallposts({ postId });

            if (apiResponse.success && apiResponse.status === 200) {
                const fetchedPost =
                    apiResponse.data?.hangoutsList?.[0] ||
                    apiResponse.data?.post ||
                    apiResponse.data?.[0] ||
                    apiResponse.data;

                if (fetchedPost) {
                    setPost(fetchedPost);
                } else {
                    showToast.error(t('oops'), t('postnotfound'));
                }
            } else {
                const errorMessage = apiResponse.message || t('somethingwentwrong');
                showToast.error(t('oops'), errorMessage);
            }
        } catch (err: any) {
            console.error('Error fetching post:', err);
            const errorMessage =
                err?.message || err?.data?.message || t('somethingwentwrong');
            showToast.error(t('oops'), errorMessage);
        } finally {
            setLoading(false);
        }
    }, [postId, t]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    const handlePostDeleted = useCallback(() => {
        showToast.success(t('success'), t('postdeleted'));
        router.back();
    }, [t]);

    const handlePostReported = useCallback(() => {
        showToast.success(t('success'), t('reportsubmitted'));
        router.back();
    }, [t]);

    return (
        <View style={styles.container}>
            <GlobalHeader
                title={t('post')}
                leftIcon={<ChevronLeft />}
                onLeftPress={() => router.back()}
            />

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#8DAF02" />
                    <Text style={styles.loadingText}>{t('loading')}...</Text>
                </View>
            ) : (
                <PostScreen
                    post={post}
                    index={0}
                    onPostDeleted={handlePostDeleted}
                    onPostReported={handlePostReported}
                />
            )}
        </View>
    );
};

export default SinglePostScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
});