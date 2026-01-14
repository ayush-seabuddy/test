import { getAllMoodTracker } from "@/src/apis/apiService";
import CommonLoader from "@/src/components/CommonLoader";
import EmptyComponent from "@/src/components/EmptyComponent";
import GlobalHeader from "@/src/components/GlobalHeader";
import { showToast } from "@/src/components/GlobalToast";
import { ImagesAssets } from "@/src/utils/ImageAssets";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View
} from "react-native";

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
  return moodImages[mood];
};

const MoodTrackerHistory = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const fetchMoodHistory = useCallback(
    async (currentPage: number) => {
      if (loading || !hasMore) return;

      setLoading(true);
      try {
        const res = await getAllMoodTracker({ page: currentPage, limit });

        if (res?.status === 200) {
          const newData = res.data?.moodTrackerList ?? [];
          setMoodData(prev => [...prev, ...newData]);
          setHasMore(res.data?.totalPages > currentPage);
        }
      } catch (error) {
        showToast.error(t('oops'), t('somethingwentwrong'))
      } finally {
        setLoading(false);
      }
    },
    [loading, hasMore, limit, t]
  );

  useEffect(() => {
    fetchMoodHistory(1);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMoodHistory(nextPage);
    }
  };

  const renderItem = ({ item }: { item: MoodEntry }) => (
    <View style={styles.moodCard}>
      <View style={styles.header}>
        <Image source={getMoodEmoji(item.mood)} style={styles.emoji} />
        <View>
          <Text style={styles.moodTitle}>{item.mood}</Text>
          <Text style={styles.dateText}>
            {moment(item.createdAt).format("DD MMM YYYY")}
          </Text>
        </View>
      </View>

      {item?.details?.trim() && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>
            {item.details}
          </Text>
        </View>
      )}
    </View>
  );
  return (
    <View style={styles.container}>
      <GlobalHeader title={t("moodtrackerhistory")} />

      {moodData.length === 0 && !loading ? (
        <View style={styles.centerEmptyContainer}>
          <EmptyComponent text={t("nomoodentries")} />
        </View>
      ) : (
        <FlatList
          data={moodData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          style={{ zIndex: 1 }}
          ListFooterComponent={
            loading ? (
              <View style={styles.loader}>
                <CommonLoader fullScreen />
              </View>
            ) : null
          }
        />
      )}

    </View>
  );
};

export default MoodTrackerHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  listContent: {
    paddingBottom: 20,
  },

  moodCard: {
    backgroundColor: "#ededed",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    marginHorizontal: 14,
    zIndex: 2,
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  emoji: {
    width: 48,
    height: 48,
    resizeMode: "contain",
    marginRight: 10,
  },

  moodTitle: {
    fontSize: 14,
    fontFamily:'Poppins-SemiBold',
    fontWeight: "600",
    color: "#262626",
  },

  dateText: {
    fontSize: 12,
    color: "#636363",
    marginTop: 2,
  },

  noteContainer: {
    marginTop: 10,
  },

  noteText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: "#454545",
    lineHeight: 22,
  },

  noteLabel: {
    fontWeight: "700",
  },

  loader: {
    marginTop: "80%",
  },
});
