import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Text,
  Dimensions,
  Image,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeHangoutCardPost from "../HomeHangoutCardPost";
import { apiCallWithToken, apiServerUrl, checkConnected } from "../../Api";
import Colors from "../../colors/Colors";

const { height } = Dimensions.get("screen");
const ITEMS_PER_PAGE = 15;

const Post = () => {
  const [handOut, setHandOut] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isFirstLoadComplete, setIsFirstLoadComplete] = useState(false);
  const pageRef = useRef(1);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const getDataFromApi = useCallback(
    async (page = 1, isRefresh = false) => {
      if (loading) return;
      setLoading(true);
      if (isRefresh) setRefreshing(true);

      try {
        const dbResult = await AsyncStorage.getItem("userDetails");
        const userDetails = JSON.parse(dbResult);
        const authToken = await AsyncStorage.getItem("authToken");
        if (!authToken) throw new Error("No auth token");

        const queryParams = new URLSearchParams({
          userId: userDetails?.id,
          page,
          limit: ITEMS_PER_PAGE,
        }).toString();

        if (await checkConnected()) {
          const response = await apiCallWithToken(
            `${apiServerUrl}/user/getAllHangoutPost?${queryParams}`,
            "GET",
            null,
            authToken
          );

          if (response?.responseCode === 200) {
            const newData = response?.result?.hangoutsList || [];

            setHandOut((prev) =>
              page === 1 ? newData : [...prev, ...newData]
            );
            setHasMore(newData.length === ITEMS_PER_PAGE);
          } else {
            throw new Error(response?.message || "Bad response");
          }
        } else {
          setHandOut([]);
          setHasMore(false);
        }
      } catch (err) {
        console.error("getDataFromApi →", err);
        setHasMore(false);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setIsFirstLoadComplete(true);
      }
    },
    [loading]
  );

  useEffect(() => {
    pageRef.current = 1;
    getDataFromApi(1);
  }, [isOnline, getDataFromApi]);

  const onRefresh = useCallback(() => {
    pageRef.current = 1;
    getDataFromApi(1, true);
  }, [getDataFromApi]);

  const onEndReached = useCallback(() => {
    if (!loading && hasMore) {
      pageRef.current += 1;
      getDataFromApi(pageRef.current);
    }
  }, [loading, hasMore, getDataFromApi]);

  const updatePost = useCallback((postId, patch) => {
    setHandOut((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...patch } : p))
    );
  }, []);

  const renderItem = useCallback(
    ({ item, index }) => (
      <HomeHangoutCardPost
        item={item}
        index={index}
        setHandOut={setHandOut}
        refreshPost={onRefresh}
        updatePost={updatePost}
        locale="en"
      />
    ),
    [updatePost, onRefresh]
  );

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const ListEmpty = useMemo(
    () => (
      <View style={styles.empty}>
        <Image
          style={{ height: 150, width: 150 }}
          source={require("../../assets/images/AnotherImage/no-content.png")}
        />
        <Text style={styles.emptyText}>
          {isOnline ? "No Post Found" : "No internet connection."}
        </Text>
      </View>
    ),
    [isOnline]
  );

  const ListFooter = useMemo(
    () =>
      loading && !refreshing && hasMore ? (
        <View style={styles.footer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : null,
    [loading, refreshing, hasMore]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={handOut}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          isFirstLoadComplete && handOut.length === 0 ? ListEmpty : null
        }
        ListFooterComponent={
          loading && !refreshing && !isFirstLoadComplete ? (
            <View style={styles.fullScreenLoader}>
              <ActivityIndicator size="large" color={Colors.secondary} />
            </View>
          ) : ListFooter
        }
        removeClippedSubviews
        maxToRenderPerBatch={6}
        windowSize={10}
        initialNumToRender={5}
        contentContainerStyle={
          handOut.length === 0 && isFirstLoadComplete
            ? styles.flatListEmpty
            : { paddingBottom: 100 }
        }
      />
    </View>
  );
};

export default Post;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flatListEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 100
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginTop: 20,
    color: "#666",
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: height * 0.6,
  },
});