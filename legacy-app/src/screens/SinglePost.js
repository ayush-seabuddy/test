import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Text,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import SimpleToast from "react-native-simple-toast";

import HomeHangoutCardPost from "../component/HomeHangoutCardPost";
import { apiCallWithToken, apiServerUrl } from "../Api";
import ProfleSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";

const { width, height } = Dimensions.get("screen");
const ITEMS_PER_PAGE = 1;

const HomeHangout = ({ route }) => {
  const navigation = useNavigation();
  const [HandOut, setHandOut] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFirstLoadComplete, setIsFirstLoadComplete] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const updatePost = useCallback((postId, updates) => {
    setHandOut((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, ...updates } : post))
    );
  }, []);

  const fetchPostData = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setIsFirstLoadComplete(false);

    try {
      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) {
        SimpleToast.show("Please log in to continue", SimpleToast.LONG);
        navigation.navigate("Login");
        return;
      }

      if (!isOnline) {
        SimpleToast.show("No internet connection", SimpleToast.LONG);
        setHandOut([]);
        return;
      }

      let postData = null;

      // 1. From navigation params (postData object)
      if (route.params?.params?.postData) {
        postData = route.params.params.postData;
      }
      // 2. From postId (deep link / notification)
      else if (route.params?.postId || route.params?.params?.postId) {
        const postId = route.params.postId || route.params.params.postId;
        const response = await apiCallWithToken(
          `${apiServerUrl}/user/getAllHangoutPost?page=1&limit=${ITEMS_PER_PAGE}&postId=${postId}`,
          "GET",
          null,
          authToken
        );

        if (response?.responseCode === 200) {
          const hangouts = response?.result?.hangoutsList || [];
          postData = hangouts.find((p) => p.id === postId);
        }
      }

      if (postData) {
        setHandOut([postData]);
      } else {
        SimpleToast.show("Post not found", SimpleToast.LONG);
        setHandOut([]);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      SimpleToast.show("Failed to load post", SimpleToast.LONG);
      setHandOut([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsFirstLoadComplete(true);
    }
  }, [route.params, navigation, isOnline, loading]);

  useFocusEffect(
    useCallback(() => {
      fetchPostData();
    }, [fetchPostData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPostData();
  }, [fetchPostData]);

  const renderItem = useCallback(
    ({ item, index }) => (
      <HomeHangoutCardPost
        item={item}
        index={index}
        setHandOut={setHandOut}
        updatePost={updatePost}
        locale="en"
      />
    ),
    [updatePost]
  );

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const ListEmpty = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Image
          source={require("../assets/images/AnotherImage/no-content.png")}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <Text style={styles.emptyText}>
          {isOnline ? "No post found" : "No internet connection"}
        </Text>
      </View>
    ),
    [isOnline]
  );

  const ListFooter = useMemo(
    () =>
      loading && !refreshing && !isFirstLoadComplete ? (
        <View style={styles.fullScreenLoader}>
          <ActivityIndicator size="large" color="#8DAF02" />
        </View>
      ) : null,
    [loading, refreshing, isFirstLoadComplete]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <ProfleSettingHeader navigation={navigation} title="Post" />

          <FlatList
            data={HandOut}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#8DAF02"
              />
            }
            ListEmptyComponent={
              isFirstLoadComplete && HandOut.length === 0 ? ListEmpty : null
            }
            ListFooterComponent={ListFooter}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              HandOut.length === 0 && isFirstLoadComplete
                ? styles.flatListEmpty
                : styles.contentContainer
            }
            removeClippedSubviews
            initialNumToRender={1}
            maxToRenderPerBatch={3}
            windowSize={5}
            nestedScrollEnabled
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default HomeHangout;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: { flex: 1 },
  contentContainer: { paddingTop: 10, paddingBottom: 80 },
  flatListEmpty: { flexGrow: 1, justifyContent: "center" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyImage: { width: 150, height: 150, marginBottom: 20 },
  emptyText: {
    fontSize: 20,
    color: "#666",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: height * 0.6,
  },
});