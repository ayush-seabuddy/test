import { updateprofile, viewProfile } from '@/src/apis/apiService';
import { BASE_URL } from '@/src/apis/endpoints';
import CommonLoader from '@/src/components/CommonLoader';
import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import { RootState } from '@/src/redux/store';
import { updateUserField } from '@/src/redux/userDetailsSlice';
import { getUserDetails, width } from '@/src/utils/helperFunctions';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import axios from 'axios';
import { Image } from 'expo-image';
import ImagePicker from 'react-native-image-crop-picker';
import { requestCameraPermission, requestMediaLibraryPermission } from '@/Permission/Permissions';
import { t } from 'i18next';
import { Camera, Image as GalleryIcon } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const ProfilePhoto = () => {
  const userDetails = useSelector((state: RootState) => state.userDetails);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = ['30%'];

  useEffect(() => {
    const fetchProfileDetails = async () => {
      const result = await viewProfile();
      if (result?.data) {
        const object = result.data;
        for (const property in object) {
          dispatch(updateUserField({ key: property, value: object[property] }));
        }
      }
    };
    fetchProfileDetails();
  }, []);

  const pickImage = async (source: 'camera' | 'library') => {
    if (source === 'camera') {
      const granted = await requestCameraPermission(t);
      if (!granted) {
        showToast.error(t('permissiondenied'), t('camerapermission_description'));
        Linking.openSettings?.();
        return;
      }
    } else {
      const granted = await requestMediaLibraryPermission(t);
      if (!granted) {
        showToast.error(t('permissiondenied'), t('medialibrarypermission_description'));
        Linking.openSettings?.();
        return;
      }
    }

    bottomSheetRef.current?.dismiss();

    setIsLoading(true);
    try {
      let image: any;
      if (source === 'camera') {
        image = await ImagePicker.openCamera({
          cropping: true,
          freeStyleCropEnabled: true,
          cropperCircleOverlay: false,
          compressImageQuality: 0.7,
          includeBase64: false,
          multiple: false,
          forceJpg: false,
          width: 600,
          height: 600,
        });
      } else {
        image = await ImagePicker.openPicker({
          cropping: true,
          freeStyleCropEnabled: true,
          cropperCircleOverlay: false,
          compressImageQuality: 0.7,
          includeBase64: false,
          multiple: false,
          forceJpg: false,
          width: 600,
          height: 600,
        });
      }

      const imagePath = image?.path || image?.uri;
      if (imagePath) {
        await uploadProfilePhoto(imagePath);
      }
    } catch (error: any) {
      if (error?.message && error.message.toLowerCase().includes('cancel')) {
        // user cancelled - ignore
      } else {
        console.error('Image Picker Error:', error);
        showToast.error(t('error'), t('imagePickFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const uploadProfilePhoto = async (uri: string) => {

    try {
      setIsLoading(true);

      const userData = await getUserDetails();
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: `profile_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);
      console.log('====================================');
      // console.log(`⬆️ Uploading file ${index + 1}/${selectedMedia.length}`);
      console.log(formData);
      console.log('====================================');

      console.log("userDetails.authToken: ", userDetails.authToken);
      const response = await axios.post(
        `${BASE_URL}/user/uploadFile`,
        formData,
        {
          headers: {
            authToken: userData.authToken,
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        }
      );
      if (response.data?.responseCode === 200 && response.data.result) {
        console.log("response.data.result: ", response.data.result);
        showToast.success(t('success'), t('profileupdatedsuccessfully'))
        const updateProfilePhoto = await updateprofile({
          profileUrl: response.data.result, userId: userDetails.id
        })
        dispatch(updateUserField({ key: "profileUrl", value: response.data.result }));
      } else {
        throw new Error(response.data?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      showToast.error(t('error'), t('failedtouploadimagetoserver'));
    } finally {
      setIsLoading(false);
    }
  };

  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
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

  return (
    <>
      <GlobalHeader
        title={t('profile_photo')}
      />

      <View style={styles.container}>
        <View style={styles.profilePhotoContainer}>
          {isLoading ? (
            <CommonLoader fullScreen />
          ) : (
            <Image
              source={{ uri: userDetails?.profileUrl || 'https://via.placeholder.com/350' }}
              style={styles.profilePhoto}
              placeholder={ImagesAssets.userIcon}
              placeholderContentFit='cover'
              contentFit="cover"
              cachePolicy={"memory-disk"}
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.replaceButton, isLoading && styles.disabledButton]}
          onPress={openBottomSheet}
          disabled={isLoading}
        >
          <Text style={styles.replaceButtonText}>
            {userDetails?.profilePhoto ? t('replace') : t('update')}
          </Text>
        </TouchableOpacity>
      </View>
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
          enablePanDownToClose
          handleIndicatorStyle={{ height: 4, backgroundColor: '#ccc', width: 40 }}
        >
          <BottomSheetView style={styles.sheetContent}>
            <Text style={styles.modalTitle}>{t('addprofilephoto')}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => pickImage('camera')}
            >
              <Camera size={24} color="#02130B" />
              <Text style={styles.modalButtonText}>{t('takephoto')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => pickImage('library')}
            >
              <GalleryIcon size={24} color="#02130B" />
              <Text style={styles.modalButtonText}>{t('choosefromgallery')}</Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </>
  );
};

export default ProfilePhoto;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  profilePhotoContainer: {
    justifyContent: 'center',
    marginBottom: 100,
    alignItems: 'center',
  },
  profilePhoto: {
    borderRadius: 175,
    width: 350,
    height: 350,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  replaceButton: {
    position: 'absolute',
    bottom: 50,
    width: width * 0.9,
    backgroundColor: '#02130B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  replaceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  sheetContent: {
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#02130B',
    fontWeight: '500',
  },
});