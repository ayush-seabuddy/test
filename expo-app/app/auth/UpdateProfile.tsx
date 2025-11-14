import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  FlatList,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { useTranslation } from "react-i18next";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import Colors from "@/src/utils/Colors";
import CustomLottie from "@/src/components/CustomLottie";
import { Camera, ChevronLeft, ImageIcon } from "lucide-react-native";
import { useRouter } from "expo-router";
import GlobalHeader from "@/src/components/GlobalHeader";

const { width, height } = Dimensions.get("window");

const UploadPhoto: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const userData = await AsyncStorage.getItem("userDetails");
      if (userData) JSON.parse(userData);
    })();
  }, []);

  const requestPermissions = async (type: "camera" | "library") => {
    const permissionType =
      type === "camera"
        ? ImagePicker.requestCameraPermissionsAsync
        : ImagePicker.requestMediaLibraryPermissionsAsync;

    const { status } = await permissionType();
    if (status !== "granted") {
      Alert.alert(
        t("permissionDenied"),
        t(
          type === "camera"
            ? "cameraPermissionRequired"
            : "photoLibraryPermissionRequired"
        )
      );
      return false;
    }
    return true;
  };

  const openImagePicker = async (type: "camera" | "library") => {
    const hasPermission = await requestPermissions(type);
    if (!hasPermission) return;

    try {
      const imageResult =
        type === "camera"
          ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          })
          : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });

      if (imageResult.canceled || !imageResult.assets?.[0]?.uri) return;

      const compressed = await ImageManipulator.manipulateAsync(
        imageResult.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      setSelectedPhotos([compressed.uri]);
    } catch (err) {
      console.log("Image Picker Error:", err);
      Alert.alert(t("error"), t("imagePickFailed"));
    }
  };

  const uploadImage = async () => {
    if (selectedPhotos.length === 0) return;
    try {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        // router.push({
        //   pathname: "/UpdateProfile",
        //   params: { imageurl: selectedPhotos[0] },
        // });
      }, 1000);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GlobalHeader
        title={t('profile_photo')}
        leftIcon={<ChevronLeft size={24} />}
        onLeftPress={() => router.back()}
      />

      <View style={styles.bottomCard1}>
        <CustomLottie isBlurView={false} />
      </View>

      <View style={styles.overlay}>

        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={styles.title}>{t('uploadProfilePhoto')}</Text>
          <Text style={styles.description}>
            {t("uploadPhotoDescription")}
          </Text>

          <View style={styles.uploadSection}>
            {selectedPhotos.length > 0 ? (
              <FlatList
                horizontal
                data={selectedPhotos}
                keyExtractor={(_, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.photoWrapper}>
                    <Image source={{ uri: item }} style={styles.selectedPhoto} />
                    <View style={styles.replaceWrapper}>
                      <Image
                        source={{ uri: item }}
                        style={styles.circlePreview}
                      />
                      <TouchableOpacity
                        style={styles.replaceButton}
                        onPress={() => openImagePicker("library")}
                      >
                        <Text style={styles.replaceText}>{t("replace")}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => openImagePicker("library")}
              >
                <View style={styles.uploadContent}>
                  <ImageIcon size={24} color={Colors.white} />
                  <Text style={styles.uploadText}>{t("selectFile")}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.orText}>{t("or")}</Text>

          <TouchableOpacity
            style={styles.cameraButton}
            onPress={() => openImagePicker("camera")}
          >
            <View style={styles.row}>
              <Camera size={20} color={Colors.black} />
              <Text style={styles.cameraText}>{t("openCamera")}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              { opacity: selectedPhotos.length === 1 ? 1 : 0.5 },
            ]}
            onPress={uploadImage}
            disabled={selectedPhotos.length !== 1}
          >
            <Text style={styles.submitText}>{t("submit")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

export default UploadPhoto;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.6)",
    top: "7.4%",
  },
  scrollView: { flexGrow: 1, padding: 20 },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 10,
    fontFamily: "WhyteInktrap-Bold",
  },
  description: {
    fontSize: 14,
    color: "#636363",
    lineHeight: 21,
    marginBottom: 20,
    fontFamily: "Poppins-Regular",
  },
  uploadSection: { alignItems: "center", marginVertical: 20 },
  uploadButton: {
    width: "100%",
    height: height * 0.28,
    borderRadius: 35,
    backgroundColor: "rgba(180,180,180,0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(180,180,180,0.4)",
  },
  uploadContent: { alignItems: "center", gap: 20 },
  uploadText: { color: Colors.white, fontFamily: "Poppins-SemiBold" },
  orText: {
    textAlign: "center",
    fontSize: 16,
    color: Colors.white,
    marginVertical: 10,
    fontFamily: "Poppins-Regular",
  },
  cameraButton: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#E6EBE9",
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  cameraText: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: "Poppins-SemiBold",
  },
  submitButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#02130b",
    alignItems: "center",
    marginTop: 30,
  },
  submitText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
  },
  selectedPhoto: {
    width: width - 40,
    height: height * 0.28,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#B4B4B499",
  },
  photoWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  replaceWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: "20%",
  },
  circlePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#B4B4B499",
  },
  replaceButton: {
    marginTop: 20,
    backgroundColor: "#E6EBE9",
    borderRadius: 10,
    width:'100%',
    alignItems:'center',
    paddingVertical: 10,
  },
  replaceText: {
    fontSize: 14,
    color: "#042013",
    fontWeight: "600",
  },
  bottomCard1: {
    width: "100%",
    height: "100%",
    position: "absolute",
    bottom: "-20%",
    alignItems: "center",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: "hidden",
  },
});
