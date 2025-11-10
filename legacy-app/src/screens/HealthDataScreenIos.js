import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import HealthKit, { HKUnit, HKQuantityTypeIdentifier, HKInsulinDeliveryReason, HKCategoryTypeIdentifier } from '@kingstinct/react-native-healthkit';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';





const HealthDataScreenIos = ({ GraphData }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [sleepData, setSleepData] = useState(GraphData);

    useState(() => {
        setSleepData(GraphData)
    }, [GraphData])


    // const PERMISSIONS = {
    //     permissions: {
    //         read: [
    //             AppleHealthKit.Constants.Permissions.SleepAnalysis,
    //             AppleHealthKit.Constants.Permissions.Steps,
    //             AppleHealthKit.Constants.Permissions.HeartRate,
    //         ],
    //         write: [AppleHealthKit.Constants.Permissions.SleepAnalysis],
    //     },
    // };

    // // Initialize HealthKit and request permissions
    // const initializeHealthKit = async () => {
    //     try {
    //         const isAvailable = await HealthKit.isHealthDataAvailable();
    //         if (!isAvailable) {
    //             console.error('HealthKit is not available on this device');
    //             return;
    //         }

    //         setIsLoading(true);
    //         const permissions = {
    //             read: new Set([HKCategoryTypeIdentifier.sleepAnalysis]), // Convert array to Set
    //         };

    //         console.log("permissions", permissions);

    //         const result = await HealthKit.requestAuthorization(permissions);
    //         console.log("result", result);
    //         if (result) {
    //             console.log('HealthKit permissions granted');
    //         } else {
    //             console.error('HealthKit permissions denied');
    //         }
    //     } catch (error) {
    //         console.error('HealthKit initialization failed:', error);
    //         Alert.alert('Error', 'Failed to initialize HealthKit. Please ensure HealthKit is enabled and try again.');
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // // Fetch sleep data for a specific day
    // const fetchSleepDataForDate = async (date) => {
    //     try {
    //         setIsLoading(true);
    //         const start = new Date(date);
    //         start.setHours(0, 0, 0, 0);

    //         const end = new Date(date);
    //         end.setHours(23, 59, 59, 999);

    //         const options = {
    //             startDate: start.toISOString(),
    //             endDate: end.toISOString(),
    //             type: HKCategoryTypeIdentifier.sleepAnalysis,
    //         };

    //         const result = await HealthKit.queryCategorySamples(options);
    //         console.log('Fetched sleep data for date:', result);

    //         if (result.length > 0) {
    //             return {
    //                 date: start.toDateString(),
    //                 data: result,
    //             };
    //         }
    //         return { date: start.toDateString(), data: [] };
    //     } catch (error) {
    //         console.error('Sleep data fetch failed:', error);
    //         return { date: date.toDateString(), data: [] };
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // // Fetch sleep data for multiple days
    // const fetchDailySleepData = async (days) => {
    //     try {
    //         setIsLoading(true);
    //         let allSleepData = [];
    //         for (let i = 0; i < days; i++) {
    //             const date = new Date();
    //             date.setDate(date.getDate() - i);
    //             const sleepEntry = await fetchSleepDataForDate(date);
    //             allSleepData.push(sleepEntry);
    //         }
    //         setSleepData(allSleepData);
    //         console.log('Fetched sleep data:', allSleepData);
    //     } catch (error) {
    //         console.error('Failed to fetch daily sleep data:', error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // // Run initialization and fetch data when component mounts
    // useEffect(() => {
    //     const setupHealthKit = async () => {
    //         await initializeHealthKit();
    //         await fetchDailySleepData(7);
    //     };
    //     setupHealthKit();
    // }, []);

    // Prepare data for the chart
    const prepareChartData = () => {
        const labels = GraphData.map((entry) => {
            const date = new Date(entry.date);
            return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`;
        });

        const durations = GraphData.map((entry) =>
            parseFloat(entry.hours) || 0 // Convert string to number, default to 0 if invalid
        );

      

        return {
            labels,
            datasets: [{ data: durations }],
        };
    };



    const chartConfig = {
        backgroundGradientFrom: 'rgba(180, 180, 180, 0.3)',
        backgroundGradientTo: 'rgba(180, 180, 180, 0.3)',
        color: (opacity = 1) => `rgba(6, 54, 31, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
    };

    return (
        <View style={styles.container}>
            {isLoading && <ActivityIndicator size="large" style={styles.loader} />}
            {GraphData.length > 0 ? (
                <LineChart
                    data={prepareChartData()}
                    width={Dimensions.get('window').width - 20}
                    height={200}
                    chartConfig={chartConfig}
                    bezier
                    verticalLabelRotation={0}
                    horizontalLabelRotation={-45}
                    style={styles.chart}
                />
            ) : (
                <Text style={styles.noDataText}>No sleep data found</Text>
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
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -25 }, { translateY: -25 }],
        zIndex: 1000,
    },
    chart: {
        borderRadius: 10,
    },
    noDataText: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default HealthDataScreenIos;