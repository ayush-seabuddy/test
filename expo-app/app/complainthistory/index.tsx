import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import GlobalHeader from '@/src/components/GlobalHeader';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { getallcomplainthistory } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import { formatDate, formatStatus } from '@/src/utils/helperFunctions';
import CommonLoader from '@/src/components/CommonLoader';
import EmptyComponent from '@/src/components/EmptyComponent';
import { useNetwork } from '@/src/hooks/useNetworkStatusHook';

interface Complaint {
  id: string;
  status: string;
  adminResponse: string;
  createdAt: string;
  helpline: {
    helplineName: string;
  };
}

const ComplaintHistoryScreen = () => {
  const { t } = useTranslation();
  const isOnline = useNetwork();

  const [complaintdata, setComplaintData] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComplaints = async (pageNo: number) => {
    if (!isOnline || pageNo > totalPages) return;

    pageNo === 1 ? setLoading(true) : setLoadingMore(true);

    try {
      const res = await getallcomplainthistory({ page: pageNo, limit: 10 });

      if (res?.success && res?.status === 200) {
        setComplaintData(prev =>
          pageNo === 1
            ? res.data.allHelplineForms
            : [...prev, ...res.data.allHelplineForms]
        );
        setTotalPages(res.data.totalPages);
        setPage(pageNo);
      } else {
        showToast.error(t('oops'), res?.message);
      }
    } catch {
      showToast.error(t('oops'), t('somethingwentwrong'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchComplaints(1);
  }, [isOnline]);

  const loadMore = useCallback(() => {
    if (!loadingMore && page < totalPages) {
      fetchComplaints(page + 1);
    }
  }, [loadingMore, page, totalPages]);

  const renderItem = useCallback(
    ({ item }: { item: Complaint }) => (
      <TouchableOpacity
        style={styles.complaintHistoryView}
        onPress={() =>
          router.push({
            pathname: '/helplineform',
            params: {
              complaintId: item.id,
              complaintStatus: item.status,
              complaintResponse: item.adminResponse,
            },
          })
        }
      >
        <Text style={styles.helplineName}>
          {item?.helpline?.helplineName}
        </Text>

        <View style={styles.rowView}>
          <Text style={styles.helplineStatus}>
            {formatStatus(item.status)}
          </Text>
          <Text style={styles.helplineStatus}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  const ListFooter = useCallback(
    () => (loadingMore ? <CommonLoader /> : null),
    [loadingMore]
  );

  return (
    <View style={styles.main}>
      <GlobalHeader title={t('complaintHistory')} />

      {/* Center Loader while initial loading */}
      {loading ? (
        <View style={styles.loaderView}>
          <CommonLoader fullScreen/>
        </View>
      ) : complaintdata.length > 0 ? (
        <FlatList
          data={complaintdata}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={ListFooter}
        />
      ) : (
        <View style={styles.nodatafoundView}>
          <EmptyComponent
            text={
              isOnline
                ? t('nocomplaintHistoryFound')
                : t('nointernetconnection')
            }
          />
        </View>
      )}
    </View>
  );
};

export default ComplaintHistoryScreen;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  complaintHistoryView: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#ededed',
  },
  helplineName: {
    fontSize: 15,
    fontFamily: 'WhyteInktrap-Bold',
    lineHeight: 20,
  },
  rowView: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helplineStatus: {
    fontFamily: 'Poppins-SemiBold',
  },
  nodatafoundView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
