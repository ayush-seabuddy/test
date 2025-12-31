import { getassessmentresponseList } from '@/src/apis/apiService';
import CustomLottie from '@/src/components/CustomLottie';
import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ArrowUpRight } from 'lucide-react-native';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

const getScoreStyle = (score: number, assessmentType: 'HAPPINESS' | 'POMS') => {
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
    const [loading, setLoading] = useState(true);
    const [assessmentData, setAssessmentData] = useState<any[]>([]);
    const router = useRouter();
    const { t } = useTranslation();

    const getScoreMeaning = (score: number) => {
        if (score >= 80) return t('monthlyhappinessindex_resultdescription.veryhappy');
        if (score >= 60) return t('monthlyhappinessindex_resultdescription.happy');
        if (score >= 40) return t('monthlyhappinessindex_resultdescription.moderate');
        if (score >= 20) return t('monthlyhappinessindex_resultdescription.low');
        return t('monthlyhappinessindex_resultdescription.verylow');
    };

    const classifyTMD = (tmd: number) => {
        if (!tmd || isNaN(tmd)) {
            return { mood: 'No Data', message: 'No mood data available.' };
        }

        tmd = Math.round(tmd);
        if (tmd < 6) {
            return { mood: t('mood_stable'), message: t('mood_stable_message') };
        } else if (tmd < 21) {
            return { mood: t('mood_mild'), message: t('mood_mild_message') };
        } else if (tmd <= 35) {
            return { mood: t('mood_moderate'), message: t('mood_moderate_message') };
        } else {
            return { mood: t('mood_high'), message: t('mood_high_message') };
        }
    };

    const fetchAssessments = useCallback(async () => {
        setLoading(true);
        try {
            const apiResponse = await getassessmentresponseList({
                assessmentType: assessmentType as string,
            });

            if (apiResponse.success && apiResponse.status === 200) {
                const list = apiResponse.data?.assessmentList || [];
                setAssessmentData(list);
            } else {
                showToast.error(t('oops'), apiResponse.message);
                setAssessmentData([]);
            }
        } catch (error) {
            console.error('Error fetching assessments:', error);
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

    const title = assessmentType === 'POMS'
        ? t('monthlywellbeingpulse')
        : t('monthlyhappinessindex');

    const noDataMessage = assessmentType === 'POMS'
        ? t('nowellbeingdata')
        : t('nohappinessindexdata');

    const renderItem = ({ item }: { item: any }) => {
        const score = Number(item?.questionsAndAnswers?.[0]?.result ?? 0);
        const formattedDate = moment(item.month, 'MM-YYYY').format('MMM YYYY');
        const { bg, text } = getScoreStyle(score, assessmentType as 'HAPPINESS' | 'POMS');

        let infoContent;
        if (assessmentType === 'HAPPINESS') {
            infoContent = <Text style={styles.meaningText}>{getScoreMeaning(score)}</Text>;
        } else {
            const { mood, message } = classifyTMD(score);
            infoContent = (
                <View style={{ marginTop: 6 }}>
                    <Text style={styles.moodText}>{mood}</Text>
                    <Text style={styles.messageText}>{message}</Text>
                </View>
            );
        }

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    router.push({
                        pathname: assessmentType === 'POMS' ? '/monthlywellbeingpulse/MonthlyWellbeingPulseResultScreen' : '/monthlyhappinessindex/MonthlyHappinessIndexResultScreen',
                        params: { assessmentData: JSON.stringify(item) },
                    });
                }}
            >
                <View style={styles.cardContent}>
                    <View style={styles.leftSection}>
                        <Text style={styles.dateText}>{formattedDate}</Text>

                        <View style={[styles.scoreBadge, { backgroundColor: bg }]}>
                            <Text style={[styles.scoreText, { color: text }]}>
                                {t('score')}: {score}
                            </Text>
                        </View>

                        {infoContent}
                    </View>

                    <View style={styles.rightIcon}>
                        <ArrowUpRight size={16} color="#666" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#06361F" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <GlobalHeader
                title={title}
                leftIcon={<ChevronLeft size={24} color="#000" />}
                onLeftPress={() => router.back()}
            />

            {sortedData.length > 0 ? (
                <FlatList
                    data={sortedData}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{noDataMessage}</Text>
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
        borderRadius: 8,
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
        color: '#444',
        fontFamily: 'Poppins-Regular',
        marginTop: 4,
        lineHeight: 17,
    },
    rightIcon: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: height * 0.2,
    },
    emptyText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
        lineHeight: 22,
    }
});