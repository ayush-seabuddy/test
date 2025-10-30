import React, { useEffect, useState, useCallback, useMemo, useRef, Component } from "react";
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
  PermissionsAndroid,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import ProfleSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import { ImagesAssets } from "../assets/ImagesAssets";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import { apiServerUrl } from "../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImagePicker from "react-native-image-crop-picker";
import NetInfo from "@react-native-community/netinfo";
import firestore from "@react-native-firebase/firestore";
import Spinner from "react-native-loading-spinner-overlay";
import axios from "axios";
import Video from "react-native-video";
import { Image as ImageCompressor, Video as VideoCompressor } from "react-native-compressor";
import SimpleToast from "react-native-simple-toast";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import RNFS from "react-native-fs";

const { height, width } = Dimensions.get("screen");

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
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

// Memoized Media Item Component
const MediaItem = React.memo(({ item, index, onRemove }) => (
  <TouchableOpacity style={styles.mediaContainer} activeOpacity={0.9}>
    {item.type === "video" ? (
      <Video
        source={{ uri: item.uri }}
        style={[styles.selectedPhoto, { overflow: "hidden" }]}
        muted
        paused
        resizeMode="stretch"
      />
    ) : (
      <Image
        source={{ uri: Platform.OS === "android" ? `file://${item.uri}` : item.uri }}
        style={styles.selectedPhoto}
        resizeMode="cover"
      />
    )}
    <TouchableOpacity
      style={styles.removeMediaButton}
      onPress={() => onRemove(index)}
      activeOpacity={0.7}
    >
      <Image
        source={ImagesAssets.closeIcons}
        style={{ height: 20, width: 20, tintColor: "white" }}
      />
    </TouchableOpacity>
  </TouchableOpacity>
));

