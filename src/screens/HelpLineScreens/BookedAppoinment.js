import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import LottieView from "lottie-react-native";
import { ImagesAssets } from "../../assets/ImagesAssets";
import FocusAwareStatusBar from "../../statusbar/FocusAwareStatusBar";
import Colors from "../../colors/Colors";
import BookAppoinmentHeader from "../../component/headers/HelpLineScreensHeader/BookAppoinmentHeader";
import BookAppoinmentCard from "../../component/Cards/HelpLineScreensCards/BookAppoinmentCard";
import { FontFamily } from "../../GlobalStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCallWithToken, apiServerUrl } from "../../Api";
import BookedAppoinmentCard from "../../component/Cards/HelpLineScreensCards/BookedAppoinmentCard";
import BookedAppoinmentHeader from "../../component/headers/HelpLineScreensHeader/BookedAppoinmentHeader";
import CustomLottie from "../../component/CustomLottie";

const { width, height } = Dimensions.get("window");

const BookedAppoinment = ({ navigation }) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);


  const allDoctorsList = async () => {
    const dbResult = await AsyncStorage.getItem("userDetails");
    const userDetails = JSON.parse(dbResult);
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: 1,
        limit: 50,
      }).toString();
      const response = await apiCallWithToken(
        `${apiServerUrl}/helpline/allBookedAppointments?${queryParams}`,
        "GET",
        null,
        userDetails.authToken
      );
      if (response.responseCode === 200) {
        setData(response.result.appointmentsList);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allDoctorsList();
  }, []);

  return (
    <View style={styles.container}>
      <BookedAppoinmentHeader navigation={navigation} />
      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            {/* <Text style={styles.headerText}>Your Booked Appointment</Text> */}
            {/* <TouchableOpacity style={styles.filterButton}>
              <Image
                style={styles.filterIcon}
                source={ImagesAssets.filter_icon}
              />
            </TouchableOpacity> */}
          </View>

          {loading && <ActivityIndicator size="large" color={"#06361F"} />}

          {data?.length > 0 ? (
            <View style={styles.cardsContainer}>
              {data.map((item) => (
                <View key={item.id} style={styles.cardWrapper}>
                  <BookedAppoinmentCard navigation={navigation} data={item} />
                </View>
              ))}
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                width: width - 32,
                // height: height * 0.35,
                justifyContent: "center",
                alignItems: "center",
                // backgroundColor: "red",
              }}
            >
              <Image
                style={{ height: 130, width: 130 }}
                source={require("../../assets/images/AnotherImage/no-content.png")}
              />
              <Text
                style={{
                  fontSize: 20,
                  color: "#000",
                  fontFamily: "Poppins-SemiBold",
                }}
              >
                No book appoinment found!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Bottom Card with Lottie Animation */}
      <View style={styles.bottomCard}>
        <CustomLottie />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 14,
    fontFamily: FontFamily.bodyB14SemiBold,
  },
  filterButton: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 5,
    borderRadius: 8,
  },
  filterIcon: {
    height: 20,
    width: 20,
  },
  cardsContainer: {
    marginTop: "1%",
  },
  cardWrapper: {
    marginTop: 7,
  },
  bottomCard: {
    position: "absolute",
    width: "100%",
    height: "100%", // Cover entire screen height for background effect
    top: 60,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    zIndex: -1,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  lottieBackground: {
    width: width,
    height: height,
    position: "absolute",
    top: 0,
  },
});

export default BookedAppoinment;
