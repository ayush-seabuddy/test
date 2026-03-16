import { addeditdeletebuddyupevent } from '@/src/apis/apiService'
import { BASE_URL } from '@/src/apis/endpoints'
import CommonLoader from '@/src/components/CommonLoader'
import GlobalButton from '@/src/components/GlobalButton'
import GlobalHeader from '@/src/components/GlobalHeader'
import { showToast } from '@/src/components/GlobalToast'
import { getUserDetails } from '@/src/utils/helperFunctions'
import { ImagesAssets } from '@/src/utils/ImageAssets'
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet'
import axios from 'axios'
import { ResizeMode, Video } from 'expo-av'
import { Image } from 'expo-image'
import ImagePicker from 'react-native-image-crop-picker'
import { router } from 'expo-router'
import { useLocalSearchParams } from 'expo-router/build/hooks'
import { Play, X } from 'lucide-react-native'
import React, { useCallback, useEffect, useRef, useState, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Logger } from '@/src/utils/logger'

const getMimeType = (uri: string, type: 'image' | 'video'): string => {
    if (type === 'video') return 'video/mp4';
    const extension = uri.split('.').pop()?.toLowerCase();
    if (extension === 'png') return 'image/png';
    if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
    return 'image/jpeg';
};

interface UserDetails {
    designation?: string;
    authToken?: string;
}

type MediaItem = {
    uri: string;
    type: 'image' | 'video';
    id: string;
    uploadedUrl?: string;
    uploading?: boolean;
    error?: boolean;
    retryCount?: number;
};

