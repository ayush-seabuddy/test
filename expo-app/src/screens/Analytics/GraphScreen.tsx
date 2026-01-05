import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { getDataUsage } from '@/src/apis/apiService';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

// Optional: placeholder data if API fails or for preview
const placeholderChartData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      data: [20, 45, 28, 80],
      color: (opacity = 1) => `rgba(52, 168, 83, ${opacity})`, // Green line
      strokeWidth: 3,
    },
  ],
};

const screenWidth = Dimensions.get('window').width;

const GraphScreen: React.FC = () => {
  const [dataUsed, setDataUsed] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());

  const fetchDataUsage = async () => {
    try {
      setLoading(true);
      const dbResult = await AsyncStorage.getItem('userDetails');
      if (!dbResult) {
        console.log('No user details found');
        return;
      }

      const userDetails = JSON.parse(dbResult);
      const monthParam = selectedDate.format('YYYY-MM');

      const response = await getDataUsage({month: monthParam});

      if (response?.status === 200) {
        setDataUsed(response?.data?.dataUsed?.toString() || '0');
      } else {
        setDataUsed('0');
      }
    } catch (error) {
      console.error('Error fetching data usage:', error);
      setDataUsed('0');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataUsage();
  }, [selectedDate]);

  const handleMonthChange = (increment: number) => {
    setSelectedDate((prev) => prev.add(increment, 'month'));
  };

  const isCurrentMonth = selectedDate.isSame(dayjs(), 'month');

  return (
    <View style={styles.container}>
      {/* Month Navigation & Data Usage */}
      <View style={styles.headerSection}>
        <View style={styles.monthNavigation}>
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={() => handleMonthChange(-1)}>
              <ChevronLeft size={20} /> 
            </TouchableOpacity>

            <Text style={styles.monthText}>
              {selectedDate.format('MMM YYYY')}
            </Text>

            {!isCurrentMonth && (
              <TouchableOpacity onPress={() => handleMonthChange(1)}>
                <ChevronRight size={20} /> 
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#333" />
          ) : (
            <View style={styles.dataUsageContainer}>
              <Text style={styles.dataUsageText}>{dataUsed || '0'}</Text>
              <Text style={styles.dataUsageUnit}> MB</Text>
            </View>
          )}
        </View>
      </View>

      {/* Line Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Monthly Data Usage Trend</Text>
        {/* <LineChart
          data={placeholderChartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#f8f9fa',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(52, 168, 83, ${opacity})`,
            labelColor: () => `#333`,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#34a853',
            },
          }}
          bezier
          style={styles.chart}
          withHorizontalLines={true}
          withVerticalLines={false}
          segments={4}
        /> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  headerSection: {
    paddingHorizontal: 20,
  },
  monthNavigation: {
    width: '100%',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
  },
  arrow: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  dataUsageContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  dataUsageText: {
    fontSize: 36,
    fontWeight: '400',
    color: '#333',
  },
  dataUsageUnit: {
    fontSize: 24,
    fontWeight: '400',
    color: '#333',
    marginLeft: 4,
  },
  chartContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
});

export default GraphScreen;