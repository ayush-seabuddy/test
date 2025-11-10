import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Image,
  Text,
  ActivityIndicator,
  Platform,
} from "react-native";
import Video from "react-native-video";
import ImageViewer from "react-native-image-zoom-viewer";
import { ImagesAssets } from "../../assets/ImagesAssets";
import { FontFamily } from "../../GlobalStyle";
import FastImage from "react-native-fast-image";
import Orientation from "react-native-orientation-locker";

const { width, height } = Dimensions.get("window");

const MediaPreviewModal = ({
  visible,
  onClose,
  uri,
  type,
  canSend = false,
  uploadImageToCloudinary,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoWidth, setvideoWidth] = useState();
  const [videoHeight, setvideoHeight] = useState();
  const [isMuted, setIsMuted] = useState(true); // Start muted by default

  // Unlock orientation when modal unmounts
  useEffect(() => {
    if (!visible) {
      Orientation.unlockAllOrientations();
    }

    return () => {
      Orientation.unlockAllOrientations();
    };
  }, [visible]);


  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (isFullscreen) {
      Orientation.lockToPortrait(); // Lock to portrait when exiting fullscreen
    } else {
      Orientation.lockToLandscape(); // Lock to landscape when entering fullscreen
    }
    setIsFullscreen(!isFullscreen);
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.9)",
      justifyContent: "center",
      alignItems: "center",
    },
    media: {
      width: width,
      height: canSend ? height * 0.7 : height - 30,
      borderRadius: 10,

    },
    mediaLandscape: {
      width: width,
      height: height,
      borderRadius: 10,
    },
    imageViewer: {
      width: width,
      height: canSend ? height * 0.7 : height,
    },
    mingcutecloseFillIcon: {
      position: "absolute",
      top: 50,
      right: 20,
      zIndex: 3,

    },
    mingcuteSendFillIcon: {
      position: "absolute",
      bottom: 50,
      left: (width - 60) / 2,
      zIndex: 3,
    },
    closeButton: {
      padding: 10,
      alignItems: 'flex-start',
      justifyContent: "flex-start",
      borderRadius: 50,
      backgroundColor: '#d4d4d4'
    },
    SendButton: {
      backgroundColor: "white",
      borderRadius: 30,
      padding: 15,
    },
    loaderContainer: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: [{ translateX: -25 }, { translateY: -25 }],
      zIndex: 2,
    },
    topIconsContainer: {
      flexDirection: 'row',
      justifyContent: type == 'video' ? 'space-between' : 'flex-end',
      alignItems: 'center',
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 20,
      left: 20,
      right: 20,
      zIndex: 10,
    },
    icon: {
      width: 16,
      height: 16,
    },
  });

  const handleVideoLoad = (data) => {
    setIsLoading(false);

    const { width: videoWidth, height: videoHeight } = data.naturalSize;
    // console.log("Video Metadata:", data);
    setvideoHeight(videoHeight);
    setvideoWidth(videoWidth);
    // if (videoWidth > videoHeight) {
    //   Orientation.lockToLandscape();
    // } else {
    //   Orientation.lockToPortrait();
    // }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const handleClose = () => {
    Orientation.lockToPortrait();
    onClose();
  };

  const renderContent = () => {
    const placeholderUri =
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";
    const mediaUri = uri || placeholderUri; // fallback if uri is undefined
    const isPlaceholder = mediaUri === placeholderUri;

    if (type === "image") {
      // If placeholder, render a simple Image to avoid loader
      if (isPlaceholder) {
        return (
          <FastImage
            source={{ uri: mediaUri }}
            style={styles.imageViewer}
            resizeMode={FastImage.resizeMode.contain}
          />
        );
      }

      // Otherwise, render ImageViewer for real images
      const images = [{ url: mediaUri }];
      return (
        <>
          <ImageViewer
            imageUrls={images}
            style={styles.imageViewer}
            enableSwipeDown={false}
            renderIndicator={() => null}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            loadingRender={() => (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            )}
            backgroundColor="transparent"
          />
          {isLoading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          )}
        </>
      );
    } else if (type === "video") {
      return (
        <>
          <Video
            source={{ uri: mediaUri }}
            style={videoWidth > videoHeight ? styles.mediaLandscape : styles.media}
            resizeMode={"contain"}
            repeat
            muted={isMuted}
            onFullscreenPlayerWillPresent={() => {
              Orientation.lockToLandscape();
            }}
            onFullscreenPlayerWillDismiss={() => {
              Orientation.lockToPortrait();
            }}
            onLoadStart={() => setIsLoading(true)}
            onLoad={handleVideoLoad}
            controls={true}
            controlsStyles={{ hideForward: true, hideNext: true, hideRewind: true, hidePrevious: true }}
          />
          {isLoading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          )}
        </>
      );
    } else {
      return <Text style={{ color: "#fff" }}>Unsupported media type</Text>;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
        <View style={styles.topIconsContainer}>
          {type === "video" && (
            <TouchableOpacity onPress={toggleMute} style={styles.closeButton}>
              <Image
                style={styles.icon}
                resizeMode="cover"
                source={isMuted ? ImagesAssets.muteIcon : ImagesAssets.unmuteIcon}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Image
              style={styles.icon}
              resizeMode="cover"
              source={ImagesAssets.closeIcons}
            />
          </TouchableOpacity>
        </View>

        {renderContent()}
        {canSend && (
          <View style={styles.mingcuteSendFillIcon}>
            <TouchableOpacity
              onPress={uploadImageToCloudinary}
              style={styles.SendButton}
            >
              <Image
                source={ImagesAssets.send}
                style={{ width: 30, height: 30 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default MediaPreviewModal;