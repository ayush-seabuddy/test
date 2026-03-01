import {
  getalladminbuddyupcategories,
  GETALLBUDDYUPEVENTS,
  getleaderboard,
  viewProfile,
} from "@/src/apis/apiService";
import CommonLoader from "@/src/components/CommonLoader";
import EmptyComponent from "@/src/components/EmptyComponent";
import GlobalPopOver from "@/src/components/GlobalPopover";
import { showToast } from "@/src/components/GlobalToast";
import AdminBuddyUpCategory from "@/src/components/ShipLifeComponent/AdminBuddyUpCategory";
import BuddyUpEventCard from "@/src/components/ShipLifeComponent/BuddyUpEventCard";
import HowMilesWorkPopup from "@/src/components/ShipLifeComponent/HowMilesWorkPopup";
import TopThreeEmployees from "@/src/components/ShipLifeComponent/TopThreeEmployees";
import ShipLifeScreenHeader from "@/src/components/ShipLifeScreenHeader";
import { useNetwork } from "@/src/hooks/useNetworkStatusHook";
import Colors from "@/src/utils/Colors";
import { getUserDetails } from "@/src/utils/helperFunctions";
import { Logger } from "@/src/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import LottieView from "lottie-react-native";
import { InfoIcon } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height } = Dimensions.get("screen");

interface AdminBuddyUpCategoryType {
  id: string;
  categoryName: string;
  categoryImage: string;
}

interface BuddyUpEvent {
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

interface TopEmployee {
  id: string;
  fullName: string;
  profileUrl: string;
  rewardPoints: string;
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
  | { type: "header" }
  | { type: "description" }
  | { type: "categories"; data: AdminBuddyUpCategoryType[] }
  | { type: "leaderboard"; data: TopEmployee[] }
  | { type: "createButton" }
  | { type: "filter" }
  | { type: "viewall" }
  | { type: "events"; data: BuddyUpEvent[] };

const ShipLifeScreen = () => {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState<
    "ON_GOING" | "PAST" | "REQUESTED"
  >("ON_GOING");
  const isOnline = useNetwork();
  const [buddyupCategory, setbuddyupCategory] = useState<
    AdminBuddyUpCategoryType[]
  >([]);
  const [ongoingEvents, setOngoingEvents] = useState<BuddyUpEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<BuddyUpEvent[]>([]);
  const [requestedEvents, setRequestedEvents] = useState<BuddyUpEvent[]>([]);

  const [isBoarded, setIsBoarded] = useState(false);
  const [shipId, setShipId] = useState<string | null>(null);
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [topEmployee, settopEmployee] = useState<TopEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loggeduserData, setloggeduserData] = useState<LoggedUserData | null>(
    null,
  );

  // Handle event deletion from child component
  const handleEventDeleted = useCallback((eventId: string) => {
    // Remove from all event lists to ensure consistency
    setOngoingEvents((prev) => prev.filter((item) => item.id !== eventId));
    setPastEvents((prev) => prev.filter((item) => item.id !== eventId));
    setRequestedEvents((prev) => prev.filter((item) => item.id !== eventId));
  }, []);

  // Currently displayed events (limited to 5)
  const displayedEvents = useMemo(() => {
    if (selectedStatus === "ON_GOING") return ongoingEvents.slice(0, 5);
    if (selectedStatus === "PAST") return pastEvents.slice(0, 5);
    if (selectedStatus === "REQUESTED") return requestedEvents.slice(0, 5);
    return [];
  }, [selectedStatus, ongoingEvents, pastEvents, requestedEvents]);

  // Full list for "View All" check
  const getFullEventsList = () => {
    if (selectedStatus === "ON_GOING") return ongoingEvents;
    if (selectedStatus === "PAST") return pastEvents;
    if (selectedStatus === "REQUESTED") return requestedEvents;
    return [];
  };

  const showViewAll = getFullEventsList().length > 5;

