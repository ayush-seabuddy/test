import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Platform,
  FlatList,
} from "react-native";
import Video from "react-native-video";
import ImageViewer from "react-native-image-zoom-viewer";
import { ImagesAssets } from "../../assets/ImagesAssets";
import Orientation from "react-native-orientation-locker";
import AntDesign from "react-native-vector-icons/AntDesign";

// Get initial window dimensions
let { width, height } = Dimensions.get("window");

const MediaPreviewModalForPostsForPosts = ({
  visible,
  onClose,
  mediaItems,
  initialIndex = 0,
  canSend = false,
  uploadImageToCloudinary,
}) => {
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, Math.min(initialIndex, mediaItems?.length - 1 || 0))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dimensions, setDimensions] = useState({ width, height });
  const flatListRef = useRef(null);
  const hasScrolledToInitial = useRef(false);
  const orientationTimeoutRef = useRef(null);

  // Update dimensions on window change
  useEffect(() => {
    const updateDimensions = ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    };
    const subscription = Dimensions.addEventListener("change", updateDimensions);
    return () => subscription?.remove();
  }, []);

  // Handle orientation with debounce
  const debounceOrientation = useCallback(
    (videoWidth, videoHeight, isCurrent) => {
      if (orientationTimeoutRef.current) {
        clearTimeout(orientationTimeoutRef.current);
      }
      orientationTimeoutRef.current = setTimeout(() => {
        if (visible && isCurrent && !isFullscreen) {
          if (videoWidth > videoHeight) {
            Orientation.lockToLandscape();
          } else {
            Orientation.lockToPortrait();
          }
        }
      }, 300);
    },
    [visible, isFullscreen]
  );

  // Handle modal visibility and orientation
  useEffect(() => {
    if (visible) {
      Orientation.unlockAllOrientations();
    } else {
      Orientation.lockToPortrait();
    }

    return () => {
      if (orientationTimeoutRef.current) {
        clearTimeout(orientationTimeoutRef.current);
      }
      Orientation.lockToPortrait();
    };
  }, [visible]);

  // Scroll to initial index when modal opens
  useEffect(() => {
    if (
      visible &&
      flatListRef.current &&
      !hasScrolledToInitial.current &&
      mediaItems &&
      mediaItems.length > 0 &&
      initialIndex >= 0 &&
      initialIndex < mediaItems.length
    ) {
      try {
        flatListRef.current.scrollToIndex({ index: initialIndex, animated: false });
        hasScrolledToInitial.current = true;
      } catch (error) {
        console.warn("Error scrolling to initial index:", error);
      }
    }
    return () => {
      hasScrolledToInitial.current = false;
    };
  }, [visible, initialIndex, mediaItems]);

  const toggleFullscreen = () => {
    if (isFullscreen) {
      Orientation.lockToPortrait();
    } else {
      Orientation.lockToLandscape();
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleClose = () => {
    Orientation.lockToPortrait();
    setIsMuted(true);
    setCurrentIndex(Math.max(0, Math.min(initialIndex, mediaItems?.length - 1 || 0)));
    hasScrolledToInitial.current = false;
    if (orientationTimeoutRef.current) {
      clearTimeout(orientationTimeoutRef.current);
    }
    onClose();
  };

  const isVideo = (uri) => {
    return uri && uri.match(/\.(mp4|mov|avi)$/i);
  };

  // Navigate to previous item
  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
      setCurrentIndex(newIndex);
    }
  };

  // Navigate to next item
  const goToNext = () => {
    if (currentIndex < mediaItems.length - 1) {
      const newIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
      setCurrentIndex(newIndex);
    }
  };

  const renderMediaItem = ({ item, index }) => {
    const isCurrent = index === currentIndex;

    return (
      <View style={[styles.mediaContainer, { width: dimensions.width }]}>
        {item.type === "video" ? (
          <>
            <Video
              source={{ uri: item.uri }}
              style={isFullscreen ? styles.mediaLandscape : styles.media}
              resizeMode="contain"
              repeat={false}
              muted={isMuted}
              paused={!isCurrent}
              onLoadStart={() => setIsLoading(true)}
              onLoad={(data) => {
                setIsLoading(false);
                const { width: videoWidth, height: videoHeight } = data.naturalSize;
                debounceOrientation(videoWidth, videoHeight, isCurrent);
              }}
              onError={(error) => console.warn(`Video error for ${item.uri}:`, error)}
              controls={true}
              controlsStyles={{
                hideForward: true,
                hideNext: true,
                hideRewind: true,
                hidePrevious: true,
                hideSettingButton: true,
              }}
              bufferConfig={{
                minBufferMs: 1000,
                maxBufferMs: 3000,
                bufferForPlaybackMs: 500,
                bufferForPlaybackAfterRebufferMs: 750,
              }}
              poster={item.thumbnailUri || undefined}
            />
            {isLoading && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            )}
          </>
        ) : (
          <ImageViewer
            imageUrls={[{ url: item.uri }]}
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
            saveToLocalByLongPress={false}
          />
        )}
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      setCurrentIndex(newIndex);
      setIsLoading(false);
      const currentItem = mediaItems[newIndex];
      if (currentItem && currentItem.type !== "video" && !isFullscreen) {
        Orientation.lockToPortrait();
      }
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    waitForInteraction: false,
  };

  const getItemLayout = useCallback(
    (data, index) => {
      const itemWidth = isFullscreen ? dimensions.height : dimensions.width;
      return {
        length: itemWidth,
        offset: itemWidth * index,
        index,
      };
    },
    [isFullscreen, dimensions.width, dimensions.height]
  );

  // Guard clause for invalid mediaItems
  if (!mediaItems || mediaItems.length === 0) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
        <View style={styles.topIconsContainer}>
          {mediaItems &&
            mediaItems.length > 0 &&
            currentIndex >= 0 &&
            currentIndex < mediaItems.length &&
            mediaItems[currentIndex]?.type === "video" &&
            Platform.OS !== 'ios' && (
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


        <FlatList
          ref={flatListRef}
          data={mediaItems}
          renderItem={renderMediaItem}
          keyExtractor={(item, index) => `${item.uri}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialScrollIndex={initialIndex}
          getItemLayout={getItemLayout}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={7}
          removeClippedSubviews={false}
          snapToAlignment="center"
          decelerationRate={0.9}
          disableIntervalMomentum={true}
        />

        {/* Navigation Buttons */}
        {mediaItems.length > 1 && (
  <View
  style={[
    styles.navigationContainer,
    currentIndex === 0
      ? { justifyContent: "flex-end" } // only right arrow, push it right
      : currentIndex === mediaItems.length - 1
      ? { justifyContent: "flex-start" } // only left arrow, push it left
      : { justifyContent: "space-between" }, // both arrows
  ]}
>
  {currentIndex > 0 && (
    <TouchableOpacity
      onPress={goToPrevious}
      style={styles.navButton}
      accessibilityLabel="Previous media"
    >
      <AntDesign name="arrowleft" size={16} color="black" />
    </TouchableOpacity>
  )}

  {currentIndex < mediaItems.length - 1 && (
    <TouchableOpacity
      onPress={goToNext}
      style={styles.navButton}
      accessibilityLabel="Next media"
    >
      <AntDesign name="arrowright" size={16} color="black" />
    </TouchableOpacity>
  )}
</View>


        )}

        {mediaItems.length > 1 && (
          <View style={styles.pagination}>
            {mediaItems.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentIndex === index ? styles.paginationDotActive : styles.paginationDotInactive,
                ]}
              />
            ))}
          </View>
        )}

        {canSend && mediaItems && mediaItems.length > 0 && currentIndex >= 0 && currentIndex < mediaItems.length && (
          <View style={[styles.mingcuteSendFillIcon, { left: (dimensions.width - 60) / 2 }]}>
            <TouchableOpacity
              onPress={() => uploadImageToCloudinary(mediaItems[currentIndex].uri)}
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  mediaContainer: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
    width: "100%",
    height: "80%",
    borderRadius: 10,
  },
  mediaLandscape: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  imageViewer: {
    width: "100%",
    height: "80%",
  },
  captionContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  captionText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  topIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: Platform.OS === "ios" ? 10 : 10,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: "#d4d4d4",
    marginLeft: 10,
  },
  SendButton: {
    backgroundColor: "white",
    borderRadius: 30,
    padding: 15,
  },
  mingcuteSendFillIcon: {
    position: "absolute",
    bottom: 50,
    zIndex: 3,
  },
  icon: {
    width: 16,
    height: 16,
  },
  loaderContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 2,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 80,
    zIndex: 3,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#8DAF02",
  },
  paginationDotInactive: {
    backgroundColor: "#bbb",
  },
navigationContainer: {
  position: "absolute",
  top: "50%",
  left: 0,
  right: 0,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  zIndex: 10,
  paddingHorizontal: 10,
},
  navButton: {
     padding: 10,
    borderRadius: 50,
    backgroundColor: "#d4d4d4",
    marginLeft: 10,
  },
});

export default MediaPreviewModalForPostsForPosts;