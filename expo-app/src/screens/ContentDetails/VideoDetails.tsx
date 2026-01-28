
import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { getRecommendedContents } from "@/src/apis/apiService";
import CommonLoader from "@/src/components/CommonLoader";
import GlobalHeader from "@/src/components/GlobalHeader";
import VideoPlayer from "@/src/components/VideoPlayer";
import Colors from "@/src/utils/Colors";
import { Video } from "expo-av";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Modal } from "react-native-paper";
import RelatedContentCard from "./RelatedContentCard";
import { Content } from "./type";

export default function VideosDetails({ data: fullDetails }: { data: Content }) {
  const [notificationDetailModalVisible, setNotificationDetailModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [RecommendedData, setRecommendedData] = useState<any[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);
  const videoRef = useRef<Video>(null);
  const appState = useRef(AppState.currentState);


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

  return (
    <View style={styles.container}>
      <GlobalHeader
        title={fullDetails?.contentTitle}
      />



      {/* Video Player */}
      <View style={{ flex: fullscreen ? 1 : 0 }}>
        {loading && (
          <CommonLoader fullScreen containerStyle={{ position: "absolute", top: "40%", left: "40%", zIndex: 2 }} />
        )}
        <VideoPlayer uri={fullDetails?.contentUrl?.[0]} />
      </View>

      {/* Content Scroll */}
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
                <Text style={styles.postedOn}>{t('postedon')} {getRelativeTime(fullDetails?.createdAt)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Related Videos */}
        {RecommendedData.length > 0 && (
          <>
            <Text style={styles.relatedTitle}>{t('relatedVideos')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedContentContainer}>
              <RelatedContentCard
                data={RecommendedData}
                onArticleClick={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
              />
            </ScrollView>
          </>
        )}
      </ScrollView>

      {/* Fallback Modal */}
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
            <Text style={styles.closeText}>{t('close')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  video: {
    width: "100%",
    height: Dimensions.get("window").height * 0.25,
  },
  scrollViewContent: { paddingBottom: 100 },
  cardContainer: { padding: 16 },
  frameWrapper: { width: "100%" },
  frameContainer: {
    backgroundColor: "rgba(197, 197, 197, 0.6)",
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
  },
  postedOn: { fontSize: 12, color: "#06361f" },
  relatedTitle: {
    marginVertical: 10,
    marginLeft: 16,
    fontSize: 18,
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
  relatedContentContainer: { paddingHorizontal: 16 }
});



