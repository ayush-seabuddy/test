import { fetchcustomsurvey, getallcontents } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import Colors from '@/src/utils/Colors';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import CustomSurveyCard from './CustomSurveyCard';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 20;
const CARD_SPACING = 10;

type AnnouncementsProps = {
    onlyAnnouncement?: boolean;
    page?: number;
    limit?: number;
};

type Announcement = {
    id: string;
    alreadySeen: boolean;
    contentTitle: string;
    createdAt: string;
    description: string;
    thumbnail: string;
};

type Survey = {
    id: string;
    type: string;
    image: string;
    title: string;
    description: string;
};

const Announcements: React.FC<AnnouncementsProps> = ({
    onlyAnnouncement = false,
    page = 1,
    limit = 10,
}) => {
    const [loading, setLoading] = useState(true);
    const [surveyData, setSurveyData] = useState<Survey | null>(null);
    const [announcement, setAnnouncement] = useState<Announcement[]>([]);
    const { t } = useTranslation();

    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const getAllAnnouncements = async () => {
        try {
            const apiResponse = await getallcontents({
                page,
                limit,
                onlyAnnouncement,
            });

            if (apiResponse.success && apiResponse.status === 200) {
                setAnnouncement(apiResponse.data.allContents);
            } else {
                showToast.error(t('oops'), apiResponse.message);
            }
        } catch {
            showToast.error(t('oops'), t('somethingwentwrong'));
        }
    };

    const getAllSurvey = async () => {
        try {
            const apiResponse = await fetchcustomsurvey();
            if (apiResponse.success && apiResponse.status === 200) {
                const customSurveyList = (apiResponse.data || []).filter(
                    (item: Survey) => item.type === 'CUSTOM_SURVEY'
                );
                setSurveyData(customSurveyList[0] ?? null);
            }
        } catch {
            showToast.error(t('oops'), t('somethingwentwrong'));
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([getAllAnnouncements(), getAllSurvey()]);
            setLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        if (announcement.length === 0) return;

        if (autoScrollTimerRef.current !== null) {
            clearInterval(autoScrollTimerRef.current);
            autoScrollTimerRef.current = null;
        }

        autoScrollTimerRef.current = setInterval(() => {
            setCurrentIndex(prev => {
                const next = prev + 1 >= announcement.length ? 0 : prev + 1;
                flatListRef.current?.scrollToIndex({ index: next, animated: true });
                return next;
            });
        }, 4000);

        return () => {
            if (autoScrollTimerRef.current !== null) {
                clearInterval(autoScrollTimerRef.current);
                autoScrollTimerRef.current = null;
            }
        };
    }, [announcement.length]);

    const onScrollEnd = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
            setCurrentIndex(index);
        },
        []
    );

    const markAsSeenAndNavigate = (item: Announcement) => {
        setAnnouncement(prev =>
            prev.map(a => (a.id === item.id ? { ...a, alreadySeen: true } : a))
        );
        router.push({
            pathname: '/contentDetails/[contentId]',
            params: { contentId: item.id },
        });
    };

    const renderAnnouncement = ({ item }: { item: Announcement }) => {
        const isNew = !item.alreadySeen;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => markAsSeenAndNavigate(item)}
                activeOpacity={0.9}
            >
                <Image source={{ uri: item.thumbnail }} style={styles.image} contentFit="cover" />

                <LinearGradient
                    colors={['rgba(0,0,0,0.34)', 'rgba(0,0,0,0.4)']}
                    style={StyleSheet.absoluteFillObject}
                />

                <View style={styles.overlay}>
                    {isNew && (
                        <View style={styles.newBadge}>
                            <Text style={styles.newText}>{t('new')}</Text>
                        </View>
                    )}

                    <Text style={styles.title} numberOfLines={2}>{item.contentTitle}</Text>

                    <Text style={styles.description} numberOfLines={2}>
                        {item.description?.replace(/<[^>]*>/g, '')}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderShimmerLoader = () => {
        return (
            <View style={styles.shimmerContainer}>
                <ShimmerPlaceholder
                    LinearGradient={LinearGradient}
                    style={styles.shimmerCard}
                    shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
                    shimmerStyle={{ borderRadius: 20 }}
                >
                    <View style={styles.shimmerContent}>
                        <ShimmerPlaceholder
                            LinearGradient={LinearGradient}
                            style={styles.shimmerBadge}
                            shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
                        />

                        <ShimmerPlaceholder
                            LinearGradient={LinearGradient}
                            style={styles.shimmerTitle}
                            shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
                        />

                        <ShimmerPlaceholder
                            LinearGradient={LinearGradient}
                            style={styles.shimmerDescription}
                            shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
                        />
                    </View>
                </ShimmerPlaceholder>

                <View style={styles.shimmerDotsContainer}>
                    {[1, 2, 3, 4, 5].map((_, index) => (
                        <ShimmerPlaceholder
                            key={index}
                            LinearGradient={LinearGradient}
                            style={styles.shimmerDot}
                            shimmerColors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
                        />
                    ))}
                </View>
            </View>
        );
    };

    if (loading) {
        return renderShimmerLoader();
    }

    if (!announcement.length) return null;

    return (
        <View>
            <FlatList
                ref={flatListRef}
                horizontal
                data={announcement}
                renderItem={renderAnnouncement}
                keyExtractor={item => item.id}
                style={styles.horizontalList}
                contentContainerStyle={styles.listContent}
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                snapToInterval={CARD_WIDTH + CARD_SPACING}
                decelerationRate="fast"
                onMomentumScrollEnd={onScrollEnd}
                getItemLayout={(_, index) => ({
                    length: CARD_WIDTH + CARD_SPACING,
                    offset: (CARD_WIDTH + CARD_SPACING) * index,
                    index,
                })}
            />

            <View style={styles.dotsContainer}>
                {announcement.map((_, index) => (
                    <View
                        key={index}
                        style={[styles.dot, currentIndex === index && styles.activeDot]}
                    />
                ))}
            </View>

            {surveyData && <CustomSurveyCard surveyData={surveyData} />}
        </View>
    );
};