const ApprovalFromCaptain = React.memo(({ navigation, route }) => {
  const [isOn, setIsOn] = useState(false);
  const [isTwo, setIsTwo] = useState(false);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const mediaBottomSheetRef = useRef(null);

  const isSwitch = useCallback(() => setIsOn((prev) => !prev), []);
  const isSwitchTwo = useCallback(() => setIsTwo((prev) => !prev), []);

  const snapPoints = useMemo(() => ["40%"], []);

  const requestCameraPermission = useCallback(async () => {
    if (Platform.OS !== "android") return true;
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
      console.warn("Error requesting camera permission:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    GetuserDetails();
  }, []);

  const GetuserDetails = async () => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    setUserDetails(userDetails);
    console.log('====================================');
    console.log(userDetails);
    console.log('====================================');
  };

  const requestStoragePermission = useCallback(async () => {
    if (Platform.OS !== "android") return true;
    try {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);
        console.log("Permissions granted:", granted);
        return (
          granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] === PermissionsAndroid.RESULTS.GRANTED
        );
      }
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
      console.log("Storage permission granted:", granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn("Error requesting storage permission:", err);
      return false;
    }
  }, []);

  const showToast = useCallback((message, type = "success") => {
    const duration = type === "success" ? SimpleToast.LONG : SimpleToast.SHORT;
    SimpleToast.show(message, duration, SimpleToast.TOP);
  }, []);

  const getPersistentPath = (originalUri, type) => {
    const timestamp = Date.now();
    const extension = originalUri.split('.').pop();
    const fileName = `${type}_${timestamp}.${extension}`;
    return `${RNFS.DocumentDirectoryPath}/${fileName}`;
  };

  const openImagePicker = useCallback(
    async (type, mediaType) => {
      const hasPermission = type === "camera" ? await requestCameraPermission() : await requestStoragePermission();
      if (!hasPermission) {
        showToast(`${type === "camera" ? "Camera" : "Storage"} permission is required.`, "error");
        return;
      }

      try {
        setIsLoading(true);
        const options = {
          cropping: mediaType === "photo",
          freeStyleCropEnabled: true,
          cropperCircleOverlay: false,
          compressImageQuality: 0.7,
          mediaType: mediaType || "any",
          includeBase64: false,
          maxFiles: type === "camera" ? 1 : 10,
          videoMaximumDuration: 45,
          forceJpg: false,
          width: 1600,
          height: 1600,
        };

        let response;
        if (type === "camera") {
          response = await ImagePicker.openCamera({ ...options, mediaType: mediaType === "video" ? "video" : "photo" });
        } else {
          response = await ImagePicker.openPicker(options);
        }

        // Normalize to array
        const mediaItems = Array.isArray(response) ? response : [response];

        // Initial mapping
        let processedItems = mediaItems
          .map((asset) => ({
            uri: asset.path,
            type: asset.mime?.includes("video") ? "video" : "photo",
            mime: asset.mime,
            size: asset.size || 0,
            id: `${asset.path}-${Date.now()}`,
          }))
          .filter((item) => RNFS.exists(item.uri).then((exists) => exists)); // Early filter invalid

        if (processedItems.length === 0) {
          showToast("No valid media selected.", "error");
          return;
        }

        // Compression + Persistent Copy
        const compressedMediaItems = await Promise.all(
          processedItems.map(async (item) => {
            let compressedUri = item.uri;
            let compressedSize = item.size;

            console.log("Original URI:", item.uri);

            if (item.type === "photo" && item.size > 5 * 1024 * 1024) {
              let targetQuality = 0.7;
              while (compressedSize > 5.5 * 1024 * 1024 && targetQuality > 0.1) {
                compressedUri = await ImageCompressor.compress(item.uri, {
                  compressionMethod: "manual",
                  maxWidth: 1000,
                  quality: targetQuality,
                });
                compressedSize = await RNFS.stat(compressedUri).then((stat) => stat.size).catch(() => item.size);
                targetQuality -= 0.1;
              }
            } else if (item.type === "video") {
              try {
                compressedUri = await VideoCompressor.compress(item.uri, {
                  compressionMethod: "auto",
                  minimumFileSizeForCompress: 10,
                  quality: "low",
                });
                // Update size post-compress
                compressedSize = await RNFS.stat(compressedUri).then((stat) => stat.size).catch(() => item.size);
              } catch (compressErr) {
                console.warn("Video compression failed, using original:", compressErr);
              }
            }

            console.log("Compressed URI:", compressedUri);

            // Copy to persistent (even if not compressed)
            const persistentUri = getPersistentPath(compressedUri, item.type);
            await RNFS.copyFile(compressedUri, persistentUri);

            // Verify file exists after copying
            const exists = await RNFS.exists(persistentUri);
            if (!exists) {
              console.error(`File does not exist after copying: ${persistentUri}`);
              return null;
            }

            console.log("Persistent URI:", persistentUri);
            console.log("File exists:", exists);

            // Clean temp if not persistent (skip if already persistent)
            if (compressedUri !== item.uri && !compressedUri.startsWith(RNFS.DocumentDirectoryPath)) {
              RNFS.unlink(compressedUri).catch(console.warn);
            }

            return { ...item, uri: persistentUri, size: compressedSize };
          })
        ).then((items) => items.filter(Boolean)); // Filter out null items

        // Size check on final
        const oversizedFiles = compressedMediaItems.filter((item) => item.size > 20 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
          showToast(
            `Files exceed 20 MB: ${oversizedFiles.map(f => f.uri.split("/").pop()).join(", ")}. Select smaller ones.`,
            "error"
          );
          // Clean up oversized
          oversizedFiles.forEach(async (f) => RNFS.unlink(f.uri).catch(console.warn));
          return;
        }

        setSelectedMedia((prev) => [...prev, ...compressedMediaItems]);
        showToast(`${compressedMediaItems.length} item(s) added.`, "success");
      } catch (error) {
        if (!error.message?.includes("cancelled") && !error.message?.includes("userCancelled")) {
          console.error("Picker error:", error);
          showToast(`Failed to select: ${error.message}`, "error");
        }
      } finally {
        setIsLoading(false);
        mediaBottomSheetRef.current?.close();
      }
    },
    [requestCameraPermission, requestStoragePermission, showToast]
  );

  const getMediaType = useCallback((path, mime) => {
    if (mime) return mime.includes("video") ? "video" : "photo";
    const extension = path.split(".").pop().toLowerCase();
    return ["mp4", "mov", "avi", "mkv"].includes(extension) ? "video" : "photo";
  }, []);

  const uploadImageToApi = useCallback(
    async (media) => {
      try {
        // Verify file still exists
        const exists = await RNFS.exists(media.uri);
        if (!exists) {
          console.error("File missing before upload:", media.uri);
          // Clean from state if in selectedMedia (optional: dispatch removal)
          return null;
        }

        // Read file to ensure accessibility
        const fileStat = await RNFS.stat(media.uri);
        console.log("File stats:", fileStat);

        const mediaType = getMediaType(media.uri, media.mime);
        const fileExtension = mediaType === "video" ? "mp4" : "jpg";
        const mimeType = mediaType === "video" ? "video/mp4" : "image/jpeg";

        const data = new FormData();
        const userDetails = await AsyncStorage.getItem("userDetails").then(JSON.parse);
        data.append("file", {
          uri: Platform.OS === "android" ? `file://${media.uri}` : media.uri,
          name: `media_${Date.now()}.${fileExtension}`,
          type: mimeType,
        });

        console.log("Uploading file:", {
          uri: Platform.OS === "android" ? `file://${media.uri}` : media.uri,
          name: `media_${Date.now()}.${fileExtension}`,
          type: mimeType,
        });

        const response = await axios.post(`${apiServerUrl}/user/uploadFile`, data, {
          headers: {
            authToken: userDetails.authToken,
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          timeout: 120000, // Increase for videos
        });

        console.log("Upload response:", response.data);

        // Clean up after success
        RNFS.unlink(media.uri).catch(console.warn);

        return response.data.responseCode === 200 && response.data.result ? response.data.result : null;
      } catch (error) {
        console.error("Upload error:", error.message, error.response?.data);
        return null;
      }
    },
    [getMediaType]
  );

  const handleRemoveMedia = useCallback((indexToRemove) => {
    const mediaToRemove = selectedMedia[indexToRemove];
    RNFS.unlink(mediaToRemove.uri).catch(console.warn); // Clean up
    setSelectedMedia((prev) => prev.filter((_, index) => index !== indexToRemove));
  }, [selectedMedia]);

  const validate = useCallback(async () => {
    const isCaptionValid = caption.trim() !== "";
    const isMediaValid = selectedMedia.length > 0;

    if (isMediaValid && isCaptionValid) {
      CreateNewPost();
    } else {
      setError(
        !isMediaValid && !isCaptionValid
          ? "Please upload at least one media file and fill description."
          : !isMediaValid
            ? "Please upload at least one media file."
            : "Description is required."
      );
      showToast(
        !isMediaValid && !isCaptionValid
          ? "Please upload at least one media file and fill description."
          : !isMediaValid
            ? "Please upload at least one media file."
            : "Description is required.",
        "error"
      );
    }
  }, [caption, selectedMedia, CreateNewPost, showToast]);

  const CreateNewPost = useCallback(
    async () => {
      setIsLoading(true);
      try {
        showToast("Uploading Media...", "info");

        const uploadedUrls = await Promise.all(selectedMedia.map(uploadImageToApi));
        const successfulUploads = uploadedUrls.filter((url) => url !== null);

        if (successfulUploads.length === 0) {
          throw new Error("All media uploads failed");
        }

        // Remove failed media from selectedMedia
        const failedIndices = uploadedUrls
          .map((url, index) => (url === null ? index : null))
          .filter(Boolean);
        failedIndices.reverse().forEach((index) => {
          const mediaToRemove = selectedMedia[index];
          RNFS.unlink(mediaToRemove.uri).catch(console.warn);
          setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
        });

        if (successfulUploads.length < selectedMedia.length) {
          showToast(
            `Some media files failed to upload. Proceeding with ${successfulUploads.length} of ${selectedMedia.length} files.`,
            "warning"
          );
        }

        const authToken = await AsyncStorage.getItem("authToken");
        const response = await axios.post(
          `${apiServerUrl}/activity/addUpdateGroupActivity`,
          {
            groupActivities: [
              {
                eventId: route.params.eventId,
                completionImages: successfulUploads,
                completionDescription: caption,
                status: route.params.isCaptain ? "COMPLETED" : "REQUESTED",
              },
            ],
          },
          { headers: { authToken } }
        );

        if (response.data.responseCode === 200) {
          showToast("Your request has been submitted successfully.", "success");
          setTimeout(() => navigation.goBack(), 1500);
        } else {
          throw new Error("Post creation failed");
        }
      } catch (error) {
        console.error("Error creating post:", error);
        try {
          await firestore().collection("offlinePosts").add({
            imageUris: selectedMedia.map((media) => media.uri) || [], // Ensure array
            caption: caption || "", // Ensure string
            eventId: route.params.eventId || "", // Ensure string
            status: route.params.isCaptain ? "COMPLETED" : "REQUESTED",
            createdAt: new Date().toISOString(),
            type: "create",
          });
          showToast("Failed to create post. It has been saved offline.", "error");
        } catch (firestoreError) {
          console.error("Error saving post to Firestore:", firestoreError);
          showToast("Failed to save post offline.", "error");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [caption, selectedMedia, route.params, navigation, uploadImageToApi, showToast]
  );

  const syncOfflineData = useCallback(
    async () => {
      const connectivity = await NetInfo.fetch();
      if (!connectivity.isConnected) return;

      const offlinePosts = await firestore().collection("offlinePosts").get();
      console.log("Offline posts:", offlinePosts.docs.map((doc) => ({ id: doc.id, data: doc.data() })));
      const userDetails = await AsyncStorage.getItem("userDetails").then(JSON.parse);

      for (const doc of offlinePosts.docs) {
        const data = doc.data();
        try {
          if (data.type === "create") {
            // Validate imageUris
            if (!Array.isArray(data.imageUris)) {
              console.warn(`Invalid or missing imageUris in offline post ${doc.id}:`, data);
              await firestore().collection("offlinePosts").doc(doc.id).delete();
              continue;
            }

            // Validate saved URIs
            const validUris = await Promise.all(
              data.imageUris.map(async (uri) => {
                const exists = await RNFS.exists(uri);
                if (exists) {
                  const media = {
                    uri,
                    type: getMediaType(uri, null),
                    mime: getMediaType(uri, null) === "video" ? "video/mp4" : "image/jpeg",
                    size: await RNFS.stat(uri).then((stat) => stat.size).catch(() => 0),
                  };
                  return media;
                }
                console.warn("Offline URI invalid:", uri);
                return null;
              })
            );
            const validMedia = validUris.filter(Boolean);
            if (validMedia.length === 0) {
              console.warn(`No valid media in offline post ${doc.id}`);
              await firestore().collection("offlinePosts").doc(doc.id).delete();
              continue;
            }

            const uploadedUrls = await Promise.all(validMedia.map(uploadImageToApi));
            const successfulUploads = uploadedUrls.filter((url) => url !== null);

            if (successfulUploads.length === 0) {
              console.warn(`No media uploaded for offline post ${doc.id}`);
              continue;
            }

            const response = await axios.post(
              `${apiServerUrl}/activity/addUpdateGroupActivity`,
              {
                groupActivities: [
                  {
                    eventId: data.eventId,
                    completionImages: successfulUploads,
                    completionDescription: data.caption,
                    status: data.status,
                  },
                ],
              },
              { headers: { authToken: userDetails.authToken } }
            );

            if (response.data.responseCode === 200) {
              // Clean up local files
              validMedia.forEach(async (m) => RNFS.unlink(m.uri).catch(console.warn));
              await firestore().collection("offlinePosts").doc(doc.id).delete();
              showToast("Offline post synced!", "success");
            }
          }
        } catch (syncError) {
          console.error(`Sync error for post ${doc.id}:`, syncError);
        }
      }
    },
    [getMediaType, uploadImageToApi, showToast]
  );

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) syncOfflineData();
    });
    return () => unsubscribe();
  }, [syncOfflineData]);

  const renderMediaHeader = useCallback(
    () => (
      <TouchableOpacity
        style={[
          styles.Imagebutton,
          { marginHorizontal: 15, backgroundColor: selectedMedia.length > 0 ? "white" : "#ededed" },
        ]}
        onPress={() => mediaBottomSheetRef.current?.expand()}
      >
        <Image
          source={require("../assets/images/NewPostImage/camera.png")}
          style={[styles.headerIcon, { height: 30, width: 30 }]}
        />
        <Text style={styles.attachText}>+ Attach more</Text>
      </TouchableOpacity>
    ),
    [selectedMedia.length]
  );

  const renderMediaBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

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
            title={
              userDetails.designation === "Captain" || userDetails.designation === "Chief engineer"
                ? "Share to feed"
                : "Request Approval form"

            }
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
                  {selectedMedia.length > 0 ? (
                    <FlatList
                      horizontal
                      data={selectedMedia}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item, index }) => (
                        <MediaItem item={item} index={index} onRemove={handleRemoveMedia} />
                      )}
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
                        <Text style={styles.attachText}>+ Add Photo/Video</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.captionContainer}>
                      <View style={[styles.inputSection, { marginHorizontal: 10 }]}>
                        <Text style={styles.sectionTitle}>Write a description</Text>
                        <TextInput
                          style={styles.captionInput}
                          maxLength={400}
                          placeholder="What's on your mind? Share your thoughts..."
                          placeholderTextColor="#949494"
                          value={caption}
                          onChangeText={setCaption}
                          multiline
                          textAlignVertical="top"
                        />
                        <Text
                          style={{
                            marginTop: 5,
                            color: "red",
                            fontFamily: "Poppins-Regular",
                            fontSize: 11,
                          }}
                        >
                          {error}
                        </Text>
                      </View>
                      <View style={styles.postOptions}>
                        <TouchableOpacity
                          style={[styles.shareButton, isLoading && styles.disabledButton]}
                          onPress={validate}
                          disabled={isLoading}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.shareButtonText,
                              isLoading && styles.disabledshareButtonText,
                            ]}
                          >
                            Share for Approval
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </>
            }
          />
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
                  mediaBottomSheetRef.current?.close();
                  openImagePicker("camera", "photo");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonTextPhoto}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonPhoto}
                onPress={() => {
                  mediaBottomSheetRef.current?.close();
                  openImagePicker("camera", "video");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonTextPhoto}>Take Video</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonPhoto}
                onPress={() => {
                  mediaBottomSheetRef.current?.close();
                  openImagePicker("library", "any");
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
        </View>
      </KeyboardAvoidingView>
    </ErrorBoundary>
  );
});

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  container: { flex: 1 },
  contentContainer: { flex: 1 },
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
    top: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "white",
    borderWidth: 1,
  },
  captionContainer: { flex: 1 },
  inputSection: {
    backgroundColor: "#ededed",
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    marginVertical: 2,
    fontFamily: "Poppins-SemiBold",
    color: "black",
    fontSize: 13,
  },
  captionInput: {
    borderWidth: 1,
    borderColor: "#e6e8e6",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 8,
    fontSize: 12,
    color: "#000",
    fontFamily: "Poppins-Regular",
    height: 100,
    textAlignVertical: "top",
    marginTop: 10,
  },
  postOptions: {
    paddingHorizontal: 10,
    flexDirection: "column",
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
  disabledshareButtonText: { color: "#fff" },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  attachText: {
    fontFamily: "Poppins-Regular",
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
  cancelButton: { marginTop: 10 },
  cancelTextPhoto: {
    color: "#777",
    fontSize: 16,
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
});

export default ApprovalFromCaptain;