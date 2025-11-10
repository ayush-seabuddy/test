import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  Dimensions,
  TouchableOpacity,
  AppState,
} from "react-native";
import { ImagesAssets } from "../assets/ImagesAssets";
import VideoDetailsHeader from "../component/headers/VideoDetailsHeader";
import RelatedVideosCard from "../component/Cards/RelatedVideosCard";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import { BlurView } from "@react-native-community/blur";
import Video from "react-native-video";
import { useFocusEffect } from "@react-navigation/native";
import { apiCallWithToken, apiServerUrl } from "../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Modal } from "react-native-paper";

const VideosDetails = ({ navigation, route }) => {
  const dataItem = route.params.dataItem;
  const fromHome = route.params.fromHome;

  const [fullDetails, setFullDetails] = useState();
  const [notificationDetailModalVisible, setNotificationDetailModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [RecommendedData, setRecommendedData] = useState([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef(null);
  const videoRef = useRef(null);
  const appState = useRef(AppState.currentState);

  // ✅ Fetch video details
  const DetailsData = async () => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    try {
      let item;
      try {
        item =
          typeof dataItem === "string"
            ? JSON.parse(decodeURIComponent(dataItem))
            : dataItem;
      } catch (error) {
        console.error("❌ Error parsing activity:", error);
        return;
      }

      if (!dataItem) {
        try {
          item = route?.params?.item;
        } catch (error) {
          console.error("❌ Error parsing activity:", error);
          return;
        }
      }

      if (!item?.id) {
        console.error("❌ No valid activity ID found, aborting request.");
        return;
      }

      const response = await apiCallWithToken(
        `${apiServerUrl}/content/viewContentDetails?contentId=${item?.id}`,
        "GET",
        null,
        userDetails.authToken
      );
      if (response.responseCode === 200) {
        if (!response.result.id) {
          let newData = {
            title: "Post not found",
            content: "This post is not available anymore",
          };
          setSelectedNotification(newData);
          setNotificationDetailModalVisible(true);
          return;
        }
        setFullDetails(response.result);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    DetailsData();
  }, [dataItem]);

  // ✅ Handle stopping video when user leaves screen or app goes background
  useFocusEffect(
    useCallback(() => {
      const subscription = AppState.addEventListener("change", (nextAppState) => {
        if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
          if (videoRef.current && videoRef.current.pause) {
            videoRef.current.pause();
          }
        }
        appState.current = nextAppState;
      });

      return () => {
        if (videoRef.current && videoRef.current.pause) {
          videoRef.current.pause();
        }
        subscription.remove();
      };
    }, [])
  );

  // ✅ Fetch Recommended Videos
  useFocusEffect(
    useCallback(() => {
      async function getRecommended() {
        const UserData = await AsyncStorage.getItem("userDetails");
        const mydata = JSON.parse(UserData);

        try {
          const result = await apiCallWithToken(
            `${apiServerUrl}/content/getRecommendedContents?contentId=${fullDetails?.id}`,
            "GET",
            null,
            mydata.authToken
          );
          setRecommendedData([...result.result]);
        } catch (error) {
          console.log("API Error:", error);
        }
      }

      if (fullDetails?.id) getRecommended();
    }, [fullDetails?.id])
  );

  const handleEnd = () => setFullscreen(false);
  const handleFullscreen = () => setFullscreen(!fullscreen);

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);

    if (diffInSeconds < 60) {
      return `Just now`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
      return (
        commentDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }) +
        ` at ${commentDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`
      );
    }
  };

  const timeDisplay = getRelativeTime(fullDetails?.createdAt);

  return (
    <View style={styles.container}>
      <VideoDetailsHeader navigation={navigation} data={fullDetails} fromHome={fromHome} />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "white-content" : "dark-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />

      {/* ✅ Video Player */}
      <View style={{ position: "relative", flex: fullscreen ? 1 : 0 }}>
        {loading && (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{ position: "absolute", top: "40%", left: "40%", zIndex: 1 }}
          />
        )}
        <Video
          ref={videoRef}
          source={{ uri: fullDetails?.contentUrl?.[0] }}
          style={[
            styles.backgroundVideo,
            fullscreen && { width: "100%", height: "100%" },
          ]}
          controls={true}
          onLoadStart={() => setLoading(true)}
          onBuffer={({ isBuffering }) => setLoading(isBuffering)}
          onLoad={() => setLoading(false)}
          onEnd={handleEnd}
          resizeMode="contain"
          onFullscreenPlayerWillPresent={handleFullscreen}
          onFullscreenPlayerWillDismiss={handleFullscreen}
        />
      </View>

      {/* ✅ ScrollView */}
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
      >
        <View style={styles.cardContainer}>
          <View style={{ zIndex: -1 }}>
            <View style={styles.frameParent}>
              <View style={styles.frameWrapper}>
                <View style={[styles.frameContainer, styles.frameContainerSpaceBlock]}>
                  <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="light"
                    blurAmount={30}
                    reducedTransparencyFallbackColor="white"
                  />
                  <View style={styles.frameGroup}>
                    <View style={styles.yogaForBeginnerParent}>
                      <Text style={[styles.yogaForBeginner, styles.yogaClr]}>
                        {fullDetails?.contentTitle || ""}
                      </Text>
                    </View>
                    <View style={styles.loremIpsumWrapper}>
                      <Text style={[styles.loremIpsumText, styles.yogaClr]}>
                        {fullDetails?.description}
                      </Text>
                    </View>
                    <View style={styles.frameParent1}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={styles.videoBy}>Posted on - {timeDisplay}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ✅ Related Videos */}
        {RecommendedData && RecommendedData?.length > 0 ? (
          <>
            <View style={[styles.relatedVideosWrapper, styles.frameWrapperFlexBox]}>
              <Text style={[styles.relatedVideos, styles.yogaClr]}>Related Videos</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16 }}
            >
              {RecommendedData?.length > 0 && (
                <RelatedVideosCard
                  navigation={navigation}
                  data={RecommendedData}
                  onArticleClick={() => {
                    if (scrollViewRef.current) {
                      scrollViewRef.current.scrollTo({ y: 0, animated: true });
                    }
                  }}
                />
              )}
            </ScrollView>
          </>
        ) : null}
      </ScrollView>

      {/* ✅ Fallback Modal */}
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
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollViewContent: {
    paddingBottom: "10%",
    zIndex: -1,
    flexGrow: 1,
  },
  cardContainer: { gap: 16 },
  frameContainerSpaceBlock: {
    paddingHorizontal: 16,
    alignSelf: "stretch",
  },
  yogaClr: { color: "#262626" },
  frameWrapperFlexBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  yogaForBeginner: {
    fontFamily: "WhyteInktrap-Medium",
    fontWeight: "500",
    fontSize: 18,
    lineHeight: 25,
  },
  loremIpsumText: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Poppins-Regular",
  },
  loremIpsumWrapper: { alignSelf: "stretch" },
  videoBy: {
    lineHeight: 14,
    color: "#06361f",
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    fontWeight: "500",
  },
  frameParent1: { gap: 8, justifyContent: "center" },
  frameGroup: { width: "100%", gap: 24 },
  frameContainer: {
    backgroundColor: "rgba(180, 180, 180, 0.6)",
    paddingVertical: 16,
    borderRadius: 10,
    overflow: "hidden",
  },
  frameWrapper: { width: "90%", alignSelf: "center" },
  relatedVideos: {
    lineHeight: 27,
    fontFamily: "WhyteInktrap-Medium",
    fontWeight: "500",
    fontSize: 18,
  },
  relatedVideosWrapper: {
    paddingHorizontal: 16,
    alignSelf: "stretch",
  },
  frameParent: { paddingVertical: 16, alignItems: "center" },
  backgroundVideo: {
    width: "100%",
    height: Dimensions.get("window").height * 0.25,
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
    width: "100%",
    height: "60%",
    justifyContent: "center",
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
});

export default VideosDetails;
