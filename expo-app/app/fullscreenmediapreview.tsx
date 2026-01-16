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
} from "react-native";
import { X, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react-native";
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

  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const videoRefs = useRef<{ [key: number]: VideoRef | null }>({});

  useEffect(() => {
    if (visible) {
      setActiveIndex(initialIndex);
      setShowUI(true);
      setPaused(false);
      setLoadingStates({});
    } else {
      setPaused(true);
    }
  }, [visible, initialIndex]);

  const toggleUI = () => {
    setShowUI((prev) => !prev);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const goToPrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const goToNext = () => {
    if (activeIndex < media.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 20,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
          opacity.setValue(1 - (gesture.dy / SCREEN_HEIGHT) * 0.7);
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
    setLoadingStates((prev) => ({ ...prev, [index]: loading }));
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
              <CommonLoader fullScreen color="#ffffff" />
            </View>
          )}

          {!showUI && (
            <Pressable style={StyleSheet.absoluteFillObject} onPress={toggleUI} />
          )}
        </View>
      );
    }

    return null;
  };

  const currentMedia = media[activeIndex];
  const isVideo = currentMedia?.type === "video";

  const imageUrls = media.map((item) => ({ url: item.uri }));

  const showLeftArrow = activeIndex > 0;
  const showRightArrow = activeIndex < media.length - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        style={[styles.modalBackdrop, { opacity }]}
        pointerEvents="box-none"
      >
        <StatusBar hidden={!showUI} />

        <Animated.View
          style={{
            flex: 1,
            transform: [{ translateY }],
          }}
        >
          <Animated.View
            style={[styles.topBar, !showUI && styles.hidden]}
          >
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

            <TouchableOpacity onPress={onClose} style={styles.iconButton}>
              <X size={24} color="white" strokeWidth={2} />
            </TouchableOpacity>
          </Animated.View>

          {isVideo ? (
            <View {...panResponder.panHandlers} style={{ flex: 1 }}>
              {renderItem(currentMedia, activeIndex)}
            </View>
          ) : (
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
                  <CommonLoader fullScreen color="#ffffff" />
                </View>
              )}
              backgroundColor="transparent"
              enableImageZoom={true}
              saveToLocalByLongPress={false}
              doubleClickInterval={250}
              style={{ flex: 1 }}
            />
          )}

          {showUI && media.length > 1 && (
            <>
              {showLeftArrow && (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonLeft]}
                  onPress={goToPrev}
                  activeOpacity={0.7}
                >
                  <ChevronLeft size={24} color="#ffffff" strokeWidth={1.5} />
                </TouchableOpacity>
              )}

              {showRightArrow && (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonRight]}
                  onPress={goToNext}
                  activeOpacity={0.7}
                >
                  <ChevronRight size={24} color="#ffffff" strokeWidth={1.5} />
                </TouchableOpacity>
              )}
            </>
          )}

          {media.length > 1 && (
            <Animated.View
              style={[styles.pagination, !showUI && styles.hidden]}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
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
    zIndex: 10,
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

  navButton: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -30 }],
    width: 40,
    borderWidth: 0.5,
    borderColor: '#fff',
    height: 40,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    // zIndex: 15,
  },
  navButtonLeft: {
    left: 16,
  },
  navButtonRight: {
    right: 16,
  },
});