import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl, checkConnected } from "../Api";
import Colors from "../colors/Colors";
import SimpleToast from "react-native-simple-toast";
import { downloadAnnouncementImages } from "../CommonApi";
import WeeklyMeetingCard from "../component/Cards/WeeklyMeetingCard";
import HomeHangoutCardPost from "../component/HomeHangoutCardPost";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import NetInfo from "@react-native-community/netinfo";

const { width, height } = Dimensions.get("screen");

const getTheme = (colorScheme) => ({
  background: "#FFFFFF",
  textTertiary: colorScheme === "dark" ? "#9CA3AF" : "#6B7280",
});

const HomeHangout = React.memo(({ singlePostData }) => {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const [isNetConnected, setIsNetConnected] = useState(true)

  const [handOut, setHandOut] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [isHeaderReady, setIsHeaderReady] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const flatListRef = useRef(null);
  const ITEMS_PER_PAGE = 10;
  const HEADER_HEIGHT = 177;

  const getItemLayout = useCallback(
    (data, index) => ({
      length: 520,
      offset: HEADER_HEIGHT + 520 * index,
      index,
    }),
    []
  );

  // ✅ Fetch posts from API
  const getDataFromApi = useCallback(
    async (pageNumber, append = false) => {
      try {
        const authToken = await AsyncStorage.getItem("authToken");
        if (!authToken) throw new Error("No auth token found");

        setLoading(true);
        const queryParams = new URLSearchParams({ page: pageNumber, limit: ITEMS_PER_PAGE }).toString();
        const isConnected = await checkConnected();

        if (!isConnected) {
          // ✅ Offline case
          // setIsEmpty(true);
          // setHandOut([]);
          // setDisplayedPosts([]);
          // setHasMore(false);
          SimpleToast.show("No internet connection.");
          // return;
        }

        // ✅ Connected case — API call
        const response = await apiCallWithToken(
          `${apiServerUrl}/user/getAllHangoutPost?${queryParams}`,
          "GET",
          null,
          authToken
        );

        if (response.responseCode === 200) {
          let newData = response?.result?.hangoutsList || [];
          if (singlePostData) {
            newData = newData.filter((item) => item.id !== singlePostData.id);
            newData = [singlePostData, ...newData];
          }

          setHandOut(pageNumber === 1 ? newData : [...handOut, ...newData]);
          setIsEmpty(newData.length === 0);

          if (pageNumber === 1) {
            setDisplayedPosts(newData.slice(0, ITEMS_PER_PAGE));
            if (isHeaderReady) {
              setTimeout(() => {
                flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
              }, 100);
            }
          } else if (append) {
            setDisplayedPosts([...displayedPosts, ...newData.slice(0, ITEMS_PER_PAGE)]);
          }

          setHasMore(response.result.totalPages > pageNumber);
          setPage(pageNumber + 1);
        } else {
          // ✅ API failed but connected
          SimpleToast.show("Something went wrong, please try again");
        }
      } catch (error) {
        console.error("Error fetching data: 2", error);
        setHasMore(false)
        const isConnected = await checkConnected();
        if (isConnected) {
          // API failed
          SimpleToast.show("Something went wrong, please try again");
        } else {
          // No internet
          SimpleToast.show("No internet connection.");
        }
        setIsEmpty(displayedPosts.length === 0);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [handOut, displayedPosts, singlePostData, isHeaderReady]
  );

  // ✅ Fetch Announcements
  const getAnnouncement = useCallback(async () => {
    try {
      const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
      const isConnected = await checkConnected();

      if (!isNetConnected) {
        // Offline
        // setAnnouncement([]);
        // setIsEmpty(true);
        // setHandOut([]);
        // setDisplayedPosts([]);
        // setHasMore(false);
        SimpleToast.show("No internet connection.");
        // return;
      }

      // Connected
      const result = await apiCallWithToken(
        `${apiServerUrl}/content/getAllContents?limit=10&onlyAnnouncement=true`,
        "GET",
        null,
        userDetails.authToken
      );

      if (result.responseCode === 200) {
        setAnnouncement(result.result.allContents);
        await downloadAnnouncementImages(result.result.allContents);
        setIsHeaderReady(true);
      } else {
        SimpleToast.show("Something went wrong, please try again");
      }
    } catch (error) {
      console.error("API Error for announcements", error.response?.data || error.message);
      const isConnected = await checkConnected();
      if (isConnected) {
        SimpleToast.show("Something went wrong, please try again");
      } else {
        SimpleToast.show("No internet connection.");
      }
      setIsEmpty(displayedPosts.length === 0);
    } finally {
      setIsHeaderReady(true)
      setRefreshing(false);
    }
  }, [displayedPosts]);

  // ✅ Fetch profile details
  const ViewProfiledetails = useCallback(async () => {
    try {
      const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
      const response = await axios.get(`${apiServerUrl}/user/viewUserProfile`, {
        headers: { authToken: userDetails.authToken },
        params: { userId: userDetails.id },
      });
      if (response.data.responseCode === 200) {
        userDetails.companyLogo = response.data.result?.companyLogo || userDetails.companyLogo;
        userDetails.companyName = response.data.result?.companyName || userDetails.companyName;
        userDetails.companyDescription =
          response.data.result?.companyDescription || userDetails.companyDescription;
        await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
      }
    } catch (error) {
      console.error("Error fetching profile details:", error);
      const isConnected = await checkConnected();
      if (isConnected) {
        SimpleToast.show("Something went wrong, please try again");
      } else {
        SimpleToast.show("No internet connection.");
      }
    }
  }, []);

  // ✅ Refresh posts
  const refreshPost = useCallback(async () => {
    try {
      await getDataFromApi(1);
    } catch (error) {
      console.error("Error refreshing posts:", error);
    }
  }, [getDataFromApi]);

  // ✅ Pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setIsHeaderReady(false);
    setIsEmpty(false);
    getDataFromApi(1);
    getAnnouncement();
  }, [getDataFromApi, singlePostData]);


  // ✅ Infinite scroll
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      getDataFromApi(page, true);
    }
  }, [loading, hasMore, page, getDataFromApi]);

  // ✅ Update post
  const updatePost = useCallback((postId, updates) => {
    setDisplayedPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, ...updates } : post)));
    setHandOut((prev) => prev.map((post) => (post.id === postId ? { ...post, ...updates } : post)));
  }, []);

  // ✅ Render post
  const renderPostItem = useCallback(
    ({ item, index }) => (
      <HomeHangoutCardPost
        index={index}
        item={item}
        setHandOut={setHandOut}
        refreshPost={refreshPost}
        updatePost={updatePost}
        setDisplayedPosts={setDisplayedPosts}
      />
    ),
    [refreshPost, updatePost]
  );

  const keyExtractor = useCallback((item, index) => item?.id?.toString() + index, []);

  // ✅ Empty View
  const EmptyComponent = useMemo(() => {
    if (loading || !isEmpty) return null;

    return (
      <View
        style={{
          flex: 1,
          width,
          height: height * 0.4,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          style={{ height: 150, width: 150 }}
          source={require("../assets/images/AnotherImage/no-content.png")}
        />
        <Text
          style={{
            fontSize: 20,
            color: theme.textTertiary,
            fontFamily: "Poppins-Regular",
            marginTop: 20,
          }}
        >
          No Post Found
        </Text>
        <TouchableOpacity
          onPress={() => {
            getDataFromApi(1);
            getAnnouncement();
          }}
        >
          <Text
            style={{
              color: "black",
              fontFamily: "Poppins-Regular",
              fontSize: 14,
              textDecorationLine: "underline",
            }}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [loading, isEmpty, theme, handleRefresh]);

  // ✅ Footer Loader
  const FooterComponent = useMemo(() => {
    if (!hasMore || !loading || setHandOut.length === 0) return null;
    return (
      <View style={{ paddingVertical: 20, alignItems: "center" }}>
        <ActivityIndicator size="small" color={'#06361f'} />
      </View>
    );
  }, [hasMore, loading]);

  // ✅ Header
  const HeaderComponent = useMemo(() => {
    return <WeeklyMeetingCard announcement={announcement} showSurvey={true} />;
  }, [announcement]);

  // ✅ Scroll to top
  useEffect(() => {
    if (isHeaderReady && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [isHeaderReady]);

  // ✅ Offline detection on app start

  
  // useEffect(() => {
  //   (async () => {
  //     const isConnected = await checkConnected();
  //     if (!isConnected) {
  //       setIsEmpty(true);
  //       setHandOut([]);
  //       setDisplayedPosts([]);
  //       setAnnouncement([]);
  //       setHasMore(false);
  //     }
  //   })();
  // }, []);

  // ✅ Live offline listener
  
  // useEffect(() => {
  //   const unsubscribe = NetInfo.addEventListener((state) => {
  //     console.log("state.isConnected: ", state.isConnected);
  //       setIsNetConnected(state.isConnected)

  //     if (!state.isConnected) {
  //       // setIsEmpty(true);
  //       // setHandOut([]);
  //       // setDisplayedPosts([]);
  //       // setAnnouncement([]);
  //       // setHasMore(false);
  //     }
  //   });
  //   return () => unsubscribe();
  // }, []);
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = NetInfo.addEventListener((state) => {
        console.log("state.isConnected: ", state.isConnected);
        setIsNetConnected(state.isConnected)

        if (!state.isConnected) {
          // setIsEmpty(true);
          // setHandOut([]);
          // setDisplayedPosts([]);
          // setAnnouncement([]);
          // setHasMore(false);
        }
      });
      return () => unsubscribe();
    }, [])
  );


  // ✅ Load data on focus
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const isConnected = await checkConnected();
        if (!isNetConnected) {
          // setIsEmpty(true);
          // setHandOut([]);
          // setDisplayedPosts([]);
          // setAnnouncement([]);
          // setHasMore(false);
          // SimpleToast.show("No internet connection 2");
          // return;
        }else{
          console.log("sflkjsdflksdjflkjsdfk");
          
            await getAnnouncement();
          await getDataFromApi(1);
        }
      };
      loadData();
    }, [singlePostData, isNetConnected])
  );

  useEffect(() => {
    ViewProfiledetails();
  }, [ViewProfiledetails]);

  const mainStyles = StyleSheet.create({
    container: { flex: 1, marginTop: 2 },
    contentContainer: { paddingTop: 45, paddingBottom: 80 },
    emptyList: { flexGrow: 1, justifyContent: "center" },
  });

  // if (!isHeaderReady && !loading) {
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         justifyContent: "center",
  //         alignItems: "center",
  //         backgroundColor: "#FFFFFF",
  //       }}
  //     >
  //       <ActivityIndicator size="large" color={'#06361f'} />
  //     </View>
  //   );
  // }

  return (
    <View style={mainStyles.container}>
      <FlatList
        ref={flatListRef}
        data={displayedPosts}
        keyExtractor={keyExtractor}
        renderItem={renderPostItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#8DAF02"
          />
        }
        ListHeaderComponent={HeaderComponent}
        ListEmptyComponent={EmptyComponent}
        ListFooterComponent={FooterComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          mainStyles.contentContainer,
          displayedPosts.length === 0 && !loading && mainStyles.emptyList,
        ]}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        nestedScrollEnabled={true}
      />
    </View>
  );

});

export default HomeHangout;
