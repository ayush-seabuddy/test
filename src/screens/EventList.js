import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Image,
} from "react-native";
import LottieView from "lottie-react-native";
import { ImagesAssets } from "../assets/ImagesAssets";
import FocusAwareStatusBar from "../statusbar/FocusAwareStatusBar";
import Colors from "../colors/Colors";
import UpcomingEventCard from "../component/Cards/HealthCards/UpcomingEventCard";
import WeeklyCard from "../component/Cards/HealthCards/WeeklyCard";
import EventListHeader from "../component/headers/EventHeaders/EventListHeader";
import CustomLottie from "../component/CustomLottie";
const { width, height } = Dimensions.get("window");

const EventList = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <EventListHeader navigation={navigation} />

      <FocusAwareStatusBar
        barStyle={Platform.OS === "ios" ? "light-content" : "light-content"}
        backgroundColor={Colors.white}
        hidden={false}
      />

      <ScrollView>
        <View style={styles.contentContainer}>
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 10,
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
                Upcoming
              </Text>
              <TouchableOpacity></TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16 }}
            >
              {[...Array(4)].map((_, index) => (
                <View key={index} style={{ marginRight: 12 }}>
                  <UpcomingEventCard navigation={navigation} />
                </View>
              ))}
            </ScrollView>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 20,
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
              Weekly
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                padding: 5,
                borderRadius: 8,
              }}
            >
              <Image
                style={{ width: 20, height: 20 }}
                source={ImagesAssets.filter_icon}
              />
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 20 }}>
            {[...Array(4)].map((_, index) => (
              <View key={index}>
                <WeeklyCard navigation={navigation} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
  },
  bottomCard: {
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    alignItems: "center",
    position: "absolute",
    height: "50%",
    bottom: 0,
    overflow: "hidden",
    paddingHorizontal: 16,
    zIndex: -1,
  },
  lottieBackground: {
    position: "absolute",
    width: width,
    height: height * 0.5,
    bottom: 0,
  },
  submitButton: {
    width: "100%",
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#02130b",
    alignItems: "center",
    marginTop: "75%",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },
});

export default EventList;
