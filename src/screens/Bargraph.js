import moment from "moment";
import React, { useEffect, useState } from "react";
import { Dimensions, ScrollView, View, Text, StyleSheet } from "react-native";

export default function Bargraph({ stressLevelGraph, selectedDateTo }) {
  const [stressLevel, setStressLevel] = useState([0, 0, 0, 0, 0, 0]);
  const [monthYearLabels, setMonthYearLabels] = useState([]);

  const getLast6Months = () => {
    const months = [];
    const fullLabels = [];
    for (let i = 0; i < 6; i++) {
      const date = moment(selectedDateTo).subtract(i, "months");
      const zeroBasedMonth = date.month().toString().padStart(2, "0");
      const year = date.format("YYYY");
      months.push(`${zeroBasedMonth}-${year}`);
      fullLabels.push(date.format("MMM YYYY"));
    }
    return { months, fullLabels };
  };

  function classifyTMD(tmd) {
    if (!tmd || isNaN(tmd)) {
      return {
        mood: "",
        message: "Calculated from your latest Wellbeing Pulse survey results to help you spot patterns and manage stress better",
      };
    }

    tmd = Math.round(Number(tmd));
    let mood, message;

    if (tmd < 6) {
      mood = "Stable Mood";
      message = "Great job! Your mood is stable, keep up the positive vibes!";
    } else if (tmd >= 6 && tmd < 21) {
      mood = "Mild Mood \nDisturbance";
      message = "You're doing well, but there's room to boost your mood even further. Keep it up!";
    } else if (tmd >= 21 && tmd <= 35) {
      mood = "Moderate Mood \nDisturbance";
      message = "Your mood is showing some disturbance. Try some stress-relief techniques to get back on track.";
    } else {
      mood = "High Mood \nDisturbance";
      message = "It looks like you're experiencing high stress. Consider connecting with a consultant for support.";
    }

    return { mood, message };
  }

  const transformData = () => {
    const { months, fullLabels } = getLast6Months();
    setMonthYearLabels(fullLabels);

    const dataMap = {};
    stressLevelGraph?.forEach((item) => {
      dataMap[item.month] = item.TMD;
    });

    const finalData = months.map((monthKey) => dataMap[monthKey] ?? 0);
    return finalData;
  };

  useEffect(() => {
    if (selectedDateTo && stressLevelGraph) {
      const transformed = transformData();
      setStressLevel(transformed);
    }
  }, [stressLevelGraph, selectedDateTo]);

  const getMoodColor = (mood) => {
    switch (mood) {
      case "Stable Mood":
        return "rgba(52, 168, 83, 0.3)"; // Green with transparency
      case "Mild Mood \nDisturbance":
        return "rgba(255, 193, 7, 0.3)"; // Yellow with transparency
      case "Moderate Mood \nDisturbance":
        return "rgba(220, 53, 69, 0.3)"; // Orange-red with transparency
      case "High Mood \nDisturbance":
        return "rgba(201, 24, 74, 0.3)"; // Red with transparency
      default:
        return "rgba(108, 117, 125, 0.3)"; // Gray with transparency
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tableContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            {/* Header Row */}
            <View style={[styles.tableRow, styles.headerRow]}>
              <View style={[styles.cell, styles.headerCell, styles.monthCell]}>
                <Text style={styles.headerCellText}>Month</Text>
              </View>
              <View style={[styles.cell, styles.headerCell, styles.moodCell]}>
                <Text style={styles.headerCellText}>Mood</Text>
              </View>
            </View>
            {/* Data Rows */}
            {monthYearLabels.map((label, index) => {
              const tmd = stressLevel[index];
              const { mood } = classifyTMD(tmd);
              return (
                <View
                  key={index}
                  style={[styles.tableRow]}
                >
                  <View style={[styles.cell, styles.monthCell]}>
                    <Text style={styles.cellText}>{label}</Text>
                  </View>
                  <View style={[styles.cell, styles.moodCell]}>
                    <View
                      style={[
                        styles.moodBadge,
                        { backgroundColor: getMoodColor(mood) },
                      ]}
                    >
                      <Text style={styles.moodText}>{mood || "N/A"}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  tableContainer: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 12,
    marginHorizontal: 16,

    marginTop: 12,
    marginBottom: 20,
  },
  tableHeader: {
    backgroundColor: "rgba(248, 249, 250, 0.3)", // Semi-transparent header
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  table: {
    marginHorizontal: 4,
    borderRadius: 8,
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(233, 236, 239, 0.5)", // Semi-transparent border
    backgroundColor: "transparent",
  },
  headerRow: {
    backgroundColor: "transparent",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cell: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  monthCell: {
    flex: 1.5, // Wider for month to accommodate "MMM YYYY"
    alignItems: "flex-start", // Left-align month text
  },
  moodCell: {
    flex: 2, // Wider for mood badge
    alignItems: "center", // Center-align mood badge
  },
  headerCell: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerCellText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333", // Darker color for contrast
    textAlign: "center",
  },
  cellText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    textAlign: "left", // Left-align month text
  },
  moodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)", // Subtle border for definition
  },
  moodText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333", // Darker text for readability
    textAlign: "center",
  },
});