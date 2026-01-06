import { getAllMoodTracker } from "@/src/apis/apiService";
import CustomLottie from "@/src/components/CustomLottie";
import GlobalHeader from "@/src/components/GlobalHeader";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  View
} from "react-native";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("screen");

interface MoodEntry {
  id: string;
  mood: "HAPPY" | "SAD" | "SLEEPY" | "ANGRY" | "ANXIOUS";
  feeling: string;
  reason: string;
  details: string;
  createdAt: string;
}

const getMoodEmoji = (mood: MoodEntry["mood"]) => {
  const moodImages: Record<MoodEntry["mood"], any> = {
    HAPPY: ImagesAssets.Emoji_1,
    SAD: ImagesAssets.Emoji_3,
    SLEEPY: ImagesAssets.Emoji_2,
    ANGRY: ImagesAssets.Emoji_4,
    ANXIOUS: ImagesAssets.Emoji_5,
  };
  return moodImages[mood] || ImagesAssets.Emoji_1;
};



const MoodTrackerHistory = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const { t } = useTranslation();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const renderItem = ({ item }: { item: MoodEntry }) => (
    <View style={styles.moodCard}>
      <View style={styles.header}>
        <View style={styles.left}>
          <Image
            style={styles.imageEmogiIcon}
            source={getMoodEmoji(item.mood)}
          />
          <View>
            <Text style={styles.moodTitle}>{item.mood}</Text>
            <Text style={styles.dateText}>
              {moment(item.createdAt).format("DD MMM YYYY")}
            </Text>
          </View>
        </View>
      </View>

      {item.details && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            <Text style={{ fontWeight: "bold" }}>{t('note:')}</Text>
            {item.details}
          </Text>
        </View>
      )}
    </View>
  );
  const fetchMoodHistory = useCallback(async (currentPage: number) => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const res = await getAllMoodTracker({
        page: currentPage,
        limit,
      });

      if (res?.status === 200 && res?.data) {
        const newData = res.data.moodTrackerList || [];
        setMoodData((prev) => [...prev, ...newData]);
        setHasMore(res.data.totalPages > currentPage);
      }
    } catch (error) {
      console.error("Error fetching mood history:", error);
      Toast.show({
        type: "error",
        text1: "Failed to load mood history",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  }, [hasMore, limit, loading]);

  useEffect(() => {
    fetchMoodHistory(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      fetchMoodHistory(page + 1);
    }
  }, [loading, hasMore, page, fetchMoodHistory]);

  return (
    <View style={styles.container}>
      <GlobalHeader
        title={t('moodtrackerhistory')}
      />

      <FlatList
        data={moodData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="large" color="#000" style={styles.loader} />
          ) : null
        }
        ListEmptyComponent={
          !loading && moodData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No mood entries yet</Text>
            </View>
          ) : null
        }
      />

      {/* Bottom Lottie Background */}
      <View style={styles.bottomLottieContainer}>
        <CustomLottie isBlurView={Platform.OS === 'ios' ? true : false} />
      </View>

      <Toast />
    </View>
  );
};

export default MoodTrackerHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  moodCard: {
    backgroundColor: "#ededed",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    marginHorizontal: 14,
    overflow: "hidden",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  moodTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    color: "#262626",
    fontFamily: "WhyteInktrap-Bold",
    marginLeft: 8,
  },
  dateText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#636363",
    fontFamily: "Poppins-Regular",
    marginLeft: 8,
  },
  noteContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  noteText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: "#454545",
    lineHeight: 22,
  },
  imageEmogiIcon: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  listContent: {
    paddingBottom: 100,
  },
  loader: {
    marginVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    fontWeight: "500",
  },
  bottomLottieContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.7,
    backgroundColor: "#c1c1c1",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    overflow: "hidden",
    zIndex: -1,
  },
});