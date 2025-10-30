import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import ProfleSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import { BlurView } from "@react-native-community/blur";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import moment from "moment";
import LottieView from "lottie-react-native";
import { FontFamily } from "../GlobalStyle";
import Colors from "../colors/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiServerUrl } from "../Api";
import { Modal } from "react-native-paper";
import Toast from "react-native-toast-message";
import Spinner from "react-native-loading-spinner-overlay";
import axios from "axios";
import CustomLottie from "../component/CustomLottie";

const renderItem = ({ item }) => {
  const details = item;
  const getMoodEmoji = (mood) => {
    const moodImages = {
      HAPPY: require("../assets/images/Emoji_1.png"),
      SAD: require("../assets/images/Emoji_3.png"),
      SLEEPY: require("../assets/images/Emoji_2.png"),
      ANGRY: require("../assets/images/Emoji_4.png"),
      ANXIOUS: require("../assets/images/Emoji_5.png"),
    };
    return moodImages[mood] || require("../assets/images/Emoji_1.png");
  };
  return (
    <View>
      <View
        style={{
          backgroundColor: "rgba(180, 180, 180, 0.4)",
          padding: 15,
          borderRadius: 12,
          marginVertical: 5,
          overflow: "hidden",
          marginHorizontal: 14,
        }}
      >
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={30}
          reducedTransparencyFallbackColor="white"
        />

        <View
          style={{
            width: "100%",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {details ? (
              <Image
                style={styles.imageEmogiIcon}
                source={getMoodEmoji(details.mood)}
              />
            ) : null}

            <View style={{ flexDirection: "column" }}>
              {details ? (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    fontWeight: "500",
                    color: "#262626",
                    fontFamily: "WhyteInktrap-Bold",
                    paddingTop: Platform.OS === "ios" ? 10 : 0,
                  }}
                >
                  {details.mood || ""}
                </Text>
              ) : null}
              {details ? (
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: "#636363",
                    fontFamily: "Poppins-Regular",
                  }}
                >
                  {moment(details.createdAt).format("DD MMM YYYY")}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
        <View style={{ paddingHorizontal: 10 }}>
          {/* <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 13, color: "#808080" }}>You Felt</Text>
            {details ? (
              <Text style={{ fontSize: 15, color: "#454545" }}>
                {details.feeling || ""}
              </Text>
            ) : null}
          </View>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 13, color: "#808080" }}>Because of</Text>
            {details ? (
              <Text style={{ fontSize: 15, color: "#454545" }}>
                {details.reason}
              </Text>
            ) : null}
          </View> */}
          <View style={{ marginTop: 10 }}>
            {details.details ? (
              <Text style={{ fontSize: 15, color: "#454545" }}>
                <Text style={{ fontSize: 15, color: "black" }}>Note: </Text>
                {details.details}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};

const { height, width } = Dimensions.get("screen");

const MoodTrackerHistory = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [moodData, setMoodData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Number of items per page
  const [hasMore, setHasMore] = useState(true);

  const fetchMoodHistory = async (currentPage = 1) => {
    if (!hasMore) return; // Stop fetching if no more data

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios({
        method: "get",
        url: `${apiServerUrl}/user/getAllMoodTracker?page=${currentPage}&limit=${limit}`,
        headers: {
          authToken: token,
        },
      });

      if (res?.data?.responseCode === 200) {
        const newMoodData = res?.data?.result?.moodTrackerList || [];
        setMoodData((prevData) => [...prevData, ...newMoodData]); // Append new data
        setHasMore(res.data.result.totalPages > currentPage); // Check if more data is available
      }
    } catch (error) {
      console.log("Error in mood history fetching", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoodHistory(page);
  }, [page]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prevPage) => prevPage + 1); // Increment the page number
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ position: "absolute", top: "50%", right: 0, left: 0 }}>
        <Spinner visible={loading} size="large" color="#000" />
      </View>
      <ProfleSettingHeader
        navigation={navigation}
        title="Mood Tracker History"
      />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginHorizontal: 20,
          marginTop: 10,
        }}
      >
        {/* <Text
          style={{
            lineHeight: 24,
            fontSize: 20,
            // marginLeft: 10,
            color: "#000",
            fontFamily: "WhyteInktrap-Bold",
            marginBottom: 4,
          }}
        >
          History
        </Text> */}
      </View>

      <FlatList
        data={moodData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        onEndReached={handleLoadMore} // Trigger fetch on scroll
        onEndReachedThreshold={0.5} // Trigger when 50% close to bottom
      // ListFooterComponent={
      //   loading && <ActivityIndicator size="large" color="#0000ff" />
      // }
      />

      <View
        style={{
          // flex: 1,
          backgroundColor: "#c1c1c1",
          overflow: "hidden",
          height: "70%",
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          zIndex: -1,
          // flexBasis: 200,
          position: "absolute",
          bottom: 0,
        }}
      >
        <CustomLottie />
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
  dateItem: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    // height: "80%",
    // margin: 10,
    marginRight: 10,
    borderRadius: 30,
    width: 45,
    alignItems: "center",
  },
  dateText1: {
    fontSize: 12,
    color: "#000",
    fontWeight: "500",
  },
  title: {
    fontSize: 18,
    // fontWeight: "bold",
    // marginBottom: 15,
    color: "#262626",
    fontFamily: "WhyteInktrap-Bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    // marginVertical:15,
  },
  progressContainer: {
    width: 20, // Width of each bar
    height: 150, // Height of the progress bar
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 10,
    flexDirection: "column-reverse", // Stack bars from the bottom
    alignItems: "center",
  },
  barContainer: {
    alignItems: "center",
    width: 20,
  },
  progressBar: {
    width: 20,
    height: 150,
    borderRadius: 10,
    backgroundColor: "#ccc",
    overflow: "hidden",
    flexDirection: "column-reverse", // Stack bars from bottom to top
  },
  deepSleepBar: {
    backgroundColor: "#06361F", //  Deep Sleep color
    width: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginBottom: -10,
    zIndex: 0,
  },
  normalSleepBar: {
    backgroundColor: "#B0DB02", // Normal Sleep color
    width: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 1,
  },
  dateText: {
    fontSize: 12,
    color: "#636363",
    fontWeight: "400",
  },
  totalHoursText: {
    fontSize: 12,
    color: "#161616",
    fontWeight: "400",
    fontFamily: FontFamily.captionC10Regular,
    marginTop: 5,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    width: "100%",
    marginTop: 15,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "gray",
  },
  legendIndicator: {
    width: 15,
    height: 15,
    borderRadius: 100,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#161616",
    fontWeight: "500",
    fontFamily: FontFamily.bodyB14SemiBold,
  },
  dateRange: {
    marginTop: 10,
    fontSize: 12,
    color: "#666",
  },
  filledBar: {
    width: "100%", // Full width
    borderRadius: 30,
  },
  unfilledBar: {
    backgroundColor: "#F0F0F0CC",
    width: "100%", // Full width
  },
  emoji: {
    height: 26,
    width: 26,
    // fontSize: 24,
    marginTop: -10,
  },
  percentageText: {
    marginTop: 5,
    fontSize: 14,
    color: "#161616",
    fontWeight: "bold",
    textAlign: "center",
  },

  wholePage: {
    width: width,
    height: height * 0.9,
    paddingHorizontal: 12,
    paddingTop: 5,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 8,
  },
  chartTitleCopy: {
    fontSize: 12,
    fontWeight: "400",
    color: "#454545",
    marginBottom: 8,
  },
  chart: {
    // marginVertical: 8,
    borderRadius: 16,
  },

  container1: {
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(180, 180, 180, 0.6)",
    borderRadius: 35,
    shadowColor: "#000",
    // shadowOpacity: 0.1,
    // shadowOffset: { width: 0, height: 2 },
    // shadowRadius: 10,

    // overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
  },
  month: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 10,
  },
  arrow: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  image: {
    marginTop: 5,
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  imageEmogiIcon: {
    // marginTop: 5,
    width: 30,
    height: 30,
    resizeMode: "contain",
    margin: 5,
  },
  checkBtn: {
    width: "100%",
    height: height * 0.05,
    marginTop: 10,
    backgroundColor: "#02130B",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  dateContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    padding: 10,
    borderRadius: 25,
    backgroundColor: "#FFFFFF66",
    width: 42,
  },
  selectedDateContainer: {
    backgroundColor: "#fff",
  },
  dayLabel: {
    fontSize: 10,
    color: "#161616",
  },
  selectedDayLabel: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  dateLabelbtn: {
    marginTop: 5,
    backgroundColor: "#fff",
    height: 24,
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  selecteddateLabelbtn: {
    marginTop: 5,
    backgroundColor: "#B0DB02",
    height: 24,
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  dateLabel: {
    fontSize: 12,
    color: "#161616",
    fontWeight: "bold",
  },
  selectedDateLabel: {
    color: "#4CAF50",
  },

  containerqq: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  titleqq: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  monthqq: {
    marginTop: 10,
    fontSize: 16,
    color: "#888",
  },
  bottomCard: {
    position: "absolute",
    backgroundColor: "#fff",
    bottom: 0,
    height: "100%",
    zIndex: -1,
    overflow: "hidden",
  },
  // lottieBackground: {
  //   width: width, // Full screen width
  //   height: "100%", // Adjusted for the bottom card's height
  //   bottom: -20,
  //   flex: 1,
  //   flexGrow: 1,
  //   // flexBasis: 200,
  //   overflow: "hidden",
  //   elevation: -5,
  // },
  lottieBackground: {
    width: width * 1,
    height: height * 0.68,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    // position: "absolute",
    // bottom: 0,
  },

  modal: {
    // backgroundColor:'red'
    // justifyContent: "center",
    // alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 20,
    padding: 20,
  },
  stepContainer: {
    // position: "relative",
    backgroundColor: "#FFFFFFCC",
    paddingHorizontal: 20,
    paddingVertical: 20,
    // borderRadius: 20,
    borderTopRightRadius: 32,
    borderTopLeftRadius: 32,
    bottom: 0,
    overflow: "hidden",
  },
  closeButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    // paddingVertical:5,
    paddingRight: 20,
    // position: "absolute",
    // right: 15,
    // top: 0,
    // padding: 10,
    // backgroundColor:'red'
  },
  closeButtonText: {
    fontSize: 35,
    color: "#929292",
  },
  greeting: {
    fontSize: 16,
    fontWeight: "400",
    color: "#262626",
    // backgroundColor:"red",
    fontFamily: "Poppins-Regular",
    // lineHeight: 19.2,
  },
  greetingMain: {
    fontSize: 22,
    fontWeight: "600",
    color: "#262626",
    // backgroundColor:"red",
    fontFamily: "Poppins-SemiBold",
    // lineHeight: 19.2,
  },
  question: {
    fontSize: 17,
    fontWeight: "700",
    color: "black",
    fontFamily: "Poppins-Regular",
    // lineHeight: 20.4,
    marginBottom: 30,
  },
  moodContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  moodButton: {
    // padding: 10,
    // borderRadius: 25,
    // backgroundColor: "#f0f0f0",
    // marginHorizontal: 5,
  },
  selectedMood: {
    backgroundColor: "#e0e0e0",
    borderWidth: 2,
    borderColor: "#02130B",
  },
  moodEmoji: {
    fontSize: 24,
  },
  input: {
    width: width * 0.9,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    width: "100%",
  },
  continueButton: {
    backgroundColor: "#02130B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#02130B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },

  dropdownContainer: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    paddingHorizontal: 10,
    fontFamily: "Poppins-Regular",
    zIndex: 5,
    backgroundColor: "#fff",
    marginVertical: 20,
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    height: 18,
    width: 18,
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#636363",
    fontFamily: "Poppins-Regular",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 10,
  },
});
