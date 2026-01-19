import { getassessmentresponseList } from '@/src/apis/apiService';
import CommonLoader from '@/src/components/CommonLoader';
import EmptyComponent from '@/src/components/EmptyComponent';
import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import { useNetwork } from '@/src/hooks/useNetworkStatusHook';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowUpRight } from 'lucide-react-native';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const getScoreStyle = (
    score: number,
    assessmentType: 'HAPPINESS' | 'POMS'
) => {
    if (assessmentType === 'HAPPINESS') {
        if (score >= 75) return { bg: '#A9DFBF', text: '#145A32' };
        if (score >= 40) return { bg: '#F9E79F', text: '#7D6608' };
        return { bg: '#F5B7B1', text: '#78281F' };
    } else {
        if (score < 6) return { bg: '#A9DFBF', text: '#145A32' };
        if (score < 21) return { bg: '#F9E79F', text: '#7D6608' };
        if (score <= 35) return { bg: '#F5B7B1', text: '#78281F' };
        return { bg: '#E74C3C', text: '#fff' };
    }
};

const AllAssessmentResultListing = () => {
    const { assessmentType = 'HAPPINESS' } = useLocalSearchParams();
    const router = useRouter();
    const isOnline = useNetwork();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [assessmentData, setAssessmentData] = useState<any[]>([]);

    const fetchAssessments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getassessmentresponseList({
                assessmentType: assessmentType as string,
            });

            if (res.success && res.status === 200) {
                setAssessmentData(res.data?.assessmentList || []);
            } else {
                showToast.error(t('oops'), res.message);
                setAssessmentData([]);
            }
        } catch {
            showToast.error(t('oops'), t('somethingwentwrong'));
            setAssessmentData([]);
        } finally {
            setLoading(false);
        }
    }, [assessmentType, t]);

    useEffect(() => {
        fetchAssessments();
    }, [fetchAssessments]);

    const sortedData = useMemo(() => {
        return [...assessmentData]
            .filter(item => item.questionType === assessmentType)
            .sort((a, b) => b.month.localeCompare(a.month));
    }, [assessmentData, assessmentType]);

    const title =
        assessmentType === 'POMS'
            ? t('monthlywellbeingpulse')
            : t('monthlyhappinessindex');

    const noDataMessage =
        assessmentType === 'POMS'
            ? t('nowellbeingdata')
            : t('nohappinessindexdata');

    const classifyTMD = useCallback(
        (tmd: number) => {
            if (!tmd || isNaN(tmd)) {
                return { mood: 'No Data', message: 'No mood data available.' };
            }

            tmd = Math.round(tmd);
            if (tmd < 6) return { mood: t('mood_stable'), message: t('mood_stable_message') };
            if (tmd < 21) return { mood: t('mood_mild'), message: t('mood_mild_message') };
            if (tmd <= 35) return { mood: t('mood_moderate'), message: t('mood_moderate_message') };
            return { mood: t('mood_high'), message: t('mood_high_message') };
        },
        [t]
    );

    const renderItem = useCallback(
        ({ item }: { item: any }) => {
            const score = Number(item?.questionsAndAnswers?.[0]?.result ?? 0);
            const formattedDate = moment(item.month, 'MM-YYYY').format('MMM YYYY');
            const { bg, text } = getScoreStyle(
                score,
                assessmentType as 'HAPPINESS' | 'POMS'
            );

            const infoContent =
                assessmentType === 'HAPPINESS' ? (
                    <Text style={styles.meaningText}>
                        {score >= 80
                            ? t('monthlyhappinessindex_resultdescription.veryhappy')
                            : score >= 60
                                ? t('monthlyhappinessindex_resultdescription.happy')
                                : score >= 40
                                    ? t('monthlyhappinessindex_resultdescription.moderate')
                                    : score >= 20
                                        ? t('monthlyhappinessindex_resultdescription.low')
                                        : t('monthlyhappinessindex_resultdescription.verylow')}
                    </Text>
                ) : (
                    (() => {
                        const { mood, message } = classifyTMD(score);
                        return (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: '90%' }}>
                                    <Text style={styles.moodText}>{mood}</Text>
                                    <Text style={styles.messageText}>{message}</Text>
                                </View>
                                <View style={styles.rightIcon}>
                                    <ArrowUpRight size={16} color="#666" />
                                </View>
                            </View>
                        );
                    })()
                );

            return (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() =>
                        router.push({
                            pathname:
                                assessmentType === 'POMS'
                                    ? '/monthlywellbeingpulse/MonthlyWellbeingPulseResultScreen'
                                    : '/monthlyhappinessindex/MonthlyHappinessIndexResultScreen',
                            params: { assessmentData: JSON.stringify(item) },
                        })
                    }
                >
                    <View style={styles.cardContent}>
                        <View style={styles.leftSection}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.dateText}>{formattedDate}</Text>
                                <View style={[styles.scoreBadge, { backgroundColor: bg }]}>
                                    <Text style={[styles.scoreText, { color: text }]}>
                                        {t('score')}: {score}
                                    </Text>
                                </View>
                            </View>
                            {infoContent}
                        </View>
                    </View>
                </TouchableOpacity>
            );
        },
        [assessmentType, classifyTMD, router, t]
    );

    return (
        <View style={styles.container}>
            {/* HEADER ALWAYS VISIBLE */}
            <GlobalHeader title={title} />

            {/* CENTER LOADER */}
            {loading ? (
                <View style={styles.loaderWrapper}>
                    <CommonLoader fullScreen />
                </View>
            ) : sortedData.length > 0 ? (
                <FlatList
                    data={sortedData}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <EmptyComponent
                        text={
                            isOnline ? noDataMessage : t('nointernetconnection')
                        }
                    />
                </View>
            )}
        </View>
    );
};

export default AllAssessmentResultListing;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    nodatafoundImage: {
        height: 150,
        width: 150,
        marginBottom: 20,
    },
    loaderWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    card: {
        backgroundColor: 'rgba(180, 180, 180, 0.4)',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftSection: {
        flex: 1,
        paddingRight: 10,
    },
    dateText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        fontFamily: 'Poppins-SemiBold',
    },
    scoreBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 5,
        marginVertical: 4,
    },
    scoreText: {
        fontWeight: '600',
        fontSize: 14,
    },
    meaningText: {
        fontSize: 13,
        color: '#333',
        fontFamily: 'Poppins-Regular',
        lineHeight: 18,
        marginTop: 4,
    },
    moodText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        fontFamily: 'Poppins-SemiBold',
    },
    messageText: {
        fontSize: 12.5,
        width: '90%',
        color: '#444',
        fontFamily: 'Poppins-Regular',
        marginTop: 4,
        lineHeight: 17,
    },
    rightIcon: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
        lineHeight: 22,
    }
});