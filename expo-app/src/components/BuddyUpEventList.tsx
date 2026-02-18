import { ImagesAssets } from '@/src/utils/ImageAssets';
import { formatDate, getUserDetails } from '@/src/utils/helperFunctions';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import moment from 'moment-timezone';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { addeditdeletebuddyupevent, GETALLBUDDYUPEVENTS } from '../apis/apiService';
import CommonLoader from './CommonLoader';
import EmptyComponent from './EmptyComponent';
import GlobalHeader from './GlobalHeader';
import { showToast } from './GlobalToast';
import { Logger } from '../utils/logger';

const { width } = Dimensions.get('window');

export interface BuddyUpEvent {
  id: string;
  eventName: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
  imageUrls: string[];
  joinedPeople: string[];
  categoryId?: string;
  hashtags?: string[];
  isPublic?: boolean;
  status?: string;
  activityUser: {
    id: string;
    fullName: string;
    email: string;
    profileUrl: string;
    userType: string;
  };
}

interface Props {
  userId?: string;
  type?: string;
  from?: string
  ActivitiesData?: BuddyUpEvent[];
}

const BuddyUpEventList = ({ userId, type, from, ActivitiesData }: Props) => {
  const { t } = useTranslation();
  const [groupActivities, setGroupActivities] = useState<BuddyUpEvent[]>(ActivitiesData || []);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [loggeduserData, setLoggeduserData] = useState<{ id: string } | null>(null);
  const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Load logged-in user
  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUserDetails();
      try {
        const parsed = typeof userData === 'string' ? JSON.parse(userData) : userData;
        setLoggeduserData(parsed);
      } catch (e) {
        Logger.error('Parsing User Error:', {Error:String(e)});
      }
    };
    loadUser();
  }, []);

  const handleEditClick = (event: BuddyUpEvent) => {
    setMenuVisibleId(null)
    router.push({
      pathname: '/createyourbuddyupevent',
      params: {
        editMode: 'true',
        eventId: event.id,
        eventName: event.eventName,
        description: event.description,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime,
        location: event.location || '',
        imageUrl: event.imageUrls[0] || '',
        categoryId: event.categoryId || '',
        hashtags: event.hashtags ? JSON.stringify(event.hashtags) : '',
        isPublic: event.isPublic ? 'Public (All Crew)' : 'Invite Buddy',
        joinedPeople: event.joinedPeople ? JSON.stringify(event.joinedPeople) : '[]',
      }
    })
  }

  const deleteBuddyUpEvent = async (eventId: string) => {
    try {
      const apiResponse = await addeditdeletebuddyupevent({
        groupActivities: [{ eventId, status: 'DELETE' }],
      });

      if (apiResponse.success && apiResponse.status === 200) {
        setGroupActivities((prev) => prev.filter((item) => item.id !== eventId));
        showToast.success(t('success'), apiResponse.message);
      } else {
        showToast.error(t('oops'), apiResponse.message);
      }
    } catch (error) {
      Logger.error('Error', {Error:String(error)})
      showToast.error(t('oops'), t('somethingwentwrong'));
    } finally {
      setDeleteModalVisible(false);
    }
  };

  const confirmDelete = () => {
    if (selectedEventId) deleteBuddyUpEvent(selectedEventId);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedEventId(id);
    setDeleteModalVisible(true);
    setMenuVisibleId(null);
  };

  const GetDatafromApi = async (isLoadMore = false,) => {
    try {
      if (ActivitiesData && ActivitiesData.length > 0) {
        return;
      }
      if (!isLoadMore) {
        setLoading(true);
      } else {
        if (page > totalPages) return;
        setLoadingMore(true);
      }


      const response = await GETALLBUDDYUPEVENTS({
        ...(userId ? { userId } : {
          eventType: type
        }),
        page,
        limit: 10,
      });

      if (response.data) {
        const newEvents = response.data.groupActivityList || [];

        if (isLoadMore) {
          setGroupActivities((prev) => [...prev, ...newEvents]);
        } else {
          setGroupActivities(newEvents);
        }

        setTotalPages(response.data.totalPages || 1);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      Logger.error('Error fetching buddy up events:', {Error:String(error)});
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (page <= totalPages && !loadingMore) {
      GetDatafromApi(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      GetDatafromApi(false);
    }, [userId])
  );

  const renderItem = ({ item }: { item: BuddyUpEvent }) => {
    const isCreatedByMe = loggeduserData?.id === item.activityUser.id;
    const couldEditDelete = isCreatedByMe && moment().isBefore(item.startDateTime);

    const showSubmitForApproval = (() => {
      const isCreatedByMe = String(loggeduserData?.id) === String(item.activityUser.id);
      const joinedCount = item?.joinedPeople?.length || 0;
      const activityStatus = item?.status;
      const eventEnded = moment().isAfter(item.endDateTime);

      return isCreatedByMe && eventEnded && joinedCount >= 1 && activityStatus !== 'COMPLETED' && activityStatus !== 'REQUESTED';
    })();

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          router.push({
            pathname: '/buddyupeventdescription',
            params: { eventId: item.id },
          });
        }}
      >
        <Image source={item.imageUrls[0]} style={styles.imageStyle} contentFit="cover" placeholder={ImagesAssets.PlaceholderImage} placeholderContentFit='cover' />

        {couldEditDelete && (
          <View style={styles.menuWrapper}>
            <TouchableOpacity
              onPress={() => setMenuVisibleId((prev) => (prev === item.id ? null : item.id))}
              style={styles.menuIcon}
            >
              <Ionicons name="ellipsis-vertical" size={18} color="#000" />
            </TouchableOpacity>

            {menuVisibleId === item.id && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity style={styles.menuItem} onPress={() => handleEditClick(item)}>
                  <Ionicons name="create-outline" size={20} color="black" />
                  <Text style={styles.menuItemText}>{t('edit')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => handleDeleteClick(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="red" />
                  <Text style={[styles.menuItemText, { color: 'red' }]}>{t('delete')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <Text style={styles.buddyupeventName} numberOfLines={2}>
          {item.eventName}
        </Text>
        <Text style={styles.organizedby} numberOfLines={1}>
          {t('organizedBy')} {isCreatedByMe ? t('you') : item.activityUser.fullName}
        </Text>
        <Text style={styles.organizedby}>
          {t('startdate')} : {formatDate(item.startDateTime)}
        </Text>

        {showSubmitForApproval && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 5 }}>
            <Image source={ImagesAssets.LeaderboardIcon} style={{ height: 16, width: 16, tintColor: 'orange' }} />
            <Text style={styles.claimyourmiles}>{t('claimyourmilesnow')}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <CommonLoader />
      </View>
    );
  };

  if (loading && groupActivities.length === 0) {
    return (
      <View style={styles.center}>
        <CommonLoader fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {from === 'shiplifescreen' && (
        <GlobalHeader
          title={t('activities')}
        />
      )}
      <FlatList
        data={groupActivities}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.center}>
            <EmptyComponent text={t('nobuddyupfound')} />
          </View>
        }
      />

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <StatusBar backgroundColor="rgba(0,0,0,0.6)" />
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('deleteActivity')}</Text>
            <Text style={styles.modalText}>{t('deleteConfirmation')}</Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.cancelBtnTxt}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.deleteBtn]} onPress={confirmDelete}>
                <Text style={styles.deleteBtnTxt}>{t('delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BuddyUpEventList;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: "20%" },

  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },

  card: {
    marginTop: 10,
    width: (width - 30) / 2,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#d5d5d5',
    borderRadius: 12,
    elevation: 2,
  },
  imageStyle: { height: 160, width: '100%', borderRadius: 10 },
  buddyupeventName: { marginTop: 10, fontSize: 14, color: '#222', fontFamily: 'Poppins-SemiBold' },
  organizedby: { fontSize: 12, color: 'grey', fontFamily: 'Poppins-Regular', marginTop: 4 },
  claimyourmiles: { fontSize: 11, color: 'orange', fontFamily: 'Poppins-Medium' },

  menuWrapper: { position: 'absolute', right: 20, top: 20, zIndex: 10 },
  menuIcon: { padding: 7, backgroundColor: '#fff', borderRadius: 40, borderWidth: 0.4, borderColor: 'grey' },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 6,
    width: 110,
    position: 'absolute',
    top: 45,
    right: 0,
    elevation: 6,
    paddingVertical: 5,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 7, paddingHorizontal: 10 },
  menuItemText: { fontSize: 13, fontFamily: 'Poppins-Medium' },

  footerLoader: { paddingVertical: 20, paddingBottom: 100 },

  emptyText: { fontSize: 16, color: '#888', fontFamily: 'Poppins-Regular' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 17, fontFamily: 'Poppins-SemiBold', marginBottom: 8 },
  modalText: { fontSize: 14, textAlign: 'center', color: '#555', marginBottom: 25 },
  modalBtnRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  modalBtn: { width: '48%', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#e6e6e6' },
  deleteBtn: { backgroundColor: 'red' },
  cancelBtnTxt: { color: '#333', fontFamily: 'Poppins-Medium' },
  deleteBtnTxt: { color: '#fff', fontFamily: 'Poppins-Medium' },
});