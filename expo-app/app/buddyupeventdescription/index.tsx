import {
    addeditdeletebuddyupevent,
    BuddyUpStatus,
    viewbuddyupdetails,
    viewProfile,
} from '@/src/apis/apiService';
import CommonLoader from '@/src/components/CommonLoader';
import EmptyComponent from '@/src/components/EmptyComponent';
import GlobalHeader from '@/src/components/GlobalHeader';
import { showToast } from '@/src/components/GlobalToast';
import MediaPreviewModal from '@/src/components/Modals/MediaPreviewModal';
import { RootState } from '@/src/redux/store';
import { updateUserField } from '@/src/redux/userDetailsSlice';
import { formatDate } from '@/src/utils/helperFunctions';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

interface EnrichedUser {
    id: string;
    fullName: string;
    profileUrl: string;
}

interface GroupActivityDetail {
    id: string;
    userId: string;
    categoryId: string;
    eventName: string;
    imageUrls: string[];
    hashtags: string[];
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

    enrichedJoinedPeople: EnrichedUser[];
}

const BuddyUpEventDescription = () => {
    const { eventId } = useLocalSearchParams<{ eventId: string }>();
    const userDetails = useSelector((state: RootState) => state.userDetails);
    const { t } = useTranslation();
    const dispatch = useDispatch();

        useEffect(() => {
            const fetchProfileDetails = async () => {
                let result = await viewProfile();
                if (result?.data) {
                    const object = result.data
                    for (const property in object) {
                        dispatch(updateUserField({ key: property, value: object[property] }))
                    }
    
                }
            }
            fetchProfileDetails();
        }, []);

    const [loading, setLoading] = useState(true);
    const [buddyUpDetails, setBuddyUpDetails] = useState<GroupActivityDetail | null>(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);

    const getMediaType = (url: string): 'image' | 'video' => {
        const videoExtensions = ['mp4', 'mov', 'mkv', 'avi', 'webm'];
        const ext = url.split('.').pop()?.toLowerCase() || '';
        return videoExtensions.includes(ext) ? 'video' : 'image';
    };

    const openPreview = (url: string) => {
        setSelectedMedia({ uri: url, type: getMediaType(url) });
        setPreviewVisible(true);
    };

    const navigateToProfile = (userId: string) => {
        router.push({
            pathname: '/crewProfile',
            params: { crewId: userId },
        });
    };

    const fetchBuddyUpDetails = async () => {
        if (!eventId) return;

        try {
            setLoading(true);
            const apiResponse = await viewbuddyupdetails({ eventId });

            if (apiResponse.success && apiResponse.status === 200) {
                setBuddyUpDetails(apiResponse.data);
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
        fetchBuddyUpDetails();
    }, [eventId]);

    useFocusEffect(useCallback(() => {
        fetchBuddyUpDetails();
    }, []));

    const canApprove = () => ['Captain', 'Chief engineer'].includes(userDetails.designation);
    const isCreator = buddyUpDetails?.userId === userDetails.id;

    const isButtonDisabled = (): boolean => {
        if (!buddyUpDetails) return true;

        if (isCreator) {
            return ['COMPLETED', 'REQUESTED'].includes(buddyUpDetails.status) || !buddyUpDetails.isEnded;
        }

        return (
            (buddyUpDetails.isStarted && !buddyUpDetails.isEnded) ||
            buddyUpDetails.isJoined ||
            buddyUpDetails.isEnded
        );
    };

    const getButtonText = (): string => {
        if (!buddyUpDetails) return t('join');

        const { status, isEnded, joinedPeople = [], isJoined } = buddyUpDetails;
        const hasParticipants = joinedPeople.length > 0;

        if (status === 'COMPLETED') return t('completed');
        if (status === 'REQUESTED') return t('requested');
        if (status === 'REJECTED') return t('rejected');
        if (isEnded && isCreator && hasParticipants && canApprove()) return t('markascomplete');
        if (isEnded && isCreator && hasParticipants && !canApprove()) return t('shareforapproval');
        if (isEnded && isCreator && !hasParticipants) return t('pendingreschedule');
        if (isJoined) return t('Joined');

        return t('join');
    };

    const handleButtonAction = async () => {
        if (!buddyUpDetails) return;

        const { status, isEnded, joinedPeople = [] } = buddyUpDetails;
        const hasParticipants = joinedPeople.length > 0;

        // Approval flow for captains
        if (isEnded && isCreator && hasParticipants) {
            router.push({
                pathname: '/buddyuprequestapproval',
                params: { eventId: buddyUpDetails.id },
            });
            return;
        }

        // Reschedule if no participants
        if (isEnded && isCreator && !hasParticipants) {
            const params: Record<string, string> = {
                eventId: buddyUpDetails.id,
                editMode: 'true',
                eventName: buddyUpDetails.eventName ?? '',
                categoryId: buddyUpDetails.categoryId ?? '',
                description: buddyUpDetails.description ?? '',
                location: buddyUpDetails.location ?? '',
                startDateTime: buddyUpDetails.startDateTime ?? '',
                endDateTime: buddyUpDetails.endDateTime ?? '',
                isPublic: buddyUpDetails.isPublic ? 'true' : 'false',
                imageUrls: JSON.stringify(buddyUpDetails.imageUrls ?? []),
                joinedPeople: JSON.stringify(buddyUpDetails.joinedPeople ?? []),
                invitedPeoples: JSON.stringify(buddyUpDetails.invitedPeoples ?? []),
                completionImages: JSON.stringify(buddyUpDetails.completionImages ?? []),
                hashtags: buddyUpDetails.hashtags ? JSON.stringify(buddyUpDetails.hashtags) : '',
                status: buddyUpDetails.status ?? '',
                completionDescription: buddyUpDetails.completionDescription ?? '',
            };

            router.push({
                pathname: '/createyourbuddyupevent',
                params,
            });
            return;
        }

        // Join event
        try {
            setLoading(true);
            const updatedJoined = [...buddyUpDetails.joinedPeople, userDetails.id];
            console.log("sdflksdjflksdfklfklsfdlksd", updatedJoined );
            

            const response = await addeditdeletebuddyupevent({
                groupActivities: [{ eventId: buddyUpDetails.id, joinedPeople: updatedJoined }],
            });

            if (response.status === 200) {
                fetchBuddyUpDetails();
            }
        } catch (error) {
            console.log('Join Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (status: BuddyUpStatus) => {
        if (!buddyUpDetails) return;

        setLoading(true);
        try {
            const response = await addeditdeletebuddyupevent({
                groupActivities: [{ eventId: buddyUpDetails.id, status }],
            });

            if (response.status === 200) {
                router.back();
            } else {
                showToast.error(t('oops'), response.message);
            }
        } catch (error) {
            console.log('Approval Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !buddyUpDetails) {
        return (
            <View style={styles.loadingContainer}>
                <CommonLoader fullScreen />
            </View>
        );
    }

    if (!buddyUpDetails) {
        return (
            <View style={styles.main}>
                <GlobalHeader
                    title={t('activityDetails')}
                />
                <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: '60%' }}>
                    <EmptyComponent text={t('nodataavailable')} />
                </View>

            </View>
        );
    }

    const joinedPeople = buddyUpDetails.enrichedJoinedPeople || [];
    const displayedJoined = joinedPeople.slice(0, 3);
    const remainingCount = joinedPeople.length - 3;

    return (
        <View style={styles.main}>
            <GlobalHeader
                title={t('activityDetails')}
                leftIcon={<ChevronLeft />}
                onLeftPress={() => router.canGoBack() ? router.back() : router.replace('/(bottomtab)/shiplife')}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                <View style={styles.imageView}>
                    <Image
                        source={buddyUpDetails.imageUrls?.[0] || ImagesAssets.PlaceholderImage}
                        style={styles.buddyupImage}
                        placeholder={ImagesAssets.PlaceholderImage}
                        placeholderContentFit='cover'
                        contentFit="cover"
                        transition={300}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.title}>{buddyUpDetails.eventName}</Text>
                    <View style={styles.rowBetween}>
                        <Text style={styles.organizerText}>
                            {t('organizedBy')} {isCreator ? t('you') : buddyUpDetails.activityUser.fullName}
                        </Text>
                        <View style={styles.pointsView}>
                            <Text style={styles.pointsText}>
                                {buddyUpDetails.groupActivityCategory.points} {t('points')}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>{t('schedule')}</Text>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>{t('starttime')}</Text>
                        <Text style={styles.time}>{formatDate(buddyUpDetails.startDateTime)}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>{t('endtime')}</Text>
                        <Text style={styles.time}>{formatDate(buddyUpDetails.endDateTime)}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>{t('description')}</Text>
                    <Text style={styles.descriptionText}>
                        {buddyUpDetails.description || t('nodescription')}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>{t('joinedbuddies')}</Text>
                    <View style={styles.joinedList}>
                        {joinedPeople.length === 0 ? (
                            <Text style={styles.noParticipants}>{t('noparticipantsjoined')}</Text>
                        ) : (
                            <>
                                {displayedJoined.map((person, index) => (
                                    <TouchableOpacity
                                        key={person.id}
                                        onPress={() => navigateToProfile(person.id)}
                                    >
                                        <Image
                                            style={[styles.avatar, { marginLeft: index > 0 ? -20 : 0 },]}
                                            source={person.profileUrl || ImagesAssets.userIcon}
                                            placeholder={ImagesAssets.userIcon}
                                            contentFit="cover"
                                        />
                                    </TouchableOpacity>
                                ))}

                                {remainingCount > 0 && (
                                    <View style={styles.moreContainer}>
                                        <View style={styles.avatar}>
                                            <View style={styles.moreOverlay}>
                                                <Text style={styles.moreText}>+{remainingCount}</Text>
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>

                {buddyUpDetails.completionImages?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.heading}>{t('uploadedcontent')}</Text>
                        {buddyUpDetails.completionDescription && (
                            <Text style={styles.descriptionText}>{buddyUpDetails.completionDescription}</Text>
                        )}
                        <FlatList
                            data={buddyUpDetails.completionImages}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(_, i) => i.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity activeOpacity={0.8} onPress={() => openPreview(item)}>
                                    <Image
                                        source={item}
                                        style={styles.completionImage}
                                        contentFit="cover"
                                    />
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}
            </ScrollView>

            {/* Approval Buttons for Captains */}
            {buddyUpDetails.status === 'REQUESTED' && canApprove() && (
                <View style={styles.approvalButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleApproval('REJECTED')}
                    >
                        <Text style={styles.submitButtonText}>{t('reject')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleApproval('COMPLETED')}
                    >
                        <Text style={styles.submitButtonText}>{t('approve')}</Text>
                    </TouchableOpacity>
                </View>
            )}
            {/* Main action button: Join, Reschedule, etc. */}
            {buddyUpDetails.status !== 'REQUESTED' || !canApprove() ? (
                <View style={styles.bottomButton}>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            isButtonDisabled() && styles.disabledButton,
                        ]}
                        onPress={handleButtonAction}
                        disabled={isButtonDisabled() || loading}
                    >
                        {loading ? (
                            <CommonLoader color='#fff' />
                        ) : (
                            <Text style={styles.submitButtonText}>{getButtonText()}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : null}

            <MediaPreviewModal
                visible={previewVisible}
                onClose={() => setPreviewVisible(false)}
                uri={selectedMedia?.uri}
                type={selectedMedia?.type ?? 'image'}
            />
        </View>
    );
};

export default BuddyUpEventDescription;

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: '#fff' },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    notFoundText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#666',
    },

    imageView: {
        backgroundColor: '#ededed',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        overflow: 'hidden',
    },
    buddyupImage: { height: 300, width: '100%' },

    section: {
        marginHorizontal: 12,
        marginTop: 12,
        padding: 14,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.06)',
    },

    title: {
        fontSize: 18,
        fontFamily: 'WhyteInktrap-Bold',
        color: '#000',
        marginBottom: 8,
        lineHeight: 20,
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    organizerText: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        color: '#000',
    },

    pointsView: {
        backgroundColor: '#FBCF21',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    pointsText: {
        fontSize: 11,
        fontFamily: 'Poppins-SemiBold',
        color: '#000',
    },

    heading: {
        fontSize: 16,
        lineHeight: 20,
        fontFamily: 'WhyteInktrap-Bold',
        color: '#000',
        marginBottom: 8,
    },

    label: {
        fontSize: 13,
        lineHeight: 20,
        marginBottom: 10,
        fontFamily: 'Poppins-Regular',
        color: '#666',
    },
    time: {
        fontSize: 13,
        fontFamily: 'Poppins-SemiBold',
        color: '#000',
    },

    descriptionText: {
        fontSize: 13,
        color: '#444',
        fontFamily: 'Poppins-Regular',
        lineHeight: 20,
    },

    joinedList: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ddd',
    },

    noParticipants: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#666',
    },

    moreContainer: {
        position: 'relative',
        marginLeft: -20
    },
    moreOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    moreText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
    },

    completionImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginRight: 10,
    },

    bottomButton: {
        paddingHorizontal: 16,
        paddingBottom: 40,
        paddingTop: 10,
        backgroundColor: '#fff',
    },
    submitButton: {
        width: '100%',
        paddingVertical: 15,
        borderRadius: 12,
        backgroundColor: '#02130b',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#bcbcbc',
    },
    submitButtonText: {
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold',
        color: '#fff',
    },

    approvalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 20,
        backgroundColor: '#fff',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    rejectButton: {
        backgroundColor: '#d32f2f',
    },
    approveButton: {
        backgroundColor: '#02130b',
    },
});