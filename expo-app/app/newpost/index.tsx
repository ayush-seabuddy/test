import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import GlobalHeader from '@/src/components/GlobalHeader';
import { useTranslation } from 'react-i18next';
import { ArrowRightCircle, ChevronLeft, Hash, Tag, Play, X } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { Video, ResizeMode } from 'expo-av';
import Colors from '@/src/utils/Colors';
import * as ImagePicker from 'expo-image-picker';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { showToast } from '@/src/components/GlobalToast';
import { listallusersfortag } from '@/src/apis/apiService';
import { getUserDetails } from '@/src/utils/helperFunctions';
import { BASE_URL } from '@/src/apis/endpoints';
import axios from 'axios';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

type AllUsers = {
  id: string;
  fullName: string;
  profileUrl: string | null;
  designation: string;
};

type MediaItem = {
  uri: string;
  type: 'image' | 'video';
  id: string;
  isExisting?: boolean;
};

const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.5}
    pressBehavior="close"
  />
);

const NewPostScreen = () => {
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const isEditMode = params.editMode === 'true';
  const editPostId = params.postId as string;

  const [caption, setCaption] = useState((params.caption as string) || '');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem[]>([]);
  const [hashtags, setHashtags] = useState<string[]>(
    params.hashtags ? JSON.parse(params.hashtags as string) : []
  );
  const [taggedUsers, setTaggedUsers] = useState<AllUsers[]>(
    params.taggedUsers ? JSON.parse(params.taggedUsers as string) : []
  );

  const [hashtagInput, setHashtagInput] = useState('');
  const [allUsers, setAllUsers] = useState<AllUsers[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const mediaSheetRef = useRef<BottomSheetModal>(null);
  const tagSheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = ['40%'];
  const tagSnapPoints = ['70%'];

  // Load existing media when in edit mode
  useEffect(() => {
    if (isEditMode && params.imageUrls) {
      try {
        const urls: string[] = JSON.parse(params.imageUrls as string);
        const media: MediaItem[] = urls.map((uri, index) => ({
          uri,
          type: /\.(mp4|mov|avi|m4v)$/i.test(uri) ? 'video' : 'image',
          id: `existing-${index}-${Date.now()}`,
          isExisting: true,
        }));
        setSelectedMedia(media);
      } catch (e) {
        console.log('Error parsing existing imageUrls:', e);
      }
    }
  }, [isEditMode, params.imageUrls]);

  const openMediaSheet = useCallback(() => mediaSheetRef.current?.present(), []);

  const openTagSheet = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const userData = await getUserDetails();
      const apiResponse = await listallusersfortag({ shipId: userData.shipId });

      if (apiResponse.success && apiResponse.status === 200) {
        const usersList = apiResponse.data?.usersList || [];
        setAllUsers(usersList);

        if (usersList.length === 0) {
          showToast.error(t('oops'), t('nousersboarded'));
        } else {
          tagSheetRef.current?.present();
        }
      } else {
        showToast.error(t('oops'), apiResponse.message);
      }
    } catch (error: any) {
      console.log('Error fetching users:', error);
      showToast.error(t('error'), 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, [t]);

  const getMimeType = (uri: string, type: 'image' | 'video') => {
    return type === 'video' ? 'video/mp4' : 'image/jpeg';
  };

  const pickMedia = async (type: 'photo' | 'video' | 'gallery') => {
    try {
      mediaSheetRef.current?.dismiss();
      setIsLoading(true);
      let result;

      if (type === 'photo') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
          allowsEditing: true,
        });
      } else if (type === 'video') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Videos,
          videoMaxDuration: 45
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsMultipleSelection: true,
          quality: 0.8,
          videoMaxDuration: 45,
        });
      }

      if (!result.canceled) {
        const assets = result.assets || [];
        const invalidVideos = assets.filter(
          (asset) =>
            asset.type === 'video' &&
            asset.duration &&
            asset.duration > 45000
        );

        if (invalidVideos.length > 0) {
          const longestSeconds = Math.round(
            Math.max(...invalidVideos.map((v) => v.duration || 0)) / 1000
          );
          showToast.error(
            t('oops'),
            t('videotoolong', { seconds: longestSeconds, max: 45 })
          );
          return;
        }

        const newMedia: MediaItem[] = assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          id: `${asset.uri}-${Date.now()}-${Math.random()}`,
          isExisting: false,
        }));

        setSelectedMedia((prev) => [...prev, ...newMedia]);
        showToast.success(
          t('success'),
          t('mediaitemsadded', { count: newMedia.length })
        );
      }
    } catch (error: any) {
      if (!error.message?.includes('User cancelled')) {
        console.error('Error picking media:', error);
        showToast.error(t('error'), t('imagePickFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const uploadNewMediaOnly = async (): Promise<string[]> => {
    const newMedia = selectedMedia.filter((m) => !m.isExisting);
    if (newMedia.length === 0) return [];

    try {
      setIsLoading(true);
      const userData = await getUserDetails();
      const uploadedUrls: string[] = [];

      for (let i = 0; i < newMedia.length; i++) {
        const media = newMedia[i];
        const formData = new FormData();
        formData.append('file', {
          uri: media.uri,
          name: `media_${i}.${media.type === 'video' ? 'mp4' : 'jpg'}`,
          type: getMimeType(media.uri, media.type),
        } as any);

        const response = await axios.post(`${BASE_URL}/user/uploadFile`, formData, {
          headers: {
            authToken: userData.authToken,
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        });

        if (response.data?.responseCode === 200 && response.data.result) {
          uploadedUrls.push(response.data.result);
        } else {
          throw new Error(response.data?.message || 'Upload failed');
        }
      }

      showToast.success(t('success'), 'New media uploaded');
      return uploadedUrls;
    } catch (error) {
      console.error('Upload failed:', error);
      showToast.error(t('error'), t('somethingwentwrong'));
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!caption.trim()) {
      showToast.error(t('oops'), 'Caption is required');
      return;
    }

    setIsLoading(true);
    try {
      let finalMediaUrls: string[] = [];

      // Keep existing (already uploaded) URLs
      const existingUrls = selectedMedia
        .filter((m) => m.isExisting)
        .map((m) => m.uri);

      // Upload only new media
      const newUploadedUrls = await uploadNewMediaOnly();

      if (newUploadedUrls.length < selectedMedia.filter((m) => !m.isExisting).length) {
        showToast.error(t('error'), 'Some media failed to upload');
        return;
      }

      finalMediaUrls = [...existingUrls, ...newUploadedUrls];

      const mediaForPreview = finalMediaUrls.map((uri) => ({
        uri,
        type: /\.(mp4|mov|avi|m4v)$/i.test(uri) ? 'video' : 'image',
      }));

      router.push({
        pathname: '/newpost/previewpost',
        params: {
          isEditMode: isEditMode ? 'true' : 'false',
          postId: editPostId || '',
          mediaFiles: JSON.stringify(mediaForPreview),
          caption: caption.trim(),
          hashtags: JSON.stringify(hashtags),
          taggedUsers: JSON.stringify(
            taggedUsers.map((u) => ({
              id: u.id,
              fullName: u.fullName,
              profileUrl: u.profileUrl || undefined,
            }))
          ),
        },
      });
    } catch (error) {
      console.error('Preview preparation failed:', error);
      showToast.error(t('error'), 'Failed to prepare preview');
    } finally {
      setIsLoading(false);
    }
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim();
    if (!tag) return;
    const formatted = tag.startsWith('#') ? tag : `#${tag}`;
    if (hashtags.includes(formatted)) {
      showToast.error(t('oops'), `${formatted} is already added`);
      return;
    }
    setHashtags([...hashtags, formatted]);
    setHashtagInput('');
    Keyboard.dismiss();
  };

  const toggleTagUser = useCallback((user: AllUsers) => {
    setTaggedUsers((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user]
    );
  }, []);

  const removeMedia = useCallback((indexToRemove: number) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== indexToRemove));
  }, []);

  const renderMediaHeader = useCallback(() => (
    <TouchableOpacity style={styles.addMoreMediaButton} onPress={openMediaSheet}>
      <Image source={ImagesAssets.GalleryIcon} style={styles.addMoreIcon} />
      <Text style={styles.addMoreText}>{t('attachmore')}</Text>
    </TouchableOpacity>
  ), [openMediaSheet, t]);

  const renderMediaItem = useCallback(
    ({ item, index }: { item: MediaItem; index: number }) => (
      <TouchableOpacity style={styles.mediaItemContainer} activeOpacity={0.9}>
        {item.type === 'image' ? (
          <Image source={{ uri: item.uri }} style={styles.mediaImage} contentFit="cover" />
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
        <TouchableOpacity style={styles.removeMediaButton} onPress={() => removeMedia(index)}>
          <X size={18} color={Colors.white} />
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [removeMedia]
  );

  const renderUserItem = useCallback(
    ({ item }: { item: AllUsers }) => {
      const isSelected = taggedUsers.some((u) => u.id === item.id);
      return (
        <TouchableOpacity
          style={[styles.userItem, isSelected && styles.selectedUserItem]}
          onPress={() => toggleTagUser(item)}
        >
          <Image
            source={item.profileUrl ? { uri: item.profileUrl } : ImagesAssets.userIcon}
            style={styles.userAvatar}
            contentFit="cover"
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.fullName}</Text>
            <Text style={styles.userDesignation}>{item.designation}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [taggedUsers, toggleTagUser]
  );

  return (
    <BottomSheetModalProvider>
      <View style={styles.main}>
        <GlobalHeader
          title={isEditMode ? t('editpost') : t('createnewpost')}
        />

        {(isLoading || loadingUsers) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.lightGreen} />
          </View>
        )}

        <KeyboardAwareScrollView
  showsVerticalScrollIndicator={false}
  enableOnAndroid
  keyboardShouldPersistTaps="handled"
  extraScrollHeight={120}
>
          <Text style={styles.headingText}>
            {t('keepitpositive')}{'\n'}
            {t('keepitpositive_description')}
          </Text>

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
            <TouchableOpacity style={styles.emptyMediaContainer} onPress={openMediaSheet}>
              <View style={styles.emptyMediaButton}>
                <Image source={ImagesAssets.GalleryIcon} style={styles.galleryIcon} />
                <Text style={styles.addphotovideoText}>{t('addphotovideo')}</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.captionView}>
            <Text style={styles.writeacaption}>{t('writeacaption')}</Text>
            <TextInput
              style={styles.captionInput}
              placeholder={t('captionplaceholder')}
              placeholderTextColor="#949494"
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={400}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.captionView}>
            <Text style={styles.writeacaption}>{t('tagpeople')}</Text>
            <TouchableOpacity style={styles.tagView} onPress={openTagSheet}>
              <View style={styles.iconandtagtext}>
                <Tag size={18} color={Colors.lightGreen} />
                <Text style={styles.tagpeopletext}>
                  {taggedUsers.length === 0 ? t('tagpeople') : `${taggedUsers.length} ${t('tagged')}`}
                </Text>
              </View>
              <ArrowRightCircle size={20} color="gray" strokeWidth={2} />
            </TouchableOpacity>

            {taggedUsers.length > 0 && (
              <View style={styles.taggedpeopleContainer}>
                {taggedUsers.map((user) => (
                  <View key={user.id} style={styles.taggedpeopleView}>
                    <Image
                      source={user.profileUrl ? { uri: user.profileUrl } : ImagesAssets.userIcon}
                      style={styles.taggedAvatar}
                      contentFit="cover"
                    />
                    <Text style={styles.taggedpeopleName}>{user.fullName}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.captionView}>
            <Text style={styles.writeacaption}>{t('addhashtags')}</Text>
            <View style={styles.hashtagInputContainer}>
              <Hash size={20} color={Colors.lightGreen} />
              <TextInput
                style={styles.hashtagInput}
                placeholder={t('addhashtags')}
                placeholderTextColor="#949494"
                value={hashtagInput}
                onChangeText={setHashtagInput}
                onSubmitEditing={addHashtag}
                maxLength={20}
              />
              <TouchableOpacity
                onPress={addHashtag}
                disabled={!hashtagInput.trim()}
                style={!hashtagInput.trim() && styles.disabledAddHashtagBtn}
              >
                <Text
                  style={[
                    styles.addHashtagBtn,
                    !hashtagInput.trim() && styles.disabledAddHashtagText,
                  ]}
                >
                  {t('plusAdd')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.hashtagsList}>
              {hashtags.map((tag, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.hashtagPill}
                  onPress={() => setHashtags(hashtags.filter((_, idx) => idx !== i))}
                >
                  <Text style={styles.hashtagText}>{tag}</Text>
                  <Text style={styles.hashtagRemove}>×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.previewandsharebutton,
              !caption.trim() && styles.disabledButton,
            ]}
            onPress={handlePreview}
            disabled={!caption.trim()}
          >
            <Text style={styles.previewandsharetext}>
              {selectedMedia.length === 0 ? t('share') : t('preview')}
            </Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>

        {/* Media Selection Bottom Sheet */}
        <BottomSheetModal
          ref={mediaSheetRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          enablePanDownToClose
          handleIndicatorStyle={{ height: 3, backgroundColor: '#ededed', width: 50 }}
        >
          <BottomSheetView style={styles.sheetContent}>
            <Text style={[styles.sheetTitle, { marginBottom: 10 }]}>{t('selectmedia')}</Text>
            <TouchableOpacity style={styles.sheetBtn} onPress={() => pickMedia('photo')}>
              <Text style={styles.sheetBtnText}>{t('takephoto')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetBtn} onPress={() => pickMedia('video')}>
              <Text style={styles.sheetBtnText}>{t('takevideo')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetBtn} onPress={() => pickMedia('gallery')}>
              <Text style={styles.sheetBtnText}>{t('choosefromgallery')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => mediaSheetRef.current?.dismiss()}
            >
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheetModal>

        {/* Tag People Bottom Sheet */}
        <BottomSheetModal
          ref={tagSheetRef}
          snapPoints={tagSnapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{ height: 3, backgroundColor: '#ededed', width: 50 }}
        >
          <View style={styles.tagSheetHeader}>
            <Text style={styles.sheetTitle}>{t('tagpeople')}</Text>
            <TouchableOpacity
              style={[
                styles.doneBtn,
                taggedUsers.length === 0 && styles.disabledDoneBtn,
              ]}
              onPress={() => tagSheetRef.current?.dismiss()}
              disabled={taggedUsers.length === 0}
            >
              <Text style={styles.doneText}>{t('done')}</Text>
            </TouchableOpacity>
          </View>

          <BottomSheetFlatList
            data={allUsers}
            keyExtractor={(item: any) => item.id}
            renderItem={renderUserItem}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
          />
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

export default NewPostScreen;

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#fff' },
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
  headingText: {
    fontSize: 13,
    marginHorizontal: 16,
    marginVertical: 10,
    color: 'grey',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  emptyMediaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 10,
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
    fontSize: 11,
    marginTop: 10,
    color: 'grey',
  },
  mediaList: { marginTop: 10, marginHorizontal: 15 },
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
    marginHorizontal: 10,
    marginBottom: 10,
  },
  writeacaption: {
    fontFamily: 'Poppins-SemiBold',
    color: 'black',
    fontSize: 12,
    marginBottom: 5,
  },
  captionInput: {
    height: 100,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 5,
    fontSize: 12,
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  tagView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 7,
    alignItems: 'center',
  },
  iconandtagtext: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  tagpeopletext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#949494',
  },
  taggedpeopleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  taggedpeopleView: {
    borderWidth: 0.5,
    borderColor: '#ededed',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    gap: 8,
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
  taggedAvatar: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#ededed',
    borderRadius: 15,
  },
  taggedpeopleName: {
    fontSize: 10,
    paddingRight: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
  },
  hashtagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 7,
    paddingHorizontal: 10,
    gap: 8,
  },
  hashtagInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  addHashtagBtn: {
    color: Colors.lightGreen,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  disabledAddHashtagBtn: { opacity: 0.5 },
  disabledAddHashtagText: { color: '#999' },
  hashtagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  hashtagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBCF21',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
    gap: 6,
  },
  hashtagText: { color: '#000', fontSize: 12, fontFamily: 'Poppins-Regular' },
  hashtagRemove: { color: '#000', fontSize: 14, fontWeight: 'bold' },
  previewandsharebutton: {
    backgroundColor: 'black',
    height: 50,
    marginTop: 16,
    marginHorizontal: 10,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  disabledButton: { backgroundColor: '#888' },
  previewandsharetext: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
  sheetContent: { paddingHorizontal: 20, flex: 1 },
  sheetTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  sheetBtn: {
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'grey',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  sheetBtnText: { fontSize: 14, fontFamily: 'Poppins-Regular' },
  cancelBtn: { paddingVertical: 10, alignItems: 'center' },
  cancelText: { color: '#888', fontSize: 14, marginBottom: 20, fontFamily: 'Poppins-Regular' },
  tagSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  flatListContent: { paddingHorizontal: 20, paddingBottom: 20 },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ededed',
    marginVertical: 4,
    borderRadius: 10,
  },
  selectedUserItem: {
    backgroundColor: '#ededed',
    borderColor: '#ededed',
  },
  userAvatar: { width: 35, height: 35, borderRadius: 25 },
  userInfo: { flex: 1, marginLeft: 15 },
  userName: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  userDesignation: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#777',
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: Colors.lightGreen,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 5,
  },
  disabledDoneBtn: { backgroundColor: '#aaaaaa' },
  doneText: { color: 'white', fontSize: 12, fontFamily: 'Poppins-SemiBold' },
});