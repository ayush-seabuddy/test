import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Slider from "@react-native-community/slider";
import NetInfo from "@react-native-community/netinfo";
import NoInternetModal from "../../Modals/NoInternetModal";
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  usePlaybackState,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../../../Api";
import CustomLottie from "../../CustomLottie";
import { setupGlobalPlayer } from "./PlayerService";
import { Modal } from "react-native-paper";
import Colors from "../../../colors/Colors";
import MusicPlayerHeader from "../../headers/ProfileHeader/MusicPlayerHeader";

const { height, width } = Dimensions.get("screen");

const MusicPlayer = ({ navigation, route }) => {
  const { dataItem, fromHome, fromNotification = false } = route?.params || {};
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [fullDetails, setFullDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLooping, setIsLooping] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [notificationDetailModalVisible, setNotificationDetailModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const playbackState = usePlaybackState();
  const progress = useProgress();

  const isPlaying = useMemo(() => playbackState?.state === State.Playing, [playbackState]);

  const formatTime = useCallback((seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  const currentTime = useMemo(() => formatTime(progress.position), [progress.position, formatTime]);
  const durationTime = useMemo(() => formatTime(progress.duration), [progress.duration, formatTime]);

  // Check network status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Toggle loop functionality
  const toggleLoop = useCallback(async () => {
    try {
      const newLoopState = !isLooping;
      await TrackPlayer.setRepeatMode(newLoopState ? RepeatMode.Track : RepeatMode.Off);
      setIsLooping(newLoopState);
    } catch (error) {
      console.error("Error toggling loop:", error);
    }
  }, [isLooping]);

  // Handle track player events
  useTrackPlayerEvents(
    [
      Event.PlaybackState,
      Event.PlaybackError,
      Event.RemotePlay,
      Event.RemotePause,
      Event.RemoteStop,
      Event.RemoteSeek,
      Event.RemoteJumpForward,
      Event.RemoteJumpBackward,
    ],
    async (event) => {
      switch (event.type) {
        case Event.PlaybackState:
          setIsBuffering(event.state === State.Buffering);
          break;
        case Event.PlaybackError:
          console.error("[Player] Playback error:", event.error);
          setError("Playback error occurred");
          break;
        case Event.RemotePlay:
          await TrackPlayer.play();
          break;
        case Event.RemotePause:
          await TrackPlayer.pause();
          break;
        case Event.RemoteStop:
          await TrackPlayer.stop();
          break;
        case Event.RemoteSeek:
          await TrackPlayer.seekTo(event.position);
          break;
        case Event.RemoteJumpForward:
          await handleSkip(10);
          break;
        case Event.RemoteJumpBackward:
          await handleSkip(-10);
          break;
        default:
          console.log("[Player] Unhandled event:", event);
      }
    }
  );

  // Fetch content details
  const fetchDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      let item = dataItem;
      if (typeof dataItem === "string") {
        item = JSON.parse(decodeURIComponent(dataItem));
      } else if (!item && route?.params?.item) {
        item = route.params.item;
      }

      if (!item?.id) {
        setError("No valid content ID");
        return;
      }

      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      const response = await apiCallWithToken(
        `${apiServerUrl}/content/viewContentDetails?contentId=${item.id}`,
        "GET",
        null,
        userDetails.authToken
      );

      if (response.responseCode === 200) {
        if (!response.result.id) {
          setSelectedNotification({ title: "Post not found", content: "This post is not available anymore" });
          setNotificationDetailModalVisible(true);
          return;
        }
        setFullDetails(response.result);
      } else {
        setError("Failed to fetch content details");
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      setError("Error fetching content");
    } finally {
      setIsLoading(false);
    }
  }, [dataItem, route?.params?.item]);

  // Initialize player and handle cleanup
  useEffect(() => {
    let isMounted = true;

    const initializePlayer = async () => {
      try {
        // Check if TrackPlayer is already initialized
        const state = await TrackPlayer.getState();
        if (state !== State.None) {
          console.log("[Player] TrackPlayer already initialized, skipping setup");
          if (isMounted) setIsPlayerReady(true);
          return;
        }

        const setupSuccessful = await setupGlobalPlayer();
        if (isMounted && setupSuccessful) {
          setIsPlayerReady(true);
        }
      } catch (error) {
        console.error("[Player] Initialization error:", error);
        setError("Failed to initialize player");
      }
    };

    initializePlayer();
    fetchDetails();

    const unsubscribe = navigation.addListener("beforeRemove", async () => {
      try {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
        console.log("[MusicPlayer] Stopped and reset TrackPlayer on navigation");
      } catch (err) {
        console.error("[MusicPlayer] Error during navigation cleanup:", err);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [navigation, fetchDetails]);

  // Load and play track
  useEffect(() => {
    const loadTrack = async () => {
      if (!isPlayerReady || !fullDetails?.contentUrl?.[0]) return;

      try {
        await TrackPlayer.reset();
        await TrackPlayer.add({
          id: fullDetails.id || "unknown",
          url: fullDetails.contentUrl[0],
          title: fullDetails.contentTitle || "Unknown Title",
          artist: fullDetails?.contentUser?.fullName || "Unknown Artist",
          artwork: fullDetails?.thumbnail || undefined,
          album: fullDetails?.albumName || "Music",
          duration: fullDetails?.duration || 0,
          pitchAlgorithm: "Music",
          userInfo: {
            contentId: fullDetails.id,
            contentType: "audio",
          },
        });
        await TrackPlayer.setRepeatMode(RepeatMode.Off);
        await TrackPlayer.play();
      } catch (error) {
        console.error("[Player] Error loading track:", error);
        setError("Failed to load audio");
      } finally {
        setIsLoading(false);
      }
    };

    loadTrack();
  }, [isPlayerReady, fullDetails]);

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    if (!isPlayerReady) return;

    try {
      const currentState = await TrackPlayer.getState();
      if (currentState === State.Playing) {
        await TrackPlayer.pause();
      } else {
        if (currentState === State.Stopped || currentState === State.None) {
          await TrackPlayer.seekTo(0);
        }
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error("[Player] Error toggling playback:", error);
      setError("Playback control failed");
    }
  }, [isPlayerReady]);

  // Handle seek
  const handleSeek = useCallback(async (value) => {
    if (!isPlayerReady) return;
    try {
      await TrackPlayer.seekTo(value);
    } catch (error) {
      console.error("Error during seek:", error);
    }
  }, [isPlayerReady]);

  // Handle skip
  const handleSkip = useCallback(async (seconds) => {
    if (!isPlayerReady) return;
    try {
      const position = await TrackPlayer.getPosition();
      const duration = await TrackPlayer.getDuration();
      const newPosition = Math.max(0, Math.min(position + seconds, duration));
      await TrackPlayer.seekTo(newPosition);
    } catch (error) {
      console.error("Error skipping:", error);
    }
  }, [isPlayerReady]);

  if (error && !isOffline) {
    return (
      <View style={styles.container}>
        <MusicPlayerHeader
          navigation={navigation}
          title="Error"
          fromHome={fromHome}
          fromNotification={fromNotification}
        />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      {isOffline ? (
        <NoInternetModal visible={isOffline} onClose={() => navigation.goBack()} />
      ) : (
        <>
          <MusicPlayerHeader
            navigation={navigation}
            title={fullDetails?.contentTitle || "Music Player"}
            fromHome={fromHome}
            fromNotification={fromNotification}
          />
          <View style={styles.container}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: fullDetails?.thumbnail }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
            <View style={styles.content}>
              <View style={{ alignItems: "center", marginBottom: 10 }}>
                <TouchableOpacity onPress={toggleLoop} style={{ marginBottom: 10 }}>
                  <Icon
                    name={isLooping ? "repeat-on" : "repeat"}
                    size={28}
                    color={isLooping ? Colors.secondary : "white"}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.contentTitle}>{fullDetails?.contentTitle}</Text>
              <View style={styles.sliderContainer}>
                <View style={styles.controls}>
                  <TouchableOpacity onPress={() => handleSkip(-10)} disabled clays={isLoading}>
                    <Icon name="replay-10" size={40} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={togglePlayPause}
                    disabled={isLoading}
                  >
                    {isLoading || isBuffering || playbackState?.state === State.Buffering ? (
                      <ActivityIndicator size={50} color="#06361F" />
                    ) : (
                      <Icon
                        name={isPlaying ? "pause" : "play-arrow"}
                        size={50}
                        color="#06361F"
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleSkip(10)} disabled={isLoading}>
                    <Icon name="forward-10" size={40} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.controlsSlider}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={progress.duration > 0 ? progress.duration : 1}
                    value={progress.position}
                    minimumTrackTintColor="#06361F"
                    maximumTrackTintColor="#D3D3D3"
                    thumbTintColor="#fff"
                    disabled={isLoading}
                    onSlidingComplete={handleSeek}
                  />
                </View>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>{currentTime}</Text>
                  <Text style={styles.timeText}>{durationTime}</Text>
                </View>
              </View>
            </View>
            <View style={styles.background}>
              <CustomLottie />
            </View>
            <Modal
              visible={notificationDetailModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setNotificationDetailModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.notificationDetailModal}>
                  <Text style={styles.modalTitle}>{selectedNotification?.title}</Text>
                  <Text style={styles.modalContent}>{selectedNotification?.content}</Text>
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  imageContainer: {
    flexBasis: 300,
    marginHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    height: 300,
    width: 300,
    marginTop: 40,
    borderWidth: 1,
    borderColor: "#c1c1c1",
    borderRadius: 500,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  content: {
    marginTop: 20,
    flexBasis: 300,
    alignItems: "center",
    height: "45%",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    zIndex: 1000,
    position: "absolute",
    bottom: 0,
    width,
  },
  contentTitle: {
    lineHeight: 30,
    marginHorizontal: 20,
    fontSize: 20,
    fontFamily: "WhyteInktrap-Bold",
    color: "#fff",
  },
  sliderContainer: {
    width: "100%",
    marginBottom: 20,
    marginTop: 10,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    marginBottom: 30,
  },
  controlsSlider: {
    flexDirection: "row",
    marginHorizontal: 20,
  },
  playButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 50,
  },
  slider: {
    flex: 1,
    zIndex: 100,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 30,
  },
  timeText: {
    fontSize: 13,
    color: "#fff",
  },
  background: {
    backgroundColor: "#c1c1c1",
    overflow: "hidden",
    height: "50%",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    zIndex: -1,
    position: "absolute",
    bottom: 0,
    width,
  },
  errorText: {
    fontSize: 16,
    color: "#ff0000",
    textAlign: "center",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  notificationDetailModal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    justifyContent: "center",
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalContent: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default MusicPlayer;