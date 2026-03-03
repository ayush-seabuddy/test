import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getRecommendedContents,
  acknowledgeContent,
} from "@/src/apis/apiService";
import GlobalHeader from "@/src/components/GlobalHeader";
import MediaPreviewModal from "@/src/components/Modals/MediaPreviewModal";
import PDFModal from "@/src/components/Modals/PDFModal";
import Colors from "@/src/utils/Colors";
import HTMLView from "react-native-htmlview";
import CommonLoader from "@/src/components/CommonLoader";

import { useWindowDimensions } from "react-native";
import { ImageBackground } from "expo-image";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { t } from "i18next";
import { Modal } from "react-native-paper";

import RelatedVideosCard from "./RelatedContentCard";
import { Content } from "./type";
import { Logger } from "@/src/utils/logger";

const { height } = Dimensions.get("window");

export default function ArticleDetails({
  data: fullDetails,
}: {
  data: Content;
}) {
  const { width } = useWindowDimensions();

  const scrollViewRef = useRef<ScrollView>(null);

  const [notificationDetailModalVisible, setNotificationDetailModalVisible] =
    useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [recommendedData, setRecommendedData] = useState<Content[]>([]);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("App Guide");

  const [mediaPreviewVisible, setMediaPreviewVisible] = useState(false);
  const [mediaUri, setMediaUri] = useState("");

  const [isAcknowledged, setIsAcknowledged] = useState(
    fullDetails?.contentAcknowledge?.length > 0,
  );
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  const DESCRIPTION_LIMIT = 500;

  const isLongDescription =
    (fullDetails?.description?.length ?? 0) > DESCRIPTION_LIMIT;

  const displayedDescription = isExpanded
    ? fullDetails?.description
    : fullDetails?.description &&
        fullDetails.description.length > DESCRIPTION_LIMIT
      ? `${fullDetails.description.slice(0, DESCRIPTION_LIMIT)}...`
      : fullDetails?.description;


  useEffect(() => {
    if (!fullDetails?.id) return;

    const fetchRecommended = async () => {
      try {
        const result = await getRecommendedContents({
          contentId: fullDetails.id,
        });
        setRecommendedData(result?.data ?? []);
      } catch (error) {
        Logger.error("API Error:", {Error:String(error)});
      }
    };

    fetchRecommended();
  }, [fullDetails?.id]);

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return "";

    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor(
      (now.getTime() - commentDate.getTime()) / 1000,
    );

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;

    return commentDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleOpenPDF = (url: string, title: string) => {
    setPdfUrl(url);
    setPdfTitle(title);
    setPdfModalVisible(true);
  };

  const handleClosePDF = () => {
    setPdfModalVisible(false);
    setPdfUrl("");
    setPdfTitle("App Guide");
  };

  const showMediaPreview = (uri: string) => {
    setMediaUri(uri);
    setMediaPreviewVisible(true);
  };

  const handleContentToggle = (item: string) => {
    if (item.toLowerCase().endsWith(".pdf")) {
      handleOpenPDF(item, "Article");
    } else {
      showMediaPreview(item);
    }
  };

  const handleAcknowledge = useCallback(async () => {
    if (!fullDetails?.id) return;

    try {
      setIsAcknowledging(true);
      const payload = { contentId: fullDetails.id };
      const response = await acknowledgeContent(payload);

      if (response?.status === 200) {
        setIsAcknowledged(true);
      }
    } catch (error) {
      Logger.error("❌ Error acknowledging content:", {Error:String(error)});
    } finally {
      setIsAcknowledging(false);
    }
  }, [fullDetails?.id]);

  return (
    <View style={styles.container}>
      <GlobalHeader title={fullDetails?.contentTitle} />

      <ImageBackground
        source={{ uri: fullDetails?.thumbnail }}
        style={styles.headerImage}
        contentFit="cover"
      />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          <View style={styles.frameContainer}>
            <BlurView intensity={40} style={StyleSheet.absoluteFill} />
            <View>
              <Text style={styles.title}>{fullDetails?.contentTitle}</Text>

              <HTMLView
                value={displayedDescription}
                stylesheet={{
                  p: {
                    lineHeight: 22,
                  },
                  span: {
                    lineHeight: 22,
                  },
                  div: {
                    lineHeight: 22,
                  },
                }}
              />

              {isLongDescription && (
                <TouchableOpacity
                  onPress={() => setIsExpanded((prev) => !prev)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.readMoreText}>
                    {isExpanded ? t("readless") : t("readmore")}
                  </Text>
                </TouchableOpacity>
              )}

              <Text style={styles.postedOn}>
                {t("postedon")} {getRelativeTime(fullDetails?.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.frameContainer}>
            <Text style={styles.title}>{t("Contents")}</Text>

            <View style={styles.frameParent}>
              {fullDetails?.contentUrl?.map((item: string, index: number) => (
                <TouchableOpacity
                  key={`${item}-${index}`}
                  style={styles.pdfButton}
                  onPress={() => handleContentToggle(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.pdfButtonText}>
                    {t("clicktoview")}{" "}
                    {item.toLowerCase().endsWith(".pdf") ? "PDF" : "Image"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {!isAcknowledged && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.acknowledgeButton,
              { backgroundColor: isAcknowledging ? "#999" : "#000" },
            ]}
            disabled={isAcknowledging}
            onPress={handleAcknowledge}
          >
            {isAcknowledging ? (
              <CommonLoader color="#FFF" />
            ) : (
              <Text style={styles.acknowledgeButtonText}>
                {t("I_Acknowledge")}
              </Text>
            )}
          </TouchableOpacity>
        )}

        <View style={{ paddingHorizontal: 16 }}>
          {recommendedData.length > 0 && (
            <>
              <Text style={styles.relatedTitle}>
                {t("otherRecommendedArticles")}
              </Text>

              <RelatedVideosCard
                data={recommendedData}
                onArticleClick={() =>
                  scrollViewRef.current?.scrollTo({
                    y: 0,
                    animated: true,
                  })
                }
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
          <Text style={styles.modalContent}>
            {selectedNotification?.content}
          </Text>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.closeText}>{t("close")}</Text>
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
          visible={mediaPreviewVisible}
          onClose={() => setMediaPreviewVisible(false)}
          type="image"
          uri={mediaUri}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollViewContent: {
    paddingBottom: 100,
    paddingTop: height * 0.2,
  },

  headerImage: {
    width: "100%",
    height: height * 0.3,
    position: "absolute",
    top: 51,
    left: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },

  cardContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  frameContainer: {
    backgroundColor: "rgb(197,197,197)",
    borderRadius: 12,
    overflow: "hidden",
    padding: 16,
  },

  title: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#222",
    marginBottom: 10,
  },

  readMoreText: {
    fontSize: 13,
    marginTop: 10,
    fontFamily: "Poppins-SemiBold",
    color: Colors.darkGreen,
    textDecorationLine: "underline",
  },

  postedOn: {
    marginTop: 10,
    fontSize: 12,
    color: "#06361f",
    fontFamily: "Poppins-Regular",
  },

  relatedTitle: {
    marginVertical: 10,
    fontSize: 18,
    fontWeight: "600",
  },

  frameParent: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 10,
  },

  pdfButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#ccc",
  },

  pdfButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Poppins-SemiBold",
  },

  acknowledgeButton: {
    marginHorizontal: 16,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    marginTop: 12,
  },

  acknowledgeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    fontWeight: "600",
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
});
