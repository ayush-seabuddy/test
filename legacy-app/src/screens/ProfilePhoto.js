import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Platform,
  PermissionsAndroid,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import ImagePicker from "react-native-image-crop-picker";
import ProfileSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import { ImagesAssets } from "../assets/ImagesAssets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { apiServerUrl } from "../Api";
import Toast from "react-native-simple-toast";
import FastImage from "react-native-fast-image";
import api from "../CustomAxios";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("screen");

const ProfilePhoto = React.memo(({ navigation }) => {
  const refRBSheet = useRef(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // Request Camera Permission (Android Only)
  const requestCameraPermission = useCallback(async () => {
    if (Platform.OS !== "android") return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: t('camerapermission'),
          message: t('camerapermission_description'),
          buttonNeutral: t('askmelater'),
          buttonNegative: t('cancel'),
          buttonPositive: t('ok'),
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn("Camera permission error:", err);
      return false;
    }
  }, []);

  // Memoized image picker options
  const imagePickerOptions = useMemo(
    () => ({
      cropping: true,
      freeStyleCropEnabled: true,
      cropperCircleOverlay: false,
      compressImageQuality: 0.7,
      mediaType: "photo",
      includeBase64: false,
      maxFiles: 1,
      forceJpg: false,
      width: 600,
      height: 600,
    }),
    []
  );

  // Handle image picker response
  const handleImagePickerResponse = useCallback(
    (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        console.log("ImagePicker Error:", response.errorMessage);
        return;
      }
      const uri = response.path || response.assets?.[0]?.uri;
      if (uri) uploadImageToApi(uri);
    },
    [uploadImageToApi]
  );

  // Open Image Picker
  const openImagePicker = useCallback(
    async (type) => {
      refRBSheet.current.close();
      await new Promise((resolve) => setTimeout(resolve, 300));
      const hasPermission = type === "camera" ? await requestCameraPermission() : true;
      if (!hasPermission) {
        Alert.alert(t('permissiondenied'), t('camerapermissionrequired'));
        return;
      }

      try {
        const picker = type === "camera" ? ImagePicker.openCamera : ImagePicker.openPicker;
        picker(imagePickerOptions).then(handleImagePickerResponse).catch((error) => {
          if (error.message !== "User cancelled image selection") {
            console.error(`${type} error:`, error);
          }
        });
      } catch (error) {
        if (error.message !== "User cancelled image selection") {
          console.error("Image picker error:", error);
        }
      }
    },
    [requestCameraPermission, imagePickerOptions, handleImagePickerResponse]
  );

  // Upload Image to API
  const uploadImageToApi = useCallback(async (imageUri) => {
    try {
      setLoading(true);
      const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
      if (!userDetails) throw new Error("No user details found");

      const fileName = imageUri.split("/").pop();
      const data = new FormData();
      data.append("file", {
        uri: imageUri,
        name: fileName || "image.jpg",
        type: "image/jpeg",
      });

      const res = await axios.post(`${apiServerUrl}/user/uploadFile`, data, {
        headers: {
          authToken: userDetails.authToken,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.result) {
        updateProfilePhoto(res.data.result);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Toast.show(t('failedtouploadimage'), Toast.LONG);
    } finally {
      setLoading(false);
    }
  }, [updateProfilePhoto]);

  // Fetch user profile details
  const getProfileDetails = useCallback(async () => {
    try {
      setLoading(true);
      const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
      if (!userDetails) throw new Error("No user details found");

      const response = await api.get(`${apiServerUrl}/user/viewUserProfile`, {
        headers: { authToken: userDetails.authToken },
        params: { userId: userDetails.id },
      });

      if (response.data.responseCode === 200) {
        setProfilePhoto(response.data.result.profileUrl);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Toast.show(t('failedtofetchdata'), Toast.LONG);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile photo
  const updateProfilePhoto = useCallback(async (photoUri) => {
    try {
      setLoading(true);
      const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
      if (!userDetails) throw new Error("No user details found");

      const response = await axios.put(
        `${apiServerUrl}/user/updateProfile`,
        { userId: userDetails.id, profileUrl: photoUri },
        {
          headers: {
            authToken: userDetails.authToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.responseCode === 200) {
        Toast.show(t('profileupdatedsuccessfully'), Toast.LONG);
        setProfilePhoto(photoUri);
        const updatedUserDetails = { ...userDetails, profileUrl: photoUri };
        await AsyncStorage.setItem("userDetails", JSON.stringify(updatedUserDetails));
      }
    } catch (error) {
      console.error("Update Profile Error:", error);
      Toast.show(t('errorwhileupdatingprofile'), Toast.LONG);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProfileDetails();
  }, [getProfileDetails]);

  // Memoized profile image source
  const profileImageSource = useMemo(
    () =>
      profilePhoto
        ? { uri: profilePhoto }
        : require("../assets/images/AnotherImage/Man.png"),
    [profilePhoto]
  );

  return (
    <>
      <ProfileSettingHeader navigation={navigation} title={t('profile_photo')} />
      <SafeAreaView style={styles.container}>
        <View style={styles.profilePhotoContainer}>
          <FastImage source={profileImageSource} style={styles.profilePhoto} />
          {loading && (
            <ActivityIndicator
              style={StyleSheet.absoluteFill}
              size="large"
              color="#02130B"
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.replaceButton}
          onPress={() => refRBSheet.current.open()}
        >
          <Text style={styles.replaceButtonText}>
            {profilePhoto ? t('replace') : t('update')}
          </Text>
        </TouchableOpacity>

        <RBSheet
          ref={refRBSheet}
          height={220}
          openDuration={250}
          closeOnDragDown
          closeOnPressMask
          draggable
          customStyles={{
            container: styles.sheetContainer,
            draggableIcon: styles.draggableIcon,
          }}
        >
          <View style={styles.sheetContent}>
            <Text style={styles.modalTitle}>{t('addprofilephoto')}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => openImagePicker("camera")}
            >
              <Image source={ImagesAssets.CameraIcon} style={styles.headerIcon} />
              <Text style={styles.modalButtonText}>{t('takephoto')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => openImagePicker("library")}
            >
              <Image source={ImagesAssets.GalleryIcon} style={styles.headerIcon} />
              <Text style={styles.modalButtonText}>{t('choosefromgallery')}</Text>
            </TouchableOpacity>
          </View>
        </RBSheet>
      </SafeAreaView>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profilePhotoContainer: {
    justifyContent: "center",
    marginBottom: 100,
    alignItems: "center",
  },
  profilePhoto: {
    borderRadius: 175,
    width: 350,
    height: 350,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  replaceButton: {
    position: "absolute",
    bottom: 50,
    width: width * 0.9,
    backgroundColor: "#02130B",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 5,
    alignItems: "center",
  },
  replaceButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#DADADA",
  },
  draggableIcon: {
    backgroundColor: "#ccc",
    width: width * 0.3,
    height: 5,
    borderRadius: 5,
  },
  sheetContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DADADA",
    marginBottom: 20,
  },
  modalTitle: {
    width: width * 0.9,
    marginVertical: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#343434",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
  },
  modalButtonText: {
    paddingLeft: 10,
    color: "#343434",
    fontSize: 16,
  },
  headerIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
});

export default ProfilePhoto;