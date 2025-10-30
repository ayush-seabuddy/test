import React, { useEffect, useCallback, useMemo, useState } from "react";
import {
  Text,
  StyleSheet,
  Image,
  View,
  Dimensions,
  Pressable,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfleSettingHeader from "./headers/ProfileHeader/ProfleSettingHeader";
import { ImagesAssets } from "../assets/ImagesAssets";
import { apiCallWithToken, apiServerUrl } from "../Api";
import CustomLottie from "./CustomLottie";
import moment from "moment";

const { width, height } = Dimensions.get("window");

const AllAssessmentTest = ({ navigation, route }) => {
  const { assessmentType } = route.params;
  const [testData, setTestData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch API Data
  const fetchTestData = useCallback(async () => {
    try {
      setLoading(true);
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      if (!userDetails?.authToken) throw new Error("No auth token found");

      const queryParams = new URLSearchParams({ page: 1, limit: 50 }).toString();
      const response = await apiCallWithToken(
        `${apiServerUrl}/user/getAssessmentResponseList?${queryParams}&assessmentType=${assessmentType}`,
        "GET",
        null,
        userDetails.authToken
      );

      if (response.responseCode === 200) {
        setTestData(response.result.assessmentList || []);
      } else {
        setTestData([]);
      }
    } catch (error) {
      console.error("Error fetching test data:", error);
      setTestData([]);
    } finally {
      setLoading(false);
    }
  }, [assessmentType]);

  useEffect(() => {
    fetchTestData();
  }, [fetchTestData]);

  // ✅ Sorted list by month
  const sortedList = useMemo(
    () =>
      testData
        .filter((item) => item.questionType === assessmentType)
        .sort((a, b) => b.month.localeCompare(a.month)),
    [testData, assessmentType]
  );

  // ✅ Score Meaning for Happiness
 const getScoreMeaning = (score) => {
  if (score >= 80 && score <= 100) return "Very Happy — Life feels good, strong well-being.";
  if (score >= 60 && score < 80) return "Happy — Generally satisfied, things are going well.";
  if (score >= 40 && score < 60) return "Moderate — Average satisfaction, some challenges exist.";
  if (score >= 20 && score < 40) return "Low — People face difficulties, well-being is below average.";
  if (score >= 0 && score < 20) return "Very Low — Major challenges, low satisfaction.";
  return "Score not in standard range.";
};


  // ✅ Mood Classification for POMS
  const classifyTMD = (tmd) => {
    if (!tmd || isNaN(tmd)) {
      return {
        mood: "No Data",
        message:
          "Calculated from your latest Monthly Wellbeing Pulse test results to help you spot patterns and manage stress better",
      };
    }

    tmd = Math.round(Number(tmd));
    if (tmd < 6) {
      return {
        mood: "Stable Mood",
        message: "Great job! Your mood is stable, keep up the positive vibes!",
      };
    } else if (tmd >= 6 && tmd < 21) {
      return {
        mood: "Mild Mood Disturbance",
        message: "You're doing well, but there's room to boost yourge mood even further.",
      };
    } else if (tmd >= 21 && tmd <= 35) {
      return {
        mood: "Moderate Mood Disturbance",
        message: "Your mood is showing some disturbance. Try stress-relief techniques to get back on track.",
      };
    } else {
      return {
        mood: "High Mood Disturbance",
        message: "It looks like you're experiencing high stress. Consider connecting with a consultant for support.",
      };
    }
  };

  // ✅ Render List Item
  const renderList = useCallback(
    ({ item }) => {
      const formattedDate = moment(item?.month, "MM-YYYY").format("MMM YYYY");
      const score = item?.questionsAndAnswers?.[0]?.result ?? 0;

      const getScoreColors = (score) => {
        if (assessmentType === "HAPPINESS") {
          if (score >= 75) return { backgroundColor: "#A9DFBF", textColor: "#145A32" };
          if (score >= 40) return { backgroundColor: "#F9E79F", textColor: "#7D6608" };
          return { backgroundColor: "#F5B7B1", textColor: "#78281F" };
        } else if (assessmentType === "POMS") {
          // POMS scoring: lower TMD = better mood
          if (score < 6) return { backgroundColor: "#A9DFBF", textColor: "#145A32" }; // Stable Mood
          if (score >= 6 && score < 21) return { backgroundColor: "#F9E79F", textColor: "#7D6608" }; // Mild Mood Disturbance
          if (score >= 21 && score <= 35) return { backgroundColor: "#F5B7B1", textColor: "#78281F" }; // Moderate Mood Disturbance
          return { backgroundColor: "#E74C3C", textColor: "#fff" }; // High Mood Disturbance
        }
        return { backgroundColor: "#ccc", textColor: "#000" };
      };


      const { backgroundColor, textColor } = getScoreColors(score);

      // ✅ Determine Display Text Based on Assessment Type
      let infoSection = null;
      if (assessmentType === "HAPPINESS") {
        const scoreMessage = getScoreMeaning(score);
        infoSection = (
          <Text style={styles.infoText}>{scoreMessage}</Text>
        );
      } else if (assessmentType === "POMS") {
        const { mood, message } = classifyTMD(score);
        infoSection = (
          <View style={{ marginTop: 4 }}>
            <Text style={styles.moodText}>{mood}</Text>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        );
      }

      return (
        <TouchableOpacity
          style={styles.frameParent}
          onPress={() =>
            navigation.navigate(
              assessmentType === "HAPPINESS"
                ? "ViewAssessmentResult"
                : "AllPOMSAssementResult",
              { result: item }
            )
          }
        >
          <View style={[styles.frameGroup, styles.frameGroupFlexBox]}>
            <View style={[styles.frameContainer, styles.frameFlexBox]}>
              <View style={styles.personalityMapParent}>
                <Text style={styles.dateText}>{formattedDate}</Text>

                <View
                  style={{
                    backgroundColor,
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                    marginTop: 4,
                  }}
                >
                  <Text style={{ color: textColor, fontWeight: "600" }}>
                    Score: {score}
                  </Text>
                </View>

                {infoSection}
              </View>

              <View style={styles.imageContainer}>
                <Image
                  style={styles.frameItem}
                  resizeMode="cover"
                  source={ImagesAssets.baseicon2}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, assessmentType]
  );

  const noDataMessage = useMemo(
    () =>
      assessmentType === "HAPPINESS"
        ? "No Happiness index data is available at this time"
        : assessmentType === "POMS"
          ? "No Wellbeing Pulse data is available at this time"
          : "No results available at this time.",
    [assessmentType]
  );

  return (
    <>
      <ProfleSettingHeader
        navigation={navigation}
        title={
          assessmentType === "POMS"
            ? "Monthly Wellbeing Pulse"
            : "Monthly Happiness Index"
        }
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="rgba(6, 54, 31, 1)" />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {sortedList.length > 0 ? (
            <FlatList
              data={sortedList}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
              renderItem={renderList}
              contentContainerStyle={styles.flatListContent}
              initialNumToRender={10}
              windowSize={5}
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Image
                style={styles.noDataImage}
                source={require("../assets/images/AnotherImage/no-content.png")}
              />
              <Text style={styles.noDataText}>{noDataMessage}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.lottieContainer}>
        <CustomLottie />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  frameGroupFlexBox: {
    alignItems: "center",
    flexDirection: "row",
  },
  frameFlexBox: {
    alignItems: "center",
    flexDirection: "row",
  },
  frameParent: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginVertical: 5,
  },
  frameGroup: {
    gap: 16,
  },
  frameContainer: {
    gap: 8,
    flex: 1,
  },
  personalityMapParent: {
    gap: 4,
    flex: 1,
  },
  dateText: {
    color: "#000",
    fontSize: 14,
    fontWeight: '600',
    fontFamily: "Poppins-SemiBold",
  },
  infoText: {
    marginTop: 4,
    fontSize: 13,
    color: "#333",
    fontFamily: "Poppins-Regular",
  },
  moodText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    fontFamily: "Poppins-SemiBold",
  },
  messageText: {
    fontSize: 12,
    color: "#444",
    fontFamily: "Poppins-Regular",
    marginTop: 2,
  },
  imageContainer: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
  },
  frameItem: {
    width: 12,
    height: 12,
  },
  loadingContainer: {
    width,
    height: height * 0.9,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    paddingHorizontal: 14,
    marginTop: 10,
  },
  flatListContent: {
    paddingBottom: height * 0.5,
  },
  noDataContainer: {
    width: width - 28,
    height: height * 0.9,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataImage: {
    height: 120,
    width: 120,
  },
  noDataText: {
    marginTop: 20,
    fontSize: 16,
    color: "white",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  lottieContainer: {
    backgroundColor: "#c1c1c1",
    height: "50%",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    zIndex: -1,
    position: "absolute",
    bottom: 0,
    width,
    overflow: "hidden",
  },
});

export default AllAssessmentTest;
