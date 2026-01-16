
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { getRecommendedContents, acknowledgeContent } from "@/src/apis/apiService";
import GlobalHeader from "@/src/components/GlobalHeader";
import MediaPreviewModal from "@/src/components/Modals/MediaPreviewModal";
import PDFModal from "@/src/components/Modals/PDFModal";
import Colors from "@/src/utils/Colors";
import { Video } from "expo-av";
import { BlurView } from "expo-blur";
import { ImageBackground } from "expo-image";
import { router } from "expo-router";
import { t } from "i18next";
import { Modal } from "react-native-paper";
import RelatedVideosCard from "./RelatedContentCard";
import { Content } from "./type";
import CommonLoader from "@/src/components/CommonLoader";


const { height } = Dimensions.get("window");

export default function ArticleDetails({ data: fullDetails }: { data: Content }) {
  const [notificationDetailModalVisible, setNotificationDetailModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [RecommendedData, setRecommendedData] = useState<any[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const videoRef = useRef<Video>(null);
  const appState = useRef(AppState.currentState);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("App Guide");
  const [mediaPreviewVisible, setMediaPreviewVisible] = useState<boolean>(false);
  const [mediaUri, setMediaUri] = useState<string>("");
  const [isAcknowledged, setIsAcknowledged] = useState<boolean>(fullDetails?.contentAcknowledge?.length > 0);
  const [isAcknowledging, setIsAcknowledging] = useState<boolean>(false);

  const handleOpenPDF: (url: string, title: string) => void = (url, title) => {
    setPdfUrl(url);
    setPdfTitle(title);
    setPdfModalVisible(true);
  };

  const showMediaPreview = (uri: string) => {
    setMediaUri(uri);
    setMediaPreviewVisible(true);
  };
  const handleClosePDF = () => {
    setPdfModalVisible(false);
    setPdfUrl("");
    setPdfTitle("App Guide");
  };

  const handleContentToggle = (item: string) => {
    if (item.toLowerCase().endsWith(".pdf")) {
      handleOpenPDF(item, "Article");
    }
    else {
      showMediaPreview(item);
    }
  };
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (appState.current === "active" && nextAppState !== "active") {
        await videoRef.current?.pauseAsync();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      videoRef.current?.pauseAsync();
    };
  }, []);

  useEffect(() => {
    async function getRecommended() {
      if (!fullDetails?.id) return;
      try {
        const result = await getRecommendedContents({ contentId: fullDetails?.id });
        setRecommendedData(result.data ?? []);
      } catch (error) {
        console.log("API Error:", error);
      }
    }

    getRecommended();
  }, [fullDetails?.id]);

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return "";
    const now = new Date();
    const commentDate = new Date(dateString);

    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return `Just now`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;

    return commentDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAcknowledge = useCallback(async () => {
    try {
      setIsAcknowledging(true);
      const payload = { contentId: fullDetails?.id };
      const response = await acknowledgeContent(payload)
      if (response.status === 200) {
        setIsAcknowledged(true);
      }
    } catch (error) {
      console.error("❌ Error acknowledging content:", error);
    } finally {
      setIsAcknowledging(false);
    }
  }, [fullDetails?.id]);

  return (
    <View style={styles.container}>
      <GlobalHeader
        title={fullDetails?.contentTitle}
      />
      <ImageBackground
        source={{ uri: fullDetails?.thumbnail }}
        style={styles.headerImage}
        resizeMode="cover"
      />
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          <View style={styles.frameWrapper}>
            <View style={styles.frameContainer}>
              <BlurView intensity={40} style={StyleSheet.absoluteFill} />
              <View style={styles.frameContent}>
                <Text style={styles.title}>{fullDetails?.contentTitle}</Text>
                <Text style={styles.description}>{fullDetails?.description}</Text>
                <Text style={styles.postedOn}><Text style={styles.postedOnText}>Posted on: </Text>{getRelativeTime(fullDetails?.createdAt)}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.cardContainer}>
          <View style={styles.frameContainer}>
            <Text style={styles.title}>{t("Contents")}</Text>
            <View style={styles.frameParent}>
              {fullDetails?.contentUrl?.map((item: any, index: number) => (
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
        {!isAcknowledged && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={
              [{ backgroundColor: isAcknowledging ? '#999' : '#000' }, styles.acknowledgeButton]
            }
            disabled={isAcknowledging}
            onPress={handleAcknowledge}
          >
            {isAcknowledging ? (
              <CommonLoader color="#FFF" />
            ) : (
              <Text
                style={
                  styles.acknowledgeButtonText
                }
              >
                {t('I_Acknowledge')}
              </Text>
            )}
          </TouchableOpacity>
        )}
        <View style={{ paddingHorizontal: 16 }}>
          {RecommendedData.length > 0 && (
            <>
              <Text style={styles.relatedTitle}>{t("otherRecommendedArticles")}</Text>

              <RelatedVideosCard
                data={RecommendedData}
                onArticleClick={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
              />
            </>
          )}
        </View>
      </ScrollView>
      <Modal
        visible={notificationDetailModalVisible}
        onDismiss={() => setNotificationDetailModalVisible(false)}
      >
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{selectedNotification?.title}</Text>
          <Text style={styles.modalContent}>{selectedNotification?.content}</Text>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <PDFModal
        visible={pdfModalVisible}
        onClose={handleClosePDF}
        pdfUrl={pdfUrl}
        title={pdfTitle}
      />
      {mediaPreviewVisible && (
        <MediaPreviewModal
          onClose={() => setMediaPreviewVisible(false)}
          visible={mediaPreviewVisible}
          type="image"
          uri={mediaUri}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  video: {
    width: "100%",
    height: Dimensions.get("window").height * 0.25,
  },
  scrollViewContent: { paddingBottom: 100, paddingTop: height * 0.2 },
  cardContainer: { paddingHorizontal: 16, paddingVertical: 4 },
  frameWrapper: { width: "100%" },
  frameContainer: {
    backgroundColor: "rgb(197, 197, 197)",
    borderRadius: 12,
    overflow: "hidden",
    padding: 16,
  },
  frameContent: { gap: 16 },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  description: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    lineHeight: 22,
    color: "#444",
    marginVertical: 20
  },
  postedOn: { fontSize: 12, color: "#06361f" },
  relatedTitle: {
    marginVertical: 10,
    fontSize: 18,
    fontWeight: "600",
  },
  postedOnText: {

  },
  modalBox: {
    padding: 20,
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalContent: { marginVertical: 10, textAlign: "center" },
  closeButton: {
    marginTop: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  closeText: { color: "#fff", fontWeight: "700" },
  relatedContentContainer: { paddingHorizontal: 16 },
  headerImage: {
    width: '100%',
    height: height * 0.3,
    position: 'absolute',
    top: 51,
    left: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  frameParent: {
    flexWrap: "wrap",
    alignContent: "flex-start",
    flexDirection: "row",
    alignSelf: "stretch",
    gap: 12,
    width: "100%",
    marginTop: 10
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
  acknowledgeButton: {
    marginHorizontal: 16,

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
  },
  acknowledgeButtonText:
  {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    fontWeight: '600',
  }
});



