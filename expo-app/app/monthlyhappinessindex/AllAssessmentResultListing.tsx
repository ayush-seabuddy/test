import { getassessmentresponseList } from '@/src/apis/apiService';
import CommonLoader from '@/src/components/CommonLoader';
import EmptyComponent from '@/src/components/EmptyComponent';
import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import { useNetwork } from '@/src/hooks/useNetworkStatusHook';
import { Logger } from '@/src/utils/logger';
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


type AssessmentType = 'HAPPINESS' | 'POMS';

interface AssessmentItem {
    month: string;
    result: string;
}


const getScoreStyle = (score: number, type: AssessmentType) => {
    if (type === 'HAPPINESS') {
        if (score >= 75) return { bg: '#A9DFBF', text: '#145A32' };
        if (score >= 40) return { bg: '#F9E79F', text: '#7D6608' };
        return { bg: '#F5B7B1', text: '#78281F' };
    }

    if (score < 6) return { bg: '#A9DFBF', text: '#145A32' };
    if (score < 21) return { bg: '#F9E79F', text: '#7D6608' };
    if (score <= 35) return { bg: '#F5B7B1', text: '#78281F' };
    return { bg: '#E74C3C', text: '#fff' };
};

const AllAssessmentResultListing = () => {
    const { assessmentType = 'HAPPINESS' } = useLocalSearchParams<{
        assessmentType?: AssessmentType;
    }>();

    const router = useRouter();
    const isOnline = useNetwork();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [assessmentData, setAssessmentData] = useState<AssessmentItem[]>([]);

    const fetchAssessments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getassessmentresponseList({
                assessmentType,
            });

            if (res?.success && res?.status === 200) {
                setAssessmentData(res?.data ?? []);
            } else {
                showToast.error(t('oops'), res?.message);
                setAssessmentData([]);
            }
        } catch (err) {
            Logger.error(String(err));
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
        return [...assessmentData].sort((a, b) =>
            moment(b.month, 'MM-YYYY').diff(moment(a.month, 'MM-YYYY')),
        );
    }, [assessmentData]);

    const getScoreMeaning = (score: number) => {
        if (score >= 80) return t('monthlyhappinessindex_resultdescription.veryhappy');
        if (score >= 60) return t('monthlyhappinessindex_resultdescription.happy');
        if (score >= 40) return t('monthlyhappinessindex_resultdescription.moderate');
        if (score >= 20) return t('monthlyhappinessindex_resultdescription.low');
        return t('monthlyhappinessindex_resultdescription.verylow');
    };

    const classifyTMD = (tmd: number) => {
        if (isNaN(tmd)) {
            return { mood: t('nodata'), message: t('nomooddata') };
        }

        if (tmd < 6) return { mood: t('mood_stable'), message: t('mood_stable_message') };
        if (tmd < 21) return { mood: t('mood_mild'), message: t('mood_mild_message') };
        if (tmd <= 35) return { mood: t('mood_moderate'), message: t('mood_moderate_message') };
        return { mood: t('mood_high'), message: t('mood_high_message') };
    };

    const renderItem = ({ item }: { item: AssessmentItem }) => {
        const score = Number(item.result || 0);
        const formattedDate = moment(item.month, 'MM-YYYY').format('MMM YYYY');
        const { bg, text } = getScoreStyle(score, assessmentType);

        const info =
            assessmentType === 'HAPPINESS' ? (
                <Text style={styles.meaningText}>{getScoreMeaning(score)}</Text>
            ) : (
                (() => {
                    const { mood, message } = classifyTMD(score);
                    return (
                        <View style={styles.pomsRow}>
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
                        params: { month: item.month, assessmentType: assessmentType },
                    })
                }
            >
                <View style={styles.rowView}>
                    <Text style={styles.dateText}>{formattedDate}</Text>
                    <View style={[styles.scoreBadge, { backgroundColor: bg }]}>
                        <Text style={[styles.scoreText, { color: text }]}>
                            {t('score')}: {score}
                        </Text>
                    </View>
                </View>



                {info}
            </TouchableOpacity>
        );
    };

    const noDataMessage =
        assessmentType === 'POMS'
            ? t('nowellbeingdata')
            : t('nohappinessindexdata')

    return (
        <View style={styles.container}>
            <GlobalHeader
                title={
                    assessmentType === 'POMS'
                        ? t('monthlywellbeingpulse')
                        : t('monthlyhappinessindex')
                }
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <CommonLoader fullScreen />
                </View>
            ) : sortedData.length > 0 ? (
                <FlatList
                    data={sortedData}
                    keyExtractor={(item) => item.month}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <EmptyComponent
                        text={isOnline ? noDataMessage : t('nointernetconnection')}
                    />
                </View>
            )}
        </View>
    );

};

export default AllAssessmentResultListing;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: 16 },
    rowView: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    card: {
        backgroundColor: 'rgba(180,180,180,0.4)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    dateText: {
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold',
        marginBottom: 6,
    },
    scoreBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginBottom: 6,
    },
    scoreText: { fontSize: 14, fontWeight: '600' },
    meaningText: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        color: '#333',
    },
    moodText: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
    },
    messageText: {
        fontSize: 12.5,
        fontFamily: 'Poppins-Regular',
        marginTop: 4,
    },
    pomsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    rightIcon: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
    },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
