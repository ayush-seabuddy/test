import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, ScrollView, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import GlobalHeader from '@/src/components/GlobalHeader';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { formatDate } from '@/src/utils/helperFunctions';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { viewbuddyupdetails } from '@/src/apis/apiService';
import { showToast } from '@/src/components/GlobalToast';
import MediaPreviewModal from '@/src/components/Modals/MediaPreviewModal';
import Colors from '@/src/utils/Colors';

interface GroupActivityDetail {
    id: string;
    userId: string;
    categoryId: string;
    eventName: string;
    imageUrls: string[];
    description: string | null;
    location: string;
    startDateTime: string;
    endDateTime: string;
    joinedPeople: string[];
    invitedPeoples: string[];
    isPublic: boolean;
    completionImages: string[];
    completionDescription: string | null;
    status: string;
    createdAt: string;
    isPosted: boolean;
    isJoined: boolean;
    isStarted: boolean;
    isEnded: boolean;

    activityUser: {
        id: string;
        fullName: string;
        profileUrl: string;
    };

    groupActivityCategory: {
        id: string;
        categoryName: string;
        points: string;
        creatorPoints: string;
    };

    enrichedJoinedPeople: {
        id: string;
        fullName: string;
        profileUrl: string;
    }[];


}

const BuddyUpEventDescription = () => {
    const { eventId } = useLocalSearchParams<{ eventId: string }>();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [buddydetails, setBuddydetails] = useState<GroupActivityDetail | null>(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: "image" | "video" } | null>(null);
    const getMediaType = (url: string): "image" | "video" => {
        const videoExtensions = ["mp4", "mov", "mkv", "avi", "webm"];
        const ext = url.split(".").pop()?.toLowerCase() || "";
        return videoExtensions.includes(ext) ? "video" : "image";
    };
    const openPreview = (url: string) => {
        setSelectedMedia({ uri: url, type: getMediaType(url) });
        setPreviewVisible(true);
    };
    const fetchbuddyupDetails = async () => {
        if (!eventId) return;

        try {
            setLoading(true);
            const apiResponse = await viewbuddyupdetails({ eventId });

            if (apiResponse.success && apiResponse.status === 200) {
                setBuddydetails(apiResponse.data);
            } else {
                showToast.error(t('oops'), apiResponse.message);
            }
        } catch (error) {
            showToast.error(t('oops'), t('somethingwentwrong'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchbuddyupDetails();
    }, [eventId]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.lightGreen} />
            </View>
        );
    }

    if (!buddydetails) {
        return (
            <View style={styles.main}>
                <GlobalHeader
                    title={t('activityDetails')}
                    leftIcon={<ChevronLeft />}
                    onLeftPress={() => router.back()}
                />
                <Text style={{ textAlign: 'center', marginTop: 50, fontSize: 16 }}>
                    {t('eventNotFound')}
                </Text>
            </View>
        );
    }

    const joinedPeople = buddydetails.enrichedJoinedPeople || [];
    const joinedCount = joinedPeople.length;
    const displayedJoined = joinedPeople.slice(0, 10);

    return (
        <View style={styles.main}>
            <GlobalHeader
                title={t('activityDetails')}
                leftIcon={<ChevronLeft />}
                onLeftPress={() => router.back()}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageView}>
                    <Image
                        source={buddydetails.imageUrls?.[0] || ImagesAssets.SeabuddyPlaceholder}
                        style={styles.buddyupImage}
                        placeholder={ImagesAssets.SeabuddyPlaceholder}
                        contentFit="cover"
                        transition={300}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.title}>{buddydetails.eventName}</Text>

                    <View style={styles.rowBetween}>
                        <Text style={styles.organizerText}>
                            {t('organizedBy')} {buddydetails.activityUser.fullName}
                        </Text>

                        <View style={styles.pointsView}>
                            <Text style={styles.pointsText}>
                                {buddydetails.groupActivityCategory.points} Points
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>{t('schedule')}</Text>

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>{t('starttime')}</Text>
                        <Text style={styles.time}>
                            {formatDate(buddydetails.startDateTime)}
                        </Text>
                    </View>

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>{t('endtime')}</Text>
                        <Text style={styles.time}>
                            {formatDate(buddydetails.endDateTime)}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>{t('description')}</Text>
                    <Text style={styles.descriptionText}>
                        {buddydetails.description || t('nodescription')}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>{t('joinedbuddies')}</Text>

                    <View style={styles.joinedList}>
                        {joinedCount === 0 ? (
                            <Text style={styles.noParticipants}>
                                {t('noparticipantsjoined')}
                            </Text>
                        ) : (
                            <>
                                {displayedJoined.map((person, index) => (
                                    <TouchableOpacity key={person.id || index}>
                                        <Image
                                            style={styles.avatar}
                                            source={person.profileUrl || ImagesAssets.userIcon}
                                            placeholder={ImagesAssets.userIcon}
                                            contentFit="cover"
                                        />
                                    </TouchableOpacity>
                                ))}

                                {joinedCount > 10 && (
                                    <View style={styles.moreContainer}>
                                        <Image
                                            style={styles.avatar}
                                            source={ImagesAssets.userIcon}
                                            contentFit="cover"
                                        />
                                        <View style={styles.moreOverlay}>
                                            <Text style={styles.moreText}>+{joinedCount - 10}</Text>
                                        </View>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>

                {/* Uploaded Content Section */}
                {buddydetails.completionImages?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.heading}>{t('uploadedcontent')}</Text>
                        <Text style={styles.descriptionText}>{buddydetails.completionDescription}</Text>
                        <FlatList
                            data={buddydetails.completionImages}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ width: "100%" }}
                            keyExtractor={(item, i) => i.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity activeOpacity={0.7} onPress={() => openPreview(item)}>
                                    <Image
                                        source={item}
                                        style={{ width: 200, height: 200, borderRadius: 10, marginRight: 10 }}
                                        contentFit="cover"
                                    />
                                </TouchableOpacity>
                            )}
                        />

                    </View>
                )}
                <MediaPreviewModal
                    visible={previewVisible}
                    onClose={() => setPreviewVisible(false)}
                    uri={selectedMedia?.uri}
                    type={selectedMedia?.type ?? "image"}
                />
                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );

};

