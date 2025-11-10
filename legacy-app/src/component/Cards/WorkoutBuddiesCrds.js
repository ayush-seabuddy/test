import React, { useCallback, useEffect, useState, memo } from "react";
import {
  Text,
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import { BlurView } from "@react-native-community/blur";
import { Menu, Divider } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import DefaultActivity from "../ProfileListComponents/DefaultActivity";
import { apiServerUrl } from "../../Api";
import { Color, FontSize, Gap, Padding, Border, FontFamily } from "../../GlobalStyle";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

const WorkoutBuddiesCrds = ({
  activity,
  setJoinedPeople,
  setIsAnotherUserJoined,
  setIsJoined,
  setPeopleDetails,
  setIsEventEnded,
  setIsEventStarted,
  setEventDetail,
  completionImages,
  reload,
  setReload,
}) => {
  const navigation = useNavigation();
  const [state, setState] = useState({
    joinedPeople: [],
    currentDate: new Date(),
    peopleDetails: null,
    yourActivity: false,
    isCreatedByMe: false,
    visible: false,
    isPosted: false,
  });

  const { joinedPeople, currentDate, peopleDetails, yourActivity, isCreatedByMe, visible, isPosted } = state;

  const openMenu = () => setState((prev) => ({ ...prev, visible: !prev.visible }));
  const closeMenu = () => setState((prev) => ({ ...prev, visible: false }));
  const { t } = useTranslation();
  const fetchUserDetails = async () => {
    try {
      const dbResult = await AsyncStorage.getItem("userDetails");
      return JSON.parse(dbResult);
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  const handleLeaveEvent = async () => {
    try {
      const userDetails = await fetchUserDetails();
      if (!userDetails) return;

      const updatedPeople = joinedPeople.filter((item) => item.id !== userDetails.id);
      const ids = updatedPeople.map((person) => person.id);

      const response = await axios.post(
        `${apiServerUrl}/activity/addUpdateGroupActivity`,
        { groupActivities: [{ eventId: activity.id, joinedPeople: ids }] },
        { headers: { authToken: userDetails.authToken } }
      );

      if (response.data.responseCode === 200) {
        await getDetails(userDetails);
      }
    } catch (error) {
      console.error("Error in leave event:", error);
    } finally {
      closeMenu();
    }
  };

  const getDetails = async (userDetails) => {
    try {
      const response = await axios.get(
        `${apiServerUrl}/activity/viewGroupActivityDetails`,
        {
          headers: { authToken: userDetails.authToken },
          params: { eventId: activity.id },
        }
      );

      if (response.data.responseCode === 200) {
        const eventData = response.data.result;
        const joinedPeopleList = Array.isArray(eventData.joinedPeople) ? eventData.joinedPeople : [];
        const currentTime = new Date();
        const startTime = new Date(eventData.startDateTime);
        const endTime = new Date(eventData.endDateTime);

        setState((prev) => ({
          ...prev,
          joinedPeople: eventData.enrichedJoinedPeople,
          peopleDetails: eventData,
          isPosted: eventData.userId === userDetails.id,
          yourActivity: userDetails.id === eventData.userId,
        }));

        setJoinedPeople(joinedPeopleList);
        setIsAnotherUserJoined(joinedPeopleList.includes(userDetails.id));
        setIsJoined(userDetails.id === eventData.userId);
        setPeopleDetails(eventData);
        setIsEventEnded(currentTime > endTime);
        setIsEventStarted(currentTime >= startTime);
        setEventDetail(eventData);
        setReload(false);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const userDetails = await fetchUserDetails();
      if (userDetails?.id === activity?.activityUser?.id) {
        setState((prev) => ({ ...prev, isCreatedByMe: true }));
      }
    };
    initialize();
  }, [activity]);

  useEffect(() => {
    if (reload) {
      fetchUserDetails().then(getDetails);
    }
  }, [reload]);

  const getFormattedDates = (year, month) => {
    const dates = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      dates.push({
        fullDate: date.toDateString(),
        date: date.getDate(),
        month: date.toLocaleString("default", { month: "short" }),
        day: date.toLocaleString("default", { weekday: "short" }),
        isToday:
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
      });
    }
    return dates;
  };

  const dates = getFormattedDates(currentDate.getFullYear(), currentDate.getMonth());

  useFocusEffect(
    useCallback(() => {
      fetchUserDetails().then(getDetails);
      return () => { };
    }, [])
  );

  const handleCardPress = (item) => {
    navigation.navigate("CrewProfile", { item });
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.horizontalCardWrapper, index !== 0 && { marginLeft: 10 }]}>
      <DefaultActivity
        navigation={navigation}
        activity={item}
        uri={item}
        description={activity?.description}
      />
    </View>
  );

  return (
    <View style={styles.crew}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginBottom: completionImages ? 20 : 0 }}
        nestedScrollEnabled
        contentContainerStyle={{ paddingTop: height * 0.4 }}
      >
        <View style={styles.frameParent}>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={30} />
            <View style={[styles.compatibleCrewMatesParent, styles.crewParentFlexBox]}>
              <Text style={styles.categoryName}>
                {activity?.eventName || ""}
              </Text>
              {yourActivity ? (
                !isPosted && (
                  <Menu
                    visible={visible}
                    onDismiss={closeMenu}
                    anchorPosition="bottom"
                    style={visible && Platform.OS === "android" ? { marginTop: 15, backgroundColor: "white" } : { backgroundColor: "white" }}
                    anchor={
                      <TouchableOpacity style={[styles.baseIconsWrapper, styles.crewParentFlexBox]} onPress={openMenu}>
                        <Image style={styles.baseIcons} source={ImagesAssets.dots} />
                      </TouchableOpacity>
                    }
                  >
                    <Menu.Item
                      style={{ height: 35 }}
                      onPress={() => {
                        closeMenu();
                        navigation.navigate("NewGroupActivityPost", { peopleDetails });
                      }}
                      title={t('shareasapost')}
                    />
                  </Menu>
                )
              ) : peopleDetails?.isJoined && !peopleDetails?.isStarted ? (
                <Menu
                  visible={visible}
                  onDismiss={closeMenu}
                  anchorPosition="bottom"
                  style={{ marginTop: 10, backgroundColor: "white" }}
                  anchor={
                    <TouchableOpacity style={[styles.baseIconsWrapper, styles.crewParentFlexBox]} onPress={openMenu}>
                      <Image style={styles.baseIcons} source={ImagesAssets.dots} />
                    </TouchableOpacity>
                  }
                >
                  <Menu.Item
                    style={{ height: 35 }}
                    titleStyle={{ color: "red" }}
                    onPress={handleLeaveEvent}
                    title={t('leaveaevent')}
                  />
                </Menu>
              ) : null}
            </View>
            <View style={styles.organizerContainer}>
              <Text style={styles.organizerText}>
                {t('organizedBy')} {isCreatedByMe ? t('you') : activity?.activityUser?.fullName || "Unknown"}
              </Text>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsText}>
                  {activity?.groupActivityCategory?.points || "10"} {t('points')}
                </Text>
              </View>
            </View>
          </View>

          {/* Schedule and Description Section */}
          <View style={styles.scheduleContainer}>
            <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={30} />
            <Text style={styles.sectionTitle}>{t('schedule')}</Text>
            <View style={styles.container1}>
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.label}>{t('starttime')}</Text>
                  <Text style={styles.time}>
                    {peopleDetails && moment(peopleDetails.startDateTime).format("D MMM YYYY, h:mm A")}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>{t('endtime')}</Text>
                  <Text style={styles.time}>
                    {peopleDetails && moment(peopleDetails.endDateTime).format("D MMM YYYY, h:mm A")}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.sectionTitle}>{t('description')}</Text>
            <View style={styles.container1}>
              <View style={styles.card}>
                <Text style={styles.label}>{peopleDetails?.description}</Text>
              </View>
            </View>
          </View>

          {/* Joined Buddies Section */}
          <View style={styles.joinedBuddiesContainer}>
            <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={30} />
            <Text style={styles.compatibleCrewMates}>{t('joinedbuddies')}</Text>
            <View style={styles.joinedBuddiesList}>
              {joinedPeople.length === 0 ? (
                <Text style={styles.noParticipantsText}>{t('noparticipantsjoined')}</Text>
              ) : (
                joinedPeople.slice(0, 10).map((person, index) => (
                  <TouchableOpacity key={person?.id || index} onPress={() => handleCardPress(person)}>
                    <Image
                      style={styles.profileImage}
                      resizeMode="cover"
                      source={
                        person?.profileUrl
                          ? { uri: person.profileUrl }
                          : { uri: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png" }
                      }
                    />
                  </TouchableOpacity>
                ))
              )}
              {joinedPeople.length > 10 && (
                <View style={styles.overflowContainer}>
                  <Image style={styles.profileImage} resizeMode="cover" source={ImagesAssets.ellipsimage} />
                  <View style={styles.overflowOverlay}>
                    <Text style={styles.overflowText}>+{joinedPeople.length - 10}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Uploaded Content Section */}
          {completionImages?.length > 0 && (
            <View style={styles.uploadedContentContainer}>
              <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={30} />
              <Text style={styles.compatibleCrewMates}>{t('uploadedcontent')}</Text>
              <Text style={styles.compatibleDescription}>{peopleDetails?.completionDescription}</Text>
              <FlatList
                data={completionImages}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={{ width: "100%" }}
                keyExtractor={(item, index) => `${item.id || index}`}
                renderItem={renderItem}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  crew: {
    borderRadius: 16,
    height: height * 0.9,
    width: "100%",
    paddingTop: "30%",
  },
  frameParent: {
    borderRadius: 16,
    width: "100%",
    paddingHorizontal: Padding.p_base,
  },
  crewParentFlexBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerContainer: {
    backgroundColor: "#B4B4B499",
    padding: 14,
    borderRadius: 16,
    overflow: "hidden",
  },
  scheduleContainer: {
    backgroundColor: "rgba(180, 180, 180, 0.8)",
    marginTop: 10,
    borderRadius: 16,
    padding: 10,
    overflow: "hidden",
  },
  joinedBuddiesContainer: {
    backgroundColor: "#B4B4B499",
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
    marginBottom: 50,
    overflow: "hidden",
  },
  uploadedContentContainer: {
    backgroundColor: "#B4B4B499",
    padding: 14,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 30,
    overflow: "hidden",
  },
  compatibleCrewMatesParent: {
    justifyContent: "space-between",
    alignSelf: "stretch",
  },
  categoryName: {
    width: "90%",
    fontSize: 16,
    color: "white",
    fontWeight: "700",
    fontFamily: "Poppins-Bold",
  },
  baseIconsWrapper: {
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  baseIcons: {
    width: 20,
    height: 20,
  },
  organizerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  organizerText: {
    fontSize: 12,
    color: "white",
    fontFamily: "Poppins-Regular",
  },
  pointsBadge: {
    borderRadius: 10,
    backgroundColor: "#FBCF21",
  },
  pointsText: {
    color: "black",
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 10,
  },
  sectionTitle: {
    color: "#000",
    fontSize: 16,
    fontFamily: "WhyteInktrap-Bold",
    textTransform: "capitalize",
    paddingTop: Platform.OS === "ios" ? 10 : 0,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  container1: {
    width: "95%",
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  card: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
  time: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },
  compatibleCrewMates: {
    width: "90%",
    fontSize: 16,
    lineHeight: 25,
    fontFamily: "WhyteInktrap-Medium",
    color: "#262626",
    fontWeight: "500",
  },
  compatibleDescription: {
    width: "90%",
    fontSize: 11,
    lineHeight: 25,
    fontFamily: "WhyteInktrap-Medium",
    color: "#262626",
    fontWeight: "500",
    marginTop: 10,
  },
  joinedBuddiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  noParticipantsText: {
    width: "100%",
    fontFamily: "Poppins-Regular",
  },
  profileImage: {
    height: 50,
    width: 50,
    borderRadius: 100,
  },
  overflowContainer: {
    position: "relative",
    borderRadius: 50,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  overflowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overflowText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  dateItem: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginRight: 10,
    borderRadius: 30,
    width: 45,
    alignItems: "center",
  },
  dateText1: {
    fontSize: 12,
    color: "#000",
    fontWeight: "500",
  },
  horizontalCardWrapper: {
    marginLeft: 10,
  },
});

export default memo(WorkoutBuddiesCrds);