const BuddyUpRequestApprovalScreen = () => {
    const { t } = useTranslation();
    const { eventId }: { eventId: string } = useLocalSearchParams();

    const [userDetails, setUserDetails] = useState<UserDetails>({});
    const [description, setDescription] = useState('');
    const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(false);

    const mediaBottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = ['40%'];

    const getuserDetails = async () => {
        const userDetails = await getUserDetails();
        setUserDetails(userDetails);
    }


    const editbuddyupevent = async (eventId: string, completionImages: string[], completionDescription: string) => {
        try {
            setLoading(true)
            const apiResponse = await addeditdeletebuddyupevent({
                groupActivities: [
                    {
                        eventId: eventId,
                        completionImages: completionImages,
                        completionDescription: completionDescription,
                        status: (userDetails.designation === "Captain" ||
                            userDetails.designation === "Chief engineer") ? "COMPLETED" : "REQUESTED",
                    },
                ],
            })
            setLoading(false)

            if (apiResponse.success && apiResponse.status === 200) {

                showToast.success(t("success"), apiResponse.message)
                setTimeout(() => {
                    router.back()
                }, 1500);
            } else {
                showToast.error(t("oops"), apiResponse.message)
            }
        } catch (error) {
            showToast.error(t("oops"), t("somethingwentwrong"))
        }
    }


    useEffect(() => {
        getuserDetails()
    }, [])

    const pickMedia = async (type: 'photo' | 'video' | 'gallery') => {
        mediaBottomSheetRef.current?.close();
        setLoading(true);

        const cropOptions: any = {
            cropping: true,
            freeStyleCropEnabled: true,
            cropperCircleOverlay: false,
            compressImageQuality: 0.7,
            includeBase64: false,
            multiple: false,
            forceJpg: false,
            width: 600,
            height: 600,
        };

        try {
            let result: any;

            if (type === 'photo') {
                result = await ImagePicker.openCamera({ ...cropOptions, mediaType: 'photo' });
            } else if (type === 'video') {
                result = await ImagePicker.openCamera({ mediaType: 'video', duration: 45 });
            } else {
                result = await ImagePicker.openPicker({ mediaType: 'any' });
            }

            if (!result) return;

            const assets = Array.isArray(result) ? result : [result];

            const invalidVideos = assets.filter((asset: any) => asset.duration && asset.duration > 45);
            if (invalidVideos.length > 0) {
                showToast.error(t('oops'), t('videotoolong', { max: 45 }));
                return;
            }

            const newMedia: MediaItem[] = assets.map((asset: any) => ({
                uri: asset.path || asset.uri || '',
                type: (asset.mime && asset.mime.startsWith('video')) || asset.duration ? 'video' : 'image',
                id: `${asset.path || asset.uri}-${Date.now()}-${Math.random()}`,
                uploading: true,
                error: false,
                retryCount: 0,
            }));

            if (newMedia.length === 0) return;

            setSelectedMedia(prev => [...prev, ...newMedia]);
            showToast.success(t('success'), t('mediaitemsadded', { count: newMedia.length }));
            uploadMediaFiles(newMedia);
        } catch (error: any) {
            const msg = (error && (error.message || error)) || '';
            if (!msg.toString().toLowerCase().includes('cancel')) {
                Logger.error('Error picking media:', error);
                showToast.error(t('error'), t('imagePickFailed'));
            }
        } finally {
            setLoading(false);
        }
    }

    const uploadMediaFiles = async (items: MediaItem[]) => {
        if (!userDetails.authToken) {
            showToast.error(t("error"), t("autherror"));
            return;
        }

        const MAX_RETRIES = 5;

        for (const item of items) {
            let retryCount = 0;

            const uploadWithRetry = async (): Promise<void> => {
                while (retryCount <= MAX_RETRIES) {
                    try {
                        setSelectedMedia(prev => prev.map(m =>
                            m.id === item.id
                                ? { ...m, uploading: true, error: false, retryCount }
                                : m
                        ));

                        const formData = new FormData();
                        formData.append('file', {
                            uri: item.uri,
                            name: `media_${Date.now()}_${retryCount}.${item.type === 'video' ? 'mp4' : 'jpg'}`,
                            type: getMimeType(item.uri, item.type),
                        } as any);

                        const response = await axios.post(`${BASE_URL}/user/uploadFile`, formData, {
                            headers: {
                                authToken: userDetails.authToken,
                                'Content-Type': 'multipart/form-data',
                                Accept: 'application/json',
                            },
                            timeout: 30000, // 30 seconds timeout
                        });

                        if (response.data?.responseCode === 200 && response.data.result) {
                            setSelectedMedia(prev => prev.map(m =>
                                m.id === item.id
                                    ? { ...m, uploadedUrl: response.data.result, uploading: false, error: false }
                                    : m
                            ));
                            return;
                        } else {
                            throw new Error(response.data?.message || 'Upload failed');
                        }
                    } catch (err: any) {
                        retryCount++;
                        Logger.warn(`Upload attempt ${retryCount}/${MAX_RETRIES + 1} failed for ${item.id}:`, err.message || err);

                        if (retryCount > MAX_RETRIES) {
                            setSelectedMedia(prev => prev.map(m =>
                                m.id === item.id
                                    ? { ...m, uploading: false, error: true }
                                    : m
                            ));
                            showToast.error(t("error"), t("uploadfailedafterretries") || "Upload failed after 5 attempts");
                            return;
                        }

                        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                    }
                }
            };

            await uploadWithRetry();
        }
    }

    const removeMedia = useCallback((idToRemove: string) => {
        setSelectedMedia((prev) => prev.filter((m) => m.id !== idToRemove));
    }, []);

    const handleShare = () => {
        const uploadedUrls = selectedMedia
            .filter(m => m.uploadedUrl)
            .map(m => m.uploadedUrl!);

        if (uploadedUrls.length === 0 || !description.trim()) {
            showToast.error(t("invalid"), t("addmediaanddescription"));
            return;
        }
        if (eventId) {
            editbuddyupevent(eventId, uploadedUrls, description)
        }

    }

    const allUploadedSuccessfully = selectedMedia.length > 0 &&
        selectedMedia.every(m => m.uploadedUrl && !m.uploading && !m.error);

    const isButtonEnabled = description.trim().length > 0 && allUploadedSuccessfully;

    const renderBackdrop = (props: any) => (
        <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.5}
            pressBehavior="close"
        />
    );

    const renderMediaHeader = useCallback(() => (
        <TouchableOpacity style={styles.addMoreMediaButton} onPress={() => mediaBottomSheetRef.current?.snapToIndex(0)}>
            <Image source={ImagesAssets.GalleryIcon} style={styles.addMoreIcon} />
            <Text style={styles.addMoreText}>{t('attachmore')}</Text>
        </TouchableOpacity>
    ), [t]);

    const renderMediaItem = useCallback(
        ({ item }: { item: MediaItem }) => (
            <TouchableOpacity style={styles.mediaItemContainer} activeOpacity={0.9}>
                {item.type === 'image' ? (
                    <Image source={{ uri: item.uri }} style={styles.mediaImage} contentFit="cover" cachePolicy={"memory-disk"}/>
                ) : (
                    <Video
                        source={{ uri: item.uri }}
                        style={styles.mediaImage}
                        resizeMode={ResizeMode.COVER}
                        isLooping
                        shouldPlay
                        isMuted
                        useNativeControls={false}
                    />
                )}
                {item.type === 'video' && (
                    <View style={styles.videoOverlay}>
                        <View style={styles.playIconContainer}>
                            <Play size={30} color="white" fill="white" />
                        </View>
                    </View>
                )}
                {item.uploading && (
                    <View style={styles.statusOverlay}>
                        <CommonLoader color='#fff'/>
                        <Text style={styles.overlayText}>
                            {(item.retryCount ?? 0) > 0
                                ? `Retrying... (${item.retryCount ?? 0}/5)`
                                : 'Uploading...'}
                        </Text>
                    </View>
                )}
                {item.error && (
                    <View style={[styles.statusOverlay, { backgroundColor: 'rgba(255,0,0,0.7)' }]}>
                        <Text style={styles.overlayText}>{t('failedtouploadimage')}</Text>
                    </View>
                )}
                <TouchableOpacity style={styles.removeMediaButton} onPress={() => removeMedia(item.id)}>
                    <X size={18} color="#fff" />
                </TouchableOpacity>
            </TouchableOpacity>
        ),
        [removeMedia]
    );

    const buttonName = (userDetails.designation === "Captain" ||
        userDetails.designation === "Chief engineer") ? t("sharetofeed") : t("requestapprovalform")

    return (
        <View style={styles.main}>
            <GlobalHeader
                title={
                    userDetails.designation === "Captain" ||
                        userDetails.designation === "Chief engineer"
                        ? t("sharetofeed")
                        : t("requestapprovalform")
                }
            />

            {loading && (
                <View style={styles.loadingOverlay}>
                    <CommonLoader fullScreen />
                </View>
            )}

            <ScrollView style={styles.formView} showsVerticalScrollIndicator={false}>
                {selectedMedia.length > 0 ? (
                    <FlatList
                        horizontal
                        data={selectedMedia}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMediaItem}
                        showsHorizontalScrollIndicator={false}
                        style={styles.mediaList}
                        contentContainerStyle={styles.mediaListContent}
                        ListHeaderComponent={renderMediaHeader}
                        removeClippedSubviews={true}
                    />
                ) : (
                    <TouchableOpacity
                        style={styles.emptyMediaContainer}
                        onPress={() => mediaBottomSheetRef.current?.snapToIndex(0)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.emptyMediaButton}>
                            <Image source={ImagesAssets.GalleryIcon} style={styles.galleryIcon} />
                            <Text style={styles.addphotovideoText}>{t('addphotovideorequestScreen')}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                <View style={styles.captionView}>
                    <Text style={styles.writeacaption}>{t('writeadescription')}</Text>
                    <TextInput
                        style={styles.captionInput}
                        placeholder={t('captionplaceholder')}
                        placeholderTextColor="#949494"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        maxLength={400}
                        textAlignVertical="top"
                    />
                </View>

                <GlobalButton
                    title={buttonName}
                    onPress={handleShare}
                    disabled={!isButtonEnabled || loading}
                />
            </ScrollView>

            <BottomSheet
                ref={mediaBottomSheetRef}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                backgroundStyle={styles.bottomSheetBackground}
                backdropComponent={renderBackdrop}
            >
                <BottomSheetView style={styles.containerPhoto}>
                    <Text style={styles.titlePhoto}>{t('selectmedia')}</Text>
                    <TouchableOpacity
                        style={styles.buttonPhoto}
                        onPress={() => pickMedia("photo")}
                    >
                        <Text style={styles.buttonTextPhoto}>{t('takephoto')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.buttonPhoto}
                        onPress={() => pickMedia("video")}
                    >
                        <Text style={styles.buttonTextPhoto}>{t('takevideo')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.buttonPhoto}
                        onPress={() => pickMedia("gallery")}
                    >
                        <Text style={styles.buttonTextPhoto}>{t('choosefromgallery')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => mediaBottomSheetRef.current?.close()}
                        style={styles.cancelButton}
                    >
                        <Text style={styles.cancelTextPhoto}>{t('cancel')}</Text>
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheet>
        </View>
    )
}

