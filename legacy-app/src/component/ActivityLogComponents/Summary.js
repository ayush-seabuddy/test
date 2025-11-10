import React, { useCallback, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import ToggleSwitch from "toggle-switch-react-native";
import UpcomingEventCard from "../Cards/HealthCards/UpcomingEventCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../../Api";
import { useFocusEffect } from "@react-navigation/native";
import GroupActivity from "../ProfileListComponents/GroupActivity";
const Summary = ({ navigation }) => {
  const [isOn, setIsOn] = useState(false);
  const [groupActivities, setGroupActivities] = React.useState([]);
  const [loading, setLoading] = React.useState(false);


  const GetDatafromApi = async () => {
    try {
      setLoading(true);
      let data = await AsyncStorage.getItem("userDetails");
      data = JSON.parse(data);


      const queryParams = new URLSearchParams({
        page: 1,
        limit: 100,
      }).toString();

     
      const response = await apiCallWithToken(
        `${apiServerUrl}/activity/getAllGroupActivity?${queryParams}`,
        "GET",
        null,
        data.authToken
      );
      setGroupActivities(response?.result?.groupActivityList);
      setLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      GetDatafromApi();
      // Optionally clean up or cancel ongoing requests when the screen is unfocused
      return () => {
      };
    }, []) // Dependencies array
  );

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <GroupActivity navigation={navigation} activity={item} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.text}>Weekly</Text>
        <View
          style={{
            backgroundColor: "rgba(103, 110, 118, 0.16)",
            borderRadius: 100,
            padding: 4,
          }}
        >
          <ToggleSwitch
            isOn={isOn}
            onColor="#B0DB02"
            offColor="rgba(246, 247, 249, 1)"
            size="small"
            onToggle={setIsOn}
          />
        </View>
        <Text style={{ fontSize: 14, fontFamily: "Poppins-Regular" }}>
          Monthly
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: "5%",
          flexWrap: "wrap",
          gap: 8,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(230, 235, 233, 1)",
            paddingHorizontal: 32,
            paddingVertical: 8,
            borderRadius: 16,
            width: "48%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontFamily: "Poppins-SemiBold",
              color: "rgba(69, 69, 69, 1)",
              lineHeight: 39.2,
            }}
          >
            16
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontFamily: "Poppins-Regular",
              color: "rgba(183, 183, 183, 1)",
              lineHeight: 14,
            }}
          >
            Completed Act
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "rgba(230, 235, 233, 1)",
            paddingHorizontal: 32,
            paddingVertical: 8,
            borderRadius: 16,
            width: "48%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontFamily: "Poppins-SemiBold",
              color: "rgba(69, 69, 69, 1)",
              lineHeight: 39.2,
            }}
          >
            24
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontFamily: "Poppins-Regular",
              color: "rgba(183, 183, 183, 1)",
              lineHeight: 14,
            }}
          >
            Resource Used
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "rgba(230, 235, 233, 1)",
            paddingHorizontal: 32,
            paddingVertical: 8,
            borderRadius: 16,
            width: "49%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontFamily: "Poppins-SemiBold",
              color: "rgba(69, 69, 69, 1)",
              lineHeight: 39.2,
            }}
          >
            8
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontFamily: "Poppins-Regular",
              color: "rgba(183, 183, 183, 1)",
              lineHeight: 14,
            }}
          >
            Events Attended
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "rgba(230, 235, 233, 1)",
            paddingHorizontal: 32,
            paddingVertical: 8,
            borderRadius: 16,
            width: "48%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontFamily: "Poppins-SemiBold",
              color: "rgba(69, 69, 69, 1)",
              lineHeight: 39.2,
            }}
          >
            6
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontFamily: "Poppins-Regular",
              color: "rgba(183, 183, 183, 1)",
              lineHeight: 14,
            }}
          >
            Achievements
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "rgba(230, 235, 233, 1)",
            paddingHorizontal: 32,
            paddingVertical: 8,
            borderRadius: 16,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontFamily: "Poppins-SemiBold",
              color: "rgba(69, 69, 69, 1)",
              lineHeight: 39.2,
            }}
          >
            3250
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontFamily: "Poppins-Regular",
              color: "rgba(183, 183, 183, 1)",
              lineHeight: 14,
            }}
          >
            Point Reward
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 40,
          marginVertical: 20,
          paddingHorizontal: 14,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "500",
            color: "black",
            fontFamily: "WhyteInktrap-Medium",
          }}
        >
          New Activities
        </Text>
        <TouchableOpacity>
          <Text style={{ fontSize: 12, fontFamily: "Poppins-Regular" }}>
            View all
          </Text>
        </TouchableOpacity>
      </View>
      {/* <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16 }}
      >
        {groupActivities.map((_, index) => (
          <View key={index} style={{ marginRight: 12 }}>
            <UpcomingEventCard navigation={navigation} />
          </View>
        ))}
      </ScrollView> */}
      <View style={{ paddingHorizontal: 14 }}>
        {loading ? (
          <ActivityIndicator
            size={"small"}
            color={"#06361F"}
            style={{ height: 100 }}
          />
        ) : (
          <FlatList
            data={groupActivities}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2} // Display two columns
            contentContainerStyle={styles.flatListContentContainer}
            columnWrapperStyle={styles.columnWrapper} // Add space between columns
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 12,
  },
  flatListContentContainer: {
    // paddingHorizontal: 10, // Add horizontal padding to the list
  },
  columnWrapper: {
    justifyContent: "space-between", // Add space between columns
    // marginBottom: 10, // Optionally add vertical space between rows
  },
  text: {
    fontSize: 14,
    color: "rgba(69, 69, 69, 1)",
    fontFamily: "Poppins-SemiBold",
  },
});

export default Summary;
