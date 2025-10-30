import React, { useEffect, useState, Component, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
  Alert,
  PermissionsAndroid,
  Modal,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import ProfleSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
const { height, width } = Dimensions.get("screen");
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { ImagesAssets } from "../assets/ImagesAssets";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import { apiServerUrl } from "../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Badge } from "react-native-paper";
import firestore from "@react-native-firebase/firestore";
import Spinner from "react-native-loading-spinner-overlay";
import SimpleToast from "react-native-simple-toast";
import axios from "axios";
import Video, { ResizeMode } from "react-native-video";
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { request, RESULTS, PERMISSIONS } from "react-native-permissions";
import ImagePicker from "react-native-image-crop-picker";
import { Image as ImageCompressor, Video as VideoCompressor } from 'react-native-compressor';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Linking } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong: {this.state.error?.message}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// Memoized UserListItem component
const UserListItem = React.memo(({ item, onSelect, isSelected }) => {
  const userImage = item.profileUrl || "https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg";

  return (
    <TouchableOpacity
      onPress={() => onSelect(item)}
      style={[
        styles.userListItem,
        {
          backgroundColor: isSelected ? "#ededed" : "#fff",
        }
      ]}
    >
      <Image
        source={{ uri: userImage }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.fullName}</Text>
        <Text style={styles.userDesignation}>{item.designation}</Text>
      </View>
    </TouchableOpacity>
  );
});

UserListItem.displayName = 'UserListItem';