export default Announcements;

const styles = StyleSheet.create({
    horizontalList: { marginTop: 63 },
    listContent: { paddingHorizontal: 10, gap: CARD_SPACING },

    card: {
        height: 165,
        width: CARD_WIDTH,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    image: { height: '100%', width: '100%' },

    overlay: {
        position: 'absolute',
        inset: 0,
        padding: 15,
        justifyContent: 'space-between',
    },

    newBadge: {
        position: 'absolute',
        top: 15,
        right: 10,
        borderRadius: 10,
        backgroundColor: Colors.lightGreen,
        paddingVertical: 2,
        paddingHorizontal: 10,
    },

    newText: {
        color: '#06361f',
        fontSize: 8,
        fontFamily: 'Poppins-SemiBold',
        textTransform: 'uppercase',
    },

    title: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
        color: '#fff',
        width: '80%',
    },

    description: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#fff',
        opacity: 0.9,
    },

    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: Colors.lightGreen,
    },

    shimmerContainer: {
        marginTop: 63,
        paddingHorizontal: 10,
    },
    shimmerCard: {
        height: 165,
        width: CARD_WIDTH,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    shimmerContent: {
        position: 'absolute',
        inset: 0,
        padding: 15,
        justifyContent: 'space-between',
    },
    shimmerBadge: {
        position: 'absolute',
        top: 15,
        right: 10,
        width: 40,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#e0e0e0',
    },
    shimmerTitle: {
        width: '70%',
        height: 24,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
        marginTop: 40,
    },
    shimmerDescription: {
        width: '90%',
        height: 18,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
        marginBottom: 15,
    },
    shimmerDotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
        marginBottom: 8,
    },
    shimmerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
        backgroundColor: '#e0e0e0',
    },
});