export default BuddyUpEventDescription;

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: '#fff' },

    imageView: {
        backgroundColor: '#ededed',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        overflow: 'hidden',
    },
    buddyupImage: { height: 300, width: '100%' },

    section: {
        marginHorizontal: 12,
        padding: 14,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.06)',
        gap: 10,
        marginTop: 10,
    },

    title: {
        fontSize: 18,
        lineHeight: 20,
        fontFamily: 'WhyteInktrap-Bold',
        color: '#000',
    },

    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    organizerText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#000' },

    pointsView: { backgroundColor: '#FBCF21', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, alignItems: 'center' },
    pointsText: { fontSize: 10, fontFamily: 'Poppins-Regular', color: '#000' },

    heading: { fontSize: 16, fontFamily: 'WhyteInktrap-Bold', color: '#000' },
    label: { fontSize: 13, fontFamily: 'Poppins-Regular', color: '#666' },
    time: { fontSize: 13, fontFamily: 'Poppins-SemiBold', color: '#000' },

    descriptionText: { fontSize: 13, color: '#444', fontFamily: 'Poppins-Regular' },

    joinedList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    avatar: { width: 45, height: 45, borderRadius: 100 },

    noParticipants: { fontSize: 14, fontFamily: 'Poppins-Regular' },

    moreContainer: { position: 'relative' },
    moreOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
    },
    moreText: { color: '#fff', fontSize: 14, fontFamily: 'Poppins-SemiBold' },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});