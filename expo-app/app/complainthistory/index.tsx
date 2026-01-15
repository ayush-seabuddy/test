import { FlatList, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import GlobalHeader from '@/src/components/GlobalHeader'
import { useTranslation } from 'react-i18next'
import { router } from 'expo-router'
import { getallcomplainthistory } from '@/src/apis/apiService'
import { showToast } from '@/src/components/GlobalToast'
import { formatDate, formatStatus } from '@/src/utils/helperFunctions'
import CommonLoader from '@/src/components/CommonLoader'
import EmptyComponent from '@/src/components/EmptyComponent'

interface Complaint {
    id: string,
    status: string,
    adminResponse: string,
    createdAt: string,
    helpline: {
        helplineName: string,
    }
}

const ComplaintHistoryScreen = () => {
    const { t } = useTranslation();

    const [complaintdata, setcomplaintdata] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchComplaints = async (pageNo: number) => {
        if (pageNo > totalPages) return;

        pageNo === 1 ? setLoading(true) : setLoadingMore(true);

        try {
            const res = await getallcomplainthistory({ page: pageNo, limit: 10 });

            if (res?.success && res?.status == 200) {

                setcomplaintdata(prev =>
                    pageNo === 1 ? res.data.allHelplineForms : [...prev, ...res.data.allHelplineForms]
                );

                setTotalPages(res.data.totalPages);
                setPage(pageNo);
            }
            else {
                showToast.error(t('oops'), res?.message);
            }
        } catch {
            showToast.error(t('oops'), t('somethingwentwrong'));
        }

        setLoading(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        fetchComplaints(1);
    }, []);

    const loadMore = () => {
        if (!loadingMore && page < totalPages) {
            fetchComplaints(page + 1);
        }
    };

    const ListFooter = () =>
        loadingMore ? (
            <CommonLoader />
        ) : null;

    if (loading) return (
        <View style={styles.loaderView}>
            <CommonLoader fullScreen />
        </View>
    );

    return (
        <View style={styles.main}>
            <GlobalHeader
                title={t('complaintHistory')}
            />

            {complaintdata && complaintdata.length > 0 ? (
                <FlatList
                    data={complaintdata}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.complaintHistoryView}
                            onPress={() => {
                                router.push({
                                    pathname: '/helplineform',
                                    params: {
                                        complaintId: item.id,
                                        complaintStatus: item.status,
                                        complaintResponse: item.adminResponse
                                    },
                                });
                            }}
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
                    )}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.2}
                    ListFooterComponent={<ListFooter />}
                />
            ) : (
                <View style={styles.nodatafoundView}>
                    <EmptyComponent text={t('nocomplaintHistoryFound')} />
                </View>
            )}

        </View>
    );
};

export default ComplaintHistoryScreen;

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: '#fff' },
    loaderView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    complaintHistoryView: {
        marginHorizontal: 16,
        marginTop: 10,
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#ededed'
    },
    helplineName: { fontSize: 15, fontFamily: 'WhyteInktrap-Bold', lineHeight: 20 },
    rowView: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: 'center'
    },
    nodatafoundView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold'
    },
    nodatafoundImage: {
        height: 100,
        width: 100,
    },
    helplineStatus: { fontFamily: 'Poppins-SemiBold' }
});
