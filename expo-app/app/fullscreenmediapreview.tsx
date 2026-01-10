import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  StyleSheet,
  View,
  Dimensions,
  Pressable,
  TouchableOpacity,
  Animated,
  PanResponder,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { X, Volume2, VolumeX } from "lucide-react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import Video, { VideoRef } from "react-native-video";
import Colors from "@/src/utils/Colors";
import CommonLoader from "@/src/components/CommonLoader";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type MediaItem = {
  uri: string;
  type: "image" | "video";
};

type FullScreenMediaModalProps = {
  visible: boolean;
  media: MediaItem[];
  initialIndex?: number;
  onClose: () => void;
};

const FullScreenMediaModal: React.FC<FullScreenMediaModalProps> = ({
  visible,
  media,
  initialIndex = 0,
  onClose,
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [showUI, setShowUI] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});
  const [paused, setPaused] = useState(false);

  // Animation values for swipe-to-dismiss
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Refs for video players
  const videoRefs = useRef<{ [key: number]: VideoRef | null }>({});

  // Auto scroll to initial index
  useEffect(() => {
    if (visible) {
      setActiveIndex(initialIndex);
      setShowUI(true);
      setPaused(false);
    } else {
      // Pause all videos when modal is closed
      setPaused(true);
    }
  }, [visible, initialIndex]);

  // Reset loading state when index changes
  useEffect(() => {
    setLoadingStates({});
  }, [activeIndex]);

  // Toggle UI on tap
  const toggleUI = () => {
    setShowUI(prev => !prev);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Swipe down to close (only for videos)
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 20,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
          opacity.setValue(1 - gesture.dy / SCREEN_HEIGHT * 0.7);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > SCREEN_HEIGHT * 0.25 || gesture.vy > 1) {
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: SCREEN_HEIGHT,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onClose();
            translateY.setValue(0);
            opacity.setValue(1);
          });
        } else {
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const setLoading = (index: number, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [index]: loading }));
  };

  const handleIndexChange = (index?: number) => {
    if (index !== undefined) {
      setActiveIndex(index);
    }
  };

  const renderItem = (item: MediaItem, index: number) => {
    if (item.type === "video") {
      const isActive = index === activeIndex;

      return (
        <View key={index} style={styles.mediaContainer}>
          <Video
            ref={(ref) => {
              videoRefs.current[index] = ref;
            }}
            source={{ uri: item.uri }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="contain"
            repeat={true}
            paused={!isActive || paused}
            muted={isMuted}
            controls={showUI}
            onLoadStart={() => setLoading(index, true)}
            onLoad={() => setLoading(index, false)}
            onError={() => setLoading(index, false)}
            playInBackground={false}
            playWhenInactive={false}
          />
          
          {loadingStates[index] && (
            <View style={styles.loaderContainer}>
              <CommonLoader color="#ffffff" />
            </View>
          )}
          
          {/* Transparent overlay to capture taps when controls are hidden */}
          {!showUI && (
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={toggleUI}
            />
          )}
        </View>
      );
    }

    return null; // Images are handled by ImageViewer
  };

  const currentMedia = media[activeIndex];
  const isVideo = currentMedia?.type === "video";

  // Prepare images for ImageViewer
  const imageUrls = media.map(item => ({ url: item.uri }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.modalBackdrop,
          { opacity },
        ]}
        pointerEvents="box-none"
      >
        <StatusBar hidden={!showUI} />

        <Animated.View
          style={{
            flex: 1,
            transform: [{ translateY }],
          }}
        >
          {/* Top Bar with Controls */}
          <Animated.View
            style={[
              styles.topBar,
              !showUI && styles.hidden,
            ]}
          >
            {/* Mute/Unmute Button (only for videos) */}
            {isVideo && (
              <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
                {isMuted ? (
                  <VolumeX size={24} color="#fff" />
                ) : (
                  <Volume2 size={24} color="#fff" />
                )}
              </TouchableOpacity>
            )}
            
            <View style={{ flex: 1 }} />
            
            {/* Close Button */}
            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <X size={24} color="white" strokeWidth={2} />
            </TouchableOpacity>
          </Animated.View>

          {/* Media Content */}
          {isVideo ? (
            // Render video with swipe to dismiss
            <View {...panResponder.panHandlers} style={{ flex: 1 }}>
              {renderItem(currentMedia, activeIndex)}
            </View>
          ) : (
            // Render ImageViewer for images with zoom
            <ImageViewer
              imageUrls={imageUrls}
              index={activeIndex}
              onChange={handleIndexChange}
              enableSwipeDown={true}
              onSwipeDown={onClose}
              onClick={toggleUI}
              renderIndicator={() => <View />}
              loadingRender={() => (
                <View style={styles.loaderContainer}>
                  <CommonLoader color="#ffffff" />
                </View>
              )}
              backgroundColor="transparent"
              enableImageZoom={true}
              saveToLocalByLongPress={false}
              doubleClickInterval={250}
              style={{ flex: 1 }}
            />
          )}

          {/* Pagination Dots */}
          {media.length > 1 && (
            <Animated.View
              style={[
                styles.pagination,
                !showUI && styles.hidden,
              ]}
            >
              {media.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === activeIndex ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </Animated.View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default FullScreenMediaModal;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "black",
  },
  mediaContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
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
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  hidden: {
    opacity: 0,
  },
  pagination: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.lightGreen || "#4ADE80",
    borderRadius: 4,
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.4)",
  },
});