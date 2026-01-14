import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

interface StressLevelItem {
  month: string;
  TMD: number;
}

interface BargraphProps {
  stressLevelGraph?: StressLevelItem[];
  selectedDateTo: string | Date;
}

const classifyTMD = (tmd?: number) => {
  if (!tmd || isNaN(tmd)) {
    return {
      mood: '',
      message:
        'Calculated from your latest Wellbeing Pulse survey results to help you spot patterns and manage stress better',
    };
  }

  const rounded = Math.round(Number(tmd));
  let mood: string;
  let message: string;

  if (rounded < 6) {
    mood = 'Stable Mood';
    message = 'Great job! Your mood is stable, keep up the positive vibes!';
  } else if (rounded >= 6 && rounded < 21) {
    mood = 'Mild Mood \nDisturbance';
    message = "You're doing well, but there's room to boost your mood even further. Keep it up!";
  } else if (rounded >= 21 && rounded <= 35) {
    mood = 'Moderate Mood \nDisturbance';
    message = 'Your mood is showing some disturbance. Try some stress-relief techniques to get back on track.';
  } else {
    mood = 'High Mood \nDisturbance';
    message = "It looks like you're experiencing high stress. Consider connecting with a consultant for support.";
  }

  return { mood, message };
};

const getMoodColor = (mood: string): string => {
  switch (mood) {
    case 'Stable Mood':
      return 'rgba(52, 168, 83, 0.3)'; // Green
    case 'Mild Mood \nDisturbance':
      return 'rgba(255, 193, 7, 0.3)'; // Yellow
    case 'Moderate Mood \nDisturbance':
      return 'rgba(220, 53, 69, 0.3)'; // Orange-red
    case 'High Mood \nDisturbance':
      return 'rgba(201, 24, 74, 0.3)'; // Red
    default:
      return 'rgba(108, 117, 125, 0.3)'; // Gray
  }
};

const Bargraph: React.FC<BargraphProps> = ({ stressLevelGraph = [], selectedDateTo }) => {
  const [stressLevel, setStressLevel] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [monthYearLabels, setMonthYearLabels] = useState<string[]>([]);

  const getLast6Months = () => {
    const months: string[] = [];
    const fullLabels: string[] = [];

    for (let i = 0; i < 6; i++) {
      const date = dayjs(selectedDateTo).subtract(i, 'month');
      const monthKey = date.format('MM-YYYY');
      const label = date.format('MMM YYYY');
      months.push(monthKey);
      fullLabels.push(label);
    }

    // Reverse to show oldest first → newest last
    return { months: months.reverse(), fullLabels: fullLabels.reverse() };
  };

  const transformData = () => {
    const { months, fullLabels } = getLast6Months();
    setMonthYearLabels(fullLabels);

    const dataMap: Record<string, number> = {};
    stressLevelGraph.forEach((item) => {
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

  return (
    <View style={styles.container}>
      <View style={styles.tableContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.headerRow]}>
              <View style={[styles.cell, styles.headerCell, styles.monthCell]}>
                <Text style={styles.headerCellText}>Month</Text>
              </View>
              <View style={[styles.cell, styles.headerCell, styles.moodCell]}>
                <Text style={styles.headerCellText}>Mood</Text>
              </View>
            </View>

            {monthYearLabels.map((label, index) => {
              const tmd = stressLevel[index];
              const { mood } = classifyTMD(tmd);

              return (
                <View key={index} style={styles.tableRow}>
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
                      <Text style={styles.moodText}>{mood || 'N/A'}</Text>
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
};

export default Bargraph;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  table: {
    marginHorizontal: 4,
    borderRadius: 8,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(233, 236, 239, 0.5)',
    backgroundColor: 'transparent',
  },
  headerRow: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cell: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  monthCell: {
    flex: 1.5,
    alignItems: 'flex-start',
  },
  moodCell: {
    flex: 2,
    alignItems: 'center',
  },
  headerCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCellText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  cellText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  moodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  moodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});