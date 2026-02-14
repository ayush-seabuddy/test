import { getAnalytics } from '@/src/apis/apiService'
import GlobalHeader from '@/src/components/GlobalHeader'
import { showToast } from '@/src/components/GlobalToast'
import Colors from '@/src/utils/Colors'
import { height, width } from '@/src/utils/helperFunctions'
import { BlurView } from 'expo-blur'
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
  interface GroupActivity {
    name: string;
    population: number;
  }

  interface StressLevel {
    month: string; 
    TMD: number;
  }

  const [groupActivities, setGroupActivities] = useState<GroupActivity[]>([]);
  const [stressLevelGraph, setStressLevelGraph] = useState<StressLevel[]>([]);
  const [data, setData] = useState<GroupActivity[]>([]);
  const [selectedDate, setSelectedDate] = useState(moment().subtract(6, "months"));
  const [selectedDateTo, setSelectedDateTo] = useState(moment());
  const moodType = {
    mood: "",
    message:
      t('analytics_description'),
  };


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

  const getanalyticsdata = async () => {
    try {
      const apiResponse = await getAnalytics({ fromMonth: selectedDate.format('MM-YYYY'), toMonth: selectedDateTo.format('MM-YYYY') });

      if (apiResponse.data) {
        setGroupActivities(apiResponse.data.groupActivities);
        setStressLevelGraph(apiResponse.data.stressLevelGraph);

      }
      if (apiResponse.success && apiResponse.status === 200) {
      }
      else {
        showToast.error(t('oops'), apiResponse.message);
      }
    }
    catch {
      showToast.error(t('oops'), t('somethingwentwrong'));
    }
  }

  useEffect(() => {
    getanalyticsdata();
  }, [])

  useEffect(() => {
    const colors = ['#B0DB02', '#FAFAD9', '#84A402'];
    const updatedActivities = groupActivities.map((activity, index) => ({
      ...activity,
      color: colors[index] || '#000',
    }))
    setData(updatedActivities);
  },
    [groupActivities])


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
  }, [groupActivities]);


  return (
    <View style={styles.root}>
      <GlobalHeader
        title={t("analytics")}
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
                    <Text style={styles.month}>{t('from')}</Text>
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
                    <Text style={styles.month}>{t('to')}</Text>
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
                    {t('stresslevels')}
                  </Text>
                  <Text style={styles.stressSubtitle}>
                    <Text style={styles.stressMood}>{moodType.mood}</Text> {" - " + moodType.message}
                  </Text>
                  <Bargraph stressLevelGraph={stressLevelGraph} selectedDateTo={selectedDateTo.toDate()} />
                </View>
                <GraphScreen />
              </View>
              {!data.every(item => item.population === 0) && (
                <View style={styles.buddyUpContainer}>
                  <Text style={styles.buddyUpTitle}>{t('buddyuplog')}</Text>
                  <Text style={styles.buddyUpSubtitle}>
                    {t('buddyuplog_description')}
                  </Text>
                  <PieChart
                    data={data}
                    width={width * 0.83}
                    height={100}
                    chartConfig={chartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft="0"
                    center={[0, 0]}
                    absolute
                  />
                </View>
              )}
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
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  wholePage: { flex: 1, padding: 10, marginTop: 4 },
  container: { backgroundColor: '#ededed', borderRadius: 20, padding: 16, marginVertical: 10 },
  chartContainer: { marginVertical: 5, backgroundColor: "#FFFFFF33", minHeight: height * 0.45, justifyContent: "center", alignItems: "center", borderRadius: 10 },
  chartTitle: { fontSize: 16, fontWeight: "bold", color: "#262626", marginBottom: 8, lineHeight: 30 },
  sleepStyle: { width: width * 0.45, height: width * 0.09, paddingLeft: 10 },
  sleepStyleBox: { width: width * 0.45, height: width * 0.2, paddingLeft: 10 },
  sleepRow: { flexDirection: "row" },
  sleepTitle: { marginTop: 20, fontSize: 16, fontWeight: "bold", color: "#262626", marginBottom: 8, lineHeight: 30 },
  headerIcon: { width: 18, height: 18, resizeMode: "contain" },
  container1: { width: "100%", padding: 20, borderRadius: 32, overflow: "hidden" },
  container1Blurred: { backgroundColor: "#ededed", width: "100%", padding: 20, borderRadius: 20, overflow: "hidden" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerRow: { flexDirection: "row", width: "100%" },
  monthNavigation: { width: "100%", flexDirection: "column", alignItems: "center" },
  monthNavigationContainer: { flexDirection: "column", alignItems: "center", justifyContent: "space-between", width: "50%" },
  month: { fontSize: 14, fontWeight: "600", color: "#333", marginHorizontal: 10 },
  monthRow: { flexDirection: "row", alignItems: "center" },
  arrow: { width: 18, height: 18, resizeMode: "contain" },
  progressButton: { position: "absolute", backgroundColor: "white", width: width * 0.09, height: width * 0.09, justifyContent: "center", alignItems: "center", borderRadius: 10, top: 20, right: 10 },
  lottieStyle: { width: width, height: height, position: "absolute" },
  flexColumnBetween: { flexDirection: "column", justifyContent: "space-between" },
  stressTitle: { marginLeft: 20, fontSize: 20, width: "100%", textAlign: "left", fontFamily: "WhyteInktrap-Bold", lineHeight: 30 },
  stressSubtitle: { fontSize: 11, marginLeft: 20, width: "100%", paddingRight: 20, textAlign: "left", fontFamily: "Poppins-Regular" },
  stressMood: { fontSize: 14, fontFamily: "whyteInktrap" },

  buddyUpRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: 'red' },
  buddyUpContainer: { backgroundColor: "#f5f5f5", borderRadius: 10, marginVertical: 10, padding: 16, },
  buddyUpTitle: { fontSize: 18, color: "#494949", fontFamily: 'Poppins-SemiBold', fontWeight: "bold" },
  buddyUpSubtitle: { fontSize: 12, fontFamily: "Poppins-Regular", marginTop: 10, },
});

export default Analytics;