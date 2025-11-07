import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import ProfleSettingHeader from "../component/headers/ProfileHeader/ProfleSettingHeader";
import GroupActivity from "../component/ProfileListComponents/GroupActivity";
import HuddleHeader from "../component/headers/HuddleHeader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../Api";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useFocusEffect } from "@react-navigation/native";
import Loader from "../component/Loader";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import DefaultActivits from "../component/ProfileListComponents/DefaultActivitys";
import { FontFamily } from "../GlobalStyle";
import PersonalityResultInfoPopup from "./PersonalityMapInfoPopup";
import api from "../CustomAxios";
import FastImage from "react-native-fast-image";

const { height, width } = Dimensions.get("screen");

const Huddle = ({ navigation, route }) => {
  const [groupActivities, setGroupActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // Prevents flash
  const [selectedStatus, setSelectedStatus] = useState("ONGOING");
  const [modalVisible, setModalVisible] = useState(false);
  const [requestedEvent, setRequestedEvents] = useState([]);
  const [onGoingEvents, setOnGoingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [ActivityCategory, setActivityCategory] = useState(null);
  const [shipId, setShipId] = useState(null);
  const [isBoarded, setIsBoarded] = useState(false);
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [menuVisible, setMenuVisible] = useState(null);
  const [profile, setProfile] = useState({});
  const [employees, setEmployees] = useState([]);
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Fetch Leaderboard
  const GetDetails = useCallback(async () => {
    try {
      const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
      const { data } = await api.get(`${apiServerUrl}/user/getUserLeaderBoard`, {
        headers: { authToken: userDetails?.authToken },
        params: { isZero: false }
      });
      if (data?.responseCode === 200) {
        const list = data.result.allUsers?.usersList || [];
        setEmployees(list);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const handleTabChange = (status) => {
    setSelectedStatus(status);
    setMenuVisible(null);
  };

  const GetUserDetails = async () => {
    try {
      const UserData = await AsyncStorage.getItem("userDetails");
      const mydata = JSON.parse(UserData);
      setProfile(mydata);
    } catch (error) { }
  };

  const GetDatafromApi = async () => {
    try {
      let data = await AsyncStorage.getItem("userDetails");
      data = JSON.parse(data);
      const queryParams = new URLSearchParams({ page: 1, limit: 100 }).toString();
      const response = await apiCallWithToken(
        `${apiServerUrl}/activity/getAllGroupActivity?${queryParams}`,
        "GET",
        null,
        data.authToken
      );
      setGroupActivities(response?.result?.groupActivityList);
    } catch (error) {
      console.log(error);
    }
  };

  const GetRequestedDatafromApi = async () => {
    try {
      let data = await AsyncStorage.getItem("userDetails");
      data = JSON.parse(data);
      const queryParams = new URLSearchParams({ page: 1, limit: 100, filter: "REQUESTED" }).toString();
      const response = await apiCallWithToken(
        `${apiServerUrl}/activity/getAllGroupActivity?${queryParams}`,
        "GET",
        null,
        data.authToken
      );
      setRequestedEvents(response?.result?.groupActivityList);
    } catch (error) {
      console.log(error);
    }
  };

  const GetCategoryData = async () => {
    try {
      const storedData = await AsyncStorage.getItem("userDetails");
      const data = JSON.parse(storedData);
      const response = await apiCallWithToken(
        `${apiServerUrl}/activity/getAllGroupActivityCategories?isAdmin=true`,
        "GET",
        null,
        data.authToken
      );
      if (response.responseCode === 200) {
        let filteredCategories = response.result.groupActivityCategoriesList || [];
        if (filteredCategories.length > 0) filteredCategories = filteredCategories.reverse();
        setActivityCategory(filteredCategories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getProfileDetails = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      if (!dbResult) throw new Error("No user details found");
      const userDetails = JSON.parse(dbResult);

      const response = await api.get(`${apiServerUrl}/user/viewUserProfile`, {
        headers: { authToken: userDetails.authToken },
        params: { userId: userDetails.id },
      });

      if (response.data.responseCode === 200) {
        const result = response.data.result;
        setShipId(result?.shipId);
        setDesignation(result?.designation);
        setDepartment(result?.department);

        if (result.shipId) {
          userDetails.shipId = result.shipId;
          await AsyncStorage.setItem("userDetails", JSON.stringify(userDetails));
        }

        if (result?.isBoarded?.allShips?.length > 0) {
          const userStatus = result.isBoarded.allShips[0].crewMembers.find(
            (crew) => crew.userId == userDetails.id
          );
          if (userStatus?.isBoarded) {
            setIsBoarded(true);
          } else {
            handleTabChange("PAST");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setDataLoaded(false);
    try {
      await Promise.all([
        GetDetails(),
        GetDatafromApi(),
        GetCategoryData(),
        GetRequestedDatafromApi(),
        getProfileDetails(),
        GetUserDetails()
      ]);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setDataLoaded(true);
    }
  }, []);

  // Handle refresh from notification
  useEffect(() => {
    if (route.params?.refresh) {
      fetchAllData();
      navigation.setParams({ refresh: false });
    }
  }, [route.params?.refresh]);

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [fetchAllData])
  );

  // Auto-scroll categories
  useEffect(() => {
    if (!ActivityCategory || ActivityCategory.length === 0 || !isAutoScrolling) return;

    const interval = setInterval(() => {
      if (flatListRef.current && ActivityCategory.length > 0) {
        let nextIndex = (currentIndex + 1) % ActivityCategory.length;
        setCurrentIndex(nextIndex);
        try {
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
            viewPosition: 0.5,
          });
        } catch (error) {
          console.warn("Scroll to index failed:", error);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, ActivityCategory, isAutoScrolling]);

  const handleScrollBegin = () => setIsAutoScrolling(false);
  const handleScrollEnd = () => setTimeout(() => setIsAutoScrolling(true), 5000);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index);
  }, []);

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };
  const getItemLayout = (data, index) => ({
    length: width * 0.4 + 10,
    offset: (width * 0.4 + 10) * index,
    index,
  });

  const onScrollToIndexFailed = (info) => {
    const { index } = info;
    setTimeout(() => {
      if (flatListRef.current && ActivityCategory?.length > 0) {
        const fallbackIndex = index >= ActivityCategory.length ? 0 : index;
        flatListRef.current.scrollToIndex({
          index: fallbackIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }
    }, 100);
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.horizontalCardWrapper, index !== 0 && { marginLeft: 10 }]}>
      <GroupActivity
        navigation={navigation}
        activity={item}
        screenName={"huddle"}
        menuVisible={menuVisible === item.id}
        setMenuVisible={setMenuVisible}
        onDelete={(id) => setOnGoingEvents(prev => prev.filter(i => i.id !== id))}
      />
    </View>
  );

  const renderDefaultActivityHorizontal = ({ item, index }) => (
    <View style={[styles.activityCategoryItem, index !== 0 && { marginLeft: 10 }]}>
      <DefaultActivits navigation={navigation} activity={item} index={index} />
    </View>
  );

  const handleViewAllactivity = (type) => {
    if (type === "ONGOING") navigation.navigate("ShowAllActivities", { data: onGoingEvents });
    else if (type === "REQUESTED" && designation === "Captain") navigation.navigate("ShowAllActivities", { data: requestedEvent });
    else if (type === "PAST") navigation.navigate("ShowAllActivities", { data: pastEvents });
  };

  const handleCardPress = useCallback((item) => navigation.navigate("CrewProfile", { item }), [navigation]);

  const renderLeaderboardItem = (item, index) => (
    <TouchableOpacity key={index} onPress={() => handleCardPress(item)}>
      <View style={{
        height: 120,
        marginVertical: 10,
        marginLeft: index !== 0 ? 20 : 10,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          height: 70,
          width: 70,
          borderRadius: 50,
          borderWidth: 0.5,
          borderColor: "#d5d5d5",
          overflow: 'hidden',
        }}>
          <FastImage
            source={{ uri: item.profileUrl || 'https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg' }}
            style={{ height: '100%', width: '100%' }}
            resizeMode="cover"
          />
        </View>
        <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 10, marginTop: 5 }}>
          {item?.rewardPoints || "0"} miles
        </Text>
        <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 10 }}>
          {item?.fullName?.split(" ")[0] || ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const filteredActivities = useMemo(() => {
    if (selectedStatus === "ONGOING") return onGoingEvents.slice(0, 5);
    if (selectedStatus === "PAST") return pastEvents.slice(0, 5);
    if (selectedStatus === "REQUESTED" && designation === "Captain") return requestedEvent.slice(0, 5);
    return [];
  }, [selectedStatus, onGoingEvents, pastEvents, requestedEvent, designation]);

  const now = new Date();
  const ongoingActivities = useMemo(() => {
    const list = groupActivities.filter(a => now <= new Date(a.endDateTime));
    setOnGoingEvents(list);
    return list;
  }, [groupActivities]);

  const pastActivities = useMemo(() => {
    const list = groupActivities.filter(a => now > new Date(a.endDateTime));
    setPastEvents(list);
    return list;
  }, [groupActivities]);

  const top3Employees = useMemo(() => {
    return [...employees]
      .sort((a, b) => (b.miles || 0) - (a.miles || 0))
      .slice(0, 3);
  }, [employees]);

  return (
    <>
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />

      {/* ROOT CONTAINER */}
      <View style={styles.root}>

        {/* HEADER */}
        <HuddleHeader />

        {/* CENTERED FULL-SCREEN LOADER */}
        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color={Colors.secondary} />
          </View>
        )}

        {/* MAIN CONTENT - Only after data is loaded */}
        {!loading && dataLoaded && (
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={{ paddingHorizontal: 15, paddingBottom: "20%" }}>
              {shipId ? (
                <>
                  {isBoarded ? (
                    <>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text style={[styles.sectionTitle, { marginTop: 20, fontSize: 30 }]}>BuddyUp!</Text>
                        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ marginRight: 9 }}>
                          <AntDesign name="infocirlce" size={18} color="gray" />
                        </TouchableOpacity>
                        <PersonalityResultInfoPopup
                          visible={modalVisible}
                          setModalVisible={setModalVisible}
                          screenName="Huddle"
                          content={
                            <>
                              <Text style={styles.popupTitle}>How Miles Work</Text>
                              <Text style={styles.popupText}>
                                Join or host BuddyUp events to earn miles, climb the leaderboard, and get recognized
                                by your crew and company.
                              </Text>
                              <Text style={styles.popupText}>
                                Your participation adds up — unlock badges, earn visibility, and become a recognised
                                name in your fleet.
                              </Text>
                              <Text style={styles.popupTitle}>Badge Milestones</Text>
                              <View style={styles.table}>
                                <View style={styles.row}>
                                  <Text style={styles.cellHeader}>Miles</Text>
                                  <Text style={styles.cellHeader}>Badge</Text>
                                </View>
                                <View style={styles.row}>
                                  <Text style={styles.cell}>500</Text>
                                  <Text style={styles.cell}>Beacon</Text>
                                </View>
                                <View style={styles.row}>
                                  <Text style={styles.cell}>1000</Text>
                                  <Text style={styles.cell}>Harbour</Text>
                                </View>
                                <View style={styles.row}>
                                  <Text style={styles.cell}>2000+</Text>
                                  <Text style={styles.cell}>Chief Anchor</Text>
                                </View>
                              </View>
                            </>
                          }
                        />
                      </View>

                      <Text style={{ marginHorizontal: 13, marginBottom: 12, fontFamily: 'Poppins-Regular', fontSize: 13 }}>
                        Unwind, connect with your crew, and get rewarded for making ship life more fun.
                      </Text>

                      <FlatList
                        ref={flatListRef}
                        data={ActivityCategory}
                        renderItem={renderDefaultActivityHorizontal}
                        keyExtractor={(item, index) => index.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 10 }}
                        snapToAlignment="center"
                        snapToInterval={width * 0.4 + 10}
                        decelerationRate="fast"
                        onScrollBeginDrag={handleScrollBegin}
                        onScrollEndDrag={handleScrollEnd}
                        viewabilityConfig={viewabilityConfig}
                        onViewableItemsChanged={onViewableItemsChanged}
                        getItemLayout={getItemLayout}
                        onScrollToIndexFailed={onScrollToIndexFailed}
                      />

                      {employees.length > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                          <View style={{ flexDirection: 'row' }}>
                            {top3Employees.map(renderLeaderboardItem)}
                          </View>
                          <TouchableOpacity
                            onPress={() => navigation.navigate("Leaderboard")}
                            style={{ marginBottom: 25, marginRight: 20 }}
                          >
                            <AntDesign name="arrowright" size={24} color='#666161' />
                          </TouchableOpacity>
                        </View>
                      )}

                      <TouchableOpacity
                        onPress={() => navigation.navigate("CreateGroupActivity")}
                        activeOpacity={0.5}
                        style={{
                          width: "100%",
                          backgroundColor: "#666161",
                          height: height * 0.045,
                          borderRadius: 10,
                          justifyContent: "center",
                          alignItems: "center",
                          marginVertical: 5,
                        }}
                      >
                        <Text style={{
                          color: "#fff",
                          fontSize: 14,
                          lineHeight: 18,
                          fontFamily: "Poppins-Regular",
                          textAlign: "center",
                        }}>
                          Create your BuddyUp Event
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.tabContainer}>
                        <TouchableOpacity
                          style={[styles.tab, selectedStatus === "ONGOING" && styles.activeTab]}
                          onPress={() => handleTabChange("ONGOING")}
                        >
                          <Text style={styles.tabText}>Ongoing</Text>
                          {selectedStatus === "ONGOING" && <View style={styles.underline} />}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.tab, selectedStatus === "PAST" && styles.activeTab]}
                          onPress={() => handleTabChange("PAST")}
                        >
                          <Text style={styles.tabText}>Past</Text>
                          {selectedStatus === "PAST" && <View style={styles.underline} />}
                        </TouchableOpacity>
                        {designation === "Captain" && (
                          <TouchableOpacity
                            style={[styles.tab, selectedStatus === "REQUESTED" && styles.activeTab]}
                            onPress={() => handleTabChange("REQUESTED")}
                          >
                            <Text style={styles.tabText}>Requested</Text>
                            {selectedStatus === "REQUESTED" && <View style={styles.underline} />}
                          </TouchableOpacity>
                        )}
                      </View>

                      <View style={{ alignItems: "flex-end", marginHorizontal: 5 }}>
                        {((selectedStatus === "ONGOING" && onGoingEvents.length > 5) ||
                          (selectedStatus === "PAST" && pastEvents.length > 5) ||
                          (selectedStatus === "REQUESTED" && designation === "Captain" && requestedEvent.length > 5)) ? (
                          <TouchableOpacity style={styles.ViewAllButton} onPress={() => handleViewAllactivity(selectedStatus)}>
                            <Text style={styles.ViewAllText}>View all</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.ViewAllButton} />
                        )}
                      </View>

                      {filteredActivities.length > 0 ? (
                        <FlatList
                          data={filteredActivities}
                          renderItem={renderItem}
                          keyExtractor={(item, index) => index.toString()}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                        />
                      ) : (
                        <View style={{
                          width: width - 28,
                          height: height * 0.2,
                          justifyContent: "center",
                          alignItems: "center",
                        }}>
                          <Text style={{
                            fontSize: 20,
                            color: "gray",
                            fontFamily: "Poppins-Regular",
                          }}>
                            No BuddyUp Event found!
                          </Text>
                        </View>
                      )}
                    </>
                  ) : (
                    /* NOT BOARDED - PAST TAB ONLY */
                    <>
                      <View style={styles.tabContainer}>
                        <TouchableOpacity
                          style={[styles.tab, selectedStatus === "PAST" && styles.activeTab]}
                          onPress={() => handleTabChange("PAST")}
                        >
                          <Text style={styles.tabText}>Past</Text>
                          {selectedStatus === "PAST" && <View style={styles.underline} />}
                        </TouchableOpacity>
                      </View>

                      <View style={{ alignItems: "flex-end", marginHorizontal: 5 }}>
                        {(selectedStatus === "PAST" && pastEvents.length > 5) ? (
                          <TouchableOpacity style={styles.ViewAllButton} onPress={() => handleViewAllactivity("PAST")}>
                            <Text style={styles.ViewAllText}>View all</Text>
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.ViewAllButton} />
                        )}
                      </View>

                      {filteredActivities.length > 0 ? (
                        <FlatList
                          data={filteredActivities}
                          renderItem={renderItem}
                          keyExtractor={(item, index) => index.toString()}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                        />
                      ) : (
                        <View style={{
                          width: width - 28,
                          height: height * 0.2,
                          justifyContent: "center",
                          alignItems: "center",
                        }}>
                          <Text style={{
                            fontSize: 20,
                            color: "gray",
                            fontFamily: "Poppins-Regular",
                          }}>
                            No BuddyUp Event found!
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </>
              ) : department === 'Shore_Staff' ? (
                <View style={{
                  flex: 1,
                  width: '100%',
                  height: height * 0.8,
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  <Text style={{
                    fontSize: 16,
                    color: "gray",
                    fontFamily: "Poppins-SemiBold",
                    textAlign: 'center',
                    paddingHorizontal: 20,
                  }}>
                    This section is applicable only for ship staff signed onboard vessel
                  </Text>
                </View>
              ) : (
                <View style={{
                  flex: 1,
                  width: '100%',
                  height: height * 0.8,
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                  <Text style={{
                    fontSize: 16,
                    color: "gray",
                    fontFamily: "Poppins-SemiBold",
                    textAlign: 'center',
                    paddingHorizontal: 20,
                  }}>
                    You're not currently part of any ship.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginBottom: 5,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    zIndex: 9999,
  },
  ViewAllButton: {
    height: height * 0.04,
    justifyContent: "center",
    alignItems: "center",
  },
  ViewAllText: {
    color: "#949494",
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 17,
    marginVertical: 12,
    marginHorizontal: 13,
    color: "grey",
    fontWeight: "700",
    lineHeight: 37,
    fontFamily: "Poppins-Regular",
  },
  horizontalCardWrapper: {
    marginBottom: 10,
  },
  activityCategoryItem: {
    width: width * 0.4,
    justifyContent: "center",
    alignItems: "center",
  },
  popupTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 6,
    color: "#000",
    fontFamily: "Poppins-SemiBold",
  },
  popupText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#454545",
    fontFamily: "Poppins-Regular",
    marginBottom: 4,
  },
  table: {
    marginTop: 8,
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cellHeader: {
    fontWeight: "bold",
    fontSize: 12,
    width: "50%",
    fontFamily: "Poppins-SemiBold",
  },
  cell: {
    fontSize: 12,
    width: "50%",
    fontFamily: "Poppins-Regular",
  },
  tabContainer: {
    borderColor: 'black',
    borderWidth: 1.5,
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
    margin: 5,
  },
  activeTab: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: Colors.secondary,
  },
  tabText: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    width: '99%',
    borderRadius: 5,
    alignSelf: 'center',
  },
});

export default Huddle;