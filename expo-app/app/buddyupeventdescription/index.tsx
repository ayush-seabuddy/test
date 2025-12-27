import { addeditdeletebuddyupevent, viewbuddyupdetails } from '@/src/apis/apiService';
import GlobalHeader from '@/src/components/GlobalHeader';
import Toast, { showToast } from '@/src/components/GlobalToast';
import MediaPreviewModal from '@/src/components/Modals/MediaPreviewModal';
import { RootState } from '@/src/redux/store';
import Colors from '@/src/utils/Colors';
import { formatDate } from '@/src/utils/helperFunctions';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';

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
    const userDetails = useSelector((state: RootState) => state.userDetails);
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [buddyUpDetails, setBuddydetails] = useState<GroupActivityDetail | null>(null);
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

    if (!buddyUpDetails) {
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

    const joinedPeople = buddyUpDetails.enrichedJoinedPeople || [];
    const joinedCount = joinedPeople.length;
    const displayedJoined = joinedPeople.slice(0, 10);
    const YourEvent = buddyUpDetails.userId === userDetails.id;

    const isDisable = (): boolean => {
        const { status, isEnded, userId, joinedPeople = [], isJoined } = buddyUpDetails;
        if (YourEvent) {
            if (buddyUpDetails.status === "COMPLETED" || buddyUpDetails.status === "REQUESTED" || !buddyUpDetails.isEnded) {
                return true;
            } else {
                return false;
            }
        } else {

            return (buddyUpDetails.isStarted && !buddyUpDetails.isEnded) || buddyUpDetails.isJoined || isEnded;
        }
    };

    const canApprove = () => {
        return ["Captain", "Chief engineer"].includes(userDetails.designation)
    }



     const handleApporvalGivenByUser = async (status) => {
        // setLoading(true);
        try {
            const response = await addeditdeletebuddyupevent( {
                groupActivities: [
                  {
                    eventId: buddyUpDetails.id,
                    status: status,
                  },
                ],
              })
        //   const response = await axios({
        //     method: "POST",
        //     url: `${apiServerUrl}/activity/addUpdateGroupActivity`,
        //     headers: {
        //       authToken: authToken,
        //     },
        //     data: {
        //       groupActivities: [
        //         {
        //           eventId: activity.id,
        //           status: status,
        //         },
        //       ],
        //     },
        //   });
    
       
          if (response.status === 200) {
            router.back();
          }else{
             Toast.show({
              type: "error",
              text1: "Error",
              text2:
                response.data.responseMessage ||
                "No offline data found. Please connect to the internet.",
              autoHide: true,
              visibilityTime: 2000,
              text1Style: {
                fontFamily: "WhyteInkTrap-Bold",
                fontSize: 16,
                color: "#000",
              },
              text2Style: {
                fontFamily: "WhyteInkTrap-Regular",
                fontSize: 14,
                color: "#000",
              },
            });

          }
        } catch (error) {
            console.log("error: ", error);
          
        } finally {
          setLoading(false);
        }
      };
    // const getButtonText = () => {
    //     if (buddyUpDetails.status === "COMPLETED") {
    //         return t('completed')
    //     } else if (buddyUpDetails.status === "REQUESTED") {
    //         return t('requested')
    //     } else if (buddyUpDetails.isEnded && buddyUpDetails.userId === userDetails.id) {

    //         if (buddyUpDetails.joinedPeople.length > 0 && canApprove()) {
    //             return t('markascomplete')
    //         } else if (buddyUpDetails.joinedPeople.length > 0 && !canApprove()) {
    //             return t('requestedForApproval')
    //         } else {
    //             return t('pendingreschedule')
    //         }

    //     } else if (buddyUpDetails.isJoined) {
    //         return t('Joined')
    //     } else {
    //         return t('join')
    //     }

    // }


    const getButtonText = (): string => {
        const { status, isEnded, userId, joinedPeople = [], isJoined } = buddyUpDetails;
        const isCreator = userId === userDetails.id;
        const hasParticipants = joinedPeople.length > 0;

        const conditions = [
            { check: status === "COMPLETED", text: t('completed') },
            { check: status === "REQUESTED", text: t('requested') },
            { check: status === "REJECTED", text: t('rejected') },
            { check: isEnded && isCreator && hasParticipants && canApprove(), text: t('markascomplete') },
            { check: isEnded && isCreator && hasParticipants && !canApprove(), text: t('shareforapproval') },
            { check: isEnded && isCreator && !hasParticipants, text: t('pendingreschedule') },
            { check: isJoined, text: t('Joined') },
        ];

        const match = conditions.find(cond => cond.check);
        return match ? match.text : t('join');
    };


    const getButtonHandle = (): void => {
        const { status, isEnded, userId, joinedPeople = [], isJoined } = buddyUpDetails;
        const isCreator = userId === userDetails.id;
        const hasParticipants = joinedPeople.length > 0;

        const conditions = [
            { check: status === "COMPLETED", page: () => { } },
            { check: status === "REQUESTED", page: () => { } },
            { check: isEnded && isCreator && hasParticipants && canApprove(),  page: () => {
                    router.push({
                        pathname: '/buddyuprequestapproval',
                        params: { eventId: buddyUpDetails.id }
                    })
                } },
            {
                check: isEnded && isCreator && hasParticipants && !canApprove(),
                page: () => {
                    router.push({
                        pathname: '/buddyuprequestapproval',
                        params: { eventId: buddyUpDetails.id }
                    })
                }

            },
            {
                check: isEnded && isCreator && !hasParticipants,
                page: () => {
                    const data = { eventId: buddyUpDetails.id, editMode: 'true', ...buddyUpDetails }
                    router.push({
                        pathname: '/createyourbuddyupevent',
                        params: data
                    })
                }
            },
            { check: isJoined, text: t('Joined') },
        ];

        const match = conditions.find(cond => cond.check);
        if (match && match.page) {
            match.page();
        }else{
            handleJoinButtonPress();
        }
        // return match ? match.text : t('join');
    };

      const handleJoinButtonPress = async () => {
        try {
    
          const joinPeople = [...buddyUpDetails.joinedPeople, userDetails.id];

          const response = await addeditdeletebuddyupevent( {
              groupActivities: [
                {
                  eventId: buddyUpDetails.id,
                  joinedPeople: joinPeople,
                },
              ],
            })
    

    
          if (response.status === 200) {
            // setReload(true);
            // GetDetails();
            fetchbuddyupDetails();
          }
        } catch (error) {
          console.log("API Error:", error.response?.data || error.message);
        }
      };

    return (
        <View style={styles.main}>
            <GlobalHeader
                title={t('activityDetails')}
                leftIcon={<ChevronLeft />}
                onLeftPress={() => router.back()}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                <View style={styles.imageView}>
                    <Image
                        source={buddyUpDetails.imageUrls?.[0] || ImagesAssets.SeabuddyPlaceholder}
                        style={styles.buddyupImage}
                        placeholder={ImagesAssets.SeabuddyPlaceholder}
                        contentFit="cover"
                        transition={300}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.title}>{buddyUpDetails.eventName}</Text>

                    <View style={styles.rowBetween}>
                        <Text style={styles.organizerText}>
                            {t('organizedBy')} {buddyUpDetails.activityUser.fullName}
                        </Text>

                        <View style={styles.pointsView}>
                            <Text style={styles.pointsText}>
                                {buddyUpDetails.groupActivityCategory.points} Points
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.heading}>{t('schedule')}</Text>

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>{t('starttime')}</Text>
                        <Text style={styles.time}>
                            {formatDate(buddyUpDetails.startDateTime)}
                        </Text>
                    </View>

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>{t('endtime')}</Text>
                        <Text style={styles.time}>
                            {formatDate(buddyUpDetails.endDateTime)}
                        </Text>
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
                {buddyUpDetails.completionImages?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.heading}>{t('uploadedcontent')}</Text>
                        <Text style={styles.descriptionText}>{buddyUpDetails.completionDescription}</Text>
                        <FlatList
                            data={buddyUpDetails.completionImages}
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
                {buddyUpDetails.status === 'REQUESTED' && canApprove() ? (
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingHorizontal: 16
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                width: "48%",
                                paddingVertical: 13,
                                borderRadius: 10,
                                backgroundColor: "red",
                                alignItems: "center",
                                marginTop: "75%",
                            }}
                        onPress={() => handleApporvalGivenByUser("REJECTED")}
                        >
                            <Text style={styles.submitButtonText}>{t('reject')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                width: "48%",
                                paddingVertical: 13,
                                borderRadius: 10,
                                backgroundColor: "#02130b",
                                alignItems: "center",
                                marginTop: "75%",
                            }}
                        onPress={() => handleApporvalGivenByUser("COMPLETED")}
                        >
                            <Text style={styles.submitButtonText}>{t('approve')}</Text>
                        </TouchableOpacity>
                    </View>
                ): <View style={{ paddingHorizontal: 16 }} >
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            isDisable() && {
                                backgroundColor: "#bcbcbc",
                                borderWidth: 1,
                                borderColor: "#676E7629",
                            },
                        ]}
                        onPress={() => getButtonHandle()}
                        disabled={isDisable()}
                    >
                        <Text style={styles.submitButtonText}>
                            {getButtonText()}
                        </Text>
                    </TouchableOpacity>
                </View>}
               
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
    submitButton: {
        width: "100%",
        paddingVertical: 13,
        borderRadius: 10,
        backgroundColor: "#02130b",
        alignItems: "center",
    },
    submitButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
        fontFamily: "Poppins-SemiBold",
    },
});