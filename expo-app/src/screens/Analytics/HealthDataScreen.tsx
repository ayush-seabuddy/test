import CommonLoader from '@/src/components/CommonLoader';
import { Logger } from '@/src/utils/logger';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import {
  getSdkStatus,
  initialize,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

interface SleepSessionRecord {
  startTime: string;
  endTime: string;
  // Other fields may exist, but we only need these
}

interface DailySleepData {
  date: string; // e.g., "Mon Dec 25"
  durationHours: number;
}

const HealthDataScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sleepData, setSleepData] = useState<DailySleepData[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  // Only run on Android
  useEffect(() => {
    if (Platform.OS !== 'android') {
      setIsLoading(false);
      return;
    }

    initializeHealthConnect();
  }, []);

  const initializeHealthConnect = async () => {
    try {
      setIsLoading(true);
      await initialize();
      const status = await getSdkStatus();
      if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        Alert.alert(
          'Health Connect Not Available',
          'Please install or update Health Connect from the Play Store.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      // Request read permission for SleepSession
      const grantedPermissions = await requestPermission([
        { accessType: 'read', recordType: 'SleepSession' },
      ]);

      if (grantedPermissions.length > 0) {
        setHasPermission(true);
        await fetchLast7DaysSleep();
      } else {
        Alert.alert(
          'Permission Required',
          'Sleep data access was denied. Please grant permission in Settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Logger.error('Health Connect initialization failed:', {Error:String(error)});
      Alert.alert('Error', 'Failed to connect to Health Connect.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLast7DaysSleep = async () => {
    try {
      setIsLoading(true);
      const dailyData: DailySleepData[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = dayjs().subtract(i, 'day');
        const startOfDay = date.startOf('day').toISOString();
        const endOfDay = date.endOf('day').toISOString();

        const timeRangeFilter = {
          operator: 'between' as const,
          startTime: startOfDay,
          endTime: endOfDay,
        };

        const result = await readRecords('SleepSession', { timeRangeFilter });
        const records: SleepSessionRecord[] = result.records || [];

        // Calculate total sleep duration in hours
        const totalHours = records.reduce((total, session) => {
          const start = new Date(session.startTime);
          const end = new Date(session.endTime);
          return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }, 0);

        dailyData.push({
          date: date.format('MMM D'),
          durationHours: Number(totalHours.toFixed(1)),
        });
      }

      setSleepData(dailyData);
    } catch (error) {
      Logger.error('Failed to fetch sleep data:', {Error:String(error)});
      Alert.alert('Error', 'Could not retrieve sleep data.');
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = {
    labels: sleepData.map((d) => d.date),
    datasets: [
      {
        data: sleepData.map((d) => d.durationHours),
        color: (opacity = 1) => `rgba(6, 78, 59, ${opacity})`, // Dark green
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#f0fdf4',
    backgroundGradientTo: '#dcfce7',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(6, 78, 59, ${opacity})`,
    labelColor: () => '#374151',
    style: { borderRadius: 16 },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#059669',
    },
    propsForLabels: {
      fontSize: 11,
    },
  };

  const screenWidth = Dimensions.get('window').width;

  if (Platform.OS !== 'android') {
    return (
      <View style={styles.container}>
        <Text style={styles.platformText}>
          Health Connect sleep tracking is only available on Android.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <CommonLoader containerStyle={styles.loader} />
      )}

      {!isLoading && sleepData.length > 0 && sleepData.some((d) => d.durationHours > 0) ? (
        <View style={styles.chartWrapper}>
          <Text style={styles.title}>Sleep Duration (Last 7 Days)</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={240}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            verticalLabelRotation={0}
            horizontalLabelRotation={-30}
            withHorizontalLines={true}
            withVerticalLines={false}
            segments={4}
            yAxisSuffix="h"
            formatYLabel={(value) => `${value}h`}
          />
        </View>
      ) : !isLoading ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            {hasPermission
              ? 'No sleep data recorded in the last 7 days'
              : 'Grant permission to view your sleep data'}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    zIndex: 10,
  },
  chartWrapper: {
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065f46',
    textAlign: 'center',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    alignSelf: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 24,
  },
  platformText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default HealthDataScreen;