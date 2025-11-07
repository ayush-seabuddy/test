import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
  ImageBackground,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useSelector } from "react-redux";
import SearchComponent from "../component/headers/SearchComponent";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import HomeHangoutCardPost from "../component/HomeHangoutCardPost"; // Import reusable post card
import { ImagesAssets } from "../assets/ImagesAssets";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const sections = [
  { id: "users", title: "Users", dataKey: "users.usersList" },
  { id: "posts", title: "Posts", dataKey: "posts.hangoutsList" },
  { id: "bulletin", title: "Bulletin", dataKey: "announcements.allAnnouncements" },
  { id: "read", title: "Read", dataKey: "articles.allContents" },
  { id: "buddyup", title: "BuddyUp Events", dataKey: "groupActivities.groupActivityList" },
  { id: "listen", title: "Listen", dataKey: "musics.allContents" },
  { id: "watch", title: "Watch", dataKey: "videos.allContents" },
];

const Search = ({ navigation }) => {
  const searchData = useSelector((state) => state.search.searchData);
  const [activeSection, setActiveSection] = useState("users");
  const [postsData, setPostsData] = useState([]);
  const { t } = useTranslation();
  // Sync postsData when "Posts" tab is selected
  useEffect(() => {
    if (activeSection === "posts") {
      setPostsData(currentData);
    }
  }, [activeSection, currentData]);

  // Update a single post (used by HomeHangoutCardPost for likes, comments, etc.)
  const updatePost = useCallback((postId, updates) => {
    setPostsData((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, ...updates } : post))
    );
  }, []);

  // Render other sections
  const RenderAnnouncement = ({ item }) => (
    <View style={styles.scrollView}>
      <TouchableOpacity style={[styles.frameParent, styles.parentFlexBox]}>
        <LinearGradient
          style={styles.wrapperLayout}
          locations={[0, 1]}
          colors={["rgba(0, 0, 0, 0)", "#000"]}
          useAngle
          angle={140.38}
        >
          <ImageBackground
            style={[styles.icon, styles.iconLayout]}
            resizeMode="cover"
            source={{ uri: item.thumbnail }}
          >
            <Text style={[styles.weeklyMeetingDeckContainer, styles.pointForCompletingTypo]}>
              <Text style={styles.deck}>
                {item?.title?.length > 25 ? `${item.title.slice(0, 25)}...` : item.title || ""}
              </Text>
            </Text>
            <Image
              style={styles.layer1Icon}
              resizeMode="cover"
              source={ImagesAssets.Layer_2}
            />
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={[styles.weeklyMeeting, styles.pointForCompletingTypo]}
            >
              {item?.description || ""}
            </Text>
          </ImageBackground>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const RenderArticle = ({ item }) => (
    <Pressable
      style={[styles.cardContainer, { width: (width - 45) / 2 }]}
      onPress={() => navigation.replace("ArticlesDetails", { dataItem: item })}
    >
      <View style={styles.cardContent}>
        <ImageBackground
          style={styles.imageBackground}
          resizeMode="cover"
          source={{
            uri: item?.thumbnail || ImagesAssets.health_card_image,
          }}
        />
        <View style={styles.textContainer}>
          <Text
            style={[styles.titleText, styles.textColor]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item?.contentTitle?.length > 22
              ? `${item.contentTitle.slice(0, 22)}...`
              : item.contentTitle || ""}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const RenderGroupActivities = ({ item }) => (
    <Pressable
      style={[styles.cardContainer, { width: (width - 45) / 2 }]}
      onPress={() => navigation.navigate("WorkoutBuddies", { activity: { id: item.id } })}
    >
      <View style={styles.cardContent}>
        <ImageBackground
          style={[styles.imageBackground]}
          resizeMode="cover"
          source={
            item.imageUrls?.length > 0
              ? { uri: item.imageUrls[0] }
              : ImagesAssets.health_card_image
          }
        />
        <View style={styles.textContainer}>
          <Text style={[styles.titleText, styles.textColor]}>
            {item?.eventName?.length > 22
              ? `${item.eventName.slice(0, 22)}...`
              : item.eventName || ""}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const RenderMusics = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainerMusic}
      onPress={() => navigation.navigate("MusicPlayer", { dataItem: item })}
    >
      <View style={styles.cardContentMusic}>
        <Image
          style={styles.imageBackgroundMusic}
          resizeMode="cover"
          source={{ uri: item.thumbnail }}
        />
        <View style={styles.textContainerMusic}>
          <Text
            style={[styles.titleTextMusic, styles.textColor]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.contentTitle?.length > 42
              ? `${item.contentTitle.slice(0, 42)}...`
              : item.contentTitle || ""}
          </Text>
          <View style={styles.playButton}>
            <Image
              style={styles.frameItemMusic}
              resizeMode="cover"
              source={ImagesAssets.baseicon2}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const RenderUsers = ({ item }) => (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.replace("CrewProfile", { item })}
    >
      <Image
        source={{
          uri:
            item.profileUrl ||
            "https://as1.ftcdn.net/v2/jpg/03/46/83/96/1000_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg",
        }}
        style={styles.image}
      />
      <View>
        <Text style={styles.name}>
          {item.fullName?.length > 22
            ? `${item.fullName.slice(0, 22)}...`
            : item.fullName || ""}
        </Text>
        <Text style={styles.designation}>{item.designation}</Text>
      </View>
    </TouchableOpacity>
  );

  const RenderVideos = ({ item }) => (
    <Pressable
      style={[styles.cardContainer, { width: (width - 45) / 2 }]}
      onPress={() => navigation.replace("VideosDetails", { dataItem: item })}
    >
      <View style={styles.cardContent}>
        <ImageBackground
          style={styles.imageBackground}
          resizeMode="cover"
          source={{ uri: item.thumbnail }}
        />
        <View style={styles.textContainer}>
          <Text
            style={[styles.titleText, styles.textColor]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.contentTitle?.length > 22
              ? `${item.contentTitle.slice(0, 22)}...`
              : item.contentTitle || ""}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  // Use HomeHangoutCardPost directly
  const RenderPostItem = ({ item, index }) => (
    <HomeHangoutCardPost
      item={item}
      index={index}
      setHandOut={setPostsData}
      updatePost={updatePost}
    />
  );

  const renderItemComponents = {
    bulletin: RenderAnnouncement,
    read: RenderArticle,
    buddyup: RenderGroupActivities,
    listen: RenderMusics,
    users: RenderUsers,
    watch: RenderVideos,
    posts: RenderPostItem, // Replaced inline RenderPosts
  };

  // Check if section has data
  const hasData = (key) => {
    try {
      const keys = key.split(".");
      let data = searchData;
      for (const k of keys) {
        data = data?.[k];
        if (!data) return false;
      }
      return Array.isArray(data) ? data.length > 0 : !!data;
    } catch {
      return false;
    }
  };

  const visibleSections = useMemo(
    () => sections.filter((section) => hasData(section.dataKey)),
    [searchData]
  );

  useEffect(() => {
    if (visibleSections.length > 0) {
      const usersSection = visibleSections.find((s) => s.id === "users");
      setActiveSection(usersSection ? "users" : visibleSections[0].id);
    }
  }, [visibleSections]);

  const activeIndex = visibleSections.findIndex((s) => s.id === activeSection);
  const currentSection = activeIndex !== -1 ? visibleSections[activeIndex] : visibleSections[0];

  const currentData = useMemo(() => {
    if (!currentSection) return [];
    try {
      const keys = currentSection.dataKey.split(".");
      let data = searchData;
      for (const k of keys) data = data?.[k];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }, [searchData, currentSection]);

  const ListEmptyComponent = ({ message }) => (
    <View style={[styles.emptyContainer, { width }]}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  const RenderCurrentContent = useMemo(() => {
    if (!currentSection) return null;
    const Comp = renderItemComponents[currentSection.id];
    return Comp ? ({ item, index }) => <Comp item={item} index={index} /> : null;
  }, [currentSection]);

  if (!searchData) {
    return (
      <KeyboardAvoidingView
        style={styles.rootContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
      >
        <SearchComponent navigation={navigation} />
        <View style={[styles.emptyContainer, { flex: 1, justifyContent: "center" }]}>
          <Text style={styles.emptyText}>
            {t('globalsearchheading')}
          </Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (visibleSections.length === 0) {
    return (
      <KeyboardAvoidingView
        style={styles.rootContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
      >
        <SearchComponent navigation={navigation} />
        <View style={[styles.emptyContainer, { flex: 1, justifyContent: "center" }]}>
          <Text style={styles.emptyText}>
            {t('norecordsfound')}
          </Text>
        </View>
      </KeyboardAvoidingView>
    );
  }

  const isGrid = ["read", "buddyup", "watch"].includes(currentSection.id);
  const isHorizontal = currentSection.id === "bulletin";
  const flatListData = activeSection === "posts" ? postsData : currentData;

  return (
    <KeyboardAvoidingView
      style={styles.rootContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
    >
      <SearchComponent navigation={navigation} />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollViewContent}>
        <View style={[
          styles.contentContainer,
          activeSection === "posts" && styles.contentContainerNoPadding,
        ]}>
          <FocusAwareStatusBar
            barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
            backgroundColor={Colors.white}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContentContainer}
          >
            {visibleSections.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={[styles.tab, activeSection === section.id && styles.activeTab]}
                onPress={() => setActiveSection(section.id)}
              >
                <Text
                  style={[styles.tabText, activeSection === section.id && styles.activeTabText]}
                >
                  {section.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.HeaderTitle, activeSection === "posts" && { paddingHorizontal: 16 }]}>{currentSection.title}</Text>

          <FlatList
            horizontal={isHorizontal}
            numColumns={isGrid ? 2 : 1}
            showsHorizontalScrollIndicator={false}
            data={flatListData}
            renderItem={RenderCurrentContent}
            ListEmptyComponent={<ListEmptyComponent message={`No ${currentSection.title}`} />}
            keyExtractor={(item, index) => `${currentSection.id}-${item.id || index}`}
            columnWrapperStyle={isGrid ? styles.columnWrapper : null}
            key={`${currentSection.id}-${isGrid ? "grid" : "list"}`}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Search;

// Styles (unchanged)
const styles = StyleSheet.create({
  rootContainer: { backgroundColor: "white", flex: 1 },
  scrollViewContent: { paddingBottom: 100 },
  contentContainer: { paddingHorizontal: 16, paddingTop: 8 },
  contentContainerNoPadding: { paddingHorizontal: 0 },
  tabsContainer: { marginVertical: 10 },
  tabsContentContainer: { flexDirection: "row" },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  activeTab: { backgroundColor: Colors.secondary },
  tabText: { fontSize: 14, fontFamily: "Poppins-Regular", color: "#666" },
  activeTabText: { color: "white", fontFamily: "Poppins-Medium" },
  emptyContainer: { justifyContent: "center", alignItems: "center", paddingVertical: 10 },
  emptyText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  HeaderTitle: { fontSize: 16, fontFamily: "Poppins-Medium", color: "#06361F" },
  columnWrapper: { flexDirection: "row", justifyContent: "space-between" },

  // Announcement
  scrollView: { marginTop: 15, marginHorizontal: 4, marginBottom: 5 },
  frameParent: { flex: 1 },
  parentFlexBox: { alignItems: "center", flexDirection: "row", borderRadius: 16 },
  wrapperLayout: { height: 144, width: 355, borderRadius: 16, overflow: "hidden" },
  icon: { justifyContent: "space-between", padding: 16, height: "100%", width: "100%" },
  iconLayout: { height: 144, width: 355, borderRadius: 16, overflow: "hidden" },
  pointForCompletingTypo: { textAlign: "left", color: "#fff", lineHeight: 17, fontSize: 14 },
  layer1Icon: { width: 38, height: 38, position: "absolute", right: 20, top: 10 },
  weeklyMeeting: { fontFamily: "Poppins-Regular", color: "#fff" },
  deck: { fontFamily: "Poppins-SemiBold", fontWeight: "600" },
  weeklyMeetingDeckContainer: { alignSelf: "stretch" },

  // Cards
  cardContainer: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    borderRadius: 10,
    padding: 8,
    marginVertical: 6,
    marginRight: 4,
    marginLeft: 4,
  },
  cardContent: { overflow: "hidden", borderRadius: 10 },
  imageBackground: { height: 80, borderRadius: 10, justifyContent: "flex-end", padding: 8 },
  textContainer: { paddingVertical: 5 },
  titleText: { fontSize: 12, fontFamily: "Poppins-SemiBold", color: "#161616" },
  textColor: { color: "#161616" },

  // Music
  cardContainerMusic: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  cardContentMusic: { flexDirection: "row" },
  imageBackgroundMusic: { borderRadius: 10, width: 65 },
  textContainerMusic: { flexDirection: "row", padding: 12, justifyContent: "space-between", flex: 1 },
  titleTextMusic: { marginTop: 4, width: "70%", fontSize: 12, fontFamily: "Poppins-SemiBold", color: "#161616" },
  playButton: { justifyContent: "center", alignItems: "center", backgroundColor: "white", borderRadius: 8, height: 28, width: 28 },
  frameItemMusic: { width: 14, height: 14 },

  // Users
  container: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#E8E8E8",
    backgroundColor: "#ededed",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 0,
    gap: 10,
    alignItems: "center",
  },
  image: { height: 50, width: 50, borderRadius: 10 },
  name: { color: "#636363", fontFamily: "Poppins-SemiBold", fontSize: 14 },
  designation: { color: "#636363", fontFamily: "Poppins-Regular", fontSize: 12 },
});