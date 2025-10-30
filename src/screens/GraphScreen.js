import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../Api";
import moment from "moment";

const GraphScreen = () => {
  const [data, setData] = useState("0");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(moment());

  const allDoctorsList = async () => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    try {
      setLoading(true);
      const response = await apiCallWithToken(
        `${apiServerUrl}/user/getDataUsage?month=${selectedDate.format(
          "YYYY-MM"
        )}`,
        "GET",
        null,
        userDetails.authToken
      );
      if (response.responseCode === 200) {
        setData(response?.result?.dataUsed);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allDoctorsList();
  }, [selectedDate]);

  const handleMonthChange = (increment) => {
    setSelectedDate((prev) => moment(prev).add(increment, "months"));
  };

  const isCurrentMonth = selectedDate.isSame(moment(), "month");

  return (
    <View style={styles.container}>
      <View
        style={[styles.monthNavigation, { justifyContent: "space-between" }]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => handleMonthChange(-1)}>
            <Image
              style={styles.arrow}
              source={require("../assets/images/AnalyticsImage/LeftArrow.png")}
            />
          </TouchableOpacity>
          <Text style={styles.month}>{selectedDate.format("MMM YYYY")}</Text>
          {!isCurrentMonth && (
            <TouchableOpacity onPress={() => handleMonthChange(1)}>
              <Image
                style={styles.arrow}
                source={require("../assets/images/AnalyticsImage/RightArrow.png")}
              />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.monthTest}>
          {/* Data Uses:{" "} */} {data ? data : "0"}
          <Text style={styles.monthTestt}> MB</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    height: "100%",
    width: "100%",
  },
  monthNavigation: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
  },
  month: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 10,
  },
  monthTest: {
    fontSize: 28,
    fontWeight: "400",
    color: "#333",
    marginHorizontal: 10,
    marginVertical: 30,
  },
  monthTestt: {
    fontSize: 20,
    fontWeight: "400",
    color: "#333",
    marginHorizontal: 10,
  },
  arrow: {
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  chart: { borderRadius: 8 },
});

export default GraphScreen;
