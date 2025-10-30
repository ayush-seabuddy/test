import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  initialize,
  getSdkStatus,
  requestPermission,
  getGrantedPermissions,
  readRecords,
  SdkAvailabilityStatus,
} from "react-native-health-connect";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const HealthDataScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState([]);
  const [sleepData, setSleepData] = useState([]);

  // Initialize Health Connect and check permissions
  const setupHealthConnect = async () => {
    try {
      setIsLoading(true);
      await initialize();
      const status = await getSdkStatus();
      if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        console.error("Health Connect unavailable. Please install/update it.");
        return;
      }
      await requestPermission([{ accessType: "read", recordType: "SleepSession" }]);
      const granted = await getGrantedPermissions();
      setPermissionsGranted(granted);
      if (granted.length > 0) {
        await fetchDailySleepData(7);
      }
    } catch (error) {
      console.error("Health Connect setup failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sleep data for a specific day
  const fetchSleepDataForDate = async (date) => {
    try {
      setIsLoading(true);
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const timeRangeFilter = {
        operator: "between",
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      };

      const result = await readRecords("SleepSession", { timeRangeFilter });
      console.log(`Sleep Data for ${start.toDateString()}:`, result.records); // Log raw sleep data

      return {
        date: start.toDateString(),
        data: result.records || [],
      };
    } catch (error) {
      console.error("Data fetch failed:", error);
      return { date: date.toDateString(), data: [] };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sleep data for multiple days
  const fetchDailySleepData = async (days) => {
    try {
      setIsLoading(true);
      const allSleepData = [];
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const sleepEntry = await fetchSleepDataForDate(date);
        allSleepData.push(sleepEntry);
      }
      setSleepData(allSleepData);
      console.log("Processed Sleep Data:", allSleepData); // Log processed sleep data
    } catch (error) {
      console.error("Failed to fetch daily sleep data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare data for the chart
  const prepareChartData = () => {
    const labels = sleepData.map((entry) => {
      const date = new Date(entry.date);
      return `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}`;
    });
    const durations = sleepData.map((entry) =>
      entry.data.reduce(
        (total, session) =>
          total +
          (new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60 * 60),
        0
      )
    );

    return {
      labels,
      datasets: [{ data: durations }],
    };
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: "rgba(180, 180, 180, 0.3)",
    backgroundGradientTo: "rgba(180, 180, 180, 0.3)",
    color: (opacity = 1) => `rgba(6, 54, 31, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicator size="large" style={styles.loader} />}
      {sleepData.length > 0 ? (
        <LineChart
          data={prepareChartData()}
          width={Dimensions.get("window").width - 20}
          height={200}
          chartConfig={chartConfig}
          bezier
          verticalLabelRotation={0}
          horizontalLabelRotation={-45}
          style={styles.chart}
        />
      ) : (
        <View style={{backgroundColor:'rgba(180, 180, 180, 0.2)',borderRadius:5,justifyContent:'center',alignItems:'center',paddingVertical:10}}>
        <Text style={styles.noDataText}>No Sleep Data Available Yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
    zIndex: 1000,
  },
  chart: {
    borderRadius: 10,
  },
  noDataText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#262626",
    textAlign: "center",
  },
});

export default HealthDataScreen;