import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Dimensions,
  Alert,
  FlatList,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import Colors from "../../colors/Colors";
import UploadPhotoHeader from "../../component/headers/UploadPhotoHeader";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { FontFamily } from "../../GlobalStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImagePicker from "react-native-image-crop-picker";
import Spinner from "react-native-loading-spinner-overlay";
import { BlurView } from "@react-native-community/blur";
import CustomLottie from "../../component/CustomLottie";
import { Image as Compressor } from "react-native-compressor"; // ✅ Compression lib

const { width, height } = Dimensions.get("window");

const UploadPhoto = ({ navigation }) => {
  const [selectedPhotos, setSelectedPhotos] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchEmail = async () => {
      const authToken = await AsyncStorage.getItem("authToken");
      const UserData = await AsyncStorage.getItem("userDetails");
      var mydata = JSON.parse(UserData);
    };
    fetchEmail();
  }, []);

  const requestPermissions = async (type) => {
    let permission;

    if (Platform.OS === "android") {
      if (type === "camera") {
        permission = PERMISSIONS.ANDROID.CAMERA;
      } else {
        permission =
          Platform.Version >= 33
            ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      }
    } else {
      permission =
        type === "camera"
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.IOS.PHOTO_LIBRARY;
    }

    try {
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const openImagePicker = async (type) => {
    const hasPermission = await requestPermissions(type);

    if (!hasPermission) {
      Alert.alert(
        "Permission Denied",
        `${type === "camera" ? "Camera" : "Photo Library"
        } permission is required.`
      );
      return;
    }

    try {
      let image;
      if (type === "camera") {
        image = await ImagePicker.openCamera({
          cropping: true,
          freeStyleCropEnabled: true,
          cropperCircleOverlay: false,
          compressImageQuality: 0.7,
          mediaType: "photo",
          includeBase64: false,
          maxFiles: 1,
          forceJpg: true,
        });
      } else {
        image = await ImagePicker.openPicker({
          cropping: true,
          freeStyleCropEnabled: true,
          cropperCircleOverlay: false,
          compressImageQuality: 0.7,
          mediaType: "photo",
          includeBase64: false,
          maxFiles: 1,
          forceJpg: true,
        });
      }

      if (image.path) {
        // ✅ Compress image further (~50%)
        const compressedImageUri = await Compressor.compress(image.path, {
          compressionMethod: "auto",
          quality: 0.5, // ~50% compression
        });

        setSelectedPhotos([compressedImageUri]);
      }
    } catch (error) {
      if (error.code !== "E_PICKER_CANCELLED") {
        Alert.alert("Error", "Failed to select or crop image.");
        console.log(error);
      }
    }
  };

  const uploadImage = async () => {
    try {
      setIsLoading(true);
      let data = new FormData();
      data.append("file", {
        uri: selectedPhotos[0],
        name: "image.jpg",
        type: "image/jpeg",
      });
      const requestOptions = {
        method: "POST",
        body: data,
        redirect: "follow",
      };

      // ✅ Navigate after successful compression
      navigation.navigate("UpdateProfile", { imageurl: selectedPhotos });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const navigateProfile = () => {
    navigation.navigate("IntroScreen1");
  };

  return (
    <View style={styles.uploadPhoto}>
      <View style={{ position: "absolute", top: "50%", right: 0, left: 0 }}>
        <Spinner visible={isLoading} size="large" color="#000" />
      </View>
      <UploadPhotoHeader navigateProfile={navigateProfile} />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <View style={styles.bottomCard1}>
        <CustomLottie />
      </View>

      <View style={styles.whiteOverlay}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={30}
          reducedTransparencyFallbackColor="white"
        />
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.contentContainer}>
            <Text style={styles.uploadTitle}>Upload a profile photo</Text>
            <Text style={styles.description}>
              Please upload a clear and recent photo of yourself. A good profile
              picture makes it easier for others to recognize you and ensures a
              more personalized experience.
            </Text>
            <View style={[styles.uploadOptions]}>
              {selectedPhotos.length > 0 ? (
                <>
                  <FlatList
                    data={selectedPhotos}
                    horizontal
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <>
                        <View style={styles.selectedPhotoUpper}>
                          <Image
                            source={{ uri: item }}
                            style={styles.selectedPhoto}
                          />
                          <View style={styles.ReplaceContainer}>
                            <Image
                              source={{ uri: item }}
                              style={styles.selectedPhotoCircle}
                            />
                            <TouchableOpacity
                              style={styles.ReplaceBtn}
                              onPress={() => openImagePicker("library")}
                            >
                              <Text style={styles.ReplaceBtnText}>Replace</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </>
                    )}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.selectedPhotosContainer}
                  />
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => openImagePicker("library")}
                  >
                    <View style={styles.uploadButtonContent}>
                      <Image
                        style={{ height: 50, width: 50, marginVertical: 8 }}
                        source={ImagesAssets.galry_icon}
                      />
                      <Text style={{ color: "#949494" }}>
                        Select file to upload
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
            <Text style={styles.orText}>OR</Text>
            <TouchableOpacity
              style={[styles.cameraButton]}
              onPress={() => openImagePicker("camera")}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <Image
                  style={{ height: 18, width: 18, marginVertical: 8 }}
                  source={ImagesAssets.camra_icon}
                />
                <Text style={styles.buttonText}>Open Camera</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={[styles.bottomCard]}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                { opacity: selectedPhotos.length === 1 ? 1 : 0.5 },
              ]}
              onPress={uploadImage}
              disabled={selectedPhotos.length !== 1}
            >
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  uploadPhoto: { flex: 1, backgroundColor: "#fff" },
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    zIndex: 0,
    top: "7.4%",
  },
  scrollViewContent: { flexGrow: 1, paddingTop: 20 },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#262626",
    textAlign: "left",
    marginBottom: 10,
    fontFamily: "WhyteInktrap-Bold",
    lineHeight: 25,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: "#636363",
    marginBottom: 20,
    fontFamily: "Poppins-Regular",
  },
  uploadOptions: { alignItems: "center", marginVertical: "10%", zIndex: 5 },
  uploadButton: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 35,
    backgroundColor: "rgba(180, 180, 180, 0.6)",
    alignItems: "center",
    marginBottom: 15,
    height: height * 0.28,
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(180, 180, 180, 0.4)",
  },
  uploadButtonContent: { alignItems: "center" },
  orText: {
    fontSize: 18,
    color: "#636363",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  cameraButton: {
    width: "100%",
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "rgba(230, 235, 233, 1)",
    alignItems: "center",
    marginTop: "10%",
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    zIndex: 2,
  },
  buttonText: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: "Poppins-SemiBold",
  },
  bottomCard: { width: "100%", alignItems: "center", paddingHorizontal: 16 },
  bottomCard1: {
    width: "100%",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    alignItems: "center",
    position: "absolute",
    height: "100%",
    bottom: "-10%",
    overflow: "hidden",
  },
  submitButton: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#02130b",
    alignItems: "center",
    marginBottom: 20,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },
  selectedPhoto: {
    width: width - 32,
    height: height * 0.25,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#B4B4B499",
  },
  selectedPhotoUpper: {
    width: width - 32,
    height: height * 0.25,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#B4B4B499",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedPhotoCircle: {
    width: 90,
    height: 90,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: "#B4B4B499",
  },
  ReplaceContainer: {
    paddingTop: 30,
    position: "absolute",
    height: 200,
    width: "90%",
    justifyContent: "center",
    alignItems: "center",
  },
  ReplaceBtn: {
    marginTop: 20,
    width: "100%",
    height: height * 0.05,
    backgroundColor: "#E6EBE9",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ReplaceBtnText: {
    fontSize: 14,
    color: "#042013",
    fontWeight: "600",
    fontFamily: FontFamily.bodyB14SemiBold,
  },
});

export default UploadPhoto;
