import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import AppleHealthKit from "react-native-health";
import moment from "moment";
import { BlurView } from "@react-native-community/blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ProfleSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import { ImagesAssets } from "../assets/ImagesAssets";
import Colors from "../colors/Colors";
import { apiCallWithToken, apiServerUrl } from "../Api";
import HealthDataScreen from "./HealthDataScreen";
import HealthDataScreenIos from "./HealthDataScreenIos";
import Bargraph from "./Bargraph";
import GraphScreen from "./GraphScreen";
import CustomLottie from "../component/CustomLottie";
import { FontFamily } from "../GlobalStyle";

const { height, width } = Dimensions.get("screen");

// HealthKit Permissions
const PERMISSIONS = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.SleepAnalysis],
    write: [AppleHealthKit.Constants.Permissions.SleepAnalysis],
  },
};

const Analytics = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [groupActivities, setGroupActivities] = useState([]);
  const [stressLevelGraph, setStressLevelGraph] = useState([]);
  const [data, setData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().subtract(6, "months"));
  const [selectedDateTo, setSelectedDateTo] = useState(moment());
  const [sleepData, setSleepData] = useState([]);
  const [graphData, setGraphData] = useState([]);

  const [moodType, setMoodType] = useState({
    mood: "",
    message: "Calculated from your latest Wellbeing Pulse survey results to help you spot patterns and manage stress better",
  });


  // Classify TMD for mood display
  useEffect(() => {
    const latestTMD = stressLevelGraph
      .sort((a, b) => {
        const [monthA, yearA] = a.month.split("-").map(Number);
        const [monthB, yearB] = b.month.split("-").map(Number);
        return yearB - yearA || monthB - monthA;
      })[0]?.TMD || 0;

    const classifyTMD = (tmd) => {
      if (!tmd || isNaN(tmd)) return moodType;

      tmd = Math.round(Number(tmd));
      if (tmd < 6)
        return {
          mood: "Stable Mood",
          message: "Great job! Your mood is stable, keep up the positive vibes!",
        };
      if (tmd < 21)
        return {
          mood: "Mild Mood Disturbance",
          message: "You're doing well, but there's room to boost your mood even further. Keep it up!",
        };
      if (tmd <= 35)
        return {
          mood: "Moderate Mood Disturbance",
          message: "Your mood is showing some disturbance. Try some stress-relief techniques to get back on track.",
        };
      return {
        mood: "High Mood Disturbance",
        message: "It looks like you're experiencing high stress. Consider connecting with a consultant for support.",
      };
    };

    setMoodType(classifyTMD(latestTMD));
  }, [stressLevelGraph]);

  // Initialize HealthKit and fetch sleep data
  useEffect(() => {
    if (Platform.OS === "ios") {
      AppleHealthKit.initHealthKit(PERMISSIONS, (error) => {
        if (error) {
          console.error("HealthKit permission denied:", error);
          return;
        }
        fetchSleepData();
      });
    }
  }, []);

  // Fetch analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
      try {
        setLoading(true);
        const response = await apiCallWithToken(
          `${apiServerUrl}/user/getAnalytics?fromMonth=${selectedDate.format("MM-YYYY")}&toMonth=${selectedDateTo.format("MM-YYYY")}`,
          "GET",
          null,
          userDetails.authToken
        );
        if (response.responseCode === 200) {
          setGroupActivities(response.result.groupActivities);
          setStressLevelGraph(response.result.stressLevelGraph);
        }
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedDate, selectedDateTo]);

  // Update PieChart data
  useEffect(() => {
    const colors = ["#B0DB02", "#FAFAD9", "#84A402"];
    const updatedActivities = groupActivities.map((activity, index) => ({
      ...activity,
      color: colors[index] || "#000",
    }));
    setData(updatedActivities);
  }, [groupActivities]);

  // Fetch and process sleep data
  const fetchSleepData = () => {
    const options = {
      startDate: moment().subtract(7, "days").toISOString(),
      endDate: moment().toISOString(),
      includeManuallyAdded: true,
    };

    AppleHealthKit.getSleepSamples(options, (error, results) => {
      if (error) {
        console.error("Error fetching sleep data:", error);
        return;
      }
      setSleepData(results);
      console.log("Sleep Data:", results); // Log sleep data as requested

      const sleepByDate = {};
      results.forEach((sample) => {
        if (["INBED", "ASLEEP", "AWAKE", "DEEP", "CORE"].includes(sample.value)) {
          const start = moment(sample.startDate);
          const end = moment(sample.endDate);
          const durationHours = moment.duration(end.diff(start)).asHours();
          const date = start.format("YYYY-MM-DD");
          sleepByDate[date] = (sleepByDate[date] || 0) + durationHours;
        }
      });

      const processedData = Object.keys(sleepByDate)
        .map((date) => ({
          date,
          hours: sleepByDate[date].toFixed(2),
        }))
        .sort((a, b) => moment(a.date).diff(moment(b.date)));
      setGraphData(processedData);
      console.log("Processed Sleep Graph Data:", processedData); // Log processed graph data
    });
  };

  // Open Health/Settings for permissions
  const openSettings = async () => {
    try {
      const healthUrl = "x-apple-health://";
      if (await Linking.canOpenURL(healthUrl)) {
        await Linking.openURL(healthUrl);
        return;
      }
      if (AppleHealthKit.openHealth) {
        AppleHealthKit.openHealth();
        return;
      }
      const settingsUrl = "app-settings:";
      if (await Linking.canOpenURL(settingsUrl)) {
        await Linking.openURL(settingsUrl);
        return;
      }
      throw new Error("Cannot open Health or Settings");
    } catch (error) {
      console.error("Failed to open Health/Settings:", error);
      Linking.openURL("app-settings:").catch(() =>
        console.error("Unable to open settings")
      );
    }
  };

  const handleMonthChange = (increment) =>
    setSelectedDate((prev) => moment(prev).add(increment, "months"));
  const handleMonthChangeTo = (increment) =>
    setSelectedDateTo((prev) => moment(prev).add(increment, "months"));

  // Chart configuration
  const chartConfig = {
    backgroundColor: "#f5f5f5",
    backgroundGradientFrom: "#f5f5f5",
    backgroundGradientTo: "#f5f5f5",
    color: (opacity = 1) => `rgba(79, 99, 1, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "2", strokeWidth: "2", stroke: "#ffa726" },
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <ProfleSettingHeader navigation={navigation} title="Analytics" />
      <ScrollView>
        <View style={styles.wholePage}>
          <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={10} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.container1, { backgroundColor: "#FFFFFFCC" }]}>
              <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={30} />
              <View style={styles.header}>
                <View style={{ flexDirection: "row", width: "50%" }}>
                  <View style={[styles.monthNavigation, { justifyContent: "space-between" }]}>
                    <Text style={styles.month}>From</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <TouchableOpacity onPress={() => handleMonthChange(-1)}>
                        <Image
                          style={styles.arrow}
                          source={require("../assets/images/AnalyticsImage/LeftArrow.png")}
                        />
                      </TouchableOpacity>
                      <Text style={styles.month}>{selectedDate.format("MMM YYYY")}</Text>
                      <TouchableOpacity onPress={() => handleMonthChange(1)}>
                        <Image
                          style={styles.arrow}
                          source={require("../assets/images/AnalyticsImage/RightArrow.png")}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={[styles.monthNavigation, { justifyContent: "space-between" }]}>
                    <Text style={styles.month}>To</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <TouchableOpacity onPress={() => handleMonthChangeTo(-1)}>
                        <Image
                          style={styles.arrow}
                          source={require("../assets/images/AnalyticsImage/LeftArrow.png")}
                        />
                      </TouchableOpacity>
                      <Text style={styles.month}>{selectedDateTo.format("MMM YYYY")}</Text>
                      <TouchableOpacity onPress={() => handleMonthChangeTo(1)}>
                        <Image
                          style={styles.arrow}
                          source={require("../assets/images/AnalyticsImage/RightArrow.png")}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.container}>
              <View style={{ flexDirection: "column", justifyContent: "space-between" }}>
                <View style={styles.chartContainer}>
                  <Text style={[styles.chartTitle, { marginTop: 20, marginLeft: 20, fontSize: 24, width: "100%", textAlign: "start", fontFamily: FontFamily.whyteInktrap }]}>
                    Stress Levels
                  </Text>
                  <Text style={[{ fontSize: 11, marginLeft: 20, width: "100%", paddingRight: 20, textAlign: "start", fontFamily: "Poppins-Regular" }]}>
                    <Text style={{ fontSize: 14, fontFamily: FontFamily.whyteInktrap }}>{moodType.mood}</Text> {" - " + moodType.message}
                  </Text>
                  <Bargraph stressLevelGraph={stressLevelGraph} selectedDateTo={selectedDateTo} />
                </View>
                <View style={styles.containerProgress}>
                  <GraphScreen />
                  <Text style={[styles.chartTitle, { position: "absolute", bottom: 3, left: 17 }]}>Monthly Data Usage</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={[styles.containerProgress, { width: width - 20, paddingRight: "25%", paddingBottom: 30 }]}>
                  <Text style={[styles.chartTitle, { fontSize: 20, marginLeft: 20, marginTop: 40, color: "#494949" }]}>BuddyUp Log</Text>
                  <Text style={[{ fontSize: 11, marginLeft: 20, width, paddingRight: 60, textAlign: "start", fontFamily: "Poppins-Regular" }]}>
                    Track your BuddyUp activity and see how you’re engaging with your crew community.
                  </Text>
                  <PieChart
                    data={data}
                    width={width * 0.83}
                    height={100}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"35"}
                    center={[0, 0]}
                    absolute
                  />
                </View>
              </View>
              <View>
                {Platform.OS === "android" ? (
                  <HealthDataScreen onSettingsButtonClick={() => console.log("Settings button clicked")} />
                ) : (
                  graphData.length > 0 ? (
                    <HealthDataScreenIos GraphData={graphData} />
                  ) : (
                    <Text style={[styles.chartTitle, { marginTop: 20, marginLeft: 20, textAlign: "center" }]}>
                      No Sleep Data Available Yet
                    </Text>
                  )
                )}
                <View style={{ flexDirection: "row" }}>
                  <View style={[styles.sleepStyle, { height: width * 0.2 }]}>
                    <Text style={[styles.chartTitle, { marginTop: 20 }]}>Sleep Quality</Text>
                  </View>
                  {Platform.OS === "ios" && (
                    <View style={styles.sleepStyle}>
                      <TouchableOpacity style={styles.progressButton} onPress={openSettings}>
                        <Image source={ImagesAssets.setting_icon} style={styles.headerIcon} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
        <View style={styles.bottomCard}>
          <CustomLottie customSyle={{ width, height, position: "absolute" }} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wholePage: { flex: 1, padding: 10, marginTop: 4 },
  container: { marginTop: 10, width: "100%", height: "100%" },
  chartContainer: { marginVertical: 5, backgroundColor: "#FFFFFF33", minHeight: height * 0.45, justifyContent: "center", alignItems: "center", borderRadius: 10 },
  chartTitle: { fontSize: 16, fontWeight: "bold", color: "#262626", marginBottom: 8, lineHeight: 30 },
  containerProgress: { marginVertical: 5, backgroundColor: "#FFFFFF33", height: height * 0.23, width: "100%", justifyContent: "center", alignItems: "start", borderRadius: 10, overflow: "hidden" },
  sleepStyle: { width: width * 0.45, height: width * 0.09, paddingLeft: 10 },
  headerIcon: { width: 18, height: 18, resizeMode: "contain" },
  container1: { width: "100%", padding: 20, borderRadius: 32, overflow: "hidden" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  monthNavigation: { width: "100%", flexDirection: "column", alignItems: "center" },
  month: { fontSize: 14, fontWeight: "600", color: "#333", marginHorizontal: 10 },
  arrow: { width: 18, height: 18, resizeMode: "contain" },
  progressButton: { position: "absolute", backgroundColor: "white", width: width * 0.09, height: width * 0.09, justifyContent: "center", alignItems: "center", borderRadius: 10, top: 20, right: 10 },
  bottomCard: { position: "absolute", width: "100%", height: "95%", bottom: 0, alignItems: "center", justifyContent: "center", overflow: "hidden", zIndex: -1, borderTopLeftRadius: 35, borderTopRightRadius: 35, backgroundColor: "rgba(0, 0, 0, 0.05)" },
});

export default Analytics;