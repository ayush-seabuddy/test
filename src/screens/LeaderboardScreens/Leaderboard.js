import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Image,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import Colors from "../../colors/Colors";
import { BlurView } from "@react-native-community/blur";
import LeaderboardHeader from "../../component/headers/LeaderboardHeaders/LeaderboardHeader";
import BestEmployeeCard from "../../component/Cards/LeaderboardCards/BestEmployeeCard";
import LeaderboardCard from "../../component/Cards/LeaderboardCards/LeaderboardCard";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiServerUrl, formatShipName } from "../../Api";
import axios from "axios";
import RBSheet from "react-native-raw-bottom-sheet";
import DropdownFieldIOS from "../../component/DropdownIOS";
import Loader from "../../component/Loader";
import FastImage from "react-native-fast-image";
import PersonalityResultInfoPopup from "../PersonalityMapInfoPopup";
import AntDesign from 'react-native-vector-icons/AntDesign';

const { width, height } = Dimensions.get("window");

const Leaderboard = ({ navigation }) => {
  const refRBSheet = useRef(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [topEmployee, setTopEmployee] = useState([]);
  const [allData, setAllData] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFavourite, setSelectedFavourite] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedFull, setSelectedFull] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [sailorsPopup, setSailorsPopup] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(50);
  const [isSailorsVisible, setIsSailorsVisible] = useState(false);

  const clearFilter = () => {
    setSelectedFavourite([]);
  };

  const clearFilterdate = () => {
    setSelectedShip("");
    setSelectedDesignation("");
    setEmployee(allData);
    setCurrentPage(1);
    GetDetails(1, true);
    refRBSheet.current.close();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => ({
    label: (2020 + i).toString(),
    value: 2020 + i,
  }));

  const handleCardPress = (item) => {
    navigation.navigate("CrewProfile", { item });
  };

  const GetDetails = async (page = 1, clear = false) => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    setUserDetails(userDetails);

    let params = { page, limit };
    if (!clear && selectedShip) {
      params.shipId = selectedShip;
    }
    if (!clear && selectedDesignation) {
      params.designation = selectedDesignation;
    }

    try {
      setIsLoading(true);
      const response = await axios({
        method: "GET",
        url: `${apiServerUrl}/user/getUserLeaderBoard`,
        headers: {
          authToken: userDetails.authToken,
        },
        params,
      });

      async function assignRanks(users) {
        users.sort((a, b) => Number(b.rewardPoints) - Number(a.rewardPoints));

        let ranks = [];
        let currentRank = 1;

        for (let i = 0; i < users.length; i++) {
          if (i > 0 && Number(users[i].rewardPoints) === Number(users[i - 1].rewardPoints)) {
            ranks[i] = currentRank;
          } else {
            currentRank = i + 1;
            ranks[i] = currentRank;
          }
        }

        return users.map((user, index) => ({
          ...user,
          rank: ranks[index]
        }));
      }

      if (response.data.responseCode === 200) {
        console.log('====================================');
        console.log(response.data.result);
        console.log('====================================');
        const filteredTopEmployees = response.data.result.topEmployees.filter(
          (employee) => Number(employee.rewardPoints) > 0
        );

        setIsSailorsVisible(filteredTopEmployees.length > 0);
        setTopEmployee(filteredTopEmployees);

        if (page === 1) {
          let data = await assignRanks(response.data.result.allUsers.usersList || []);
          setEmployee(data);
          setAllData(response.data.result.allUsers.usersList);
        } else {
          let data = await assignRanks([...allData, ...response.data.result.allUsers.usersList] || []);
          setEmployee(data);
          setAllData((prev) => [...prev, ...response.data.result.allUsers.usersList]);
        }
        setCurrentPage(response.data.result.allUsers.currentPage);
        setTotalPages(response.data.result.allUsers.totalPages);
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      GetDetails(1);
      return () => { };
    }, [selectedFull, selectedFavourite])
  );

  const [shipDropdown, setShipDropdown] = useState([]);
  const [selectedShip, setSelectedShip] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState("");

  const designationDropDown = [
    { label: "Captain", value: "Captain" },
    { label: "Chief officer", value: "Chief officer" },
    { label: "Second officer", value: "Second officer" },
    { label: "Third officer", value: "Third officer" },
    { label: "Deck cadet", value: "Deck cadet" },
    { label: "Deck Fitter", value: "Deck Fitter" },
    { label: "Bosun", value: "Bosun" },
    { label: "Able seaman", value: "Able seaman" },
    { label: "Ordinary Seaman", value: "Ordinary Seaman" },
    { label: "Chief cook", value: "Chief cook" },
    { label: "Messman", value: "Messman" },
    { label: "Chief engineer", value: "Chief engineer" },
    { label: "Second engineer", value: "Second engineer" },
    { label: "Third engineer", value: "Third engineer" },
    { label: "Fourth engineer", value: "Fourth engineer" },
    { label: "Junior engineer", value: "Junior engineer" },
    { label: "Engine cadet", value: "Engine cadet" },
    { label: "Electrical engineer / ETO", value: "Electrical engineer / ETO" },
    { label: "Electrical cadet", value: "Electrical cadet" },
    { label: "Engine fitter", value: "Engine fitter" },
    { label: "Motorman/ Oiler ", value: "Motorman/ Oiler " },
    { label: "Wiper", value: "Wiper" },
  ];

  const getShipList = async () => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);

    try {
      setIsLoading(true);
      const response = await axios({
        method: "GET",
        url: `${apiServerUrl}/company/getAllShipsList?employerId=${userDetails.employerId}`,
        headers: {
          authToken: userDetails.authToken,
        },
      });
      if (response.data.responseCode === 200) {
        if (response.data.result.length > 0) {
          const shipList = response.data.result.map((item) => ({
            label: formatShipName(item?.shipName),
            value: item.id,
          }));
          setShipDropdown(shipList);
        } else {
          setShipDropdown([]);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getShipList();
      return () => { };
    }, [])
  );

  const handleLoadMore = () => {
    if (currentPage < totalPages && !isLoading) {
      GetDetails(currentPage + 1);
    }
  };

  const applyFilter = () => {
    setCurrentPage(1);
    GetDetails(1);
    refRBSheet.current.close();
  };

  return (
    <View style={styles.container}>
      <LeaderboardHeader navigation={navigation} />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      {isLoading && <Loader />}

      <FlatList
        ListHeaderComponent={
          <>
            {isSailorsVisible && (
              <View style={{ paddingHorizontal: 16, marginTop: "3%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ width: "80%" }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ paddingTop: 12, fontSize: 18, lineHeight: 28, color: "rgba(42, 43, 42,.8)", fontFamily: "WhyteInktrap-Bold" }}>
                      Active Sailors of the Month
                    </Text>
                    <TouchableOpacity onPress={() => setSailorsPopup(true)} style={{ marginTop: Platform.OS === 'ios' ? 4 : 10 }}>
                      <AntDesign name="infocirlce" size={16} color="gray" />
                    </TouchableOpacity>
                  </View>
                  <Text style={{ color: "gray", fontSize: 10, fontFamily: "Poppins-Regular" }}>
                    Top seafarers who went the extra mile in energy, spirit, and connection at sea this month
                  </Text>
                </View>
                <Image
                  style={{ height: 50, width: 50, marginBottom: 10 }}
                  tintColor="rgba(69, 69, 69, 1)"
                  source={ImagesAssets.sailors}
                />
              </View>
            )}

            {isSailorsVisible && (
              <View style={{ marginTop: "4%" }}>
                <FlatList
                  data={topEmployee}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 12 }}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      style={{ marginRight: 12 }}
                      key={index}
                      onPress={() => handleCardPress(item)}
                    >
                      <BestEmployeeCard navigation={navigation} item={item} index={index} />
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
            <View style={{ marginTop: "5%", backgroundColor: "rgba(255, 255, 255, 0.6)", flex: 1, borderTopEndRadius: 25, borderTopLeftRadius: 25, overflow: "hidden", padding: 16 }}>
              <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={30} reducedTransparencyFallbackColor="white" />
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 22, fontFamily: "WhyteInktrap-Bold", color: "black", lineHeight: 27 }}>
                  Overall Crew Ranking
                </Text>
                <View style={{ display: "flex", flexDirection: "row", gap: 10, alignItems: "center" }}>
                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <AntDesign name="infocirlce" size={16} color="gray" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => refRBSheet.current.open()} style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: 8, padding: 6 }}>
                    <Image style={{ height: 16, width: 16 }} tintColor="rgba(69, 69, 69, 1)" source={ImagesAssets.filter_icon} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={{ color: "gray", fontSize: 10, fontFamily: "Poppins-Regular", width: "85%", marginTop: 10 }}>
                All-time rank based on BuddyUp event miles. Recognising crew who stay active, social and engaged.
              </Text>
            </View>
          </>
        }
        data={employee}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity key={index} onPress={() => handleCardPress(item)} style={{ paddingHorizontal: 12, backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
            <View style={{ marginTop: 5 }}>
              <LeaderboardCard item={item} index={index} userDetails={userDetails} navigation={navigation} isSelected={selectedCard === index} employee={employee} />
            </View>
          </TouchableOpacity>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={<View style={{ marginVertical: 15 }}>{isLoading ? <Loader /> : <></>}</View>}
        ListEmptyComponent={
          <View style={styles.noEmployeeContainer}>
            <Image source={ImagesAssets.NoDataFound} style={styles.nodatafoundImage}/>
            <Text style={styles.noEmployeeText}>No Employee Found</Text>
          </View>
        }
      />

      <RBSheet
        ref={refRBSheet}
        height={height * 0.5}
        openDuration={250}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{ container: styles.sheetContainer, draggableIcon: styles.draggableIcon }}
      >
        <View style={styles.sheetContent}>
          <View style={{ marginVertical: 10, width: "100%" }}>
            <DropdownFieldIOS
              placeholder="Select Role"
              options={designationDropDown}
              selectedValue={selectedDesignation}
              onValueChange={(itemValue) => setSelectedDesignation(itemValue)}
            />
          </View>
          <View style={{ width: "100%" }}>
            <DropdownFieldIOS
              placeholder="Select Ship"
              options={shipDropdown}
              selectedValue={selectedShip}
              onValueChange={(itemValue) => setSelectedShip(itemValue)}
            />
          </View>
          <View style={{ width: "100%", alignItems: "center", display: "flex", flexDirection: "row", justifyContent: "center", gap: 10 }}>
            <TouchableOpacity style={[styles.clearButton, { backgroundColor: Colors.secondary }]} onPress={applyFilter}>
              <Text style={styles.buttonText}>Apply Filter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilterdate}>
              <Text style={[styles.buttonText, { color: "black" }]}>Clear Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RBSheet>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.leaderboardPopover}>
              <View style={styles.popoverContent}>
                <Text style={styles.popupTitle}>How Miles Work</Text>
                <Text style={styles.popupText}>
                  Join or host BuddyUp events to earn miles, climb the leaderboard, and get recognised by your crew and company.
                </Text>
                <Text style={styles.popupText}>
                  Your participation adds up — unlock badges, earn visibility, and become a recognised name in your fleet.
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
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {sailorsPopup && (
        <PersonalityResultInfoPopup
          visible={sailorsPopup}
          setModalVisible={setSailorsPopup}
          screenName={'Sailors'}
          content={
            <>
              <Text style={styles.popupText}>
                Seafarers leading the quest to become ‘Sailor of the month’ by going extra mile in energy, spirit and connection at sea this month
              </Text>
            </>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D9D9D9",
  },
  sheetContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  draggableIcon: {
    backgroundColor: "#000",
  },
  sheetContent: {
    width: width - 40,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: Colors.secondary,
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  clearButton: {
    marginTop: 20,
    backgroundColor: "#D9D9D9",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontFamily: 'Poppins-Regular',
    fontWeight: "600",
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  leaderboardPopover: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: width * 0.9,
    maxHeight: height * 0.6,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  noEmployeeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.2, 
  },
  noEmployeeText: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: '#454545',
    textAlign: 'center',
    marginTop:20,
  },
  nodatafoundImage:{
    height:150,
    width:150
  }
});

export default Leaderboard;