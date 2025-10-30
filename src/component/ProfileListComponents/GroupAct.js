import React, { useCallback, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../../Api";
import { useFocusEffect } from "@react-navigation/native";
import GroupActivity from "./GroupActivity";
import Loader from "../Loader";
import ActivityLog from "../../screens/ActivityLog";

const { height, width } = Dimensions.get("screen");

// CardComponent for individual event cards
// const CardComponent = ({ navigation }) => {

//   return (
//     // <View style={styles.cardContainer}>
//     <View style={styles.cardsContainer}>
//       <FlatList
//         data={groupActivities}
//         renderItem={renderItem}
//         keyExtractor={(item, index) => index.toString()}
//         numColumns={2} // Display two columns
//         contentContainerStyle={styles.flatListContentContainer}
//         columnWrapperStyle={styles.columnWrapper} // Add space between columns
//       />

//       {/* {groupActivities.map((_, index) => (
//               <View style={styles.cardWrapper} key={index}>
//                 <GroupActivity navigation={navigation} />
//               </View>
//             ))} */}
//       {/* </View> */}

//       {/* <View style={styles.cardContent}>
//         <Text style={styles.title}>{title}</Text>
//       </View>
//       <View style={styles.textContainer}>
//         <Text style={styles.subtitle}>{subtitle}</Text>
//         <Text style={styles.time}>{time}</Text>
//       </View>
//       <TouchableOpacity style={styles.signInButton} onPress={onSignInPress}>
//         <Text style={styles.signInButtonText}>Sign In</Text>
//       </TouchableOpacity>
//       <TouchableOpacity style={styles.moreIconContainer}>
//         <MaterialIcons name="more-vert" size={24} color="gray" />
//         <Image source={ImagesAssets.dots} style={styles.headerIconRight} />
//       </TouchableOpacity> */}
//     </View>
//   );
// };

// Events screen containing the list of event cards
const GroupAct = ({ navigation }) => {
  const [groupActivities, setGroupActivities] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [menuVisible, setMenuVisible] = useState(null);
  const GetDatafromApi = async () => {
    try {
      setLoading(true);
      let data = await AsyncStorage.getItem("userDetails");
      data = JSON.parse(data);


      const queryParams = new URLSearchParams({
        userId: data.id,
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
      <GroupActivity navigation={navigation} activity={item} screenName={"groupAct"}
        menuVisible={menuVisible === item.id} // Assuming activity has an 'id' field
        setMenuVisible={setMenuVisible}

      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <ActivityLog navigation={navigation} /> */}
      <View style={styles.cardsContainer}>
        {loading && <Loader />}
        {groupActivities.length > 0 ? (
          <FlatList
            data={groupActivities}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2} // Display two columns
            contentContainerStyle={styles.flatListContentContainer}
            columnWrapperStyle={styles.columnWrapper} // Add space between columns
            ListEmptyComponent={
              !loading && (
                <View
                  style={{
                    flex: 1,
                    width: width,
                    height: height * 0.4,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: "gray",
                      fontFamily: "Poppins-Regular",
                    }}
                  >
                    No post Found
                  </Text>
                </View>
              )
            }
          />
        ) : (
          <View
            style={{
              flex: 1,
              width: width - 28,
              height: height * 0.4,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              style={{ height: 150, width: 150 }}
              source={require("../../assets/images/AnotherImage/no-content.png")}
            />
            <Text
              style={{
                fontSize: 20,
                color: "gray",
                fontFamily: "Poppins-Regular",
              }}
            >
              No BuddyUp Event Found
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingBottom: "20%",
  },
  cardWrapper: {
    width: "48%",
  },
  cardsContainer: {
    marginBottom: 10,
  },
  flatListContentContainer: {
    // paddingHorizontal: 10, // Add horizontal padding to the list
  },
  columnWrapper: {
    justifyContent: "space-between", // Add space between columns
  },
  cardContainer: {
    backgroundColor: "rgba(180, 180, 180, 0.4)",
    borderRadius: 16,
    marginBottom: 15,
    //height:height *0.15,
    padding: 20,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  time: {
    fontSize: 14,
    color: "#333",
  },
  signInButton: {
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#000",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  moreIconContainer: {
    backgroundColor: "#c4c2c2",
    padding: 5,
    borderRadius: 5,
    position: "absolute",
    top: 15,
    right: 15,
  },
  headerIconRight: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
});

export default GroupAct;
