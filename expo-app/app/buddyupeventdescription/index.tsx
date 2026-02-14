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
import { useNetwork } from '@/src/hooks/useNetworkStatusHook';
import { RootState } from '@/src/redux/store';
import { updateUserField } from '@/src/redux/userDetailsSlice';
import { formatDate } from '@/src/utils/helperFunctions';
import { ImagesAssets } from '@/src/utils/ImageAssets';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
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
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isOnline = useNetwork();

  const userDetails = useSelector((state: RootState) => state.userDetails);

  const [loading, setLoading] = useState(true);
  const [buddyUpDetails, setBuddyUpDetails] = useState<GroupActivityDetail | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ uri: string; type: 'image' | 'video' } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await viewProfile();
        if (result?.data) {
          Object.entries(result.data).forEach(([key, value]) => {
            dispatch(updateUserField({ key, value }));
          });
        }
      } catch (error) {
        console.log('Error', error)
      }
    };
    fetchProfile();
  }, [dispatch]);

  const fetchBuddyUpDetails = useCallback(async () => {
    if (!eventId || !isOnline) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await viewbuddyupdetails({ eventId });
      if (res.success && res.status === 200) {
        setBuddyUpDetails(res.data);
      } else {
        showToast.error(t('oops'), res.message || t('somethingwentwrong'));
      }
    } catch {
      showToast.error(t('oops'), t('somethingwentwrong'));
    } finally {
      setLoading(false);
    }
  }, [eventId, isOnline, t]);

  useEffect(() => {
    fetchBuddyUpDetails();
  }, [fetchBuddyUpDetails]);

  useFocusEffect(
    useCallback(() => {
      fetchBuddyUpDetails();
    }, [fetchBuddyUpDetails])
  );

  const isCreator = buddyUpDetails?.userId === userDetails.id;
  const canApprove = useMemo(
    () => ['Captain', 'Chief engineer'].includes(userDetails.designation ?? ''),
    [userDetails.designation]
  );

  const joinedPeople = buddyUpDetails?.enrichedJoinedPeople ?? [];
  const displayedJoined = useMemo(() => joinedPeople.slice(0, 3), [joinedPeople]);
  const remainingCount = joinedPeople.length - 3;

  const getMediaType = useCallback((url: string): 'image' | 'video' => {
    const ext = url.split('.').pop()?.toLowerCase() || '';
    return ['mp4', 'mov', 'mkv', 'avi', 'webm'].includes(ext) ? 'video' : 'image';
  }, []);

  const { buttonText, isDisabled, shouldShowApprovalButtons } = useMemo(() => {
    if (!buddyUpDetails) {
      return { buttonText: t('join'), isDisabled: true, shouldShowApprovalButtons: false };
    }

    const { status, isEnded, joinedPeople = [], isJoined } = buddyUpDetails;
    const hasParticipants = joinedPeople.length > 0;

    if (status === 'COMPLETED') return { buttonText: t('completed'), isDisabled: true, shouldShowApprovalButtons: false };
    if (status === 'REQUESTED') return { buttonText: t('requested'), isDisabled: true, shouldShowApprovalButtons: false };
    if (status === 'REJECTED') return { buttonText: t('rejected'), isDisabled: true, shouldShowApprovalButtons: false };

    if (isEnded && isCreator) {
      if (hasParticipants && canApprove) {
        return { buttonText: t('markascomplete'), isDisabled: false, shouldShowApprovalButtons: false };
      }
      if (hasParticipants && !canApprove) {
        return { buttonText: t('shareforapproval'), isDisabled: true, shouldShowApprovalButtons: false };
      }
      if (!hasParticipants) {
        return { buttonText: t('pendingreschedule'), isDisabled: false, shouldShowApprovalButtons: false };
      }
    }

    if (isJoined) return { buttonText: t('Joined'), isDisabled: true, shouldShowApprovalButtons: false };

    return { buttonText: t('join'), isDisabled: false, shouldShowApprovalButtons: false };
  }, [buddyUpDetails, isCreator, canApprove, t]);

  const shouldShowMainActionButton = !shouldShowApprovalButtons;

  const openPreview = useCallback((url: string) => {
    setSelectedMedia({ uri: url, type: getMediaType(url) });
    setPreviewVisible(true);
  }, [getMediaType]);

  const navigateToProfile = useCallback((userId: string) => {
    router.push({ pathname: '/crewProfile', params: { crewId: userId } });
  }, []);

  const handleButtonAction = useCallback(async () => {
    if (!buddyUpDetails || !isOnline) return;

    const { isEnded, joinedPeople = [], isJoined } = buddyUpDetails;
    const hasParticipants = joinedPeople.length > 0;

    if (isEnded && isCreator) {
      if (hasParticipants) {
        router.push({
          pathname: '/buddyuprequestapproval',
          params: { eventId: buddyUpDetails.id },
        });
        return;
      }

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

      router.push({ pathname: '/createyourbuddyupevent', params });
      return;
    }

    if (isJoined) return;

    setLoading(true);
    try {
      const updatedJoined = [...joinedPeople, userDetails.id];
      const response = await addeditdeletebuddyupevent({
        groupActivities: [{ eventId: buddyUpDetails.id, joinedPeople: updatedJoined }],
      });

      if (response.status === 200) {
        await fetchBuddyUpDetails();
      } else {
        showToast.error(t('oops'), response.message || t('somethingwentwrong'));
      }
    } catch {
      showToast.error(t('oops'), t('somethingwentwrong'));
    } finally {
      setLoading(false);
    }
  }, [buddyUpDetails, userDetails.id, isCreator, isOnline, fetchBuddyUpDetails, t]);

  const handleApproval = useCallback(async (newStatus: BuddyUpStatus) => {
    if (!buddyUpDetails || !isOnline) return;

    setLoading(true);
    try {
      const res = await addeditdeletebuddyupevent({
        groupActivities: [{ eventId: buddyUpDetails.id, status: newStatus }],
      });

      if (res.status === 200) {
        router.back();
      } else {
        showToast.error(t('oops'), res.message || t('somethingwentwrong'));
      }
    } catch {
      showToast.error(t('oops'), t('somethingwentwrong'));
    } finally {
      setLoading(false);
    }
  }, [buddyUpDetails, isOnline, t]);
  return (
    <View style={styles.main}>
      <GlobalHeader
        title={t('activityDetails')}
        leftIcon={<ChevronLeft />}
        onLeftPress={() => (router.canGoBack() ? router.back() : router.replace('/(bottomtab)/shiplife'))}
      />

      {!isOnline ? (
        <EmptyComponent text={t('nointernetconnection')} />
      ) : loading && !buddyUpDetails ? (
        <View style={styles.loadingContainer}>
          <CommonLoader fullScreen />
        </View>
      ) : !buddyUpDetails ? (
        <View style={styles.centerEmpty}>
          <EmptyComponent text={t('nodataavailable')} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.imageView}>
            <Image
              source={buddyUpDetails.imageUrls?.[0] || ImagesAssets.PlaceholderImage}
              style={styles.buddyupImage}
              placeholder={ImagesAssets.PlaceholderImage}
              placeholderContentFit="cover"
              contentFit="cover"
              transition={300}
              cachePolicy="memory-disk"
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
            {joinedPeople.length === 0 ? (
              <Text style={styles.noParticipants}>{t('noparticipantsjoined')}</Text>
            ) : (
              <View style={styles.joinedList}>
                {displayedJoined.map((person, index) => (
                  <TouchableOpacity key={person.id} onPress={() => navigateToProfile(person.id)}>
                    <Image
                      style={[styles.avatar, index > 0 && styles.avatarOverlap]}
                      source={person.profileUrl || ImagesAssets.userIcon}
                      placeholder={ImagesAssets.userIcon}
                      contentFit="cover"
                      cachePolicy="memory-disk"
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
              </View>
            )}
          </View>

          {buddyUpDetails.completionImages?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.heading}>{t('uploadedcontent')}</Text>
              {buddyUpDetails.completionDescription && (
                <Text style={[styles.descriptionText, { marginBottom: 10 }]}>{buddyUpDetails.completionDescription}</Text>
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
                      cachePolicy="memory-disk"
                    />
                  </TouchableOpacity>
                )}
                contentContainerStyle={{marginBottom:5}}
              />
            </View>
          )}
        </ScrollView>
      )}

      {isOnline && buddyUpDetails && (
        <>
          {buddyUpDetails.status === 'REQUESTED' && canApprove && (
            <View style={styles.approvalButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleApproval('REJECTED')}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>{t('reject')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApproval('COMPLETED')}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>{t('approve')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {shouldShowMainActionButton && (
            <View style={styles.bottomButton}>
              <TouchableOpacity
                style={[styles.submitButton, isDisabled && styles.disabledButton]}
                onPress={handleButtonAction}
                disabled={isDisabled || loading}
              >
                {loading ? (
                  <CommonLoader color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>{buttonText}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      <MediaPreviewModal
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        uri={selectedMedia?.uri}
        type={selectedMedia?.type ?? 'image'}
      />
    </View>
  );
};

export default memo(BuddyUpEventDescription);

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#fff' },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  centerEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  scrollContent: { paddingBottom: 10 },

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
    marginBottom: 6,
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
  avatarOverlap: { marginLeft: -20 },

  noParticipants: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },

  moreContainer: {
    position: 'relative',
    marginLeft: -20,
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
    marginRight: 12,
  },

  bottomButton: {
    paddingHorizontal: 10,
    paddingVertical: 16,
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
  rejectButton: { backgroundColor: '#d32f2f' },
  approveButton: { backgroundColor: '#02130b' },
});