  // Load user from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUserDetails();
      try {
        const parsed =
          typeof userData === "string" ? JSON.parse(userData) : userData;
        setloggeduserData(parsed);
      } catch (e) {
        Logger.error("Parsing User Error:", { Error: String(e) });
      }
    };
    loadUser();
  }, []);

  const fetchEventsOnFocus = async () => {
    if (!isOnline) return;
    try {
      const [ongoingRes, pastRes] = await Promise.all([
        GETALLBUDDYUPEVENTS({ page: 1, limit: 10, eventType: "ON_GOING" }),
        GETALLBUDDYUPEVENTS({ page: 1, limit: 10, eventType: "PAST" }),
      ]);

      if (ongoingRes.success && ongoingRes.status === 200) {
        setOngoingEvents(ongoingRes.data.groupActivityList ?? []);
      }

      if (pastRes.success && pastRes.status === 200) {
        setPastEvents(pastRes.data.groupActivityList ?? []);
      }
      if (designation === "Captain") {
        const requestedRes = await GETALLBUDDYUPEVENTS({
          page: 1,
          limit: 10,
          filter: "REQUESTED",
        });

        if (requestedRes.success && requestedRes.status === 200) {
          setRequestedEvents(requestedRes.data.groupActivityList ?? []);
        }
      }
    } catch (err) {
      showToast.error(t("oops"), t("somethingwentwrong"));
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (loggeduserData?.id && isOnline) {
        fetchEventsOnFocus();
      }
    }, [loggeduserData?.id, isOnline]),
  );

  // Reset data when going offline
  useEffect(() => {
    if (!isOnline) {
      // Optional: clear data when offline to force fresh fetch when back online
      setbuddyupCategory([]);
      setOngoingEvents([]);
      setPastEvents([]);
      setRequestedEvents([]);
      settopEmployee([]);
      setIsLoading(false);
    }
  }, [isOnline]);

  const fetchAllData = useCallback(async () => {
    if (!isOnline) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [
        adminbuddyRes,
        topemployeeRes,
        ongoingRes,
        pastRes,
        viewprofileRes,
      ] = await Promise.all([
        getalladminbuddyupcategories({ isAdmin: true }),
        getleaderboard({ isZero: false }),
        GETALLBUDDYUPEVENTS({ page: 1, limit: 10, eventType: "ON_GOING" }),
        GETALLBUDDYUPEVENTS({ page: 1, limit: 10, eventType: "PAST" }),
        viewProfile({ userId: loggeduserData?.id }),
      ]);

      // Categories
      if (adminbuddyRes.success && adminbuddyRes.status === 200) {
        setbuddyupCategory(
          adminbuddyRes.data.groupActivityCategoriesList ?? [],
        );
      } else {
        showToast.error(t("oops"), adminbuddyRes.message);
      }

      // Leaderboard
      if (topemployeeRes.success && topemployeeRes.status === 200) {
        settopEmployee(topemployeeRes.data.allUsers?.usersList ?? []);
      } else {
        showToast.error(t("oops"), topemployeeRes.message);
      }

      // Ongoing Events
      if (ongoingRes.success && ongoingRes.status === 200) {
        setOngoingEvents(ongoingRes.data.groupActivityList ?? []);
      } else {
        showToast.error(t("oops"), ongoingRes.message);
      }

      // Past Events
      if (pastRes.success && pastRes.status === 200) {
        setPastEvents(pastRes.data.groupActivityList ?? []);
      } else {
        showToast.error(t("oops"), pastRes.message);
      }

      // Profile & Boarding Status
      if (viewprofileRes.success && viewprofileRes.status === 200) {
        setShipId(viewprofileRes.data.shipId);
        setDesignation(viewprofileRes.data.designation);
        setDepartment(viewprofileRes.data.department);

        if (viewprofileRes.data.shipId && loggeduserData) {
          loggeduserData.shipId = viewprofileRes.data.shipId;
          await AsyncStorage.setItem(
            "userDetails",
            JSON.stringify(loggeduserData),
          );
        }

        if (viewprofileRes.data?.isBoarded?.allShips?.length > 0) {
          const userStatus =
            viewprofileRes.data.isBoarded.allShips[0].crewMembers.find(
              (crew: any) => crew.userId === loggeduserData?.id,
            );
          if (userStatus?.isBoarded) {
            setIsBoarded(true);
          } else {
            setSelectedStatus("PAST"); // Default to PAST if not boarded
          }
        }
      } else {
        showToast.error(t("oops"), viewprofileRes.message);
      }
    } catch (err) {
      showToast.error(t("oops"), t("somethingwentwrong"));
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, loggeduserData?.id, t, loggeduserData]);

  // Only fetch when we have user & online
  useEffect(() => {
    if (loggeduserData?.id && isOnline) {
      fetchAllData();
    } else if (!isOnline) {
      setIsLoading(false);
    }
  }, [loggeduserData?.id, isOnline, fetchAllData]);

  // Fetch requested events only when Captain selects the tab (lazy load)
  const fetchRequestedEvents = async () => {
    if (!isOnline || requestedEvents.length > 0 || designation !== "Captain")
      return;

    try {
      const res = await GETALLBUDDYUPEVENTS({
        page: 1,
        limit: 10,
        filter: "REQUESTED",
      });
      if (res.success && res.status === 200) {
        setRequestedEvents(res.data.groupActivityList ?? []);
      } else {
        showToast.error(t("oops"), res.message);
      }
    } catch {
      showToast.error(t("oops"), t("somethingwentwrong"));
    }
  };

  const handleTabChange = (status: "ON_GOING" | "PAST" | "REQUESTED") => {
    setSelectedStatus(status);
    if (status === "REQUESTED" && designation === "Captain") {
      fetchRequestedEvents();
    }
  };

  const handleViewAll = () => {
    const eventType = selectedStatus;
    router.push({
      pathname: "/viewallbuddyupevents",
      params: {
        eventType: eventType,
      },
    });
  };

  const computeData = (): ListItem[] => {
    const listData: ListItem[] = [];

    if (isBoarded) {
      listData.push({ type: "header" });
      listData.push({ type: "description" });
      listData.push({ type: "categories", data: buddyupCategory });
      listData.push({ type: "leaderboard", data: topEmployee });
      listData.push({ type: "createButton" });
    }

    listData.push({ type: "filter" });

    if (showViewAll) {
      listData.push({ type: "viewall" });
    }

    listData.push({ type: "events", data: displayedEvents });

    return listData;
  };

  const renderItem: ListRenderItem<ListItem> = ({ item }) => {
    switch (item.type) {
      case "header":
        return (
          <View style={styles.titleView}>
            <Text style={styles.buddyuptext}>{t("buddyup")}</Text>
            <GlobalPopOver
              showOkButton
              buttonText={t("close")}
              buttonStyle={styles.okBtnStyle}
              popOverContent={<HowMilesWorkPopup />}
            >
              <InfoIcon size={20} color={Colors.grayDark} />
            </GlobalPopOver>
          </View>
        );

      case "description":
        return (
          <Text style={styles.buddyupdescription}>
            {t("buddyup_description")}
          </Text>
        );

      case "categories":
        return <AdminBuddyUpCategory buddyupCategory={item.data} />;

      case "leaderboard":
        return <TopThreeEmployees topEmployee={item.data} />;

      case "createButton":
        return (
          <TouchableOpacity
            style={styles.createyourbuddyupButton}
            onPress={() => {
              router.push("/createyourbuddyupevent");
            }}
          >
            <Text style={styles.createyourbuddyupText}>
              {t("createyourbuddyup")}
            </Text>
          </TouchableOpacity>
        );

      case "filter":
        return (
          <View style={styles.tabContainer}>
            {isBoarded && (
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedStatus === "ON_GOING" && styles.activeTab,
                ]}
                onPress={() => handleTabChange("ON_GOING")}
              >
                <Text style={styles.tabText}>{t("ongoing")}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.tab,
                selectedStatus === "PAST" && styles.activeTab,
              ]}
              onPress={() => handleTabChange("PAST")}
            >
              <Text style={styles.tabText}>{t("past")}</Text>
            </TouchableOpacity>
            {isBoarded && designation === "Captain" && (
              <TouchableOpacity
                style={[
                  styles.tab,
                  selectedStatus === "REQUESTED" && styles.activeTab,
                ]}
                onPress={() => handleTabChange("REQUESTED")}
              >
                <Text style={styles.tabText}>{t("requested")}</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case "viewall":
        return (
          <View
            style={{
              alignItems: "flex-end",
              marginHorizontal: 5,
              marginBottom: 5,
            }}
          >
            <TouchableOpacity
              style={styles.ViewAllButton}
              onPress={handleViewAll}
            >
              <Text style={styles.ViewAllText}>{t("viewall")}</Text>
            </TouchableOpacity>
          </View>
        );

      case "events":
        if (item.data.length > 0) {
          return (
            <BuddyUpEventCard
              buddyupevents={item.data}
              onEventDeleted={handleEventDeleted}
            />
          );
        } else {
          return (
            <View
              style={{
                width: "100%",
                height: height * 0.4,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <EmptyComponent text={t("nobuddyupfound")} />
            </View>
          );
        }

      default:
        return null;
    }
  };

  const keyExtractor = (item: ListItem, index: number) =>
    `${item.type}-${index}`;

  if (!isOnline) {
    return (
      <View style={styles.main}>
        <ShipLifeScreenHeader />
        <View style={styles.centerContainer}>
          <EmptyComponent text={t("nointernetconnection")} />
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.main}>
        <ShipLifeScreenHeader />
        <View style={styles.fullScreenLoader}>
          <CommonLoader fullScreen />
        </View>
      </View>
    );
  }

  if (!shipId) {
    return (
      <View style={styles.main}>
        <ShipLifeScreenHeader />
        <View style={styles.centerContainer}>
          <LottieView
            source={require("../../assets/Ship.json")}
            autoPlay
            loop
            style={styles.animation}
          />
          <Text style={styles.notOnShipText}>{t("youarenotonanyship")}</Text>
        </View>
      </View>
    );
  }

  if (department === "Shore_Staff") {
    return (
      <View style={styles.main}>
        <ShipLifeScreenHeader />
        <View style={styles.centerContainer}>
          <Text style={styles.shoreStaffText}>
            {t("thissectionapplicableforshipstaff")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <ShipLifeScreenHeader />
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
    </View>
  );
};

export default ShipLifeScreen;

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "#f5f5f5" },
  flatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 30,
  },

  titleView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tabContainer: {
    borderColor: "#ededed",
    borderWidth: 0.5,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: "white",
    flexDirection: "row",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    alignItems: "center",
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
    color: "black",
    fontFamily: "Poppins-Regular",
  },
  animation: {
    width: 250,
    height: 250,
  },
  buddyuptext: {
    fontSize: 25,
    fontWeight: "600",
    color: "grey",
    fontFamily: "Poppins-SemiBold",
  },
  buddyupdescription: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: "grey",
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
    backgroundColor: "#fff",
  },
  ViewAllButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  ViewAllText: {
    color: "#949494",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: "30%",
  },
  notOnShipText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#8A8A8A",
    textAlign: "center",
  },
  shoreStaffText: {
    fontSize: 16,
    color: "gray",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
