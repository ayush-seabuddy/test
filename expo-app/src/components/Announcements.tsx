import { fetchcustomsurvey, getallcontents } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import Colors from '@/src/utils/Colors';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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
    View
} from 'react-native';
import CustomSurveyCard from './CustomSurveyCard';

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
    const [_, setloading] = useState(false);
    const [surveyData, setsurveyData] = useState<Survey | null>(null);
    const [announcement, setannouncement] = useState<Announcement[]>([]);
    const { t } = useTranslation();

    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const getAllAnnouncements = async () => {
        setloading(true);
        try {
            const apiResponse = await getallcontents({
                page,
                limit,
                onlyAnnouncement,
            });

            if (apiResponse.success && apiResponse.status === 200) {
                setannouncement(apiResponse.data.allContents);
            } else {
                showToast.error(t('oops'), apiResponse.message);
            }
        } catch (error) {
            showToast.error(t('oops'), t('somethingwentwrong'));
        } finally {
            setloading(false);
        }
    };

    const getallsurvey = async () => {
        setloading(true);
        try {
            const apiResponse = await fetchcustomsurvey();

            if (apiResponse.success && apiResponse.status === 200) {
                const customSurveyList = (apiResponse.data || []).filter(
                    (item: Survey) => item.type === "CUSTOM_SURVEY"
                );
                setsurveyData(customSurveyList[0] ?? null);
            } else {
                showToast.error(t('oops'), apiResponse.message);
            }
        } catch (error) {
            showToast.error(t('oops'), t('somethingwentwrong'));
        } finally {
            setloading(false);
        }
    };

    useEffect(() => {
        getAllAnnouncements();
        getallsurvey();
    }, []);

    useEffect(() => {
        if (announcement.length === 0) return;

        autoScrollTimerRef.current && clearInterval(autoScrollTimerRef.current);

        autoScrollTimerRef.current = setInterval(() => {
            setCurrentIndex(prev => {
                const nextIndex = prev + 1 >= announcement.length ? 0 : prev + 1;
                flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                return nextIndex;
            });
        }, 4000);

        return () => {
            autoScrollTimerRef.current && clearInterval(autoScrollTimerRef.current);
        };
    }, [announcement.length]);

    const onScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
        if (index !== currentIndex) setCurrentIndex(index);
    }, [currentIndex]);

    const markAsSeenAndNavigate = (item: Announcement) => {
        // ✅ Optimistic local update
        setannouncement(prev =>
            prev.map(ann =>
                ann.id === item.id
                    ? { ...ann, alreadySeen: true }
                    : ann
            )
        );
        router.push({
            pathname: "/contentDetails/[contentId]",
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
                    colors={["rgba(0,0,0,0.34)", "rgba(0,0,0,0.4)"]}
                    style={StyleSheet.absoluteFillObject}
                />

                <View style={styles.overlay}>
                    {isNew && (
                        <View style={styles.newBadge}>
                            <Text style={styles.newText}>{t('new')}</Text>
                        </View>
                    )}

                    <Text style={styles.title}>{item.contentTitle}</Text>

                    <Text style={styles.description} numberOfLines={2}>
                        {item.description?.replace(/<[^>]*>/g, "")}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (announcement.length === 0) return null;

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
    horizontalList: {
        marginTop: 63,
    },

    listContent: {
        paddingHorizontal: 10,
        gap: CARD_SPACING,
    },

    card: {
        height: 165,
        width: CARD_WIDTH,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#000',
    },

    image: {
        height: '100%',
        width: '100%',
    },

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
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        backgroundColor: Colors.lightGreen,
        paddingVertical: 2,
        paddingHorizontal: 10,
    },

    newText: {
        color: "#06361f",
        fontSize: 8,
        fontFamily: "Poppins-SemiBold",
        textTransform: "uppercase",
    },

    title: {
        fontSize: 16,
        lineHeight: 20,
        fontWeight: "600",
        fontFamily: "Poppins-SemiBold",
        color: "#fff",
        width: '80%',
    },

    description: {
        opacity: 0.9,
        marginBottom: 5,
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: "#fff",
    },

    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 8,
        marginBottom: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#ccc",
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: Colors.lightGreen,
        width: 8,
        height: 8,
    },
});