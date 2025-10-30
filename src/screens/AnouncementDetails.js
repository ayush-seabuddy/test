import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AnouncementDetailsHeader from "../component/headers/AnouncementDetailsHeader";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import { BlurView } from "@react-native-community/blur";
import Colors from "../colors/Colors";
import NetInfo from "@react-native-community/netinfo";
import { apiCallWithToken, apiServerUrl } from "../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Modal } from "react-native-paper";
import { WebView } from "react-native-webview";
import MediaPreviewModal from "../component/Modals/MediaPreviewModal";
import VideoDetailsHeader from "../component/headers/VideoDetailsHeader";

const { width, height } = Dimensions.get("window");

const AnouncementDetails = ({ navigation, route }) => {
  const { item, fromHome } = route?.params || {};
  const [data, setData] = useState(item || {});
  const [fullDetails, setFullDetails] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [notificationDetailModalVisible, setNotificationDetailModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [mediaPreviewVisible, setMediaPreviewVisible] = useState(false);
  const [mediaUri, setMediaUri] = useState("");
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Update data only if item is valid
  useEffect(() => {
    if (item && item.id) {
      setData(item);
    } else {
      console.warn("⚠️ Invalid or missing item in route.params:", item);
      setSelectedNotification({
        title: "Invalid Content",
        content: "The requested content is not available.",
      });
      setNotificationDetailModalVisible(true);
    }
  }, [item]);

  const getRelativeTime = useCallback((dateString) => {
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
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const timeDisplay = useMemo(() => fullDetails?.createdAt ? getRelativeTime(fullDetails.createdAt) : "", [fullDetails?.createdAt, getRelativeTime]);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      // Check if data has a valid id
      if (!data?.id) {
        console.warn("⚠️ No valid activity ID in data:", data);
        setSelectedNotification({
          title: "Invalid Content",
          content: "The requested content is not available.",
        });
        setNotificationDetailModalVisible(true);
        setIsLoading(false);
        return;
      }

      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);

      let parsedItem;
      try {
        parsedItem = typeof data === "string" ? JSON.parse(decodeURIComponent(data)) : data;
      } catch (error) {
        console.error("❌ Error parsing activity:", error);
        setSelectedNotification({
          title: "Error",
          content: "Failed to parse content data.",
        });
        setNotificationDetailModalVisible(true);
        setIsLoading(false);
        return;
      }

      if (!parsedItem?.id) {
        console.error("❌ No valid activity ID found in parsedItem:", parsedItem);
        setSelectedNotification({
          title: "Invalid Content",
          content: "The requested content is not available.",
        });
        setNotificationDetailModalVisible(true);
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiCallWithToken(
          `${apiServerUrl}/content/viewContentDetails?contentId=${parsedItem.id}`,
          "GET",
          null,
          userDetails.authToken
        );
        if (response.responseCode === 200) {
          if (!response.result.id) {
            const newData = { title: "Post not found", content: "This post is not available anymore" };
            setSelectedNotification(newData);
            setNotificationDetailModalVisible(true);
            return;
          }
          setFullDetails(response.result);
          const hasAcknowledged = response.result?.contentAcknowledge?.length > 0;
          setIsAcknowledged(hasAcknowledged);
        }
      } catch (error) {
        console.error("❌ API call error:", error);
        setSelectedNotification({
          title: "Error",
          content: "Failed to fetch content details. Please try again later.",
        });
        setNotificationDetailModalVisible(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [data]);


  const handleAcknowledge = useCallback(async () => {
    try {
      setIsAcknowledging(true);

      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);

      const payload = { contentId: fullDetails?.id };

      const response = await apiCallWithToken(
        `${apiServerUrl}/user/acknowledgeContent`,
        "POST",
        payload,
        userDetails.authToken
      );

      if (response.responseCode === 200) {
        console.log("✅ Acknowledged Successfully:", response.result);
        setIsAcknowledged(true);
      } else {
        console.warn("⚠️ Failed to acknowledge:", response.responseMessage);
      }
    } catch (error) {
      console.error("❌ Error acknowledging content:", error);
    } finally {
      setIsAcknowledging(false);
    }
  }, [fullDetails?.id]);

  const showMediaPreview = useCallback((uri) => {
    setMediaUri(uri);
    setMediaPreviewVisible(true);
  }, []);

  const hideMediaPreview = useCallback(() => {
    setMediaPreviewVisible(false);
    setMediaUri("");
  }, []);

  const showWebViewModal = useCallback(() => setWebViewVisible(true), []);

  const hideWebViewModal = useCallback(() => setWebViewVisible(false), []);

  const handleContentToggle = useCallback((item) => {
    if (item.toLowerCase().endsWith(".pdf")) {
      setPdfUrl(item);
      showWebViewModal();
    } else {
      showMediaPreview(item);
    }
  }, [showWebViewModal, showMediaPreview]);

  const pdfModalStyle = useMemo(() => ({
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    height: height,
    width: width,
    margin: 0,
  }), []);

  const webViewSource = useMemo(() =>
    Platform.OS === "android"
      ? {
          uri: `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`,
          headers: {
            Accept: "text/html,application/xhtml+xml,application/pdf",
            "Content-Type": "application/pdf",
          },
        }
      : {
          uri: pdfUrl,
          headers: {
            Accept: "application/pdf",
            "Content-Type": "application/pdf",
          },
        },
    [pdfUrl]
  );

  const imageSource = useMemo(() => {
    if (isOffline && data?.localThumbnail) {
      return { uri: `file://${data.localThumbnail}` };
    } else if (fullDetails?.thumbnail) {
      return { uri: fullDetails.thumbnail };
    }
    return null; // Or a default require if available
  }, [isOffline, data?.localThumbnail, fullDetails?.thumbnail]);

  const truncatedTitle = useMemo(() => {
    return fullDetails?.contentTitle?.length > 20
      ? `${fullDetails.contentTitle.slice(0, 20)}...`
      : fullDetails?.contentTitle || "";
  }, [fullDetails?.contentTitle]);

  const strippedDescription = useMemo(() => {
    return fullDetails?.description?.replace(/<[^>]*>/g, "") || "";
  }, [fullDetails?.description]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!webViewVisible && (
        <VideoDetailsHeader
          navigation={navigation}
          title={truncatedTitle}
          fromHome={fromHome}
        />
      )}

      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />

      {imageSource && (
        <Image
          source={imageSource}
          style={styles.backgroundImage}
          resizeMode="contain"
        />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.frameGroup}>
          <View style={[styles.frameWrapper, styles.wrapperSpaceBlock]}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={30}
              reducedTransparencyFallbackColor="white"
            />
            <View style={styles.frameContainer}>
              <View style={[styles.bestStreetFoodInUkParent, styles.picturesWrapperFlexBox]}>
                <Text style={[styles.bestStreetFood, styles.bestClr]}>
                  {fullDetails?.contentTitle || ""}
                </Text>
              </View>
              <View style={styles.loremIpsumIsSimplyDummyTeParent}>
                <Text style={[styles.loremIpsumIsSimply, styles.bestClr]}>
                  {strippedDescription}
                </Text>
              </View>
              <View style={styles.frameWrapper1}>
                <View style={styles.frameParent1}>
                  <Text style={styles.postedOnLabel}>Posted on: </Text>
                  <Text style={styles.postedOnDate}>{timeDisplay}</Text>
                </View>
              </View>
            </View>
          </View>

          {fullDetails?.contentUrl?.length > 0 && (
            <View style={[styles.frameWrapper, styles.wrapperSpaceBlock]}>
              <View style={styles.frameParent2}>
                <View style={styles.picturesWrapperFlexBox}>
                  <Text style={[styles.bestStreetFood, styles.bestClr]}>
                    Contents
                  </Text>
                </View>
                <View style={styles.frameParent3}>
                  {fullDetails.contentUrl.map((item, index) => (
                    <TouchableOpacity
                      style={styles.pdfButton}
                      onPress={() => handleContentToggle(item)}
                      key={index}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.pdfButtonText}>
                        Click to view {item.toLowerCase().endsWith(".pdf") ? "PDF" : "Image"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {!isAcknowledged && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                backgroundColor: isAcknowledging ? '#999' : '#000',
                height: 48,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                elevation: 4,
                marginTop: 12,
              }}
              disabled={isAcknowledging}
              onPress={handleAcknowledge}
            >
              {isAcknowledging ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontFamily: 'Poppins-SemiBold',
                  }}
                >
                  I Acknowledge
                </Text>
              )}
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>

      <MediaPreviewModal
        visible={mediaPreviewVisible}
        onClose={hideMediaPreview}
        uri={mediaUri}
        type="image"
      />

      <Modal
        visible={webViewVisible}
        onDismiss={hideWebViewModal}
        contentContainerStyle={pdfModalStyle}
        transparent={false}
      >
        <View style={styles.pdfModalContainer}>
          {pdfUrl ? (
            <>
              <AnouncementDetailsHeader
                navigation={navigation}
                hideWebViewModal={hideWebViewModal}
                title={truncatedTitle}
              />
              <WebView
                source={webViewSource}
                style={styles.webView}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scalesPageToFit={true}
                cacheEnabled={true}
                allowsInlineMediaPlayback={Platform.OS === "ios"}
                mediaPlaybackRequiresUserAction={false}
                originWhitelist={["*"]}
                setSupportMultipleWindows={false}
                renderLoading={() => (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text>Loading PDF...</Text>
                  </View>
                )}
                renderError={(errorName, errorCode, errorDesc) => (
                  <View style={styles.loadingContainer}>
                    <Text>Error loading PDF: {errorDesc}</Text>
                    <TouchableOpacity onPress={hideWebViewModal} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                )}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn("WebView error:", nativeEvent.description, nativeEvent.url);
                }}
                onShouldStartLoadWithRequest={(request) => {
                  if (
                    request.url === pdfUrl ||
                    request.url.includes(".pdf") ||
                    (Platform.OS === "android" &&
                      request.url.startsWith("https://docs.google.com/viewer"))
                  ) {
                    return true;
                  }
                  console.warn("Blocked URL:", request.url);
                  return false;
                }}
                injectedJavaScript={`
                  document.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                  });
                  document.body.style.userSelect = 'none';
                  document.body.style.webkitUserSelect = 'none';
                  true;
                `}
                androidHardwareAccelerationDisabled={false}
                androidLayerType={Platform.OS === "android" ? "hardware" : "none"}
              />
            </>
          ) : (
            <View style={styles.loadingContainer}>
              <Text>No valid PDF URL found</Text>
              <TouchableOpacity onPress={hideWebViewModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

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
                setNotificationDetailModalVisible(false);
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  backgroundImage: {
    width: "100%",
    height: Dimensions.get("window").height * 0.38,
    position: "absolute",
    top: 55,
    left: 0,
    zIndex: -1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  scrollViewContent: { paddingTop: "45%", paddingBottom: "10%" },
  wrapperSpaceBlock: { paddingHorizontal: 16, alignSelf: "stretch" },
  picturesWrapperFlexBox: { justifyContent: "space-between", flexDirection: "row", alignSelf: "stretch" },
  bestClr: { color: "#262626", textAlign: "left" },
  bestStreetFood: {
    textAlign: "left",
    fontFamily: "WhyteInktrap-Medium",
    fontWeight: "500",
    color: "#262626",
    marginBottom: 10,
    fontSize: 18,
    lineHeight: 25,
  },
  bestStreetFoodInUkParent: { alignItems: "center" },
  loremIpsumIsSimply: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Poppins-Regular",
    textAlign: "left",
    alignSelf: "stretch",
  },
  loremIpsumIsSimplyDummyTeParent: { gap: 16, alignSelf: "stretch", marginBottom: 20 },
  postedOnLabel: {
    lineHeight: 14,
    color: "#06361f",
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    textAlign: "left",
    fontWeight: "500",
  },
  postedOnDate: {
    lineHeight: 14,
    color: "#262626",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    textAlign: "left",
  },
  frameParent1: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  frameWrapper1: { alignItems: "flex-end", justifyContent: "space-between", flexDirection: "row", alignSelf: "stretch" },
  frameContainer: { gap: 24, width: "100%" },
  frameWrapper: {
    backgroundColor: "rgba(180, 180, 180, 0.6)",
    paddingTop: 14,
    paddingBottom: 16,
    borderRadius: 10,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  frameItem: { width: "31%", height: 96, borderRadius: 8 },
  frameParent3: {
    flexWrap: "wrap",
    alignContent: "flex-start",
    flexDirection: "row",
    alignSelf: "stretch",
    gap: 12,
    width: "100%",
  },
  pdfButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  pdfButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  frameParent2: { gap: 4, width: "100%" },
  frameGroup: { width: "100%", gap: 8, paddingHorizontal: 16 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
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
    width: "80%",
    height: "30%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  modalContent: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  closeButton: { backgroundColor: Colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
  pdfModalContainer: { flex: 1, width: "100%", paddingTop: 10 },
  webView: { flex: 1, width: "100%" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default AnouncementDetails;