const NewPost = ({ navigation }) => {
  const route = useRoute();
  const [caption, setCaption] = useState("");
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [CrewList, setCrewList] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [showTagPeopleSheet, setShowTagPeopleSheet] = useState(false);
  const [postId, setPostId] = useState(null);
  const [isTagPeopleSheetReady, setIsTagPeopleSheetReady] = useState(false); // New state for delayed rendering

  // Refs for BottomSheets
  const mediaBottomSheetRef = useRef(null);
  const tagPeopleBottomSheetRef = useRef(null);

  // Use useMemo for snap points to prevent re-creation
  const snapPoints = useMemo(() => ["40%"], []);
  const tagPeopleSnapPoints = useMemo(() => ["95%"], []); // Near-full screen with handle

  // Memoized selected items for stable reference
  const [selectedItems, setSelectedItems] = useState([]);

  // Handle BottomSheet state changes for delayed rendering
  const handleTagPeopleSheetChange = useCallback((index) => {
    if (index >= 0) {
      // Sheet is opening
      setTimeout(() => {
        setIsTagPeopleSheetReady(true);
      }, 100); // 100ms delay to ensure animation completes
    } else {
      // Sheet is closing
      setIsTagPeopleSheetReady(false);
    }
  }, []);

  // Prefill data from navigation params - memoized to prevent unnecessary re-runs
  useEffect(() => {
    if (route.params) {
      const { mediaFiles, caption: routeCaption, taggedUsers, hashtags: routeHashtags, postId } = route.params;

      if (mediaFiles?.length > 0) {
        const processedMedia = mediaFiles.map((url, index) => ({
          uri: url,
          type: getMediaType(url),
          mime: url.match(/\.(mp4|mov|avi)$/i) ? "video/mp4" : "image/jpeg",
          size: 0,
          id: `${url}-${index}`,
        }));
        setSelectedMedia(processedMedia);
      }

      if (routeCaption) setCaption(routeCaption);
      if (taggedUsers) setSelectedItems(taggedUsers);
      if (routeHashtags) setHashtags(routeHashtags);
      if (postId) setPostId(postId);
    }
  }, [route.params]);

  // Memoized filtered crew list excluding current user
  const filteredCrewList = useMemo(() => {
    return CrewList.filter(item => item.id !== currentUserId);
  }, [CrewList, currentUserId]);

  // Memoized selected items for display
  const visibleSelectedItems = useMemo(() => {
    return selectedItems.slice(0, 3);
  }, [selectedItems]);

  const moreCount = useMemo(() => {
    return selectedItems.length > 3 ? selectedItems.length - 3 : 0;
  }, [selectedItems]);

  // Memoized current user ID from AsyncStorage
  const [currentUserId, setCurrentUserId] = useState(null);
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("userDetails");
        if (userData) {
          const parsedData = JSON.parse(userData);
          setCurrentUserId(parsedData.id);
        }
      } catch (error) {
        console.error("Error getting current user:", error);
      }
    };
    getCurrentUser();
  }, []);

  // Unified toast function for react-native-simple-toast
  const showToast = useCallback((message, type = 'success') => {
    const duration = type === 'success' ? SimpleToast.LONG : SimpleToast.SHORT;
    const position = SimpleToast.TOP;

    SimpleToast.show(
      message,
      SimpleToast.LONG,
      position,
      1,
      50,
      type === 'error' ? SimpleToast.BACKGROUND_COLOR : SimpleToast.DEFAULT_BACKGROUND_COLOR
    );
  }, []);

  // Optimized GetAllUser function
  const GetAllUser = useCallback(async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userDetails");
      const userData = JSON.parse(userDataString);

      const queryParams = new URLSearchParams({
        shipId: userData.shipId,
      }).toString();

      const response = await fetch(
        `${apiServerUrl}/user/listAllUsers?${queryParams}`,
        {
          method: "GET",
          headers: { authToken: userData.authToken },
        }
      );

      const result = await response.json();
      if (result?.result?.usersList) {
        setCrewList(result.result.usersList.filter(item => item.id !== userData.id));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    GetAllUser();
  }, [GetAllUser]);

  // Memoized handlers for stable references
  const handleSelectItem = useCallback((item) => {
    setSelectedItems(prev => {
      const index = prev.findIndex(selectedItem => selectedItem.id === item.id);
      if (index === -1) {
        return [...prev, item];
      } else {
        return prev.filter(selectedItem => selectedItem.id !== item.id);
      }
    });
  }, []);

  const handleInputChange = useCallback((text) => {
    setInput(text);
  }, []);

  const handleAddTag = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed === "" || trimmed === "#" || trimmed.length < 2) {
      showToast("Hashtags must be at least one character long (excluding #).", 'error');
      return;
    }

    const formattedTag = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

    setHashtags(prevTags => {
      if (prevTags.includes(formattedTag)) {
        showToast(`Hashtag ${formattedTag} is already added.`, 'info');
        return prevTags;
      }
      return [...prevTags, formattedTag];
    });
    setInput("");
  }, [input, showToast]);

  const handleRemoveTag = useCallback((index) => {
    setHashtags(prevTags => prevTags.filter((_, i) => i !== index));
  }, []);

  const handleKeyPress = useCallback(({ nativeEvent }) => {
    if (nativeEvent.key === "Enter") {
      handleAddTag();
    }
  }, [handleAddTag]);

  const handleRemoveMedia = useCallback((indexToRemove) => {
    setSelectedMedia(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);

  // Permission request functions - unchanged but kept as callbacks for consistency
  const requestCameraPermission = useCallback(async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "App needs access to your camera to take photos or videos.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn("Error requesting Android camera permission:", err);
        return false;
      }
    } else if (Platform.OS === "ios") {
      try {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        switch (result) {
          case RESULTS.GRANTED:
            return true;
          case RESULTS.DENIED:
            Alert.alert(
              "Permission Denied",
              "You need to grant camera permission to use this feature.",
              [{ text: "OK" }]
            );
            return false;
          case RESULTS.BLOCKED:
            Alert.alert(
              "Permission Blocked",
              "Camera permission is blocked in your device settings. Please go to Settings > Privacy > Camera to enable it.",
              [{ text: "Cancel" }, { text: "Settings", onPress: () => Linking.openSettings() }]
            );
            return false;
          default:
            return false;
        }
      } catch (err) {
        console.warn("Error requesting iOS camera permission:", err);
        return false;
      }
    }
    return false;
  }, []);

  const requestStoragePermission = useCallback(async () => {
    if (Platform.OS === "android") {
      try {
        if (Platform.Version >= 33) {
          const permissions = [
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          ];
          const granted = await PermissionsAndroid.requestMultiple(permissions);
          return (
            granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED ||
            granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] === PermissionsAndroid.RESULTS.GRANTED
          );
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: "Storage Permission",
              message: "App needs access to your storage to select photos or videos.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn("Error requesting storage permission:", err);
        return false;
      }
    }
    return true;
  }, []);

  // Optimized openImagePicker with memoized options
  const imagePickerOptions = useMemo(() => ({
    cropping: true,
    freeStyleCropEnabled: true,
    cropperCircleOverlay: false,
    compressImageQuality: 0.7,
    includeBase64: false,
    maxFiles: 10,
    videoMaximumDuration: 45,
    forceJpg: false,
    width: 1600,
    height: 1600,
  }), []);

  const openImagePicker = useCallback(async (type, mediaType) => {
    try {
      let hasPermission = true;
      if (type === 'camera') {
        hasPermission = await requestCameraPermission();
      } else if (type === 'library') {
        hasPermission = await requestStoragePermission();
      }

      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          `${type === 'camera' ? 'Camera' : 'Storage'} permission is required.`
        );
        return;
      }

      const options = {
        ...imagePickerOptions,
        mediaType: mediaType || 'any',
        maxFiles: type === 'camera' ? 1 : 10,
        cropping: mediaType === 'photo' ? true : false,
      };

      let response;
      if (type === 'camera') {
        if (mediaType === 'photo') {
          response = await ImagePicker.openCamera(options);
        } else if (mediaType === 'video') {
          response = await ImagePicker.openCamera({ ...options, mediaType: 'video' });
        }
      } else {
        response = await ImagePicker.openPicker(options);
      }

      const mediaItems = Array.isArray(response)
        ? response.map((asset) => ({
          uri: asset.path,
          type: asset.mime?.includes('video') ? 'video' : 'photo',
          mime: asset.mime,
          size: asset.size || 0,
          id: `${asset.path}-${Date.now()}`,
        }))
        : [{
          uri: response.path,
          type: response.mime?.includes('video') ? 'video' : 'photo',
          mime: response.mime,
          size: response.size || 0,
          id: `${response.path}-${Date.now()}`,
        }];

      const compressedMediaItems = await Promise.all(
        mediaItems.map(async (item) => {
          if (item.type === 'photo' && item.size > 5 * 1024 * 1024) {
            let targetQuality = 0.7;
            let compressedUri = item.uri;
            let compressedSize = item.size;

            while (compressedSize > 5.5 * 1024 * 1024 && targetQuality > 0.1) {
              compressedUri = await ImageCompressor.compress(item.uri, {
                compressionMethod: 'manual',
                maxWidth: 1000,
                minimumFileSizeForCompress: 3,
                quality: targetQuality,
              });
              compressedSize = await getFileSize(compressedUri);
              targetQuality -= 0.1;
            }
            return { ...item, uri: compressedUri, size: compressedSize };
          } else if (item.type === 'video') {
            const compressedUri = await VideoCompressor.compress(item.uri, {
              compressionMethod: 'auto',
              minimumFileSizeForCompress: 10,
              quality: 'low',
            });
            return { ...item, uri: compressedUri };
          }
          return item;
        })
      );

      setIsLoading(false);

      const oversizedFiles = compressedMediaItems.filter((item) => item.size > 20 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        Alert.alert(
          'File Too Large',
          `The following files exceed the 20 MB limit:\n${oversizedFiles
            .map((f) => f.uri.split('/').pop())
            .join('\n')}\n\nPlease select smaller files.`,
          [{ text: 'OK' }]
        );
        return;
      }

      setSelectedMedia(prev => [...prev, ...compressedMediaItems]);

      showToast(`${compressedMediaItems.length} media item(s) added.`, 'success');
    } catch (error) {
      if (!error.message?.includes('cancelled')) {
        console.error('Error in openImagePicker:', error);
        showToast(`Failed to select media: ${error.message}`, 'error');
      }
    } finally {
      mediaBottomSheetRef.current?.close();
    }
  }, [imagePickerOptions, requestCameraPermission, requestStoragePermission, showToast]);

  // Utility functions
  const isVideo = useCallback((url) => {
    return url.match(/\.(mp4|mov|avi)$/i);
  }, []);

  const getMediaType = useCallback((path, mime) => {
    if (mime) {
      if (mime.includes("video")) return "video";
      if (mime.includes("image")) return "photo";
    }
    const extension = path.split(".").pop().toLowerCase();
    if (["mp4", "mov", "avi", "mkv"].includes(extension)) return "video";
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) return "photo";
    return "photo";
  }, []);

  const getFileSize = useCallback(async (uri) => {
    try {
      const stat = await RNFS.stat(uri);
      return stat.size;
    } catch (error) {
      console.error("Error getting file size:", error);
      return 0;
    }
  }, []);

  const uploadImageToApi = useCallback(async (media) => {
    try {
      const mediaType = getMediaType(media.uri, media.mime);
      const extension = media.uri.split('.').pop().toLowerCase();
      const mimeType = mediaType === "video" ? `video/${extension}` : `image/${extension === 'png' ? 'png' : 'jpeg'}`;

      const userDetailsString = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(userDetailsString);

      const data = new FormData();
      data.append("file", {
        uri: media.uri,
        name: `media_${Date.now()}.${extension}`,
        type: mimeType,
      });

      const response = await axios.post(
        `${apiServerUrl}/user/uploadFile`,
        data,
        {
          headers: {
            authToken: userDetails.authToken,
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );

      if (response.data.responseCode === 200 && response.data.result) {
        return response.data.result;
      } else {
        throw new Error("Upload failed: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Upload error for", media.uri, ":", error.message);
      throw error;
    }
  }, [getMediaType]);

  // Optimized CreateNewPost function
  const CreateNewPost = useCallback(async () => {
    if (!caption.trim()) {
      showToast("Please add a caption to your post.", 'error');
      return;
    }

    setIsLoading(true);
    try {
      showToast("Creating post...", 'info');

      // Handle media uploads (if any)
      const newMedia = selectedMedia.filter((media) => !media.uri.startsWith('https://'));
      const existingUrls = selectedMedia
        .filter((media) => media.uri.startsWith('https://'))
        .map((media) => media.uri);

      let successfulUploads = [...existingUrls];

      if (newMedia.length > 0) {
        showToast("Uploading Media...", 'info');
        const uploadWithRetry = async (media, retries = 5) => {
          for (let attempt = 1; attempt <= retries; attempt++) {
            try {
              return await uploadImageToApi(media);
            } catch (error) {
              if (attempt === retries) {
                console.error(`Failed to upload ${media.uri} after ${retries} attempts:`, error.message);
                return null;
              }
              console.warn(`Retrying upload for ${media.uri} (Attempt ${attempt + 1})`);
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }
        };

        const uploadedUrls = await Promise.all(
          newMedia.map((item) => uploadWithRetry(item))
        );

        successfulUploads = [...existingUrls, ...uploadedUrls.filter((url) => url !== null)];

        if (newMedia.length > 0 && successfulUploads.length < selectedMedia.length) {
          showToast(`Some media files failed to upload. Proceeding with ${successfulUploads.length} of ${selectedMedia.length} files.`, 'warning');
        }
      }

      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Authentication token is missing");
      }

      const postData = {
        imageUrls: successfulUploads, // Can be empty
        caption: caption.trim(),
        tags: selectedItems.map((item) => item.id),
        hashtags,
      };

      const payload = postId
        ? { ...postData, id: postId }
        : { hangouts: [{ ...postData, createdAt: new Date().toISOString() }] };

      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("authToken", authToken);

      const requestOptions = {
        method: postId ? "PUT" : "POST",
        headers: myHeaders,
        body: JSON.stringify(payload),
        redirect: "follow",
      };

      const url = postId
        ? `${apiServerUrl}/user/updateHangoutPostById`
        : `${apiServerUrl}/user/createHangoutPost`;

      const response = await fetch(url, requestOptions);
      const result = await response.json();

      if (result.responseCode === 200) {
        showToast(postId ? "Your post has been updated successfully." : "Your post has been shared successfully.", 'success');
        setTimeout(() => {
          navigation.navigate("Home", {
            screen: "SeaBuddy",
            params: { name: "hangout" },
          });
        }, 1500);
      } else {
        throw new Error(
          result.message || (postId ? "Post update failed" : "Post creation failed")
        );
      }
    } catch (error) {
      console.error("Error processing post:", error.message);
      let errorMessage = "Failed to process post. Please try again.";
      if (error.message.includes("Authentication")) {
        errorMessage = "Authentication failed. Please log in again.";
      } else if (error.message.includes("Network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }

      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMedia, caption, selectedItems, hashtags, postId, uploadImageToApi, navigation, showToast]);

  // Memoized render functions
  const renderMediaHeader = useCallback(() => (
    <TouchableOpacity
      style={[
        styles.Imagebutton,
        {
          marginHorizontal: 15,
          backgroundColor: selectedMedia.length > 0 ? 'white' : '#ededed'
        }
      ]}
      onPress={() => mediaBottomSheetRef.current?.expand()}
    >
      <Image
        source={require("../assets/images/NewPostImage/camera.png")}
        style={[styles.headerIcon, { height: 30, width: 30 }]}
      />
      <Text style={styles.attachText}>+ Attach more</Text>
    </TouchableOpacity>
  ), [selectedMedia.length]);

  const renderMediaItem = useCallback(({ item, index }) => (
    <TouchableOpacity
      style={styles.mediaContainer}
      activeOpacity={0.9}
    >
      {item.type === "video" ? (
        <Video
          source={{ uri: item.uri }}
          style={[styles.selectedPhoto, { overflow: 'hidden' }]}
          muted
          paused
          onError={(e) => console.error("Video error:", e)}
          resizeMode={ResizeMode.STRETCH}
        />
      ) : (
        <Image
          source={{ uri: item.uri }}
          style={styles.selectedPhoto}
          resizeMode="cover"
        />
      )}
      <TouchableOpacity
        style={styles.removeMediaButton}
        onPress={() => handleRemoveMedia(index)}
        activeOpacity={0.7}
      >
        <Image
          source={
            ImagesAssets.closeIcons
          }
          style={{ height: 20, width: 20, tintColor: 'white' }}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  ), [handleRemoveMedia]);

  const renderHashtag = useCallback(({ item: tag, index }) => (
    <TouchableOpacity
      key={index}
      activeOpacity={0.7}
      onPress={() => handleRemoveTag(index)}
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FBCF21',
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 5,
        borderRadius: 5,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: 'black', fontSize: 12, fontFamily: 'Poppins-Regular' }}>{tag}</Text>
      <Text
        style={{
          marginLeft: 6,
          color: 'black',
          fontFamily: 'Poppins-Regular',
          fontWeight: 'bold',
          fontSize: 12,
        }}
      >
        ✕
      </Text>
    </TouchableOpacity>
  ), [handleRemoveTag]);

  const renderTaggedUser = useCallback(({ item, index }) => (
    <View key={index} style={styles.taggedUser}>
      <Image
        source={
          item?.profileUrl
            ? { uri: item.profileUrl }
            : { uri: 'https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg' }
        }
        style={styles.taggedUserAvatar}
      />

      <Text style={styles.taggedUserName} numberOfLines={1}>
        {item.fullName || "Unknown"}
      </Text>
    </View>
  ), []);

  const renderTagPeopleBackdrop = useCallback((props) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
      pressBehavior="close"
    />
  ), []);

  const renderMediaBackdrop = useCallback((props) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
      pressBehavior="close"
    />
  ), []);

  // Memoized empty array for FlatList
  const emptyData = useMemo(() => [], []);

  return (
    <ErrorBoundary>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <View style={styles.mainContainer}>
          <FocusAwareStatusBar
            barStyle="light-content"
            backgroundColor={"#DADADA99"}
            hidden={false}
          />

          <ProfleSettingHeader
            navigation={navigation}
            title={postId ? "Edit Post" : "Create New Post"}
          />

          <FlatList
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={styles.container}
            data={emptyData}
            renderItem={() => null}
            ListHeaderComponent={
              <>
                <View style={styles.spinnerOverlay}>
                  <Spinner visible={isLoading} size="large" color="#000" />
                </View>

                <View style={styles.contentContainer}>
                  <Text style={styles.headingText}>
                    Keep it positive{'\n'}
                    Share content that’s safe, respectful, and uplifting for your crew
                  </Text>
                  {/* Media Selection */}
                  {selectedMedia.length > 0 ? (
                    <FlatList
                      horizontal
                      data={selectedMedia}
                      keyExtractor={(item) => item.id}
                      renderItem={renderMediaItem}
                      showsHorizontalScrollIndicator={false}
                      style={styles.mediaList}
                      ListHeaderComponent={renderMediaHeader}
                      removeClippedSubviews={true}
                      maxToRenderPerBatch={10}
                      windowSize={5}
                    />
                  ) : (
                    <View style={styles.emptyMediaContainer}>
                      <TouchableOpacity
                        style={styles.Imagebutton}
                        onPress={() => mediaBottomSheetRef.current?.expand()}
                      >
                        <Image
                          source={require("../assets/images/NewPostImage/gallery.png")}
                          style={[styles.headerIcon, { height: 30, width: 30 }]}
                        />
                        <Text style={styles.attachText}>+ Add Photo/Video (Optional)</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Caption Input */}
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.captionContainer}>
                      <View style={[styles.inputSection, { marginHorizontal: 10 }]}>
                        <Text style={styles.sectionTitle}>Write a caption</Text>
                        <TextInput
                          style={styles.captionInput}
                          maxLength={400}
                          placeholder="What's on your mind? Share your thoughts..."
                          placeholderTextColor="#949494"
                          value={caption}
                          onChangeText={setCaption}
                          multiline={true}
                          textAlignVertical="top"
                        />
                      </View>

                      {/* Post Options */}
                      <View style={styles.postOptions}>
                        {/* Tag People Section */}
                        <View style={styles.inputSection}>
                          <Text style={styles.sectionTitle}>Tag People</Text>
                          <TouchableOpacity
                            style={styles.postOption5}
                            onPress={() => tagPeopleBottomSheetRef.current?.expand()}
                            activeOpacity={0.7}
                          >
                            <View style={styles.postOptionLeft2}>
                              <Icon name="user-tag" size={20} color="#b0db02" />
                              <Text style={styles.tagPeopleText}>Tag people</Text>
                            </View>
                            <Image
                              source={ImagesAssets.CircleRightArrow}
                              style={styles.headerIcon}
                            />
                          </TouchableOpacity>

                          {selectedItems.length > 0 && (
                            <View style={styles.taggedUserRow}>
                              {selectedItems.map((item, index) => renderTaggedUser({ item, index }))}
                            </View>
                          )}
                        </View>

                        {/* Hashtags Section */}
                        <View style={styles.inputSection}>
                          <Text style={styles.sectionTitle}>Add Hashtags</Text>
                          <View style={styles.postOption5}>
                            <Image
                              source={ImagesAssets.hastag}
                              style={styles.headerIcon}
                            />
                            <TextInput
                              style={styles.postOptionLeft}
                              placeholder="Add hashtags"
                              placeholderTextColor={"#949494"}
                              value={input}
                              onChangeText={handleInputChange}
                              onSubmitEditing={handleAddTag}
                              onKeyPress={handleKeyPress}
                              maxLength={20}
                            />
                          </View>

                          <View style={styles.hashtagRow}>
                            {hashtags.map((tag, index) => renderHashtag({ item: tag, index }))}
                          </View>
                        </View>

                        {/* Share Button */}
                        <TouchableOpacity
                          style={[
                            styles.shareButton,
                            isLoading && styles.disabledButton,
                          ]}
                          onPress={CreateNewPost}
                          disabled={isLoading}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.shareButtonText,
                            isLoading && styles.disabledshareButtonText,
                          ]}>
                            {postId ? "Update" : "Share"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </>
            }
          />
        </View>

        {/* Tag People BottomSheet */}
        <BottomSheet
          ref={tagPeopleBottomSheetRef}
          index={-1}
          snapPoints={tagPeopleSnapPoints}
          enablePanDownToClose={true}
          backgroundStyle={styles.bottomSheetBackground}
          backdropComponent={renderTagPeopleBackdrop}
          onChange={handleTagPeopleSheetChange}
        >
          <BottomSheetView style={{ flex: 1 }}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select people to Tag</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {selectedItems.length > 0 && (
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => tagPeopleBottomSheetRef.current?.close()}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => tagPeopleBottomSheetRef.current?.close()}
                >
                  <Image source={ImagesAssets.closeIcons} style={{ height: 20, width: 20 }} />
                </TouchableOpacity>
              </View>
            </View>
            {isTagPeopleSheetReady ? (
              filteredCrewList.length === 0 ? (
                <View style={styles.emptyUsersContainer}>
                  <Text style={styles.emptyUsersText}>
                    No users have boarded your ship yet.
                  </Text>
                </View>
              ) : (
                <ScrollView>
                  <FlatList
                    data={filteredCrewList}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                      <UserListItem
                        item={item}
                        onSelect={handleSelectItem}
                        isSelected={selectedItems.some(selected => selected.id === item.id)}
                      />
                    )}
                  />
                </ScrollView>
              )
            ) : (
              <View style={styles.emptyUsersContainer}>
                <Text style={styles.emptyUsersText}>Loading...</Text>
              </View>
            )}
          </BottomSheetView>
        </BottomSheet>

        {/* Media Picker BottomSheet */}
        <BottomSheet
          ref={mediaBottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          backgroundStyle={styles.bottomSheetBackground}
          backdropComponent={renderMediaBackdrop}
        >
          <BottomSheetView style={styles.containerPhoto}>
            <Text style={styles.titlePhoto}>Select Media</Text>
            <TouchableOpacity
              style={styles.buttonPhoto}
              onPress={() => {
                openImagePicker("camera", "photo");
                mediaBottomSheetRef.current?.close();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonTextPhoto}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonPhoto}
              onPress={() => {
                openImagePicker("camera", "video");
                mediaBottomSheetRef.current?.close();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonTextPhoto}>Take Video</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonPhoto}
              onPress={() => {
                openImagePicker("library", "any");
                mediaBottomSheetRef.current?.close();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonTextPhoto}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => mediaBottomSheetRef.current?.close()}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelTextPhoto}>Cancel</Text>
            </TouchableOpacity>
          </BottomSheetView>
        </BottomSheet>
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
};

