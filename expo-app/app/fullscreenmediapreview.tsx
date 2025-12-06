// FullScreenMediaModal.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Modal,
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  Pressable,
  TouchableOpacity,
  Animated,
  PanResponder,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { Image } from "expo-image";
import { VideoView, useVideoPlayer } from "expo-video";
import Colors from "@/src/utils/Colors";

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
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation values for swipe-to-dismiss
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Video players pre-created for performance
  const videoUris = useMemo(() => media.filter(m => m.type === "video").map(m => m.uri), [media]);

  const players = videoUris.map(uri =>
    useVideoPlayer(uri, player => {
      player.loop = true;
      player.muted = false;
      player.volume = 1.0;
    })
  );

  const playerMap = useMemo(() => {
    const map = new Map<string, any>();
    videoUris.forEach((uri, i) => map.set(uri, players[i]));
    return map;
  }, [videoUris, players]);

  // Auto scroll to initial index
  useEffect(() => {
    if (visible) {
      setActiveIndex(initialIndex);
      setShowUI(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: initialIndex * SCREEN_WIDTH,
          animated: false,
        });
      }, 100);
    }
  }, [visible, initialIndex]);

  // Play active video, pause others
  useEffect(() => {
    if (!visible) return;

    media.forEach((item, idx) => {
      const player = playerMap.get(item.uri);
      if (!player || item.type !== "video") return;

      if (idx === activeIndex) {
        player.play();
        player.seekBy(-player.position); // safely resets to start
      } else {
        player.pause();
      }
    });
  }, [activeIndex, visible, media, playerMap]);
  // Handle horizontal scroll
  const handleScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(x / SCREEN_WIDTH);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  // Toggle UI on tap
  const toggleUI = () => {
    setShowUI(prev => !prev);
  };

  // Swipe down to close
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

  const renderItem = (item: MediaItem, index: number) => {
    if (item.type === "video") {
      const player = playerMap.get(item.uri);

      return (
        <Pressable
          key={index}
          style={styles.mediaContainer}
          onPress={toggleUI}
          {...panResponder.panHandlers}
        >
          {player && (
            <VideoView
              player={player}
              style={StyleSheet.absoluteFillObject}
              contentFit="contain"
              nativeControls={showUI}
            />
          )}
        </Pressable>
      );
    }
return (
  <Pressable
    key={index}
    style={styles.mediaContainer}
    onPress={toggleUI}
    {...panResponder.panHandlers}
  >
  <Image
    source={{ uri: item.uri }}
    style={StyleSheet.absoluteFillObject}
    contentFit="contain"
    transition={300}
  />
  </Pressable>
);

  };

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
          {...panResponder.panHandlers}
        >
          {/* Close Button */}
          <Animated.View
            style={[
              styles.closeButton,
              !showUI && styles.hidden,
            ]}
          >
            <TouchableOpacity onPress={onClose} style={styles.closeButtonInner}>
              <X size={24} color="white" strokeWidth={2} />
            </TouchableOpacity>
          </Animated.View>

          {/* Media Carousel */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            contentContainerStyle={{
              width: SCREEN_WIDTH * media.length,
            }}
          >
            {media.map(renderItem)}
          </ScrollView>

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

// Styles
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
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 20,
  },
  closeButtonInner: {
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 30,
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