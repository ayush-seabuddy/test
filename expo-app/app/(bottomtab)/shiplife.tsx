import { getalladminbuddyupcategories, GETALLBUDDYUPEVENTS, getleaderboard, viewProfile } from '@/src/apis/apiService'
import GlobalPopOver from '@/src/components/GlobalPopover'
import { showToast } from '@/src/components/GlobalToast'
import TopThreeEmployees from '@/src/components/ShipLifeComponent/TopThreeEmployees'
import ShipLifeScreenHeader from '@/src/components/ShipLifeScreenHeader'
import HowMilesWorkPopup from '@/src/components/ShipLifeComponent/HowMilesWorkPopup'
import Colors from '@/src/utils/Colors'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, FlatList, ListRenderItem, Dimensions } from 'react-native'
import BuddyUpBuddyUpEventCard from '@/src/components/ShipLifeComponent/BuddyUpEventCard'
import { InfoIcon } from 'lucide-react-native'
import AdminBuddyUpCategory from '@/src/components/ShipLifeComponent/AdminBuddyUpCategory'
import { getUserDetails } from '@/src/utils/helperFunctions'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import BuddyUpEventCard from '@/src/components/ShipLifeComponent/BuddyUpEventCard'
import { router } from 'expo-router'

const { height } = Dimensions.get('screen');

interface AdminBuddyUpCategoryType {
  id: string;
  categoryName: string;
  categoryImage: string;
}

interface BuddyUpEvent {
  id: string
  eventName: string
  description: string
  startDateTime: string
  endDateTime: string
  location?: string
  imageUrls: string[]
  joinedPeople: string[]
  categoryId?: string
  hashtags?: string[]
  isPublic?: boolean
  status?: string
  activityUser: {
    id: string
    fullName: string
    email: string
    profileUrl: string
    userType: string
  }
}

interface TopEmployee {
  id: string,
  fullName: string,
  profileUrl: string,
  rewardPoints: string
}

interface LoggedUserData {
  department: string;
  designation: string;
  fullName: string;
  id: string;
  isBoarded: boolean;
  shipId: string;
  status: string;
}

type ListItem =
  | { type: 'header' }
  | { type: 'description' }
  | { type: 'categories'; data: AdminBuddyUpCategoryType[] }
  | { type: 'leaderboard'; data: TopEmployee[] }
  | { type: 'createButton' }
  | { type: 'filter' }
  | { type: 'viewall' }
  | { type: 'events'; data: BuddyUpEvent[] }

const ShipLifeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [selectedStatus, setSelectedStatus] = useState<'ON_GOING' | 'PAST' | 'REQUESTED'>('ON_GOING');

  const [buddyupCategory, setbuddyupCategory] = useState<AdminBuddyUpCategoryType[]>([]);
  const [ongoingEvents, setOngoingEvents] = useState<BuddyUpEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<BuddyUpEvent[]>([]);
  const [requestedEvents, setRequestedEvents] = useState<BuddyUpEvent[]>([]);

  const [isBoarded, setIsBoarded] = useState(false);
  const [shipId, setShipId] = useState<string | null>(null);
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [topEmployee, settopEmployee] = useState<TopEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loggeduserData, setloggeduserData] = useState<LoggedUserData | null>(null);

  // Handle event deletion from child component
  const handleEventDeleted = useCallback((eventId: string) => {
    // Remove from all event lists to ensure consistency
    setOngoingEvents(prev => prev.filter(item => item.id !== eventId));
    setPastEvents(prev => prev.filter(item => item.id !== eventId));
    setRequestedEvents(prev => prev.filter(item => item.id !== eventId));
  }, []);

  // Currently displayed events (limited to 5)
  const displayedEvents = useMemo(() => {
    if (selectedStatus === 'ON_GOING') return ongoingEvents.slice(0, 5);
    if (selectedStatus === 'PAST') return pastEvents.slice(0, 5);
    if (selectedStatus === 'REQUESTED') return requestedEvents.slice(0, 5);
    return [];
  }, [selectedStatus, ongoingEvents, pastEvents, requestedEvents]);

  // Full list for "View All" check
  const getFullEventsList = () => {
    if (selectedStatus === 'ON_GOING') return ongoingEvents;
    if (selectedStatus === 'PAST') return pastEvents;
    if (selectedStatus === 'REQUESTED') return requestedEvents;
    return [];
  };

  const showViewAll = getFullEventsList().length > 5;

  // Load user from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUserDetails();
      try {
        const parsed = typeof userData === "string" ? JSON.parse(userData) : userData;
        setloggeduserData(parsed);
      } catch (e) {
        console.log("Parsing User Error:", e);
      }
    };
    loadUser();
  }, []);

  // Load all initial data when user is available
  useEffect(() => {
    if (loggeduserData?.id) {
      loadInitialData();
    }
  }, [loggeduserData]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      const [adminbuddyRes, topemployeeRes, ongoingRes, pastRes, viewprofileRes] = await Promise.all([
        getalladminbuddyupcategories({ isAdmin: true }),
        getleaderboard({ isZero: false }),
        GETALLBUDDYUPEVENTS({ page: 1, limit: 10, eventType: 'ON_GOING' }),
        GETALLBUDDYUPEVENTS({ page: 1, limit: 10, eventType: 'PAST' }),
        viewProfile({ userId: loggeduserData?.id })
      ]);

      // Categories
      if (adminbuddyRes.success && adminbuddyRes.status === 200) {
        setbuddyupCategory(adminbuddyRes.data.groupActivityCategoriesList ?? []);
      } else {
        showToast.error(t('oops'), adminbuddyRes.message);
      }

      // Leaderboard
      if (topemployeeRes.success && topemployeeRes.status === 200) {
        settopEmployee(topemployeeRes.data.allUsers?.usersList ?? []);
      } else {
        showToast.error(t('oops'), topemployeeRes.message);
      }

      // Ongoing Events
      if (ongoingRes.success && ongoingRes.status === 200) {
        setOngoingEvents(ongoingRes.data.groupActivityList ?? []);
      } else {
        showToast.error(t('oops'), ongoingRes.message);
      }

      // Past Events
      if (pastRes.success && pastRes.status === 200) {
        setPastEvents(pastRes.data.groupActivityList ?? []);
      } else {
        showToast.error(t('oops'), pastRes.message);
      }

      // Profile & Boarding Status
      if (viewprofileRes.success && viewprofileRes.status === 200) {
        setShipId(viewprofileRes.data.shipId);
        setDesignation(viewprofileRes.data.designation);
        setDepartment(viewprofileRes.data.department);

        if (viewprofileRes.data.shipId && loggeduserData) {
          loggeduserData.shipId = viewprofileRes.data.shipId;
          await AsyncStorage.setItem("userDetails", JSON.stringify(loggeduserData));
        }

        if (viewprofileRes.data?.isBoarded?.allShips?.length > 0) {
          const userStatus = viewprofileRes.data.isBoarded.allShips[0].crewMembers.find(
            (crew: any) => crew.userId === loggeduserData?.id
          );
          if (userStatus?.isBoarded) {
            setIsBoarded(true);
          } else {
            setSelectedStatus('PAST'); // Default to PAST if not boarded
          }
        }
      } else {
        showToast.error(t('oops'), viewprofileRes.message);
      }
    } catch (err) {
      showToast.error(t('oops'), t('somethingwentwrong'));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch requested events only when Captain selects the tab (lazy load)
  const fetchRequestedEvents = async () => {
    if (requestedEvents.length > 0) return; // Already loaded

    try {
      const res = await GETALLBUDDYUPEVENTS({ page: 1, limit: 10, filter: 'REQUESTED' });
      if (res.success && res.status === 200) {
        setRequestedEvents(res.data.groupActivityList ?? []);
      } else {
        showToast.error(t('oops'), res.message);
      }
    } catch {
      showToast.error(t('oops'), t('somethingwentwrong'));
    }
  };

  const handleTabChange = (status: 'ON_GOING' | 'PAST' | 'REQUESTED') => {
    setSelectedStatus(status);
    if (status === 'REQUESTED' && designation === 'Captain') {
      fetchRequestedEvents();
    }
  };

  const handleViewAll = () => {
    const eventType = selectedStatus;
    router.push({
      pathname: '/viewallbuddyupevents',
      params: {
        eventType: eventType,
      },
    });
  };

  const computeData = (): ListItem[] => {
    const listData: ListItem[] = [];

    if (isBoarded) {
      listData.push({ type: 'header' });
      listData.push({ type: 'description' });
      listData.push({ type: 'categories', data: buddyupCategory });
      listData.push({ type: 'leaderboard', data: topEmployee });
      listData.push({ type: 'createButton' });
    }

    listData.push({ type: 'filter' });

    if (showViewAll) {
      listData.push({ type: 'viewall' });
    }

    listData.push({ type: 'events', data: displayedEvents });

    return listData;
  };

  const renderItem: ListRenderItem<ListItem> = ({ item }) => {
    switch (item.type) {
      case 'header':
        return (
          <View style={styles.titleView}>
            <Text style={styles.buddyuptext}>{t('buddyup')}</Text>
            <GlobalPopOver
              showOkButton
              buttonText={t('close')}
              buttonStyle={styles.okBtnStyle}
              popOverContent={<HowMilesWorkPopup />}
            >
              <InfoIcon size={20} color={Colors.grayDark} />
            </GlobalPopOver>
          </View>
        );

      case 'description':
        return <Text style={styles.buddyupdescription}>{t('buddyup_description')}</Text>;

      case 'categories':
        return <AdminBuddyUpCategory buddyupCategory={item.data} />;

      case 'leaderboard':
        return <TopThreeEmployees topEmployee={item.data} />;

      case 'createButton':
        return (
          <TouchableOpacity style={styles.createyourbuddyupButton}
            onPress={() => {
              router.push('/createyourbuddyupevent')
            }}
          >
            <Text style={styles.createyourbuddyupText}>
              {t('createyourbuddyup')}
            </Text>
          </TouchableOpacity>
        );

      case 'filter':
        return (
          <View style={styles.tabContainer}>
            {isBoarded && (
              <TouchableOpacity
                style={[styles.tab, selectedStatus === "ON_GOING" && styles.activeTab]}
                onPress={() => handleTabChange("ON_GOING")}
              >
                <Text style={styles.tabText}>{t('ongoing')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.tab, selectedStatus === "PAST" && styles.activeTab]}
              onPress={() => handleTabChange("PAST")}
            >
              <Text style={styles.tabText}>{t('past')}</Text>
            </TouchableOpacity>
            {isBoarded && designation === "Captain" && (
              <TouchableOpacity
                style={[styles.tab, selectedStatus === "REQUESTED" && styles.activeTab]}
                onPress={() => handleTabChange("REQUESTED")}
              >
                <Text style={styles.tabText}>{t('requested')}</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'viewall':
        return (
          <View style={{ alignItems: "flex-end", marginHorizontal: 5, marginBottom: 5 }}>
            <TouchableOpacity style={styles.ViewAllButton} onPress={handleViewAll}>
              <Text style={styles.ViewAllText}>{t('viewall')}</Text>
            </TouchableOpacity>
          </View>
        );

      case 'events':
        if (item.data.length > 0) {
          return <BuddyUpEventCard buddyupevents={item.data} onEventDeleted={handleEventDeleted} />;
        } else {
          return (
            <View style={{
              width: '100%',
              height: height * 0.2,
              justifyContent: "center",
              alignItems: "center",
            }}>
              <Text style={{
                fontSize: 20,
                color: "gray",
                fontFamily: "Poppins-Regular",
              }}>
                {t('nobuddyupfound')}
              </Text>
            </View>
          );
        }

      default:
        return null;
    }
  };

  const keyExtractor = (item: ListItem, index: number) => `${item.type}-${index}`;

  if (isLoading) {
    return (
      <View style={styles.fullScreenLoader}>
        <ActivityIndicator size="large" color={Colors.lightGreen} />
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <ShipLifeScreenHeader />
      {!shipId ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{
            fontSize: 16,
            color: "gray",
            fontFamily: "Poppins-SemiBold",
            textAlign: 'center',
            paddingHorizontal: 20,
          }}>
            {t('youarenotonanyship')}
          </Text>
        </View>
      ) : department === 'Shore_Staff' ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{
            fontSize: 16,
            color: "gray",
            fontFamily: "Poppins-SemiBold",
            textAlign: 'center',
            paddingHorizontal: 20,
          }}>
            {t('thissectionapplicableforshipstaff')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={computeData()}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={15}
        />
      )}
    </View>
  );
};

export default ShipLifeScreen;

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#fff' },
  flatListContent: { paddingHorizontal: 20, paddingVertical: 10, paddingBottom: 30 },

  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabContainer: {
    borderColor: '#ededed',
    borderWidth: 0.5,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: 'white',
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    margin: 5,
  },
  activeTab: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: Colors.lightGreen,
  },
  tabText: {
    fontSize: 12,
    color: 'black',
    fontFamily: 'Poppins-Regular',
  },
  buddyuptext: {
    fontSize: 25,
    fontWeight: "600",
    color: 'grey',
    fontFamily: "Poppins-SemiBold"
  },
  buddyupdescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: 'grey',
  },
  okBtnStyle: { backgroundColor: Colors.lightGreen },
  createyourbuddyupButton: {
    backgroundColor: "#666161",
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  createyourbuddyupText: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Poppins-Regular",
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#fff',
  },
  ViewAllButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  ViewAllText: {
    color: "#949494",
    fontSize: 12,
    fontFamily: 'Poppins-Regular'
  },
});