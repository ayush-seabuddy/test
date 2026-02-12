import { Image } from "expo-image";
import * as ScreenOrientation from "expo-screen-orientation";
import { Send, SendHorizonal, Volume2, VolumeX, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import Video from "react-native-video";
import CommonLoader from "../CommonLoader";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const PLACEHOLDER_IMAGE =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";

interface MediaPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  uri?: string;
  type: "image" | "video";
  canSend?: boolean;
  uploadImageToCloudinary?: () => void;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  visible,
  onClose,
  uri,
  type,
  canSend = false,
  uploadImageToCloudinary,
}) => {
  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "black",
      justifyContent: "center",
      alignItems: "center",
    },
    imageViewer: {
      width: screenWidth,
      height: canSend ? screenHeight * 0.7 : screenHeight,
    },
    loaderContainer: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: [{ translateX: -25 }, { translateY: -25 }],
      zIndex: 2,
    },
    topBar: {
      position: "absolute",
      top: Platform.OS === "ios" ? 60 : 30,
      left: 20,
      right: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 10,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    mediaWrapper: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    mediaContainer: {
      width: "100%",
      height: "100%",
    },
    loader: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    sendButtonContainer: {
      position: "absolute",
      bottom: 50,
      alignSelf: "center",
    },
    sendButton: {
      width: 60,
      height: 60,
      borderRadius: 32,
      backgroundColor: "#fff",
      justifyContent: "center",
      alignItems: "center",
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    unsupportedText: {
      color: "#fff",
      fontSize: 18,
    },
  });

  const [_isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoAspectRatio, setVideoAspectRatio] = useState(1);
  const [dimensions, setDimensions] = useState({
    width: screenWidth,
    height: screenHeight,
  });

  const mediaUri = uri || PLACEHOLDER_IMAGE;
  const isPlaceholder = mediaUri === PLACEHOLDER_IMAGE;

  const viewerRef = useRef<any>(null);
  const [_imageStatus, setImageStatus] = useState<
    "loading" | "success" | "fail"
  >("loading");

  useEffect(() => {
    const interval = setInterval(() => {
      if (viewerRef.current?.state?.imageSizes?.[0]) {
        const status = viewerRef.current.state.imageSizes[0].status;
        setImageStatus(status);
        if (status === "success" || status === "fail") {
          setIsLoading(false);
          clearInterval(interval);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (visible) {
      ScreenOrientation.unlockAsync().catch(() => {});
    }

    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT,
      ).catch(() => {});
    };
  }, [visible]);

  const handleClose = useCallback(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    onClose();
  }, [onClose]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  const videoWidth = dimensions.width;
  const videoHeight = videoWidth / videoAspectRatio;

  const renderImage = () => {
    if (isPlaceholder) {
      return (
        <Image
          source={{ uri: mediaUri }}
          style={styles.mediaContainer}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      );
    }

    const images = [{ url: mediaUri }];
    return (
      <>
        <ImageViewer
          ref={viewerRef}
          imageUrls={images}
          style={styles.imageViewer}
          enableSwipeDown={false}
          renderIndicator={() => <View />}
          loadingRender={() => (
            <View style={styles.loaderContainer}>
              <CommonLoader fullScreen color="#fff" />
            </View>
          )}
          backgroundColor="transparent"
        />
      </>
    );
  };

  const renderVideo = () => {
    if (!mediaUri || isPlaceholder) {
      return <Text style={styles.unsupportedText}>No video source</Text>;
    }

    return (
      <Video
        source={{ uri: mediaUri }}
        style={{
          width: videoWidth,
          height: videoHeight,
        }}
        resizeMode="contain"
        controls={true}
        muted={isMuted}
        repeat={true}
        paused={false}
        onLoad={(data) => {
          setIsLoading(false);
          if (data.naturalSize?.width && data.naturalSize?.height) {
            setVideoAspectRatio(
              data.naturalSize.width / data.naturalSize.height,
            );
          }
        }}
        onError={(e) => {
          console.warn("Video error:", e);
          setIsLoading(false);
        }}
        ignoreSilentSwitch="ignore"
      />
    );
  };

  const renderContent = () => {
    if (type === "image") return renderImage();
    if (type === "video") return renderVideo();
    return <Text style={styles.unsupportedText}>Unsupported media</Text>;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <StatusBar backgroundColor="black" barStyle="light-content" />

        {/* Top Bar */}
        <View style={styles.topBar}>
          {type === "video" && (
            <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
              {isMuted ? (
                <VolumeX size={24} color="#fff" />
              ) : (
                <Volume2 size={24} color="#fff" />
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.mediaWrapper}>{renderContent()}</View>

        {canSend && (
          <View style={styles.sendButtonContainer}>
            <TouchableOpacity
              onPress={uploadImageToCloudinary}
              style={styles.sendButton}
            >
              <SendHorizonal size={26} color="#000" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default MediaPreviewModal;
