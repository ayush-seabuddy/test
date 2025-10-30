import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImagesAssets } from "../assets/ImagesAssets";
import ArticalDetailsHeader from "../component/headers/ArticalDetailsHeader";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import ArticlesCard from "../component/Cards/ArticlesCards/ArticlesCard";
import { BlurView } from "@react-native-community/blur";
import Colors from "../colors/Colors";
import { useFocusEffect } from "@react-navigation/native";
import { apiCallWithToken, apiServerUrl } from "../Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Modal } from "react-native-paper";
import MediaPreviewModal from "../component/Modals/MediaPreviewModal";

const { height, width } = Dimensions.get("window");

const ArticlesDetails = ({ navigation, route, fromHome }) => {
  const { dataItem, item: routeItem } = route?.params || {};
  const [fullDetails, setFullDetails] = useState(null);
  const [recommendedData, setRecommendedData] = useState([]);
  const [notificationDetailModalVisible, setNotificationDetailModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [mediaPreviewVisible, setMediaPreviewVisible] = useState(false);
  const [mediaUri, setMediaUri] = useState("");
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);


  const fetchDetails = async () => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    let parsedItem;
    try {
      parsedItem = dataItem
        ? typeof dataItem === "string"
          ? JSON.parse(decodeURIComponent(dataItem))
          : dataItem
        : routeItem;
    } catch (error) {
      console.error("❌ Error parsing item:", error);
      return;
    }

    if (!parsedItem?.id) {
      console.error("❌ No valid item ID found, aborting request.");
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

        // 🔹 Check if user has already acknowledged
        const hasAcknowledged = response.result?.contentAcknowledge?.length > 0;
        setIsAcknowledged(hasAcknowledged);
      }

    } catch (error) {
      console.log("API Error:", error);
    }
  };
  const handleAcknowledge = async () => {
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
  };


  useEffect(() => {
    fetchDetails();
  }, [dataItem, routeItem]);

  const scrollViewRef = useRef(null);

  const handleArticleClick = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

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

  const timeDisplay = fullDetails?.createdAt ? getRelativeTime(fullDetails.createdAt) : "";

  useFocusEffect(
    useCallback(() => {
      const getRecommended = async () => {
        const userData = await AsyncStorage.getItem("userDetails");
        const myData = JSON.parse(userData);

        try {
          const result = await apiCallWithToken(
            `${apiServerUrl}/content/getRecommendedContents?contentId=${fullDetails?.id}`,
            "GET",
            null,
            myData.authToken
          );
          setRecommendedData(result.result || []);
        } catch (error) {
          console.log("API Error:", error);
        }
      };

      if (fullDetails?.id) {
        getRecommended();
      }
    }, [fullDetails?.id])
  );

  const [showFullText, setShowFullText] = useState(false);
  const description = fullDetails?.description?.replace(/<[^>]*>/g, "") || "";
  const shouldShowReadMore = description.length > 200;

  const toggleReadMore = () => {
    setShowFullText(!showFullText);
  };

  const showMediaPreview = (uri) => {
    setMediaUri(uri);
    setMediaPreviewVisible(true);
  };

  const hideMediaPreview = () => {
    setMediaPreviewVisible(false);
    setMediaUri("");
  };

  const showWebViewModal = () => setWebViewVisible(true);
  const hideWebViewModal = () => setWebViewVisible(false);

  const handleContentToggle = (item) => {
    if (item.toLowerCase().endsWith(".pdf")) {
      setPdfUrl(item);
      showWebViewModal();
    } else {
      showMediaPreview(item);
    }
  };

  const pdfModalStyle = {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    height: height,
    width: width,
    margin: 0,
  };

  const webViewSource =
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
      };

  return (
    <View style={styles.container}>
      <ArticalDetailsHeader navigation={navigation} data={fullDetails} fromHome={fromHome} />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <Image
        source={{ uri: fullDetails?.thumbnail }}
        style={styles.backgroundImage}
        resizeMode="contain"
      />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
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
                  {showFullText || !shouldShowReadMore
                    ? description
                    : `${description.slice(0, 200)}...`}
                </Text>
                {shouldShowReadMore && (
                  <TouchableOpacity onPress={toggleReadMore}>
                    <Text style={styles.readMoreText}>
                      {showFullText ? "Read less" : "Read more"}
                    </Text>
                  </TouchableOpacity>
                )}
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
                    fontFamily: 'Poppins-Regular',
                    fontWeight: '600',
                  }}
                >
                  I Acknowledge
                </Text>
              )}
            </TouchableOpacity>
          )}


        </View>
        {recommendedData.length > 0 && (
          <View style={styles.frameParent4}>
            <View style={[styles.recommendationArticlesWrapper, styles.wrapperSpaceBlock]}>
              <Text style={[styles.recommendationArticles, styles.bestClr]}>
                Other recommended articles
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ marginHorizontal: 16 }}
            >
              <ArticlesCard
                navigation={navigation}
                data={recommendedData}
                onArticleClick={handleArticleClick}
              />
            </ScrollView>
          </View>
        )}
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
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 60, marginVertical: 20 }}>
                <TouchableOpacity onPress={hideWebViewModal} style={styles.headerButton}>
                  <View style={styles.iconBackground}>
                    <Image source={ImagesAssets.backArrow} style={styles.headerIcon} />
                  </View>
                </TouchableOpacity>
                <Text style={styles.headerText}>
                  {fullDetails?.contentTitle?.length > 25
                    ? `${fullDetails.contentTitle.slice(0, 25)} ...`
                    : fullDetails?.contentTitle}
                </Text>
              </View>
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
                  document.querySelectorAll('a[href*=".pdf"], a[href*="download"]').forEach(function(link) {
                    link.removeAttribute('href');
                    link.style.pointerEvents = 'none';
                  });
                  if (navigator.share) {
                    navigator.share = undefined;
                  }
                  window.open = undefined;
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  backgroundImage: {
    width: "100%",
    height: Dimensions.get("window").height * 0.42,
    position: "absolute",
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 32,
    top: 0,
    left: 0,
    zIndex: -1,
  },
  scrollViewContent: {
    paddingTop: "45%",
    paddingBottom: "5%",
  },
  wrapperSpaceBlock: {
    paddingHorizontal: 16,
    alignSelf: "stretch",
  },
  picturesWrapperFlexBox: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignSelf: "stretch",
  },
  bestClr: {
    color: "#262626",
    textAlign: "left",
  },
  pointsTypo: {
    lineHeight: 10,
    fontSize: 8,
    fontFamily: "Poppins-Regular",
  },
  bestStreetFood: {
    textAlign: "left",
    fontFamily: "WhyteInktrap-Medium",
    fontWeight: "500",
    color: "#262626",
    fontSize: 18,
    marginBottom: 10,
    lineHeight: 25,
  },
  bestStreetFoodInUkParent: {
    alignItems: "center",
  },
  groupAct: {
    color: "#fff",
    fontFamily: "Poppins-Regular",
    textAlign: "left",
  },
  groupActWrapper: {
    backgroundColor: "#06361f",
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 32,
    alignItems: "center",
  },
  frameView: {
    gap: 4,
    flexDirection: "row",
    alignSelf: "stretch",
    alignItems: "center",
    flexWrap: "wrap",
  },
  loremIpsumIsSimply: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Poppins-Regular",
    textAlign: "left",
    alignSelf: "stretch",
  },
  loremIpsumIsSimplyDummyTeParent: {
    gap: 16,
    alignSelf: "stretch",
  },
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
  frameWrapper1: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    flexDirection: "row",
    alignSelf: "stretch",
  },
  frameContainer: {
    gap: 24,
    width: "100%",
  },
  frameWrapper: {
    backgroundColor: "rgba(180, 180, 180, 0.6)",
    paddingBottom: 16,
    paddingTop: 10,
    borderRadius: 10,
    paddingHorizontal: 16,
    overflow: "hidden",
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
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  frameParent3: {
    flexWrap: "wrap",
    alignContent: "flex-start",
    flexDirection: "row",
    alignSelf: "stretch",
    gap: 12,
    width: "100%",
  },
  frameParent2: {
    gap: 4,
    width: "100%",
  },
  frameGroup: {
    width: "100%",
    gap: 8,
    paddingHorizontal: 16,
  },
  recommendationArticles: {
    lineHeight: 27,
    textAlign: "left",
    fontFamily: "WhyteInktrap-Medium",
    fontWeight: "500",
    color: "#262626",
    fontSize: 18,
    flex: 1,
  },
  recommendationArticlesWrapper: {
    paddingTop: 25,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  frameParent4: {
    alignSelf: "stretch",
    gap: 8,
  },
  readMoreText: {
    color: Colors.black,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    marginTop: 8,
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
    width: "80%",
    height: "30%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  pdfModalContainer: {
    flex: 1,
    width: "100%",
  },
  webView: {
    flex: 1,
    width: "100%",
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  iconBackground: {
    borderRadius: 8,
    paddingHorizontal: 3,
    paddingVertical: 3,
  },
  headerButton: {
    marginLeft: 10,
  },
  headerText: {
    marginLeft: 16,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: "Poppins-Regular",
    color: "#262626",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ArticlesDetails;