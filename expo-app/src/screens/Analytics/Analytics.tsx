import CustomLottie from '@/src/components/CustomLottie'
import GlobalHeader from '@/src/components/GlobalHeader'
import Colors from '@/src/utils/Colors'
import { height, width } from '@/src/utils/helperFunctions'
import { BlurView } from 'expo-blur'
import { router } from 'expo-router'
import { t } from 'i18next'
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react-native'
import moment from 'moment-timezone'
import React, { useEffect, useState } from 'react'
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { PieChart } from "react-native-chart-kit"
import { ScrollView } from 'react-native-gesture-handler'
import Bargraph from './Bargraph'
import GraphScreen from './GraphScreen'

const Analytics = () => {
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

  const handleMonthChange = (increment: number) =>
    setSelectedDate((prev) => moment(prev).add(increment, "months"));
  const handleMonthChangeTo = (increment: number) =>
    setSelectedDateTo((prev) => moment(prev).add(increment, "months"));

  const chartConfig = {
    backgroundColor: "#f5f5f5",
    backgroundGradientFrom: "#f5f5f5",
    backgroundGradientTo: "#f5f5f5",
    color: (opacity = 1) => `rgba(79, 99, 1, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "2", strokeWidth: "2", stroke: "#ffa726" },
  };

  const openHealthOrSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        const healthUrl = 'x-apple-health://';
        if (await Linking.canOpenURL(healthUrl)) {
          await Linking.openURL(healthUrl);
          return;
        }
        await Linking.openSettings();
        return;
      }

      const fitUrl = 'googlefit://';
      if (await Linking.canOpenURL(fitUrl)) {
        await Linking.openURL(fitUrl);
        return;
      }

      await Linking.openSettings();
    } catch (error) {
      console.error('Failed to open Health/Fit or Settings:', error);
      Linking.openSettings().catch(() => { });
    }
  };

  useEffect(() => {
    const colors = ['#B0DB02', '#FAFAD9', '#84A402'];
    const updatedActivities = groupActivities.map((activity, index) => ({
      ...(typeof activity === 'object' && activity !== null ? activity : {}),
      color: colors[index] || '#000',
    }));
    setData(updatedActivities);
  }, [groupActivities]);
  

  return (
    <View style={styles.root}>
      <GlobalHeader
        title={t("analytics")}
        leftIcon={<ChevronLeft size={20} />}
        onLeftPress={() => { router.back() }}
      />
      <ScrollView>
        <View style={styles.wholePage}>
          <BlurView style={StyleSheet.absoluteFill} tint="light" intensity={10} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.container1Blurred}>
              <BlurView style={StyleSheet.absoluteFill} tint="light" intensity={30} />
              <View style={styles.header}>
                <View style={styles.headerRow}>
                  <View style={styles.monthNavigationContainer}>
                    <Text style={styles.month}>From</Text>
                    <View style={styles.monthRow}>
                      <TouchableOpacity onPress={() => handleMonthChange(-1)}>
                        <ChevronLeft size={20} />
                      </TouchableOpacity>
                      <Text style={styles.month}>{selectedDate.format("MMM YYYY")}</Text>
                      <TouchableOpacity onPress={() => handleMonthChange(1)}>
                        <ChevronRight size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.monthNavigationContainer}>
                    <Text style={styles.month}>To</Text>
                    <View style={styles.monthRow}>
                      <TouchableOpacity onPress={() => handleMonthChangeTo(-1)}>
                        <ChevronLeft size={20} />
                      </TouchableOpacity>
                      <Text style={styles.month}>{selectedDateTo.format("MMM YYYY")}</Text>
                      <TouchableOpacity onPress={() => handleMonthChangeTo(1)}>
                        <ChevronRight size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.container}>
              <View style={styles.flexColumnBetween}>
                <View style={styles.chartContainer}>
                  <Text style={styles.stressTitle}>
                    Stress Levels
                  </Text>
                  <Text style={styles.stressSubtitle}>
                    <Text style={styles.stressMood}>{moodType.mood}</Text> {" - " + moodType.message}
                  </Text>
                  <Bargraph stressLevelGraph={stressLevelGraph} selectedDateTo={selectedDateTo.toDate()} />
                </View>
                <View style={styles.containerProgress}>
                  <GraphScreen />
                  <Text style={styles.monthlyDataUsage}>Monthly Data Usage</Text>
                </View>
              </View>

              <View style={styles.buddyUpRow}>
                <View style={styles.buddyUpContainer}>
                  <Text style={styles.buddyUpTitle}>BuddyUp Log</Text>
                  <Text style={styles.buddyUpSubtitle}>
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
                <View style={styles.sleepRow}>
                  <View style={styles.sleepStyleBox}>
                    <Text style={styles.sleepTitle}>Sleep Quality</Text>
                  </View>
                  <View style={styles.sleepStyle}>
                    <TouchableOpacity style={styles.progressButton} onPress={openHealthOrSettings}>
                      <Settings size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
        <View style={styles.bottomCard}>
          <CustomLottie customSyle={styles.lottieStyle} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  wholePage: { flex: 1, padding: 10, marginTop: 4 },
  container: { marginTop: 10, width: "100%", height: "100%" },
  chartContainer: { marginVertical: 5, backgroundColor: "#FFFFFF33", minHeight: height * 0.45, justifyContent: "center", alignItems: "center", borderRadius: 10 },
  chartTitle: { fontSize: 16, fontWeight: "bold", color: "#262626", marginBottom: 8, lineHeight: 30 },
  containerProgress: { marginVertical: 5, backgroundColor: "#FFFFFF33", height: height * 0.23, width: "100%", justifyContent: "center", alignItems: "flex-start", borderRadius: 10, overflow: "hidden" },
  sleepStyle: { width: width * 0.45, height: width * 0.09, paddingLeft: 10 },
  sleepStyleBox: { width: width * 0.45, height: width * 0.2, paddingLeft: 10 },
  sleepRow: { flexDirection: "row" },
  sleepTitle: { marginTop: 20, fontSize: 16, fontWeight: "bold", color: "#262626", marginBottom: 8, lineHeight: 30 },
  headerIcon: { width: 18, height: 18, resizeMode: "contain" },
  container1: { width: "100%", padding: 20, borderRadius: 32, overflow: "hidden" },
  container1Blurred: { backgroundColor: "#FFFFFFCC", width: "100%", padding: 20, borderRadius: 32, overflow: "hidden" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerRow: { flexDirection: "row", width: "50%" },
  monthNavigation: { width: "100%", flexDirection: "column", alignItems: "center" },
  monthNavigationContainer: { flexDirection: "column", alignItems: "center", justifyContent: "space-between", width: "50%" },
  month: { fontSize: 14, fontWeight: "600", color: "#333", marginHorizontal: 10 },
  monthRow: { flexDirection: "row", alignItems: "center" },
  arrow: { width: 18, height: 18, resizeMode: "contain" },
  progressButton: { position: "absolute", backgroundColor: "white", width: width * 0.09, height: width * 0.09, justifyContent: "center", alignItems: "center", borderRadius: 10, top: 20, right: 10 },
  bottomCard: { position: "absolute", width: "100%", height: "95%", bottom: 0, alignItems: "center", justifyContent: "center", overflow: "hidden", zIndex: -1, borderTopLeftRadius: 35, borderTopRightRadius: 35, backgroundColor: "rgba(0, 0, 0, 0.05)" },
  lottieStyle: { width: width, height: height, position: "absolute" },
  flexColumnBetween: { flexDirection: "column", justifyContent: "space-between" },
  stressTitle: { marginTop: 20, marginLeft: 20, fontSize: 24, width: "100%", textAlign: "left", fontFamily: "whyteInktrap" },
  stressSubtitle: { fontSize: 11, marginLeft: 20, width: "100%", paddingRight: 20, textAlign: "left", fontFamily: "Poppins-Regular" },
  stressMood: { fontSize: 14, fontFamily: "whyteInktrap" },
  monthlyDataUsage: { position: "absolute", bottom: 3, left: 17, fontSize: 16, fontWeight: "bold", color: "#262626", marginBottom: 8, lineHeight: 30 },
  buddyUpRow: { flexDirection: "row", justifyContent: "space-between" },
  buddyUpContainer: { width: width - 20, paddingRight: "25%", paddingBottom: 30, backgroundColor: "#FFFFFF33", borderRadius: 10 },
  buddyUpTitle: { fontSize: 20, marginLeft: 20, marginTop: 40, color: "#494949", fontWeight: "bold" },
  buddyUpSubtitle: { fontSize: 11, marginLeft: 20, width: width, paddingRight: 60, textAlign: "left", fontFamily: "Poppins-Regular" },
});

export default Analytics