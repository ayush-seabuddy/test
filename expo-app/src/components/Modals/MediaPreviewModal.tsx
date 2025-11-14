import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
  Text,
} from "react-native";
import { Image } from "expo-image";
import { Video, AVPlaybackStatus, ResizeMode } from "expo-av";
import ImageViewer from "react-native-image-zoom-viewer";
import Orientation from "react-native-orientation-locker";
import { X, Send, Volume2, VolumeX } from "lucide-react-native";

// Use react-native-video only in EAS builds
let ReactNativeVideo: any = null;
if (process.env.EXPO_PUBLIC_USE_EAS === "true") {
  try {
    ReactNativeVideo = require("react-native-video").default;
  } catch (e) {
    console.warn("react-native-video not available");
  }
}

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
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoDimensions, setVideoDimensions] = useState<{
    width?: number;
    height?: number;
  }>({});
  const [dimensions, setDimensions] = useState({ width:	screenWidth, height: screenHeight });

  const mediaUri = uri || PLACEHOLDER_IMAGE;
  const isPlaceholder = mediaUri === PLACEHOLDER_IMAGE;

  // Listen to orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    return () => subscription?.remove();
  }, []);

  // Reset orientation on close/unmount
  useEffect(() => {
    return () => {
      Orientation.lockToPortrait();
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      Orientation.unlockAllOrientations();
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    Orientation.lockToPortrait();
    onClose();
  }, [onClose]);

  const toggleMute = () => setIsMuted((prev) => !prev);

  const isLandscape = videoDimensions.width && videoDimensions.height
    ? videoDimensions.width > videoDimensions.height
    : false;

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

    return (
      <>
        <ImageViewer
          imageUrls={[{ url: mediaUri }]}
          style={styles.mediaContainer}
          enableSwipeDown={false}
          renderIndicator={() => <View />}
          backgroundColor="transparent"
        //   onLoadStart={() => setIsLoading(true)}
        //   onLoadEnd={() => setIsLoading(false)}
          loadingRender={() => (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        />
        {isLoading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </>
    );
  };

  const renderVideo = () => {
    const videoStyle = isLandscape
      ? [styles.mediaLandscape, { width: dimensions.height, height: dimensions.width }]
      : styles.mediaPortrait;

    // Use react-native-video in EAS, fallback to expo-av
    if (ReactNativeVideo) {
      return (
        <ReactNativeVideo
          source={{ uri: mediaUri }}
          style={videoStyle}
          resizeMode="contain"
          repeat
          muted={isMuted}
          controls
          onLoad={(data: any) => {
            setIsLoading(false);
            setVideoDimensions({
              width: data.naturalSize.width,
              height: data.naturalSize.height,
            });
          }}
          onLoadStart={() => setIsLoading(true)}
        />
      );
    }

    // Fallback: expo-av (no fullscreen, no advanced controls)
    return (
      <Video
        source={{ uri: mediaUri }}
        style={videoStyle}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        isMuted={isMuted}
        onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
          if (status.isLoaded) {
            setIsLoading(false);
          }
        }}
        onLoadStart={() => setIsLoading(true)}
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
        <StatusBar backgroundColor="rgba(0,0,0,0.95)" barStyle="light-content" />

        {/* Top Action Bar */}
        <View
          style={[
            styles.topBar,
            { justifyContent: type === "video" ? "space-between" : "flex-end" },
          ]}
        >
          {type === "video" && (
            <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
              {isMuted ? (
                <VolumeX size={20} color="#fff" />
              ) : (
                <Volume2 size={20} color="#fff" />
              )}
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
            <X size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Media */}
        <View style={styles.mediaWrapper}>{renderContent()}</View>

        {/* Send Button */}
        {canSend && (
          <View style={styles.sendButtonContainer}>
            <TouchableOpacity
              onPress={uploadImageToCloudinary}
              style={styles.sendButton}
              accessibilityLabel="Send media"
            >
              <Send size={28} color="#000" />
            </TouchableOpacity>
          </View>
        )}

        {/* Global Loader */}
        {isLoading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
      </View>
    </Modal>
  );
};

// Static styles only
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  topBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  mediaWrapper: {
    width: screenWidth,
    height: screenHeight * 0.8,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaContainer: {
    width: screenWidth,
    height: screenHeight * 0.8,
  },
  mediaPortrait: {
    width: screenWidth,
    height: screenHeight * 0.8,
    borderRadius: 12,
  },
  mediaLandscape: {
    borderRadius: 0,
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 2,
  },
  sendButtonContainer: {
    position: "absolute",
    bottom: 50,
    left: (screenWidth - 60) / 2,
    zIndex: 10,
  },
  sendButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  unsupportedText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default MediaPreviewModal;