export default memo(BuddyUpRequestApprovalScreen)

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: '#fff' },
    formView: { flex: 1, marginHorizontal: 10 },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    emptyMediaContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        marginHorizontal: 5,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 10,
        minHeight: 200,
    },
    emptyMediaButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    galleryIcon: { height: 40, width: 40 },
    addphotovideoText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginTop: 10,
        color: 'grey',
    },
    mediaList: { marginTop: 10, marginHorizontal: 5 },
    mediaListContent: { paddingRight: 15 },
    addMoreMediaButton: {
        height: 150,
        width: 150,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        borderRadius: 10,
        marginRight: 10,
        marginTop: 10,
        marginBottom: 20,
    },
    addMoreIcon: { height: 30, width: 30 },
    addMoreText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        marginTop: 10,
        textAlign: 'center',
        color: '#666',
    },
    mediaItemContainer: {
        position: 'relative',
        marginRight: 10,
        marginTop: 10,
        marginBottom: 20,
    },
    mediaImage: {
        height: 150,
        width: 150,
        borderRadius: 10,
        backgroundColor: '#000',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 10,
    },
    playIconContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 30,
        padding: 10,
    },
    statusOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 10,
    },
    overlayText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 5,
        fontFamily: 'Poppins-Regular'
    },
    removeMediaButton: {
        position: 'absolute',
        right: 5,
        top: 5,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'white',
    },
    captionView: {
        backgroundColor: '#f5f5f5',
        borderRadius: 7,
        padding: 16,
        marginBottom: 20,
    },
    writeacaption: {
        fontFamily: 'Poppins-SemiBold',
        color: 'black',
        fontSize: 12,
        marginBottom: 5,
    },
    captionInput: {
        height: 120,
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 5,
        fontSize: 12,
        color: '#000',
        fontFamily: 'Poppins-Regular',
    },
    bottomSheetBackground: { backgroundColor: 'white' },
    containerPhoto: { flex: 1, paddingHorizontal: 20 },
    titlePhoto: { fontSize: 16, marginBottom: 10, textAlign: 'center', fontFamily: 'Poppins-SemiBold' },
    buttonPhoto: { padding: 12, borderWidth: 0.5, borderColor: 'grey', borderRadius: 10, marginBottom: 10, alignItems: 'center' },
    buttonTextPhoto: { fontSize: 14, fontFamily: 'Poppins-Regular' },
    cancelButton: { paddingVertical: 10, alignItems: 'center' },
    cancelTextPhoto: { color: '#888', fontSize: 14, marginBottom: 20, fontFamily: 'Poppins-Regular' },
})