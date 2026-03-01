import { getallposts } from "@/src/apis/apiService";
import PostScreen from "@/src/components/PostScreen";
import { RootState } from "@/src/redux/store";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { PostInterface } from "../ContentDetails/type";
import EmptyComponent from "@/src/components/EmptyComponent";
import { useTranslation } from "react-i18next";
import CommonLoader from "@/src/components/CommonLoader";
import { Logger } from "@/src/utils/logger";

const ITEMS_PER_PAGE = 10;

const UserPost = () => {
  const userDetails = useSelector((state: RootState) => state.userDetails);
  const { t } = useTranslation();

  const [posts, setPosts] = useState<PostInterface[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchPosts = useCallback(
    async (pageToFetch: number, isLoadMore: boolean = false) => {
      if (!userDetails?.id) {
        Logger.info("⚠️ No userId found. Skipping fetch.");
        setLoading(false);
        return;
      }

      // Prevent duplicate calls
      if (isLoadMore && loadingMore) return;
      if (!isLoadMore && loading) return;

      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        Logger.info(
          `Fetching posts - Page: ${pageToFetch}, userId: ${userDetails.id}`,
        );

        const response = await getallposts({
          userId: userDetails.id,
          page: pageToFetch,
          limit: ITEMS_PER_PAGE,
        });

        Logger.info("API Response:", { Data: String(response) });

        if (response?.data) {
          const newPosts: PostInterface[] = response.data.hangoutsList || [];
          const totalPages = response.data.totalPages || 0;

          if (isLoadMore) {
            setPosts((prev) => [...prev, ...newPosts]);
          } else {
            setPosts(newPosts);
          }

          setCurrentPage(pageToFetch + 1);
          setHasMore(totalPages > pageToFetch);
        } else {
          Logger.info("No data in response");
          if (!isLoadMore) setPosts([]);
        }
      } catch (error) {
        Logger.error("Error fetching posts:", { Error: String(error) });
        if (!isLoadMore) setPosts([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [userDetails?.id],
  );

  // Trigger fetch when userId becomes available
  useEffect(() => {
    if (userDetails?.id) {
      // Reset state on new user
      setPosts([]);
      setCurrentPage(1);
      setHasMore(true);
      setLoading(false);

      fetchPosts(1, false);
    } else {
      setPosts([]);
      setLoading(false);
    }
  }, [userDetails?.id, fetchPosts]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      fetchPosts(currentPage, true);
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <CommonLoader />
      </View>
    );
  };

  // Show loader only during initial fetch
  if (loading && posts.length === 0) {
    return (
      <View style={styles.center}>
        <CommonLoader fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <PostScreen
            post={item}
            key={item.id}
            onPostDeleted={() => {
              setPosts((prev) => prev.filter((p) => p.id !== item.id));
            }}
            onPostReported={() => {
              setPosts((prev) => prev.filter((p) => p.id !== item.id));
            }}
            i18nIsDynamicList={false}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.8}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.center}>
            <EmptyComponent text={t("youarenotpostedanything")} />
          </View>
        }
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={11}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  footerLoader: { paddingVertical: 20, paddingBottom: 140 },
});

export default UserPost;
