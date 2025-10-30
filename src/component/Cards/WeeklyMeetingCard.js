import * as React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ImagesAssets } from "../../assets/ImagesAssets";
import { useNavigation } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import Colors from "../../colors/Colors";
import {
  useEffect,
  useState,
  useRef,
  useCallback, // Added
} from "react";
import SurveyCard from "../../screens/SurveyCard";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Added
import SimpleToast from "react-native-simple-toast"; // Added (or your toast lib)
import { apiCallWithToken, apiServerUrl, checkConnected } from "../../Api";


const { width } = Dimensions.get("window");

const WeeklyMeetingCard = ({ announcement = [], keyId, showSurvey = false }) => {
  const navigation = useNavigation();
  const [isOffline, setIsOffline] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  const ITEM_WIDTH = width - 28;

  // Prepare data
  const dataToRender =
    keyId === "PublicScreen" ? announcement : announcement.slice(0, 10);

  // Auto-scroll effect
  useEffect(() => {
    if (dataToRender && dataToRender.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex((prevIndex) => {
          const nextIndex =
            prevIndex === dataToRender.length - 1 ? 0 : prevIndex + 1;
          flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
          return nextIndex;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [dataToRender]);

  // Network monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Survey Data (only if showSurvey is true)
  const fetchSurveyData = useCallback(async () => {

    setLoading(true);
    try {
      const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
      const isConnected = await checkConnected();

      if (!isConnected) {
        SimpleToast.show("No internet connection.");
        setSurveyData(null);
        return;
      }

      const result = await apiCallWithToken(
        `${apiServerUrl}/user/viewUserTestList`,
        "GET",
        null,
        userDetails.authToken
      );

      if (result.responseCode === 200) {
        const customSurveyList = (result.result || []).filter(
          (item) => item.type === "CUSTOM_SURVEY"
        );
        setSurveyData(customSurveyList.length > 0 ? customSurveyList[0] : null);
      } else {
        SimpleToast.show("Something went wrong, please try again");
        setSurveyData(null);
      }
    } catch (error) {
      console.log("Full Survey API Error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));  


      const isConnected = await checkConnected();
      if (isConnected) {
        SimpleToast.show("Something went wrong, please try again");
      } else {
        SimpleToast.show("No internet connection.");
      }
      setSurveyData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger fetch only when showSurvey is true
  useEffect(() => {
    if (showSurvey) {
      fetchSurveyData();
    }
  }, [showSurvey, fetchSurveyData]);

  // Handle Announcement Card Press
  // const handleCardPress = (item) => {
    
  //   const screenMap = {
  //     VIDEO: "VideosDetails",
  //     ARTICLE: "ArticlesDetails",
  //     MUSIC: "MusicPlayer",
  //   };
  //   const target = screenMap[item.contentType] || "AnouncementDetails";
  //   navigation.push(target, { dataItem: item, fromHome: true });
  // };
  const handleCardPress = (item) => {
    if (item.contentType === "VIDEO") {
      navigation.push("VideosDetails", { dataItem: item, fromHome: true });
    } else if (item.contentType === "ARTICLE") {
      navigation.push("ArticlesDetails", { dataItem: item, fromHome: true });
    } else if (item.contentType === "MUSIC") {
      navigation.push("MusicPlayer", { dataItem: item, fromHome: true });
    } else {
      navigation.push("AnouncementDetails", { item, fromHome: true });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.frameParent}
      onPress={() => handleCardPress(item)}
    >
      <ImageBackground
        style={styles.icon}
        resizeMode="cover"
        source={
          item?.thumbnail
            ? { uri: item.thumbnail }
            : ImagesAssets.health_card_image
        }
        imageStyle={{ borderRadius: 16 }}
      >
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.34)", "rgba(0, 0, 0, 0.4)"]}
          style={StyleSheet.absoluteFillObject}
        />

        {!item.alreadySeen && (
          <View style={styles.newTagContainer}>
            <Text style={styles.newTagText}>New</Text>
          </View>
        )}

        <Text
          style={[styles.deck, { marginTop: item.alreadySeen ? 0 : 25 }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.contentTitle || ""}
        </Text>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
            {item?.description?.replace(/<[^>]*>/g, "") || ""}
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  const onMomentumScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Announcements Section */}
      {dataToRender.length > 0 && (
        <View>
          <FlatList
            ref={flatListRef}
            data={dataToRender}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onMomentumScrollEnd={onMomentumScrollEnd}
            contentContainerStyle={styles.scrollView}
          />

          {/* Pagination Dots */}
          <View style={styles.dotsContainer}>
            {dataToRender.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, activeIndex === index && styles.activeDot]}
              />
            ))}
          </View>
        </View>
      )}

      {/* Survey Section */}
      {showSurvey && (
        <>
          <SurveyCard surveyData={surveyData} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  frameParent: {
    marginRight: 14,
    borderRadius: 16,
    overflow: "hidden",
  },
  scrollView: {
    marginTop: 15,
    marginLeft: 14,
    paddingRight: 14,
    marginBottom: 5,
  },
  icon: {
    height: 160,
    width: width - 28,
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
  },
  deck: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },
  descriptionContainer: {
    alignSelf: "stretch",
  },
  description: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#fff",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.secondary,
    width: 10,
    height: 10,
  },
  newTagContainer: {
    position: "absolute",
    top: 10,
    height: 20,
    width: 40,
    borderRadius: 10,
    right: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.secondary,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  newTagText: {
    color: "#06361f",
    fontSize: 8,
    fontFamily: "Poppins-SemiBold",
    textTransform: "uppercase",
  },
});

export default WeeklyMeetingCard;