// Updated styles with optimizations
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  spinnerOverlay: {
    position: "absolute",
    top: "50%",
    right: 0,
    left: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  Imagebutton: {
    height: 150,
    width: 150,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 15,
    margin: 20,
    backgroundColor: "#ededed",
  },
  emptyMediaContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#ededed",
    marginHorizontal: 10,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  mediaList: {
    marginHorizontal: 15,
    marginTop: 10,
  },
  mediaContainer: {
    flex: 1,
    marginBottom: 20,
  },
  selectedPhoto: {
    height: 150,
    width: 150,
    borderRadius: 10,
    marginRight: 10,
    marginTop: 20,
  },
  removeMediaButton: {
    position: "absolute",
    right: 10,
    borderColor: 'white',
    borderWidth: 1,
    top: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  removeMediaText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  captionContainer: {
    flex: 1,
  },
  inputSection: {
    backgroundColor: '#ededed',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    marginVertical: 2,
    fontFamily: 'Poppins-SemiBold',
    color: 'black',
    fontSize: 13,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: "#e6e8e6",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    fontSize: 12,
    color: "#000",
    fontFamily: 'Poppins-Regular',
    height: 100,
    textAlignVertical: "top",
    marginTop: 10,
  },
  postOptions: {
    paddingHorizontal: 10,
    flexDirection: "column",
  },
  postOption5: {
    flexDirection: "row",
    width: "100%",
    height: height * 0.055,
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  postOptionLeft2: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagPeopleText: {
    paddingLeft: 10,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#949494",
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#f1f1f1",
  },
  moreCount: {
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -30,
  },
  countText: {
    color: "white",
    fontWeight: "bold",
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  taggedUserRow: {
    marginTop: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taggedUser: {
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
    paddingRight: 10,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 25,
  },
  taggedUserAvatar: {
    width: 30,
    height: 30,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  taggedUserName: {
    marginLeft: 10,
    fontSize: 10,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },
  postOptionLeft: {
    flexDirection: "row",
    flex: 1,
    marginLeft: 10,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#949494",
  },
  hashtag: {
    backgroundColor: "#FBCF21",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  hashtagText: {
    color: "#06361F",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    textAlign: "left",
  },
  hashtagRemove: {
    position: "absolute",
    right: 0,
    top: -5,
    fontWeight: "900",
    fontSize: 14,
    color: "#06361F",
  },
  hashtagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  shareButton: {
    backgroundColor: "#02130B",
    padding: 15,
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 20,
    marginHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: "#808080",
    borderWidth: 0.5,
    borderColor: "gray",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    lineHeight: 20,
  },
  disabledshareButtonText: {
    color: "#fff",
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  attachText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
  },
  bottomSheetBackground: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  containerPhoto: {
    padding: 20,
    alignItems: "center",
  },
  titlePhoto: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  buttonPhoto: {
    width: "100%",
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "black",
  },
  buttonTextPhoto: {
    color: "black",
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelTextPhoto: {
    color: "#777",
    fontSize: 16,
  },
  tagPeopleContainer: {
    flex: 1,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  closeButton: {
    padding: 5,
  },
  doneButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#02130B',
    borderRadius: 5,
    marginRight: 10,
  },
  doneButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
  },
  closeText: {
    fontSize: 16,
    color: "#666",
    fontFamily: "Poppins-SemiBold",
  },
  userListItem: {
    flexDirection: "row",
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 20,
    marginVertical: 3,
    borderColor: "#ededed",
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  userAvatar: {
    height: 50,
    width: 50,
    borderRadius: 10,
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    color: "#636363",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  userDesignation: {
    color: "#636363",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  emptyUsersContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyUsersText: {
    fontSize: 17,
    textAlign: "center",
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Poppins-Regular",
  },
  retryButton: {
    backgroundColor: "#02130B",
    padding: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  headingText: {
    fontSize: 13,
    marginHorizontal: 10,
    marginVertical: 10,
    color: 'grey',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  }
});

export default NewPost;