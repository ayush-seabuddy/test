// import { viewContentDetails } from '@/src/apis/apiService';
// import { useLocalSearchParams } from 'expo-router';
// import { View } from 'lucide-react-native';
// import React, { useEffect } from 'react';
// import { StyleSheet } from 'react-native';

// const VideoDetail = () => {
//   const { item , id }:{item?:string,id?:string} = useLocalSearchParams();
//   const [data , setData ] = React.useState(null);
//   const getVideoDetail = async (id:string) => {
//     const response = await viewContentDetails({
//       contentId: id})
//       if(response.data){
//         setData(response.data)
//       }
//   }
 
//   useEffect(() => {
//     if(item && typeof item === "string") {
//      setData(JSON.parse(item))
//     }
    
//     // if(!item && id){
//       // getVideoDetail(id)
//     // }
//   }, [item,id])

//   if(!data) {
//     return null
//   }

//   return (
//    <View style={{}}>
   
//    </View>
//   )
// }

// export default VideoDetail


// const styles = StyleSheet.create({

// })


// app/videos/details.tsx

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
import GlobalHeader from "@/src/components/GlobalHeader";
import VideoPlayer from "@/src/components/VideoPlayer";
import Colors from "@/src/utils/Colors";
import { Video } from "expo-av";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { ActivityIndicator, Modal } from "react-native-paper";
import RelatedVideosCard from "./RelatedContentCard";
import { Content } from "./type";


// import VideoDetailsHeader from "../../component/headers/VideoDetailsHeader";
// import RelatedVideosCard from "../../component/Cards/RelatedVideosCard";
// import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
// import { apiCallWithToken, apiServerUrl } from "../../Api";

interface ContentDetails {
  id: string;
  contentTitle?: string;
  description?: string;
  contentUrl?: string[];
  createdAt?: string;
}

export default function VideosDetails({data:fullDetails}:{data:Content}) {
  const { dataItem, fromHome } = useLocalSearchParams<{
    dataItem: string;
    fromHome?: string;
  }>();

  // const [fullDetails, setFullDetails] = useState<ContentDetails | undefined>();
  console.log("fullDetails: ", fullDetails);
  const [notificationDetailModalVisible, setNotificationDetailModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [RecommendedData, setRecommendedData] = useState<any[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const videoRef = useRef<Video>(null);
  const appState = useRef(AppState.currentState);

 
  useEffect(() => {
    // DetailsData();
  }, [dataItem]);

  // ✅ Pause video when leaving or app background
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

  // ✅ Recommended Videos
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
      {/* <VideoDetailsHeader navigation={router} data={fullDetails} fromHome={fromHome} /> */}
      <GlobalHeader
        title={fullDetails?.contentTitle}
        leftIcon={<ChevronLeft />}
        onLeftPress={() => router.back()}
         />



      {/* Video Player */}
      <View style={{ flex: fullscreen ? 1 : 0 }}>
        {loading && (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{ position: "absolute", top: "40%", left: "40%", zIndex: 2 }}
          />
        )}
       <VideoPlayer uri={fullDetails?.contentUrl[0]} />
        {/* <Video
          ref={videoRef}
          source={{ uri: fullDetails?.contentUrl?.[0] || "" }}
          style={[
            styles.video,
            fullscreen && { width: "100%", height: "100%" },
          ]}
          useNativeControls
          // resizeMode="contain"
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          onError={(e) => console.log("Video Error:", e)}
          onFullscreenUpdate={(e) => {
            setFullscreen(e.fullscreenUpdate === 1);
          }}
        /> */}
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
                <Text style={styles.postedOn}>Posted on - {getRelativeTime(fullDetails?.createdAt)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Related Videos */}
        {RecommendedData.length > 0 && (
          <>
            <Text style={styles.relatedTitle}>Related Videos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.relatedContentContainer}>
              <RelatedVideosCard
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
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// --------------------------
// Styles
// --------------------------
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
    lineHeight:22,
    color: "#444",
  },
  postedOn: { fontSize: 12, color: "#06361f" },
  relatedTitle: {
    marginTop: 20,
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
  relatedContentContainer:{paddingHorizontal:16}
});



