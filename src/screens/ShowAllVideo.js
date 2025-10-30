import {
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  ImageBackground,
  Platform,
  Dimensions,
} from "react-native";
import { ImagesAssets } from "../assets/ImagesAssets";
import ArticalDetailsHeader from "../component/headers/ArticalDetailsHeader";
import ArticlesCard from "../component/Cards/ArticlesCards/ArticlesCard";
import RelatedVideosCard from "../component/Cards/RelatedVideosCard";
import { BlurView } from "@react-native-community/blur";
import Colors from "../colors/Colors";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import AnouncementDetailsHeader from "../component/headers/AnouncementDetailsHeader";
import VedioCard from "../component/Cards/VedioCard";
import VedioCards from "../component/Cards/VedioCards";
import LottieView from "lottie-react-native";
import CustomLottie from "../component/CustomLottie";
import VideoCardForAll from "../component/Cards/VideoCardForAll";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../Api";
import { useState } from "react";
const { width, height } = Dimensions.get("window");

const ShowAllVideo = ({ navigation, route }) => {
  const [Data, setData] = useState(route?.params?.data?.VIDEO?.allContents ? route?.params?.data?.VIDEO?.allContents : route?.params?.data?.VIDEO);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(2);
  const [totalPage, setTotalPage] = useState(2);

  const fetchUserList = async () => {
    try {
      if (page > totalPage) return;
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      let url = route?.params?.url ? `${route?.params?.url}&page=${page}` : `${apiServerUrl}/content/getAllContents?contentType=${"VIDEO"}&isPublic=${false}&page=${page}`
      const result = await apiCallWithToken(
        url,
        "GET",
        null,
        userDetails.authToken
      );

      if (result.responseCode === 200) {
        setData((prevLists) => ([
          ...prevLists,
          ...result?.result?.allContents,
        ]));
      }
      totalPage(result?.result?.totalPages);

    } catch (error) {
      console.log(
        `API Error for ${department}:`,
        error.response?.data || error.message
      );
    } finally {
      setPage(page + 1)
    }
  };

  return (
    <>
      <View style={styles.container}>
        <AnouncementDetailsHeader navigation={navigation} title={"All Video"} />
        <FocusAwareStatusBar
          barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
          backgroundColor={Colors.white}
          hidden={false}
        />
        <View style={styles.scrollView}>
          {Data ? (
            <VideoCardForAll navigation={navigation} data={Data || {}} fetchUserList={fetchUserList} />
          ) : null}
        </View>
      </View>
      <View
        style={{
          backgroundColor: "#c1c1c1",
          overflow: "hidden",
          height: "50%",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          zIndex: -1,
          position: "absolute",
          bottom: 0,
        }}
      >
        <CustomLottie />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  lottieBackground: {
    width: width * 1,
    height: height * 0.68,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scrollView: {
    height: "90%",
  },
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: "100%",
    height: Dimensions.get("window").height * 0.42,
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: -1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    position: "absolute",
    bottom: "23%",
    left: "50%",
  },
  activeDot: {
    width: 6,
    height: 6,
  },
  inactiveDot: {
    width: 6,
    height: 6,
    tintColor: "rgba(217, 217, 217, 0.3)",
  },
  scrollViewContent: {
    paddingTop: "45%",
    paddingBottom: "10%",
  },
  cardContainer: {
    gap: 16,
  },
  contentPosition: {
    left: 0,
    width: "100%",
    position: "absolute",
  },
  wrapperSpaceBlock: {
    paddingHorizontal: 16,
    alignSelf: "stretch",
  },
  picturesWrapperFlexBox: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignSelf: "stretch",
  },
  bestClr: {
    color: "#262626",
    textAlign: "left",
  },
  akarFlexBox: {
    padding: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  pointsTypo: {
    lineHeight: 10,
    fontSize: 8,
    fontFamily: "Poppins-Regular",
  },
  contentDetailsChild: {
    top: "0%",
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 32,
    height: "15%",
    width: "100%",
  },
  bestStreetFood: {
    textAlign: "left",
    fontFamily: "WhyteInktrap-Medium",
    fontWeight: "500",
    color: "#262626",
    fontSize: 18,
    lineHeight: 25,
  },
  akarIconsdotGrid: {
    width: 20,
    height: 20,
    overflow: "hidden",
  },
  akarIconsdotGridWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  bestStreetFoodInUkParent: {
    alignItems: "center",
  },
  groupAct: {
    color: "#fff",
    fontFamily: "Poppins-Regular",
    textAlign: "left",
  },
  groupActWrapper: {
    backgroundColor: "#06361f",
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 32,
    alignItems: "center",
  },
  frameView: {
    gap: 4,
    flexDirection: "row",
    alignSelf: "stretch",
    alignItems: "center",
  },
  loremIpsumIsSimply: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Poppins-Regular",
    textAlign: "left",
    alignSelf: "stretch",
  },
  loremIpsumIsSimplyDummyTeParent: {
    gap: 16,
    alignSelf: "stretch",
  },
  writenBy: {
    lineHeight: 14,
    color: "#06361f",
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    textAlign: "left",
    fontWeight: "500",
  },
  frameChild: {
    borderRadius: 64,
    width: 32,
    height: 32,
  },
  ellipseWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  frameParent1: {
    justifyContent: "center",
    gap: 8,
    flex: 1,
  },
  frameWrapper1: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    flexDirection: "row",
    alignSelf: "stretch",
  },
  frameContainer: {
    gap: 24,
    width: "100%",
  },
  frameWrapper: {
    backgroundColor: "rgba(180, 180, 180, 0.6)",
    paddingTop: 24,
    paddingBottom: 16,
    borderRadius: 32,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  frameItem: {
    width: "31%",
    height: 96,
    borderRadius: 8,
  },
  frameParent3: {
    flexWrap: "wrap",
    alignContent: "flex-start",
    flexDirection: "row",
    alignSelf: "stretch",
    gap: 8,
    width: "100%",
  },
  frameParent2: {
    gap: 4,
    width: "100%",
  },
  frameGroup: {
    width: "100%",
    gap: 8,
    paddingHorizontal: 16,
  },
  recommendationArticles: {
    lineHeight: 27,
    textAlign: "left",
    fontFamily: "WhyteInktrap-Medium",
    fontWeight: "500",
    color: "#262626",
    fontSize: 18,
    flex: 1,
  },
  recommendationArticlesWrapper: {
    paddingVertical: 0,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  points: {
    fontFamily: "Poppins-Regular",
    lineHeight: 10,
    fontSize: 8,
  },
  frameParent4: {
    alignSelf: "stretch",
    gap: 8,
  },
  frameParent: {
    top: "7%",
    gap: 32,
    alignItems: "center",
    width: "100%",
  },
  right: {
    height: "29.74%",
    right: 16,
    bottom: "36.05%",
    width: 67,
    top: "34.21%",
    position: "absolute",
  },
  icon: {
    height: "100%",
    overflow: "hidden",
    width: "100%",
  },
  contentDetails: {
    backgroundColor: "red",
    width: "100%",
    flex: 1,
  },
});

export default ShowAllVideo;