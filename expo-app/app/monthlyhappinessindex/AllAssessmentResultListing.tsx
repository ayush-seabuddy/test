import { getassessmentresponseList } from '@/src/apis/apiService';
import CustomLottie from '@/src/components/CustomLottie';
import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { useRouter } from 'expo-router';
import { ChevronLeft, ArrowUpRight } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const getScoreMeaning = (score: number) => {
    if (score >= 80) return 'Very Happy — Life feels good, strong well-being.';
    if (score >= 60) return 'Happy — Generally satisfied, things are going well.';
    if (score >= 40) return 'Moderate — Average satisfaction, some challenges exist.';
    if (score >= 20) return 'Low — People face difficulties, well-being is below average.';
    return 'Very Low — Major challenges, low satisfaction.';
};

const getScoreStyle = (score: number) => {
    if (score >= 75) return { bg: '#A9DFBF', text: '#145A32' };
    if (score >= 40) return { bg: '#F9E79F', text: '#7D6608' };
    return { bg: '#F5B7B1', text: '#78281F' };
};

const AllAssessmentResultListing = ({ navigation }: any) => {
    const [loading, setloading] = useState(false);
    const [assessmentData, setAssessmentData] = useState([]);
    const router = useRouter();
    const { t } = useTranslation();

    const getAllAssessmentResponseList = async () => {
        setloading(true);
        try {
            const apiResponse = await getassessmentresponseList({
                assessmentType: 'HAPPINESS',
            });

            setloading(false);

            if (apiResponse.success && apiResponse.status == 200) {
                const list = apiResponse.data?.assessmentList || [];
                setAssessmentData(list);
            } else {
                showToast.error(t('oops'), apiResponse.message);
            }
        } catch (error) {
            setloading(false);
            showToast.error(t('oops'), t('somethingwentwrong'));
        }
    };

    useEffect(() => {
        getAllAssessmentResponseList();
    }, []);

    const renderItem = ({ item }: any) => {
        const score = Number(item?.questionsAndAnswers?.[0]?.result ?? 0);

        const formattedDate = new Date(item.month + '-01').toLocaleString('default', {
            month: 'short',
            year: 'numeric',
        });

        const { bg, text } = getScoreStyle(score);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() =>
                    router.push({
                        pathname: '/monthlyhappinessindex/MonthlyHappinessIndexResultScreen',
                        params: {
                            assessmentData: JSON.stringify(item),
                        }
                    })
                }
            >
                <View style={styles.cardContent}>
                    <View style={styles.leftSection}>
                        <Text style={styles.dateText}>{formattedDate}</Text>

                        <View style={[styles.scoreBadge, { backgroundColor: bg }]}>
                            <Text style={[styles.scoreText, { color: text }]}>
                                Score: {score}
                            </Text>
                        </View>

                        <Text style={styles.meaningText}>{getScoreMeaning(score)}</Text>
                    </View>

                    <View style={styles.rightIcon}>
                        <ArrowUpRight size={14} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <GlobalHeader
                title={t('monthlyhappinessindex')}
                leftIcon={<ChevronLeft size={20} />}
                onLeftPress={() => router.back()}
            />

            <FlatList
                data={assessmentData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {t('nohappinessindexdata')}
                        </Text>
                    </View>
                }
            />

            <View style={styles.lottieBackground}>
                <CustomLottie isBlurView={false} />
            </View>
        </View>
    );
};

export default AllAssessmentResultListing;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: height * 0.4,
    },
    card: {
        backgroundColor: 'rgba(180, 180, 180, 0.4)',
        borderRadius: 12,
        padding: 16,
        marginVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftSection: {
        flex: 1,
    },
    dateText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        fontFamily: 'Poppins-SemiBold',
    },
    scoreBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginVertical: 6,
    },
    scoreText: {
        fontWeight: '600',
        fontSize: 14,
    },
    meaningText: {
        fontSize: 13,
        color: '#333',
        fontFamily: 'Poppins-Regular',
        marginTop: 4,
        lineHeight: 18,
    },
    rightIcon: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.2,
    },
    emptyImage: {
        width: 120,
        height: 120,
        opacity: 0.8,
    },
    emptyText: {
        marginTop: 20,
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
    },
    lottieBackground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        overflow: 'hidden',
        backgroundColor: 'rgba(193, 193, 193, 0.9)',
    },
});
