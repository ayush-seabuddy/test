import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import Colors from "../colors/Colors";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";

import CrewListHeader from "../component/headers/CrewListHeader";
import All from "../component/CrewListComponents/All";
import Deck from "../component/CrewListComponents/Deck";
import Engine from "../component/CrewListComponents/Engine";
import Catering from "../component/CrewListComponents/Catering";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../Api";
import axios, { all } from "axios";
import Loader from "../component/Loader";
import { remove } from "react-native-track-player/lib/src/trackPlayer";
const CrewList = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = React.useState(false);

  const [userLists, setUserLists] = React.useState({
    Deck: [],
    Engine: [],
    Catering: [],
  });

  const [allUser, setAllUser] = React.useState([]);

  const fetchUserList = async (department) => {
    try {
      setLoading(true);
      const dbResult = await AsyncStorage.getItem("userDetails");
      const userDetails = JSON.parse(dbResult);
      const ship_Id = userDetails.shipId;

      // const result = await apiCallWithToken(
      //   `${apiServerUrl}/user/listAllUsers?shipId=${ship_Id}&department=${department}`,
      //   "GET",
      //   null, // No body needed for GET
      //   userDetails.authToken
      // );

      const response = await axios({
        method: "GET",
        url: `${apiServerUrl}/user/listAllUsers?shipId=${ship_Id}&department=${department}`,
        headers: {
          authToken: userDetails.authToken,
        },
      });

      let userList = response.data.result.usersList;
      if (userList.length > 0) {
        userList = userList.filter((item) => item.id != userDetails.id);
      }


      if (response.data.responseCode === 200) {
        setUserLists((prevLists) => ({
          ...prevLists,
          [department]: userList || [],
        }));
      }
    } catch (error) {
      console.log(
        `API Error for ${department}:`,
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };



  useFocusEffect(
    useCallback(() => {
      ["Deck", "Engine", "Catering"].forEach(fetchUserList);
      return () => console.log("Screen unfocused");
    }, [])
  );
  useEffect(() => {
    setAllUser([
      ...userLists.Deck,
      ...userLists.Engine,
      ...userLists.Catering,
    ]);
  }, [userLists]);





  const renderTabContent = () => {
    switch (activeTab) {
      case "All":
        return (
          <All
            navigation={navigation}
            userLists={userLists}
            fetchUserList={fetchUserList}
            allUser={allUser}
          />
        );
      case "Deck":
        return (
          <Deck
            navigation={navigation}
            userLists={userLists}
            fetchUserList={fetchUserList}
            allUser={allUser}
          />
        );
      case "Engine":
        return (
          <Engine
            navigation={navigation}
            userLists={userLists}
            fetchUserList={fetchUserList}
            allUser={allUser}
          />
        );
      case "Catering":
        return (
          <Catering
            navigation={navigation}
            userLists={userLists}
            fetchUserList={fetchUserList}
            allUser={allUser}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <CrewListHeader
        navigation={navigation}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />
      {loading && <Loader />}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  contentText: {
    fontSize: 18,
    color: "#000",
    textAlign: "center",
  },
});

export default CrewList;
