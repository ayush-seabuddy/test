import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getDataUsage } from '@/src/apis/apiService';
import CommonLoader from '@/src/components/CommonLoader';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Logger } from '@/src/utils/logger';

const GraphScreen: React.FC = () => {
  const [dataUsed, setDataUsed] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const { t } = useTranslation();

  const fetchDataUsage = async () => {
    try {
      setLoading(true);
      const dbResult = await AsyncStorage.getItem('userDetails');
      if (!dbResult) return;

      const monthParam = selectedDate.format('YYYY-MM');

      const response = await getDataUsage({ month: monthParam });

      if (response?.status === 200) {
        setDataUsed(response.data?.dataUsed?.toString() ?? '0');
      } else {
        setDataUsed('0');
      }
    } catch (error) {
      Logger.error('Error fetching data usage:', {Error:String(error)});
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
      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={() => handleMonthChange(-1)}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.monthText}>
          {selectedDate.format('MMM YYYY')}
        </Text>

        <TouchableOpacity
          onPress={() => handleMonthChange(1)}
          disabled={isCurrentMonth}
        >
          <ChevronRight
            size={24}
            color={isCurrentMonth ? '#ccc' : '#333'}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <CommonLoader fullScreen/>
      ) : (
        <View style={styles.dataUsageContainer}>
          <Text style={styles.dataUsageText}>
            {dataUsed} MB
          </Text>
          <Text style={styles.labelText}>
            {t('monthlydatausage')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingHorizontal: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 300,
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  dataUsageContainer: {
    alignItems: 'center',
  },
  dataUsageText: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#262626',
  },
});

export default GraphScreen;